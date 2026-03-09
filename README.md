# 📅 Calendario Editorial — Luzzi Digital

Planificador de contenido para redes sociales con base de datos local SQLite.

## 🚀 Instalación local

```bash
# 1. Clonar repositorio
git clone https://github.com/TU_USUARIO/calendario-editorial.git
cd calendario-editorial

# 2. Crear entorno virtual (recomendado)
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Correr la app
python app.py
```

Abrí el navegador en: **http://localhost:5000**

La base de datos SQLite se crea automáticamente en `data/calendar.db` con datos de ejemplo.

---

## ☁️ Deploy en la nube (opciones gratuitas)

### Opción 1: Railway (recomendado, muy fácil)
1. Creá cuenta en [railway.app](https://railway.app)
2. Conectá tu repo de GitHub
3. Railway detecta Flask automáticamente ✅
4. La app queda en una URL pública

**Agregar estos archivos para Railway:**

`Procfile`:
```
web: python app.py
```

`app.py` — cambiar la última línea a:
```python
if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
```

---

### Opción 2: Render
1. Creá cuenta en [render.com](https://render.com)
2. New Web Service → conectá GitHub
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `python app.py`

---

### Opción 3: PythonAnywhere
1. Creá cuenta en [pythonanywhere.com](https://pythonanywhere.com)
2. Subí los archivos vía Files
3. Configurá un Web App WSGI apuntando a `app`

---

## 📁 Estructura del proyecto

```
calendario-editorial/
├── app.py                  # Backend Flask + API REST
├── requirements.txt
├── data/
│   └── calendar.db         # SQLite (se crea automáticamente)
├── templates/
│   └── index.html          # SPA principal
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

## 🗃️ Base de datos (SQLite)

| Tabla | Descripción |
|---|---|
| `posts` | Posts del calendario editorial |
| `proyectos` | Proyectos con estado y descripción |
| `etapas` | Tareas por proyecto |
| `fechas_importantes` | Fechas comerciales y efemérides |

## ✨ Features

- **Dashboard** con estadísticas, pilares de contenido y fechas próximas
- **Calendario mensual** visual con todos los posts y fechas importantes
- **Gestión de posts** con filtros por mes, estado y búsqueda
- **Proyectos** con seguimiento de etapas y progreso
- **Fechas importantes** con timeline por mes
- Base de datos local SQLite (sin necesidad de servidor externo)
- API REST completa para CRUD de todos los datos
