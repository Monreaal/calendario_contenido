import { NextRequest, NextResponse } from 'next/server'
import { getDb, queryAll, run } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await getDb()
  const d = await req.json()
  run(
    `UPDATE posts SET semana=?,mes=?,dia=?,fecha=?,horario=?,pilar=?,estado=?,objetivo=?,enlace=?,
      formato_imagen=?,formato_carrusel=?,formato_reel=?,formato_historia=?,gancho=?,descripcion=?,
      hashtags=?,indicaciones_diseno=?,notas=?,red_social=?,moodboard_imgs=?,moodboard_links=?,
      updated_at=datetime('now') WHERE id=?`,
    [d.semana,d.mes,d.dia,d.fecha,d.horario,d.pilar,d.estado,d.objetivo,d.enlace,
     d.formato_imagen,d.formato_carrusel,d.formato_reel,d.formato_historia,
     d.gancho,d.descripcion,d.hashtags,d.indicaciones_diseno,d.notas,
     d.red_social||'Instagram', d.moodboard_imgs||'[]', d.moodboard_links||'',
     params.id]
  )
  return NextResponse.json(queryAll('SELECT * FROM posts WHERE id = ?', [params.id])[0])
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await getDb()
  run('DELETE FROM posts WHERE id = ?', [params.id])
  return NextResponse.json({ ok: true })
}
