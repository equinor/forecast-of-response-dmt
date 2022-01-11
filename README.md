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
docker-compose run --rm dmss reset-app
docker-compose run --rm api reset-app
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
in the MSARGDev resource group, and also an azure storage account called forecastofresponse in the same
resource group



### Reset a deployed package

```bash
docker-compose run --rm -e DMSS_API=https://dmss-forecast-of-response-test.radix.equinor.com api --token="eyJ0eXAiOiKIb9TKV0rQ" reset-package home/for/data/ForecastDS/FoR-BP ForecastDS/FoR-BP
```

### How to reset database used in the forecast app
1. Set the necessary environment variables:
   1. Copy the env-template file `reset-db.env-template`:
      1. `cp reset-db.env-template reset-db.env`
   2. Modify the new file `reset-db.env` to set the environment variables:
      1. `TOKEN`: A JWT (access token) from the Forecast of Response application.
      2. `DMSS_API`: The full URL to the DMSS API for the environment you wish to reset.
      3. `SECRET_KEY`: The secret key that was used to encrypt the data in the environment you wish to reset.
         1. Note: If you wish to generate a new secret key, this value can be left blank.
            1. NB: Make sure to run the script with `--create-key`.
      4. `MONGO_AZURE_URI`: The Mongo connection string of the Mongo database for the environment you wish to reset.
   3. Source the environment variables:
      1. `source reset-db.env`
2. Run the script:
   1. Print help: `./reset-db.sh -h`
   2. Run the script: `./reset-db.sh`
   3. Run and create a new secret key: `./reset-db.sh --create-key`
      1. NB: Make sure to set the new key in the Radix secrets for DMSS for the environment you wish to reset.
      2. The new secret key is written to a file named `generated-secret-key.env`
   

_Prod URL_  
DMSS_API=https://dmss-forecast-of-response-prod.radix.equinor.com

_Test URL_  
DMSS_API=https://dmss-forecast-of-response-test.radix.equinor.com

#### First time configuration

A fresh database has the permissions `{dmss_admin: WRITE, other: READ}`.  
To allow all expert users to create operations, use the DMT application to update the permissions on the FoR-Data package recursively, granting the role `expert: WRITE`.  
Note: This will make all new operations editable by all experts. This can be changed on any individual operation.