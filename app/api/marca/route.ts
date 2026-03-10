import { NextRequest, NextResponse } from 'next/server'
import { getDb, queryOne, run, insert } from '@/lib/db'

export async function GET() {
  await getDb()
  const marca = queryOne('SELECT * FROM marca ORDER BY id LIMIT 1')
  return NextResponse.json(marca || null)
}

export async function POST(req: NextRequest) {
  await getDb()
  const d = await req.json()
  const existing = queryOne('SELECT id FROM marca LIMIT 1')
  if (existing) {
    run(
      `UPDATE marca SET nombre_marca=?,descripcion=?,publico_objetivo=?,mision=?,vision=?,
       valores=?,pilares=?,personalidad=?,tono_voz=?,tipografias=?,colores=?,tipo_contenido=?,
       moodboard_imgs=?,moodboard_links=?,notas=?,updated_at=datetime('now') WHERE id=?`,
      [d.nombre_marca,d.descripcion,d.publico_objetivo,d.mision,d.vision,
       d.valores,d.pilares,d.personalidad,d.tono_voz,d.tipografias,d.colores,d.tipo_contenido,
       d.moodboard_imgs||'[]',d.moodboard_links||'',d.notas||'', existing.id]
    )
  } else {
    insert(
      `INSERT INTO marca (nombre_marca,descripcion,publico_objetivo,mision,vision,
       valores,pilares,personalidad,tono_voz,tipografias,colores,tipo_contenido,
       moodboard_imgs,moodboard_links,notas)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.nombre_marca,d.descripcion,d.publico_objetivo,d.mision,d.vision,
       d.valores,d.pilares,d.personalidad,d.tono_voz,d.tipografias,d.colores,d.tipo_contenido,
       d.moodboard_imgs||'[]',d.moodboard_links||'',d.notas||'']
    )
  }
  return NextResponse.json(queryOne('SELECT * FROM marca ORDER BY id LIMIT 1'))
}
