## Why

This change creates the OpenSpec plan for "PS首發價格追蹤", a Web programming final project for recording and browsing PS game price data. The subtitle is "從 PlayStation 遊戲上市價格，觀察玩家娛樂消費的變化。"

The project focuses on PlayStation games because digital and physical games are common entertainment expenses for student players. Although game prices are not daily necessities like meals or drinks, a new PS game often costs more than one thousand NT dollars, so launch prices can still affect a student's purchase decision and personal spending pressure.

This project uses the idea of a personal CPI to observe the price changes of products that the user personally cares about. It does not treat the data as official CPI, but as a player-oriented price observation record.

## What Changes

- Add a basic PS game launch price tracker that lets users manually create price records with date, game name, and price.
- Persist price records in SQLite so data remains after page refreshes.
- Provide Express.js API endpoints for listing, keyword searching, creating, deleting, and health checking.
- Build a plain HTML, CSS, and JavaScript frontend that uses `fetch` to call the API.
- Show all price records in a frontend table and allow keyword search by game name.
- Track the required fields: `id`, `release_date`, `record_date`, `game_name`, `platform`, `edition`, `price`, `source`, `data_type`, `note`, and `created_at`.
- Keep PlayStation Store Taiwan crawling as an optional enhancement only.
- Do not use PlayStation internal APIs and do not perform large-volume requests.

## Capabilities

### New Capabilities

- `game-price-tracker`: Covers manual PS game price record creation, SQLite persistence, API-based listing/search/deletion, frontend table display, basic validation, and an optional limited PlayStation Store Taiwan crawler endpoint.

### Modified Capabilities

- None.

## Impact

- Adds an Express.js backend server.
- Adds a SQLite database connection module and a `game_prices` table.
- Adds REST-style API endpoints:
  - `GET /api/prices`
  - `GET /api/prices?keyword=`
  - `POST /api/prices`
  - `DELETE /api/prices/:id`
  - `GET /api/health`
- Adds an optional, non-core endpoint:
  - `POST /api/crawl/ps-store`
- Adds a static frontend built with HTML, CSS, and JavaScript.
- Adds client-side `fetch` integration between the frontend and backend API.
