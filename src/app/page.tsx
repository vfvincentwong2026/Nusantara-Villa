// ============================================================
// Nusantara Villa - 首页 (Server Component 外壳)
// 配置器主体在 ConfiguratorApp (Client)，案例区块 SSG 直读数据
// ============================================================

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { HeaderActions } from '@/components/configurator/HeaderActions'
import { ConfiguratorApp } from '@/components/configurator/ConfiguratorApp'
import { CaseCard } from '@/components/cases/CaseCard'
import { getLatestCases } from '@/lib/cases'

export default function HomePage() {
  const latestCases = getLatestCases(3)

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <SiteHeader rightSlot={<HeaderActions />} />

        {/* ---------- 3D 配置器 ---------- */}
        <ConfiguratorApp />

        {/* ---------- 标杆作品 ---------- */}
        <section className="mt-14 pb-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-emerald-600 tracking-wide uppercase">
                Signature Works
              </p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">标杆作品</h2>
              <p className="mt-1 text-sm text-gray-500">
                精选高端别墅实景案例，定制同款即可获取专属报价。
              </p>
            </div>
            <Link
              href="/case-studies"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              查看全部案例
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {latestCases.map((item) => (
              <CaseCard key={item.slug} item={item} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
            >
              查看全部案例
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
