# PS首發價格追蹤

從 PlayStation 遊戲上市價格，觀察玩家娛樂消費的變化

## 專題介紹

本專題是 Web 程式設計課程的期末作品，主題為:PS首發價格追蹤

使用者可以記錄 PlayStation 平台遊戲的首發價格或目前價格，並透過表格與搜尋功能觀察自己關心的遊戲價格變化。


## 功能介紹

### 基本功能

- 手動新增 PS 遊戲價格資料
- 查詢所有遊戲價格紀錄
- 依遊戲名稱關鍵字搜尋
- 刪除價格紀錄
- 使用 SQLite 儲存資料，重新整理頁面後資料仍會保留
- 前端使用表格呈現價格紀錄
- 前端透過 `fetch` 呼叫後端 API
- 從 PlayStation Store Taiwan 公開頁面匯入少量新上市遊戲價格
- 爬蟲資料會標記為 `crawler`
- 手動新增的資料會標記為 `manual`
- 避免重複匯入同一天、同遊戲名稱的爬蟲資料

## 使用技術

| 類別 | 技術 |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | SQLite |
| API 串接 | Fetch API |
| Crawler | Axios, Cheerio |
| Spec / SDD | OpenSpec |
| Version Control | Git, GitHub |

## 專案結構

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
│   ├── specs/
│   ├── changes/
│   └── archive/
├── .gitignore
└── README.md
```

## API 規格

| Method | Endpoint | 說明 |
|---|---|---|
| GET | `/api/health` | 檢查後端伺服器是否正常 |
| GET | `/api/prices` | 查詢所有價格紀錄 |
| GET | `/api/prices?keyword=` | 依遊戲名稱關鍵字搜尋 |
| POST | `/api/prices` | 新增一筆遊戲價格資料 |
| DELETE | `/api/prices/:id` | 刪除指定價格資料 |
| POST | `/api/crawl/ps-store` | 匯入 PS Store 新上市遊戲價格 |

## 資料表設計

本專題使用 SQLite，主要資料表為 `game_prices`。

| 欄位 | 說明 |
|---|---|
| `id` | 自動產生的資料 ID |
| `release_date` | 遊戲上市日期，可選填 |
| `record_date` | 價格紀錄日期 |
| `game_name` | 遊戲名稱 |
| `platform` | 平台，例如 PS5 / PS4 |
| `edition` | 版本，例如標準版、豪華版 |
| `price` | 遊戲價格 |
| `source` | 資料來源 |
| `data_type` | 資料類型，`manual` 或 `crawler` |
| `note` | 備註 |
| `created_at` | 建立時間 |

## 新增資料格式範例

```json
{
  "release_date": "2023-10-20",
  "record_date": "2026-06-17",
  "game_name": "Marvel's Spider-Man 2",
  "platform": "PS5",
  "edition": "標準版",
  "price": 1990,
  "source": "PlayStation Store Taiwan",
  "note": "測試資料"
}
```

手動新增資料時，後端會自動將 `data_type` 設為 `manual`。

## OpenSpec / SDD 開發紀錄

本專題使用 OpenSpec / SDD 的方式進行規格化開發。

主要流程：

1. 先定義專題目的與功能範圍
2. 撰寫 OpenSpec proposal、spec、design、tasks
3. 依照 tasks 分階段完成後端、資料庫、前端與爬蟲功能
4. 完成功能後進行驗收與 archive

相關文件位於：

```text
openspec/
```
