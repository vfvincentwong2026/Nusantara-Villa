// ============================================================
// Nusantara-Villa 预设配置数据
// ============================================================

import {
  StylePreset,
  SizeOption,
  TierOption,
  AddonOption,
} from '@/types/configurator'

// ============================================================
// 1. 风格预设
// ============================================================

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'modern_tropical',
    name: '现代热带',
    nameId: 'modern_tropical',
    description: '自然材质与开放空间融合，热带风情与现代简约的完美结合',
    emoji: '🌴',
    colors: {
      primary: '#8B7D6B',
      secondary: '#D4C5A9',
      accent: '#2F5D3A',
    },
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
    colors: {
      primary: '#C4B5A0',
      secondary: '#E8DDD0',
      accent: '#5C4B3A',
    },
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
    colors: {
      primary: '#FFFFFF',
      secondary: '#4A90D9',
      accent: '#E8C87A',
    },
    materials: ['石灰', '陶瓷', '锻铁', '马赛克'],
    furnitureSet: 'mediterranean',
    previewModel: '/models/mediterranean.glb',
    previewImage: '/images/styles/mediterranean.jpg',
    tags: ['浪漫', '明亮', '度假'],
  },
]

// ============================================================
// 2. 面积选项
// ============================================================

export const SIZE_OPTIONS: SizeOption[] = [
  {
    value: 150,
    label: '150 m²',
    multiplier: 1.0,
    description: '紧凑型别墅，适合小家庭或度假投资',
  },
  {
    value: 200,
    label: '200 m²',
    multiplier: 1.15,
    description: '标准型别墅，三至四居室，适合家庭居住',
  },
  {
    value: 300,
    label: '300 m²',
    multiplier: 1.35,
    description: '豪华型别墅，五居室以上，适合高端业主',
  },
]

// ============================================================
// 3. 档次选项
// ============================================================

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

// ============================================================
// 4. 增值模块选项
// ============================================================

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
