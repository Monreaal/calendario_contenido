from flask import Flask, render_template, request, jsonify, redirect, url_for
import sqlite3
import os
import json
from datetime import datetime

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'calendar.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db()
    c = conn.cursor()
    
    c.executescript('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            semana TEXT DEFAULT '',
            mes TEXT DEFAULT '',
            dia TEXT DEFAULT '',
            fecha TEXT DEFAULT '',
            horario TEXT DEFAULT '',
            pilar TEXT DEFAULT '',
            estado TEXT DEFAULT 'Incompleto',
            objetivo TEXT DEFAULT '',
            enlace TEXT DEFAULT '',
            formato_imagen INTEGER DEFAULT 0,
            formato_carrusel INTEGER DEFAULT 0,
            formato_reel INTEGER DEFAULT 0,
            formato_historia INTEGER DEFAULT 0,
            gancho TEXT DEFAULT '',
            descripcion TEXT DEFAULT '',
            hashtags TEXT DEFAULT '',
            indicaciones_diseno TEXT DEFAULT '',
            notas TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS proyectos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT DEFAULT '',
            fecha_inicio TEXT DEFAULT '',
            fecha_fin TEXT DEFAULT '',
            objetivo TEXT DEFAULT '',
            recursos TEXT DEFAULT '',
            notas TEXT DEFAULT '',
            estado TEXT DEFAULT 'Activo',
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS etapas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            proyecto_id INTEGER NOT NULL,
            tarea TEXT NOT NULL,
            completada INTEGER DEFAULT 0,
            vencimiento TEXT DEFAULT '',
            FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS fechas_importantes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha TEXT NOT NULL,
            titulo TEXT NOT NULL,
            tipo TEXT DEFAULT 'efeméride',
            notas TEXT DEFAULT ''
        );
    ''')
    
    # Seed sample data if empty
    count = c.execute("SELECT COUNT(*) FROM posts").fetchone()[0]
    if count == 0:
        sample_posts = [
            ('SEMANA 1', 'Enero', 'Lunes', '2025-01-06', '20:00', 'Estrategia de Marketing', 'Completo', 'Aumentar visitas al perfil', '', 0, 0, 1, 0, 'Este truco usan las empresas para que compres el producto más caro', '¿Conocías el efecto Halo? ✨ Comentá cómo lo aplicarías a tu marca.', '#neuromarketing #marketingdigital #estrategiademarketing', 'Portada con persona + texto + emojis', ''),
            ('SEMANA 1', 'Enero', 'Lunes', '2025-01-06', '12:00', 'Herramientas digitales', 'En proceso', 'Aumentar interacciones', '', 0, 1, 0, 0, '4 extensiones para emprendedores', '4 extensiones para emprendedores 💻 ¿Cuál es tu favorita? 🤔', '#herramientasdigitales #emprendedores #emprender', 'Mockup de PC + diapositivas simples', ''),
            ('SEMANA 1', 'Enero', 'Martes', '2025-01-07', '20:00', 'Tips de redes sociales', 'Incompleto', 'Visitas al sitio web', '', 0, 0, 1, 0, 'Acá está la verdad sobre las redes sociales', 'Crecer en redes sociales no es cuestión de trucos ni atajos 👩🏻‍💻', '#emprendedores #redessociales #marketingdigital', 'Edición simple.', ''),
            ('SEMANA 2', 'Enero', 'Miércoles', '2025-01-15', '19:00', 'Juego de Marketing', 'Completo', 'Aumentar interacciones', '', 1, 0, 0, 0, 'Ganá acceso a todos nuestros cursos', 'Jugá y ganá 🎁 Encontrá los 5 términos escondidos de Marketing Digital', '#tipsinstragram #instamarketing #tipsmarketing', '', ''),
            ('SEMANA 2', 'Enero', 'Jueves', '2025-01-16', '18:00', 'Recurso descargable', 'En proceso', 'Captar emails', '', 0, 1, 0, 0, 'Accedé al Calendario 2025 GRATIS 🎁', 'Comentá CALENDARIO y recibí el acceso por mensaje directo', '#calendarioeditorial #communitymanager #socialmediamanager', '', ''),
        ]
        c.executemany('''INSERT INTO posts (semana, mes, dia, fecha, horario, pilar, estado, objetivo, enlace,
            formato_imagen, formato_carrusel, formato_reel, formato_historia, gancho, descripcion, hashtags, indicaciones_diseno, notas)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''', sample_posts)
        
        sample_fechas = [
            ('2025-02-03', 'Carnaval en Argentina', 'festivo', ''),
            ('2025-02-04', 'Carnaval en Argentina', 'festivo', ''),
            ('2025-02-14', 'San Valentín', 'comercial', 'Gran oportunidad para contenido romántico y de regalos'),
            ('2025-03-08', 'Día Internacional de la Mujer', 'efeméride', ''),
            ('2025-04-18', 'Viernes Santo', 'festivo', ''),
            ('2025-05-01', 'Día del Trabajador', 'festivo', ''),
            ('2025-06-20', 'Día de la Bandera', 'festivo', ''),
            ('2025-11-28', 'Black Friday', 'comercial', 'Preparar campañas de descuentos'),
            ('2025-12-02', 'Cyber Monday', 'comercial', ''),
            ('2025-12-25', 'Navidad', 'festivo', ''),
        ]
        c.executemany('INSERT INTO fechas_importantes (fecha, titulo, tipo, notas) VALUES (?,?,?,?)', sample_fechas)
        
        c.execute('''INSERT INTO proyectos (nombre, descripcion, fecha_inicio, fecha_fin, objetivo, recursos, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?)''',
            ('Lanzamiento Newsletter', 'Crear y lanzar newsletter mensual para la comunidad', '2025-01-01', '2025-03-31',
             'Captar 500 suscriptores en Q1', 'Mailchimp, Canva, copywriter', 'Activo'))
        
        proj_id = c.lastrowid
        etapas = [
            (proj_id, 'Definir temática y formato', 1, '2025-01-15'),
            (proj_id, 'Diseñar plantilla visual', 0, '2025-01-31'),
            (proj_id, 'Escribir primera edición', 0, '2025-02-15'),
            (proj_id, 'Configurar plataforma de envío', 0, '2025-02-28'),
        ]
        c.executemany('INSERT INTO etapas (proyecto_id, tarea, completada, vencimiento) VALUES (?,?,?,?)', etapas)
    
    conn.commit()
    conn.close()

# ── ROUTES ──────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html')

# POSTS API
@app.route('/api/posts', methods=['GET'])
def get_posts():
    mes = request.args.get('mes', '')
    conn = get_db()
    if mes:
        rows = conn.execute("SELECT * FROM posts WHERE mes=? ORDER BY fecha, horario", (mes,)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM posts ORDER BY fecha, horario").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/posts', methods=['POST'])
def create_post():
    d = request.json
    conn = get_db()
    c = conn.cursor()
    c.execute('''INSERT INTO posts (semana, mes, dia, fecha, horario, pilar, estado, objetivo, enlace,
        formato_imagen, formato_carrusel, formato_reel, formato_historia, gancho, descripcion, hashtags, indicaciones_diseno, notas)
        VALUES (:semana,:mes,:dia,:fecha,:horario,:pilar,:estado,:objetivo,:enlace,
        :formato_imagen,:formato_carrusel,:formato_reel,:formato_historia,:gancho,:descripcion,:hashtags,:indicaciones_diseno,:notas)''', d)
    new_id = c.lastrowid
    conn.commit()
    row = conn.execute("SELECT * FROM posts WHERE id=?", (new_id,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@app.route('/api/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    d = request.json
    d['id'] = post_id
    d['updated_at'] = datetime.now().isoformat()
    conn = get_db()
    conn.execute('''UPDATE posts SET semana=:semana, mes=:mes, dia=:dia, fecha=:fecha, horario=:horario,
        pilar=:pilar, estado=:estado, objetivo=:objetivo, enlace=:enlace,
        formato_imagen=:formato_imagen, formato_carrusel=:formato_carrusel, formato_reel=:formato_reel,
        formato_historia=:formato_historia, gancho=:gancho, descripcion=:descripcion,
        hashtags=:hashtags, indicaciones_diseno=:indicaciones_diseno, notas=:notas, updated_at=:updated_at
        WHERE id=:id''', d)
    conn.commit()
    row = conn.execute("SELECT * FROM posts WHERE id=?", (post_id,)).fetchone()
    conn.close()
    return jsonify(dict(row))

@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    conn = get_db()
    conn.execute("DELETE FROM posts WHERE id=?", (post_id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

# PROYECTOS API
@app.route('/api/proyectos', methods=['GET'])
def get_proyectos():
    conn = get_db()
    proyectos = conn.execute("SELECT * FROM proyectos ORDER BY created_at DESC").fetchall()
    result = []
    for p in proyectos:
        proj = dict(p)
        etapas = conn.execute("SELECT * FROM etapas WHERE proyecto_id=? ORDER BY id", (p['id'],)).fetchall()
        proj['etapas'] = [dict(e) for e in etapas]
        result.append(proj)
    conn.close()
    return jsonify(result)

@app.route('/api/proyectos', methods=['POST'])
def create_proyecto():
    d = request.json
    conn = get_db()
    c = conn.cursor()
    c.execute('''INSERT INTO proyectos (nombre, descripcion, fecha_inicio, fecha_fin, objetivo, recursos, notas, estado)
        VALUES (:nombre,:descripcion,:fecha_inicio,:fecha_fin,:objetivo,:recursos,:notas,:estado)''', d)
    new_id = c.lastrowid
    for et in d.get('etapas', []):
        c.execute("INSERT INTO etapas (proyecto_id, tarea, completada, vencimiento) VALUES (?,?,?,?)",
                  (new_id, et['tarea'], et.get('completada', 0), et.get('vencimiento', '')))
    conn.commit()
    row = conn.execute("SELECT * FROM proyectos WHERE id=?", (new_id,)).fetchone()
    proj = dict(row)
    etapas = conn.execute("SELECT * FROM etapas WHERE proyecto_id=?", (new_id,)).fetchall()
    proj['etapas'] = [dict(e) for e in etapas]
    conn.close()
    return jsonify(proj), 201

@app.route('/api/proyectos/<int:proj_id>', methods=['PUT'])
def update_proyecto(proj_id):
    d = request.json
    d['id'] = proj_id
    conn = get_db()
    conn.execute('''UPDATE proyectos SET nombre=:nombre, descripcion=:descripcion, fecha_inicio=:fecha_inicio,
        fecha_fin=:fecha_fin, objetivo=:objetivo, recursos=:recursos, notas=:notas, estado=:estado
        WHERE id=:id''', d)
    conn.execute("DELETE FROM etapas WHERE proyecto_id=?", (proj_id,))
    for et in d.get('etapas', []):
        conn.execute("INSERT INTO etapas (proyecto_id, tarea, completada, vencimiento) VALUES (?,?,?,?)",
                     (proj_id, et['tarea'], et.get('completada', 0), et.get('vencimiento', '')))
    conn.commit()
    row = conn.execute("SELECT * FROM proyectos WHERE id=?", (proj_id,)).fetchone()
    proj = dict(row)
    etapas = conn.execute("SELECT * FROM etapas WHERE proyecto_id=?", (proj_id,)).fetchall()
    proj['etapas'] = [dict(e) for e in etapas]
    conn.close()
    return jsonify(proj)

@app.route('/api/proyectos/<int:proj_id>', methods=['DELETE'])
def delete_proyecto(proj_id):
    conn = get_db()
    conn.execute("DELETE FROM proyectos WHERE id=?", (proj_id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

@app.route('/api/etapas/<int:etapa_id>/toggle', methods=['POST'])
def toggle_etapa(etapa_id):
    conn = get_db()
    etapa = conn.execute("SELECT * FROM etapas WHERE id=?", (etapa_id,)).fetchone()
    new_val = 0 if etapa['completada'] else 1
    conn.execute("UPDATE etapas SET completada=? WHERE id=?", (new_val, etapa_id))
    conn.commit()
    conn.close()
    return jsonify({'completada': bool(new_val)})

# FECHAS IMPORTANTES API
@app.route('/api/fechas', methods=['GET'])
def get_fechas():
    conn = get_db()
    rows = conn.execute("SELECT * FROM fechas_importantes ORDER BY fecha").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/fechas', methods=['POST'])
def create_fecha():
    d = request.json
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT INTO fechas_importantes (fecha, titulo, tipo, notas) VALUES (:fecha,:titulo,:tipo,:notas)", d)
    new_id = c.lastrowid
    conn.commit()
    row = conn.execute("SELECT * FROM fechas_importantes WHERE id=?", (new_id,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@app.route('/api/fechas/<int:fecha_id>', methods=['DELETE'])
def delete_fecha(fecha_id):
    conn = get_db()
    conn.execute("DELETE FROM fechas_importantes WHERE id=?", (fecha_id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

# STATS
@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) as c FROM posts").fetchone()['c']
    completos = conn.execute("SELECT COUNT(*) as c FROM posts WHERE estado='Completo'").fetchone()['c']
    en_proceso = conn.execute("SELECT COUNT(*) as c FROM posts WHERE estado='En proceso'").fetchone()['c']
    incompletos = conn.execute("SELECT COUNT(*) as c FROM posts WHERE estado='Incompleto'").fetchone()['c']
    por_pilar = conn.execute("SELECT pilar, COUNT(*) as c FROM posts WHERE pilar!='' GROUP BY pilar ORDER BY c DESC LIMIT 6").fetchall()
    por_formato = {
        'imagen': conn.execute("SELECT COUNT(*) as c FROM posts WHERE formato_imagen=1").fetchone()['c'],
        'carrusel': conn.execute("SELECT COUNT(*) as c FROM posts WHERE formato_carrusel=1").fetchone()['c'],
        'reel': conn.execute("SELECT COUNT(*) as c FROM posts WHERE formato_reel=1").fetchone()['c'],
        'historia': conn.execute("SELECT COUNT(*) as c FROM posts WHERE formato_historia=1").fetchone()['c'],
    }
    conn.close()
    return jsonify({
        'total': total, 'completos': completos, 'en_proceso': en_proceso, 'incompletos': incompletos,
        'por_pilar': [dict(r) for r in por_pilar],
        'por_formato': por_formato,
        'completado_pct': round((completos / total * 100) if total > 0 else 0, 1)
    })

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug)
