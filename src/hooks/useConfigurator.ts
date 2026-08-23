
// ============================================================
// Nusantara-Villa 配置器 Hook
// 封装配置器逻辑，提供便捷的 API
// ============================================================

import { useEffect, useCallback, useMemo } from 'react'
import { useConfiguratorStore, useIsConfigComplete } from '@/store/configuratorStore'
import { 
  VillaStyle, 
  AreaSize, 
  TierLevel, 
  AddonCode, 
  ConfigStep,
  StylePreset,
  SizeOption,
  TierOption,
  AddonOption,
  QuoteResult,
  ROIResult,
} from '@/types/configurator'

// ============================================================
// 1. 预设数据
// ============================================================

import { STYLE_PRESETS, SIZE_OPTIONS, TIER_OPTIONS, ADDON_OPTIONS } from '@/config/presets'

// ============================================================
// 2. 主 Hook
// ============================================================

export function useConfigurator() {
  const store = useConfiguratorStore()
  const isComplete = useIsConfigComplete()

  // ---------- 配置选项 ----------
  const styles = STYLE_PRESETS
  const sizes = SIZE_OPTIONS
  const tiers = TIER_OPTIONS
  const addons = ADDON_OPTIONS

  // ---------- 当前选择 ----------
  const selectedStyle = store.style
  const selectedSize = store.size
  const selectedTier = store.tier
  const selectedAddons = store.addons

  // ---------- 计算属性 ----------
  const selectedStyleData = useMemo(() => {
    return styles.find(s => s.id === selectedStyle) || null
  }, [selectedStyle, styles])

  const selectedSizeData = useMemo(() => {
    return sizes.find(s => s.value === selectedSize) || null
  }, [selectedSize, sizes])

  const selectedTierData = useMemo(() => {
    return tiers.find(t => t.value === selectedTier) || null
  }, [selectedTier, tiers])

  const selectedAddonsData = useMemo(() => {
    return addons.filter(a => selectedAddons.includes(a.code))
  }, [selectedAddons, addons])

  // ---------- 步骤导航 ----------
  const goToStep = useCallback((step: ConfigStep) => {
    store.goToStep(step)
  }, [store])

  const nextStep = useCallback(() => {
    store.nextStep()
  }, [store])

  const prevStep = useCallback(() => {
    store.prevStep()
  }, [store])

  const reset = useCallback(() => {
    store.reset()
  }, [store])

  // ---------- 配置动作 ----------
  const selectStyle = useCallback((style: VillaStyle) => {
    store.setStyle(style)
  }, [store])

  const selectSize = useCallback((size: AreaSize) => {
    store.setSize(size)
  }, [store])

  const selectTier = useCallback((tier: TierLevel) => {
    store.setTier(tier)
  }, [store])

  const toggleAddon = useCallback((addon: AddonCode) => {
    store.toggleAddon(addon)
  }, [store])

  const setUserInfo = useCallback((info: { name: string; email: string; phone: string; message?: string }) => {
    store.setUserInfo(info)
  }, [store])

  // ---------- 报价计算 ----------
  const calculateQuote = useCallback((): QuoteResult | null => {
    const { style, size, tier, addons } = store
    if (!style || !size || !tier) return null

    // 获取价格系数
    const sizeMultiplier = sizes.find(s => s.value === size)?.multiplier || 1
    const tierMultiplier = tiers.find(t => t.value === tier)?.multiplier || 1

    // 基础价格计算
    const baseRate = 2500 // USD / m² 基础单价
    const basePrice = baseRate * size * sizeMultiplier * tierMultiplier

    // 增值模块价格
    let addonsPrice = 0
    const addonsBreakdown: Record<AddonCode, number> = {} as Record<AddonCode, number>
    
    addons.forEach(code => {
      const addon = ADDON_OPTIONS.find(a => a.code === code)
      if (addon) {
        let price = 0
        if (addon.pricePerSqm) {
          price = addon.pricePerSqm * size
        } else if (addon.priceFixed) {
          price = addon.priceFixed
        }
        addonsPrice += price
        addonsBreakdown[code] = price
      }
    })

    // 管理费（总价的 10%）
    const subtotal = basePrice + addonsPrice
    const managementFee = subtotal * 0.10
    const totalPrice = subtotal + managementFee

    // 施工周期估算
    const estimatedMonths = 8 + Math.ceil(size / 50)

    return {
      basePrice: Math.round(basePrice),
      addonsPrice: Math.round(addonsPrice),
      managementFee: Math.round(managementFee),
      totalPrice: Math.round(totalPrice),
      currency: 'USD',
      breakdown: {
        structure: Math.round(basePrice * 0.35),
        finishing: Math.round(basePrice * 0.30),
        furniture: Math.round(basePrice * 0.20),
        addons: addonsBreakdown,
        management: Math.round(managementFee),
      },
      estimatedCompletionMonths: estimatedMonths,
    }
  }, [store, sizes, tiers])

  // ---------- ROI 计算 ----------
  const calculateROI = useCallback((quote: QuoteResult, location: string = 'bali'): ROIResult | null => {
    // 简化版 ROI 计算
    // 实际可从配置中读取不同地点的租金数据
    const occupancyRate = 0.75
    const managementFeeRate = 0.15
    const taxRate = 0.10
    
    const dailyRate = 2.0 // USD / m² / day
    const annualRevenue = dailyRate * quote.totalPrice * 0.2 * 365 * occupancyRate
    const annualCost = annualRevenue * (managementFeeRate + taxRate)
    const netIncome = annualRevenue - annualCost
    const grossYield = (annualRevenue / quote.totalPrice) * 100
    const netYield = (netIncome / quote.totalPrice) * 100
    const paybackYears = quote.totalPrice / netIncome

    return {
      estimatedDailyRent: Math.round(dailyRate * quote.totalPrice * 0.2),
      estimatedMonthlyRent: Math.round(annualRevenue / 12),
      estimatedYearlyRent: Math.round(annualRevenue),
      grossYield: Math.round(grossYield * 10) / 10,
      netYield: Math.round(netYield * 10) / 10,
      paybackYears: Math.round(paybackYears * 10) / 10,
      currency: 'USD',
    }
  }, [])

  // ---------- 自动更新报价 ----------
  useEffect(() => {
    const { style, size, tier } = store
    if (style && size && tier) {
      const quote = calculateQuote()
      if (quote) {
        store.setQuote(quote)
        
        // 同时计算 ROI
        const roi = calculateROI(quote)
        if (roi) {
          store.setROI(roi)
        }
      }
    }
  }, [store.style, store.size, store.tier, store.addons, calculateQuote, calculateROI])

  // ---------- 返回 API ----------
  return {
    // 状态
    currentStep: store.currentStep,
    progress: store.progress,
    stepLabel: store.stepLabel,
    stepDescription: store.stepDescription,
    canGoNext: store.canGoNext,
    canGoPrev: store.canGoPrev,
    isComplete: store.isComplete,
    isSubmitting: store.isSubmitting,
    errors: store.errors,
    
    // 配置
    styles,
    sizes,
    tiers,
    addons,
    selectedStyle,
    selectedSize,
    selectedTier,
    selectedAddons,
    selectedStyleData,
    selectedSizeData,
    selectedTierData,
    selectedAddonsData,
    
    // 结果
    quote: store.quote,
    roi: store.roi,
    
    // 动作
    selectStyle,
    selectSize,
    selectTier,
    toggleAddon,
    setUserInfo,
    goToStep,
    nextStep,
    prevStep,
    reset,
    setSubmitting: store.setSubmitting,
    complete: store.complete,
    
    // 工具
    calculateQuote,
    calculateROI,
    isConfigComplete: isComplete,
  }
}
