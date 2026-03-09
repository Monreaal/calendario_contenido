'use client'
import { useEffect, useState, useCallback } from 'react'
import type { Post, FechaImportante } from '@/lib/types'
import PostModal from './PostModal'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS   = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

function statusCls(estado: string) {
  if (estado === 'Completo')   return 'cal-pill-completo'
  if (estado === 'En proceso') return 'cal-pill-proceso'
  return 'cal-pill-incompleto'
}

export default function CalendarioView() {
  const [date, setDate]       = useState(() => new Date(2025, 0, 1))
  const [posts, setPosts]     = useState<Post[]>([])
  const [fechas, setFechas]   = useState<FechaImportante[]>([])
  const [editPost, setEditPost]   = useState<Post | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = useCallback(async () => {
    const [p, f] = await Promise.all([
      fetch('/api/posts').then(r => r.json()),
      fetch('/api/fechas').then(r => r.json()),
    ])
    setPosts(p); setFechas(f)
  }, [])

  useEffect(() => { load() }, [load])

  const year = date.getFullYear(), month = date.getMonth()

  const postsByDate: Record<string, Post[]> = {}
  posts.forEach(p => { const d = p.fecha?.slice(0,10); if (d) { postsByDate[d] = postsByDate[d]||[]; postsByDate[d].push(p) } })
  const fechasByDate: Record<string, FechaImportante[]> = {}
  fechas.forEach(f => { fechasByDate[f.fecha] = fechasByDate[f.fecha]||[]; fechasByDate[f.fecha].push(f) })

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1
  const prevDays    = new Date(year, month, 0).getDate()
  const today       = new Date().toISOString().slice(0,10)

  type Cell = { day: number; dateStr: string; current: boolean }
  const cells: Cell[] = []
  for (let i = startOffset-1; i >= 0; i--) cells.push({ day: prevDays-i, dateStr:'', current:false })
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    cells.push({ day: d, dateStr, current: true })
  }
  const rem = (7 - cells.length%7) % 7
  for (let i = 1; i <= rem; i++) cells.push({ day:i, dateStr:'', current:false })

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <button onClick={() => setDate(d => new Date(d.getFullYear(), d.getMonth()-1, 1))}
          className="btn-ghost !px-3 !py-2">←</button>
        <h2 className="text-base font-semibold text-text min-w-[160px] text-center">
          {MONTHS[month]} {year}
        </h2>
        <button onClick={() => setDate(d => new Date(d.getFullYear(), d.getMonth()+1, 1))}
          className="btn-ghost !px-3 !py-2">→</button>
        <button onClick={() => setDate(new Date())}
          className="btn-ghost !px-3 !py-1.5 !text-xs ml-1">Hoy</button>
      </div>

      {/* Grid */}
      <div className="rounded-card overflow-hidden" style={{ border: '1px solid #232838' }}>
        {/* Day headers */}
        <div className="grid grid-cols-7">
          {DAYS.map(d => (
            <div key={d} className="text-center py-3 text-xs font-medium uppercase tracking-wider"
              style={{ background: '#141720', color: '#525972', borderBottom: '1px solid #232838' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            const cellPosts  = cell.dateStr ? (postsByDate[cell.dateStr]  || []) : []
            const cellFechas = cell.dateStr ? (fechasByDate[cell.dateStr] || []) : []
            const isToday    = cell.dateStr === today
            const hasPost    = cellPosts.length > 0

            const borderRight  = (i+1) % 7 !== 0 ? '1px solid #232838' : undefined
            const borderBottom = i < cells.length - 7 ? '1px solid #232838' : undefined

            return (
              <div key={i}
                className="min-h-[88px] p-2 flex flex-col gap-1 transition-colors"
                style={{
                  background: !cell.current ? '#0D0F14' : isToday ? '#1A2540' : '#141720',
                  borderRight, borderBottom,
                  borderTop: isToday ? '2px solid #4F7EF7' : undefined,
                }}
              >
                <span className="text-xs font-medium mb-0.5" style={{
                  color: !cell.current ? '#2D3347' : isToday ? '#4F7EF7' : '#8B92A8'
                }}>{cell.day}</span>

                {cellFechas.slice(0,1).map(f => (
                  <div key={f.id} className="cal-pill cal-pill-fecha">{f.titulo}</div>
                ))}
                {cellPosts.slice(0,2).map(p => (
                  <div key={p.id}
                    className={`cal-pill ${statusCls(p.estado)}`}
                    onClick={() => { setEditPost(p); setModalOpen(true) }}
                    title={p.gancho || p.pilar}>
                    {p.pilar || p.gancho || 'Post'}
                  </div>
                ))}
                {(cellPosts.length + cellFechas.length > 3) && (
                  <div className="text-xs pl-0.5" style={{ color: '#525972' }}>
                    +{cellPosts.length + cellFechas.length - 3} más
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-textSub flex-wrap">
        {[
          { cls:'cal-pill-completo',   label:'Completo' },
          { cls:'cal-pill-proceso',    label:'En proceso' },
          { cls:'cal-pill-incompleto', label:'Incompleto' },
          { cls:'cal-pill-fecha',      label:'Fecha clave' },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className={`cal-pill ${l.cls} pointer-events-none`}>■</span> {l.label}
          </span>
        ))}
      </div>

      {modalOpen && editPost && (
        <PostModal
          post={editPost}
          onClose={() => { setModalOpen(false); setEditPost(null) }}
          onSaved={() => { load(); setModalOpen(false); setEditPost(null) }}
        />
      )}
    </div>
  )
}
