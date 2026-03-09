import { NextRequest, NextResponse } from 'next/server'
import { getDb, queryAll, insert } from '@/lib/db'

export async function GET() {
  await getDb()
  return NextResponse.json(queryAll('SELECT * FROM fechas_importantes ORDER BY fecha'))
}

export async function POST(req: NextRequest) {
  await getDb()
  const d = await req.json()
  const id = insert('INSERT INTO fechas_importantes (fecha,titulo,tipo,notas) VALUES (?,?,?,?)',
    [d.fecha, d.titulo, d.tipo, d.notas])
  return NextResponse.json(queryAll('SELECT * FROM fechas_importantes WHERE id = ?', [id])[0], { status: 201 })
}
