'use client'
import { ViewId } from '@/app/page'

const NAV: { id: ViewId; emoji: string; label: string }[] = [
  { id: 'dashboard',  emoji: '◫',  label: 'Dashboard' },
  { id: 'calendario', emoji: '▦',  label: 'Calendario' },
  { id: 'posts',      emoji: '✦',  label: 'Posts' },
  { id: 'proyectos',  emoji: '◈',  label: 'Proyectos' },
  { id: 'fechas',     emoji: '◷',  label: 'Fechas Clave' },
  { id: 'marca',      emoji: '◉',  label: 'Mi Marca' },
]

interface Props {
  current: ViewId
  onNavigate: (v: ViewId) => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export default function Sidebar({ current, onNavigate }: Props) {
  return (
    <aside className="w-full h-full flex flex-col" style={{ background: 'var(--bg)', borderRight: '1px solid var(--border)' }}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-14" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >C</div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>Calendario</div>
          <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>Editorial 2025</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
        {NAV.map(item => {
          const active = current === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left w-full transition-all duration-150 whitespace-nowrap"
              style={{
                background: active ? 'var(--surface-hover)' : 'transparent',
                color:      active ? 'var(--text)'          : 'var(--text-sub)',
                fontWeight: active ? 500 : 400,
                fontSize: 14,
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span className="text-sm flex-shrink-0" style={{ opacity: active ? 1 : 0.6 }}>{item.emoji}</span>
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="text-xs px-2" style={{ color: 'var(--text-muted)' }}>
          Luzzi Digital · 2025
        </div>
      </div>
    </aside>
  )
}
