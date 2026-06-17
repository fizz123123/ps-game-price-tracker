## Title

PS首發價格追蹤

## Purpose

從 PlayStation 遊戲上市價格，觀察玩家娛樂消費的變化。

本系統使用個人化 CPI 的概念，記錄使用者關心的 PS 遊戲首發價格與價格紀錄。這些資料不是官方 CPI，而是用來觀察玩家角度的娛樂消費變化。

## ADDED Requirements

### Requirement: Health check endpoint

The system SHALL provide a health check API endpoint for confirming that the Express server is running.

#### Scenario: Health check succeeds

* **WHEN** a client sends `GET /api/health`
* **THEN** the system MUST return a successful response indicating the API is available

### Requirement: Price records are persisted

The system SHALL store PS game price records in SQLite using a `game_prices` table.

#### Scenario: Record remains after refresh

* **WHEN** a user creates a valid price record and then refreshes the page
* **THEN** the created record MUST still appear in the price records list

### Requirement: User can create a price record

The system SHALL allow a user to manually create one PS game price record with `release_date`, `record_date`, `game_name`, `platform`, `edition`, `price`, `source`, and optional `note`.

The required fields are:

* `record_date`
* `game_name`
* `platform`
* `price`

The optional fields are:

* `release_date`
* `edition`
* `source`
* `note`

The user MUST NOT manually enter `data_type`. For manually created records, the backend MUST set `data_type` to `manual`. For future crawler-created records, the crawler import flow MUST set `data_type` to `crawler`.

#### Scenario: Valid record is created

* **WHEN** a user submits the price form with all required fields, valid dates, and a numeric integer price greater than 0
* **THEN** the system MUST save the record with an auto-generated `id`, `created_at` timestamp, and `data_type` value of `manual`

#### Scenario: Invalid record is rejected

* **WHEN** a user submits the price form with missing required fields or an invalid price
* **THEN** the system MUST reject the request and show or return an error message

### Requirement: User can view all price records

The system SHALL allow a user to view all stored PS game price records.

#### Scenario: Records are listed

* **WHEN** a client sends `GET /api/prices` without a keyword
* **THEN** the system MUST return all stored price records

### Requirement: User can search records by game name

The system SHALL allow a user to search price records by game name keyword.

The keyword search SHOULD be case-insensitive.

#### Scenario: Keyword filters records

* **WHEN** a client sends `GET /api/prices?keyword=` with a non-empty keyword
* **THEN** the system MUST return only records whose `game_name` contains the keyword

#### Scenario: Empty keyword returns all records

* **WHEN** a client sends `GET /api/prices?keyword=` with an empty keyword
* **THEN** the system MUST return all stored price records

### Requirement: User can delete a price record

The system SHALL allow a user to delete a stored PS game price record by id.

#### Scenario: Existing record is deleted

* **WHEN** a client sends `DELETE /api/prices/:id` for an existing record id
* **THEN** the system MUST remove that record from SQLite and return `204 No Content`

#### Scenario: Missing record delete is handled

* **WHEN** a client sends `DELETE /api/prices/:id` for a record id that does not exist
* **THEN** the system MUST return `404 Not Found`

### Requirement: Frontend uses plain web technologies

The system SHALL provide a frontend implemented with HTML, CSS, and JavaScript without a frontend framework.

#### Scenario: Browser loads tracker UI

* **WHEN** a user opens the site in a browser
* **THEN** the system MUST show a price entry form, a search input, and a table for price records

### Requirement: Frontend communicates through fetch

The frontend SHALL use browser `fetch` calls to communicate with the Express API.

#### Scenario: Form submission calls API

* **WHEN** a user submits a valid price record from the frontend form
* **THEN** the frontend MUST send the record data to `POST /api/prices` using `fetch`

#### Scenario: Search calls API

* **WHEN** a user enters a game name keyword
* **THEN** the frontend MUST request matching records from `GET /api/prices?keyword=`

### Requirement: Price records are displayed in a table

The system SHALL display price records in a table or table-like list on the frontend.

#### Scenario: Table shows record fields

* **WHEN** price records are loaded
* **THEN** the frontend MUST display the record fields including release date, record date, game name, platform, edition, price, source, data type, note, and created time

### Requirement: Optional PlayStation Store Taiwan crawler

The system MAY provide an optional `POST /api/crawl/ps-store` endpoint after the core MVP is complete.

The crawler is an optional enhancement only. It MUST NOT be required for the core manual price tracking features.

#### Scenario: Optional crawler uses limited public data

* **WHEN** the optional crawler endpoint is implemented and called
* **THEN** the system MUST only fetch a small amount of public PlayStation Store Taiwan new-release data without using PlayStation internal APIs or large-volume requests
