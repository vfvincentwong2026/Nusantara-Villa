# ⚙️ Nusantara-Villa 配置与定制指南


## 1. 3D 场景配置

### 1.1 别墅风格预设

配置文件位置：`src/config/styles.ts`

```typescript
export const STYLES = {
  modern_tropical: {
    id: 'modern_tropical',
    name: 'Modern Tropical',
    description: '现代热带风，自然材质与开放空间',
    colors: { primary: '#8B7D6B', secondary: '#D4C5A9', accent: '#2F5D3A' },
    materials: ['木材', '石材', '玻璃'],
    furniture_set: 'tropical',
    preview_model: '/models/tropical.glb',
  },
  wabi_sabi: {
    id: 'wabi_sabi',
    name: 'Wabi-Sabi',
    description: '侘寂风，质朴与残缺美',
    colors: { primary: '#C4B5A0', secondary: '#E8DDD0', accent: '#5C4B3A' },
    materials: ['黏土', '亚麻', '原木'],
    furniture_set: 'wabi',
    preview_model: '/models/wabi.glb',
  },
  mediterranean: {
    id: 'mediterranean',
    name: 'Mediterranean',
    description: '地中海风，白色与蓝色交织',
    colors: { primary: '#FFFFFF', secondary: '#4A90D9', accent: '#E8C87A' },
    materials: ['石灰', '陶瓷', '锻铁'],
    furniture_set: 'mediterranean',
    preview_model: '/models/mediterranean.glb',
  },
}
1.2 面积与档次配置
typescript
export const AREA_OPTIONS = [
  { value: 150, label: '150 m²', price_multiplier: 1.0 },
  { value: 200, label: '200 m²', price_multiplier: 1.15 },
  { value: 300, label: '300 m²', price_multiplier: 1.35 },
]

export const TIER_OPTIONS = [
  { value: 'standard', label: 'Standard', multiplier: 1.0 },
  { value: 'luxury', label: 'Luxury', multiplier: 1.6 },
  { value: 'ultra_luxury', label: 'Ultra-Luxury', multiplier: 2.4 },
]
2. BOQ 报价引擎配置
2.1 基础价格配置
配置文件位置：src/config/pricing.ts

typescript
export const BASE_PRICES = {
  standard: {
    structure: 1200,      // USD / m²
    finishing: 800,       // USD / m²
    furniture: 500,       // USD / m²
  },
  luxury: {
    structure: 1800,
    finishing: 1400,
    furniture: 900,
  },
  ultra_luxury: {
    structure: 2800,
    finishing: 2200,
    furniture: 1500,
  },
}
2.2 增值模块配置
typescript
export const ADDONS = {
  pool: {
    name: 'Infinity Pool',
    price_per_sqm: 400,
    min_area: 20,
    max_area: 80,
  },
  rooftop: {
    name: 'Rooftop Deck',
    price_per_sqm: 250,
    min_area: 30,
    max_area: 100,
  },
  spa: {
    name: 'SPA & Yoga Shala',
    price_fixed: 25000,
  },
  smart_home: {
    name: 'Smart Home System',
    price_fixed: 15000,
  },
}
3. ROI 计算配置
配置文件位置：src/config/roi.ts

typescript
export const ROI_CONFIG = {
  locations: {
    bali: {
      name: 'Bali',
      avg_daily_rate_per_sqm: 1.8,   // USD / m² / day
      occupancy_rate: 0.75,
      management_fee_rate: 0.15,
      tax_rate: 0.10,
    },
    jakarta: {
      name: 'Jakarta',
      avg_daily_rate_per_sqm: 1.2,
      occupancy_rate: 0.65,
      management_fee_rate: 0.12,
      tax_rate: 0.10,
    },
    lombok: {
      name: 'Lombok',
      avg_daily_rate_per_sqm: 1.4,
      occupancy_rate: 0.60,
      management_fee_rate: 0.15,
      tax_rate: 0.10,
    },
  },
}
4. 线索推送配置
4.1 Telegram 配置
typescript
export const TELEGRAM_CONFIG = {
  bot_token: process.env.TELEGRAM_BOT_TOKEN,
  chat_id: process.env.TELEGRAM_CHAT_ID,
  message_template: `
🏡 *新意向线索*

👤 姓名: {name}
📱 电话: {phone}
📧 邮箱: {email}

🏗️ 项目: {style} | {area_sqm}m² | {tier}
💰 预算: ${formatCurrency(total_price)}

📋 详细信息:
{message}

🔗 查看详情: {lead_url}
  `.trim(),
}
4.2 WhatsApp 配置（可选）
typescript
export const WHATSAPP_CONFIG = {
  api_url: process.env.WHATSAPP_API_URL,
  api_token: process.env.WHATSAPP_API_TOKEN,
  from_number: process.env.WHATSAPP_FROM_NUMBER,
}
5. 自定义样式
5.1 Tailwind 主题扩展
tailwind.config.js：

javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#2F5D3A',
          sand: '#D4C5A9',
          cream: '#F5F0E8',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
}
文档结束
