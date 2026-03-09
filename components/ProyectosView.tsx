'use client'
import { useEffect, useState, useCallback } from 'react'
import type { Proyecto } from '@/lib/types'

interface EtapaForm { tarea: string; vencimiento: string; completada: number }
interface ProjForm {
  nombre: string; descripcion: string; fecha_inicio: string; fecha_fin: string
  objetivo: string; recursos: string; notas: string; estado: string; etapas: EtapaForm[]
}
const EMPTY: ProjForm = { nombre:'', descripcion:'', fecha_inicio:'', fecha_fin:'', objetivo:'', recursos:'', notas:'', estado:'Activo', etapas:[] }

function estadoStyle(e: string): { bg: string; color: string } {
  if (e === 'Activo')     return { bg:'#1A2540', color:'#4F7EF7' }
  if (e === 'Completado') return { bg:'#0D2A1C', color:'#34C97B' }
  return { bg:'#1A1E2A', color:'#8B92A8' }
}

export default function ProyectosView() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]           = useState<ProjForm>(EMPTY)
  const [editId, setEditId]       = useState<number | null>(null)
  const [saving, setSaving]       = useState(false)

  const load = useCallback(() => fetch('/api/proyectos').then(r => r.json()).then(setProyectos), [])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    const h = () => { setEditId(null); setForm(EMPTY); setModalOpen(true) }
    document.addEventListener('open-new-proyecto', h)
    return () => document.removeEventListener('open-new-proyecto', h)
  }, [])

  const openEdit = (p: Proyecto) => {
    setEditId(p.id)
    setForm({ nombre:p.nombre, descripcion:p.descripcion, fecha_inicio:p.fecha_inicio, fecha_fin:p.fecha_fin,
      objetivo:p.objetivo, recursos:p.recursos, notas:p.notas, estado:p.estado,
      etapas: (p.etapas||[]).map(e => ({ tarea:e.tarea, vencimiento:e.vencimiento, completada:e.completada as number }))
    })
    setModalOpen(true)
  }

  const save = async () => {
    setSaving(true)
    const url = editId ? `/api/proyectos/${editId}` : '/api/proyectos'
    await fetch(url, { method: editId ? 'PUT':'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    setSaving(false); setModalOpen(false); load()
  }

  const del = async (id: number) => {
    if (!confirm('¿Eliminar este proyecto?')) return
    await fetch(`/api/proyectos/${id}`, { method:'DELETE' }); load()
  }

  const toggleEtapa = async (etapaId: number) => {
    await fetch(`/api/etapas/${etapaId}`, { method:'POST' }); load()
  }

  const addEtapa   = () => setForm(f => ({ ...f, etapas:[...f.etapas, { tarea:'', vencimiento:'', completada:0 }] }))
  const upd        = (i: number, k: keyof EtapaForm, v: string) => setForm(f => { const et=[...f.etapas]; et[i]={...et[i],[k]:v}; return {...f,etapas:et} })
  const remEtapa   = (i: number) => setForm(f => ({ ...f, etapas:f.etapas.filter((_,idx)=>idx!==i) }))

  return (
    <div>
      {proyectos.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-textSub text-sm">No hay proyectos. Creá uno con el botón de arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {proyectos.map(p => {
            const etapas   = p.etapas || []
            const done     = etapas.filter(e => e.completada).length
            const pct      = etapas.length ? Math.round(done / etapas.length * 100) : 0
            const st       = estadoStyle(p.estado)
            return (
              <div key={p.id} className="card-hover p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-text leading-tight">{p.nombre}</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: st.bg, color: st.color }}>{p.estado}</span>
                </div>
                {p.descripcion && <p className="text-xs text-textSub leading-relaxed -mt-2">{p.descripcion}</p>}
                {(p.fecha_inicio || p.fecha_fin) && (
                  <div className="text-xs text-textMuted flex gap-2">
                    {p.fecha_inicio && <span>📅 {p.fecha_inicio}</span>}
                    {p.fecha_fin    && <span>→ {p.fecha_fin}</span>}
                  </div>
                )}
                {etapas.length > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-textSub mb-1.5">
                      <span>Progreso</span>
                      <span className="font-medium" style={{ color:'#4F7EF7' }}>{done}/{etapas.length} · {pct}%</span>
                    </div>
                    <div className="rounded-full h-1.5" style={{ background:'#232838' }}>
                      <div className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width:`${pct}%`, background:'linear-gradient(90deg,#4F7EF7,#7C3AED)' }} />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {etapas.map(e => (
                    <div key={e.id} className="flex items-center gap-2.5 cursor-pointer group" onClick={() => toggleEtapa(e.id)}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all`}
                        style={{
                          background: e.completada ? '#34C97B' : 'transparent',
                          border: e.completada ? '1.5px solid #34C97B' : '1.5px solid #2D3347',
                        }}>
                        {e.completada ? <span className="text-white text-xs">✓</span> : null}
                      </div>
                      <span className={`text-xs flex-1 transition-colors ${e.completada ? 'line-through text-textMuted' : 'text-textSub group-hover:text-text'}`}>
                        {e.tarea}
                      </span>
                      {e.vencimiento && <span className="text-xs text-textMuted">{e.vencimiento}</span>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 justify-end pt-1" style={{ borderTop:'1px solid #232838' }}>
                  <button onClick={() => openEdit(p)} className="btn-ghost !px-3 !py-1.5 !text-xs">✎ Editar</button>
                  <button onClick={() => del(p.id)} className="btn-ghost !px-3 !py-1.5 !text-xs hover:!text-red hover:!border-red/30 hover:!bg-red/10">✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid #232838' }}>
              <h3 className="font-semibold text-text">{editId ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h3>
              <button onClick={() => setModalOpen(false)} className="btn-icon text-xl">✕</button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4">
              <div><label className="form-label">Nombre *</label>
                <input className="form-input" value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))} required />
              </div>
              <div><label className="form-label">Descripción</label>
                <textarea className="form-input min-h-[60px] resize-y" value={form.descripcion} onChange={e => setForm(f=>({...f,descripcion:e.target.value}))} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="form-label">Inicio</label><input type="date" className="form-input" value={form.fecha_inicio} onChange={e=>setForm(f=>({...f,fecha_inicio:e.target.value}))} /></div>
                <div><label className="form-label">Fin</label><input type="date" className="form-input" value={form.fecha_fin} onChange={e=>setForm(f=>({...f,fecha_fin:e.target.value}))} /></div>
                <div><label className="form-label">Estado</label>
                  <select className="form-input" value={form.estado} onChange={e=>setForm(f=>({...f,estado:e.target.value}))}>
                    {['Activo','Pausado','Completado'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Objetivo</label><input className="form-input" value={form.objetivo} onChange={e=>setForm(f=>({...f,objetivo:e.target.value}))} /></div>
                <div><label className="form-label">Recursos</label><input className="form-input" value={form.recursos} onChange={e=>setForm(f=>({...f,recursos:e.target.value}))} /></div>
              </div>
              <div><label className="form-label">Notas</label><textarea className="form-input min-h-[48px] resize-y" value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))} /></div>
              <div>
                <label className="form-label mb-2 block">Etapas / Tareas</label>
                <div className="space-y-2">
                  {form.etapas.map((et,i) => (
                    <div key={i} className="flex gap-2 items-center p-2 rounded-lg" style={{ background:'#1A1E2A', border:'1px solid #232838' }}>
                      <input className="form-input flex-1 !bg-bg" placeholder="Tarea..." value={et.tarea} onChange={e=>upd(i,'tarea',e.target.value)} />
                      <input type="date" className="form-input w-36 !bg-bg" value={et.vencimiento} onChange={e=>upd(i,'vencimiento',e.target.value)} />
                      <button onClick={()=>remEtapa(i)} className="btn-icon hover:!text-red">✕</button>
                    </div>
                  ))}
                </div>
                <button onClick={addEtapa} className="mt-2 text-xs text-textSub hover:text-text transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-dashed border-border hover:border-border2">
                  + Agregar etapa
                </button>
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
