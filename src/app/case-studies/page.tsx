// ============================================================
// Nusantara Villa - 案例列表页 (Server Component)
// 路由: /case-studies?style=<styleTag>
// ============================================================

import type { Metadata } from 'next'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { CaseCard } from '@/components/cases/CaseCard'
import { StyleFilter } from '@/components/cases/StyleFilter'
import { getAllCases, getCasesByStyle, normalizeStyleFilter } from '@/lib/cases'
import type { VillaStyle } from '@/store/useConfiguratorStore'

export const metadata: Metadata = {
  title: '精选案例 | Nusantara Villa',
  description:
    '探索 Nusantara Villa 精选高端别墅设计案例：侘寂风、法式/地中海、现代热带风格实景作品，获取专属定制报价。',
}

interface CaseStudiesPageProps {
  searchParams: { style?: string }
}

export default function CaseStudiesPage({ searchParams }: CaseStudiesPageProps) {
  const currentFilter = normalizeStyleFilter(searchParams.style)
  const cases =
    currentFilter === 'all'
      ? getAllCases()
      : getCasesByStyle(currentFilter as VillaStyle)

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <SiteHeader />

        {/* ---------- 页头 ---------- */}
        <section className="mt-8 mb-6">
          <p className="text-sm font-medium text-emerald-600 tracking-wide uppercase">
            Signature Works
          </p>
          <h2 className="mt-1 text-3xl font-bold text-gray-900">精选案例</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl leading-relaxed">
            每一处空间都是对生活方式的诠释。浏览我们精选的高端别墅实景作品，
            找到心仪的风格，即可一键定制同款并获取专属报价。
          </p>
        </section>

        {/* ---------- 风格筛选 ---------- */}
        <div className="mb-8">
          <StyleFilter current={currentFilter} />
        </div>

        {/* ---------- 案例网格 ---------- */}
        {cases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-16">
            {cases.map((item, i) => (
              <CaseCard key={item.slug} item={item} priority={i < 3} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400 text-sm">
            该风格下暂无案例，敬请期待。
          </div>
        )}
      </div>
    </main>
  )
}
