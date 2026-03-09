'use client'
import { useEffect, useState, useCallback } from 'react'
import type { FechaImportante } from '@/lib/types'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const TIPOS  = ['comercial','festivo','efeméride','personal']

function tipoStyle(t: string): { bg: string; color: string } {
  if (t === 'comercial') return { bg:'#1A2540', color:'#4F7EF7' }
  if (t === 'festivo')   return { bg:'#1E1630', color:'#A78BFA' }
  if (t === 'personal')  return { bg:'#291E08', color:'#F5A623' }
  return { bg:'#1A1E2A', color:'#8B92A8' }
}

export default function FechasView() {
  const [fechas, setFechas]   = useState<FechaImportante[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]       = useState({ fecha:'', titulo:'', tipo:'comercial', notas:'' })
  const [saving, setSaving]   = useState(false)

  const load = useCallback(() => fetch('/api/fechas').then(r => r.json()).then(setFechas), [])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    const h = () => { setForm({ fecha:'', titulo:'', tipo:'comercial', notas:'' }); setModalOpen(true) }
    document.addEventListener('open-new-fecha', h)
    return () => document.removeEventListener('open-new-fecha', h)
  }, [])

  const save = async () => {
    if (!form.fecha || !form.titulo) return alert('Completá fecha y título')
    setSaving(true)
    await fetch('/api/fechas', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    setSaving(false); setModalOpen(false); setForm({ fecha:'', titulo:'', tipo:'comercial', notas:'' }); load()
  }
  const del = async (id: number) => {
    if (!confirm('¿Eliminar esta fecha?')) return
    await fetch(`/api/fechas/${id}`, { method:'DELETE' }); load()
  }

  const byMonth: Record<string, { label:string; items:FechaImportante[] }> = {}
  fechas.forEach(f => {
    const d = new Date(f.fecha + 'T00:00:00')
    const k = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`
    if (!byMonth[k]) byMonth[k] = { label:`${MESES[d.getMonth()]} ${d.getFullYear()}`, items:[] }
    byMonth[k].items.push(f)
  })

  return (
    <div className="space-y-6">
      {fechas.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-textSub text-sm">No hay fechas. Agregá una con el botón de arriba.</p>
        </div>
      )}

      {Object.keys(byMonth).sort().map(key => {
        const g = byMonth[key]
        return (
          <div key={key}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-textMuted mb-3 px-1">{g.label}</h2>
            <div className="card overflow-hidden">
              {g.items.map((f, i) => {
                const d   = new Date(f.fecha + 'T00:00:00')
                const st  = tipoStyle(f.tipo)
                return (
                  <div key={f.id}
                    className="flex items-center gap-4 px-5 py-4 group transition-colors"
                    style={{ borderBottom: i < g.items.length-1 ? '1px solid #232838' : undefined }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#1A1E2A'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}
                  >
                    {/* Date bubble */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center"
                      style={{ background: st.bg }}>
                      <span className="text-lg font-bold leading-none" style={{ color: st.color }}>{d.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-text">{f.titulo}</div>
                      {f.notas && <div className="text-xs text-textSub mt-0.5 truncate">{f.notas}</div>}
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: st.bg, color: st.color }}>{f.tipo}</span>
                    <button
                      onClick={() => del(f.id)}
                      className="btn-icon opacity-0 group-hover:opacity-100 hover:!text-red hover:!bg-red/10 text-xs"
                    >✕</button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {modalOpen && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid #232838' }}>
              <h3 className="font-semibold text-text">Nueva Fecha Importante</h3>
              <button onClick={() => setModalOpen(false)} className="btn-icon text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="form-label">Fecha *</label>
                <input type="date" className="form-input" value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))} required />
              </div>
              <div><label className="form-label">Título *</label>
                <input className="form-input" placeholder="Ej: Día de la Madre" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} required />
              </div>
              <div><label className="form-label">Tipo</label>
                <select className="form-input" value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))}>
                  {TIPOS.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
              <div><label className="form-label">Notas</label>
                <textarea className="form-input min-h-[60px] resize-y" value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop:'1px solid #232838' }}>
              <button onClick={()=>setModalOpen(false)} className="btn-ghost">Cancelar</button>
              <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
