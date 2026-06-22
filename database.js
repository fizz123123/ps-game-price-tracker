const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const isAzure = Boolean(process.env.WEBSITE_SITE_NAME);
const azureDataDir = '/home/data';
const dbPath = isAzure
  ? path.join(azureDataDir, 'prices.db')
  : path.join(__dirname, 'prices.db');

if (isAzure && !fs.existsSync(azureDataDir)) {
  fs.mkdirSync(azureDataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS game_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      release_date TEXT,
      record_date TEXT NOT NULL,
      game_name TEXT NOT NULL,
      platform TEXT NOT NULL,
      edition TEXT,
      price INTEGER NOT NULL,
      source TEXT,
      data_type TEXT NOT NULL CHECK (data_type IN ('manual', 'crawler')),
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
});

module.exports = db;
