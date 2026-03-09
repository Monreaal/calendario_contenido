/* ══════════════════════════════════════
   Calendario Editorial — App JS
══════════════════════════════════════ */

const API = '';
let allPosts = [], allFechas = [], allProyectos = [];
let currentCalDate = new Date(2025, 0, 1);
let editingPostId = null, editingProyectoId = null;

// ── INIT ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initSidebar();
  loadAll();
  bindEvents();
});

async function loadAll() {
  await Promise.all([loadStats(), loadPosts(), loadFechas(), loadProyectos()]);
}

// ── NAVIGATION ───────────────────────────
function initNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const view = item.dataset.view;
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      item.classList.add('active');
      document.getElementById('view-' + view).classList.add('active');
      document.getElementById('pageTitle').textContent = item.querySelector('span:last-child').textContent;
      if (view === 'calendario') renderCalendar();
      if (view === 'posts') renderPostsTable();
    });
  });
}

function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main');
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('sidebar-collapsed');
  });
  document.getElementById('menuBtn').addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('sidebar-collapsed');
  });
}

// ── API CALLS ─────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function loadStats() {
  try {
    const s = await apiFetch('/api/stats');
    document.getElementById('stat-total').textContent = s.total;
    document.getElementById('stat-completo').textContent = s.completos;
    document.getElementById('stat-proceso').textContent = s.en_proceso;
    document.getElementById('stat-pct').textContent = s.completado_pct + '%';
    renderPilaresChart(s.por_pilar, s.total);
    renderFormatosChart(s.por_formato);
  } catch(e) { console.error('Stats error:', e); }
}

async function loadPosts() {
  try {
    allPosts = await apiFetch('/api/posts');
    renderPostsTable();
    renderProximasFechas();
  } catch(e) { console.error('Posts error:', e); }
}

async function loadFechas() {
  try {
    allFechas = await apiFetch('/api/fechas');
    renderFechasTimeline();
    renderProximasFechas();
  } catch(e) { console.error('Fechas error:', e); }
}

async function loadProyectos() {
  try {
    allProyectos = await apiFetch('/api/proyectos');
    renderProyectosGrid();
  } catch(e) { console.error('Proyectos error:', e); }
}

// ── DASHBOARD ─────────────────────────────
function renderPilaresChart(pilares, total) {
  const el = document.getElementById('pilaresChart');
  if (!pilares.length) { el.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem">Sin datos aún</p>'; return; }
  const max = pilares[0].c;
  el.innerHTML = pilares.map(p => `
    <div class="pilar-row">
      <span class="pilar-name">${p.pilar}</span>
      <div class="pilar-bar-bg">
        <div class="pilar-bar" style="width:${Math.round(p.c/max*100)}%"></div>
      </div>
      <span class="pilar-count">${p.c}</span>
    </div>`).join('');
}

function renderFormatosChart(f) {
  const el = document.getElementById('formatosChart');
  const formats = [
    { key: 'imagen', icon: '🖼️', label: 'Imagen' },
    { key: 'carrusel', icon: '🎠', label: 'Carrusel' },
    { key: 'reel', icon: '🎬', label: 'Reel' },
    { key: 'historia', icon: '⏺️', label: 'Historia' },
  ];
  el.innerHTML = formats.map(fmt => `
    <div class="formato-item">
      <span class="formato-icon">${fmt.icon}</span>
      <div class="formato-info">
        <div class="formato-label">${fmt.label}</div>
        <div class="formato-num">${f[fmt.key] || 0}</div>
      </div>
    </div>`).join('');
}

function renderProximasFechas() {
  const el = document.getElementById('proximasFechas');
  if (!el) return;
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = allFechas
    .filter(f => f.fecha >= today)
    .slice(0, 8);
  if (!upcoming.length) { el.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem">No hay fechas próximas</p>'; return; }
  el.innerHTML = upcoming.map(f => {
    const d = new Date(f.fecha + 'T00:00:00');
    return `<div class="fecha-pill">
      <div class="fecha-pill-date">${d.getDate()}</div>
      <div class="fecha-pill-info">
        <div class="fecha-pill-title">${esc(f.titulo)}</div>
        <div class="fecha-pill-tipo">${esc(f.tipo)}</div>
      </div>
    </div>`;
  }).join('');
}

// ── CALENDAR ──────────────────────────────
function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  const title = document.getElementById('calMonthTitle');
  const year = currentCalDate.getFullYear();
  const month = currentCalDate.getMonth();

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  title.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay === 0 ? 6 : firstDay - 1);

  // Build lookup maps
  const postsByDate = {};
  allPosts.forEach(p => {
    const d = p.fecha ? p.fecha.slice(0, 10) : '';
    if (!postsByDate[d]) postsByDate[d] = [];
    postsByDate[d].push(p);
  });
  const fechasByDate = {};
  allFechas.forEach(f => {
    if (!fechasByDate[f.fecha]) fechasByDate[f.fecha] = [];
    fechasByDate[f.fecha].push(f);
  });

  const dayNames = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  let html = dayNames.map(d => `<div class="cal-header-cell">${d}</div>`).join('');

  const today = new Date().toISOString().slice(0, 10);
  const prevMonthDays = new Date(year, month, 0).getDate();

  for (let i = 0; i < startOffset; i++) {
    const day = prevMonthDays - startOffset + i + 1;
    html += `<div class="cal-day other-month"><div class="cal-day-num">${day}</div></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = dateStr === today;
    const posts = postsByDate[dateStr] || [];
    const fechas = fechasByDate[dateStr] || [];
    const hasEvents = posts.length > 0 || fechas.length > 0;

    let eventsHtml = '';
    fechas.slice(0,1).forEach(f => {
      eventsHtml += `<div class="cal-event-dot fecha-key">${esc(f.titulo)}</div>`;
    });
    posts.slice(0,2).forEach(p => {
      const cls = p.estado === 'Completo' ? 'completo' : p.estado === 'En proceso' ? 'en-proceso' : 'incompleto';
      eventsHtml += `<div class="cal-event-dot ${cls}" onclick="openEditPost(${p.id})">${esc(p.pilar || p.gancho || 'Post')}</div>`;
    });
    if (posts.length + fechas.length > 3) {
      eventsHtml += `<div class="cal-event-dot" style="color:var(--text-muted)">+${posts.length + fechas.length - 3} más</div>`;
    }

    html += `<div class="cal-day${isToday ? ' today' : ''}${hasEvents ? ' has-events' : ''}">
      <div class="cal-day-num">${d}</div>
      <div class="cal-events">${eventsHtml}</div>
    </div>`;
  }

  const totalCells = startOffset + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    html += `<div class="cal-day other-month"><div class="cal-day-num">${i}</div></div>`;
  }

  grid.innerHTML = html;
}

document.getElementById('calPrev').addEventListener('click', () => {
  currentCalDate.setMonth(currentCalDate.getMonth() - 1);
  renderCalendar();
});
document.getElementById('calNext').addEventListener('click', () => {
  currentCalDate.setMonth(currentCalDate.getMonth() + 1);
  renderCalendar();
});

// ── POSTS TABLE ───────────────────────────
function renderPostsTable() {
  const mes = document.getElementById('filterMes').value;
  const estado = document.getElementById('filterEstado').value;
  const search = document.getElementById('searchPosts').value.toLowerCase();

  let filtered = allPosts.filter(p => {
    if (mes && p.mes !== mes) return false;
    if (estado && p.estado !== estado) return false;
    if (search && !`${p.pilar} ${p.gancho} ${p.objetivo} ${p.descripcion}`.toLowerCase().includes(search)) return false;
    return true;
  });

  const tbody = document.getElementById('postsTableBody');
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:30px">No hay posts que coincidan</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const cls = p.estado === 'Completo' ? 'completo' : p.estado === 'En proceso' ? 'en-proceso' : 'incompleto';
    const formats = [];
    if (p.formato_imagen) formats.push('Imagen');
    if (p.formato_carrusel) formats.push('Carrusel');
    if (p.formato_reel) formats.push('Reel');
    if (p.formato_historia) formats.push('Historia');

    return `<tr>
      <td><strong>${p.fecha || '—'}</strong><br><small style="color:var(--text-muted)">${p.horario || ''}</small></td>
      <td>${esc(p.dia)}</td>
      <td>${esc(p.pilar)}</td>
      <td><div class="format-tags">${formats.map(f => `<span class="format-tag">${f}</span>`).join('')}</div></td>
      <td><span class="status-badge ${cls}">${esc(p.estado)}</span></td>
      <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.objetivo)}</td>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.gancho)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" onclick="openEditPost(${p.id})" title="Editar">✎</button>
          <button class="btn-icon danger" onclick="deletePost(${p.id})" title="Eliminar">✕</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

['filterMes', 'filterEstado', 'searchPosts'].forEach(id => {
  document.getElementById(id).addEventListener('input', renderPostsTable);
  document.getElementById(id).addEventListener('change', renderPostsTable);
});

// ── POST MODAL ────────────────────────────
function bindEvents() {
  document.getElementById('newPostBtn').addEventListener('click', () => openNewPost());
  document.getElementById('closeModalPost').addEventListener('click', closeModalPost);
  document.getElementById('cancelModalPost').addEventListener('click', closeModalPost);
  document.getElementById('savePost').addEventListener('click', savePost);
  document.getElementById('modalPost').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModalPost();
  });

  document.getElementById('newProyectoBtn').addEventListener('click', () => openNewProyecto());
  document.getElementById('closeModalProyecto').addEventListener('click', closeModalProyecto);
  document.getElementById('cancelModalProyecto').addEventListener('click', closeModalProyecto);
  document.getElementById('saveProyecto').addEventListener('click', saveProyecto);
  document.getElementById('addEtapaBtn').addEventListener('click', addEtapaRow);
  document.getElementById('modalProyecto').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModalProyecto();
  });

  document.getElementById('newFechaBtn').addEventListener('click', () => openModalFecha());
  document.getElementById('closeModalFecha').addEventListener('click', closeModalFecha);
  document.getElementById('cancelModalFecha').addEventListener('click', closeModalFecha);
  document.getElementById('saveFecha').addEventListener('click', saveFecha);
  document.getElementById('modalFecha').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModalFecha();
  });
}

function openNewPost() {
  editingPostId = null;
  document.getElementById('modalPostTitle').textContent = 'Nuevo Post';
  document.getElementById('postForm').reset();
  document.getElementById('postId').value = '';
  document.getElementById('modalPost').classList.add('open');
}

function openEditPost(id) {
  const p = allPosts.find(x => x.id === id);
  if (!p) return;
  editingPostId = id;
  document.getElementById('modalPostTitle').textContent = 'Editar Post';
  document.getElementById('postId').value = id;
  document.getElementById('postMes').value = p.mes || 'Enero';
  document.getElementById('postSemana').value = p.semana || '';
  document.getElementById('postFecha').value = p.fecha || '';
  document.getElementById('postHorario').value = p.horario || '';
  document.getElementById('postDia').value = p.dia || 'Lunes';
  document.getElementById('postPilar').value = p.pilar || '';
  document.getElementById('postEstado').value = p.estado || 'Incompleto';
  document.getElementById('postObjetivo').value = p.objetivo || '';
  document.getElementById('postImagen').checked = !!p.formato_imagen;
  document.getElementById('postCarrusel').checked = !!p.formato_carrusel;
  document.getElementById('postReel').checked = !!p.formato_reel;
  document.getElementById('postHistoria').checked = !!p.formato_historia;
  document.getElementById('postGancho').value = p.gancho || '';
  document.getElementById('postDesc').value = p.descripcion || '';
  document.getElementById('postHashtags').value = p.hashtags || '';
  document.getElementById('postDiseno').value = p.indicaciones_diseno || '';
  document.getElementById('postEnlace').value = p.enlace || '';
  document.getElementById('postNotas').value = p.notas || '';
  document.getElementById('modalPost').classList.add('open');
}

function closeModalPost() { document.getElementById('modalPost').classList.remove('open'); }

async function savePost() {
  const data = {
    semana: document.getElementById('postSemana').value,
    mes: document.getElementById('postMes').value,
    dia: document.getElementById('postDia').value,
    fecha: document.getElementById('postFecha').value,
    horario: document.getElementById('postHorario').value,
    pilar: document.getElementById('postPilar').value,
    estado: document.getElementById('postEstado').value,
    objetivo: document.getElementById('postObjetivo').value,
    enlace: document.getElementById('postEnlace').value,
    formato_imagen: document.getElementById('postImagen').checked ? 1 : 0,
    formato_carrusel: document.getElementById('postCarrusel').checked ? 1 : 0,
    formato_reel: document.getElementById('postReel').checked ? 1 : 0,
    formato_historia: document.getElementById('postHistoria').checked ? 1 : 0,
    gancho: document.getElementById('postGancho').value,
    descripcion: document.getElementById('postDesc').value,
    hashtags: document.getElementById('postHashtags').value,
    indicaciones_diseno: document.getElementById('postDiseno').value,
    notas: document.getElementById('postNotas').value,
  };

  try {
    if (editingPostId) {
      await apiFetch(`/api/posts/${editingPostId}`, { method: 'PUT', body: JSON.stringify(data) });
    } else {
      await apiFetch('/api/posts', { method: 'POST', body: JSON.stringify(data) });
    }
    closeModalPost();
    await Promise.all([loadStats(), loadPosts()]);
    if (document.getElementById('view-calendario').classList.contains('active')) renderCalendar();
  } catch(e) { alert('Error al guardar: ' + e.message); }
}

async function deletePost(id) {
  if (!confirm('¿Eliminar este post?')) return;
  await apiFetch(`/api/posts/${id}`, { method: 'DELETE' });
  await Promise.all([loadStats(), loadPosts()]);
  if (document.getElementById('view-calendario').classList.contains('active')) renderCalendar();
}

// ── PROYECTOS ─────────────────────────────
function renderProyectosGrid() {
  const el = document.getElementById('proyectosGrid');
  if (!allProyectos.length) {
    el.innerHTML = '<p style="color:var(--text-muted)">No hay proyectos. Creá uno con el botón de arriba.</p>';
    return;
  }
  el.innerHTML = allProyectos.map(p => {
    const etapas = p.etapas || [];
    const completadas = etapas.filter(e => e.completada).length;
    const pct = etapas.length ? Math.round(completadas / etapas.length * 100) : 0;
    const estadoCls = p.estado?.toLowerCase() || 'activo';

    return `<div class="proyecto-card" id="proj-${p.id}">
      <div class="proyecto-card-header">
        <div class="proyecto-nombre">${esc(p.nombre)}</div>
        <span class="proyecto-estado-badge ${estadoCls}">${esc(p.estado)}</span>
      </div>
      ${p.descripcion ? `<div class="proyecto-desc">${esc(p.descripcion)}</div>` : ''}
      ${(p.fecha_inicio || p.fecha_fin) ? `<div class="proyecto-dates">
        ${p.fecha_inicio ? `📅 ${p.fecha_inicio}` : ''}
        ${p.fecha_fin ? `→ ${p.fecha_fin}` : ''}
      </div>` : ''}
      ${etapas.length ? `<div class="proyecto-progress">
        <div class="progress-label">
          <span>Progreso</span><span>${completadas}/${etapas.length} etapas (${pct}%)</span>
        </div>
        <div class="progress-bar-bg"><div class="progress-bar" style="width:${pct}%"></div></div>
      </div>` : ''}
      <div class="etapas-list-view">
        ${etapas.map(e => `
          <div class="etapa-item" onclick="toggleEtapa(${e.id}, ${p.id})">
            <div class="etapa-check ${e.completada ? 'done' : ''}">
              ${e.completada ? '✓' : ''}
            </div>
            <span class="etapa-text ${e.completada ? 'done' : ''}">${esc(e.tarea)}</span>
            ${e.vencimiento ? `<span class="etapa-vence">${e.vencimiento}</span>` : ''}
          </div>`).join('')}
      </div>
      <div class="proyecto-card-footer">
        <button class="btn-icon" onclick="openEditProyecto(${p.id})">✎ Editar</button>
        <button class="btn-icon danger" onclick="deleteProyecto(${p.id})">✕</button>
      </div>
    </div>`;
  }).join('');
}

async function toggleEtapa(etapaId, proyId) {
  await apiFetch(`/api/etapas/${etapaId}/toggle`, { method: 'POST' });
  await loadProyectos();
}

function openNewProyecto() {
  editingProyectoId = null;
  document.getElementById('modalProyectoTitle').textContent = 'Nuevo Proyecto';
  document.getElementById('proyectoForm').reset();
  document.getElementById('proyectoId').value = '';
  document.getElementById('etapasList').innerHTML = '';
  document.getElementById('modalProyecto').classList.add('open');
}

function openEditProyecto(id) {
  const p = allProyectos.find(x => x.id === id);
  if (!p) return;
  editingProyectoId = id;
  document.getElementById('modalProyectoTitle').textContent = 'Editar Proyecto';
  document.getElementById('proyectoId').value = id;
  document.getElementById('proyectoNombre').value = p.nombre || '';
  document.getElementById('proyectoDesc').value = p.descripcion || '';
  document.getElementById('proyectoInicio').value = p.fecha_inicio || '';
  document.getElementById('proyectoFin').value = p.fecha_fin || '';
  document.getElementById('proyectoEstado').value = p.estado || 'Activo';
  document.getElementById('proyectoObjetivo').value = p.objetivo || '';
  document.getElementById('proyectoRecursos').value = p.recursos || '';
  document.getElementById('proyectoNotas').value = p.notas || '';
  
  const etapasList = document.getElementById('etapasList');
  etapasList.innerHTML = '';
  (p.etapas || []).forEach(e => addEtapaRow(e));
  
  document.getElementById('modalProyecto').classList.add('open');
}

function closeModalProyecto() { document.getElementById('modalProyecto').classList.remove('open'); }

function addEtapaRow(etapa = {}) {
  const row = document.createElement('div');
  row.className = 'etapa-form-row';
  row.innerHTML = `
    <input type="text" class="etapa-tarea" placeholder="Tarea..." value="${esc(etapa.tarea || '')}">
    <input type="date" class="etapa-vence-input" value="${etapa.vencimiento || ''}">
    <button type="button" class="etapa-remove" onclick="this.parentElement.remove()">✕</button>`;
  document.getElementById('etapasList').appendChild(row);
}

async function saveProyecto() {
  const etapasRows = document.querySelectorAll('.etapa-form-row');
  const etapas = Array.from(etapasRows).map(row => ({
    tarea: row.querySelector('.etapa-tarea').value,
    vencimiento: row.querySelector('.etapa-vence-input').value,
    completada: 0,
  })).filter(e => e.tarea.trim());

  const data = {
    nombre: document.getElementById('proyectoNombre').value,
    descripcion: document.getElementById('proyectoDesc').value,
    fecha_inicio: document.getElementById('proyectoInicio').value,
    fecha_fin: document.getElementById('proyectoFin').value,
    estado: document.getElementById('proyectoEstado').value,
    objetivo: document.getElementById('proyectoObjetivo').value,
    recursos: document.getElementById('proyectoRecursos').value,
    notas: document.getElementById('proyectoNotas').value,
    etapas,
  };

  try {
    if (editingProyectoId) {
      await apiFetch(`/api/proyectos/${editingProyectoId}`, { method: 'PUT', body: JSON.stringify(data) });
    } else {
      await apiFetch('/api/proyectos', { method: 'POST', body: JSON.stringify(data) });
    }
    closeModalProyecto();
    await loadProyectos();
  } catch(e) { alert('Error: ' + e.message); }
}

async function deleteProyecto(id) {
  if (!confirm('¿Eliminar este proyecto?')) return;
  await apiFetch(`/api/proyectos/${id}`, { method: 'DELETE' });
  await loadProyectos();
}

// ── FECHAS IMPORTANTES ────────────────────
function renderFechasTimeline() {
  const el = document.getElementById('fechasTimeline');
  if (!allFechas.length) { el.innerHTML = '<p style="color:var(--text-muted)">Sin fechas. Agregá una.</p>'; return; }

  const byMonth = {};
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  allFechas.forEach(f => {
    const d = new Date(f.fecha + 'T00:00:00');
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`;
    if (!byMonth[key]) byMonth[key] = { label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`, items: [] };
    byMonth[key].items.push(f);
  });

  el.innerHTML = Object.keys(byMonth).sort().map(key => {
    const group = byMonth[key];
    return `<div class="fecha-group-month">
      <div class="fecha-month-label">${group.label}</div>
      ${group.items.map(f => {
        const d = new Date(f.fecha + 'T00:00:00');
        return `<div class="fecha-entry">
          <div class="fecha-entry-date">${d.getDate()}</div>
          <div class="fecha-entry-info">
            <div class="fecha-entry-title">${esc(f.titulo)}</div>
            <span class="fecha-entry-tipo ${f.tipo}">${esc(f.tipo)}</span>
            ${f.notas ? `<div class="fecha-entry-notas">${esc(f.notas)}</div>` : ''}
          </div>
          <button class="btn-icon danger" onclick="deleteFecha(${f.id})" style="flex-shrink:0">✕</button>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
}

function openModalFecha() { document.getElementById('modalFecha').classList.add('open'); }
function closeModalFecha() { document.getElementById('modalFecha').classList.remove('open'); }

async function saveFecha() {
  const data = {
    fecha: document.getElementById('fechaDate').value,
    titulo: document.getElementById('fechaTitulo').value,
    tipo: document.getElementById('fechaTipo').value,
    notas: document.getElementById('fechaNotas').value,
  };
  if (!data.fecha || !data.titulo) { alert('Completá fecha y título.'); return; }
  await apiFetch('/api/fechas', { method: 'POST', body: JSON.stringify(data) });
  document.getElementById('fechaForm').reset();
  closeModalFecha();
  await loadFechas();
  await loadStats();
}

async function deleteFecha(id) {
  if (!confirm('¿Eliminar esta fecha?')) return;
  await apiFetch(`/api/fechas/${id}`, { method: 'DELETE' });
  await loadFechas();
  await loadStats();
}

// ── UTILS ─────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
