'use client'
import { useEffect, useState } from 'react'
import type { Stats, FechaImportante } from '@/lib/types'

function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon: string; accent: string }) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
          style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold" style={{ color: 'var(--text)' }}>{value}</div>
      <div className="h-0.5 rounded-full w-8" style={{ background: accent }} />
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [fechas, setFechas] = useState<FechaImportante[]>([])

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats)
    fetch('/api/fechas').then(r => r.json()).then((data: FechaImportante[]) => {
      const today = new Date().toISOString().slice(0, 10)
      setFechas(data.filter(f => f.fecha >= today).slice(0, 6))
    })
  }, [])

  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>Cargando...</div>
    </div>
  )

  const maxPilar = stats.por_pilar[0]?.c || 1

  return (
    <div className="space-y-5 animate-stagger">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Bienvenido 👋</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-sub)' }}>Gestioná tu contenido para redes sociales</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Posts totales"  value={stats.total}       icon="✦" accent="#F5F5F5" />
        <StatCard label="Completados"    value={stats.completos}   icon="✓" accent="#4ADE80" />
        <StatCard label="En proceso"     value={stats.en_proceso}  icon="◷" accent="#FACC15" />
        <StatCard label="% Completado"   value={`${stats.completado_pct}%`} icon="%" accent="#C084FC" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pilares */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Posts por pilar de contenido</h3>
          {stats.por_pilar.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {stats.por_pilar.map(p => (
                <div key={p.pilar} className="flex items-center gap-3">
                  <span className="text-xs min-w-[130px] truncate" style={{ color: 'var(--text-sub)' }}>{p.pilar}</span>
                  <div className="flex-1 rounded-full h-1" style={{ background: 'var(--border)' }}>
                    <div className="h-1 rounded-full transition-all duration-700"
                      style={{ width: `${Math.round(p.c / maxPilar * 100)}%`, background: 'var(--text)' }} />
                  </div>
                  <span className="text-xs font-semibold min-w-[16px] text-right" style={{ color: 'var(--text-sub)' }}>{p.c}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formatos */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Formatos de contenido</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key:'imagen',   icon:'🖼️', label:'Imagen'   },
              { key:'carrusel', icon:'🎠', label:'Carrusel' },
              { key:'reel',     icon:'🎬', label:'Reel'     },
              { key:'historia', icon:'⏺️', label:'Historia' },
            ].map(f => (
              <div key={f.key} className="rounded-xl p-3 flex items-center gap-3"
                style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                <div className="text-2xl">{f.icon}</div>
                <div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</div>
                  <div className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                    {stats.por_formato[f.key as keyof typeof stats.por_formato]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Próximas fechas */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Próximas fechas importantes</h3>
        {fechas.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No hay fechas próximas</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {fechas.map(f => {
              const d = new Date(f.fecha + 'T00:00:00')
              const tipoCols: Record<string,string> = { comercial:'#F5F5F5', festivo:'#C084FC', efeméride:'#A8A8A8', personal:'#FACC15' }
              const col = tipoCols[f.tipo] || '#A8A8A8'
              return (
                <div key={f.id} className="rounded-xl p-3 flex flex-col gap-1"
                  style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl font-bold" style={{ color: col }}>{d.getDate()}</div>
                  <div className="text-xs font-medium leading-tight" style={{ color: 'var(--text)' }}>{f.titulo}</div>
                  <div className="text-xs" style={{ color: col, opacity: 0.8 }}>{f.tipo}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
