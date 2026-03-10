'use client'
import { useEffect, useState, useRef, useCallback } from 'react'

interface MarcaData {
  id?: number
  nombre_marca: string; descripcion: string; publico_objetivo: string
  mision: string; vision: string; valores: string; pilares: string
  personalidad: string; tono_voz: string; tipografias: string
  colores: string; tipo_contenido: string
  moodboard_imgs: string; moodboard_links: string; notas: string
}
const EMPTY: MarcaData = {
  nombre_marca:'', descripcion:'', publico_objetivo:'', mision:'', vision:'',
  valores:'', pilares:'', personalidad:'', tono_voz:'', tipografias:'',
  colores:'', tipo_contenido:'', moodboard_imgs:'[]', moodboard_links:'', notas:'',
}

/* ── Auto-resize textarea hook ──────────────────── */
function useAutosize(ref: React.RefObject<HTMLTextAreaElement>, value: string) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value, ref])
}

/* ── Notion-style auto-resizing textarea ─────────── */
function NotionArea({
  value, onChange, placeholder, className = '', rows = 1,
}: {
  value: string; onChange: (v: string) => void
  placeholder: string; className?: string; rows?: number
}) {
  const ref = useRef<HTMLTextAreaElement>(null!)
  useAutosize(ref, value)
  return (
    <textarea
      ref={ref}
      className={`notion-field body ${className}`}
      placeholder={placeholder}
      value={value}
      rows={rows}
      onChange={e => onChange(e.target.value)}
      style={{ overflow: 'hidden' }}
    />
  )
}

/* ── Color palette preview ──────────────────────── */
function ColorPalette({ value }: { value: string }) {
  const hexes = value.match(/#[0-9a-fA-F]{3,8}/g) || []
  if (!hexes.length) return null
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {hexes.map((c, i) => (
        <div key={i} className="flex items-center gap-2 text-xs rounded-lg px-3 py-1.5"
          style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
          <div className="w-3.5 h-3.5 rounded-sm flex-shrink-0" style={{ background: c, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)' }} />
          <span style={{ color: 'var(--text-sub)', fontFamily: 'monospace', fontSize: 11 }}>{c}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Collapsible section ────────────────────────── */
function NotionSection({
  icon, title, children, defaultOpen = true,
}: {
  icon: string; title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-2">
      {/* Section header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 w-full text-left py-2 px-1 rounded-lg group transition-all duration-150"
        style={{ color: 'var(--text-sub)' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-sub)'}
      >
        <span className="text-xs transition-transform duration-150"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}>▶</span>
        <span className="text-base">{icon}</span>
        <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text)' }}>{title}</span>
      </button>

      {/* Section content */}
      {open && (
        <div className="pl-6 pr-1 pb-4 space-y-0 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}

/* ── Field row ──────────────────────────────────── */
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 items-start py-2"
      style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="text-xs font-medium pt-2" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div>{children}</div>
    </div>
  )
}

/* ════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════ */
export default function MarcaView() {
  const [data,     setData]     = useState<MarcaData>(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [loading,  setLoading]  = useState(true)
  const [moodImgs, setMoodImgs] = useState<string[]>([])
  const [coverImg, setCoverImg] = useState<string>('')
  const imgRef   = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null!)
  useAutosize(titleRef, data.nombre_marca)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/marca').then(r => r.json())
    if (res) {
      setData(res)
      try { setMoodImgs(JSON.parse(res.moodboard_imgs || '[]')) } catch { setMoodImgs([]) }
      if ((res as any).cover_img) setCoverImg((res as any).cover_img)
    }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const set = (k: keyof MarcaData, v: string) => setData(d => ({ ...d, [k]: v }))

  const addMoodImages = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(file => {
      const r = new FileReader()
      r.onload = e => setMoodImgs(prev => [...prev, e.target?.result as string])
      r.readAsDataURL(file)
    })
  }
  const addCover = (files: FileList | null) => {
    if (!files?.[0]) return
    const r = new FileReader()
    r.onload = e => setCoverImg(e.target?.result as string)
    r.readAsDataURL(files[0])
  }

  const save = async () => {
    setSaving(true)
    const body = { ...data, moodboard_imgs: JSON.stringify(moodImgs), cover_img: coverImg }
    await fetch('/api/marca', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>Cargando...</div>
    </div>
  )

  const hasCover = !!coverImg

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* ── COVER IMAGE ── */}
      <div
        className="relative w-full rounded-xl overflow-hidden mb-2 group"
        style={{
          height: hasCover ? 220 : 80,
          background: hasCover ? 'transparent' : 'var(--surface)',
          border: `1px solid var(--border)`,
          transition: 'height 0.3s ease',
        }}
      >
        {hasCover && (
          <img src={coverImg} alt="cover" className="w-full h-full object-cover" />
        )}
        {/* Overlay controls */}
        <div
          className="absolute inset-0 flex items-end gap-2 p-3 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: hasCover ? 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' : 'transparent' }}
        >
          <button
            onClick={() => coverRef.current?.click()}
            className="btn-ghost !py-1.5 !text-xs"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            {hasCover ? '🖼️ Cambiar portada' : '+ Agregar portada'}
          </button>
          {hasCover && (
            <button
              onClick={() => setCoverImg('')}
              className="btn-ghost !py-1.5 !text-xs"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
            >Quitar</button>
          )}
        </div>
        {!hasCover && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Hover para agregar portada</span>
          </div>
        )}
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => addCover(e.target.files)} />
      </div>

      {/* ── TITLE ── */}
      <div className="px-1 mb-6 mt-4">
        <textarea
          ref={titleRef}
          className="notion-field title w-full"
          placeholder="Nombre de tu marca..."
          value={data.nombre_marca}
          rows={1}
          onChange={e => set('nombre_marca', e.target.value)}
          style={{ overflow: 'hidden', fontWeight: 700 }}
        />
        <div className="mt-1">
          <NotionArea
            value={data.publico_objetivo}
            onChange={v => set('publico_objetivo', v)}
            placeholder="Público objetivo — ¿A quién va dirigida la marca?"
            className="small"
          />
        </div>
      </div>

      {/* ── SAVE ── */}
      <div className="flex justify-end mb-6">
        <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>

      {/* ── SECTIONS ── */}
      <div style={{ paddingBottom: 80 }}>

        <NotionSection icon="✍️" title="Descripción de la marca" defaultOpen>
          <FieldRow label="Descripción">
            <NotionArea value={data.descripcion} onChange={v => set('descripcion', v)}
              placeholder="¿Qué hace tu marca? ¿Cuál es su propuesta de valor única?" rows={3} />
          </FieldRow>
          <FieldRow label="Misión">
            <NotionArea value={data.mision} onChange={v => set('mision', v)}
              placeholder="¿Por qué existe la marca?" rows={2} />
          </FieldRow>
          <FieldRow label="Visión">
            <NotionArea value={data.vision} onChange={v => set('vision', v)}
              placeholder="¿A dónde quiere llegar en los próximos años?" rows={2} />
          </FieldRow>
        </NotionSection>

        <NotionSection icon="🧭" title="Valores y pilares" defaultOpen>
          <FieldRow label="Valores">
            <NotionArea value={data.valores} onChange={v => set('valores', v)}
              placeholder="Autenticidad · Innovación · Cercanía · Educación..." rows={2} />
          </FieldRow>
          <FieldRow label="Pilares de contenido">
            <NotionArea value={data.pilares} onChange={v => set('pilares', v)}
              placeholder={"Educación — tips de marketing digital\nInspiración — casos de éxito\nEntretenimiento — juegos y dinámicas"} rows={3} />
          </FieldRow>
          <FieldRow label="Tipo de contenido">
            <NotionArea value={data.tipo_contenido} onChange={v => set('tipo_contenido', v)}
              placeholder="Reels educativos, carruseles con tips, stories de comunidad..." rows={2} />
          </FieldRow>
        </NotionSection>

        <NotionSection icon="🎙️" title="Personalidad y tono de voz" defaultOpen>
          <FieldRow label="Personalidad">
            <NotionArea value={data.personalidad} onChange={v => set('personalidad', v)}
              placeholder="Cercana, profesional, directa, con humor sutil..." rows={2} />
          </FieldRow>
          <FieldRow label="Tono de voz">
            <NotionArea value={data.tono_voz} onChange={v => set('tono_voz', v)}
              placeholder="Tutea al lector, usa emojis con moderación, evita tecnicismos..." rows={2} />
          </FieldRow>
        </NotionSection>

        <NotionSection icon="🎨" title="Identidad visual" defaultOpen>
          <FieldRow label="Tipografías">
            <NotionArea value={data.tipografias} onChange={v => set('tipografias', v)}
              placeholder={"Display: Playfair Display — títulos\nBody: Inter — texto corrido"} rows={2} />
          </FieldRow>
          <FieldRow label="Paleta de colores">
            <NotionArea value={data.colores} onChange={v => set('colores', v)}
              placeholder={"Primario: #C8512E (terracota)\nSecundario: #3A6B8A (slate)\nNeutro: #F7F6F3 (ivory)"} rows={3} />
            <ColorPalette value={data.colores} />
          </FieldRow>
        </NotionSection>

        <NotionSection icon="🖼️" title="Moodboard" defaultOpen>
          <div className="pt-3 pb-1">
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Imágenes de inspiración, referencias visuales, ejemplos de estética.
            </p>

            {/* Masonry-ish image grid */}
            <div className="flex flex-wrap gap-2 mb-4">
              {moodImgs.map((src, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden group flex-shrink-0"
                  style={{ width: 140, height: 140, border: '1px solid var(--border)' }}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <button
                      onClick={() => setMoodImgs(prev => prev.filter((_,idx) => idx !== i))}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: 'rgba(248,113,113,0.9)', color: '#fff' }}
                    >✕</button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => imgRef.current?.click()}
                className="rounded-xl flex flex-col items-center justify-center gap-1 text-xs transition-all flex-shrink-0"
                style={{ width: 140, height: 140, border: '2px dashed var(--border2)', color: 'var(--text-muted)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-sub)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-sub)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
              >
                <span className="text-3xl mb-1" style={{ lineHeight:1 }}>+</span>
                <span>Agregar imagen</span>
              </button>
            </div>
            <input ref={imgRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addMoodImages(e.target.files)} />
          </div>

          <FieldRow label="Links de referencia">
            <NotionArea
              value={data.moodboard_links}
              onChange={v => set('moodboard_links', v)}
              placeholder={"https://pinterest.com/mi-board\nhttps://behance.net/referencia\nhttps://instagram.com/cuenta"}
              rows={3}
            />
            {data.moodboard_links.trim() && (
              <div className="flex flex-col gap-1 mt-2">
                {data.moodboard_links.split('\n').filter(l => l.trim()).map((link, i) => (
                  <a key={i} href={link.trim()} target="_blank" rel="noreferrer"
                    className="text-xs flex items-center gap-2 hover:underline"
                    style={{ color: 'var(--text-sub)' }}>
                    🔗 <span className="truncate">{link.trim()}</span>
                  </a>
                ))}
              </div>
            )}
          </FieldRow>
        </NotionSection>

        <NotionSection icon="📝" title="Notas" defaultOpen={false}>
          <div className="pt-2">
            <NotionArea value={data.notas} onChange={v => set('notas', v)}
              placeholder="Lineamientos internos, restricciones, información adicional sobre la marca..." rows={4} />
          </div>
        </NotionSection>

      </div>

      {/* Floating save bar */}
      {(saving || saved) && (
        <div className="fixed bottom-6 right-6 text-sm px-4 py-2 rounded-xl shadow-notion"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          {saving ? '⟳ Guardando...' : '✓ Guardado'}
        </div>
      )}
    </div>
  )
}
