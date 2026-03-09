import { NextRequest, NextResponse } from 'next/server'
import { getDb, queryAll, run, insert } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await getDb()
  const d = await req.json()
  run(`UPDATE proyectos SET nombre=?,descripcion=?,fecha_inicio=?,fecha_fin=?,objetivo=?,recursos=?,notas=?,estado=? WHERE id=?`,
    [d.nombre,d.descripcion,d.fecha_inicio,d.fecha_fin,d.objetivo,d.recursos,d.notas,d.estado, params.id])
  run('DELETE FROM etapas WHERE proyecto_id = ?', [params.id])
  for (const et of (d.etapas || [])) {
    insert('INSERT INTO etapas (proyecto_id,tarea,completada,vencimiento) VALUES (?,?,?,?)',
      [params.id, et.tarea, et.completada || 0, et.vencimiento || ''])
  }
  const proj = queryAll('SELECT * FROM proyectos WHERE id = ?', [params.id])[0]
  proj.etapas = queryAll('SELECT * FROM etapas WHERE proyecto_id = ?', [params.id])
  return NextResponse.json(proj)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await getDb()
  run('DELETE FROM proyectos WHERE id = ?', [params.id])
  return NextResponse.json({ ok: true })
}
