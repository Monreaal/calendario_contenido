import { NextRequest, NextResponse } from 'next/server'
import { getDb, run } from '@/lib/db'

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await getDb()
  run('DELETE FROM fechas_importantes WHERE id = ?', [params.id])
  return NextResponse.json({ ok: true })
}
