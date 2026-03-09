import { NextRequest, NextResponse } from 'next/server'
import { getDb, queryAll, insert } from '@/lib/db'

export async function GET(req: NextRequest) {
  await getDb()
  const { searchParams } = new URL(req.url)
  const mes = searchParams.get('mes') || ''
  const estado = searchParams.get('estado') || ''
  const q = searchParams.get('q') || ''

  let sql = 'SELECT * FROM posts WHERE 1=1'
  const params: string[] = []
  if (mes)    { sql += ' AND mes = ?';    params.push(mes) }
  if (estado) { sql += ' AND estado = ?'; params.push(estado) }
  if (q) {
    sql += ' AND (pilar LIKE ? OR gancho LIKE ? OR objetivo LIKE ? OR descripcion LIKE ?)'
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`)
  }
  sql += ' ORDER BY fecha, horario'
  return NextResponse.json(queryAll(sql, params))
}

export async function POST(req: NextRequest) {
  await getDb()
  const d = await req.json()
  const id = insert(`INSERT INTO posts (semana,mes,dia,fecha,horario,pilar,estado,objetivo,enlace,
    formato_imagen,formato_carrusel,formato_reel,formato_historia,gancho,descripcion,hashtags,indicaciones_diseno,notas)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [d.semana,d.mes,d.dia,d.fecha,d.horario,d.pilar,d.estado,d.objetivo,d.enlace,
     d.formato_imagen,d.formato_carrusel,d.formato_reel,d.formato_historia,
     d.gancho,d.descripcion,d.hashtags,d.indicaciones_diseno,d.notas])
  const row = queryAll('SELECT * FROM posts WHERE id = ?', [id])[0]
  return NextResponse.json(row, { status: 201 })
}
