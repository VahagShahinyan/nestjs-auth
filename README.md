<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Installation

```bash
$ npm install
```

## Start PostgreSQL

```shell
docker-compose up -d
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# e2e tests
$ npm run test:e2e
```

## Requirements for API tests

- Each API test should not depend on the results or state of other tests or API requests.
- Running one API test should not affect the execution of other tests.
- Each API test should be isolated from other tests and should not depend on the system state created by other tests.
- Each API test should have the ability to be run and tested independently of other tests.
