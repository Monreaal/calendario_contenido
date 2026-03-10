/**
 * Database layer using sql.js — pure JavaScript SQLite,
 * no native compilation required (works on Windows/Mac/Linux without Visual Studio).
 */
import path from 'path'
import fs from 'fs'

const DB_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DB_DIR, 'calendar.db')

let _db: any = null

function getSqlJs() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const initSqlJs = require('sql.js')
  return initSqlJs()
}

export async function getDb() {
  if (_db) return _db
  fs.mkdirSync(DB_DIR, { recursive: true })
  const SQL = await getSqlJs()
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH)
    _db = new SQL.Database(fileBuffer)
  } else {
    _db = new SQL.Database()
  }
  initSchema()
  return _db
}

function persist() {
  if (!_db) return
  const data: Uint8Array = _db.export()
  fs.mkdirSync(DB_DIR, { recursive: true })
  fs.writeFileSync(DB_PATH, Buffer.from(data))
}

function initSchema() {
  _db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      semana TEXT DEFAULT '', mes TEXT DEFAULT '', dia TEXT DEFAULT '',
      fecha TEXT DEFAULT '', horario TEXT DEFAULT '', pilar TEXT DEFAULT '',
      estado TEXT DEFAULT 'Incompleto', objetivo TEXT DEFAULT '', enlace TEXT DEFAULT '',
      formato_imagen INTEGER DEFAULT 0, formato_carrusel INTEGER DEFAULT 0,
      formato_reel INTEGER DEFAULT 0, formato_historia INTEGER DEFAULT 0,
      gancho TEXT DEFAULT '', descripcion TEXT DEFAULT '', hashtags TEXT DEFAULT '',
      indicaciones_diseno TEXT DEFAULT '', notas TEXT DEFAULT '',
      red_social TEXT DEFAULT 'Instagram',
      moodboard_imgs TEXT DEFAULT '[]',
      moodboard_links TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS marca (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_marca TEXT DEFAULT '',
      descripcion TEXT DEFAULT '',
      publico_objetivo TEXT DEFAULT '',
      mision TEXT DEFAULT '',
      vision TEXT DEFAULT '',
      valores TEXT DEFAULT '',
      pilares TEXT DEFAULT '',
      personalidad TEXT DEFAULT '',
      tono_voz TEXT DEFAULT '',
      tipografias TEXT DEFAULT '',
      colores TEXT DEFAULT '',
      tipo_contenido TEXT DEFAULT '',
      moodboard_imgs TEXT DEFAULT '[]',
      moodboard_links TEXT DEFAULT '',
      notas TEXT DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS proyectos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL, descripcion TEXT DEFAULT '',
      fecha_inicio TEXT DEFAULT '', fecha_fin TEXT DEFAULT '',
      objetivo TEXT DEFAULT '', recursos TEXT DEFAULT '',
      notas TEXT DEFAULT '', estado TEXT DEFAULT 'Activo',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS etapas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      proyecto_id INTEGER NOT NULL, tarea TEXT NOT NULL,
      completada INTEGER DEFAULT 0, vencimiento TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS fechas_importantes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL, titulo TEXT NOT NULL,
      tipo TEXT DEFAULT 'efeméride', notas TEXT DEFAULT ''
    );
  `)
  // Migrate existing DBs — add new columns if missing (safe: IF NOT EXISTS not supported in ALTER, use try/catch)
  const migrations = [
    "ALTER TABLE posts ADD COLUMN red_social TEXT DEFAULT 'Instagram'",
    "ALTER TABLE posts ADD COLUMN moodboard_imgs TEXT DEFAULT '[]'",
    "ALTER TABLE posts ADD COLUMN moodboard_links TEXT DEFAULT ''",
  ]
  for (const m of migrations) {
    try { _db.run(m) } catch (_) { /* column already exists */ }
  }

  const count = queryOne('SELECT COUNT(*) as c FROM posts') as { c: number }
  if (!count || count.c === 0) { seedData(); persist() }
}

export function queryAll(sql: string, params: any[] = []): any[] {
  const stmt = _db.prepare(sql)
  stmt.bind(params)
  const rows: any[] = []
  while (stmt.step()) rows.push(stmt.getAsObject())
  stmt.free()
  return rows
}

export function queryOne(sql: string, params: any[] = []): any {
  return queryAll(sql, params)[0] ?? null
}

export function run(sql: string, params: any[] = []): void {
  _db.run(sql, params)
  persist()
}

export function insert(sql: string, params: any[] = []): number {
  _db.run(sql, params)
  const r = queryOne('SELECT last_insert_rowid() as id')
  persist()
  return r?.id ?? 0
}

function seedData() {
  const posts = [
    ['SEMANA 1','Enero','Lunes','2025-01-06','20:00','Estrategia de Marketing','Completo','Aumentar visitas al perfil','',0,0,1,0,'Este truco usan las empresas para que compres el producto más caro','¿Conocías el efecto Halo? ✨ Comentá cómo lo aplicarías a tu marca.','#neuromarketing #marketingdigital','Portada con persona + texto',''],
    ['SEMANA 1','Enero','Lunes','2025-01-06','12:00','Herramientas digitales','En proceso','Aumentar interacciones','',0,1,0,0,'4 extensiones para emprendedores','4 extensiones para emprendedores 💻','#herramientasdigitales','Mockup de PC',''],
    ['SEMANA 1','Enero','Martes','2025-01-07','20:00','Tips de redes sociales','Incompleto','Visitas al sitio web','',0,0,1,0,'La verdad sobre las redes sociales','Crecer en redes no es cuestión de trucos','#redessociales','Edición simple.',''],
    ['SEMANA 2','Enero','Miércoles','2025-01-15','19:00','Juego de Marketing','Completo','Aumentar interacciones','',1,0,0,0,'Ganá acceso a todos nuestros cursos','Jugá y ganá 🎁','#instamarketing','',''],
    ['SEMANA 2','Enero','Jueves','2025-01-16','18:00','Recurso descargable','En proceso','Captar emails','',0,1,0,0,'Accedé al Calendario 2025 GRATIS 🎁','Comentá CALENDARIO','#calendarioeditorial','',''],
    ['SEMANA 3','Febrero','Lunes','2025-02-10','20:00','Branding','Incompleto','Reconocimiento de marca','',0,0,1,0,'3 errores de branding','El branding no es solo el logo 🎨','#branding','Fondo oscuro',''],
    ['SEMANA 3','Febrero','Viernes','2025-02-14','18:00','Fecha especial','Completo','Aumentar interacciones','',1,0,0,0,'Marketing de amor 💕','El amor también se hace con estrategia','#sanvalentin','Paleta roja',''],
    ['SEMANA 4','Marzo','Lunes','2025-03-03','20:00','Estrategia de Marketing','En proceso','Aumentar seguidores','',0,1,0,0,'De 0 a 10k seguidores','La guía definitiva para crecer en Instagram','#instagram','Infografía',''],
  ]
  for (const p of posts) {
    _db.run(`INSERT INTO posts (semana,mes,dia,fecha,horario,pilar,estado,objetivo,enlace,
      formato_imagen,formato_carrusel,formato_reel,formato_historia,gancho,descripcion,hashtags,indicaciones_diseno,notas)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, p)
  }
  const fechas = [
    ['2025-02-03','Carnaval en Argentina','festivo',''],
    ['2025-02-14','San Valentín','comercial','Gran oportunidad para contenido romántico'],
    ['2025-03-08','Día Internacional de la Mujer','efeméride',''],
    ['2025-04-18','Viernes Santo','festivo',''],
    ['2025-05-01','Día del Trabajador','festivo',''],
    ['2025-05-25','Día de la Patria','festivo',''],
    ['2025-11-28','Black Friday','comercial','Preparar campañas de descuentos'],
    ['2025-12-25','Navidad','festivo',''],
  ]
  for (const f of fechas) {
    _db.run('INSERT INTO fechas_importantes (fecha,titulo,tipo,notas) VALUES (?,?,?,?)', f)
  }
  _db.run(`INSERT INTO proyectos (nombre,descripcion,fecha_inicio,fecha_fin,objetivo,recursos,estado)
    VALUES (?,?,?,?,?,?,?)`,
    ['Lanzamiento Newsletter','Crear newsletter mensual','2025-01-01','2025-03-31','500 suscriptores Q1','Mailchimp, Canva','Activo'])
  const projRow = queryOne('SELECT last_insert_rowid() as id')
  const pid = projRow?.id
  for (const [t,c,v] of [['Definir temática',1,'2025-01-15'],['Diseñar plantilla',0,'2025-01-31'],['Escribir primera edición',0,'2025-02-15'],['Configurar envío',0,'2025-02-28']]) {
    _db.run('INSERT INTO etapas (proyecto_id,tarea,completada,vencimiento) VALUES (?,?,?,?)', [pid,t,c,v])
  }
}
