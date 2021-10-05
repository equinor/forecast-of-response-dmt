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

```
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


## Deployment
The Forecast of Response application is deployed to Radix, using the config defined in radixconfig.yaml.
This deployment is connected to an Azure mongo database in Azure called forecast-of-response
 in the MSARGDev resource group, and also an azure storage account called forecastofresponse in the same resource group
## How to reset database used in the forecast app
Make the following changes to the FoR repo (updated 05.10.21)


1. Delete api/home/DMT/data_sources/DMT-DS.json and api/home/for/data_sources/ForecastDS.json. 
2. Add database password to DMT-DS-azure.json and ForecastDS-azure.json
3. Add database password to dmss-system.radix.json
4. in docker-compose, make the following changes:
* for dmss service, set environment variable ENVIRONMENT to be production
* for dmss service, update the volumes file to be dmss-system.radix.json instead of dmss-system.local.json

5. Run commands from the main FoR folder:
```bash
docker-compose up --build
docker-compose run dmss reset-app
docker-compose run api reset-app
```

6. Remember to delete the passwords in all json files after you are finished! Also, you probably want to revert the changes made to the docker-compose and docker files
