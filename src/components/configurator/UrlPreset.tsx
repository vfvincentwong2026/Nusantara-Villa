// ============================================================
// Nusantara Villa - URL 参数预设 (Client Component)
// 从 ?style=&area= 读取案例详情页带来的预选参数，写入 Zustand store
// 注意: useSearchParams 必须置于 <Suspense> 边界内（Next 14 CSR bailout）
// ============================================================

'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  useConfiguratorStore,
  type AreaSize,
  type VillaStyle,
} from '@/store/useConfiguratorStore'

const VALID_STYLES: readonly VillaStyle[] = [
  'modern_tropical',
  'wabi_sabi',
  'mediterranean',
]

/** 任意面积映射到最近的配置器档位 */
function mapAreaToSize(area: number): AreaSize {
  if (area <= 150) return 150
  if (area <= 200) return 200
  return 300
}

export function UrlPreset() {
  const searchParams = useSearchParams()
  const appliedRef = useRef(false)

  useEffect(() => {
    // 防重复执行（StrictMode 双调用 / 参数变化）
    if (appliedRef.current) return

    const styleParam = searchParams.get('style')
    const areaParam = searchParams.get('area')
    if (!styleParam && !areaParam) return

    const state = useConfiguratorStore.getState()

    // 仅在 store 处于初始 welcome 状态、且用户未手动选择过时执行
    const isInitialWelcome =
      state.currentStep === 'welcome' && state.style === null && state.size === null
    if (!isInitialWelcome) return

    appliedRef.current = true

    if (styleParam && (VALID_STYLES as readonly string[]).includes(styleParam)) {
      state.setStyle(styleParam as VillaStyle)
    }

    if (areaParam) {
      const area = Number(areaParam)
      if (Number.isFinite(area) && area > 0) {
        state.setSize(mapAreaToSize(area))
      }
    }
  }, [searchParams])

  return null
}
