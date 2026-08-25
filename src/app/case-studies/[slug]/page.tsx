// ============================================================
// Nusantara Villa - 案例详情页 (SSG，22 个 slug 全量预渲染)
// 路由: /case-studies/[slug]
// ============================================================

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check, MapPin, Ruler, Sparkles } from 'lucide-react'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { GalleryLightbox } from '@/components/cases/GalleryLightbox'
import { getAllCases, getCaseBySlug } from '@/lib/cases'

// 只渲染 generateStaticParams 返回的 slug，其余 404
export const dynamicParams = false

interface CaseDetailPageProps {
  params: { slug: string }
}

// ============================================================
// 静态参数: 全部 22 个案例
// ============================================================

export function generateStaticParams(): { slug: string }[] {
  return getAllCases().map((c) => ({ slug: c.slug }))
}

// ============================================================
// 动态 Metadata
// ============================================================

export function generateMetadata({ params }: CaseDetailPageProps): Metadata {
  const item = getCaseBySlug(params.slug)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''

  if (!item) {
    return {
      title: '案例未找到 | Nusantara Villa',
      description: '您访问的案例不存在或已下架。',
    }
  }

  return {
    title: `${item.title} | 精选案例 | Nusantara Villa`,
    description: item.description,
    openGraph: {
      title: `${item.title} | Nusantara Villa`,
      description: item.description,
      images: [`${baseUrl}${item.coverImage}`],
    },
  }
}

// ============================================================
// 页面
// ============================================================

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const item = getCaseBySlug(params.slug)
  if (!item) notFound()

  const configuratorLink = `/configurator?style=${item.styleTag}&area=${item.areaSqm}`

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <SiteHeader />

        {/* ---------- 返回列表 ---------- */}
        <Link
          href="/case-studies"
          className="inline-flex items-center gap-1.5 mt-4 text-sm text-gray-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回案例列表
        </Link>

        {/* ---------- 英雄区 ---------- */}
        <section className="mt-4">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-2xl bg-gray-100 shadow-xl">
            <Image
              src={item.coverImage}
              alt={item.title}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{item.title}</h2>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {item.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Ruler className="w-4 h-4" />
                  {item.areaSqm} m²
                </span>
              </div>
            </div>

            {/* 徽章组 */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                {item.styleLabel}
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                {item.source}
              </span>
              {item.note && (
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                  {item.note}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ---------- 项目描述 ---------- */}
        <section className="mt-10">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            项目描述
          </h3>
          <p className="mt-3 text-gray-600 leading-relaxed max-w-3xl">{item.description}</p>
        </section>

        {/* ---------- 设计亮点 ---------- */}
        <section className="mt-10">
          <h3 className="text-lg font-bold text-gray-900">设计亮点</h3>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
            {item.designHighlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-2.5 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm"
              >
                <Check className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                <span className="text-sm text-gray-700">{highlight}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- 实景图集 ---------- */}
        <section className="mt-10 pb-24">
          <h3 className="text-lg font-bold text-gray-900 mb-4">实景图集</h3>
          <GalleryLightbox images={item.galleryImages} title={item.title} />
        </section>

        {/* ---------- 底部固定 CTA ---------- */}
        <div className="sticky bottom-4 z-40 pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/95 backdrop-blur rounded-2xl border border-emerald-100 shadow-xl px-6 py-4">
            <div>
              <p className="font-bold text-gray-900">喜欢这套设计？</p>
              <p className="text-xs text-gray-500">定制同款别墅，获取专属报价</p>
            </div>
            <Link
              href={configuratorLink}
              className="shrink-0 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
            >
              定制同款别墅，获取专属报价 →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
