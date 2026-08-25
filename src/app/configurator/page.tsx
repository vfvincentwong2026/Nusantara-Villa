// ============================================================
// Nusantara Villa - 配置器页面 (Server Component 外壳)
// 路由: /configurator?style=&area=
// 支持案例详情页带来的 URL 参数预设（见 ConfiguratorApp → UrlPreset）
// ============================================================

import type { Metadata } from 'next'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { HeaderActions } from '@/components/configurator/HeaderActions'
import { ConfiguratorApp } from '@/components/configurator/ConfiguratorApp'

export const metadata: Metadata = {
  title: '3D 别墅配置器 | Nusantara Villa',
  description:
    'Configure your luxury villa in Bali with 3D real-time preview and get an instant BOQ estimate.',
}

export default function ConfiguratorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <SiteHeader rightSlot={<HeaderActions />} />
        <ConfiguratorApp />
      </div>
    </main>
  )
}
