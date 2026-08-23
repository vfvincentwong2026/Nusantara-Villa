// ============================================================
// Nusantara-Villa 步骤布局组件
// 统一的步骤容器，包含进度条、标题和导航按钮
// ============================================================

'use client'

import React, { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useConfigurator } from '@/hooks/useConfigurator'
import { cn } from '@/lib/utils'

interface StepLayoutProps {
  children: ReactNode
  title: string
  description?: string
  showNavigation?: boolean
  nextLabel?: string
  onNext?: () => void
  onPrev?: () => void
  nextDisabled?: boolean
  className?: string
}

export function StepLayout({
  children,
  title,
  description,
  showNavigation = true,
  nextLabel = '下一步',
  onNext,
  onPrev,
  nextDisabled = false,
  className,
}: StepLayoutProps) {
  const { currentStep, progress, canGoNext, canGoPrev, prevStep, nextStep } = useConfigurator()

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

  const isFirstStep = currentStep === 'welcome'
  const isLastStep = currentStep === 'submit_lead' || currentStep === 'complete'

  return (
    <div className="flex flex-col h-full">
      {/* 进度条 */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>进度</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 标题区域 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {/* 内容区域 */}
      <div className={cn('flex-1', className)}>
        {children}
      </div>

      {/* 导航按钮 */}
      {showNavigation && !isLastStep && (
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handlePrev}
            disabled={isFirstStep || !canGoPrev}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
              'text-gray-600 hover:bg-gray-100',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            上一步
          </button>

          <button
            onClick={handleNext}
            disabled={nextDisabled || !canGoNext}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors',
              'bg-primary-600 hover:bg-primary-700 shadow-sm',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600'
            )}
          >
            {nextLabel}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 完成状态 */}
      {isLastStep && (
        <div className="flex justify-center mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 text-emerald-600">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <span className="font-medium">已完成所有配置</span>
          </div>
        </div>
      )}
    </div>
  )
}
