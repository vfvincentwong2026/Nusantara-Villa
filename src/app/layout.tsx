// ============================================================
// Nusantara Villa - 根布局 (App Router)
// ============================================================

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// 站点 URL（环境变量驱动，支持预览环境）
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nusantara-villa.com'

// ============================================================
// 1. Viewport 配置
// ============================================================

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563EB',
}

// ============================================================
// 2. Metadata 配置
// ============================================================

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Nusantara Villa - 3D Configurator & BOQ Estimator',
    template: '%s | Nusantara Villa',
  },
  description:
    'Design your luxury villa in Bali with 3D real-time preview and get an instant BOQ estimate.',
  keywords: ['villa', 'Bali', '3D configurator', 'BOQ', 'architecture', 'design build'],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Nusantara Villa - 3D Configurator & BOQ Estimator',
    description: 'Design your luxury villa in Bali with 3D real-time preview.',
    type: 'website',
    url: SITE_URL,
    siteName: 'Nusantara Villa',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Nusantara Villa 3D Configurator Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nusantara Villa - 3D Configurator & BOQ Estimator',
    description: 'Design your luxury villa in Bali with 3D real-time preview.',
    images: ['/og-image.jpg'],
  },
}

// ============================================================
// 3. 根布局
// ============================================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
