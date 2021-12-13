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
      echo "WARNING: Invalid argument '$i'"
      ;;
  esac
done

if [ -z "$TOKEN" ]; then
  echo "Missing required variable 'TOKEN'. You must either provide the environment variable 'TOKEN',
  or run the script with '--token=\"eyJ0eX...\"'. Exiting."
  exit 1
fi
if [ -z "$DMSS_API" ]; then
  echo "Missing required variable 'DMSS_API'. You must either provide the environment variable 'DMSS_API',
  or run the script with '--dmss-api=\"https://dmss-...\"'. Exiting."
  exit 1
fi
if [ -z "$SECRET_KEY" ]; then
  if [ "$CREATE_DMSS_KEY" == "False" ]; then
    echo "Missing required environment variable 'SECRET_KEY'."
    echo "You must either provide the environment variable 'SECRET_KEY', or run the script with '--create-key'. Exiting."
    exit 1
  fi
fi
if [ -z "$MONGO_AZURE_URI" ]; then
  echo "Missing required variable 'MONGO_AZURE_URI'. Exiting."
  exit 1
fi

# File paths
DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd -P)
DS_DIR=$DIR/api/home
SIMPOS_DS_DIR=$DS_DIR/SIMPOS/data_sources
## Data sources
DMT_DS=$DS_DIR/DMT/data_sources/DMT-DS-azure.json
FoR_DS=$DS_DIR/for/data_sources/ForecastDS-azure.json
SIMA_DS=$SIMPOS_DS_DIR/sima.json
SIMPOS_APP_DB_DS=$SIMPOS_DS_DIR/simpos_app_db.json
SIMPOS_MDL_DB_DS=$SIMPOS_DS_DIR/simpos_models_db.json

DMSS_SYSTEM=$DIR/dmss-system.radix.json
COMPOSE_FILE=$DIR/docker-compose.yml

DATA_SOURCES=("$DMT_DS" "$FoR_DS" "$SIMA_DS" "$SIMPOS_APP_DB_DS" "$SIMPOS_MDL_DB_DS")

function discover_packages() {
  #api/home/<AppName>/data/<DataSource>/<Package>
  IFS=$'\n'
  PACKAGES=($(find "$DS_DIR" -maxdepth 4 -type d -iwholename "*api/home/*/data/*/*"))
  unset IFS
}

function parse_mongo_conn_str() {
  if [[ "$MONGO_AZURE_URI" =~ ^mongodb:\/\/[^\/\,]+:{1}[^\/\,]*@{1}.*$ ]]; then
    stripped_conn_str=$(echo "$MONGO_AZURE_URI" | awk -F'://' '{ print $2 }' | awk -F'/' '{ print $1 }')
    MONGO_AZURE_USER=$(echo "$stripped_conn_str" | awk -F':' '{ print $1 }')
    MONGO_AZURE_PW=$(echo "$stripped_conn_str" | awk -F':' '{ print $2 }' | awk -F'@' '{ print $1 }')
    MONGO_AZURE_HOST=$(echo "$stripped_conn_str" | awk -F':' '{ print $2 }' | awk -F'@' '{ print $2 }')
    MONGO_AZURE_PORT=$(echo "$stripped_conn_str" | awk -F':' '{ print $3 }')
    if [ -z "$MONGO_AZURE_USER" ]; then
      echo "Failed to extract the username from the Mongo connection string ('MONGO_AZURE_URI'). Exiting."
      exit 1
    fi
    if [ -z "$MONGO_AZURE_PW" ]; then
      echo "Failed to extract the password from the Mongo connection string ('MONGO_AZURE_URI'). Exiting."
      exit 1
    fi
    if [ -z "$MONGO_AZURE_HOST" ]; then
      echo "Failed to extract the hostname from the Mongo connection string ('MONGO_AZURE_URI'). Exiting."
      exit 1
    fi
    if [ -z "$MONGO_AZURE_PORT" ]; then
      echo "Failed to extract the port from the Mongo connection string ('MONGO_AZURE_URI'). Exiting."
      exit 1
    fi
  else
    echo "Environment variable 'MONGO_AZURE_URI' is not a valid mongo connection string. Exiting."
    exit 1
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

    echo "Setting database hosts.."
    if [ -n "$MONGO_AZURE_HOST" ]; then
      if test -f "$DMT_DS"; then
          echo "  Updating DMT-DS-azure.json"
          sed -i "$SED_PATTERN" "$DMT_DS"
          grep -Eq "$GREP_PATTERN" "$DMT_DS" && echo "    OK" || echo "    ERROR"
      fi
      if test -f "$FoR_DS"; then
          echo "  Updating ForecastDS-azure.json"
          sed -i "$SED_PATTERN" "$FoR_DS"
          grep -Eq "$GREP_PATTERN" "$FoR_DS" && echo "    OK" || echo "    ERROR"
      fi
      if test -f "$DMSS_SYSTEM"; then
          echo "  Updating dmss-system.radix.json"
          sed -i "$SED_PATTERN" "$DMSS_SYSTEM"
          grep -Eq "$GREP_PATTERN" "$DMSS_SYSTEM" && echo "    OK" || echo "    ERROR"
      fi
    else
      echo "Missing required variable 'MONGO_AZURE_HOST'. Exiting."
      exit 1
    fi
}

function set_database_port() {
    SED_PATTERN="s/\"port\": \d{2,5},/\"port\": $MONGO_AZURE_PORT,/"
    GREP_PATTERN="^\s{1,}\"port\": $MONGO_AZURE_PORT,"

    echo "Setting database ports.."
    if [ -n "$MONGO_AZURE_PORT" ]; then
      if test -f "$DMT_DS"; then
          echo "  Updating DMT-DS-azure.json"
          sed -i "$SED_PATTERN" "$DMT_DS"
          grep -Eq "$GREP_PATTERN" "$DMT_DS" && echo "    OK" || echo "    ERROR"
      fi
      if test -f "$FoR_DS"; then
          echo "  Updating ForecastDS-azure.json"
          sed -i "$SED_PATTERN" "$FoR_DS"
          grep -Eq "$GREP_PATTERN" "$FoR_DS" && echo "    OK" || echo "    ERROR"
      fi
      if test -f "$DMSS_SYSTEM"; then
          echo "  Updating dmss-system.radix.json"
          sed -i "$SED_PATTERN" "$DMSS_SYSTEM"
          grep -Eq "$GREP_PATTERN" "$DMSS_SYSTEM" && echo "    OK" || echo "    ERROR"
      fi
    else
      echo "Missing required variable 'MONGO_AZURE_HOST'. Exiting."
      exit 1
    fi
}

function set_database_username() {
    SED_PATTERN="s/\"username\":.*\",/\"username\": \"$MONGO_AZURE_USER\",/"
    GREP_PATTERN="^\s{1,}\"username\": \"$MONGO_AZURE_USER\","

    echo "Setting database usernames.."
    if [ -n "$MONGO_AZURE_USER" ]; then
      if test -f "$DMT_DS"; then
          echo "  Updating DMT-DS-azure.json"
          sed -i "$SED_PATTERN" "$DMT_DS"
          grep -Eq "$GREP_PATTERN" "$DMT_DS" && echo "    OK" || echo "    ERROR"
      fi
      if test -f "$FoR_DS"; then
          echo "  Updating ForecastDS-azure.json"
          sed -i "$SED_PATTERN" "$FoR_DS"
          grep -Eq "$GREP_PATTERN" "$FoR_DS" && echo "    OK" || echo "    ERROR"
      fi
      if test -f "$DMSS_SYSTEM"; then
          echo "  Updating dmss-system.radix.json"
          sed -i "$SED_PATTERN" "$DMSS_SYSTEM"
          grep -Eq "$GREP_PATTERN" "$DMSS_SYSTEM" && echo "    OK" || echo "    ERROR"
      fi
    else
      echo "Missing required variable 'MONGO_AZURE_USER'. Exiting."
      exit 1
    fi
}

function set_database_password() {
    SED_PATTERN="s/\"password\":.*\",/\"password\": \"$MONGO_AZURE_PW\",/"
    GREP_PATTERN="^\s{1,}\"password\": \"$MONGO_AZURE_PW\","

    echo "Setting database passwords.."
    if [ -n "$MONGO_AZURE_PW" ]; then
      if test -f "$DMT_DS"; then
          echo "  Updating DMT-DS-azure.json"
          sed -i "$SED_PATTERN" "$DMT_DS"
          grep -Eq "$GREP_PATTERN" "$DMT_DS" && echo "    OK" || echo "    ERROR"
      fi
      if test -f "$FoR_DS"; then
          echo "  Updating ForecastDS-azure.json"
          sed -i "$SED_PATTERN" "$FoR_DS"
          grep -Eq "$GREP_PATTERN" "$FoR_DS" && echo "    OK" || echo "    ERROR"
      fi
      if test -f "$DMSS_SYSTEM"; then
          echo "  Updating dmss-system.radix.json"
          sed -i "$SED_PATTERN" "$DMSS_SYSTEM"
          grep -Eq "$GREP_PATTERN" "$DMSS_SYSTEM" && echo "    OK" || echo "    ERROR"
      fi
    else
      echo "Missing required variable 'MONGO_AZURE_PW'. Exiting."
      exit 1
    fi
}

function set_data_source_names() {
  echo "Setting data source names.."
  if test -f "$DMT_DS"; then
    NEW_NAME="DMT-Internal"
    OLD_NAME="Test$NEW_NAME"
    echo "  Updating DMT-DS-azure.json"
    sed -i "s/\"name\": \"$OLD_NAME\",/\"name\": \"$NEW_NAME\",/" "$DMT_DS"
    grep -Eq "^\s{1,}\"name\": \"$NEW_NAME\"," "$DMT_DS" && echo "    OK" || echo "    ERROR"
  fi
  if test -f "$FoR_DS"; then
    NEW_NAME="ForecastDS"
    OLD_NAME="Test$NEW_NAME"
    echo "  Updating ForecastDS-azure.json"
    sed -i "s/\"name\": \"$OLD_NAME\",/\"name\": \"$NEW_NAME\",/" "$FoR_DS"
    grep -Eq "^\s{1,}\"name\": \"$NEW_NAME\"," "$FoR_DS" && echo "    OK" || echo "    ERROR"
  fi
}

function update_compose_spec() {
  TARGET_ENV="ENVIRONMENT: production"
  TARGET_LOG="LOGGING_LEVEL: debug"
  echo "Updating compose spec.."
  if test -f "$COMPOSE_FILE"; then
    echo "  Updating volume mount"
    sed -i "s/dmss-system.local.json:/dmss-system.radix.json:/" "$COMPOSE_FILE"
    grep -Eq "^\s{6}- ./dmss-system.radix.json:" "$COMPOSE_FILE" && echo "    OK" || echo "    ERROR"

    echo "  Updating ENVIRONMENT.."
    sed -i "s/ENVIRONMENT: \${DMSS_ENVIRONMENT:-local}/${TARGET_ENV}/" "$COMPOSE_FILE"
    dmss_service_spec=$(grep -EA 20 "^\s{2}dmss:" "$COMPOSE_FILE")
    echo "$dmss_service_spec" | grep -Eq "^\s{6}${TARGET_ENV}" && echo "    OK" || echo "    ERROR"

    echo "  Updating LOGGING_LEVEL.."
    sed -i "s/LOGGING_LEVEL: \".*\"$/${TARGET_LOG}/g" "$COMPOSE_FILE"
    dmss_service_spec=$(grep -EA 20 "^\s{2}dmss:" "$COMPOSE_FILE")
    echo "$dmss_service_spec" | grep -Eq "^\s{6}${TARGET_LOG}" && echo "    OK" || echo "    ERROR"
  fi
}

function build_images() {
  echo "Building the Docker images.."
  docker-compose build --quiet && echo "    OK" || echo "    ERROR"
}

function dmss_reset_app() {
  echo "Resetting DMSS.."
  if [ "$DRY_RUN" == "False" ]; then
    docker-compose run --rm -e SECRET_KEY="$SECRET_KEY" -e MONGO_AZURE_URI="$MONGO_AZURE_URI" dmss reset-app && echo "    OK" || echo "    ERROR"
  else
    echo "    Skipping (dry run)"
  fi
}

function api_reset_app() {
  echo "Resetting the API.."
  for data_source in "${DATA_SOURCES[@]}"; do
    echo "  Importing data source '$data_source'"
    if [ "$DRY_RUN" == "False" ]; then
      docker-compose run --rm -e DMSS_API="$DMSS_API" api --token="$TOKEN" import-data-source "$data_source" && echo "    OK" || echo "    ERROR"
    else
      echo "    Skipping (dry run)"
    fi
  done

  unique_packages=()
  for package in "${PACKAGES[@]}"; do
    destination=$(echo "$package" | grep -Po '.*/api/home/[a-zA-Z0-9]{1,}/data/*\K[^/]*')
    # shellcheck disable=SC2076
    if [[ ! " ${completed[*]} " =~ " ${destination} " ]]; then
      echo "  Resetting package '$destination'"
      if [ "$DRY_RUN" == "False" ]; then
        docker-compose run --rm -e DMSS_API="$DMSS_API" api --token="$TOKEN" reset-package "$package" "$destination" && echo "    OK" || echo "    ERROR"
      else
        echo "    Skipping (dry run)"
      fi
      completed+=("$destination")
    fi
  done

}

function cleanup() {
  trap - SIGINT SIGTERM ERR EXIT
  echo "Cleaning up.."
  if [ "$GIT_RESTORE" == "True" ]; then
    echo "  Running 'git restore' on modified JSON and docker(-compose) files.."
    git restore "$DMT_DS" "$FoR_DS" "$SIMA_DS" "$SIMPOS_APP_DB_DS" "$SIMPOS_MDL_DB_DS" "$DMSS_SYSTEM" "$COMPOSE_FILE" && echo "    OK" || echo "    ERROR"
  else
    echo "  Skipping 'git restore' due to '--no-restore' flag"
    msg "${RED}   Warning: Passwords may be stored in clear text in the modified files. Please avoid committing them to git.${NOFORMAT}"
    msg "${RED}   Issue a manual 'git restore' with the following command:"
    msg "${ORANGE}      git restore $DMT_DS $FoR_DS $SIMA_DS $SIMPOS_APP_DB_DS $SIMPOS_MDL_DB_DS $DMSS_SYSTEM $COMPOSE_FILE ${NOFORMAT}"
  fi
  if [ "$COMPOSE_DOWN" == "True" ]; then
    echo "  Running 'docker-compose down'.."
    docker-compose down && echo "    OK" || echo "    ERROR"
  fi
}

trap cleanup SIGINT SIGTERM ERR EXIT

function main() {
  discover_packages
  parse_mongo_conn_str
  set_env_vars
  print_vars
  set_database_host
  set_database_port
  set_database_username
  set_database_password
  set_data_source_names
  update_compose_spec
  build_images
  dmss_reset_app
  api_reset_app
}

setup_colors
main
