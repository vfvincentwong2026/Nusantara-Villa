// ============================================================
// Nusantara Villa - 站点共享头部导航
// 用法: <SiteHeader rightSlot={<CurrencyToggle />} />
// ============================================================

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SiteHeaderProps {
  /** 右侧插槽（如 CurrencyToggle），可选 */
  rightSlot?: ReactNode
}

export function SiteHeader({ rightSlot }: SiteHeaderProps) {
  const pathname = usePathname()
  const isCasesActive = pathname.startsWith('/case-studies')

  return (
    <header className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-lg font-bold shadow-md group-hover:shadow-lg transition-shadow">
            NV
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Nusantara Villa</h1>
            <p className="text-xs text-gray-400 hidden sm:block">3D Configurator & BOQ Estimator</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/case-studies"
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              isCasesActive
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/60'
            )}
          >
            精选案例
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">{rightSlot}</div>
    </header>
  )
}
