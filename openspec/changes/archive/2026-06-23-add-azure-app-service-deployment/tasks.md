## 1. Server Runtime Configuration

- [x] 1.1 Review current `server.js` startup configuration.
- [x] 1.2 Keep `process.env.PORT || 3000` as the server port source.
- [x] 1.3 Update host binding so Azure App Service does not bind only to `127.0.0.1`.

## 2. SQLite Persistence

- [x] 2.1 Review current `database.js` SQLite path handling.
- [x] 2.2 Detect Azure App Service with `process.env.WEBSITE_SITE_NAME`.
- [x] 2.3 Use `/home/data/prices.db` on Azure.
- [x] 2.4 Keep the existing local `prices.db` path outside Azure.
- [x] 2.5 Create the Azure data directory if it does not exist.

## 3. Project Metadata and Repository Hygiene

- [x] 3.1 Add `engines.node` to `package.json`.
- [x] 3.2 Confirm `npm start` remains the Express startup command.
- [x] 3.3 Confirm `.gitignore` excludes `node_modules/`, SQLite database files, and `.env`.

## 4. Documentation and Verification

- [x] 4.1 Add concise Azure App Service deployment notes to `README.md`.
- [x] 4.2 Run JavaScript syntax checks for changed backend files.
- [x] 4.3 Start the app locally and verify the local database path still works.
