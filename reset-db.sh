#!/usr/bin/env bash

set -euo pipefail

# Required variables
## CLI arguments (optionally specify in env)
TOKEN=${TOKEN:-}
DMSS_API=${DMSS_API:-}
## Environment variables
SECRET_KEY=${SECRET_KEY:-}
MONGO_AZURE_URI=${MONGO_AZURE_URI:-}

# Optional variables
## CLI arguments
CREATE_DMSS_KEY="False"
GIT_RESTORE="True"
COMPOSE_DOWN="True"
DRY_RUN="False"

# Placeholders
MONGO_AZURE_HOST=None
MONGO_AZURE_PORT=None
MONGO_AZURE_USER=None
MONGO_AZURE_PW=None
PACKAGES=()
DATA_SOURCES=()

function print_help() {
    echo "usage: $0 [-h] [-t=] [-u=] [-c] [-n] [-k] [-d]

    Arguments:
      -h, --help            Print this message
      -t, --token           A valid access token for DMT/FoR
      -u, --dmss-api        The URL of the DMSS API to run against
      -c, --create-key      Generate a new SECRET_KEY to encrypt the data with
      -n, --no-restore      Do not run 'git restore' on the modified files upon completion
      -k, --keep-containers Do not run 'docker-compose down' upon completion
      -d, --dry-run         Do not make any changes to the remote DB, but simulate changes to files on disk.
                            Useful to run with '--no-restore' to inspect changes before pushing.

    Example:
      Run with CLI arguments
        $0 --token=\"eyJ0eX\" --dmss-api=\"https://dmss-[...].com\" --create-key --no-restore --dry-run
      Run with variables from the environment (see reset-db.env-template)
        $0
    "
}

function setup_colors() {
  if [[ -t 2 ]] && [[ -z "${NO_COLOR-}" ]] && [[ "${TERM-}" != "dumb" ]]; then
    NOFORMAT='\033[0m' RED='\033[0;31m' GREEN='\033[0;32m' ORANGE='\033[0;33m' BLUE='\033[0;34m' PURPLE='\033[0;35m' CYAN='\033[0;36m' YELLOW='\033[1;33m'
  else
    NOFORMAT='' RED='' GREEN='' ORANGE='' BLUE='' PURPLE='' CYAN='' YELLOW=''
  fi
}

msg() {
  echo >&2 -e "${1-}"
}

info() {
  msg "${CYAN}$1${NOFORMAT}"
}

fatal() {
  msg "${RED}$1${NOFORMAT}"
  exit 1
}

warn() {
  msg "${ORANGE}$1${NOFORMAT}"
}

err() {
  msg "${RED}    ERROR${NOFORMAT}"
}

ok() {
  msg "${GREEN}    OK${NOFORMAT}"
}

for i in "$@"; do
  case $i in
    -h | --help)
      print_help
      exit 0
      ;;
    -t | --token=*)
      TOKEN="${i#*=}"
      shift # past argument=value
      ;;
    -u | --dmss-api=*)
      DMSS_API="${i#*=}"
      shift # past argument=value
      ;;
    -c | --create-key)
      CREATE_DMSS_KEY="True"
      shift # past argument=value
      ;;
    -n | --no-restore)
      GIT_RESTORE="False"
      shift # past argument=value
      ;;
    -k | --keep-containers)
      COMPOSE_DOWN="False"
      shift
      ;;
    -d | --dry-run)
      DRY_RUN="True"
      shift
      ;;
    *)
      warn "WARNING: Invalid argument '$i'"
      ;;
  esac
done

if [ -z "$TOKEN" ]; then
  fatal "Missing required variable 'TOKEN'. You must either provide the environment variable 'TOKEN',
  or run the script with '--token=\"eyJ0eX...\"'. Exiting."
fi
if [ -z "$DMSS_API" ]; then
  fatal "Missing required variable 'DMSS_API'. You must either provide the environment variable 'DMSS_API',
  or run the script with '--dmss-api=\"https://dmss-...\"'. Exiting."
fi
if [ -z "$SECRET_KEY" ]; then
  if [ "$CREATE_DMSS_KEY" == "False" ]; then
    warn "Missing required environment variable 'SECRET_KEY'."
    fatal "You must either provide the environment variable 'SECRET_KEY', or run the script with '--create-key'. Exiting."
  fi
fi
if [ -z "$MONGO_AZURE_URI" ]; then
  fatal "Missing required variable 'MONGO_AZURE_URI'. Exiting."
fi

# File paths
DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd -P)
DS_DIR=$DIR/api/home
CONTAINER_DS_DIR=/code/home
DMSS_SYSTEM=$DIR/dmss-system.radix.json
COMPOSE_FILE=$DIR/docker-compose.yml

function discover_packages() {
  info "Discovering packages.."
  #api/home/<AppName>/data/<DataSource>/<Package>
  IFS=$'\n'
  PACKAGES=($(find "$DS_DIR" -maxdepth 4 -type d -iwholename "*api/home/*/data/*/*"))
  unset IFS
}

function discover_data_sources() {
  info "Discovering data sources.."
  #api/home/<AppName>/data_sources/<DataSource>.json
  IFS=$'\n'
  DATA_SOURCES=($(find "$DS_DIR" -maxdepth 3 -type f -iwholename "*api/home/*/data_sources/*.json"))
  unset IFS
}

function parse_mongo_conn_str() {
  info "Parsing Mongo connection string.."
  if [[ "$MONGO_AZURE_URI" =~ ^mongodb:\/\/[^\/\,]+:{1}[^\/\,]*@{1}.*$ ]]; then
    stripped_conn_str=$(echo "$MONGO_AZURE_URI" | awk -F'://' '{ print $2 }' | awk -F'/' '{ print $1 }')
    MONGO_AZURE_USER=$(echo "$stripped_conn_str" | awk -F':' '{ print $1 }')
    MONGO_AZURE_PW=$(echo "$stripped_conn_str" | awk -F':' '{ print $2 }' | awk -F'@' '{ print $1 }')
    MONGO_AZURE_HOST=$(echo "$stripped_conn_str" | awk -F':' '{ print $2 }' | awk -F'@' '{ print $2 }')
    MONGO_AZURE_PORT=$(echo "$stripped_conn_str" | awk -F':' '{ print $3 }')
    if [ -z "$MONGO_AZURE_USER" ]; then
      fatal "Failed to extract the username from the Mongo connection string ('MONGO_AZURE_URI'). Exiting."
    fi
    if [ -z "$MONGO_AZURE_PW" ]; then
      fatal "Failed to extract the password from the Mongo connection string ('MONGO_AZURE_URI'). Exiting."
    fi
    if [ -z "$MONGO_AZURE_HOST" ]; then
      fatal "Failed to extract the hostname from the Mongo connection string ('MONGO_AZURE_URI'). Exiting."
    fi
    if [ -z "$MONGO_AZURE_PORT" ]; then
      fatal "Failed to extract the port from the Mongo connection string ('MONGO_AZURE_URI'). Exiting."
    fi
  else
    fatal "Environment variable 'MONGO_AZURE_URI' is not a valid mongo connection string. Exiting."
  fi
}

function set_env_vars() {
    if [ "$CREATE_DMSS_KEY" == "True" ]; then
      sk_outfile_name="generated-secret-key.env"
      sk_outfile_perms="0600"
      echo "Generating new DMSS SECRET_KEY.."
      create_key_output=$(docker-compose run --rm dmss create-key)
      SECRET_KEY=$(echo "$create_key_output" | tail -n 1)
      echo "SECRET_KEY=$SECRET_KEY" > "$sk_outfile_name"
      chmod "$sk_outfile_perms" "$sk_outfile_name"
      echo "Wrote secret key to '$sk_outfile_name' with permissions '$sk_outfile_perms'"
      echo " /==========================================\ "
      echo "/               NEW SECRET KEY               \\"
      msg "${ORANGE} $SECRET_KEY ${NOFORMAT}"
      echo "\       Make sure to add it to Radix!        /"
      echo " \==========================================/"
      msg "${ORANGE}BEFORE CONTINUING, please do the following:\n1. Update the 'SECRET_KEY' secret of the DMSS app in the Radix environment you wish to reset.\n2. Restart the DMSS service in Radix.\n${NOFORMAT}"
      read -p "Once DMSS has restarted, press [Return] to continue" </dev/tty
    fi
}

function print_vars() {
  echo "=== Variables ===
  Database: $MONGO_AZURE_USER:*****@$MONGO_AZURE_HOST:$MONGO_AZURE_PORT
  DMSS API: $DMSS_API
  Key:      ${SECRET_KEY:0:3}***
  "
}

function set_database_host() {
    SED_PATTERN="s/\"host\":.*\",/\"host\": \"$MONGO_AZURE_HOST\",/"
    GREP_PATTERN="^\s{1,}\"host\": \"$MONGO_AZURE_HOST\","

    info "Setting database hosts.."
    if [ -n "$MONGO_AZURE_HOST" ]; then
      for data_source in "${DATA_SOURCES[@]}"; do
        echo "  Updating $data_source"
        if test -f "$data_source"; then
          sed -i "$SED_PATTERN" "$data_source"
          grep -Eq "$GREP_PATTERN" "$data_source" && ok || err
        else
          warn "    The file does not exist"
        fi
      done
      if test -f "$DMSS_SYSTEM"; then
          echo "  Updating dmss-system.radix.json"
          sed -i "$SED_PATTERN" "$DMSS_SYSTEM"
          grep -Eq "$GREP_PATTERN" "$DMSS_SYSTEM" && ok || err
      else
        warn "   The file does not exist"
      fi
    else
      fatal "Missing required variable 'MONGO_AZURE_HOST'. Exiting."
    fi
}

function set_database_port() {
    SED_PATTERN="s/\"port\": ([[:digit:]]{1,5}),/\"port\": $MONGO_AZURE_PORT,/"
    GREP_PATTERN="^\s{1,}\"port\": $MONGO_AZURE_PORT,"

    info "Setting database ports.."
    if [ -n "$MONGO_AZURE_PORT" ]; then
      for data_source in "${DATA_SOURCES[@]}"; do
        echo "  Updating $data_source"
        if test -f "$data_source"; then
          sed -E -i "$SED_PATTERN" "$data_source"
          grep -Eq "$GREP_PATTERN" "$data_source" && ok || err
        else
          warn "    The file does not exist"
        fi
      done
      if test -f "$DMSS_SYSTEM"; then
          echo "  Updating dmss-system.radix.json"
          sed -i "$SED_PATTERN" "$DMSS_SYSTEM"
          grep -Eq "$GREP_PATTERN" "$DMSS_SYSTEM" && ok || err
      else
        warn "    The file does not exist"
      fi
    else
      fatal "Missing required variable 'MONGO_AZURE_PORT'. Exiting."
    fi
}

function set_database_tls() {
    SED_PATTERN="s/\"tls\": (true|false),/\"tls\": true,/"
    GREP_PATTERN="^\s{1,}\"tls\": true,"

    info "Setting database TLS mode.."
    for data_source in "${DATA_SOURCES[@]}"; do
        echo "  Updating $data_source"
        if test -f "$data_source"; then
          sed -E -i "$SED_PATTERN" "$data_source"
          grep -Eq "$GREP_PATTERN" "$data_source" && ok || err
        else
          warn "    The file does not exist"
        fi
      done
      if test -f "$DMSS_SYSTEM"; then
          echo "  Updating dmss-system.radix.json"
          sed -i "$SED_PATTERN" "$DMSS_SYSTEM"
          grep -Eq "$GREP_PATTERN" "$DMSS_SYSTEM" && ok || err
      else
        warn "    The file does not exist"
      fi
}

function set_database_username() {
    SED_PATTERN="s/\"username\":.*\",/\"username\": \"$MONGO_AZURE_USER\",/"
    GREP_PATTERN="^\s{1,}\"username\": \"$MONGO_AZURE_USER\","

    info "Setting database usernames.."
    if [ -n "$MONGO_AZURE_USER" ]; then
      for data_source in "${DATA_SOURCES[@]}"; do
        echo "  Updating $data_source"
        if test -f "$data_source"; then
          sed -i "$SED_PATTERN" "$data_source"
          grep -Eq "$GREP_PATTERN" "$data_source" && ok || err
        else
          warn "    The file does not exist"
        fi
      done
      if test -f "$DMSS_SYSTEM"; then
          echo "  Updating dmss-system.radix.json"
          sed -i "$SED_PATTERN" "$DMSS_SYSTEM"
          grep -Eq "$GREP_PATTERN" "$DMSS_SYSTEM" && ok || err
      else
        warn "    The file does not exist"
      fi
    else
      fatal "- Missing required variable 'MONGO_AZURE_USER'. Exiting."
    fi
}

function set_database_password() {
    SED_PATTERN="s/\"password\":.*\",/\"password\": \"$MONGO_AZURE_PW\",/"
    GREP_PATTERN="^\s{1,}\"password\": \"$MONGO_AZURE_PW\","

    info "Setting database passwords.."
    if [ -n "$MONGO_AZURE_PW" ]; then
      for data_source in "${DATA_SOURCES[@]}"; do
        echo "  Updating $data_source"
        if test -f "$data_source"; then
          sed -i "$SED_PATTERN" "$data_source"
          grep -Eq "$GREP_PATTERN" "$data_source" && ok || err
        else
          warn "    The file does not exist"
        fi
      done
      if test -f "$DMSS_SYSTEM"; then
          echo "  Updating dmss-system.radix.json"
          sed -i "$SED_PATTERN" "$DMSS_SYSTEM"
          grep -Eq "$GREP_PATTERN" "$DMSS_SYSTEM" && ok || err
      else
        warn "    The file does not exist"
      fi
    else
      fatal "- Missing required variable 'MONGO_AZURE_PW'. Exiting."
    fi
}

function set_data_source_names() {
  info "Removing 'Test'-prefix from data source names.."
  for data_source in "${DATA_SOURCES[@]}"; do
    echo "  Updating $data_source"
    if test -f "$data_source"; then
      if grep -Eq '"name": "Test.*",' "$data_source"; then
        sed -i -E "s/\"name\": \"Test/\"name\": \"/" "$data_source"
      fi
      grep -Eq '"name": "Test.*",' "$data_source" && err || ok
    fi
  done
}

function update_compose_spec() {
  TARGET_ENV="ENVIRONMENT: production"
  TARGET_LOG="LOGGING_LEVEL: debug"
  info "Updating compose spec.."
  if test -f "$COMPOSE_FILE"; then
    echo "  Updating volume mount"
    sed -i "s/dmss-system.local.json:/dmss-system.radix.json:/" "$COMPOSE_FILE"
    grep -Eq "^\s{6}- ./dmss-system.radix.json:" "$COMPOSE_FILE" && ok || err

    echo "  Updating ENVIRONMENT.."
    sed -i "s/ENVIRONMENT: \${DMSS_ENVIRONMENT:-local}/${TARGET_ENV}/" "$COMPOSE_FILE"
    dmss_service_spec=$(grep -EA 20 "^\s{2}dmss:" "$COMPOSE_FILE")
    echo "$dmss_service_spec" | grep -Eq "^\s{6}${TARGET_ENV}" && ok || err

    echo "  Updating LOGGING_LEVEL.."
    sed -i "s/LOGGING_LEVEL: \".*\"$/${TARGET_LOG}/g" "$COMPOSE_FILE"
    dmss_service_spec=$(grep -EA 20 "^\s{2}dmss:" "$COMPOSE_FILE")
    echo "$dmss_service_spec" | grep -Eq "^\s{6}${TARGET_LOG}" && ok || err
  fi
}

function build_images() {
  info "Building the Docker images.."
  docker-compose build --quiet api  && ok || err
}

function dmss_reset_app() {
  info "Resetting DMSS.."
  if [ "$DRY_RUN" == "False" ]; then
    docker-compose run --rm -e SECRET_KEY="$SECRET_KEY" -e MONGO_AZURE_URI="$MONGO_AZURE_URI" dmss reset-app && ok || err
  else
    echo "    Skipping (dry run)"
  fi
}

function import_data_sources() {
  info "Importing data sources.."
  for data_source in "${DATA_SOURCES[@]}"; do
    ds_dir=$(echo "$DS_DIR" | sed 's/\//\\\//g')
    container_path="${data_source/$ds_dir/$CONTAINER_DS_DIR}"
    echo "  Importing data source '$container_path'"
    if [ "$DRY_RUN" == "False" ]; then
      docker-compose run --rm -e DMSS_API="$DMSS_API" api --token="$TOKEN" import-data-source "$container_path" && ok || err
    else
      echo "    Skipping (dry run)"
    fi
  done
}

function import_packages() {
  completed=()
  info "Importing packages.."
  for package in "${PACKAGES[@]}"; do
    ds_dir=$(echo "$DS_DIR" | sed 's/\//\\\//g')
    container_path="${package/$ds_dir/$CONTAINER_DS_DIR}"
    destination=$(echo "$package" | grep -Po '.*/api/home/[a-zA-Z0-9]{1,}/data/*\K[^/].*')
    # shellcheck disable=SC2076
    if [[ ! " ${completed[*]} " =~ " ${destination} " ]]; then
      echo "  Resetting package '$destination'"
      if [ "$DRY_RUN" == "False" ]; then
        docker-compose run --rm -e MONGO_AZURE_URI="$MONGO_AZURE_URI" -e DMSS_API="$DMSS_API" api --token="$TOKEN" reset-package "$container_path" "$destination" && ok || err
      else
        echo "    Skipping (dry run)"
      fi
      completed+=("$destination")
    fi
  done

}

function cleanup() {
  trap - SIGINT SIGTERM ERR EXIT
  info "Cleaning up.."
  if [ "$GIT_RESTORE" == "True" ]; then
    echo "  Running 'git restore' on modified JSON and docker(-compose) files.."
    git restore api/home/* docker-compose.yml dmss-system.radix.json && ok || err
  else
    echo "  Skipping 'git restore' due to '--no-restore' flag"
    warn "  WARNING: Passwords may be stored in clear text in the modified files. Please avoid committing them to git."
    warn "    Issue a manual 'git restore' with the following command:"
    info "     git restore $DMT_DS $FoR_DS $SIMA_DS $SIMPOS_APP_DB_DS $SIMPOS_MDL_DB_DS $DMSS_SYSTEM $COMPOSE_FILE"
  fi
  if [ "$COMPOSE_DOWN" == "True" ]; then
    echo "  Running 'docker-compose down'.."
    docker-compose down && ok || err
  fi
}

trap cleanup SIGINT SIGTERM ERR EXIT

function main() {
  discover_packages
  discover_data_sources
  parse_mongo_conn_str
  set_env_vars
  print_vars
  set_database_host
  set_database_port
  set_database_tls
  set_database_username
  set_database_password
  set_data_source_names
  update_compose_spec
  build_images
  dmss_reset_app
  import_data_sources
  import_packages
}

setup_colors
main
