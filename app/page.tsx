'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import CalendarioView from '@/components/CalendarioView'
import PostsView from '@/components/PostsView'
import ProyectosView from '@/components/ProyectosView'
import FechasView from '@/components/FechasView'
import MarcaView from '@/components/MarcaView'

export type ViewId = 'dashboard' | 'calendario' | 'posts' | 'proyectos' | 'fechas' | 'marca'

const VIEW_LABELS: Record<ViewId, string> = {
  dashboard: 'Dashboard', calendario: 'Calendario', posts: 'Posts',
  proyectos: 'Proyectos', fechas: 'Fechas Clave', marca: 'Mi Marca',
}

export default function Home() {
  const [view,        setView]        = useState<ViewId>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme,       setTheme]       = useState<'dark'|'light'>('dark')

  // Apply theme to <html>
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') root.setAttribute('data-theme', 'light')
    else root.removeAttribute('data-theme')
  }, [theme])

  // Persist theme
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark'|'light'|null
    if (saved) setTheme(saved)
  }, [])
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
  }

  const sidebarW = sidebarOpen ? 220 : 0

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Sidebar — fully hidden when closed */}
      <div
        className="fixed left-0 top-0 h-full z-50 overflow-hidden transition-all duration-250"
        style={{ width: sidebarW }}
      >
        <Sidebar
          current={view}
          onNavigate={(v) => { setView(v); }}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>

      {/* Sidebar open button — shown only when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-0 top-1/2 z-40 -translate-y-1/2 flex items-center justify-center transition-all duration-150"
          title="Abrir menú"
          style={{
            width: 20, height: 48,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderLeft: 'none',
            borderRadius: '0 8px 8px 0',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 10,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface)' }}
        >›</button>
      )}

      <main
        className="flex-1 flex flex-col min-h-screen transition-all duration-250"
        style={{ marginLeft: sidebarW }}
      >
        {/* Topbar */}
        <header
          className="h-14 flex items-center justify-between px-5 sticky top-0 z-40"
          style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="btn-icon"
              title={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
              style={{ fontSize: 16 }}
            >
              {sidebarOpen ? '☰' : '☰'}
            </button>
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {VIEW_LABELS[view]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Action buttons */}
            {view === 'posts' && (
              <button onClick={() => document.dispatchEvent(new CustomEvent('open-new-post'))} className="btn-primary">
                + Nuevo Post
              </button>
            )}
            {view === 'proyectos' && (
              <button onClick={() => document.dispatchEvent(new CustomEvent('open-new-proyecto'))} className="btn-primary">
                + Nuevo Proyecto
              </button>
            )}
            {view === 'fechas' && (
              <button onClick={() => document.dispatchEvent(new CustomEvent('open-new-fecha'))} className="btn-primary">
                + Agregar fecha
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="btn-icon"
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              style={{ fontSize: 15 }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {view === 'dashboard'  && <Dashboard />}
          {view === 'calendario' && <CalendarioView />}
          {view === 'posts'      && <PostsView />}
          {view === 'proyectos'  && <ProyectosView />}
          {view === 'fechas'     && <FechasView />}
          {view === 'marca'      && <MarcaView />}
        </div>
      </main>
    </div>
  )
}
