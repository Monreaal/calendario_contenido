'use client'
import { useState } from 'react'
import type { Post } from '@/lib/types'

const MESES  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS   = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
const ESTADOS = ['Incompleto','En proceso','Completo']
const EMPTY: Omit<Post,'id'> = {
  semana:'', mes:'Enero', dia:'Lunes', fecha:'', horario:'', pilar:'', estado:'Incompleto',
  objetivo:'', enlace:'', formato_imagen:0, formato_carrusel:0, formato_reel:0, formato_historia:0,
  gancho:'', descripcion:'', hashtags:'', indicaciones_diseno:'', notas:''
}

interface Props { post?: Post | null; onClose: () => void; onSaved: () => void }

export default function PostModal({ post, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Omit<Post,'id'>>(post ? { ...post } : { ...EMPTY })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    const url    = post?.id ? `/api/posts/${post.id}` : '/api/posts'
    const method = post?.id ? 'PUT' : 'POST'
    await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    setSaving(false); onSaved()
  }

  const Row = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-2 gap-3">{children}</div>
  )
  const Row3 = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-3">{children}</div>
  )

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid #232838' }}>
          <h3 className="font-semibold text-text">{post?.id ? 'Editar Post' : 'Nuevo Post'}</h3>
          <button onClick={onClose} className="btn-icon text-xl">✕</button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4">
          <Row3>
            <div><label className="form-label">Mes</label>
              <select className="form-input" value={form.mes} onChange={e => set('mes', e.target.value)}>
                {MESES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div><label className="form-label">Semana</label>
              <input className="form-input" placeholder="SEMANA 1" value={form.semana} onChange={e => set('semana', e.target.value)} />
            </div>
            <div><label className="form-label">Día</label>
              <select className="form-input" value={form.dia} onChange={e => set('dia', e.target.value)}>
                {DIAS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </Row3>

          <Row>
            <div><label className="form-label">Fecha</label>
              <input type="date" className="form-input" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
            </div>
            <div><label className="form-label">Horario</label>
              <input type="time" className="form-input" value={form.horario} onChange={e => set('horario', e.target.value)} />
            </div>
          </Row>

          <Row>
            <div><label className="form-label">Pilar de contenido</label>
              <input className="form-input" placeholder="Ej: Estrategia de Marketing" value={form.pilar} onChange={e => set('pilar', e.target.value)} />
            </div>
            <div><label className="form-label">Estado</label>
              <select className="form-input" value={form.estado} onChange={e => set('estado', e.target.value)}>
                {ESTADOS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </Row>

          <div><label className="form-label">Objetivo</label>
            <input className="form-input" placeholder="Ej: Aumentar interacciones" value={form.objetivo} onChange={e => set('objetivo', e.target.value)} />
          </div>

          <div>
            <label className="form-label">Formato</label>
            <div className="flex gap-4 mt-1 flex-wrap">
              {[['formato_imagen','🖼️ Imagen'],['formato_carrusel','🎠 Carrusel'],['formato_reel','🎬 Reel'],['formato_historia','⏺️ Historia']].map(([k,l]) => (
                <label key={k} className="flex items-center gap-2 text-sm cursor-pointer text-textSub hover:text-text transition-colors">
                  <input type="checkbox" className="accent-accent" checked={!!form[k as keyof typeof form]} onChange={e => set(k, e.target.checked ? 1 : 0)} />
                  {l}
                </label>
              ))}
            </div>
          </div>

          <div><label className="form-label">Gancho</label>
            <input className="form-input" placeholder="Frase que captura la atención" value={form.gancho} onChange={e => set('gancho', e.target.value)} />
          </div>

          <div><label className="form-label">Descripción / Caption</label>
            <textarea className="form-input min-h-[80px] resize-y" placeholder="Texto del post..." value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
          </div>

          <div><label className="form-label">Hashtags</label>
            <textarea className="form-input min-h-[44px] resize-y" placeholder="#hashtag1 #hashtag2..." value={form.hashtags} onChange={e => set('hashtags', e.target.value)} />
          </div>

          <Row>
            <div><label className="form-label">Indicaciones de diseño</label>
              <input className="form-input" value={form.indicaciones_diseno} onChange={e => set('indicaciones_diseno', e.target.value)} />
            </div>
            <div><label className="form-label">Enlace a archivos</label>
              <input type="url" className="form-input" placeholder="https://..." value={form.enlace} onChange={e => set('enlace', e.target.value)} />
            </div>
          </Row>

          <div><label className="form-label">Notas</label>
            <textarea className="form-input min-h-[44px] resize-y" value={form.notas} onChange={e => set('notas', e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop:'1px solid #232838' }}>
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
