// ============================================================
// Nusantara Villa - 配置状态管理与算价引擎 (Zustand Store)
// ============================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

// ============================================================
// 1. 类型定义
// ============================================================

export type VillaStyle = 'modern_tropical' | 'wabi_sabi' | 'mediterranean'
export type AreaSize = 150 | 200 | 300
export type TierLevel = 'standard' | 'luxury' | 'ultra_luxury'
export type AddonCode = 'pool' | 'rooftop' | 'spa' | 'smart_home'
export type Currency = 'USD' | 'IDR'

/** 免责声明 */
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
// 2. 预设配置数据
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

const USD_TO_IDR = 15000

// ============================================================
// 3. 算价与转换工具函数
// ============================================================

export interface PricingInput {
  style: VillaStyle
  size: AreaSize
  tier: TierLevel
  addons: AddonCode[]
}

export function convertPrice(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount
  if (from === 'USD' && to === 'IDR') return Math.round(amount * USD_TO_IDR)
  if (from === 'IDR' && to === 'USD') return Math.round(amount / USD_TO_IDR)
  return amount
}

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

  let addonsPrice = 0
  const addonsBreakdown = {} as Record<AddonCode, number>

  ADDON_OPTIONS.forEach((opt) => {
    addonsBreakdown[opt.code] = 0
  })

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
    currency: 'USD',
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

export function calculateROI(quoteUSD: QuoteResult): ROIResult {
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
    currency: 'USD',
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
  style: VillaStyle | null
  size: AreaSize | null
  tier: TierLevel | null
  addons: AddonCode[]
  userInfo: UserInfo | null
  quote: QuoteResult | null
  roi: ROIResult | null
  currentStep: ConfigStep
  isSubmitting: boolean
  isComplete: boolean
  currency: Currency
  disclaimer: string
  errors: Record<string, string>
  whatsappLink: string | null

  setStyle: (style: VillaStyle) => void
  setSize: (size: AreaSize) => void
  setTier: (tier: TierLevel) => void
  toggleAddon: (addon: AddonCode) => void
  clearAddons: () => void
  setUserInfo: (info: UserInfo) => void
  setCurrency: (currency: Currency) => void

  goToStep: (step: ConfigStep) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void

  recalculateQuote: () => void

  setSubmitting: (loading: boolean) => void
  complete: () => void
  setError: (field: string, message: string) => void
  clearErrors: () => void
  setWhatsappLink: (url: string | null) => void
}

export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set, get) => ({
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
      whatsappLink: null,

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

      clearAddons: () => {
        const { addons } = get()
        if (addons.length === 0) return
        set({ addons: [] })
        get().recalculateQuote()
      },

      setUserInfo: (info) => {
        set({ userInfo: info })
        const { errors } = get()
        const newErrors = { ...errors }
        delete newErrors.name
        delete newErrors.email
        delete newErrors.phone
        set({ errors: newErrors })
      },

      setCurrency: (currency) => {
        set({ currency })
      },

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
          whatsappLink: null,
          errors: {},
        })
      },

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

      setSubmitting: (isSubmitting) => set({ isSubmitting }),
      complete: () => set({ isComplete: true, currentStep: 'complete' }),
      setWhatsappLink: (whatsappLink) => set({ whatsappLink }),
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
      }),
    }
  )
)

// ============================================================
// 6. 高性能 Selector Hooks (全量包含 useShallow 防止死循环)
// ============================================================

/**
 * 仅供 3D Canvas 组件使用（采用 useShallow 避免 3D 画布频繁重绘）
 */
export const useConfigSelection = () => {
  return useConfiguratorStore(
    useShallow((s) => ({
      style: s.style,
      size: s.size,
      tier: s.tier,
      addons: s.addons,
    }))
  )
}

/**
 * 供报价展示卡片使用
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

  // 使用显式字符串拼接代替 locale Formatting，避免 SSR/CSR Mismatch
  const displayPrice = `${symbol}${totalPrice.toLocaleString('en-US')}`
  const displayPriceIDR = `Rp ${convertPrice(quoteUSD.totalPrice, 'USD', 'IDR').toLocaleString('en-US')}`

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
 */
export const useConfigNavigation = () => {
  return useConfiguratorStore(
    useShallow((s) => {
      const validator = STEP_VALIDATION[s.currentStep]
      const total = STEP_ORDER.length - 1
      const current = STEP_ORDER.indexOf(s.currentStep)

      return {
        currentStep: s.currentStep,
        isComplete: s.isComplete,
        canGoNext: validator ? validator(s) : true,
        canGoPrev: current > 0,
        progress: Math.round((current / total) * 100),
      }
    })
  )
}

/**
 * 供表单组件使用
 */
export const useUserInfo = () => {
  return useConfiguratorStore(
    useShallow((s) => ({
      userInfo: s.userInfo,
      errors: s.errors,
      setUserInfo: s.setUserInfo,
      clearErrors: s.clearErrors,
    }))
  )
}

/**
 * 供提交按钮使用
 */
export const useSubmission = () => {
  return useConfiguratorStore(
    useShallow((s) => ({
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
  )
}
