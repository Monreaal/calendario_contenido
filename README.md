# 📅 Calendario Editorial — Next.js

Planificador de contenido para redes sociales: **Next.js 15**, **TypeScript**, **Tailwind CSS** y **SQLite** (sql.js — sin compilación nativa).

## 🚀 Instalación y uso local

```bash
# 1. Descomprimí el zip y entrá a la carpeta
cd calendario-next

# 2. Instalar dependencias (NO requiere Visual Studio ni compiladores)
npm install

# 3. Correr en desarrollo
npm run dev
# → http://localhost:3000
```

La base de datos SQLite se crea automáticamente en `data/calendar.db` con datos de ejemplo.

> ✅ **Funciona en Windows sin Visual Studio** — usa `sql.js` (JavaScript puro) en vez de `better-sqlite3`.

---

## ☁️ Deploy en Railway (gratis)

1. Subí la carpeta a GitHub
2. Entrá a [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Railway detecta Next.js automáticamente ✅

---

## 📁 Estructura

```
calendario-next/
├── app/
│   ├── api/posts/         GET (filtros mes/estado/búsqueda) + POST
│   ├── api/posts/[id]/    PUT + DELETE
│   ├── api/proyectos/     GET + POST
│   ├── api/proyectos/[id] PUT + DELETE
│   ├── api/etapas/[id]/   POST (toggle completada)
│   ├── api/fechas/        GET + POST
│   ├── api/fechas/[id]/   DELETE
│   ├── api/stats/         GET
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Sidebar.tsx
│   ├── Dashboard.tsx
│   ├── CalendarioView.tsx   posts + fechas importantes en el calendario
│   ├── PostModal.tsx
│   ├── PostsView.tsx        filtros por mes, estado y búsqueda
│   ├── ProyectosView.tsx
│   └── FechasView.tsx
├── lib/
│   ├── db.ts               sql.js (puro JS, sin compilación)
│   └── types.ts
└── data/
    └── calendar.db         auto-generado al primer arranque
```
