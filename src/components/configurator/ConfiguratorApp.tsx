// ============================================================
// Nusantara Villa - 配置器主体 (Client Component)
// 从页面拆出，供首页与 /configurator 复用
// 技术规范：
//   1. 使用 next/dynamic 无 SSR 导入 3D 场景
//   2. 避免编译时 window/WebGL 错误
//   3. 3D 场景懒加载，提升 LCP
// ============================================================

'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useConfiguratorStore, useQuote } from '@/store/useConfiguratorStore'
import { StepContainer } from '@/components/configurator/StepContainer'
import { SelectionGrid } from '@/components/configurator/SelectionGrid'
import { QuoteSummary } from '@/components/configurator/QuoteSummary'
import { LeadForm } from '@/components/configurator/LeadForm'
import { UrlPreset } from '@/components/configurator/UrlPreset'

// ============================================================
// 静态常量（模块作用域，避免每次渲染重新创建）
// ============================================================

const STYLE_NAMES: Record<string, string> = {
  modern_tropical: '现代热带',
  wabi_sabi: '侘寂风',
  mediterranean: '地中海',
}

const TIER_NAMES: Record<string, string> = {
  standard: '标准',
  luxury: '豪华',
  ultra_luxury: '超豪华',
}

// ============================================================
// 3D 场景：动态导入，禁用 SSR
// ============================================================

const VillaScene = dynamic(
  () => import('@/components/3d/VillaScene').then((mod) => mod.VillaScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium">Loading 3D Scene...</p>
          <p className="text-gray-400 text-xs mt-1">Preparing your villa</p>
        </div>
      </div>
    ),
  }
)

// ============================================================
// 步骤 1: 欢迎页
// ============================================================

function WelcomeStep() {
  const nextStep = useConfiguratorStore((s) => s.nextStep)

  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-8">
      <div className="text-7xl mb-6 animate-bounce">🏡</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Design Your Dream Villa
      </h2>
      <p className="text-gray-500 text-sm max-w-sm mb-6 leading-relaxed">
        Configure your luxury villa in Bali with 3D real-time preview
        and get an instant BOQ estimate.
      </p>
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">🌴 3D 预览</span>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">📊 实时报价</span>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">📈 ROI 测算</span>
      </div>
      <button
        onClick={nextStep}
        className="px-8 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        Start Configuring →
      </button>
    </div>
  )
}

// ============================================================
// 步骤: 完成页
// ============================================================

function CompletionStep() {
  const reset = useConfiguratorStore((s) => s.reset)
  const style = useConfiguratorStore((s) => s.style)
  const size = useConfiguratorStore((s) => s.size)
  const tier = useConfiguratorStore((s) => s.tier)
  const whatsappLink = useConfiguratorStore((s) => s.whatsappLink)
  const { quote, displayPrice } = useQuote()

  const styleName = style ? STYLE_NAMES[style] : '现代热带'
  const tierName = tier ? TIER_NAMES[tier] : '标准'

  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-8">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-5xl mb-6 animate-bounce">
        ✅
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Configuration Saved!
      </h2>
      <p className="text-gray-500 text-sm max-w-sm mb-4 leading-relaxed">
        Your villa configuration has been saved. A member of our team will contact you within 24 hours.
      </p>
      {quote && (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl px-6 py-4 mb-6 w-full max-w-xs">
          <p className="text-sm text-gray-600">Estimated Budget</p>
          <p className="text-2xl font-bold text-primary-700">{displayPrice}</p>
          <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
            <span>{styleName}</span>
            <span>•</span>
            <span>{size || '—'} m²</span>
            <span>•</span>
            <span>{tierName}</span>
          </div>
        </div>
      )}
      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 mb-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-md"
        >
          💬 Chat with Us on WhatsApp
        </a>
      )}
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
      >
        Start New Configuration
      </button>
    </div>
  )
}

// ============================================================
// 配置器主体
// ============================================================

export function ConfiguratorApp() {
  const currentStep = useConfiguratorStore((s) => s.currentStep)
  const disclaimer = useConfiguratorStore((s) => s.disclaimer)

  // 步骤 → 内容映射
  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep />
      case 'select_style':
        return <SelectionGrid type="style" />
      case 'select_size':
        return <SelectionGrid type="size" />
      case 'select_tier':
        return <SelectionGrid type="tier" />
      case 'select_addons':
        return <SelectionGrid type="addons" />
      case 'review_quote':
        return <QuoteSummary />
      case 'submit_lead':
        return <LeadForm />
      case 'complete':
        return <CompletionStep />
      default:
        return null
    }
  }

  // 步骤标题映射
  const stepTitles: Record<string, { title: string; description: string }> = {
    welcome: { title: '', description: '' },
    select_style: { title: '选择建筑风格', description: '选择您喜欢的别墅风格' },
    select_size: { title: '选择建筑面积', description: '确定别墅的建筑面积' },
    select_tier: { title: '选择装修档次', description: '选择您想要的装修标准' },
    select_addons: { title: '增值模块', description: '添加您想要的增值功能' },
    review_quote: { title: '报价预览', description: '查看您的专属报价方案' },
    submit_lead: { title: '提交意向', description: '填写信息，获取完整 BOQ' },
    complete: { title: '', description: '' },
  }

  const { title, description } = stepTitles[currentStep] || { title: '', description: '' }

  return (
    <>
      {/* URL 参数预设（?style=&area=），useSearchParams 需 Suspense 边界 */}
      <Suspense fallback={null}>
        <UrlPreset />
      </Suspense>

      {/* ---------- 主布局 ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* 左侧: 3D 场景 (3/5) */}
        <div className="lg:col-span-3">
          <div className="relative aspect-video lg:aspect-auto lg:h-[580px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-xl">
            <Suspense
              fallback={
                <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 text-sm font-medium">加载 3D 场景...</p>
                  </div>
                </div>
              }
            >
              <VillaScene />
            </Suspense>
          </div>
        </div>

        {/* 右侧: 配置面板 (2/5) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100/80 p-5 h-full max-h-[580px] overflow-y-auto scroll-smooth">
            <StepContainer title={title} description={description}>
              {renderStepContent()}
            </StepContainer>
          </div>
        </div>
      </div>

      {/* ---------- 免责声明 ---------- */}
      <div className="mt-5 text-center">
        <p className="text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed">
          ⚠️ {disclaimer}
        </p>
      </div>
    </>
  )
}
