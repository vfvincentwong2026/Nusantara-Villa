// ============================================================
// Nusantara Villa - 案例风格筛选按钮组 (Client Component)
// 通过 URL searchParams (?style=xxx) 切换，router.replace 不刷新页面
// ============================================================

'use client'

import { useRouter } from 'next/navigation'
import { STYLE_FILTERS, type StyleFilterValue } from '@/lib/cases'
import { cn } from '@/lib/utils'

interface StyleFilterProps {
  current: StyleFilterValue
}

export function StyleFilter({ current }: StyleFilterProps) {
  const router = useRouter()

  const handleSelect = (value: StyleFilterValue) => {
    if (value === current) return
    if (value === 'all') {
      router.replace('/case-studies')
    } else {
      router.replace(`/case-studies?style=${value}`)
    }
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="风格筛选">
      {STYLE_FILTERS.map((filter) => {
        const isActive = filter.value === current
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => handleSelect(filter.value)}
            aria-pressed={isActive}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all border',
              isActive
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
            )}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}
