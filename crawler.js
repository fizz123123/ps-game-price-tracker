const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./database');

const LATEST_URL = 'https://store.playstation.com/zh-hant-tw/pages/latest';
const MAX_IMPORT_COUNT = 5;

function todayString() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function parsePrice(text) {
  const match = normalizeText(text).match(/NT\$\s*([\d,]+)/i);

  if (!match) {
    return null;
  }

  const price = Number(match[1].replace(/,/g, ''));
  return Number.isInteger(price) && price > 0 ? price : null;
}

function cleanName(text) {
  return normalizeText(text)
    .replace(/NT\$\s*[\d,]+/gi, ' ')
    .replace(/\bPS5\b|\bPS4\b|\bPS VR2\b/gi, ' ')
    .replace(/平台|版本|官方頁面價格|新增內容|新上市遊戲|最新|價格/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findNameFromCard($, card, priceText) {
  const attributeName = normalizeText(
    card.attr('aria-label')
      || card.attr('title')
      || card.find('[aria-label]').first().attr('aria-label')
      || card.find('[title]').first().attr('title')
  );

  if (attributeName && !/NT\$|免費/i.test(attributeName)) {
    return cleanName(attributeName);
  }

  const lines = card
    .text()
    .split(/\n+/)
    .map(normalizeText)
    .filter(Boolean)
    .filter((line) => line !== priceText)
    .filter((line) => !/NT\$|免費|PS5|PS4|平台|版本|加入購物車/i.test(line));

  return cleanName(lines[0] || '');
}

function extractRecords(html) {
  const $ = cheerio.load(html);
  const records = [];
  const seenNames = new Set();

  $('script, style, noscript').remove();

  $('a, article, li, div').each((_, element) => {
    if (records.length >= MAX_IMPORT_COUNT) {
      return false;
    }

    const card = $(element);
    const text = normalizeText(card.text());

    if (!text || text.length > 600 || !/NT\$/i.test(text) || /免費/.test(text)) {
      return undefined;
    }

    const price = parsePrice(text);

    if (!price) {
      return undefined;
    }

    const name = findNameFromCard($, card, `NT$${price.toLocaleString('en-US')}`);

    if (!name || name.length < 2 || seenNames.has(name)) {
      return undefined;
    }

    seenNames.add(name);
    records.push({
      game_name: name,
      price,
    });

    return undefined;
  });

  return records.slice(0, MAX_IMPORT_COUNT);
}

function getExistingCrawlerRecord(recordDate, gameName) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id FROM game_prices
       WHERE record_date = ? AND game_name = ? AND data_type = 'crawler'
       LIMIT 1`,
      [recordDate, gameName],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(row);
      }
    );
  });
}

function insertCrawlerRecord(recordDate, record) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO game_prices (
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
      VALUES (NULL, ?, ?, 'PS5', '官方頁面價格', ?, 'PlayStation Store Taiwan', 'crawler', '由爬蟲匯入的新上市遊戲價格')`,
      [recordDate, record.game_name, record.price],
      function onInsert(err) {
        if (err) {
          reject(err);
          return;
        }

        db.get('SELECT * FROM game_prices WHERE id = ?', [this.lastID], (selectErr, row) => {
          if (selectErr) {
            reject(selectErr);
            return;
          }

          resolve(row);
        });
      }
    );
  });
}

async function importLatestPsStorePrices() {
  const response = await axios.get(LATEST_URL, {
    timeout: 10000,
    headers: {
      'Accept-Language': 'zh-Hant-TW,zh;q=0.9,en;q=0.8',
      'User-Agent': 'ps-launch-price-tracker-course-project/1.0',
    },
  });

  const recordDate = todayString();
  const candidates = extractRecords(response.data);
  const records = [];
  let skippedCount = 0;

  for (const candidate of candidates) {
    const existing = await getExistingCrawlerRecord(recordDate, candidate.game_name);

    if (existing) {
      skippedCount += 1;
      continue;
    }

    const inserted = await insertCrawlerRecord(recordDate, candidate);
    records.push(inserted);
  }

  return {
    importedCount: records.length,
    skippedCount,
    records,
  };
}

module.exports = {
  importLatestPsStorePrices,
  extractRecords,
};
