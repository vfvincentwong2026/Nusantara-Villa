// ============================================================
// Nusantara Villa - 头部右侧操作区 (Client Component)
// 欢迎页与完成页隐藏 CurrencyToggle，与原内联 header 行为一致
// ============================================================

'use client'

import { useConfiguratorStore } from '@/store/useConfiguratorStore'
import { CurrencyToggle } from '@/components/ui/CurrencyToggle'

export function HeaderActions() {
  const currentStep = useConfiguratorStore((s) => s.currentStep)
  const isWelcome = currentStep === 'welcome'
  const isCompleteStep = currentStep === 'complete'

  if (isWelcome || isCompleteStep) return null
  return <CurrencyToggle />
}
