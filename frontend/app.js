const form = document.querySelector('#hardblock-form');
const gtForm = document.querySelector('#gt-form');
const message = document.querySelector('#message');
const progressOutput = document.querySelector('#progress-output');
const completedOutput = document.querySelector('#completed-output');
const progressTitle = document.querySelector('#progress-title');
const completedTitle = document.querySelector('#completed-title');
const historyBody = document.querySelector('#history-body');
const gtHistoryBody = document.querySelector('#gt-history-body');
const hotelPrioritiesBody = document.querySelector('#hotel-priorities-body');
const transportConfigsBody = document.querySelector('#transport-configs-body');
const hotelInput = document.querySelector('#hotel');
const priorityInput = document.querySelector('#prioridad');
const gtDestinoInput = document.querySelector('#gt-destino');
const gtPriorityInput = document.querySelector('#gt-priority');
const gtVehicleTypeInput = document.querySelector('#gt-vehicle_type');
const gtRateInput = document.querySelector('#gt-rate');

const fields = ['airline', 'ato', 'rooms', 'pax', 'nights', 'motivo', 'hotel', 'prioridad', 'status', 'booking_source', 'meals', 'payment'];
const gtFields = ['airline', 'ato', 'pax', 'motivo', 'origen', 'destino', 'route', 'vehicle_type', 'priority', 'rate', 'payment'];
let currentWorkflow = 'hotel';

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

function collectGtFormData() {
  return gtFields.reduce((payload, field) => {
    payload[field] = document.querySelector(`#gt-${field}`).value.trim();
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

function renderGtBlock(data, completed) {
  if (completed) {
    return [
      'Hard Block GT completed',
      '',
      `Airline: ${valueOrDash(data.airline)}`,
      `ATO: ${valueOrDash(data.ato)}`,
      `Pax: ${valueOrDash(data.pax)}`,
      `Motivo: ${valueOrDash(data.motivo)}`,
      'Status: Booked',
      `Origen: ${valueOrDash(data.origen)}`,
      `Destino: ${valueOrDash(data.destino)}`,
      `Route: ${valueOrDash(data.route)}`,
      `GT: ${valueOrDash(data.vehicle_type)}`,
      `Priority: ${valueOrDash(data.priority)}`,
      `Rate: ${valueOrDash(data.rate)}`,
      `Payment: ${valueOrDash(data.payment)}`,
      `Vehicle Type: ${valueOrDash(data.vehicle_type)}`,
    ].join('\n');
  }

  return [
    'Hard Block GT en curso',
    '',
    `Airline: ${valueOrDash(data.airline)}`,
    `ATO: ${valueOrDash(data.ato)}`,
    `Pax: ${valueOrDash(data.pax)}`,
    `Motivo: ${valueOrDash(data.motivo)}`,
    'Status: En curso',
    `Origen: ${valueOrDash(data.origen)}`,
    'Destino: HOTEL',
    `Route: ${valueOrDash(data.route)}`,
    'GT: En curso',
    'Priority: En curso',
    'Rate: En curso',
    'Payment: En curso',
  ].join('\n');
}

function updateOutputs() {
  if (currentWorkflow === 'gt') {
    const data = collectGtFormData();
    progressTitle.textContent = 'GT In Progress';
    completedTitle.textContent = 'GT Completed';
    progressOutput.value = renderGtBlock(data, false);
    completedOutput.value = renderGtBlock(data, true);
    return;
  }

  const data = collectFormData();
  progressTitle.textContent = 'Hardblock en curso';
  completedTitle.textContent = 'Hardblock Completed';
  progressOutput.value = renderBlock(data, false);
  completedOutput.value = renderBlock(data, true);
}

function setWorkflow(workflow) {
  currentWorkflow = workflow;
  document.querySelectorAll('[data-workflow-section]').forEach((section) => {
    section.classList.toggle('is-hidden', section.dataset.workflowSection !== workflow);
  });
  updateOutputs();
}

function debounce(callback, delay = 350) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), delay);
  };
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
  const data = collectFormData();
  if (data.prioridad && !isPositiveInteger(data.prioridad)) throw new Error('La prioridad debe ser un entero positivo (1, 2, 3, etc.).');
  const response = await fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('No se pudo guardar la solicitud.');
  const saved = await response.json();
  showMessage(`Solicitud #${saved.id} guardada correctamente.`);
  await loadHistory();
}

async function saveGtRequest() {
  const data = collectGtFormData();
  if (data.priority && !isPositiveInteger(data.priority)) throw new Error('Priority debe ser un entero positivo (1, 2, 3, etc.).');
  const response = await fetch('/api/gt/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('No se pudo guardar la solicitud GT.');
  const saved = await response.json();
  showMessage(`Solicitud GT #${saved.id} guardada correctamente.`);
  await loadGtHistory();
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('es', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function isPositiveInteger(value) {
  return /^[1-9]\d*$/.test(String(value || '').trim());
}

function numericPriorityInput(value) {
  return `<input class="editable admin-field" data-field="priority" type="number" min="1" step="1" inputmode="numeric" value="${escapeHtml(value || '')}">`;
}

async function searchHotelPriority() {
  const hotelName = hotelInput.value.trim();
  if (!hotelName) return;
  const response = await fetch(`/api/hotel-priorities/search?hotel_name=${encodeURIComponent(hotelName)}`);
  if (!response.ok) throw new Error('No se pudo buscar la prioridad del hotel.');
  const hotelPriority = await response.json();
  if (hotelPriority) {
    priorityInput.value = hotelPriority.priority;
    updateOutputs();
  }
}

async function searchTransportConfig() {
  const hotelName = gtDestinoInput.value.trim();
  if (!hotelName) return;
  const response = await fetch(`/api/transport-configs/search?hotel_name=${encodeURIComponent(hotelName)}`);
  if (!response.ok) throw new Error('No se pudo buscar la configuración de transporte.');
  const config = await response.json();
  if (config) {
    gtPriorityInput.value = config.priority;
    gtVehicleTypeInput.value = config.vehicle_type;
    gtRateInput.value = config.rate;
    updateOutputs();
  }
}

async function saveHotelPriority() {
  const hotelName = hotelInput.value.trim();
  const priority = priorityInput.value.trim();
  if (!hotelName || !isPositiveInteger(priority)) throw new Error('Ingresa hotel y una prioridad numérica positiva (1, 2, 3, etc.) para guardar.');
  const response = await fetch('/api/hotel-priorities', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hotel_name: hotelName, priority }),
  });
  if (!response.ok) throw new Error('No se pudo guardar la prioridad del hotel.');
  const saved = await response.json();
  showMessage(`Prioridad de ${saved.hotel_name} guardada correctamente.`);
  await loadHotelPriorities();
}

async function saveTransportConfig() {
  const hotelName = gtDestinoInput.value.trim();
  const priority = gtPriorityInput.value.trim();
  const vehicleType = gtVehicleTypeInput.value.trim();
  const rate = gtRateInput.value.trim();
  if (!hotelName || !isPositiveInteger(priority) || !vehicleType || !rate) throw new Error('Ingresa hotel, priority numérico positivo, vehicle type y rate para guardar.');
  const response = await fetch('/api/transport-configs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hotel_name: hotelName, priority, vehicle_type: vehicleType, rate }),
  });
  if (!response.ok) throw new Error('No se pudo guardar la configuración de transporte.');
  const saved = await response.json();
  showMessage(`Configuración GT de ${saved.hotel_name} guardada correctamente.`);
  await loadTransportConfigs();
}

function renderHotelPriorities(rows) {
  if (!rows.length) {
    hotelPrioritiesBody.innerHTML = '<tr><td colspan="4">Sin prioridades guardadas.</td></tr>';
    return;
  }
  hotelPrioritiesBody.innerHTML = rows.map((row) => `
    <tr data-hotel-priority-id="${row.id}">
      <td><input class="editable admin-field" data-field="hotel_name" type="text" value="${escapeHtml(row.hotel_name)}"></td>
      <td>${numericPriorityInput(row.priority)}</td>
      <td>${escapeHtml(formatDate(row.updated_at))}</td>
      <td class="row-actions"><button type="button" class="ghost" data-action="edit-hotel-priority">Guardar</button><button type="button" class="secondary" data-action="delete-hotel-priority">Eliminar</button></td>
    </tr>
  `).join('');
}

function renderTransportConfigs(rows) {
  if (!rows.length) {
    transportConfigsBody.innerHTML = '<tr><td colspan="6">Sin configuración guardada.</td></tr>';
    return;
  }
  transportConfigsBody.innerHTML = rows.map((row) => `
    <tr data-transport-config-id="${row.id}">
      <td><input class="editable admin-field" data-field="hotel_name" type="text" value="${escapeHtml(row.hotel_name)}"></td>
      <td>${numericPriorityInput(row.priority)}</td>
      <td><input class="editable admin-field" data-field="vehicle_type" type="text" value="${escapeHtml(row.vehicle_type)}"></td>
      <td><input class="editable admin-field" data-field="rate" type="text" value="${escapeHtml(row.rate)}"></td>
      <td>${escapeHtml(formatDate(row.updated_at))}</td>
      <td class="row-actions"><button type="button" class="ghost" data-action="edit-transport-config">Guardar</button><button type="button" class="secondary" data-action="delete-transport-config">Eliminar</button></td>
    </tr>
  `).join('');
}

async function loadHotelPriorities() {
  const response = await fetch('/api/hotel-priorities');
  if (!response.ok) throw new Error('No se pudo cargar la administración de prioridades.');
  renderHotelPriorities(await response.json());
}

async function loadTransportConfigs() {
  const response = await fetch('/api/transport-configs');
  if (!response.ok) throw new Error('No se pudo cargar la configuración de transporte.');
  renderTransportConfigs(await response.json());
}

async function updateHotelPriority(row) {
  const hotelPriorityId = row.dataset.hotelPriorityId;
  const hotelName = row.querySelector('[data-field="hotel_name"]').value.trim();
  const priority = row.querySelector('[data-field="priority"]').value.trim();
  if (!hotelName || !isPositiveInteger(priority)) throw new Error('Hotel y prioridad numérica positiva son obligatorios.');
  const response = await fetch(`/api/hotel-priorities/${hotelPriorityId}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hotel_name: hotelName, priority }),
  });
  if (!response.ok) throw new Error('No se pudo editar la prioridad del hotel.');
  showMessage('Prioridad de hotel actualizada.');
  await loadHotelPriorities();
}

async function updateTransportConfig(row) {
  const transportConfigId = row.dataset.transportConfigId;
  const hotelName = row.querySelector('[data-field="hotel_name"]').value.trim();
  const priority = row.querySelector('[data-field="priority"]').value.trim();
  const vehicleType = row.querySelector('[data-field="vehicle_type"]').value.trim();
  const rate = row.querySelector('[data-field="rate"]').value.trim();
  if (!hotelName || !isPositiveInteger(priority) || !vehicleType || !rate) throw new Error('Hotel, priority numérico positivo, vehicle type y rate son obligatorios.');
  const response = await fetch(`/api/transport-configs/${transportConfigId}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hotel_name: hotelName, priority, vehicle_type: vehicleType, rate }),
  });
  if (!response.ok) throw new Error('No se pudo editar la configuración de transporte.');
  showMessage('Configuración de transporte actualizada.');
  await loadTransportConfigs();
}

async function deleteHotelPriority(row) {
  const hotelPriorityId = row.dataset.hotelPriorityId;
  const hotelName = row.querySelector('[data-field="hotel_name"]').value.trim();
  if (!window.confirm(`¿Eliminar la prioridad de ${hotelName || 'este hotel'}?`)) return;
  const response = await fetch(`/api/hotel-priorities/${hotelPriorityId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('No se pudo eliminar la prioridad del hotel.');
  showMessage('Prioridad de hotel eliminada.');
  await loadHotelPriorities();
}

async function deleteTransportConfig(row) {
  const transportConfigId = row.dataset.transportConfigId;
  const hotelName = row.querySelector('[data-field="hotel_name"]').value.trim();
  if (!window.confirm(`¿Eliminar la configuración GT de ${hotelName || 'este hotel'}?`)) return;
  const response = await fetch(`/api/transport-configs/${transportConfigId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('No se pudo eliminar la configuración de transporte.');
  showMessage('Configuración de transporte eliminada.');
  await loadTransportConfigs();
}

function renderHistory(rows) {
  if (!rows.length) {
    historyBody.innerHTML = '<tr><td colspan="8">Sin solicitudes guardadas.</td></tr>';
    return;
  }
  historyBody.innerHTML = rows.map((row) => `
    <tr><td>${escapeHtml(formatDate(row.created_at))}</td><td>${escapeHtml(valueOrDash(row.airline))}</td><td>${escapeHtml(valueOrDash(row.ato))}</td><td>${escapeHtml(valueOrDash(row.rooms))}</td><td>${escapeHtml(valueOrDash(row.pax))}</td><td>${escapeHtml(valueOrDash(row.nights))}</td><td>${escapeHtml(valueOrDash(row.hotel))}</td><td>${escapeHtml(valueOrDash(row.status))}</td></tr>
  `).join('');
}

function renderGtHistory(rows) {
  if (!rows.length) {
    gtHistoryBody.innerHTML = '<tr><td colspan="9">Sin solicitudes GT guardadas.</td></tr>';
    return;
  }
  gtHistoryBody.innerHTML = rows.map((row) => `
    <tr><td>${escapeHtml(formatDate(row.created_at))}</td><td>${escapeHtml(valueOrDash(row.airline))}</td><td>${escapeHtml(valueOrDash(row.ato))}</td><td>${escapeHtml(valueOrDash(row.pax))}</td><td>${escapeHtml(valueOrDash(row.origen))}</td><td>${escapeHtml(valueOrDash(row.destino))}</td><td>${escapeHtml(valueOrDash(row.route))}</td><td>${escapeHtml(valueOrDash(row.vehicle_type))}</td><td>${escapeHtml(valueOrDash(row.priority))}</td></tr>
  `).join('');
}

async function loadHistory() {
  const response = await fetch('/api/requests');
  if (!response.ok) throw new Error('No se pudo cargar el historial.');
  renderHistory(await response.json());
}

async function loadGtHistory() {
  const response = await fetch('/api/gt/requests');
  if (!response.ok) throw new Error('No se pudo cargar el historial GT.');
  renderGtHistory(await response.json());
}

form.addEventListener('input', updateOutputs);
form.addEventListener('change', updateOutputs);
gtForm.addEventListener('input', updateOutputs);
gtForm.addEventListener('change', updateOutputs);
document.querySelectorAll('input[name="workflow"]').forEach((input) => input.addEventListener('change', () => setWorkflow(input.value)));
hotelInput.addEventListener('input', debounce(() => searchHotelPriority().catch(() => showMessage('No se pudo buscar la prioridad del hotel.'))));
gtDestinoInput.addEventListener('input', debounce(() => searchTransportConfig().catch(() => showMessage('No se pudo buscar la configuración de transporte.'))));
[priorityInput, gtPriorityInput].forEach((input) => {
  input.addEventListener('input', () => {
    const valid = !input.value.trim() || isPositiveInteger(input.value);
    input.setCustomValidity(valid ? '' : 'Ingresa un entero positivo: 1, 2, 3, etc.');
  });
});

document.querySelector('#copy-progress').addEventListener('click', () => copyText(progressOutput.value, 'Hardblock en curso copiado.'));
document.querySelector('#copy-completed').addEventListener('click', () => copyText(completedOutput.value, 'Hardblock Completed copiado.'));
document.querySelector('#copy-gt-progress').addEventListener('click', () => copyText(progressOutput.value, 'GT en curso copiado.'));
document.querySelector('#copy-gt-completed').addEventListener('click', () => copyText(completedOutput.value, 'GT Completed copiado.'));
document.querySelector('#clear-form').addEventListener('click', () => { form.reset(); updateOutputs(); showMessage('Formulario limpio.'); });
document.querySelector('#clear-gt-form').addEventListener('click', () => { gtForm.reset(); updateOutputs(); showMessage('Formulario GT limpio.'); });
document.querySelector('#save-hotel-priority').addEventListener('click', async () => { try { await saveHotelPriority(); } catch (error) { showMessage(error.message); } });
document.querySelector('#save-transport-config').addEventListener('click', async () => { try { await saveTransportConfig(); } catch (error) { showMessage(error.message); } });
document.querySelector('#save-request').addEventListener('click', async () => { try { await saveRequest(); } catch (error) { showMessage(error.message); } });
document.querySelector('#save-gt-request').addEventListener('click', async () => { try { await saveGtRequest(); } catch (error) { showMessage(error.message); } });
document.querySelector('#refresh-hotel-priorities').addEventListener('click', async () => { try { await loadHotelPriorities(); showMessage('Prioridades actualizadas.'); } catch (error) { showMessage(error.message); } });
document.querySelector('#refresh-transport-configs').addEventListener('click', async () => { try { await loadTransportConfigs(); showMessage('Configuración GT actualizada.'); } catch (error) { showMessage(error.message); } });

hotelPrioritiesBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const row = button.closest('tr');
  try {
    if (button.dataset.action === 'edit-hotel-priority') await updateHotelPriority(row);
    if (button.dataset.action === 'delete-hotel-priority') await deleteHotelPriority(row);
  } catch (error) { showMessage(error.message); }
});

transportConfigsBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const row = button.closest('tr');
  try {
    if (button.dataset.action === 'edit-transport-config') await updateTransportConfig(row);
    if (button.dataset.action === 'delete-transport-config') await deleteTransportConfig(row);
  } catch (error) { showMessage(error.message); }
});

document.querySelector('#refresh-history').addEventListener('click', async () => { try { await loadHistory(); showMessage('Historial actualizado.'); } catch (error) { showMessage(error.message); } });
document.querySelector('#refresh-gt-history').addEventListener('click', async () => { try { await loadGtHistory(); showMessage('Historial GT actualizado.'); } catch (error) { showMessage(error.message); } });

setWorkflow('hotel');
loadHotelPriorities().catch(() => showMessage('No se pudo cargar la administración de prioridades.'));
loadTransportConfigs().catch(() => showMessage('No se pudo cargar la configuración de transporte.'));
loadHistory().catch(() => showMessage('No se pudo cargar el historial.'));
loadGtHistory().catch(() => showMessage('No se pudo cargar el historial GT.'));
