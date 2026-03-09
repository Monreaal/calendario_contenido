'use client'
import { useEffect, useState, useCallback } from 'react'
import type { Post } from '@/lib/types'
import PostModal from './PostModal'

const MESES  = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const ESTADOS = ['','Completo','En proceso','Incompleto']

function StatusBadge({ estado }: { estado: string }) {
  const cls = estado === 'Completo' ? 'badge-completo' : estado === 'En proceso' ? 'badge-proceso' : 'badge-incompleto'
  const dot = estado === 'Completo' ? 'bg-green' : estado === 'En proceso' ? 'bg-yellow' : 'bg-red'
  return (
    <span className={cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {estado}
    </span>
  )
}

export default function PostsView() {
  const [posts, setPosts]     = useState<Post[]>([])
  const [mes, setMes]         = useState('')
  const [estado, setEstado]   = useState('')
  const [q, setQ]             = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editPost, setEditPost]   = useState<Post | null>(null)

  const load = useCallback(async () => {
    const params = new URLSearchParams()
    if (mes)    params.set('mes', mes)
    if (estado) params.set('estado', estado)
    if (q)      params.set('q', q)
    setPosts(await fetch(`/api/posts?${params}`).then(r => r.json()))
  }, [mes, estado, q])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const h = () => { setEditPost(null); setModalOpen(true) }
    document.addEventListener('open-new-post', h)
    return () => document.removeEventListener('open-new-post', h)
  }, [])

  const del = async (id: number) => {
    if (!confirm('¿Eliminar este post?')) return
    await fetch(`/api/posts/${id}`, { method:'DELETE' }); load()
  }

  const formats = (p: Post) => {
    const f: string[] = []
    if (p.formato_imagen)   f.push('Imagen')
    if (p.formato_carrusel) f.push('Carrusel')
    if (p.formato_reel)     f.push('Reel')
    if (p.formato_historia) f.push('Historia')
    return f
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={mes} onChange={e => setMes(e.target.value)} className="form-input !w-auto">
          {MESES.map(m => <option key={m} value={m}>{m || 'Todos los meses'}</option>)}
        </select>
        <select value={estado} onChange={e => setEstado(e.target.value)} className="form-input !w-auto">
          {ESTADOS.map(s => <option key={s} value={s}>{s || 'Todos los estados'}</option>)}
        </select>
        <input
          type="search"
          placeholder="Buscar por pilar, gancho, objetivo..."
          value={q}
          onChange={e => setQ(e.target.value)}
          className="form-input !w-64"
        />
        <span className="text-xs text-textSub ml-1">{posts.length} resultado{posts.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="rounded-card overflow-hidden" style={{ border:'1px solid #232838' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background:'#141720', borderBottom:'1px solid #232838' }}>
              {['Fecha','Semana','Pilar','Formato','Estado','Objetivo','Gancho',''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color:'#525972' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-textSub text-sm">No hay posts que coincidan</td></tr>
            ) : posts.map((p, i) => (
              <tr key={p.id}
                style={{ borderBottom: i < posts.length-1 ? '1px solid #232838' : undefined, background: '#141720' }}
                className="transition-colors"
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1A1E2A'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#141720'}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-text text-xs">{p.fecha}</div>
                  <div className="text-xs text-textMuted">{p.horario}</div>
                </td>
                <td className="px-4 py-3 text-xs text-textSub">{p.semana}</td>
                <td className="px-4 py-3 max-w-[130px]">
                  <div className="truncate text-xs text-text">{p.pilar}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {formats(p).map(f => (
                      <span key={f} className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                        style={{ background:'#1A2540', color:'#4F7EF7' }}>{f}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge estado={p.estado} /></td>
                <td className="px-4 py-3 max-w-[140px]">
                  <div className="truncate text-xs text-textSub">{p.objetivo}</div>
                </td>
                <td className="px-4 py-3 max-w-[160px]">
                  <div className="truncate text-xs text-textSub">{p.gancho}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditPost(p); setModalOpen(true) }} className="btn-icon text-xs px-2 py-1">✎</button>
                    <button onClick={() => del(p.id)} className="btn-icon text-xs px-2 py-1 hover:!text-red hover:!bg-red/10">✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <PostModal
          post={editPost}
          onClose={() => { setModalOpen(false); setEditPost(null) }}
          onSaved={() => { load(); setModalOpen(false); setEditPost(null) }}
        />
      )}
    </div>
  )
}
