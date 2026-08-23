// ============================================================
// Nusantara Villa - 步骤容器组件
// 功能：进度条 + 标题 + 内容 + 导航按钮
// ============================================================

'use client'

import { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useConfiguratorStore,
  useConfigNavigation,
  STEP_ORDER,
} from '@/store/useConfiguratorStore'

interface StepContainerProps {
  children: ReactNode
  title?: string
  description?: string
  showNavigation?: boolean
  nextLabel?: string
  onNext?: () => void
  onPrev?: () => void
  onReset?: () => void // 新增：允许父组件自定义重置行为
  nextDisabled?: boolean
  hideProgress?: boolean
}

// 从 store 的 STEP_ORDER 派生步骤点（排除 welcome 和 complete）
const STEP_DOTS = STEP_ORDER.filter(
  (step) => step !== 'welcome' && step !== 'complete'
)

// 步骤名称映射（用于 tooltip）
const STEP_LABELS: Record<string, string> = {
  select_style: '选择风格',
  select_size: '选择面积',
  select_tier: '选择档次',
  select_addons: '增值模块',
  review_quote: '报价预览',
  submit_lead: '提交意向',
}

export function StepContainer({
  children,
  title,
  description,
  showNavigation = true,
  nextLabel = '下一步',
  onNext,
  onPrev,
  onReset,
  nextDisabled = false,
  hideProgress = false,
}: StepContainerProps) {
  const { currentStep, canGoNext, canGoPrev, progress } = useConfigNavigation()
  const nextStep = useConfiguratorStore((s) => s.nextStep)
  const prevStep = useConfiguratorStore((s) => s.prevStep)
  // 使用 getState 静态获取 reset，避免不必要的重渲染
  const reset = useConfiguratorStore.getState().reset

  const isWelcome = currentStep === 'welcome'
  const isComplete = currentStep === 'complete'

  const handleNext = () => {
    if (onNext) {
      onNext()
    } else {
      nextStep()
    }
  }

  const handlePrev = () => {
    if (onPrev) {
      onPrev()
    } else {
      prevStep()
    }
  }

  const handleReset = () => {
    if (onReset) {
      onReset()
    } else {
      reset()
    }
  }

  const currentIndex = STEP_DOTS.indexOf(currentStep)

  // 是否显示进度条
  const shouldShowProgress = !hideProgress && !isWelcome && !isComplete

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 进度条 */}
      {shouldShowProgress && (
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>进度</span>
            <span className="font-medium text-primary-600">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* 步骤点 */}
          <div className="hidden sm:flex items-center justify-between mt-3 px-1">
            {STEP_DOTS.map((step, idx) => {
              const isActive = idx <= currentIndex
              const isCurrent = idx === currentIndex
              const stepLabel = STEP_LABELS[step] || step

              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div
                    className={`
                      w-2.5 h-2.5 rounded-full transition-all duration-300 flex-shrink-0
                      ${isActive ? 'bg-primary-500' : 'bg-gray-200'}
                      ${isCurrent ? 'ring-4 ring-primary-100 ring-offset-1' : ''}
                    `}
                    title={stepLabel}
                  />
                  {idx < STEP_DOTS.length - 1 && (
                    <div
                      className={`
                        h-0.5 flex-1 mx-1 transition-all duration-300
                        ${isActive && idx < currentIndex ? 'bg-primary-400' : 'bg-gray-200'}
                      `}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 标题 */}
      {!isWelcome && !isComplete && title && (
        <div className="mb-3 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      )}

      {/* 内容区域 */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 scroll-smooth">
        {children}
      </div>

      {/* 导航按钮 */}
      {showNavigation && !isComplete && (
        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handlePrev}
            disabled={isWelcome || !canGoPrev}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
            上一步
          </button>

          <button
            onClick={handleNext}
            disabled={nextDisabled || !canGoNext}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
          >
            {nextLabel}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 完成页按钮 */}
      {isComplete && (
        <div className="flex justify-center mt-4 pt-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            重新开始
          </button>
        </div>
      )}
    </div>
  )
}
