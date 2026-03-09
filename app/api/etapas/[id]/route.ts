import { NextRequest, NextResponse } from 'next/server'
import { getDb, queryOne, run } from '@/lib/db'

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  await getDb()
  const etapa = queryOne('SELECT * FROM etapas WHERE id = ?', [params.id])
  const newVal = etapa?.completada ? 0 : 1
  run('UPDATE etapas SET completada = ? WHERE id = ?', [newVal, params.id])
  return NextResponse.json({ completada: Boolean(newVal) })
}
