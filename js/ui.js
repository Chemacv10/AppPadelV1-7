// ─────────────────────────────────────────────
//  ESCUELA DE PÁDEL — UI helpers compartidos
// ─────────────────────────────────────────────

// ── Navegación ────────────────────────────────

/**
 * Renderiza el menú de navegación en el elemento #nav-container.
 * @param {string} moduloActivo  id del módulo actual (ej: 'alumnos')
 */
function renderNav(moduloActivo) {
  const el = document.getElementById('nav-container');
  if (!el) return;
  el.innerHTML = MODULOS.map(m => `
    <a class="nav-item ${m.id === moduloActivo ? 'active' : ''}" href="${m.href}">
      <div class="nav-icon"><img src="${m.icon}" alt="${m.label}"></div>
      <div class="nav-label">${m.label}</div>
    </a>`).join('');
}

// ── Header ────────────────────────────────────

/**
 * Renderiza el header estándar.
 * @param {object} opts  { titulo, subtitulo, icono, botonDerecho }
 *   botonDerecho: 'menu' | 'config' | 'back' | null
 *   onConfig: función a llamar al pulsar ⚙
 *   onBack: href destino del botón ←
 */
function renderHeader({ titulo = 'Escuela de Pádel', subtitulo = '', icono = 'icons/inicio.png',
                         botonDerecho = 'menu', onConfig = null, onBack = null } = {}) {
  const el = document.getElementById('header-container');
  if (!el) return;
  // Usar logo guardado si existe (desde cualquier módulo)
  const escuelaId = typeof Store !== 'undefined' ? Store.escuelaId : null;
  const logoGuardado = escuelaId ? localStorage.getItem('escuela_logo_' + escuelaId) : null;
  if (logoGuardado) icono = logoGuardado;
  // Usar nombre guardado si no se pasa uno específico
  const nombreGuardado = escuelaId ? localStorage.getItem('escuela_nombre_' + escuelaId) : null;
  if (nombreGuardado && titulo === 'Escuela de Pádel') titulo = nombreGuardado;

  let boton = '';
  if (botonDerecho === 'config') {
    boton = `<button class="btn-icon" onclick="(${onConfig})()" title="Configuración">⚙</button>`;
  } else if (botonDerecho === 'back') {
    boton = `<a class="btn-icon" href="${onBack}">←</a>`;
  } else if (botonDerecho === 'menu') {
    boton = `<button class="btn-icon" onclick="UI.menuUsuario()">⋮</button>`;
  }

  el.innerHTML = `
    <div class="header">
      <div class="hlogo"><img src="${icono}" alt="${titulo}"></div>
      <div class="htext">
        <div class="htitle">${titulo}</div>
        ${subtitulo ? `<div class="hsub">${subtitulo}</div>` : ''}
      </div>
      ${boton}
    </div>
    <div class="sep"></div>`;
}

// ── Filtros ───────────────────────────────────

/**
 * Activa el botón de filtro pulsado y desactiva los hermanos.
 * Llama a onChange(valor) con el value del botón.
 */
function initFiltros(containerSelector, onChange) {
  const btns = document.querySelectorAll(`${containerSelector} .fbtn`);
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (onChange) onChange(btn.dataset.value || '');
    });
  });
}

// ── Bottom Sheets ─────────────────────────────

function openSheet(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeSheet(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// Cerrar sheet al pulsar el overlay
document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay')) {
    e.target.classList.remove('open');
  }
});

// ── Cards expandibles ─────────────────────────

function toggleCard(id) {
  const exp = document.getElementById('exp-' + id);
  const chev = document.getElementById('chev-' + id);
  const card = document.getElementById('card-' + id);
  if (!exp) return;
  const abierta = exp.classList.toggle('open');
  if (chev) chev.classList.toggle('open', abierta);
  if (card) card.classList.toggle('card-open', abierta);
}

// ── Toast ─────────────────────────────────────

function toast(msg, tipo = 'ok') {
  const t = document.createElement('div');
  t.className = `toast toast-${tipo}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('visible'));
  setTimeout(() => {
    t.classList.remove('visible');
    setTimeout(() => t.remove(), 300);
  }, 2800);
}

// ── Loading ───────────────────────────────────

function showLoading(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
}

function showEmpty(containerId, msg = 'Sin datos aún') {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="empty-state">${msg}</div>`;
}

function showError(containerId, msg = 'Error al cargar') {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="empty-state error">${msg}</div>`;
}

// ── Avatares ──────────────────────────────────

const COLORES_AV = ['#2563eb','#16a34a','#f59e0b','#e05a5a','#7c3aed','#0891b2','#be185d','#b45309'];

function iniciales(nombre = '') {
  const partes = nombre.trim().split(' ');
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return nombre.slice(0, 2).toUpperCase();
}

function colorAvatar(nombre = '') {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  return COLORES_AV[Math.abs(hash) % COLORES_AV.length];
}

function avatarHTML(nombre, claseExtra = '') {
  return `<div class="av ${claseExtra}" style="background:${colorAvatar(nombre)}">${iniciales(nombre)}</div>`;
}

// ── Chips de nivel ────────────────────────────

const CHIP_NIVEL = {
  'Principiante':     'cvd',
  'Intermedio':       'caz',
  'Avanzado':         'cor',
  'Iniciación 1':     'cvd',
  'Iniciación 2':     'cvd',
  'Perfeccionamiento':'caz',
  'Competición':      'cor',
};

function chipNivel(nivel) {
  const cls = CHIP_NIVEL[nivel] || 'cgr';
  return `<span class="chip ${cls}">${nivel}</span>`;
}

// ── Formato de fecha ──────────────────────────

function formatFecha(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const dias = ['dom','lun','mar','mié','jue','vie','sáb'];
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${dias[d.getDay()]}, ${d.getDate()} ${meses[d.getMonth()]}`;
}

function formatAnio(isoStr) {
  if (!isoStr) return '';
  return new Date(isoStr).getFullYear();
}

// ── Confirmación ──────────────────────────────

function confirmar(mensaje, onOk) {
  const overlay = document.getElementById('confirm-overlay');
  const texto   = document.getElementById('confirm-texto');
  const btnOk   = document.getElementById('confirm-ok');
  if (!overlay) return;
  texto.textContent = mensaje;
  overlay.classList.add('open');
  btnOk.onclick = () => { overlay.classList.remove('open'); onOk(); };
}

// ── UI namespace (para llamar desde HTML inline) ──
const UI = {
  openSheet,
  closeSheet,
  toggleCard,
  toast,
  confirmar,
  menuUsuario: () => {
    // Crear overlay si no existe
    if (!document.getElementById('menu-overlay')) {
      const el = document.createElement('div');
      el.id = 'menu-overlay';
      el.innerHTML = `
        <style>
          #menu-overlay { position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:300;display:flex;align-items:flex-end }
          #menu-sheet   { background:#fff;border-radius:20px 20px 0 0;padding:14px 15px 32px;width:100%;max-width:480px;margin:0 auto }
          #menu-sheet .mh { display:flex;align-items:center;gap:9px;margin-bottom:14px }
          #menu-sheet .mt { font-size:16px;font-weight:900;color:#1a2332;flex:1 }
          #menu-sheet .mc { width:28px;height:28px;background:#f1f5f9;border:none;border-radius:7px;font-size:14px;font-weight:900;color:#64748b;cursor:pointer }
          #cfg-nombre-escuela { width:100%;background:#f1f5f9;border:1.5px solid transparent;border-radius:10px;padding:10px 12px;font-family:Nunito,sans-serif;font-size:13px;font-weight:700;color:#1a2332;outline:none;box-sizing:border-box;margin-top:3px }
          #cfg-nombre-escuela:focus { border-color:#2563eb;background:#fff }
          .menu-item { display:flex;align-items:center;gap:10px;padding:11px 2px;border-bottom:1px solid #f0f4f8;cursor:pointer;border-radius:8px }
          .menu-item:hover { background:#f8fafc }
          .menu-item:last-child { border-bottom:none }
          .menu-ico { width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0 }
          .menu-lbl { font-size:13px;font-weight:800;color:#1a2332 }
          .menu-sub { font-size:10px;font-weight:600;color:#94a3b8;margin-top:1px }
          .btn-guardar-esc { width:100%;padding:11px;background:#2563eb;color:#fff;border:none;border-radius:11px;font-family:Nunito,sans-serif;font-size:13px;font-weight:900;cursor:pointer;margin-top:10px }
        </style>
        <div id="menu-sheet">
          <div class="mh">
            <div class="mt">⚙ Mi escuela</div>
            <button class="mc" onclick="document.getElementById('menu-overlay').style.display='none'">✕</button>
          </div>

          <div style="font-size:9.5px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px">Nombre de la escuela</div>
          <input id="cfg-nombre-escuela" placeholder="Nombre de tu escuela">
          <button class="btn-guardar-esc" onclick="UI._guardarEscuela()">✓ Guardar nombre</button>

          <div style="height:1px;background:#f0f4f8;margin:14px 0"></div>

          <div class="menu-item" onclick="UI._cerrarSesion()">
            <div class="menu-ico" style="background:#fee2e2">🚪</div>
            <div>
              <div class="menu-lbl">Cerrar sesión</div>
              <div class="menu-sub">Salir de la cuenta actual</div>
            </div>
          </div>
        </div>`;
      el.addEventListener('click', e => { if (e.target === el) el.style.display='none'; });
      document.body.appendChild(el);

      // Cargar nombre actual
      (async () => {
        try {
          const { data } = await _sb.from('escuelas').select('nombre').eq('id', Store.escuelaId).single();
          if (data) document.getElementById('cfg-nombre-escuela').value = data.nombre || '';
        } catch(e) {}
      })();
    } else {
      document.getElementById('menu-overlay').style.display = 'flex';
    }
  },

  _guardarEscuela: async () => {
    const nombre = document.getElementById('cfg-nombre-escuela').value.trim();
    if (!nombre) { toast('Escribe el nombre de la escuela', 'warn'); return; }
    try {
      await _sb.from('escuelas').update({ nombre }).eq('id', Store.escuelaId);
      document.getElementById('menu-overlay').style.display = 'none';
      toast('Nombre guardado ✓', 'ok');
      // Actualizar subtítulo del header si existe
      const sub = document.querySelector('.hsub');
      if (sub) sub.textContent = nombre;
    } catch(e) { toast('Error al guardar', 'err'); }
  },

  _cerrarSesion: async () => {
    if (confirm('¿Cerrar sesión?')) logout();
  }
};
