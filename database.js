const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'prices.db');
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
