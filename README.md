# PS首發價格追蹤

從 PlayStation 遊戲上市價格，觀察玩家娛樂消費的變化。

PS首發價格追蹤是一個簡單的遊戲價格紀錄網站。使用者可以記錄 PlayStation 遊戲的上市日期、紀錄日期、平台、版本、價格與資料來源，並透過表格搜尋與折線圖觀察不同遊戲之間的首發價格變化。

這個專案以「玩家角度的娛樂消費觀測」為核心，不是官方 CPI，也不追求完整市場統計，而是用輕量的方式保存與比較自己關心的遊戲價格資料。

## Features

- 新增、編輯、刪除 PS 遊戲價格紀錄
- 依遊戲名稱關鍵字搜尋資料
- 使用 SQLite 保存資料
- 以表格呈現完整價格紀錄
- 以 Chart.js 折線圖呈現有上市日期資料的價格趨勢
- 手動新增資料時由後端標記為 `manual`
- 可選擇從 PlayStation Store Taiwan 公開頁面匯入少量新上市遊戲價格
- 爬蟲匯入資料會標記為 `crawler`，並避免同一天同遊戲重複匯入

## Tech Stack

| Part | Tech |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Chart | Chart.js |
| Backend | Node.js, Express.js |
| Database | SQLite |
| API | Fetch API |
| Crawler | Axios, Cheerio |
| Spec / SDD | OpenSpec |

## Project Structure

```text
ps-game-price-tracker/
├── server.js
├── database.js
├── crawler.js
├── package.json
├── package-lock.json
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── openspec/
└── README.md
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Open the app:

```text
http://localhost:3000
```

## Azure App Service

The app can run on Azure App Service F1 with the existing `npm start` command.

- Azure provides the runtime port through `process.env.PORT`.
- When `WEBSITE_SITE_NAME` is present, SQLite data is stored at `/home/data/prices.db`.
- Local development continues to use the project-level `prices.db`.
- `node_modules/`, local SQLite database files, and `.env` should stay out of Git.

This setup keeps the project on SQLite for a small demo/personal tracker. It does not add CI/CD or migrate data to a cloud database.

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API status |
| GET | `/api/prices` | Get all price records |
| GET | `/api/prices?keyword=` | Search records by game name |
| POST | `/api/prices` | Create a price record |
| PUT | `/api/prices/:id` | Update a price record |
| DELETE | `/api/prices/:id` | Delete a price record |
| POST | `/api/crawl/ps-store` | Import a few latest PS Store Taiwan records |

## Data Model

The main SQLite table is `game_prices`.

| Field | Description |
|---|---|
| `id` | Auto-generated record ID |
| `release_date` | Game release date, optional |
| `record_date` | Price record date |
| `game_name` | Game title |
| `platform` | Platform, such as PS5 or PS4 |
| `edition` | Edition name |
| `price` | Price in TWD |
| `source` | Data source |
| `data_type` | `manual` or `crawler` |
| `note` | Optional note |
| `created_at` | Created timestamp |

## Example Request

```json
{
  "release_date": "2023-10-20",
  "record_date": "2026-06-17",
  "game_name": "Marvel's Spider-Man 2",
  "platform": "PS5",
  "edition": "標準版",
  "price": 1990,
  "source": "PlayStation Store Taiwan",
  "note": "首發價格紀錄"
}
```

`data_type` is controlled by the backend. Manual records are saved as `manual`; crawler records are saved as `crawler`.

## Crawler Notes

The optional crawler imports a small number of publicly visible records from PlayStation Store Taiwan for demo use.

- It only reads public page content.
- It does not use PlayStation internal APIs.
- It does not call private endpoints such as `/chihiro-api/` or `/event/batch`.
- It limits each import to a small number of records.
- It skips records that cannot be parsed into a valid NT$ price.

## Development Notes

- OpenSpec files are kept in `openspec/`.
- `node_modules/` should not be committed.
- Local SQLite database files such as `prices.db` should not be committed.
