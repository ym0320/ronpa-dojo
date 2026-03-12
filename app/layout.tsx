import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '論破道場',
  description: 'AIと1対1の議論バトル',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: '論破道場' },
}

export const viewport: Viewport = {
  themeColor: '#FFF8F0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#FFF8F0] overflow-x-hidden">
        <div className="max-w-lg mx-auto min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  )
}
