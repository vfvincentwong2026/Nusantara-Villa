// ============================================================
// Nusantara Villa - 配置状态管理与算价引擎 (Zustand Store)
// 技术规范：
//   1. 细粒度 Selector，避免 3D Canvas 不必要重绘
//   2. 包含免责声明 (Baseline Estimate; Final BOQ Subject to Site Visit)
//   3. 支持 USD / IDR 动态切换
//   4. 纯客户端 Zustand Store (完美兼容 SSR Hydration)
// ============================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================================
// 1. 类型定义
// ============================================================

export type VillaStyle = 'modern_tropical' | 'wabi_sadi' | 'mediterranean'
export type AreaSize = 150 | 200 | 300
export type TierLevel = 'standard' | 'luxury' | 'ultra_luxury'
export type AddonCode = 'pool' | 'rooftop' | 'spa' | 'smart_home'
export type Currency = 'USD' | 'IDR'

/** 免责声明（符合规范要求） */
export const DISCLAIMER =
  'Baseline Estimate; Final BOQ Subject to Site Visit & Soil Survey'

export interface QuoteBreakdown {
  structure: number
  finishing: number
  furniture: number
  addons: Record<AddonCode, number>
  management: number
}

export interface QuoteResult {
  basePrice: number
  addonsPrice: number
  managementFee: number
  totalPrice: number
  currency: Currency
  breakdown: QuoteBreakdown
  estimatedCompletionMonths: number
  disclaimer: string
}

export interface ROIResult {
  estimatedDailyRent: number
  estimatedMonthlyRent: number
  estimatedYearlyRent: number
  grossYield: number
  netYield: number
  paybackYears: number
  currency: Currency
}

export interface UserInfo {
  name: string
  email: string
  phone: string
  message?: string
}

export type ConfigStep =
  | 'welcome'
  | 'select_style'
  | 'select_size'
  | 'select_tier'
  | 'select_addons'
  | 'review_quote'
  | 'submit_lead'
  | 'complete'

// ============================================================
// 2. 预设配置数据（价格基准）
// ============================================================

export interface StylePreset {
  id: VillaStyle
  name: string
  nameId: string
  description: string
  emoji: string
  colors: { primary: string; secondary: string; accent: string }
  materials: string[]
  furnitureSet: string
  previewModel: string
  previewImage: string
  tags: string[]
}

export interface SizeOption {
  value: AreaSize
  label: string
  multiplier: number
  description: string
}

export interface TierOption {
  value: TierLevel
  label: string
  labelId: string
  multiplier: number
  description: string
  features: string[]
  emoji: string
}

export interface AddonOption {
  code: AddonCode
  name: string
  nameId: string
  description: string
  icon: string
  pricePerSqm: number | null
  priceFixed: number | null
  minArea?: AreaSize
  maxArea?: AreaSize
  recommendedWith?: VillaStyle[]
  isPopular?: boolean
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'modern_tropical',
    name: '现代热带',
    nameId: 'modern_tropical',
    description: '自然材质与开放空间融合，热带风情与现代简约的完美结合',
    emoji: '🌴',
    colors: { primary: '#8B7D6B', secondary: '#D4C5A9', accent: '#2F5D3A' },
    materials: ['木材', '石材', '玻璃', '藤编'],
    furnitureSet: 'tropical',
    previewModel: '/models/tropical.glb',
    previewImage: '/images/styles/tropical.jpg',
    tags: ['热门', '自然', '现代'],
  },
  {
    id: 'wabi_sabi',
    name: '侘寂风',
    nameId: 'wabi_sabi',
    description: '质朴与残缺之美，追求自然、不完美与时间的痕迹',
    emoji: '🍃',
    colors: { primary: '#C4B5A0', secondary: '#E8DDD0', accent: '#5C4B3A' },
    materials: ['黏土', '亚麻', '原木', '陶瓷'],
    furnitureSet: 'wabi',
    previewModel: '/models/wabi.glb',
    previewImage: '/images/styles/wabi.jpg',
    tags: ['禅意', '质朴', '高端'],
  },
  {
    id: 'mediterranean',
    name: '地中海',
    nameId: 'mediterranean',
    description: '白色与蓝色的交织，拱形门窗与手工陶砖的浪漫',
    emoji: '🌊',
    colors: { primary: '#FFFFFF', secondary: '#4A90D9', accent: '#E8C87A' },
    materials: ['石灰', '陶瓷', '锻铁', '马赛克'],
    furnitureSet: 'mediterranean',
    previewModel: '/models/mediterranean.glb',
    previewImage: '/images/styles/mediterranean.jpg',
    tags: ['浪漫', '明亮', '度假'],
  },
]

export const SIZE_OPTIONS: SizeOption[] = [
  { value: 150, label: '150 m²', multiplier: 1.0, description: '紧凑型别墅，适合小家庭或度假投资' },
  { value: 200, label: '200 m²', multiplier: 1.15, description: '标准型别墅，三至四居室，适合家庭居住' },
  { value: 300, label: '300 m²', multiplier: 1.35, description: '豪华型别墅，五居室以上，适合高端业主' },
]

export const TIER_OPTIONS: TierOption[] = [
  {
    value: 'standard',
    label: '标准',
    labelId: 'standard',
    multiplier: 1.0,
    description: '标准精装，本地材料为主，经济实用',
    features: ['本地材料', '标准工艺', '基本智能配置', '12个月质保'],
    emoji: '🟢',
  },
  {
    value: 'luxury',
    label: '豪华',
    labelId: 'luxury',
    multiplier: 1.6,
    description: '高端精装，进口材料占比 40%，奢华质感',
    features: ['进口材料 40%', '定制家具', '智能家居系统', '24个月质保', '专业软装设计'],
    emoji: '🟡',
  },
  {
    value: 'ultra_luxury',
    label: '超豪华',
    labelId: 'ultra_luxury',
    multiplier: 2.4,
    description: '顶级精装，进口材料占比 70%+，极致奢华',
    features: ['进口材料 70%+', '大师级设计', '全屋智能', '36个月质保', '艺术品配饰', '管家式服务'],
    emoji: '🔴',
  },
]

export const ADDON_OPTIONS: AddonOption[] = [
  {
    code: 'pool',
    name: 'Infinity Pool',
    nameId: 'pool',
    description: '无边泳池，含过滤系统与灯光，奢华别墅标配',
    icon: '🏊',
    pricePerSqm: 400,
    priceFixed: null,
    minArea: 150,
    maxArea: 300,
    recommendedWith: ['modern_tropical', 'mediterranean'],
    isPopular: true,
  },
  {
    code: 'rooftop',
    name: 'Rooftop Deck',
    nameId: 'rooftop',
    description: '屋顶露台，适合观景、聚会、日落晚餐',
    icon: '🌅',
    pricePerSqm: 250,
    priceFixed: null,
    minArea: 150,
    maxArea: 300,
    recommendedWith: ['modern_tropical', 'wabi_sabi'],
    isPopular: true,
  },
  {
    code: 'spa',
    name: 'SPA & Yoga Shala',
    nameId: 'spa',
    description: '私人 SPA 与瑜伽空间，含桑拿和按摩浴缸',
    icon: '🧘',
    pricePerSqm: null,
    priceFixed: 25000,
    minArea: 200,
    maxArea: 300,
    recommendedWith: ['wabi_sabi'],
    isPopular: false,
  },
  {
    code: 'smart_home',
    name: 'Smart Home System',
    nameId: 'smart_home',
    description: '全屋智能系统，含灯光、空调、安防、窗帘控制',
    icon: '🤖',
    pricePerSqm: null,
    priceFixed: 15000,
    minArea: 150,
    maxArea: 300,
    recommendedWith: ['modern_tropical', 'mediterranean'],
    isPopular: false,
  },
]

// 汇率固定值（1 USD = 15,000 IDR）
const USD_TO_IDR = 15000

// ============================================================
// 3. 算价与转换工具函数（纯函数）
// ============================================================

export interface PricingInput {
  style: VillaStyle
  size: AreaSize
  tier: TierLevel
  addons: AddonCode[]
}

/**
 * 货币转换（纯函数）
 */
export function convertPrice(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount
  if (from === 'USD' && to === 'IDR') return Math.round(amount * USD_TO_IDR)
  if (from === 'IDR' && to === 'USD') return Math.round(amount / USD_TO_IDR)
  return amount
}

/**
 * 计算报价（始终以 USD 为基准货币）
 */
export function calculateQuote(input: PricingInput): QuoteResult {
  const { style, size, tier, addons } = input

  const sizeMultiplier = SIZE_OPTIONS.find((s) => s.value === size)?.multiplier || 1.0
  const tierMultiplier = TIER_OPTIONS.find((t) => t.value === tier)?.multiplier || 1.0

  const baseRateMap: Record<VillaStyle, number> = {
    modern_tropical: 2200,
    wabi_sabi: 2400,
    mediterranean: 2100,
  }
  const baseRate = baseRateMap[style] || 2200

  const basePrice = baseRate * size * sizeMultiplier * tierMultiplier

  // 动态计算 addons（从 ADDON_OPTIONS 驱动，避免硬编码）
  let addonsPrice = 0
  const addonsBreakdown: Record<AddonCode, number> = {} as Record<AddonCode, number>

  // 初始化所有 addon 为 0（保证返回结构完整）
  ADDON_OPTIONS.forEach((opt) => {
    addonsBreakdown[opt.code] = 0
  })

  // 计算选中的 addon 价格
  addons.forEach((code) => {
    const addon = ADDON_OPTIONS.find((a) => a.code === code)
    if (addon) {
      let price = 0
      if (addon.pricePerSqm) {
        price = addon.pricePerSqm * size
      } else if (addon.priceFixed) {
        price = addon.priceFixed
      }
      addonsPrice += price
      addonsBreakdown[code] = Math.round(price)
    }
  })

  const subtotal = basePrice + addonsPrice
  const managementFee = subtotal * 0.10
  const totalPrice = subtotal + managementFee
  const estimatedMonths = 8 + Math.ceil(size / 50)

  return {
    basePrice: Math.round(basePrice),
    addonsPrice: Math.round(addonsPrice),
    managementFee: Math.round(managementFee),
    totalPrice: Math.round(totalPrice),
    currency: 'USD', // 基础货币固定为 USD
    disclaimer: DISCLAIMER,
    estimatedCompletionMonths: estimatedMonths,
    breakdown: {
      structure: Math.round(basePrice * 0.35),
      finishing: Math.round(basePrice * 0.30),
      furniture: Math.round(basePrice * 0.20),
      addons: addonsBreakdown,
      management: Math.round(managementFee),
    },
  }
}

/**
 * 计算 ROI（基于 USD 报价）
 */
export function calculateROI(quoteUSD: QuoteResult): ROIResult {
  // 确保传入的是 USD 报价
  if (quoteUSD.currency !== 'USD') {
    console.warn('[calculateROI] 预期 USD 报价，实际为', quoteUSD.currency)
  }

  const occupancyRate = 0.75
  const managementFeeRate = 0.15
  const taxRate = 0.10

  const dailyRate = quoteUSD.totalPrice * 0.0018
  const annualRevenue = dailyRate * 365 * occupancyRate
  const annualCost = annualRevenue * (managementFeeRate + taxRate)
  const netIncome = annualRevenue - annualCost
  const grossYield = (annualRevenue / quoteUSD.totalPrice) * 100
  const netYield = (netIncome / quoteUSD.totalPrice) * 100
  const paybackYears = netIncome > 0 ? quoteUSD.totalPrice / netIncome : 0

  return {
    estimatedDailyRent: Math.round(dailyRate),
    estimatedMonthlyRent: Math.round(annualRevenue / 12),
    estimatedYearlyRent: Math.round(annualRevenue),
    grossYield: Math.round(grossYield * 10) / 10,
    netYield: Math.round(netYield * 10) / 10,
    paybackYears: Math.round(paybackYears * 10) / 10,
    currency: 'USD', // ROI 以 USD 为基准
  }
}

// ============================================================
// 4. 步骤配置
// ============================================================

export const STEP_ORDER: ConfigStep[] = [
  'welcome',
  'select_style',
  'select_size',
  'select_tier',
  'select_addons',
  'review_quote',
  'submit_lead',
  'complete',
]

const STEP_VALIDATION: Partial<Record<ConfigStep, (state: ConfiguratorState) => boolean>> = {
  select_style: (s) => s.style !== null,
  select_size: (s) => s.size !== null,
  select_tier: (s) => s.tier !== null,
  submit_lead: (s) => {
    const info = s.userInfo
    return !!(
      info &&
      info.name.trim().length > 0 &&
      info.email.trim().length > 0 &&
      info.phone.trim().length > 0
    )
  },
}

// ============================================================
// 5. Zustand Store 定义
// ============================================================

interface ConfiguratorState {
  // ----- 用户配置 -----
  style: VillaStyle | null
  size: AreaSize | null
  tier: TierLevel | null
  addons: AddonCode[]

  // ----- 用户信息 -----
  userInfo: UserInfo | null

  // ----- 计算结果（始终以 USD 存储）-----
  quote: QuoteResult | null
  roi: ROIResult | null

  // ----- UI 状态 -----
  currentStep: ConfigStep
  isSubmitting: boolean
  isComplete: boolean
  currency: Currency
  disclaimer: string
  errors: Record<string, string>

  // ----- Actions -----
  setStyle: (style: VillaStyle) => void
  setSize: (size: AreaSize) => void
  setTier: (tier: TierLevel) => void
  toggleAddon: (addon: AddonCode) => void
  setUserInfo: (info: UserInfo) => void
  setCurrency: (currency: Currency) => void

  // ----- 导航 -----
  goToStep: (step: ConfigStep) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void

  // ----- 算价引擎 -----
  recalculateQuote: () => void

  // ----- 提交控制 -----
  setSubmitting: (loading: boolean) => void
  complete: () => void
  setError: (field: string, message: string) => void
  clearErrors: () => void
}

export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set, get) => ({
      // ----- 初始状态 -----
      style: null,
      size: null,
      tier: null,
      addons: [],
      userInfo: null,
      quote: null,
      roi: null,
      currentStep: 'welcome',
      isSubmitting: false,
      isComplete: false,
      currency: 'USD',
      disclaimer: DISCLAIMER,
      errors: {},

      // ----- 配置 Actions -----
      setStyle: (style) => {
        set({ style })
        get().recalculateQuote()
      },

      setSize: (size) => {
        set({ size })
        get().recalculateQuote()
      },

      setTier: (tier) => {
        set({ tier })
        get().recalculateQuote()
      },

      toggleAddon: (addon) => {
        const { addons } = get()
        const newAddons = addons.includes(addon)
          ? addons.filter((a) => a !== addon)
          : [...addons, addon]
        set({ addons: newAddons })
        get().recalculateQuote()
      },

      setUserInfo: (info) => {
        set({ userInfo: info })
        // 清除相关错误
        const { errors } = get()
        const newErrors = { ...errors }
        delete newErrors.name
        delete newErrors.email
        delete newErrors.phone
        set({ errors: newErrors })
      },

      setCurrency: (currency) => {
        set({ currency })
        // quote 本身不重算，但展示层 useQuote 会响应 currency 变化
      },

      // ----- 导航 -----
      goToStep: (step) => {
        const state = get()
        const targetIndex = STEP_ORDER.indexOf(step)
        for (let i = 0; i < targetIndex; i++) {
          const prevStep = STEP_ORDER[i]
          const validator = STEP_VALIDATION[prevStep]
          if (validator && !validator(state)) {
            set({ errors: { ...state.errors, [prevStep]: '请先完成此步骤' } })
            return
          }
        }
        set({ currentStep: step, errors: {} })
      },

      nextStep: () => {
        const state = get()
        const currentIndex = STEP_ORDER.indexOf(state.currentStep)
        const validator = STEP_VALIDATION[state.currentStep]
        if (validator && !validator(state)) {
          set({ errors: { ...state.errors, [state.currentStep]: '请完成当前步骤' } })
          return
        }
        if (currentIndex >= STEP_ORDER.length - 1) return
        set({ currentStep: STEP_ORDER[currentIndex + 1], errors: {} })
      },

      prevStep: () => {
        const state = get()
        const currentIndex = STEP_ORDER.indexOf(state.currentStep)
        if (currentIndex <= 0) return
        set({ currentStep: STEP_ORDER[currentIndex - 1], errors: {} })
      },

      reset: () => {
        set({
          style: null,
          size: null,
          tier: null,
          addons: [],
          userInfo: null,
          quote: null,
          roi: null,
          currentStep: 'welcome',
          isSubmitting: false,
          isComplete: false,
          errors: {},
        })
      },

      // ----- 算价引擎 -----
      recalculateQuote: () => {
        const { style, size, tier, addons } = get()
        if (!style || !size || !tier) {
          set({ quote: null, roi: null })
          return
        }
        const quote = calculateQuote({ style, size, tier, addons })
        const roi = calculateROI(quote)
        set({ quote, roi })
      },

      // ----- 提交控制 -----
      setSubmitting: (isSubmitting) => set({ isSubmitting }),
      complete: () => set({ isComplete: true, currentStep: 'complete' }),
      setError: (field, message) => {
        const { errors } = get()
        set({ errors: { ...errors, [field]: message } })
      },
      clearErrors: () => set({ errors: {} }),
    }),
    {
      name: 'nusantara-configurator-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        style: state.style,
        size: state.size,
        tier: state.tier,
        addons: state.addons,
        userInfo: state.userInfo,
        currency: state.currency,
        currentStep: state.currentStep,
        isComplete: state.isComplete,
        // 注意: quote 和 roi 不持久化，每次重新计算
      }),
    }
  )
)

// ============================================================
// 6. 高性能 Selector Hooks
// ============================================================

/**
 * 仅供 3D Canvas 组件使用
 * 只订阅配置选项，避免其他 UI 状态变化触发 3D 重绘
 */
export const useConfigSelection = () => {
  return useConfiguratorStore((s) => ({
    style: s.style,
    size: s.size,
    tier: s.tier,
    addons: s.addons,
  }))
}

/**
 * 供报价展示卡片使用
 * 自动处理 USD ↔ IDR 转换，返回展示用的格式化价格
 */
export const useQuote = () => {
  const quoteUSD = useConfiguratorStore((s) => s.quote)
  const roiUSD = useConfiguratorStore((s) => s.roi)
  const currency = useConfiguratorStore((s) => s.currency)
  const disclaimer = useConfiguratorStore((s) => s.disclaimer)

  if (!quoteUSD) {
    return {
      quote: null,
      roi: null,
      currency,
      disclaimer,
      displayPrice: '$0',
      displayPriceIDR: 'Rp 0',
    }
  }

  const isIDR = currency === 'IDR'
  const totalPrice = isIDR ? convertPrice(quoteUSD.totalPrice, 'USD', 'IDR') : quoteUSD.totalPrice
  const symbol = isIDR ? 'Rp ' : '$'
  const locale = isIDR ? 'id-ID' : 'en-US'

  // 同时提供两种货币的展示（方便切换）
  const displayPrice = `${symbol}${totalPrice.toLocaleString(locale)}`
  const displayPriceIDR = `Rp ${convertPrice(quoteUSD.totalPrice, 'USD', 'IDR').toLocaleString('id-ID')}`

  // 如果当前是 IDR，ROI 也需要转换
  let roi = roiUSD
  if (roi && isIDR) {
    roi = {
      ...roi,
      estimatedDailyRent: convertPrice(roi.estimatedDailyRent, 'USD', 'IDR'),
      estimatedMonthlyRent: convertPrice(roi.estimatedMonthlyRent, 'USD', 'IDR'),
      estimatedYearlyRent: convertPrice(roi.estimatedYearlyRent, 'USD', 'IDR'),
      currency: 'IDR',
    }
  }

  return {
    quote: quoteUSD,
    roi,
    currency,
    disclaimer,
    displayPrice,
    displayPriceIDR,
  }
}

/**
 * 供步骤导航组件使用
 * 只订阅导航状态，避免配置变化影响导航展示
 */
export const useConfigNavigation = () => {
  return useConfiguratorStore((s) => ({
    currentStep: s.currentStep,
    isComplete: s.isComplete,
    canGoNext: (() => {
      const validator = STEP_VALIDATION[s.currentStep]
      return validator ? validator(s) : true
    })(),
    canGoPrev: STEP_ORDER.indexOf(s.currentStep) > 0,
    progress: (() => {
      const total = STEP_ORDER.length - 1
      const current = STEP_ORDER.indexOf(s.currentStep)
      return Math.round((current / total) * 100)
    })(),
  }))
}

/**
 * 供表单组件使用
 * 只订阅用户信息和错误状态
 */
export const useUserInfo = () => {
  return useConfiguratorStore((s) => ({
    userInfo: s.userInfo,
    errors: s.errors,
    setUserInfo: s.setUserInfo,
    clearErrors: s.clearErrors,
  }))
}

/**
 * 供提交按钮使用
 * 只订阅提交状态和完整度
 */
export const useSubmission = () => {
  return useConfiguratorStore((s) => ({
    isSubmitting: s.isSubmitting,
    isComplete: s.isComplete,
    isConfigReady: !!(
      s.style &&
      s.size &&
      s.tier &&
      s.quote &&
      s.userInfo &&
      s.userInfo.name.trim().length > 0 &&
      s.userInfo.email.trim().length > 0 &&
      s.userInfo.phone.trim().length > 0
    ),
    setSubmitting: s.setSubmitting,
    complete: s.complete,
  }))
}
