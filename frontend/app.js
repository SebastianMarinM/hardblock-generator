const form = document.querySelector('#hardblock-form');
const message = document.querySelector('#message');
const progressOutput = document.querySelector('#progress-output');
const completedOutput = document.querySelector('#completed-output');
const historyBody = document.querySelector('#history-body');

const fields = [
  'airline',
  'ato',
  'rooms',
  'pax',
  'nights',
  'motivo',
  'hotel',
  'prioridad',
  'status',
  'booking_source',
  'meals',
  'payment',
];

function valueOrDash(value) {
  const cleanValue = String(value || '').trim();
  return cleanValue || '-';
}

function collectFormData() {
  return fields.reduce((payload, field) => {
    payload[field] = document.querySelector(`#${field}`).value.trim();
    return payload;
  }, {});
}

function renderBlock(data, completed) {
  const fixedValue = 'En curso';
  const title = completed ? 'Hardblock Completed' : 'Hardblock en curso';
  const hotel = completed ? valueOrDash(data.hotel) : fixedValue;
  const prioridad = completed ? valueOrDash(data.prioridad) : fixedValue;
  const status = completed ? valueOrDash(data.status) : fixedValue;
  const bookingSource = completed ? valueOrDash(data.booking_source) : fixedValue;
  const meals = completed ? valueOrDash(data.meals) : fixedValue;
  const payment = completed ? valueOrDash(data.payment) : fixedValue;

  return [
    title,
    `Airline: ${valueOrDash(data.airline)}`,
    `ATO: ${valueOrDash(data.ato)}`,
    `Rooms: ${valueOrDash(data.rooms)}`,
    `PAX: ${valueOrDash(data.pax)}`,
    `Nights: ${valueOrDash(data.nights)}`,
    `Motivo: ${valueOrDash(data.motivo)}`,
    `Hotel: ${hotel}`,
    `Prioridad: ${prioridad}`,
    `Status: ${status}`,
    `Booking source: ${bookingSource}`,
    `Meals: ${meals}`,
    `Payment: ${payment}`,
  ].join('\n');
}

function updateOutputs() {
  const data = collectFormData();
  progressOutput.value = renderBlock(data, false);
  completedOutput.value = renderBlock(data, true);
}

async function copyText(text, successMessage) {
  await navigator.clipboard.writeText(text);
  showMessage(successMessage);
}

function showMessage(text) {
  message.textContent = text;
  window.clearTimeout(showMessage.timer);
  showMessage.timer = window.setTimeout(() => {
    message.textContent = '';
  }, 3200);
}

async function saveRequest() {
  const response = await fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(collectFormData()),
  });

  if (!response.ok) {
    throw new Error('No se pudo guardar la solicitud.');
  }

  const saved = await response.json();
  showMessage(`Solicitud #${saved.id} guardada correctamente.`);
  await loadHistory();
}

function formatDate(value) {
  if (!value) {
    return '-';
  }
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderHistory(rows) {
  if (!rows.length) {
    historyBody.innerHTML = '<tr><td colspan="8">Sin solicitudes guardadas.</td></tr>';
    return;
  }

  historyBody.innerHTML = rows.map((row) => `
    <tr>
      <td>${escapeHtml(formatDate(row.created_at))}</td>
      <td>${escapeHtml(valueOrDash(row.airline))}</td>
      <td>${escapeHtml(valueOrDash(row.ato))}</td>
      <td>${escapeHtml(valueOrDash(row.rooms))}</td>
      <td>${escapeHtml(valueOrDash(row.pax))}</td>
      <td>${escapeHtml(valueOrDash(row.nights))}</td>
      <td>${escapeHtml(valueOrDash(row.hotel))}</td>
      <td>${escapeHtml(valueOrDash(row.status))}</td>
    </tr>
  `).join('');
}

async function loadHistory() {
  const response = await fetch('/api/requests');

  if (!response.ok) {
    throw new Error('No se pudo cargar el historial.');
  }

  renderHistory(await response.json());
}

form.addEventListener('input', updateOutputs);
form.addEventListener('change', updateOutputs);

document.querySelector('#copy-progress').addEventListener('click', () => {
  copyText(progressOutput.value, 'Hardblock en curso copiado.');
});

document.querySelector('#copy-completed').addEventListener('click', () => {
  copyText(completedOutput.value, 'Hardblock Completed copiado.');
});

document.querySelector('#clear-form').addEventListener('click', () => {
  form.reset();
  updateOutputs();
  showMessage('Formulario limpio.');
});

document.querySelector('#save-request').addEventListener('click', async () => {
  try {
    await saveRequest();
  } catch (error) {
    showMessage(error.message);
  }
});

document.querySelector('#refresh-history').addEventListener('click', async () => {
  try {
    await loadHistory();
    showMessage('Historial actualizado.');
  } catch (error) {
    showMessage(error.message);
  }
});

updateOutputs();
loadHistory().catch(() => showMessage('No se pudo cargar el historial.'));
