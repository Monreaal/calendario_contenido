'use client'
import { ViewId } from '@/app/page'

const NAV = [
  { id: 'dashboard'  as ViewId, icon: '⊞', label: 'Dashboard' },
  { id: 'calendario' as ViewId, icon: '◻', label: 'Calendario' },
  { id: 'posts'      as ViewId, icon: '✦', label: 'Posts' },
  { id: 'proyectos'  as ViewId, icon: '◈', label: 'Proyectos' },
  { id: 'fechas'     as ViewId, icon: '◷', label: 'Fechas Clave' },
]

interface Props {
  current: ViewId
  onNavigate: (v: ViewId) => void
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ current, onNavigate, collapsed, onToggle }: Props) {
  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-50 transition-all duration-200 overflow-hidden"
      style={{
        width: collapsed ? 60 : 220,
        background: '#0D0F14',
        borderRight: '1px solid #232838',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 overflow-hidden whitespace-nowrap"
        style={{ borderBottom: '1px solid #232838' }}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #4F7EF7, #7C3AED)' }}>
          C
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-white font-semibold text-sm leading-tight">Calendario</div>
            <div className="text-xs" style={{ color: '#525972' }}>Editorial 2025</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-hidden">
        {NAV.map(item => {
          const active = current === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 whitespace-nowrap overflow-hidden w-full"
              style={{
                background: active ? '#1A2540' : 'transparent',
                color: active ? '#4F7EF7' : '#8B92A8',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#1A1E2A' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span className="text-base flex-shrink-0 w-5 text-center">{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Footer / toggle */}
      <div className="p-3" style={{ borderTop: '1px solid #232838' }}>
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center py-2 rounded-lg transition-all duration-150 text-xs"
          style={{ color: '#525972' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1A1E2A'; (e.currentTarget as HTMLElement).style.color = '#8B92A8' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#525972' }}
        >
          {collapsed ? '→' : '← Colapsar'}
        </button>
      </div>
    </aside>
  )
}
