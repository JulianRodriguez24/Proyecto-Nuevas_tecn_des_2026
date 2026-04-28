/* =============================================
   SALAS PWA — app.js
   ============================================= */

/* =============================================
   DATA
   ============================================= */
let USERS = [
  { id: 1, name: 'Admin General',  email: 'admin@salas.com',    pass: 'admin123',  role: 'admin',    initials: 'AG' },
  { id: 2, name: 'Laura Gómez',    email: 'laura@empresa.com',  pass: 'laura123',  role: 'customer', initials: 'LG' },
  { id: 3, name: 'Andrés Mora',    email: 'andres@empresa.com', pass: 'andres123', role: 'customer', initials: 'AM' },
  { id: 4, name: 'Sofía Rincón',   email: 'sofia@empresa.com',  pass: 'sofia123',  role: 'customer', initials: 'SR' },
];
let nextUserId = 10;
let editingUserId = null;

let rooms = [
  { id: 1, name: 'Sala Norte',  cap: 8,  icon: '▣', color: '#378ADD', busy: false },
  { id: 2, name: 'Sala Sur',    cap: 12, icon: '◆', color: '#1D9E75', busy: true  },
  { id: 3, name: 'Sala Cúpula', cap: 20, icon: '◉', color: '#7F77DD', busy: false },
  { id: 4, name: 'Sala Zen',    cap: 4,  icon: '◈', color: '#BA7517', busy: false },
];

let reservations = [
  { id: 101, roomId: 1, room: 'Sala Norte',  color: '#378ADD', userId: 2, userName: 'Laura Gómez',  date: '2026-04-18', start: '10:00', end: '11:30', notes: 'Kick-off proyecto' },
  { id: 102, roomId: 3, room: 'Sala Cúpula', color: '#7F77DD', userId: 3, userName: 'Andrés Mora',  date: '2026-04-19', start: '14:00', end: '15:00', notes: 'Demo cliente'      },
  { id: 103, roomId: 4, room: 'Sala Zen',    color: '#BA7517', userId: 4, userName: 'Sofía Rincón', date: '2026-04-20', start: '09:00', end: '10:00', notes: 'Retrospectiva'     },
];

let currentUser    = null;
let selectedRoomId = null;

/* =============================================
   HELPERS
   ============================================= */
function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function fmtDate(d) {
  const [y, m, day] = d.split('-');
  const ms = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return parseInt(day) + ' ' + ms[parseInt(m) - 1] + ' ' + y;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

/* =============================================
   LOGIN / LOGOUT
   ============================================= */
function renderQuickUsers() {
  const c = document.getElementById('quick-users');
  c.innerHTML = USERS.slice(0, 4).map(u => `
    <button class="upbtn" onclick="quickLogin(${u.id})">
      <div class="uba ${u.role === 'admin' ? 'av-admin' : 'av-customer'}">${u.initials}</div>
      <div class="ubn">${u.name.split(' ')[0]}</div>
      <div class="ubr">${u.role === 'admin' ? 'Admin' : 'Cliente'}</div>
    </button>
  `).join('');
}

function quickLogin(uid) {
  login(USERS.find(x => x.id === uid));
}

function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value;
  const u = USERS.find(x => x.email === email && x.pass === pass);
  if (!u) {
    document.getElementById('l-err').classList.remove('hidden');
    return;
  }
  document.getElementById('l-err').classList.add('hidden');
  login(u);
}

function login(u) {
  currentUser = u;
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('main-screen').classList.remove('hidden');

  document.getElementById('h-name').textContent = u.name;
  document.getElementById('h-role').textContent = u.role === 'admin' ? 'Administrador' : 'Cliente';
  const av = document.getElementById('h-avatar');
  av.textContent = u.initials;
  av.className   = 'avatar ' + (u.role === 'admin' ? 'av-admin' : 'av-customer');

  buildTabs();
  switchTab(u.role === 'admin' ? 'admin' : 'reservar');

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('f-date').value  = today;
  document.getElementById('f-date').min    = today;
  document.getElementById('f-name').value  = u.name;
  document.getElementById('f-email').value = u.email;
}

function doLogout() {
  currentUser    = null;
  selectedRoomId = null;
  document.getElementById('main-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('l-email').value = '';
  document.getElementById('l-pass').value  = '';
  renderQuickUsers();
}

/* =============================================
   TABS
   ============================================= */
function buildTabs() {
  const bar = document.getElementById('tabs-bar');
  if (currentUser.role === 'admin') {
    bar.innerHTML = `
      <button class="tab" data-tab="admin"    onclick="switchTab('admin')">Panel</button>
      <button class="tab" data-tab="usuarios" onclick="switchTab('usuarios')">Usuarios</button>
      <button class="tab" data-tab="reservar" onclick="switchTab('reservar')">Nueva reserva</button>
    `;
  } else {
    bar.innerHTML = `
      <button class="tab" data-tab="reservar" onclick="switchTab('reservar')">Nueva reserva</button>
      <button class="tab" data-tab="misres"   onclick="switchTab('misres')">Mis reservas</button>
    `;
  }
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  const map = {
    reservar: 'panel-reservar',
    misres:   'panel-misres',
    admin:    'panel-admin',
    usuarios: 'panel-usuarios'
  };
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(map[tab]);
  if (target) target.classList.add('active');

  if (tab === 'reservar') { selectedRoomId = null; renderRooms(); }
  if (tab === 'misres')   { renderMyRes(); }
  if (tab === 'admin')    { renderStats(); renderAdminTable(); renderAdminRooms(); }
  if (tab === 'usuarios') { closeUserForm(); renderUsersTable(); }
}

/* =============================================
   ROOMS
   ============================================= */
function renderRooms() {
  document.getElementById('rooms-grid').innerHTML = rooms.map(r => `
    <div class="room-card${selectedRoomId === r.id ? ' sel' : ''}${r.busy ? ' dis' : ''}"
         onclick="${r.busy ? "showToast('Sala ocupada')" : 'selRoom(' + r.id + ')'}">
      <div class="ricon" style="background:${r.color}22; color:${r.color};">${r.icon}</div>
      <div class="rname">${r.name}</div>
      <div class="rcap">Hasta ${r.cap} personas</div>
      <span class="rstatus ${r.busy ? 'sbusy' : 'sok'}">${r.busy ? 'Ocupada' : 'Disponible'}</span>
    </div>
  `).join('');
}

function selRoom(id) {
  selectedRoomId = id;
  renderRooms();
}

/* =============================================
   RESERVATIONS — Customer
   ============================================= */
function submitRes() {
  if (!selectedRoomId) { showToast('Elige una sala primero'); return; }

  const name  = document.getElementById('f-name').value.trim();
  const email = document.getElementById('f-email').value.trim();
  const date  = document.getElementById('f-date').value;
  const start = document.getElementById('f-start').value;
  const end   = document.getElementById('f-end').value;
  const att   = document.getElementById('f-att').value;
  const notes = document.getElementById('f-notes').value.trim();

  if (!name || !email || !date || !start || !end || !att) {
    showToast('Completa todos los campos'); return;
  }
  if (start >= end) {
    showToast('La hora fin debe ser mayor que la de inicio'); return;
  }

  const room = rooms.find(r => r.id === selectedRoomId);
  if (parseInt(att) > room.cap) {
    showToast('Máximo ' + room.cap + ' personas para esta sala'); return;
  }

  reservations.push({
    id: Date.now(), roomId: room.id, room: room.name, color: room.color,
    userId: currentUser.id, userName: currentUser.name,
    date, start, end, notes
  });

  showToast('¡Reserva creada con éxito!');
  document.getElementById('f-att').value   = '';
  document.getElementById('f-notes').value = '';
  selectedRoomId = null;
  renderRooms();
  setTimeout(() => switchTab('misres'), 1100);
}

function renderMyRes() {
  const list = document.getElementById('my-res-list');
  const mine = reservations
    .filter(r => r.userId === currentUser.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!mine.length) {
    list.innerHTML = '<div class="empty">No tienes reservas próximas</div>';
    return;
  }

  list.innerHTML = mine.map(r => `
    <div class="res-item">
      <div class="rdot" style="background:${r.color}"></div>
      <div class="rinfo">
        <div class="rn">${r.room}</div>
        <div class="rm">${fmtDate(r.date)}${r.notes ? ' · ' + r.notes : ''}</div>
      </div>
      <div class="rright">
        <div class="rt">${r.start}–${r.end}</div>
        <button class="cbtn" onclick="cancelRes(${r.id})">Cancelar</button>
      </div>
    </div>
  `).join('');
}

function cancelRes(id) {
  reservations = reservations.filter(r => r.id !== id);
  renderMyRes();
  showToast('Reserva cancelada');
}

/* =============================================
   ADMIN — Stats
   ============================================= */
function renderStats() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('stat-grid').innerHTML = `
    <div class="sc"><div class="sl">Total reservas</div><div class="sv">${reservations.length}</div></div>
    <div class="sc"><div class="sl">Hoy</div><div class="sv">${reservations.filter(r => r.date === today).length}</div></div>
    <div class="sc"><div class="sl">Salas libres</div><div class="sv">${rooms.filter(r => !r.busy).length}</div></div>
    <div class="sc"><div class="sl">Usuarios</div><div class="sv">${USERS.length}</div></div>
  `;
}

/* =============================================
   ADMIN — Reservations table
   ============================================= */
function renderAdminTable() {
  const tb = document.getElementById('admin-tbody');
  const sorted = [...reservations].sort((a, b) => a.date.localeCompare(b.date));

  if (!sorted.length) {
    tb.innerHTML = '<tr><td colspan="6" class="empty">Sin reservas</td></tr>';
    return;
  }

  tb.innerHTML = sorted.map(r => `
    <tr>
      <td>
        <span style="display:inline-flex;align-items:center;gap:6px;">
          <span style="width:8px;height:8px;border-radius:50%;background:${r.color};display:inline-block;flex-shrink:0;"></span>
          ${r.room}
        </span>
      </td>
      <td>${r.userName}</td>
      <td>${fmtDate(r.date)}</td>
      <td>${r.start}–${r.end}</td>
      <td><span class="rstatus sok">Activa</span></td>
      <td><button class="del-btn" onclick="adminDelRes(${r.id})">Eliminar</button></td>
    </tr>
  `).join('');
}

function adminDelRes(id) {
  reservations = reservations.filter(r => r.id !== id);
  renderStats();
  renderAdminTable();
  showToast('Reserva eliminada');
}

/* =============================================
   ADMIN — Rooms management
   ============================================= */
function renderAdminRooms() {
  document.getElementById('admin-rooms').innerHTML = rooms.map(r => `
    <div class="room-card">
      <div class="ricon" style="background:${r.color}22; color:${r.color};">${r.icon}</div>
      <div class="rname">${r.name}</div>
      <div class="rcap">Cap. ${r.cap}</div>
      <span class="rstatus ${r.busy ? 'sbusy' : 'sok'}">${r.busy ? 'Ocupada' : 'Libre'}</span>
      <div style="margin-top:8px;">
        <button class="edit-btn" style="font-size:11px;padding:3px 9px;"
                onclick="toggleRoom(${r.id})">${r.busy ? 'Liberar' : 'Bloquear'}</button>
      </div>
    </div>
  `).join('');
}

function toggleRoom(id) {
  const r = rooms.find(x => x.id === id);
  r.busy = !r.busy;
  renderAdminRooms();
  renderStats();
  showToast(r.busy ? r.name + ' bloqueada' : r.name + ' liberada');
}

/* =============================================
   ADMIN — Users CRUD
   ============================================= */
function renderUsersTable() {
  const tb = document.getElementById('users-tbody');
  if (!USERS.length) {
    tb.innerHTML = '<tr><td colspan="5" class="empty">Sin usuarios</td></tr>';
    return;
  }

  tb.innerHTML = USERS.map(u => `
    <tr>
      <td>
        <span style="display:flex;align-items:center;gap:8px;">
          <span class="avatar ${u.role === 'admin' ? 'av-admin' : 'av-customer'}"
                style="width:28px;height:28px;font-size:10px;flex-shrink:0;">${u.initials}</span>
          ${u.name}
        </span>
      </td>
      <td style="color:#888;">${u.email}</td>
      <td>
        <span class="rbadge ${u.role === 'admin' ? 'b-admin' : 'b-cust'}">
          ${u.role === 'admin' ? 'Admin' : 'Cliente'}
        </span>
      </td>
      <td>${reservations.filter(r => r.userId === u.id).length}</td>
      <td>
        <div class="row-actions">
          <button class="edit-btn" onclick="openEditUser(${u.id})">Editar</button>
          ${u.id === currentUser.id ? '' : `<button class="del-btn" onclick="deleteUser(${u.id})">Eliminar</button>`}
        </div>
      </td>
    </tr>
  `).join('');
}

function openCreateUser() {
  editingUserId = null;
  document.getElementById('uf-title').textContent      = 'Crear usuario';
  document.getElementById('uf-submit-btn').textContent = 'Guardar usuario';
  document.getElementById('uf-name').value  = '';
  document.getElementById('uf-email').value = '';
  document.getElementById('uf-pass').value  = '';
  document.getElementById('uf-role').value  = 'customer';
  document.getElementById('uf-err').classList.add('hidden');
  document.getElementById('user-form-wrap').classList.remove('hidden');
  document.getElementById('uf-name').focus();
}

function openEditUser(id) {
  const u = USERS.find(x => x.id === id);
  if (!u) return;
  editingUserId = id;
  document.getElementById('uf-title').textContent      = 'Editar usuario';
  document.getElementById('uf-submit-btn').textContent = 'Actualizar usuario';
  document.getElementById('uf-name').value  = u.name;
  document.getElementById('uf-email').value = u.email;
  document.getElementById('uf-pass').value  = u.pass;
  document.getElementById('uf-role').value  = u.role;
  document.getElementById('uf-err').classList.add('hidden');
  document.getElementById('user-form-wrap').classList.remove('hidden');
  document.getElementById('uf-name').focus();
}

function closeUserForm() {
  editingUserId = null;
  document.getElementById('user-form-wrap').classList.add('hidden');
}

function saveUser() {
  const name  = document.getElementById('uf-name').value.trim();
  const email = document.getElementById('uf-email').value.trim();
  const pass  = document.getElementById('uf-pass').value;
  const role  = document.getElementById('uf-role').value;
  const errEl = document.getElementById('uf-err');

  if (!name || !email || !pass) {
    errEl.textContent = 'Completa todos los campos';
    errEl.classList.remove('hidden'); return;
  }
  if (pass.length < 6) {
    errEl.textContent = 'La contraseña debe tener al menos 6 caracteres';
    errEl.classList.remove('hidden'); return;
  }
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email)) {
    errEl.textContent = 'Correo no válido';
    errEl.classList.remove('hidden'); return;
  }
  if (USERS.find(x => x.email === email && x.id !== editingUserId)) {
    errEl.textContent = 'Ya existe un usuario con ese correo';
    errEl.classList.remove('hidden'); return;
  }

  if (editingUserId) {
    const u = USERS.find(x => x.id === editingUserId);
    u.name = name; u.email = email; u.pass = pass; u.role = role;
    u.initials = getInitials(name);
    if (currentUser.id === editingUserId) {
      currentUser = u;
      document.getElementById('h-name').textContent   = u.name;
      document.getElementById('h-role').textContent   = u.role === 'admin' ? 'Administrador' : 'Cliente';
      document.getElementById('h-avatar').textContent = u.initials;
    }
    showToast('Usuario actualizado');
  } else {
    USERS.push({ id: nextUserId++, name, email, pass, role, initials: getInitials(name) });
    showToast('Usuario creado: ' + name);
  }

  errEl.classList.add('hidden');
  closeUserForm();
  renderUsersTable();
  renderStats();
  renderQuickUsers();
}

function deleteUser(id) {
  if (id === currentUser.id) return;
  const u = USERS.find(x => x.id === id);
  USERS        = USERS.filter(x => x.id !== id);
  reservations = reservations.filter(r => r.userId !== id);
  renderUsersTable();
  renderStats();
  showToast((u ? u.name : 'Usuario') + ' eliminado');
}

/* =============================================
   SERVICE WORKER REGISTRATION
   ============================================= */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('Service Worker registrado'))
      .catch(err => console.warn('SW error:', err));
  });
}

/* =============================================
   INIT
   ============================================= */
renderQuickUsers();
