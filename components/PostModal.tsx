'use client'
import { useState, useRef } from 'react'
import type { Post } from '@/lib/types'

const MESES   = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS    = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
const ESTADOS = ['Incompleto','En proceso','Completo']
const REDES   = ['Instagram','TikTok','Facebook','LinkedIn','X / Twitter','YouTube','Pinterest','Threads']

interface PostForm extends Omit<Post,'id'> {
  red_social: string
  moodboard_imgs: string   // JSON array of base64
  moodboard_links: string  // newline-separated links
}

const EMPTY: PostForm = {
  semana:'', mes:'Enero', dia:'Lunes', fecha:'', horario:'', pilar:'', estado:'Incompleto',
  objetivo:'', enlace:'', formato_imagen:0, formato_carrusel:0, formato_reel:0, formato_historia:0,
  gancho:'', descripcion:'', hashtags:'', indicaciones_diseno:'', notas:'',
  red_social:'Instagram', moodboard_imgs:'[]', moodboard_links:'',
}

interface Props {
  post?: (Post & { red_social?: string; moodboard_imgs?: string; moodboard_links?: string }) | null
  defaultFecha?: string
  onClose: () => void
  onSaved: (fecha?: string) => void
}

export default function PostModal({ post, defaultFecha, onClose, onSaved }: Props) {
  const initForm: PostForm = post
    ? { ...EMPTY, ...post,
        red_social:      (post as any).red_social      || 'Instagram',
        moodboard_imgs:  (post as any).moodboard_imgs  || '[]',
        moodboard_links: (post as any).moodboard_links || '',
        fecha: post.fecha || defaultFecha || '',
      }
    : { ...EMPTY, fecha: defaultFecha || '' }

  // Each field has its own state to avoid the "one letter" bug
  const [semana,    setSemana]    = useState(initForm.semana)
  const [mes,       setMes]       = useState(initForm.mes)
  const [dia,       setDia]       = useState(initForm.dia)
  const [fecha,     setFecha]     = useState(initForm.fecha)
  const [horario,   setHorario]   = useState(initForm.horario)
  const [pilar,     setPilar]     = useState(initForm.pilar)
  const [estado,    setEstado]    = useState(initForm.estado)
  const [redSocial, setRedSocial] = useState(initForm.red_social)
  const [objetivo,  setObjetivo]  = useState(initForm.objetivo)
  const [fmtImg,    setFmtImg]    = useState(!!initForm.formato_imagen)
  const [fmtCar,    setFmtCar]    = useState(!!initForm.formato_carrusel)
  const [fmtReel,   setFmtReel]   = useState(!!initForm.formato_reel)
  const [fmtHist,   setFmtHist]   = useState(!!initForm.formato_historia)
  const [gancho,    setGancho]    = useState(initForm.gancho)
  const [desc,      setDesc]      = useState(initForm.descripcion)
  const [hashtags,  setHashtags]  = useState(initForm.hashtags)
  const [diseno,    setDiseno]    = useState(initForm.indicaciones_diseno)
  const [enlace,    setEnlace]    = useState(initForm.enlace)
  const [notas,     setNotas]     = useState(initForm.notas)
  const [moodImgs,  setMoodImgs]  = useState<string[]>(() => { try { return JSON.parse(initForm.moodboard_imgs) } catch { return [] } })
  const [moodLinks, setMoodLinks] = useState(initForm.moodboard_links)
  const [saving,    setSaving]    = useState(false)
  const imgRef = useRef<HTMLInputElement>(null)

  const addImages = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = e => setMoodImgs(prev => [...prev, e.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  const save = async () => {
    setSaving(true)
    const body = {
      semana, mes, dia, fecha, horario, pilar, estado, objetivo, enlace,
      formato_imagen: fmtImg ? 1 : 0,
      formato_carrusel: fmtCar ? 1 : 0,
      formato_reel: fmtReel ? 1 : 0,
      formato_historia: fmtHist ? 1 : 0,
      gancho, descripcion: desc, hashtags,
      indicaciones_diseno: diseno, notas,
      red_social: redSocial,
      moodboard_imgs: JSON.stringify(moodImgs),
      moodboard_links: moodLinks,
    }
    const url    = post?.id ? `/api/posts/${post.id}` : '/api/posts'
    const method = post?.id ? 'PUT' : 'POST'
    await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    setSaving(false)
    onSaved(fecha)
  }

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="text-xs font-semibold uppercase tracking-wider pt-2 pb-1" style={{ color:'var(--text-sub)', borderBottom:'1px solid var(--border)' }}>
      {children}
    </div>
  )

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid #232838' }}>
          <h3 className="font-semibold text-text">{post?.id ? 'Editar Post' : 'Nuevo Post'}</h3>
          <button onClick={onClose} className="btn-icon text-xl">✕</button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4">

          {/* ── PROGRAMACIÓN ── */}
          <SectionTitle>Programación</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="form-label">Mes</label>
              <select className="form-input" value={mes} onChange={e => setMes(e.target.value)}>
                {MESES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div><label className="form-label">Semana</label>
              <input className="form-input" placeholder="SEMANA 1" value={semana} onChange={e => setSemana(e.target.value)} />
            </div>
            <div><label className="form-label">Día</label>
              <select className="form-input" value={dia} onChange={e => setDia(e.target.value)}>
                {DIAS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="form-label">Fecha</label>
              <input type="date" className="form-input" value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
            <div><label className="form-label">Horario</label>
              <input type="time" className="form-input" value={horario} onChange={e => setHorario(e.target.value)} />
            </div>
          </div>

          {/* ── CONTENIDO ── */}
          <SectionTitle>Contenido</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="form-label">Pilar de contenido</label>
              <input
                className="form-input"
                placeholder="Ej: Estrategia de Marketing"
                value={pilar}
                onChange={e => setPilar(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div><label className="form-label">Red social</label>
              <select className="form-input" value={redSocial} onChange={e => setRedSocial(e.target.value)}>
                {REDES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="form-label">Estado</label>
              <select className="form-input" value={estado} onChange={e => setEstado(e.target.value)}>
                {ESTADOS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="form-label">Objetivo</label>
              <input className="form-input" placeholder="Ej: Aumentar interacciones" value={objetivo} onChange={e => setObjetivo(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label">Formato</label>
            <div className="flex gap-5 mt-1 flex-wrap">
              {([['🖼️ Imagen', fmtImg, setFmtImg], ['🎠 Carrusel', fmtCar, setFmtCar], ['🎬 Reel', fmtReel, setFmtReel], ['⏺️ Historia', fmtHist, setFmtHist]] as [string, boolean, (v:boolean)=>void][]).map(([l,v,fn]) => (
                <label key={l} className="flex items-center gap-2 text-sm cursor-pointer text-textSub hover:text-text transition-colors">
                  <input type="checkbox" className="accent-blue-500 w-4 h-4" checked={v} onChange={e => fn(e.target.checked)} />
                  {l}
                </label>
              ))}
            </div>
          </div>

          <div><label className="form-label">Gancho</label>
            <input className="form-input" placeholder="Frase que captura la atención" value={gancho} onChange={e => setGancho(e.target.value)} />
          </div>
          <div><label className="form-label">Descripción / Caption</label>
            <textarea className="form-input min-h-[80px] resize-y" placeholder="Texto del post..." value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div><label className="form-label">Hashtags</label>
            <textarea className="form-input min-h-[44px] resize-y" placeholder="#hashtag1 #hashtag2..." value={hashtags} onChange={e => setHashtags(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="form-label">Indicaciones de diseño</label>
              <input className="form-input" value={diseno} onChange={e => setDiseno(e.target.value)} />
            </div>
            <div><label className="form-label">Enlace a archivos</label>
              <input type="url" className="form-input" placeholder="https://..." value={enlace} onChange={e => setEnlace(e.target.value)} />
            </div>
          </div>
          <div><label className="form-label">Notas</label>
            <textarea className="form-input min-h-[44px] resize-y" value={notas} onChange={e => setNotas(e.target.value)} />
          </div>

          {/* ── MOODBOARD ── */}
          <SectionTitle>Moodboard de referencia</SectionTitle>

          {/* Image grid */}
          <div>
            <label className="form-label">Imágenes de referencia</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {moodImgs.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group" style={{ border:'1px solid #232838' }}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setMoodImgs(prev => prev.filter((_,idx) => idx !== i))}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background:'rgba(0,0,0,0.7)', color:'#fff' }}
                  >✕</button>
                </div>
              ))}
              <button
                onClick={() => imgRef.current?.click()}
                className="w-20 h-20 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors text-xs"
                style={{ border:'2px dashed #232838', color:'var(--text-muted)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--text-sub)'; (e.currentTarget as HTMLElement).style.color='var(--text-sub)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.color='var(--text-muted)' }}
              >
                <span className="text-xl">+</span>
                <span>Imagen</span>
              </button>
            </div>
            <input ref={imgRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addImages(e.target.files)} />
          </div>

          {/* Reference links */}
          <div><label className="form-label">Links de referencia <span className="normal-case font-normal text-textMuted">(uno por línea)</span></label>
            <textarea
              className="form-input min-h-[70px] resize-y"
              placeholder={"https://ejemplo.com/referencia1\nhttps://ejemplo.com/referencia2"}
              value={moodLinks}
              onChange={e => setMoodLinks(e.target.value)}
            />
            {/* Preview links */}
            {moodLinks.trim() && (
              <div className="mt-2 flex flex-col gap-1">
                {moodLinks.split('\n').filter(l => l.trim()).map((link, i) => (
                  <a key={i} href={link.trim()} target="_blank" rel="noreferrer"
                    className="text-xs truncate hover:underline"
                    style={{ color:'var(--text-sub)' }}>
                    🔗 {link.trim()}
                  </a>
                ))}
              </div>
            )}
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
