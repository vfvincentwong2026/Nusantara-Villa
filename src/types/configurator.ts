// ============================================================
// Nusantara-Villa 配置器类型定义
// 3D 配置与报价流程的状态机类型
// ============================================================

// ============================================================
// 1. 核心枚举类型
// ============================================================

/** 别墅风格 */
export type VillaStyle = 'modern_tropical' | 'wabi_sabi' | 'mediterranean'

/** 面积档位 */
export type AreaSize = 150 | 200 | 300

/** 装修档次 */
export type TierLevel = 'standard' | 'luxury' | 'ultra_luxury'

/** 增值模块 */
export type AddonCode = 'pool' | 'rooftop' | 'spa' | 'smart_home'

/** 配置步骤 */
export type ConfigStep = 
  | 'welcome'           // 欢迎页
  | 'select_style'      // 选择风格
  | 'select_size'       // 选择面积
  | 'select_tier'       // 选择档次
  | 'select_addons'     // 选择增值模块
  | 'review_quote'      // 查看报价
  | 'submit_lead'       // 提交意向
  | 'complete'          // 完成

// ============================================================
// 2. 配置状态接口
// ============================================================

/** 用户配置状态 */
export interface ConfigState {
  // 配置选项
  style: VillaStyle | null
  size: AreaSize | null
  tier: TierLevel | null
  addons: AddonCode[]
  
  // 用户信息
  userInfo: UserInfo | null
  
  // 计算结果
  quote: QuoteResult | null
  roi: ROIResult | null
  
  // 状态控制
  currentStep: ConfigStep
  isSubmitting: boolean
  isComplete: boolean
  errors: Record<string, string>
}

/** 用户信息 */
export interface UserInfo {
  name: string
  email: string
  phone: string
  message?: string
}

/** 报价结果 */
export interface QuoteResult {
  basePrice: number
  addonsPrice: number
  managementFee: number
  totalPrice: number
  currency: 'USD'
  breakdown: QuoteBreakdown
  estimatedCompletionMonths: number
}

/** 报价明细 */
export interface QuoteBreakdown {
  structure: number      // 结构工程
  finishing: number      // 装修工程
  furniture: number      // 家具软装
  addons: Record<AddonCode, number>  // 各增值模块价格
  management: number     // 管理费
}

/** ROI 计算结果 */
export interface ROIResult {
  estimatedDailyRent: number
  estimatedMonthlyRent: number
  estimatedYearlyRent: number
  grossYield: number
  netYield: number
  paybackYears: number
  currency: 'USD'
}

// ============================================================
// 3. 预设配置数据
// ============================================================

/** 风格预设 */
export interface StylePreset {
  id: VillaStyle
  name: string
  nameId: string
  description: string
  emoji: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  materials: string[]
  furnitureSet: string
  previewModel: string
  previewImage: string
  tags: string[]
}

/** 面积选项 */
export interface SizeOption {
  value: AreaSize
  label: string
  multiplier: number
  description: string
}

/** 档次选项 */
export interface TierOption {
  value: TierLevel
  label: string
  labelId: string
  multiplier: number
  description: string
  features: string[]
  emoji: string
}

/** 增值模块选项 */
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

// ============================================================
// 4. 状态机动作
// ============================================================

/** 可用的配置动作 */
export type ConfigAction = 
  | { type: 'SET_STYLE'; payload: VillaStyle }
  | { type: 'SET_SIZE'; payload: AreaSize }
  | { type: 'SET_TIER'; payload: TierLevel }
  | { type: 'TOGGLE_ADDON'; payload: AddonCode }
  | { type: 'SET_USER_INFO'; payload: UserInfo }
  | { type: 'GO_TO_STEP'; payload: ConfigStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET_CONFIG' }
  | { type: 'SET_QUOTE'; payload: QuoteResult }
  | { type: 'SET_ROI'; payload: ROIResult }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'COMPLETE' }
