import { NextResponse } from 'next/server'
import { getDb, queryOne, queryAll } from '@/lib/db'

export async function GET() {
  await getDb()
  const total    = (queryOne('SELECT COUNT(*) as c FROM posts') as {c:number}).c
  const completos   = (queryOne("SELECT COUNT(*) as c FROM posts WHERE estado='Completo'") as {c:number}).c
  const en_proceso  = (queryOne("SELECT COUNT(*) as c FROM posts WHERE estado='En proceso'") as {c:number}).c
  const incompletos = (queryOne("SELECT COUNT(*) as c FROM posts WHERE estado='Incompleto'") as {c:number}).c
  const por_pilar = queryAll("SELECT pilar, COUNT(*) as c FROM posts WHERE pilar!='' GROUP BY pilar ORDER BY c DESC LIMIT 6")
  const por_formato = {
    imagen:   (queryOne('SELECT COUNT(*) as c FROM posts WHERE formato_imagen=1') as {c:number}).c,
    carrusel: (queryOne('SELECT COUNT(*) as c FROM posts WHERE formato_carrusel=1') as {c:number}).c,
    reel:     (queryOne('SELECT COUNT(*) as c FROM posts WHERE formato_reel=1') as {c:number}).c,
    historia: (queryOne('SELECT COUNT(*) as c FROM posts WHERE formato_historia=1') as {c:number}).c,
  }
  return NextResponse.json({ total, completos, en_proceso, incompletos,
    completado_pct: total > 0 ? Math.round(completos/total*1000)/10 : 0,
    por_pilar, por_formato })
}
