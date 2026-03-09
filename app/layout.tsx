import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Calendario Editorial — Luzzi Digital',
  description: 'Planificador de contenido para redes sociales',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
