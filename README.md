# Forecast of Response

Application for create, schedule, and display forecasted responses of any type.

Built with the Data Modelling Tool

## Prerequisites

- Access to the Container Registry

## Running

```bash
docker-compose build
# Repository secrets are encrypted at rest. Therefore, an encryption key is needed.
KEY=$(docker-compose run --rm dmss create-key)
echo $KEY
cp .env-template .env 
echo "SECRET_KEY=$KEY" >> .env
docker-compose up
```

Visit [http://localhost:9000] in your web browser.

### Reset data

When blueprints or entities has been changed on disk, they need to be re-imported to the storage service like so;

```bash
docker-compose run --rm api reset-app
```

Note: This also deletes any data not saved to disk

### Data Modelling Storage Service

API documentation can be found at [http://localhost:5010/docs](http://localhost:5010/docs).

## Development

### Pre-commit

The project provides a `.pre-commit-config.yaml`-file that is used to setup git _pre-commit hooks_.

Alternative pre-commit installations can be found [here](https://pre-commit.com/#install).

#### 1) Install pre-commit

Optionally create a virtualenv (recommended)

```bash
python3 -m venv .venv
source .venv/bin/activate # unix
```

```bash
pip install pre-commit
pre-commit install
```

#### 2) Run pre-commit manually

```bash
pre-commit run -a
```

## Runbook

The Forecast of Response application is deployed to Radix, using the config defined in radixconfig.yaml.
This deployment is connected to an Azure mongo database in Azure called forecast-of-response
 in the MSARGDev resource group, and also an azure storage account called forecastofresponse in the same resource group

### Reset a deployed package

```bash
docker-compose run --rm -e DMSS_API=https://dmss-forecast-of-response-test.radix.equinor.com api --token="eyJ0eXAiOiKIb9TKV0rQ" reset-package home/for/data/ForecastDS/FoR-BP ForecastDS/FoR-BP
```

### How to reset database used in the forecast app

Make the following changes to the FoR repo (updated 01.12.21)

1. Delete the following data source files:
   1. api/home/DMT/data_sources/DMT-DS.json
   2. api/home/for/data_sources/ForecastDS.json
2. Add the database password to the "password" property of the following files:
   1. api/home/DMT/data_sources/DMT-DS-azure.json
   2. api/home/for/data_sources/ForecastDS-azure.json
   3. dmss-system.radix.json
      1. The password can be retrieved from the instance page of the Azure Cosmos DB in the Azure Portal
3. Update the data source names:
   1. In DMT-DS-azure.json, set "name" to be "DMT-Internal"
   2. In ForecastDS-azure.json, set "name" to be "ForecastDS"
4. In docker-compose, make the following changes:
   - for dmss service, set environment variable ENVIRONMENT to be "production"
   - for dmss service, update the volumes file to be "dmss-system.radix.json" instead of "dmss-system.local.json"

5. Set the necessary environment variables:
   1. Set "MONGO_AZURE_URI" to the connection string of the Mongo instance.
      1. MONGO_AZURE_URI="mongodb://..."
         1. The connection string can be retrieved from the instance page of the Azure Cosmos DB in the Azure Portal
         2. NB: Make sure to select the correct database for your environment
            1. i.e. 'forecast-of-response' for 'test', or 'forecast-of-response-prod' for 'prod'
   2. Set "SECRET_KEY" to the SECRET_KEY used in Radix
      1. Optionally generate a new one by running `docker-compose run --rm dmss create-key`.
      2. Make sure to update the value in Radix if creating a new key.
6. Run commands from the main FoR folder:

    ```bash
    docker-compose up --build
    # Note: Make sure the "SECRET_KEY" string is the same locally as in Radix
    docker-compose run dmss reset-app
    docker-compose run --rm -e DMSS_API=https://dmss-forecast-of-response-test.radix.equinor.com api --token="eyXXXX" reset-app
    ```
7. Remember to delete the passwords in all json files after you are finished! Also, you probably want to revert the changes made to the docker-compose and docker files

Note: you need to have the same SECRET_KEY in your local .env file as used on in the DMSS service in radix (can be changed in the radix console). 

