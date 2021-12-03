#!/usr/bin/env bash

set -eu

# Required variables
## CLI arguments
TOKEN=${TOKEN:-}  # optionally specify in env
DMSS_API=${DMSS_API:-"https://dmss-forecast-of-response-test.radix.equinor.com"}
## Environment variables
SECRET_KEY=${SECRET_KEY:-}
MONGO_AZURE_PW=${MONGO_AZURE_PW:-}
MONGO_AZURE_URI=${MONGO_AZURE_URI:-}

# Optional variables
## CLI arguments
CREATE_DMSS_KEY="False"

for i in "$@"; do
  case $i in
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
    *)
      echo "WARNING: Invalid argument '$i'"
      ;;
  esac
done

if [ -z "$TOKEN" ]; then
  echo "Missing required parameter '--token'. Exiting."
  exit 1
fi
if [ -z "$DMSS_API" ]; then
  echo "Missing required parameter '--dmss-api'. Exiting."
  exit 1
fi
if [ -z "$SECRET_KEY" ]; then
  if [ "$CREATE_DMSS_KEY" == "False" ]; then
    echo "Environment variable 'SECRET_KEY' is missing."
    echo "You must either provide the environment variable 'SECRET_KEY', or run the script with '--create-key'. Exiting."
    exit 1
  fi
fi
if [ -z "$MONGO_AZURE_PW" ]; then
  echo "Missing required environment variable 'MONGO_AZURE_PW'. Exiting."
  exit 1
fi
if [ -z "$MONGO_AZURE_URI" ]; then
  echo "Missing required variable 'MONGO_AZURE_URI'. Exiting."
  exit 1
fi

# File paths
DIR=$PWD
## Data sources
DMT_DS_DIR=$DIR/api/home/DMT/data_sources
DMT_DS=$DMT_DS_DIR/DMT-DS.json
DMT_DS_AZ=$DMT_DS_DIR/DMT-DS-azure.json
FoR_DS_DIR=$DIR/api/home/for/data_sources
FoR_DS=$FoR_DS_DIR/ForecastDS.json
FoR_DS_AZ=$FoR_DS_DIR/ForecastDS-azure.json

DMSS_SYSTEM=$DIR/dmss-system.radix.json
COMPOSE_FILE=$DIR/docker-compose.yml

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
  TARGET_ENV='ENVIRONMENT: production'
  echo "Updating compose spec.."
  if test -f "$COMPOSE_FILE"; then
    echo "  Updating volume mount"
    sed -i "s/dmss-system.local.json:/dmss-system.radix.json:/" "$COMPOSE_FILE"
    grep -Eq "^\s{6}- ./dmss-system.radix.json:" "$COMPOSE_FILE" && echo "    OK" || echo "    ERROR"

    echo "  Updating ENVIRONMENT"
    sed -i "s/ENVIRONMENT: \${DMSS_ENVIRONMENT:-local}/${TARGET_ENV}/" "$COMPOSE_FILE"
    dmss_service_spec=$(grep -EA 20 "^\s{2}dmss:" "$COMPOSE_FILE")
    echo "$dmss_service_spec" | grep -Eq "^\s{6}${TARGET_ENV}" && echo "    OK" || echo "    ERROR"
  fi
}

function set_env_vars() {
    if [ "$CREATE_DMSS_KEY" == "True" ]; then
      sk_outfile_name="generated-secret-key.env"
      echo "Generating new DMSS SECRET_KEY.."
      create_key_output=$(docker-compose run --rm dmss create-key)
      SECRET_KEY=$(echo "$create_key_output" | tail -n 1)
      echo "  =============================="
      echo "  New SECRET_KEY: $SECRET_KEY   "
      echo "  Make sure to add it to Radix! "
      echo "  =============================="
      echo "SECRET_KEY=$SECRET_KEY" > "$sk_outfile_name"
      echo "Wrote secret key to '$sk_outfile_name'"
    fi
}

function print_vars() {
  DB_NAME=$(echo "$MONGO_AZURE_URI" | awk -F':' '{ print $2 }')
  echo "=== Variables ===
  Database: $DB_NAME
  DMSS API: $DMSS_API
  Key:      $SECRET_KEY
  "
}

function build_and_run_images() {
  echo "Building and running the Docker containers.."
  docker-compose up -d --build
}

function dmss_reset_app() {
  echo "Resetting DMSS.."
  docker-compose run dmss reset-app
}

function api_reset_app() {
  echo "Resetting the API.."
  docker-compose run --rm -e DMSS_API="$DMSS_API" api --token="$TOKEN" reset-app
}

function clean_up() {
  echo "Cleaning up.."
  git restore "$DMT_DS" "$DMT_DS_AZ" "$FoR_DS" "$FoR_DS_AZ" "$DMSS_SYSTEM" "$COMPOSE_FILE" && echo "    OK" || echo "    ERROR"
}

function main() {
  delete_data_source_defs
  set_database_password
  set_data_source_names
  update_compose_spec
  set_env_vars
  print_vars
  build_and_run_images
  dmss_reset_app
  api_reset_app
  clean_up
}

main
