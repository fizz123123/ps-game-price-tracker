const form = document.querySelector('#price-form');
const tableBody = document.querySelector('#price-table-body');
const keywordInput = document.querySelector('#keyword');
const crawlButton = document.querySelector('#crawl-button');
const formMessage = document.querySelector('#form-message');
const tableMessage = document.querySelector('#table-message');

function setMessage(element, text, type = '') {
  element.textContent = text;
  element.className = `message ${type}`.trim();
}

function getFormValue(name) {
  return form.elements[name].value.trim();
}

function validateForm() {
  const requiredFields = [
    ['record_date', '記錄日期'],
    ['game_name', '遊戲名稱'],
    ['platform', '平台'],
    ['price', '價格'],
  ];

  const missing = requiredFields
    .filter(([name]) => !getFormValue(name))
    .map(([, label]) => label);

  if (missing.length > 0) {
    return `請填寫必填欄位：${missing.join('、')}`;
  }

  const price = Number(getFormValue('price'));
  if (!Number.isFinite(price) || price <= 0) {
    return '價格必須是大於 0 的數字';
  }

  return '';
}

function formatValue(value) {
  return value === null || value === undefined || value === '' ? '-' : value;
}

function renderRows(records) {
  tableBody.innerHTML = '';

  if (records.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 12;
    cell.className = 'empty';
    cell.textContent = '沒有符合條件的資料';
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  records.forEach((record) => {
    const row = document.createElement('tr');
    const values = [
      record.id,
      record.release_date,
      record.record_date,
      record.game_name,
      record.platform,
      record.edition,
      record.price,
      record.source,
      record.data_type,
      record.note,
      record.created_at,
    ];

    values.forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = formatValue(value);
      row.appendChild(cell);
    });

    const actionCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'danger';
    deleteButton.textContent = '刪除';
    deleteButton.addEventListener('click', () => deleteRecord(record.id));
    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  });
}

async function loadRecords() {
  const keyword = keywordInput.value.trim();
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';

  try {
    setMessage(tableMessage, '載入資料中...');
    const response = await fetch(`/api/prices${query}`);

    if (!response.ok) {
      throw new Error('資料載入失敗');
    }

    const records = await response.json();
    renderRows(records);
    setMessage(tableMessage, keyword ? `搜尋完成：${records.length} 筆資料` : `共 ${records.length} 筆資料`);
  } catch (error) {
    renderRows([]);
    setMessage(tableMessage, error.message || '資料載入失敗', 'error');
  }
}

async function createRecord(event) {
  event.preventDefault();
  setMessage(formMessage, '');

  const validationError = validateForm();
  if (validationError) {
    setMessage(formMessage, validationError, 'error');
    return;
  }

  const payload = {
    release_date: getFormValue('release_date'),
    record_date: getFormValue('record_date'),
    game_name: getFormValue('game_name'),
    platform: getFormValue('platform'),
    edition: getFormValue('edition'),
    price: Number(getFormValue('price')),
    source: getFormValue('source'),
    note: getFormValue('note'),
  };

  try {
    const response = await fetch('/api/prices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = response.status === 204 ? null : await response.json();

    if (!response.ok) {
      throw new Error(result?.error || '新增資料失敗');
    }

    form.reset();
    setMessage(formMessage, '新增成功', 'success');
    await loadRecords();
  } catch (error) {
    setMessage(formMessage, error.message || '新增資料失敗', 'error');
  }
}

async function deleteRecord(id) {
  try {
    setMessage(tableMessage, '刪除資料中...');
    const response = await fetch(`/api/prices/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result?.error || '刪除資料失敗');
    }

    setMessage(tableMessage, '刪除成功', 'success');
    await loadRecords();
  } catch (error) {
    setMessage(tableMessage, error.message || '刪除資料失敗', 'error');
  }
}

async function importPsStoreRecords() {
  try {
    crawlButton.disabled = true;
    setMessage(tableMessage, '匯入 PS Store 新上市遊戲中...');

    const response = await fetch('/api/crawl/ps-store', {
      method: 'POST',
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error || '匯入失敗');
    }

    setMessage(
      tableMessage,
      `匯入完成：新增 ${result.importedCount} 筆，略過 ${result.skippedCount} 筆`,
      'success'
    );
    await loadRecords();
  } catch (error) {
    setMessage(tableMessage, error.message || '匯入失敗', 'error');
  } finally {
    crawlButton.disabled = false;
  }
}

form.addEventListener('submit', createRecord);
keywordInput.addEventListener('input', loadRecords);
crawlButton.addEventListener('click', importPsStoreRecords);

loadRecords();
