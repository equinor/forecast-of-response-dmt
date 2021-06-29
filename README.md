# data-modelling-tool-demo-app

Demo application built using data modelling tool (DMT) and data modelling storage service (DMSS).

## Prerequisites

In order to run the commands described below, you need:
- [Docker](https://www.docker.com/) 
- [Docker Compose](https://docs.docker.com/compose/)
- make (`sudo apt-get install make` on Ubuntu)

## Running 

```bash
docker-compose up
```

Visit [http://localhost:9000] in your web browser (Internet Explorer is not supported).

## Reset data

```
docker-compose exec api ./reset-application.sh
```

## Data Modelling Storage Service

API documentation can be found at [http://localhost:5010/api/v1/ui/](http://localhost:5010/api/v1/ui/).
