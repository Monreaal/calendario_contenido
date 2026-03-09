'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import CalendarioView from '@/components/CalendarioView'
import PostsView from '@/components/PostsView'
import ProyectosView from '@/components/ProyectosView'
import FechasView from '@/components/FechasView'

export type ViewId = 'dashboard' | 'calendario' | 'posts' | 'proyectos' | 'fechas'

const VIEW_LABELS: Record<ViewId, string> = {
  dashboard: 'Dashboard', calendario: 'Calendario', posts: 'Posts',
  proyectos: 'Proyectos', fechas: 'Fechas Clave'
}

export default function Home() {
  const [view, setView] = useState<ViewId>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const sidebarW = sidebarOpen ? 220 : 60

  return (
    <div className="flex min-h-screen" style={{ background: '#0D0F14' }}>
      <Sidebar current={view} onNavigate={setView} collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(v => !v)} />

      <main className="flex-1 flex flex-col min-h-screen transition-all duration-200" style={{ marginLeft: sidebarW }}>
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-40"
          style={{ background: '#0D0F14', borderBottom: '1px solid #232838' }}>
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-text">{VIEW_LABELS[view]}</h1>
          </div>
          <div className="flex gap-2">
            {view === 'posts' && (
              <button onClick={() => document.dispatchEvent(new CustomEvent('open-new-post'))} className="btn-primary">
                <span>+</span> Nuevo Post
              </button>
            )}
            {view === 'proyectos' && (
              <button onClick={() => document.dispatchEvent(new CustomEvent('open-new-proyecto'))} className="btn-primary">
                <span>+</span> Nuevo Proyecto
              </button>
            )}
            {view === 'fechas' && (
              <button onClick={() => document.dispatchEvent(new CustomEvent('open-new-fecha'))} className="btn-primary">
                <span>+</span> Agregar fecha
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {view === 'dashboard'  && <Dashboard />}
          {view === 'calendario' && <CalendarioView />}
          {view === 'posts'      && <PostsView />}
          {view === 'proyectos'  && <ProyectosView />}
          {view === 'fechas'     && <FechasView />}
        </div>
      </main>
    </div>
  )
}
