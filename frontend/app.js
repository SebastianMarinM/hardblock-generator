const form = document.querySelector('#hardblock-form');
const message = document.querySelector('#message');
const progressOutput = document.querySelector('#progress-output');
const completedOutput = document.querySelector('#completed-output');
const historyBody = document.querySelector('#history-body');
const hotelPrioritiesBody = document.querySelector('#hotel-priorities-body');
const hotelInput = document.querySelector('#hotel');
const priorityInput = document.querySelector('#prioridad');

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

function priorityOptions(selectedPriority) {
  return ['', 'Alta', 'Media', 'Baja'].map((priority) => {
    const label = priority || 'Seleccionar';
    const selected = priority === selectedPriority ? ' selected' : '';
    return `<option value="${escapeHtml(priority)}"${selected}>${escapeHtml(label)}</option>`;
  }).join('');
}

async function searchHotelPriority() {
  const hotelName = hotelInput.value.trim();
  if (!hotelName) {
    return;
  }

  const response = await fetch(`/api/hotel-priorities/search?hotel_name=${encodeURIComponent(hotelName)}`);

  if (!response.ok) {
    throw new Error('No se pudo buscar la prioridad del hotel.');
  }

  const hotelPriority = await response.json();
  if (hotelPriority) {
    priorityInput.value = hotelPriority.priority;
    updateOutputs();
  }
}

async function saveHotelPriority() {
  const hotelName = hotelInput.value.trim();
  const priority = priorityInput.value.trim();

  if (!hotelName || !priority) {
    throw new Error('Ingresa hotel y prioridad para guardar.');
  }

  const response = await fetch('/api/hotel-priorities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hotel_name: hotelName, priority }),
  });

  if (!response.ok) {
    throw new Error('No se pudo guardar la prioridad del hotel.');
  }

  const saved = await response.json();
  showMessage(`Prioridad de ${saved.hotel_name} guardada correctamente.`);
  await loadHotelPriorities();
}

function renderHotelPriorities(rows) {
  if (!rows.length) {
    hotelPrioritiesBody.innerHTML = '<tr><td colspan="4">Sin prioridades guardadas.</td></tr>';
    return;
  }

  hotelPrioritiesBody.innerHTML = rows.map((row) => `
    <tr data-hotel-priority-id="${row.id}">
      <td>
        <input class="editable admin-field" data-field="hotel_name" type="text" value="${escapeHtml(row.hotel_name)}">
      </td>
      <td>
        <select class="editable admin-field" data-field="priority">
          ${priorityOptions(row.priority)}
        </select>
      </td>
      <td>${escapeHtml(formatDate(row.updated_at))}</td>
      <td class="row-actions">
        <button type="button" class="ghost" data-action="edit-hotel-priority">Guardar</button>
        <button type="button" class="secondary" data-action="delete-hotel-priority">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

async function loadHotelPriorities() {
  const response = await fetch('/api/hotel-priorities');

  if (!response.ok) {
    throw new Error('No se pudo cargar la administración de prioridades.');
  }

  renderHotelPriorities(await response.json());
}

async function updateHotelPriority(row) {
  const hotelPriorityId = row.dataset.hotelPriorityId;
  const hotelName = row.querySelector('[data-field="hotel_name"]').value.trim();
  const priority = row.querySelector('[data-field="priority"]').value.trim();

  if (!hotelName || !priority) {
    throw new Error('Hotel y prioridad son obligatorios.');
  }

  const response = await fetch(`/api/hotel-priorities/${hotelPriorityId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hotel_name: hotelName, priority }),
  });

  if (!response.ok) {
    throw new Error('No se pudo editar la prioridad del hotel.');
  }

  showMessage('Prioridad de hotel actualizada.');
  await loadHotelPriorities();
}

async function deleteHotelPriority(row) {
  const hotelPriorityId = row.dataset.hotelPriorityId;
  const hotelName = row.querySelector('[data-field="hotel_name"]').value.trim();
  const confirmed = window.confirm(`¿Eliminar la prioridad de ${hotelName || 'este hotel'}?`);
  if (!confirmed) {
    return;
  }

  const response = await fetch(`/api/hotel-priorities/${hotelPriorityId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('No se pudo eliminar la prioridad del hotel.');
  }

  showMessage('Prioridad de hotel eliminada.');
  await loadHotelPriorities();
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
hotelInput.addEventListener('input', debounce(() => {
  searchHotelPriority().catch(() => showMessage('No se pudo buscar la prioridad del hotel.'));
}));

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

document.querySelector('#save-hotel-priority').addEventListener('click', async () => {
  try {
    await saveHotelPriority();
  } catch (error) {
    showMessage(error.message);
  }
});

document.querySelector('#save-request').addEventListener('click', async () => {
  try {
    await saveRequest();
  } catch (error) {
    showMessage(error.message);
  }
});

document.querySelector('#refresh-hotel-priorities').addEventListener('click', async () => {
  try {
    await loadHotelPriorities();
    showMessage('Prioridades actualizadas.');
  } catch (error) {
    showMessage(error.message);
  }
});

hotelPrioritiesBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) {
    return;
  }

  const row = button.closest('tr');
  try {
    if (button.dataset.action === 'edit-hotel-priority') {
      await updateHotelPriority(row);
    }
    if (button.dataset.action === 'delete-hotel-priority') {
      await deleteHotelPriority(row);
    }
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
loadHotelPriorities().catch(() => showMessage('No se pudo cargar la administración de prioridades.'));
loadHistory().catch(() => showMessage('No se pudo cargar el historial.'));
