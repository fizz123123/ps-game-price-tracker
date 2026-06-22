## Why

The app currently runs well locally, but Azure App Service has different runtime constraints for port binding and persistent file storage. This change makes the existing Express + SQLite project deployable on Azure App Service F1 while keeping local development behavior unchanged.

## What Changes

- Ensure the Express server uses the Azure-provided `process.env.PORT` at runtime.
- Avoid binding the deployed server only to `127.0.0.1` when running on Azure.
- Store SQLite data under `/home/data` when running on Azure App Service.
- Keep local development using the current local SQLite database file.
- Add a Node.js engine declaration to `package.json`.
- Confirm `.gitignore` excludes `node_modules/`, SQLite database files, and `.env`.
- Add concise Azure App Service deployment notes to `README.md`.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `game-price-tracker`: Add deployment requirements for Azure App Service runtime port binding and SQLite persistence.

## Impact

- Affects `server.js` startup configuration.
- Affects `database.js` SQLite file path selection.
- Affects `package.json` runtime metadata.
- Affects `.gitignore` repository hygiene.
- Affects `README.md` deployment documentation.
- Does not change existing API routes, frontend behavior, authentication, crawler scope, or database schema.
