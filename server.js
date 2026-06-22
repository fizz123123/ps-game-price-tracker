const express = require('express');
const path = require('path');
const db = require('./database');
const { importLatestPsStorePrices } = require('./crawler');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API is available' });
});

app.get('/api/prices', (req, res) => {
  const keyword = (req.query.keyword || '').trim();

  if (!keyword) {
    db.all('SELECT * FROM game_prices ORDER BY created_at DESC, id DESC', [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Failed to load price records' });
        return;
      }

      res.json(rows);
    });
    return;
  }

  db.all(
    `SELECT * FROM game_prices
     WHERE LOWER(game_name) LIKE LOWER(?)
     ORDER BY created_at DESC, id DESC`,
    [`%${keyword}%`],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Failed to search price records' });
        return;
      }

      res.json(rows);
    }
  );
});

function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

function isDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizePricePayload(body) {
  const {
    release_date,
    record_date,
    game_name,
    platform,
    edition,
    price,
    source,
    note,
  } = body;

  const normalizedRecordDate = record_date === undefined || record_date === null
    ? ''
    : String(record_date).trim();
  const normalizedGameName = game_name === undefined || game_name === null
    ? ''
    : String(game_name).trim();
  const normalizedPlatform = platform === undefined || platform === null
    ? ''
    : String(platform).trim();
  const normalizedReleaseDate = normalizeOptionalText(release_date);
  const normalizedEdition = normalizeOptionalText(edition);
  const normalizedSource = normalizeOptionalText(source);
  const normalizedNote = normalizeOptionalText(note);

  const requiredFields = {
    record_date: normalizedRecordDate,
    game_name: normalizedGameName,
    platform: normalizedPlatform,
    price,
  };
  const missingFields = Object.entries(requiredFields)
    .filter(([, value]) => value === undefined || value === null || String(value).trim() === '')
    .map(([field]) => field);

  const numericPrice = Number(price);

  if (missingFields.length > 0) {
    return { error: `Missing required fields: ${missingFields.join(', ')}` };
  }

  if (!Number.isFinite(numericPrice) || numericPrice <= 0 || !Number.isInteger(numericPrice)) {
    return { error: 'Price must be an integer greater than 0' };
  }

  if (!isDateString(normalizedRecordDate)) {
    return { error: 'record_date must use YYYY-MM-DD format' };
  }

  if (normalizedReleaseDate && !isDateString(normalizedReleaseDate)) {
    return { error: 'release_date must use YYYY-MM-DD format' };
  }

  return {
    data: {
      release_date: normalizedReleaseDate,
      record_date: normalizedRecordDate,
      game_name: normalizedGameName,
      platform: normalizedPlatform,
      edition: normalizedEdition,
      price: numericPrice,
      source: normalizedSource,
      note: normalizedNote,
    },
  };
}

app.post('/api/prices', (req, res) => {
  const normalized = normalizePricePayload(req.body);

  if (normalized.error) {
    res.status(400).json({ error: normalized.error });
    return;
  }

  const record = normalized.data;
  const sql = `
    INSERT INTO game_prices (
      release_date,
      record_date,
      game_name,
      platform,
      edition,
      price,
      source,
      data_type,
      note
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 'manual', ?)
  `;

  const params = [
    record.release_date,
    record.record_date,
    record.game_name,
    record.platform,
    record.edition,
    record.price,
    record.source,
    record.note,
  ];

  db.run(sql, params, function insertRecord(err) {
    if (err) {
      res.status(500).json({ error: 'Failed to create price record' });
      return;
    }

    db.get('SELECT * FROM game_prices WHERE id = ?', [this.lastID], (selectErr, row) => {
      if (selectErr) {
        res.status(500).json({ error: 'Price record was created but could not be loaded' });
        return;
      }

      res.status(201).json(row);
    });
  });
});

app.put('/api/prices/:id', (req, res) => {
  const normalized = normalizePricePayload(req.body);

  if (normalized.error) {
    res.status(400).json({ error: normalized.error });
    return;
  }

  const record = normalized.data;
  const sql = `
    UPDATE game_prices
    SET
      release_date = ?,
      record_date = ?,
      game_name = ?,
      platform = ?,
      edition = ?,
      price = ?,
      source = ?,
      note = ?
    WHERE id = ?
  `;

  const params = [
    record.release_date,
    record.record_date,
    record.game_name,
    record.platform,
    record.edition,
    record.price,
    record.source,
    record.note,
    req.params.id,
  ];

  db.run(sql, params, function updateRecord(err) {
    if (err) {
      res.status(500).json({ error: 'Failed to update price record' });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Price record not found' });
      return;
    }

    db.get('SELECT * FROM game_prices WHERE id = ?', [req.params.id], (selectErr, row) => {
      if (selectErr) {
        res.status(500).json({ error: 'Price record was updated but could not be loaded' });
        return;
      }

      res.json(row);
    });
  });
});

app.delete('/api/prices/:id', (req, res) => {
  db.run('DELETE FROM game_prices WHERE id = ?', [req.params.id], function deleteRecord(err) {
    if (err) {
      res.status(500).json({ error: 'Failed to delete price record' });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Price record not found' });
      return;
    }

    res.status(204).send();
  });
});

app.post('/api/crawl/ps-store', async (req, res) => {
  try {
    const result = await importLatestPsStorePrices();
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: 'Failed to import PlayStation Store Taiwan prices' });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`PS launch price tracker running at http://${HOST}:${PORT}`);
});
