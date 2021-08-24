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
