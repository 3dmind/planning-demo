# Domain-Driven Design: Tactical Design Demo

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=planning-demo&metric=alert_status)](https://sonarcloud.io/dashboard?id=planning-demo)
![Coverage](https://sonarcloud.io/api/project_badges/measure?project=planning-demo&metric=coverage)
![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=planning-demo&metric=code_smells)
![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=planning-demo&metric=sqale_index)

## Description

Showing [tactical design patterns](https://thedomaindrivendesign.io/what-is-tactical-design/) inside a [NestJS](https://github.com/nestjs/nest) application.

## Initial setup and installation

### Install all dependencies

```bash
$ yarn install
```

### Database setup

To set up the database with a small initial dataset you have to build the docker image for the database migrations.
The image includes a script to seed the database.

```bash
$ cd prisma
$ docker build -t planning_db_migrate .
```

## Running the app

### Start docker-containers

```bash
$ docker-compose up -d
```

## Start the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

## Unit tests

```bash
$ yarn run test
```

## Unit tests with coverage

```bash
$ yarn run test:cov
```

### E2E tests

Make sure to run all docker containers before executing the e2e tests.

```bash
$ yarn test:e2e --runInBand --forceExit
```

Reset the database after the test run.

```bash
$ yarn db:migrate:reset
```

## Docker

To take down all containers and get rid of all volumes.

```bash
$ docker-compose down --volumes
```
