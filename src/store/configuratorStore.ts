// ============================================================
// Nusantara-Villa 配置器状态管理 (Zustand)
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  ConfigState, 
  ConfigAction, 
  ConfigStep,
  VillaStyle,
  AreaSize,
  TierLevel,
  AddonCode,
  UserInfo,
  QuoteResult,
  ROIResult,
} from '@/types/configurator'

// ============================================================
// 1. 初始状态
// ============================================================

const initialState: ConfigState = {
  // 配置选项
  style: null,
  size: null,
  tier: null,
  addons: [],
  
  // 用户信息
  userInfo: null,
  
  // 计算结果
  quote: null,
  roi: null,
  
  // 状态控制
  currentStep: 'welcome',
  isSubmitting: false,
  isComplete: false,
  errors: {},
}

// ============================================================
// 2. 步骤顺序定义
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

// ============================================================
// 3. 步骤验证规则
// ============================================================

const STEP_VALIDATION: Record<ConfigStep, (state: ConfigState) => boolean> = {
  'welcome': () => true,
  'select_style': (state) => state.style !== null,
  'select_size': (state) => state.size !== null,
  'select_tier': (state) => state.tier !== null,
  'select_addons': () => true, // 增值模块可选
  'review_quote': (state) => state.quote !== null,
  'submit_lead': (state) => {
    const info = state.userInfo
    return info !== null && 
           info.name.trim().length > 0 && 
           info.email.trim().length > 0 && 
           info.phone.trim().length > 0
  },
  'complete': () => true,
}

// ============================================================
// 4. Store 实现
// ============================================================

interface ConfiguratorStore extends ConfigState {
  // 动作方法
  setStyle: (style: VillaStyle) => void
  setSize: (size: AreaSize) => void
  setTier: (tier: TierLevel) => void
  toggleAddon: (addon: AddonCode) => void
  setUserInfo: (info: UserInfo) => void
  
  // 导航方法
  goToStep: (step: ConfigStep) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
  
  // 数据设置
  setQuote: (quote: QuoteResult) => void
  setROI: (roi: ROIResult) => void
  
  // 状态控制
  setSubmitting: (isSubmitting: boolean) => void
  setError: (field: string, message: string) => void
  clearErrors: () => void
  complete: () => void
  
  // 计算属性（getter）
  get canGoNext: boolean
  get canGoPrev: boolean
  get currentStepIndex: number
  get isComplete: boolean
  get progress: number
  get stepLabel: string
  get stepDescription: string
}

// ============================================================
// 5. Store 创建
// ============================================================

export const useConfiguratorStore = create<ConfiguratorStore>()(
  persist(
    (set, get) => ({
      // ---------- 初始状态 ----------
      ...initialState,

      // ---------- 配置动作 ----------
      setStyle: (style) => {
        set({ style })
        // 自动重新计算报价（如果其他条件已满足）
        const state = get()
        if (state.size && state.tier) {
          // 触发报价重新计算（由外部 useEffect 监听）
        }
      },

      setSize: (size) => {
        set({ size })
        const state = get()
        if (state.style && state.tier) {
          // 触发报价重新计算
        }
      },

      setTier: (tier) => {
        set({ tier })
        const state = get()
        if (state.style && state.size) {
          // 触发报价重新计算
        }
      },

      toggleAddon: (addon) => {
        const { addons } = get()
        const newAddons = addons.includes(addon)
          ? addons.filter(a => a !== addon)
          : [...addons, addon]
        set({ addons: newAddons })
        // 触发报价重新计算
      },

      setUserInfo: (info) => {
        set({ userInfo: info })
        // 清除该字段的错误
        const { errors } = get()
        const newErrors = { ...errors }
        delete newErrors['name']
        delete newErrors['email']
        delete newErrors['phone']
        set({ errors: newErrors })
      },

      // ---------- 导航方法 ----------
      goToStep: (step) => {
        const state = get()
        // 检查目标步骤是否可访问（前面的步骤必须已验证）
        const targetIndex = STEP_ORDER.indexOf(step)
        for (let i = 0; i < targetIndex; i++) {
          const prevStep = STEP_ORDER[i]
          const isValid = STEP_VALIDATION[prevStep]?.(state) ?? true
          if (!isValid) {
            set({ errors: { ...state.errors, [prevStep]: '请先完成此步骤' } })
            return
          }
        }
        set({ currentStep: step, errors: {} })
      },

      nextStep: () => {
        const state = get()
        const currentIndex = STEP_ORDER.indexOf(state.currentStep)
        
        // 验证当前步骤
        const isValid = STEP_VALIDATION[state.currentStep]?.(state) ?? true
        if (!isValid) {
          set({ errors: { ...state.errors, [state.currentStep]: '请完成当前步骤' } })
          return
        }
        
        // 检查是否最后一步
        if (currentIndex >= STEP_ORDER.length - 1) {
          return
        }
        
        const nextStep = STEP_ORDER[currentIndex + 1]
        set({ currentStep: nextStep, errors: {} })
      },

      prevStep: () => {
        const state = get()
        const currentIndex = STEP_ORDER.indexOf(state.currentStep)
        if (currentIndex <= 0) return
        const prevStep = STEP_ORDER[currentIndex - 1]
        set({ currentStep: prevStep, errors: {} })
      },

      reset: () => {
        set(initialState)
      },

      // ---------- 数据设置 ----------
      setQuote: (quote) => {
        set({ quote })
      },

      setROI: (roi) => {
        set({ roi })
      },

      // ---------- 状态控制 ----------
      setSubmitting: (isSubmitting) => {
        set({ isSubmitting })
      },

      setError: (field, message) => {
        const { errors } = get()
        set({ errors: { ...errors, [field]: message } })
      },

      clearErrors: () => {
        set({ errors: {} })
      },

      complete: () => {
        set({ isComplete: true, currentStep: 'complete' })
      },

      // ---------- 计算属性 ----------
      get canGoNext() {
        const state = get()
        return STEP_VALIDATION[state.currentStep]?.(state) ?? true
      },

      get canGoPrev() {
        const state = get()
        return STEP_ORDER.indexOf(state.currentStep) > 0
      },

      get currentStepIndex() {
        const state = get()
        return STEP_ORDER.indexOf(state.currentStep)
      },

      get isComplete() {
        const state = get()
        return state.isComplete
      },

      get progress() {
        const state = get()
        const total = STEP_ORDER.length - 1
        const current = STEP_ORDER.indexOf(state.currentStep)
        return Math.round((current / total) * 100)
      },

      get stepLabel() {
        const state = get()
        const labels: Record<ConfigStep, string> = {
          'welcome': '欢迎',
          'select_style': '选择风格',
          'select_size': '选择面积',
          'select_tier': '选择档次',
          'select_addons': '增值模块',
          'review_quote': '报价预览',
          'submit_lead': '提交意向',
          'complete': '完成',
        }
        return labels[state.currentStep] || ''
      },

      get stepDescription() {
        const state = get()
        const descriptions: Record<ConfigStep, string> = {
          'welcome': '开始您的别墅定制之旅',
          'select_style': '选择您喜欢的建筑风格',
          'select_size': '确定别墅的建筑面积',
          'select_tier': '选择装修档次',
          'select_addons': '添加您想要的增值模块',
          'review_quote': '查看您的专属报价方案',
          'submit_lead': '填写信息，提交意向',
          'complete': '提交成功！',
        }
        return descriptions[state.currentStep] || ''
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
      }),
    }
  )
)

// ============================================================
// 6. 辅助 Hook
// ============================================================

/**
 * 检查配置是否完整（可用于提交）
 */
export function useIsConfigComplete(): boolean {
  const state = useConfiguratorStore()
  return (
    state.style !== null &&
    state.size !== null &&
    state.tier !== null &&
    state.quote !== null &&
    state.userInfo !== null &&
    state.userInfo.name.trim().length > 0 &&
    state.userInfo.email.trim().length > 0 &&
    state.userInfo.phone.trim().length > 0
  )
}

/**
 * 获取当前配置摘要（用于展示）
 */
export function useConfigSummary() {
  const state = useConfiguratorStore()
  return {
    style: state.style,
    size: state.size,
    tier: state.tier,
    addons: state.addons,
    totalPrice: state.quote?.totalPrice || 0,
    hasAllRequired: (
      state.style !== null &&
      state.size !== null &&
      state.tier !== null
    ),
  }
}
