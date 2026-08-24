'use client'

import { useQuote, useConfiguratorStore } from '@/store/useConfiguratorStore'

// ============================================================
// 1. 静态常量（模块作用域）
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

const ADDON_NAMES: Record<string, string> = {
  pool: '泳池',
  rooftop: '屋顶露台',
  spa: 'SPA',
  smart_home: '智能家居',
}

// ============================================================
// 2. 工具函数
// ============================================================

function formatCurrencyValue(value: number, currency: string): string {
  const safeValue = value ?? 0
  if (currency === 'IDR') {
    return `Rp ${safeValue.toLocaleString('id-ID')}`
  }
  return `$${safeValue.toLocaleString('en-US')}`
}

// ============================================================
// 3. 辅助组件：报价行
// ============================================================

interface RowProps {
  label: string
  value: number
  currency: string
  bold?: boolean
}

function Row({ label, value, currency, bold = false }: RowProps) {
  const formatted = formatCurrencyValue(value, currency)

  return (
    <div className={`flex items-center justify-between text-sm ${bold ? 'font-semibold' : ''}`}>
      <span className={bold ? 'text-gray-800' : 'text-gray-600'}>{label}</span>
      <span className={bold ? 'text-gray-900' : 'text-gray-700'}>{formatted}</span>
    </div>
  )
}

// ============================================================
// 4. 主组件
// ============================================================

export function QuoteSummary() {
  const { quote, roi, currency, displayPrice, displayPriceIDR, disclaimer } = useQuote()
  const style = useConfiguratorStore((s) => s.style)
  const size = useConfiguratorStore((s) => s.size)
  const tier = useConfiguratorStore((s) => s.tier)

  const isIDR = currency === 'IDR'

  const styleName = style ? STYLE_NAMES[style] || style : '—'
  const tierName = tier ? TIER_NAMES[tier] || tier : '—'

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 bg-gray-50 rounded-xl">
        <p className="text-sm font-medium">请先完成配置</p>
        <p className="text-xs mt-1">选择风格、面积和档次后查看报价</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 总价卡片 */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100/80 rounded-xl p-5 text-center border border-primary-100">
        <p className="text-sm text-gray-600">预估总造价</p>
        <p className="text-3xl font-bold text-primary-700">{displayPrice}</p>
        {/* USD 模式下显示 IDR 约数 */}
        {!isIDR && displayPriceIDR && (
          <p className="text-xs text-gray-400 mt-0.5">≈ {displayPriceIDR}</p>
        )}
        <div className="flex justify-center gap-3 mt-2 text-xs text-gray-500">
          <span>{styleName}</span>
          <span>•</span>
          <span>{size || '—'} m²</span>
          <span>•</span>
          <span>{tierName}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          🏗️ 施工周期约 {quote.estimatedCompletionMonths} 个月
        </p>
      </div>

      {/* 报价明细 */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">报价明细</h4>
        <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 border border-gray-100">
          <Row label="结构工程" value={quote.breakdown.structure} currency={currency} />
          <Row label="装修工程" value={quote.breakdown.finishing} currency={currency} />
          <Row label="家具软装" value={quote.breakdown.furniture} currency={currency} />
          {Object.entries(quote.breakdown.addons)
            .filter(([_, price]) => price > 0)
            .map(([code, price]) => {
              const name = ADDON_NAMES[code] || code
              return <Row key={code} label={`+ ${name}`} value={price} currency={currency} />
            })}
          <Row label="管理费 (10%)" value={quote.breakdown.management} currency={currency} />
          <div className="border-t border-gray-200 pt-1.5 mt-1">
            <Row label="总计" value={quote.totalPrice} currency={currency} bold />
          </div>
        </div>
      </div>

      {/* ROI 估算 */}
      {roi && (
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
          <h4 className="text-sm font-medium text-emerald-800 mb-2">📈 投资回报估算</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-emerald-600 text-xs">日租金</p>
              <p className="font-semibold text-emerald-800">
                {formatCurrencyValue(roi.estimatedDailyRent, currency)}
              </p>
            </div>
            <div>
              <p className="text-emerald-600 text-xs">年化收益</p>
              <p className="font-semibold text-emerald-800">
                {formatCurrencyValue(roi.estimatedYearlyRent, currency)}
              </p>
            </div>
            <div>
              <p className="text-emerald-600 text-xs">毛回报率</p>
              <p className="font-semibold text-emerald-800">{roi.grossYield}%</p>
            </div>
            <div>
              <p className="text-emerald-600 text-xs">回本周期</p>
              <p className="font-semibold text-emerald-800">{roi.paybackYears} 年</p>
            </div>
          </div>
        </div>
      )}

      {/* 免责声明 */}
      {disclaimer && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-400 leading-relaxed">⚠️ {disclaimer}</p>
        </div>
      )}
    </div>
  )
}
