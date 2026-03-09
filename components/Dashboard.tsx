'use client'
import { useEffect, useState } from 'react'
import type { Stats, FechaImportante } from '@/lib/types'

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8B92A8' }}>{label}</span>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: color + '22' }}>
          <span style={{ color }}>{sub}</span>
        </div>
      </div>
      <div className="text-3xl font-bold text-text">{value}</div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
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
      <div className="text-textSub text-sm animate-pulse">Cargando...</div>
    </div>
  )

  const maxPilar = stats.por_pilar[0]?.c || 1

  return (
    <div className="space-y-5 animate-stagger">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-semibold text-text">Bienvenido 👋</h2>
        <p className="text-sm text-textSub mt-0.5">Gestioná tu contenido para redes sociales</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Posts totales"  value={stats.total}       sub="✦" color="#4F7EF7" />
        <StatCard label="Completados"    value={stats.completos}   sub="✓" color="#34C97B" />
        <StatCard label="En proceso"     value={stats.en_proceso}  sub="◷" color="#F5A623" />
        <StatCard label="% Completado"   value={`${stats.completado_pct}%`} sub="%" color="#A78BFA" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pilares */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-text mb-4">Posts por pilar de contenido</h3>
          {stats.por_pilar.length === 0 ? (
            <p className="text-textMuted text-sm">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {stats.por_pilar.map(p => (
                <div key={p.pilar} className="flex items-center gap-3">
                  <span className="text-xs text-textSub min-w-[130px] truncate">{p.pilar}</span>
                  <div className="flex-1 rounded-full h-1.5" style={{ background: '#232838' }}>
                    <div className="h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${Math.round(p.c / maxPilar * 100)}%`, background: 'linear-gradient(90deg, #4F7EF7, #7C3AED)' }} />
                  </div>
                  <span className="text-xs font-semibold text-textSub min-w-[16px] text-right">{p.c}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formatos */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-text mb-4">Formatos de contenido</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key:'imagen',   icon:'🖼️', label:'Imagen',   color:'#4F7EF7' },
              { key:'carrusel', icon:'🎠', label:'Carrusel', color:'#A78BFA' },
              { key:'reel',     icon:'🎬', label:'Reel',     color:'#34C97B' },
              { key:'historia', icon:'⏺️', label:'Historia', color:'#F5A623' },
            ].map(f => (
              <div key={f.key} className="rounded-xl p-3 flex items-center gap-3" style={{ background: '#1A1E2A', border: '1px solid #232838' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: f.color + '22' }}>{f.icon}</div>
                <div>
                  <div className="text-xs text-textSub">{f.label}</div>
                  <div className="text-xl font-bold text-text">{stats.por_formato[f.key as keyof typeof stats.por_formato]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Próximas fechas */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-text mb-4">Próximas fechas importantes</h3>
        {fechas.length === 0 ? (
          <p className="text-textMuted text-sm">No hay fechas próximas</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {fechas.map(f => {
              const d = new Date(f.fecha + 'T00:00:00')
              const tipoCls: Record<string,string> = {
                comercial: '#4F7EF7', festivo: '#A78BFA', efeméride: '#8B92A8', personal: '#F5A623'
              }
              const col = tipoCls[f.tipo] || '#8B92A8'
              return (
                <div key={f.id} className="rounded-xl p-3 flex flex-col gap-1" style={{ background: '#1A1E2A', border: '1px solid #232838' }}>
                  <div className="text-2xl font-bold" style={{ color: col }}>{d.getDate()}</div>
                  <div className="text-xs font-medium text-text leading-tight">{f.titulo}</div>
                  <div className="text-xs" style={{ color: col }}>{f.tipo}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
