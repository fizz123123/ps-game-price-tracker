## Context

The project is an Express + SQLite web app that currently runs locally with `npm start`. Azure App Service provides the runtime port through environment variables and only guarantees persistent file storage under `/home`. The app should remain simple and continue using SQLite, while becoming safe to run on Azure App Service F1.

## Goals / Non-Goals

**Goals:**

- Keep local development behavior unchanged.
- Use Azure-provided runtime configuration for server startup.
- Store SQLite data in Azure's persistent `/home/data` directory when deployed.
- Keep using the local `prices.db` file during local development.
- Add Node.js runtime metadata for Azure deployment.
- Document the minimal Azure deployment notes in `README.md`.

**Non-Goals:**

- Do not add CI/CD, GitHub Actions, or automatic deployment.
- Do not migrate to Azure SQL, PostgreSQL, Cosmos DB, or another cloud database.
- Do not add authentication, membership, or user accounts.
- Do not change existing API routes, request/response shapes, frontend behavior, crawler behavior, or database schema.

## Decisions

- Detect Azure App Service with `process.env.WEBSITE_SITE_NAME`, because Azure injects this environment variable and it remains undefined in local development.
- Use `/home/data/prices.db` on Azure, because Azure App Service persists files under `/home` across restarts and redeployments.
- Keep local SQLite storage at the current project-level `prices.db`, because the existing local workflow and `.gitignore` already assume that file.
- Create the Azure data directory at startup if it does not exist, so deployment does not require manually creating `/home/data`.
- Keep `process.env.PORT || 3000` as the server port source, because Azure assigns the port dynamically and local development still needs a default.
- Avoid binding only to `127.0.0.1` on Azure. Local development can still use localhost-style binding, but Azure must be able to accept traffic routed by App Service.
- Add `engines.node` to `package.json` so Azure has an explicit Node runtime expectation.
- Treat `.gitignore` as a repository hygiene check, not a behavior change.

## Risks / Trade-offs

- Azure App Service F1 file persistence is limited to the App Service filesystem. -> Keep the app scoped to a small demo/personal tracker and document that this is not a production-scale database setup.
- SQLite on App Service is not suitable for high-concurrency writes. -> Do not introduce multi-user workflows or background jobs in this change.
- Existing local data in `prices.db` will not automatically appear in Azure. -> Document that Azure creates and uses its own `/home/data/prices.db`.
- If `WEBSITE_SITE_NAME` is not present in a future hosting environment, the app will use local path behavior. -> This change only targets Azure App Service.
