// ============================================================
// Nusantara Villa - 案例卡片（Server Component，可在列表页/首页复用）
// ============================================================

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Ruler } from 'lucide-react'
import type { CaseStudy } from '@/lib/cases'

interface CaseCardProps {
  item: CaseStudy
  /** 首屏图片可设 priority 提升 LCP */
  priority?: boolean
}

export function CaseCard({ item, priority = false }: CaseCardProps) {
  return (
    <Link
      href={`/case-studies/${item.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={item.coverImage}
          alt={item.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
          {item.title}
        </h3>

        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {item.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5" />
            {item.areaSqm} m²
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
            {item.styleLabel}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs">
            {item.source}
          </span>
        </div>
      </div>
    </Link>
  )
}
