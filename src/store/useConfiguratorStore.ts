// ============================================================
// Nusantara Villa - 配置状态管理与算价引擎
// 技术规范：
//   1. 细粒度 Selector，避免 3D Canvas 不必要重绘
//   2. 包含免责声明 (Baseline Estimate; Final BOQ Subject to Site Visit)
//   3. 支持 USD / IDR 动态切换
//   4. 纯客户端 Zustand Store (配合 next/dynamic 使用)
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// 1. 类型定义
// ============================================================

export type VillaStyle = 'modern_tropical' | 'wabi_sabi' | 'mediterranean'
export type AreaSize = 150 | 200 | 300
export type TierLevel = 'standard' | 'luxury' | 'ultra_luxury'
export type AddonCode = 'pool' | 'rooftop' | 'spa' | 'smart_home'
export type Currency = 'USD' | 'IDR'

/** 免责声明（固定文案，符合规范要求） */
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
// 2. Store 状态接口
// ============================================================

interface ConfiguratorState {
  // ----- 用户配置 -----
  style: VillaStyle | null
  size: AreaSize | null
  tier: TierLevel | null
  addons: AddonCode[]

  // ----- 用户信息 -----
  userInfo: UserInfo | null

  // ----- 计算结果 -----
  quote: QuoteResult | null
  roi: ROIResult | null

  // ----- UI 状态 -----
  currentStep: ConfigStep
  isSubmitting: boolean
  isComplete: boolean
  currency: Currency

  // ----- 免责声明（固定值）-----
  disclaimer: string

  // ----- 错误状态 -----
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

  // ----- 计算引擎 -----
  recalculateQuote: () => void

  // ----- 提交控制 -----
  setSubmitting: (loading: boolean) => void
  complete: () => void
  setError: (field: string, message: string) => void
  clearErrors: () => void

  // ----- 细粒度 Selector 辅助（计算属性）-----
  get selectedStyleData: StylePreset | null
  get selectedSizeData: SizeOption | null
  get selectedTierData: TierOption | null
  get selectedAddonsData: AddonOption[]
  get canGoNext: boolean
  get canGoPrev: boolean
  get progress: number
  get stepLabel: string
  get stepDescription: string
  get isConfigComplete: boolean
  get displayPrice: string
  get displayPriceIDR: string
}

// ============================================================
// 3. 预设配置数据（价格基准）
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

// ----- 预设数据 -----
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
// 4. 算价引擎（纯函数，可测试）
// ============================================================

export interface PricingInput {
  style: VillaStyle
  size: AreaSize
  tier: TierLevel
  addons: AddonCode[]
}

export function calculateQuote(input: PricingInput): Omit<QuoteResult, 'currency' | 'disclaimer'> {
  const { style, size, tier, addons } = input

  // 获取系数
  const sizeMultiplier = SIZE_OPTIONS.find(s => s.value === size)?.multiplier || 1.0
  const tierMultiplier = TIER_OPTIONS.find(t => t.value === tier)?.multiplier || 1.0

  // 基础单价 (USD / m²) — 根据风格微调
  const baseRateMap: Record<VillaStyle, number> = {
    modern_tropical: 2200,
    wabi_sabi: 2400,
    mediterranean: 2100,
  }
  const baseRate = baseRateMap[style] || 2200

  // 基础价 = 单价 × 面积 × 面积系数 × 档次系数
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
      addonsBreakdown[code] = Math.round(price)
    }
  })

  // 管理费（总价的 10%）
  const subtotal = basePrice + addonsPrice
  const managementFee = subtotal * 0.10
  const totalPrice = subtotal + managementFee

  // 施工周期估算（月）
  const estimatedMonths = 8 + Math.ceil(size / 50)

  // 各分项明细（用于展示）
  const breakdown: QuoteBreakdown = {
    structure: Math.round(basePrice * 0.35),
    finishing: Math.round(basePrice * 0.30),
    furniture: Math.round(basePrice * 0.20),
    addons: addonsBreakdown,
    management: Math.round(managementFee),
  }

  return {
    basePrice: Math.round(basePrice),
    addonsPrice: Math.round(addonsPrice),
    managementFee: Math.round(managementFee),
    totalPrice: Math.round(totalPrice),
    breakdown,
    estimatedCompletionMonths: estimatedMonths,
  }
}

export function calculateROI(quote: QuoteResult, location: string = 'bali'): ROIResult {
  // 简化 ROI 模型：基于总价 × 0.2 估算日租金
  // 实际生产中可接入真实租金数据库
  const occupancyRate = 0.75
  const managementFeeRate = 0.15
  const taxRate = 0.10

  // 日租金估算：总价 × 0.18% (高端别墅市场经验值)
  const dailyRate = quote.totalPrice * 0.0018
  const annualRevenue = dailyRate * 365 * occupancyRate
  const annualCost = annualRevenue * (managementFeeRate + taxRate)
  const netIncome = annualRevenue - annualCost
  const grossYield = (annualRevenue / quote.totalPrice) * 100
  const netYield = (netIncome / quote.totalPrice) * 100
  const paybackYears = netIncome > 0 ? quote.totalPrice / netIncome : 0

  return {
    estimatedDailyRent: Math.round(dailyRate),
    estimatedMonthlyRent: Math.round(annualRevenue / 12),
    estimatedYearlyRent: Math.round(annualRevenue),
    grossYield: Math.round(grossYield * 10) / 10,
    netYield: Math.round(netYield * 10) / 10,
    paybackYears: Math.round(paybackYears * 10) / 10,
    currency: quote.currency,
  }
}

export function convertPrice(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount
  if (from === 'USD' && to === 'IDR') return Math.round(amount * USD_TO_IDR)
  if (from === 'IDR' && to === 'USD') return Math.round(amount / USD_TO_IDR)
  return amount
}

// ============================================================
// 5. Zustand Store 实现
// ============================================================

const STEP_ORDER: ConfigStep[] = [
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

const STEP_LABELS: Record<ConfigStep, string> = {
  welcome: '欢迎',
  select_style: '选择风格',
  select_size: '选择面积',
  select_tier: '选择档次',
  select_addons: '增值模块',
  review_quote: '报价预览',
  submit_lead: '提交意向',
  complete: '完成',
}

const STEP_DESCRIPTIONS: Record<ConfigStep, string> = {
  welcome: '开始您的别墅定制之旅',
  select_style: '选择您喜欢的建筑风格',
  select_size: '确定别墅的建筑面积',
  select_tier: '选择装修档次',
  select_addons: '添加您想要的增值模块',
  review_quote: '查看您的专属报价方案',
  submit_lead: '填写信息，提交意向',
  complete: '提交成功！我们的团队将在 24 小时内联系您',
}

// ----- Store 创建 -----
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

      // ----- 配置 Actions（细粒度，避免 3D Canvas 重绘）-----
      setStyle: (style) => {
        set({ style })
        // 自动重新计算报价
        const state = get()
        if (state.size && state.tier) {
          state.recalculateQuote()
        }
      },

      setSize: (size) => {
        set({ size })
        const state = get()
        if (state.style && state.tier) {
          state.recalculateQuote()
        }
      },

      setTier: (tier) => {
        set({ tier })
        const state = get()
        if (state.style && state.size) {
          state.recalculateQuote()
        }
      },

      toggleAddon: (addon) => {
        const { addons } = get()
        const newAddons = addons.includes(addon)
          ? addons.filter((a) => a !== addon)
          : [...addons, addon]
        set({ addons: newAddons })
        // 增值模块变化 → 重新计算报价
        const state = get()
        if (state.style && state.size && state.tier) {
          state.recalculateQuote()
        }
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
        // 重新计算报价（切换货币显示）
        const state = get()
        if (state.quote) {
          state.recalculateQuote()
        }
      },

      // ----- 导航 Actions -----
      goToStep: (step) => {
        const state = get()
        const targetIndex = STEP_ORDER.indexOf(step)
        // 检查前面的步骤是否已完成
        for (let i = 0; i < targetIndex; i++) {
          const prevStep = STEP_ORDER[i]
          const validator = STEP_VALIDATION[prevStep]
          if (validator && !validator(state)) {
            set({
              errors: { ...state.errors, [prevStep]: '请先完成此步骤' },
            })
            return
          }
        }
        set({ currentStep: step, errors: {} })
      },

      nextStep: () => {
        const state = get()
        const currentIndex = STEP_ORDER.indexOf(state.currentStep)

        // 验证当前步骤
        const validator = STEP_VALIDATION[state.currentStep]
        if (validator && !validator(state)) {
          set({
            errors: { ...state.errors, [state.currentStep]: '请完成当前步骤' },
          })
          return
        }

        if (currentIndex >= STEP_ORDER.length - 1) return
        const nextStep = STEP_ORDER[currentIndex + 1]
        set({ currentStep: nextStep, errors: {} })
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

      // ----- 算价引擎（核心）-----
      recalculateQuote: () => {
        const state = get()
        const { style, size, tier, addons, currency } = state

        if (!style || !size || !tier) {
          set({ quote: null, roi: null })
          return
        }

        // 计算报价（USD 基准）
        const quoteUSD = calculateQuote({ style, size, tier, addons })
        const quote: QuoteResult = {
          ...quoteUSD,
          currency,
          disclaimer: DISCLAIMER,
        }

        // 如果当前货币是 IDR，转换价格
        if (currency === 'IDR') {
          quote.basePrice = convertPrice(quote.basePrice, 'USD', 'IDR')
          quote.addonsPrice = convertPrice(quote.addonsPrice, 'USD', 'IDR')
          quote.managementFee = convertPrice(quote.managementFee, 'USD', 'IDR')
          quote.totalPrice = convertPrice(quote.totalPrice, 'USD', 'IDR')
          quote.breakdown.structure = convertPrice(quote.breakdown.structure, 'USD', 'IDR')
          quote.breakdown.finishing = convertPrice(quote.breakdown.finishing, 'USD', 'IDR')
          quote.breakdown.furniture = convertPrice(quote.breakdown.furniture, 'USD', 'IDR')
          quote.breakdown.management = convertPrice(quote.breakdown.management, 'USD', 'IDR')
          // 转换 addons
          const convertedAddons: Record<AddonCode, number> = {} as Record<AddonCode, number>
          for (const [key, val] of Object.entries(quote.breakdown.addons)) {
            convertedAddons[key as AddonCode] = convertPrice(val, 'USD', 'IDR')
          }
          quote.breakdown.addons = convertedAddons
        }

        // 计算 ROI（基于 USD 总价，因为租金数据以 USD 为基准）
        const roiBase = calculateROI(quoteUSD, 'bali')
        const roi: ROIResult = {
          ...roiBase,
          currency,
        }
        if (currency === 'IDR') {
          roi.estimatedDailyRent = convertPrice(roi.estimatedDailyRent, 'USD', 'IDR')
          roi.estimatedMonthlyRent = convertPrice(roi.estimatedMonthlyRent, 'USD', 'IDR')
          roi.estimatedYearlyRent = convertPrice(roi.estimatedYearlyRent, 'USD', 'IDR')
        }

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

      // ============================================================
      // 6. 细粒度 Selector 辅助（计算属性）
      // 用于组件中精确获取所需数据，避免 3D Canvas 重绘
      // ============================================================

      get selectedStyleData() {
        const state = get()
        return STYLE_PRESETS.find((s) => s.id === state.style) || null
      },

      get selectedSizeData() {
        const state = get()
        return SIZE_OPTIONS.find((s) => s.value === state.size) || null
      },

      get selectedTierData() {
        const state = get()
        return TIER_OPTIONS.find((t) => t.value === state.tier) || null
      },

      get selectedAddonsData() {
        const state = get()
        return ADDON_OPTIONS.filter((a) => state.addons.includes(a.code))
      },

      get canGoNext() {
        const state = get()
        const validator = STEP_VALIDATION[state.currentStep]
        return validator ? validator(state) : true
      },

      get canGoPrev() {
        const state = get()
        return STEP_ORDER.indexOf(state.currentStep) > 0
      },

      get progress() {
        const state = get()
        const total = STEP_ORDER.length - 1
        const current = STEP_ORDER.indexOf(state.currentStep)
        return Math.round((current / total) * 100)
      },

      get stepLabel() {
        const state = get()
        return STEP_LABELS[state.currentStep] || ''
      },

      get stepDescription() {
        const state = get()
        return STEP_DESCRIPTIONS[state.currentStep] || ''
      },

      get isConfigComplete() {
        const state = get()
        return !!(
          state.style &&
          state.size &&
          state.tier &&
          state.quote &&
          state.userInfo &&
          state.userInfo.name.trim().length > 0 &&
          state.userInfo.email.trim().length > 0 &&
          state.userInfo.phone.trim().length > 0
        )
      },

      get displayPrice() {
        const state = get()
        if (!state.quote) return '$0'
        const symbol = state.currency === 'USD' ? '$' : 'Rp'
        const amount = state.quote.totalPrice
        if (state.currency === 'IDR') {
          return `${symbol} ${amount.toLocaleString('id-ID')}`
        }
        return `${symbol}${amount.toLocaleString()}`
      },

      get displayPriceIDR() {
        const state = get()
        if (!state.quote) return 'Rp0'
        const amount = convertPrice(state.quote.totalPrice, 'USD', 'IDR')
        return `Rp ${amount.toLocaleString('id-ID')}`
      },
    }),
    {
      name: 'nusantara-configurator-storage',
      partialize: (state) => ({
        style: state.style,
        size: state.size,
        tier: state.tier,
        addons: state.addons,
        userInfo: state.userInfo,
        quote: state.quote,
        roi: state.roi,
        currentStep: state.currentStep,
        isComplete: state.isComplete,
        currency: state.currency,
      }),
    }
  )
)

// ============================================================
// 7. 细粒度 Selector Hooks（用于组件中精确订阅）
// ============================================================

/** 仅订阅配置选项（用于 3D Canvas 组件，避免重绘） */
export const useConfigSelection = () => {
  return useConfiguratorStore((state) => ({
    style: state.style,
    size: state.size,
    tier: state.tier,
    addons: state.addons,
  }))
}

/** 仅订阅报价结果（用于报价展示组件） */
export const useQuote = () => {
  return useConfiguratorStore((state) => ({
    quote: state.quote,
    roi: state.roi,
    currency: state.currency,
    disclaimer: state.disclaimer,
    displayPrice: state.displayPrice,
  }))
}

/** 仅订阅导航状态（用于步骤指示器） */
export const useConfigNavigation = () => {
  return useConfiguratorStore((state) => ({
    currentStep: state.currentStep,
    progress: state.progress,
    stepLabel: state.stepLabel,
    stepDescription: state.stepDescription,
    canGoNext: state.canGoNext,
    canGoPrev: state.canGoPrev,
    isComplete: state.isComplete,
  }))
}

/** 仅订阅用户信息（用于表单组件） */
export const useUserInfo = () => {
  return useConfiguratorStore((state) => ({
    userInfo: state.userInfo,
    setUserInfo: state.setUserInfo,
    errors: state.errors,
    clearErrors: state.clearErrors,
  }))
}
