# Forecast of Response 

Application for create, schedule, and display forecasted responses of any type.

Built with the Data Modelling Tool

## Prerequisites
- Access to the Container Registry

## Running 

```bash
# Set environment variables
export DMSS_VERSION=latest DMT_VERSION=latest
# Run
docker-compose up --build
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
You must clone the repositories DMSS, DMT and FoR locally and make the following changes (updated 05.10.21)

### DMSS
1. Add the mongodb password to home/system/data_source/azure.json
  (NB! azure.json and system.json must have same names for "name", database and collection, etc. the only difference should be the connection info to the mongodb)
2. Update the file used in context.invoke() inside app.py/reset_app() to be azure.json instead of system.json
3. build the dmss image locally (call it for example dmss_api_local)

### DMT
1. In api/src/home/DMT/data_source/Demo.json and api/src/home/DMT/data_source/DMT.json, change values for "host", "port", "username", "password" and "tls" to connect to the azure mongodb 
(see example of correct values in Demo-azure.json / DMT-azure.json)
Also, remember to update: account_name=forecastofresponse, account_key (found in azure portal) and container=for in the azure_blob repository in Demo.json.
2. After updating Demo.json and DMT.json, you can delete Demo-azure.json and DMT-azure.json locally.
3. Build the DMT api docker image locally (call it for example dmt_api_local)

### FoR
1. Delete api/home/DMT/data_sources/DMT-DS.json and api/home/for/data_sources/ForecastDS.json. 
2. Add database password to DMT-DS-azure.json and ForecastDS-azure.json
3. in the api/Dockerfile, use the locally build api docker image
4. in docker-compose, update the dmss service to use the locally build dmss image and update env variable ENVIRONMENT to be production

5. Run commands from the main FoR folder:
```bash
docker-compose up --build
docker-compose run dmss reset-app
docker-compose run api reset-app
```

6. Remember to delete the passwords in all json files after you are finished!
