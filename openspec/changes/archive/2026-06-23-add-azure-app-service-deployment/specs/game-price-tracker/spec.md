## ADDED Requirements

### Requirement: Azure App Service deployment support

The system SHALL support deployment to Azure App Service F1 without changing existing frontend behavior, API routes, or the SQLite table schema.

#### Scenario: Server uses Azure runtime port

- **WHEN** the app starts with `process.env.PORT` set by Azure App Service
- **THEN** the Express server MUST listen using that port
- **AND** local development MUST still work when `process.env.PORT` is not set

#### Scenario: Server accepts Azure App Service traffic

- **WHEN** the app runs on Azure App Service
- **THEN** the server MUST NOT bind only to `127.0.0.1`
- **AND** Azure App Service MUST be able to route incoming HTTP traffic to the Express app

#### Scenario: SQLite persists under Azure home directory

- **WHEN** the app runs on Azure App Service
- **THEN** the SQLite database file MUST be stored under `/home/data`
- **AND** the app MUST create the data directory if it does not already exist

#### Scenario: Local SQLite behavior is preserved

- **WHEN** the app runs outside Azure App Service
- **THEN** the SQLite database file MUST use the existing local `prices.db` path

#### Scenario: Runtime metadata is declared

- **WHEN** Azure installs and starts the Node.js app
- **THEN** `package.json` MUST declare a compatible Node.js engine
- **AND** `npm start` MUST remain the start command for the Express server

#### Scenario: Repository excludes generated and local-only files

- **WHEN** the project is committed to Git
- **THEN** `node_modules/`, local SQLite database files, and `.env` MUST be ignored
