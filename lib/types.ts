export interface Post {
  id: number
  semana: string
  mes: string
  dia: string
  fecha: string
  horario: string
  pilar: string
  estado: 'Completo' | 'En proceso' | 'Incompleto' | string
  objetivo: string
  enlace: string
  formato_imagen: number | boolean
  formato_carrusel: number | boolean
  formato_reel: number | boolean
  formato_historia: number | boolean
  gancho: string
  descripcion: string
  hashtags: string
  indicaciones_diseno: string
  notas: string
  created_at?: string
  updated_at?: string
}

export interface Etapa {
  id: number
  proyecto_id: number
  tarea: string
  completada: number | boolean
  vencimiento: string
}

export interface Proyecto {
  id: number
  nombre: string
  descripcion: string
  fecha_inicio: string
  fecha_fin: string
  objetivo: string
  recursos: string
  notas: string
  estado: string
  created_at?: string
  etapas?: Etapa[]
}

export interface FechaImportante {
  id: number
  fecha: string
  titulo: string
  tipo: string
  notas: string
}

export interface Stats {
  total: number
  completos: number
  en_proceso: number
  incompletos: number
  completado_pct: number
  por_pilar: { pilar: string; c: number }[]
  por_formato: { imagen: number; carrusel: number; reel: number; historia: number }
}
