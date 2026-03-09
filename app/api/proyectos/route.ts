import { NextRequest, NextResponse } from 'next/server'
import { getDb, queryAll, insert } from '@/lib/db'

export async function GET() {
  await getDb()
  const proyectos = queryAll('SELECT * FROM proyectos ORDER BY created_at DESC')
  return NextResponse.json(proyectos.map(p => ({
    ...p,
    etapas: queryAll('SELECT * FROM etapas WHERE proyecto_id = ? ORDER BY id', [p.id])
  })))
}

export async function POST(req: NextRequest) {
  await getDb()
  const d = await req.json()
  const id = insert(`INSERT INTO proyectos (nombre,descripcion,fecha_inicio,fecha_fin,objetivo,recursos,notas,estado)
    VALUES (?,?,?,?,?,?,?,?)`,
    [d.nombre,d.descripcion,d.fecha_inicio,d.fecha_fin,d.objetivo,d.recursos,d.notas,d.estado])
  for (const et of (d.etapas || [])) {
    insert('INSERT INTO etapas (proyecto_id,tarea,completada,vencimiento) VALUES (?,?,?,?)',
      [id, et.tarea, 0, et.vencimiento || ''])
  }
  const proj = queryAll('SELECT * FROM proyectos WHERE id = ?', [id])[0]
  proj.etapas = queryAll('SELECT * FROM etapas WHERE proyecto_id = ?', [id])
  return NextResponse.json(proj, { status: 201 })
}
