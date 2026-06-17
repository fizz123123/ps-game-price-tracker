## Context

The system is named "PS首發價格追蹤". Its subtitle is "從 PlayStation 遊戲上市價格，觀察玩家娛樂消費的變化。". The site will let a user record PS platform game price data and browse the records later. The implementation must use plain HTML, CSS, and JavaScript on the frontend, Express.js for the backend API, and SQLite for persistent storage.

The core project is intentionally small: users manually enter old or current PS game price data, then use a table and keyword search to observe price changes as a player-oriented entertainment spending record. The data is not official CPI and does not need advanced analytics for the MVP.

## Goals / Non-Goals

**Goals:**

- Provide an Express.js server with the required API endpoints.
- Store records in SQLite so user-entered data survives page refreshes and server restarts.
- Use a single `game_prices` table with the requested fields.
- Provide a static frontend with a form, table, delete action, keyword search, and basic validation.
- Use `fetch` from browser JavaScript to call the backend API.
- Keep the implementation understandable for a final project and easy to explain in documentation.

**Non-Goals:**

- Do not build an official CPI calculation system.
- Do not require user accounts or authentication.
- Do not implement edit/update behavior in the MVP.
- Do not use frontend frameworks.
- Do not treat crawling as a basic feature.
- Do not use PlayStation internal APIs.
- Do not perform high-volume automated requests to PlayStation Store Taiwan.

## Decisions

### Use a single SQLite table

The project will use one table named `game_prices` with these columns:

- `id`
- `release_date`
- `record_date`
- `game_name`
- `platform`
- `edition`
- `price`
- `source`
- `data_type`
- `note`
- `created_at`

Rationale: a single table is easier to implement, explain, and inspect for a final project. A normalized `games` and `price_records` split would be more flexible, but it adds joins and extra UI/API decisions that are not required by the assignment.

### Use Express API endpoints as the only data access path

The frontend will not access SQLite directly. Browser JavaScript will call:

- `GET /api/health`
- `GET /api/prices`
- `GET /api/prices?keyword=`
- `POST /api/prices`
- `DELETE /api/prices/:id`

Rationale: this keeps a clear frontend/backend boundary and demonstrates Express.js Web API usage.

### Keep keyword search simple

`GET /api/prices?keyword=` will filter by `game_name` using a case-insensitive partial match. Empty, blank, or missing `keyword` will return all records.

Rationale: the assignment asks for simple querying, and game-name search is the clearest query path for this topic.

### Validate required fields on both frontend and backend

The frontend will prevent obvious invalid submissions before sending data. The backend will still validate incoming requests before inserting into SQLite.

Required fields for creation:

- `record_date`
- `game_name`
- `platform`
- `price`

Optional fields for creation:

- `release_date`
- `edition`
- `source`
- `note`

`price` must be numeric, greater than 0, and an integer. Decimal prices such as `1990.5` are rejected. Date fields use HTML `input type="date"` on the frontend and are stored as `YYYY-MM-DD`; `record_date` is required and `release_date` is optional, but any provided date must use this format.

The user does not manually enter `data_type`. For manually created records, the backend sets `data_type = manual`. For crawler-imported records, the backend sets `data_type = crawler`. The frontend table may display `data_type`, but the creation form does not include a `data_type` input.

Rationale: frontend validation improves user experience, while backend validation protects the API from invalid requests.

### Use controlled data type values

`data_type` only allows `manual` or `crawler`.

Rationale: the field is system-controlled and should clearly identify whether a record came from manual user input or the optional crawler.

### Use source as optional text

`source` is an optional text input. The frontend placeholder may suggest `PlayStation Store Taiwan`, but the user is not required to choose from a fixed source list.

Rationale: text input keeps the MVP simple while still letting users describe where the price came from.

### Treat crawler as optional and isolated

The optional `POST /api/crawl/ps-store` endpoint may be implemented after the core MVP. It must only fetch a small amount of public PlayStation Store Taiwan new-release data, must not use PlayStation internal APIs, and must avoid large-volume requests.

For demo purposes, the optional crawler should import at most 3 to 5 public records.

Rationale: crawling is useful as a bonus, but it is less stable than manual input and should not block the required assignment features.

## Risks / Trade-offs

- SQLite schema is simple but less normalized -> acceptable for MVP; avoid duplicate complexity by keeping records self-contained.
- Manual data entry can contain inconsistent game names -> mitigate with keyword search and clear frontend labels.
- Search limited to `game_name` may be basic -> acceptable because the assignment requires simple querying.
- Optional crawler may break if PlayStation Store markup changes -> keep it optional and separate from core functionality.
- Network requests to PlayStation Store could be excessive if implemented carelessly -> limit crawler scope to a small number of public records and avoid repeated/high-volume requests.
- Frontend and backend validation can drift -> define the same required fields and `price > 0` rule in implementation and test manually with valid and invalid submissions.

## Migration Plan

1. Create the Express server and health endpoint.
2. Add SQLite setup and create the `game_prices` table if it does not exist.
3. Add the core API endpoints.
4. Add the static frontend and connect it to the API with `fetch`.
5. Verify data persists after page refresh.
6. Implement the optional crawler only after the core MVP works.

Rollback is simple during development: stop the server, remove or rename the local SQLite database file, and restart with the table creation logic.

## Additional Decisions

- `source` uses a text input field, and the placeholder may suggest `PlayStation Store Taiwan`.
- `data_type` only allows `manual` and `crawler`.
- Date fields use HTML `input type="date"` and are stored as `YYYY-MM-DD`.
- The optional crawler may fetch at most 3 to 5 public PlayStation Store Taiwan records for demo use.
