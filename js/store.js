// ─────────────────────────────────────────────
//  ESCUELA DE PÁDEL — Store (capa de datos)
//  Todas las operaciones con Supabase van aquí.
//  Los módulos nunca llaman a fetch() directamente.
// ─────────────────────────────────────────────

const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Estado global en memoria ──────────────────
const Store = {
  escuelaId: null,   // UUID de la escuela activa
  usuario:   null,   // usuario autenticado
};

// ── Inicialización ────────────────────────────

/**
 * Llama esto en el <body onload> de cada página.
 * Obtiene el usuario y el escuela_id asociado.
 */
async function initStore() {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  Store.usuario = user;

  // Buscar la escuela del usuario
  let { data } = await _sb
    .from('escuelas')
    .select('id')
    .eq('usuario_id', user.id)
    .maybeSingle();

  // Si no existe aún, crearla automáticamente
  if (!data) {
    const ins = await _sb
      .from('escuelas')
      .insert({ usuario_id: user.id, nombre: 'Mi Escuela' })
      .select('id')
      .single();
    if (ins.error) {
      console.error('Error creando escuela:', ins.error);
      return;
    }
    data = ins.data;
  }

  Store.escuelaId = data.id;
}

// ── Auth ──────────────────────────────────────

async function login(email, password) {
  const { data, error } = await _sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function logout() {
  await _sb.auth.signOut();
  window.location.href = 'login.html';
}

// ── Alumnos ───────────────────────────────────

async function getAlumnos(filtros = {}) {
  let q = _sb.from('alumnos').select('*').eq('escuela_id', Store.escuelaId).order('nombre');
  if (filtros.nivel) q = q.eq('nivel', filtros.nivel);
  if (filtros.busqueda) q = q.ilike('nombre', `%${filtros.busqueda}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

async function saveAlumno(alumno) {
  // Si tiene id → actualizar; si no → insertar
  if (alumno.id) {
    const { data, error } = await _sb
      .from('alumnos')
      .update({ ...alumno, escuela_id: Store.escuelaId })
      .eq('id', alumno.id)
      .eq('escuela_id', Store.escuelaId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { id: _, ...sinId } = alumno; // quitar id si viene vacío
    const { data, error } = await _sb
      .from('alumnos')
      .insert({ ...sinId, escuela_id: Store.escuelaId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

async function deleteAlumno(id) {
  const { error } = await _sb
    .from('alumnos')
    .delete()
    .eq('id', id)
    .eq('escuela_id', Store.escuelaId);
  if (error) throw error;
}

// ── Grupos ────────────────────────────────────

async function getGrupos(filtros = {}) {
  let q = _sb.from('grupos').select('*').eq('escuela_id', Store.escuelaId).order('nombre');
  if (filtros.nivel) q = q.eq('nivel', filtros.nivel);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

async function saveGrupo(grupo) {
  if (grupo.id) {
    const { data, error } = await _sb
      .from('grupos')
      .update({ ...grupo, escuela_id: Store.escuelaId })
      .eq('id', grupo.id)
      .select().single();
    if (error) throw error;
    return data;
  } else {
    const { id: _, ...sinId } = grupo;
    const { data, error } = await _sb
      .from('grupos')
      .insert({ ...sinId, escuela_id: Store.escuelaId })
      .select().single();
    if (error) throw error;
    return data;
  }
}

async function deleteGrupo(id) {
  const { error } = await _sb
    .from('grupos')
    .delete()
    .eq('id', id)
    .eq('escuela_id', Store.escuelaId);
  if (error) throw error;
}

async function getAlumnosDeGrupo(grupoId) {
  const { data, error } = await _sb
    .from('alumno_grupos')
    .select('alumno_id, alumnos(id, nombre, nivel)')
    .eq('grupo_id', grupoId);
  if (error) throw error;
  return data.map(r => r.alumnos);
}

// ── Ejercicios ────────────────────────────────

async function getEjercicios(filtros = {}) {
  let q = _sb.from('ejercicios').select('*').eq('escuela_id', Store.escuelaId).order('nombre');
  if (filtros.categoria) q = q.eq('categoria', filtros.categoria);
  if (filtros.nivel)     q = q.eq('nivel', filtros.nivel);
  if (filtros.busqueda)  q = q.ilike('nombre', `%${filtros.busqueda}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

async function saveEjercicio(ej) {
  if (ej.id) {
    const { id, ...campos } = ej;
    const { data, error } = await _sb
      .from('ejercicios')
      .update({ ...campos, escuela_id: Store.escuelaId })
      .eq('id', id)
      .select().single();
    if (error) throw error;
    return data;
  } else {
    const { id: _, ...sinId } = ej;
    const { data, error } = await _sb
      .from('ejercicios')
      .insert({ ...sinId, escuela_id: Store.escuelaId })
      .select().single();
    if (error) throw error;
    return data;
  }
}

async function deleteEjercicio(id) {
  const { error } = await _sb
    .from('ejercicios')
    .delete()
    .eq('id', id)
    .eq('escuela_id', Store.escuelaId);
  if (error) throw error;
}

// ── Clases ────────────────────────────────────

async function getClases(filtros = {}) {
  let q = _sb
    .from('clases')
    .select('*, grupos(nombre)')
    .eq('escuela_id', Store.escuelaId)
    .order('fecha', { ascending: false });
  if (filtros.estado) q = q.eq('estado', filtros.estado);
  if (filtros.grupoId) q = q.eq('grupo_id', filtros.grupoId);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

async function saveClase(clase) {
  if (clase.id) {
    const { data, error } = await _sb
      .from('clases')
      .update({ ...clase, escuela_id: Store.escuelaId })
      .eq('id', clase.id)
      .select().single();
    if (error) throw error;
    return data;
  } else {
    const { id: _, ...sinId } = clase;
    const { data, error } = await _sb
      .from('clases')
      .insert({ ...sinId, escuela_id: Store.escuelaId })
      .select().single();
    if (error) throw error;
    return data;
  }
}

async function deleteClase(id) {
  const { error } = await _sb
    .from('clases')
    .delete()
    .eq('id', id)
    .eq('escuela_id', Store.escuelaId);
  if (error) throw error;
}

// ── Torneos ───────────────────────────────────

async function getTorneos(filtros = {}) {
  let q = _sb.from('torneos').select('*').eq('escuela_id', Store.escuelaId).order('fecha', { ascending: false });
  if (filtros.tipo) q = q.eq('tipo', filtros.tipo);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

async function getTorneo(id) {
  const { data, error } = await _sb
    .from('torneos')
    .select('*, participantes(*), partidos(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

async function saveTorneo(torneo) {
  if (torneo.id) {
    const { data, error } = await _sb
      .from('torneos')
      .update({ ...torneo, escuela_id: Store.escuelaId })
      .eq('id', torneo.id)
      .select().single();
    if (error) throw error;
    return data;
  } else {
    const { id: _, ...sinId } = torneo;
    const { data, error } = await _sb
      .from('torneos')
      .insert({ ...sinId, escuela_id: Store.escuelaId })
      .select().single();
    if (error) throw error;
    return data;
  }
}

async function savePartido(partido) {
  if (partido.id) {
    const { data, error } = await _sb
      .from('partidos')
      .update(partido)
      .eq('id', partido.id)
      .select().single();
    if (error) throw error;
    return data;
  } else {
    const { id: _, ...sinId } = partido;
    const { data, error } = await _sb
      .from('partidos')
      .insert(sinId)
      .select().single();
    if (error) throw error;
    return data;
  }
}

// ── Cobros ────────────────────────────────────

async function getCobrosAlumno(alumnoId, anio) {
  let q = _sb
    .from('cobros')
    .select('*')
    .eq('alumno_id', alumnoId)
    .eq('escuela_id', Store.escuelaId)
    .order('fecha', { ascending: false });
  if (anio) {
    q = q.gte('fecha', `${anio}-01-01`).lte('fecha', `${anio}-12-31`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

async function saveCobro(cobro) {
  if (cobro.id) {
    const { data, error } = await _sb
      .from('cobros')
      .update({ ...cobro, escuela_id: Store.escuelaId })
      .eq('id', cobro.id)
      .select().single();
    if (error) throw error;
    return data;
  } else {
    const { id: _, ...sinId } = cobro;
    const { data, error } = await _sb
      .from('cobros')
      .insert({ ...sinId, escuela_id: Store.escuelaId })
      .select().single();
    if (error) throw error;
    return data;
  }
}

async function deleteCobro(id) {
  const { error } = await _sb
    .from('cobros')
    .delete()
    .eq('id', id)
    .eq('escuela_id', Store.escuelaId);
  if (error) throw error;
}

// ── Pistas ────────────────────────────────────

async function getSemanasPista() {
  const { data, error } = await _sb
    .from('semanas_pista')
    .select('*, bloques_pista(*)')
    .eq('escuela_id', Store.escuelaId)
    .order('fecha_inicio', { ascending: false });
  if (error) throw error;
  return data;
}

async function saveSemana(semana) {
  if (semana.id) {
    const { data, error } = await _sb
      .from('semanas_pista')
      .update({ ...semana, escuela_id: Store.escuelaId })
      .eq('id', semana.id)
      .select().single();
    if (error) throw error;
    return data;
  } else {
    const { id: _, ...sinId } = semana;
    const { data, error } = await _sb
      .from('semanas_pista')
      .insert({ ...sinId, escuela_id: Store.escuelaId })
      .select().single();
    if (error) throw error;
    return data;
  }
}

async function saveBloquePista(bloque) {
  if (bloque.id) {
    const { data, error } = await _sb
      .from('bloques_pista')
      .update(bloque)
      .eq('id', bloque.id)
      .select().single();
    if (error) throw error;
    return data;
  } else {
    const { id: _, ...sinId } = bloque;
    const { data, error } = await _sb
      .from('bloques_pista')
      .insert(sinId)
      .select().single();
    if (error) throw error;
    return data;
  }
}

// ── Stats / Inicio ────────────────────────────

async function getResumenInicio() {
  // Ejecuta varias queries en paralelo para la pantalla de inicio
  const [torneos, clases, ejercicios] = await Promise.all([
    _sb.from('torneos').select('id, nombre, tipo, fecha, estado')
       .eq('escuela_id', Store.escuelaId)
       .order('fecha', { ascending: false }).limit(3),
    _sb.from('clases').select('id, fecha, hora, estado, grupos(nombre)')
       .eq('escuela_id', Store.escuelaId)
       .order('fecha', { ascending: false }).limit(5),
    _sb.from('ejercicios').select('id, nombre, categoria, usos')
       .eq('escuela_id', Store.escuelaId)
       .order('usos', { ascending: false }).limit(5),
  ]);
  return {
    torneos:    torneos.data    || [],
    clases:     clases.data     || [],
    ejercicios: ejercicios.data || [],
  };
}

// ── Configuración (pistas, monitores, etc.) ───

/**
 * Obtiene el valor de una clave de configuración.
 * Devuelve un array vacío si no existe.
 */
async function getConfig(clave) {
  const { data, error } = await _sb
    .from('configuracion')
    .select('valor')
    .eq('escuela_id', Store.escuelaId)
    .eq('clave', clave)
    .maybeSingle();
  if (error) throw error;
  return data?.valor || [];
}

/**
 * Guarda (upsert) el valor de una clave de configuración.
 * @param {string} clave  ej: 'pistas' | 'monitores'
 * @param {Array}  valor  array de strings
 */
async function saveConfig(clave, valor) {
  const { error } = await _sb
    .from('configuracion')
    .upsert(
      { escuela_id: Store.escuelaId, clave, valor, updated_at: new Date().toISOString() },
      { onConflict: 'escuela_id,clave' }
    );
  if (error) throw error;
}

/**
 * Carga de golpe varias claves de configuración.
 * @param {string[]} claves
 * @returns {Object} { pistas: [...], monitores: [...], ... }
 */
async function getConfigMultiple(claves) {
  const { data, error } = await _sb
    .from('configuracion')
    .select('clave, valor')
    .eq('escuela_id', Store.escuelaId)
    .in('clave', claves);
  if (error) throw error;
  const result = {};
  claves.forEach(c => result[c] = []);
  (data || []).forEach(row => result[row.clave] = row.valor);
  return result;
}
