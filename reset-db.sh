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

# Placeholders
MONGO_AZURE_HOST=None
MONGO_AZURE_PORT=None
MONGO_AZURE_USER=None
MONGO_AZURE_PW=None

function print_help() {
    echo "$0: usage

    Arguments:
      -h                Print this message
      --token           A valid access token for DMT/FoR
      --dmss-api        The URL of the DMSS API to run against
      --create-key      Generate a new SECRET_KEY to encrypt the data with
      --no-restore      Do not run 'git restore' on the modified files upon completion
      --keep-containers Do not run 'docker-compose down' upon completion

    Example:
      Run with CLI arguments
        $0 --token=\"eyJ0eX\" --dmss-api=\"https://dmss-[...].com\" --create-key --no-restore
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
    -h)
      print_help
      exit 0
      ;;
    --token=*)
      TOKEN="${i#*=}"
      shift # past argument=value
      ;;
    --dmss-api=*)
      DMSS_API="${i#*=}"
      shift # past argument=value
      ;;
    --create-key)
      CREATE_DMSS_KEY="True"
      shift # past argument=value
      ;;
    --no-restore)
      GIT_RESTORE="False"
      shift # past argument=value
      ;;
    --keep-containers)
      COMPOSE_DOWN="False"
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
## Data sources
DMT_DS_DIR=$DIR/api/home/DMT/data_sources
DMT_DS=$DMT_DS_DIR/DMT-DS.json
DMT_DS_AZ=$DMT_DS_DIR/DMT-DS-azure.json
FoR_DS_DIR=$DIR/api/home/for/data_sources
FoR_DS=$FoR_DS_DIR/ForecastDS.json
FoR_DS_AZ=$FoR_DS_DIR/ForecastDS-azure.json

DMSS_SYSTEM=$DIR/dmss-system.radix.json
COMPOSE_FILE=$DIR/docker-compose.yml

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

function delete_data_source_defs() {
    echo "Deleting data source definitions.."
    if test -f "$DMT_DS"; then
        echo "  Deleting DMT-DS.json"
        rm "$DMT_DS"
        test ! -f "$DMT_DS" && echo "    OK" || echo "    ERROR"
    fi
    if test -f "$FoR_DS"; then
        echo "  Deleting ForecastDS.json"
        rm "$FoR_DS"
        test ! -f "$FoR_DS" && echo "    OK" || echo "    ERROR"
    fi
}

function set_database_host() {
    SED_PATTERN="s/\"host\":.*\",/\"host\": \"$MONGO_AZURE_HOST\",/"
    GREP_PATTERN="^\s{1,}\"host\": \"$MONGO_AZURE_HOST\","

    echo "Setting database hosts.."
    if [ -n "$MONGO_AZURE_HOST" ]; then
      if test -f "$DMT_DS_AZ"; then
          echo "  Updating DMT-DS-azure.json"
          sed -i "$SED_PATTERN" "$DMT_DS_AZ"
          grep -Eq "$GREP_PATTERN" "$DMT_DS_AZ" && echo "    OK" || echo "    ERROR"
      fi
      if test -f "$FoR_DS_AZ"; then
          echo "  Updating ForecastDS-azure.json"
          sed -i "$SED_PATTERN" "$FoR_DS_AZ"
          grep -Eq "$GREP_PATTERN" "$FoR_DS_AZ" && echo "    OK" || echo "    ERROR"
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
      if test -f "$DMT_DS_AZ"; then
          echo "  Updating DMT-DS-azure.json"
          sed -i "$SED_PATTERN" "$DMT_DS_AZ"
          grep -Eq "$GREP_PATTERN" "$DMT_DS_AZ" && echo "    OK" || echo "    ERROR"
      fi
      if test -f "$FoR_DS_AZ"; then
          echo "  Updating ForecastDS-azure.json"
          sed -i "$SED_PATTERN" "$FoR_DS_AZ"
          grep -Eq "$GREP_PATTERN" "$FoR_DS_AZ" && echo "    OK" || echo "    ERROR"
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
      if test -f "$DMT_DS_AZ"; then
          echo "  Updating DMT-DS-azure.json"
          sed -i "$SED_PATTERN" "$DMT_DS_AZ"
          grep -Eq "$GREP_PATTERN" "$DMT_DS_AZ" && echo "    OK" || echo "    ERROR"
      fi
      if test -f "$FoR_DS_AZ"; then
          echo "  Updating ForecastDS-azure.json"
          sed -i "$SED_PATTERN" "$FoR_DS_AZ"
          grep -Eq "$GREP_PATTERN" "$FoR_DS_AZ" && echo "    OK" || echo "    ERROR"
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
      if test -f "$DMT_DS_AZ"; then
          echo "  Updating DMT-DS-azure.json"
          sed -i "$SED_PATTERN" "$DMT_DS_AZ"
          grep -Eq "$GREP_PATTERN" "$DMT_DS_AZ" && echo "    OK" || echo "    ERROR"
      fi
      if test -f "$FoR_DS_AZ"; then
          echo "  Updating ForecastDS-azure.json"
          sed -i "$SED_PATTERN" "$FoR_DS_AZ"
          grep -Eq "$GREP_PATTERN" "$FoR_DS_AZ" && echo "    OK" || echo "    ERROR"
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
  if test -f "$DMT_DS_AZ"; then
    NEW_NAME="DMT-Internal"
    OLD_NAME="Test$NEW_NAME"
    echo "  Updating DMT-DS-azure.json"
    sed -i "s/\"name\": \"$OLD_NAME\",/\"name\": \"$NEW_NAME\",/" "$DMT_DS_AZ"
    grep -Eq "^\s{1,}\"name\": \"$NEW_NAME\"," "$DMT_DS_AZ" && echo "    OK" || echo "    ERROR"
  fi
  if test -f "$FoR_DS_AZ"; then
    NEW_NAME="ForecastDS"
    OLD_NAME="Test$NEW_NAME"
    echo "  Updating ForecastDS-azure.json"
    sed -i "s/\"name\": \"$OLD_NAME\",/\"name\": \"$NEW_NAME\",/" "$FoR_DS_AZ"
    grep -Eq "^\s{1,}\"name\": \"$NEW_NAME\"," "$FoR_DS_AZ" && echo "    OK" || echo "    ERROR"
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
  docker-compose run --rm -e SECRET_KEY="$SECRET_KEY" dmss reset-app
}

function api_reset_app() {
  echo "Resetting the API.."
  docker-compose run --rm -e DMSS_API="$DMSS_API" api --token="$TOKEN" reset-app
}

function cleanup() {
  trap - SIGINT SIGTERM ERR EXIT
  echo "Cleaning up.."
  if [ "$GIT_RESTORE" == "True" ]; then
    echo "  Running 'git restore' on modified JSON and docker(-compose) files.."
    git restore "$DMT_DS" "$DMT_DS_AZ" "$FoR_DS" "$FoR_DS_AZ" "$DMSS_SYSTEM" "$COMPOSE_FILE" && echo "    OK" || echo "    ERROR"
  else
    echo "  Skipping 'git restore' due to '--no-restore' flag"
    echo "    Warning: Passwords may be stored in clear text in the modified files. Please avoid committing them to git."
    echo "    Issue a manual 'git restore' with the following command:"
    echo "      git restore $DMT_DS $DMT_DS_AZ $FoR_DS $FoR_DS_AZ $DMSS_SYSTEM $COMPOSE_FILE"
  fi
  if [ "$COMPOSE_DOWN" == "True" ]; then
    echo "  Running 'docker-compose down'.."
    docker-compose down && echo "    OK" || echo "    ERROR"
  fi
}

trap cleanup SIGINT SIGTERM ERR EXIT

function main() {
  parse_mongo_conn_str
  set_env_vars
  print_vars
  delete_data_source_defs
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
