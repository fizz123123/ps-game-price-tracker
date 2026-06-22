const form = document.querySelector('#price-form');
const tableBody = document.querySelector('#price-table-body');
const keywordInput = document.querySelector('#keyword');
const crawlButton = document.querySelector('#crawl-button');
const chartCanvas = document.querySelector('#price-trend-chart');
const formTitle = document.querySelector('#form-title');
const submitButton = document.querySelector('#submit-button');
const cancelEditButton = document.querySelector('#cancel-edit-button');
const formMessage = document.querySelector('#form-message');
const tableMessage = document.querySelector('#table-message');
const chartMessage = document.querySelector('#chart-message');
let priceTrendChart = null;
let editingRecordId = null;

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
  if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(price)) {
    return '價格必須是大於 0 的整數';
  }

  return '';
}

function formatValue(value) {
  return value === null || value === undefined || value === '' ? '-' : value;
}

function setFormMode(record = null) {
  editingRecordId = record ? record.id : null;
  formTitle.textContent = record ? `編輯價格資料 #${record.id}` : '新增價格資料';
  submitButton.textContent = record ? '儲存修改' : '新增資料';
  cancelEditButton.hidden = !record;
}

function setFieldValue(name, value) {
  form.elements[name].value = value ?? '';
}

function fillFormForEdit(record) {
  setFieldValue('release_date', record.release_date);
  setFieldValue('record_date', record.record_date);
  setFieldValue('game_name', record.game_name);
  setFieldValue('platform', record.platform);
  setFieldValue('edition', record.edition);
  setFieldValue('price', record.price);
  setFieldValue('source', record.source);
  setFieldValue('note', record.note);
  setFormMode(record);
  setMessage(formMessage, `正在編輯 #${record.id}：${record.game_name}`);
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetFormMode() {
  form.reset();
  setFormMode();
  setMessage(formMessage, '');
}

function getFormPayload() {
  return {
    release_date: getFormValue('release_date'),
    record_date: getFormValue('record_date'),
    game_name: getFormValue('game_name'),
    platform: getFormValue('platform'),
    edition: getFormValue('edition'),
    price: Number(getFormValue('price')),
    source: getFormValue('source'),
    note: getFormValue('note'),
  };
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
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'secondary';
    editButton.textContent = '編輯';
    editButton.addEventListener('click', () => fillFormForEdit(record));

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'danger';
    deleteButton.textContent = '刪除';
    deleteButton.addEventListener('click', () => deleteRecord(record.id));

    actionCell.className = 'row-actions';
    actionCell.appendChild(editButton);
    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  });
}

function getTrendRecords(records) {
  return records
    .filter((record) => record.release_date && Number.isFinite(Number(record.price)))
    .map((record) => ({
      ...record,
      price: Number(record.price),
    }))
    .sort((a, b) => a.release_date.localeCompare(b.release_date));
}

function getPriceAxisMinimum(prices) {
  const axisStep = 50;
  const lowestPrice = Math.min(...prices);

  return Math.floor(lowestPrice / axisStep) * axisStep;
}

function renderPriceTrendChart(records) {
  const trendRecords = getTrendRecords(records);

  if (!window.Chart) {
    setMessage(chartMessage, 'Chart.js 載入失敗，無法顯示折線圖', 'error');
    return;
  }

  if (trendRecords.length === 0) {
    if (priceTrendChart) {
      priceTrendChart.destroy();
      priceTrendChart = null;
    }
    setMessage(chartMessage, '目前沒有包含上市日期與價格的資料可繪製折線圖');
    return;
  }

  const labels = trendRecords.map((record) => record.release_date);
  const prices = trendRecords.map((record) => record.price);
  const yAxisMinimum = getPriceAxisMinimum(prices);

  if (priceTrendChart) {
    priceTrendChart.destroy();
  }

  priceTrendChart = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '首發價格',
          data: prices,
          borderColor: '#1f6feb',
          backgroundColor: 'rgba(31, 111, 235, 0.12)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.25,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            title(items) {
              const record = trendRecords[items[0].dataIndex];
              return record.game_name;
            },
            label(item) {
              const record = trendRecords[item.dataIndex];
              return [
                `平台：${formatValue(record.platform)}`,
                `發售日：${record.release_date}`,
                `價格：NT$${record.price}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: '發售日',
          },
        },
        y: {
          min: yAxisMinimum,
          title: {
            display: true,
            text: '價格（NT$）',
          },
          ticks: {
            precision: 0,
            stepSize: 50,
          },
        },
      },
    },
  });

  setMessage(chartMessage, `已繪製 ${trendRecords.length} 筆有上市日期的價格資料`, 'success');
}

async function loadChartRecords() {
  try {
    const response = await fetch('/api/prices');

    if (!response.ok) {
      throw new Error('折線圖資料載入失敗');
    }

    const records = await response.json();
    renderPriceTrendChart(records);
  } catch (error) {
    setMessage(chartMessage, error.message || '折線圖資料載入失敗', 'error');
  }
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

async function saveRecord(event) {
  event.preventDefault();
  setMessage(formMessage, '');

  const validationError = validateForm();
  if (validationError) {
    setMessage(formMessage, validationError, 'error');
    return;
  }

  const payload = getFormPayload();
  const isEditing = editingRecordId !== null;
  const url = isEditing ? `/api/prices/${editingRecordId}` : '/api/prices';
  const method = isEditing ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = response.status === 204 ? null : await response.json();

    if (!response.ok) {
      throw new Error(result?.error || (isEditing ? '修改資料失敗' : '新增資料失敗'));
    }

    form.reset();
    setFormMode();
    setMessage(formMessage, isEditing ? '修改成功' : '新增成功', 'success');
    await loadRecords();
    await loadChartRecords();
  } catch (error) {
    setMessage(formMessage, error.message || (isEditing ? '修改資料失敗' : '新增資料失敗'), 'error');
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
    if (editingRecordId === id) {
      resetFormMode();
    }
    await loadRecords();
    await loadChartRecords();
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
    await loadChartRecords();
  } catch (error) {
    setMessage(tableMessage, error.message || '匯入失敗', 'error');
  } finally {
    crawlButton.disabled = false;
  }
}

form.addEventListener('submit', saveRecord);
cancelEditButton.addEventListener('click', resetFormMode);
keywordInput.addEventListener('input', loadRecords);
crawlButton.addEventListener('click', importPsStoreRecords);

loadRecords();
loadChartRecords();
