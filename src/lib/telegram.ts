// ============================================================
// Nusantara Villa - Telegram 通知服务（Edge 兼容版）
// 技术规范：
//   1. 使用原生 fetch 调用 Telegram Bot API
//   2. 无 Node.js 依赖，兼容 Cloudflare Edge Runtime
// ============================================================

// ============================================================
// 1. 类型定义
// ============================================================

export interface TelegramLeadData {
  id: string
  name: string
  email: string
  phone: string
  style: string
  size: number
  tier: string
  addons: string[]
  totalPrice: number
  currency: string
  message?: string
  createdAt: string
}

export interface TelegramSendResult {
  success: boolean
  messageId?: number
  error?: string
}

// ============================================================
// 2. 辅助工具与消息构建
// ============================================================

/**
 * 转义 Markdown V2 特殊字符（用于变量值）
 * 注意：- 放在字符类末尾，避免被解释为范围
 */
function escapeMarkdownV2(text: string): string {
  if (!text) return ''
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
}

/**
 * 格式化印尼 WhatsApp 呼叫号码
 * 0812345678 → 62812345678
 * +62812345678 → 62812345678
 * 62812345678 → 62812345678
 */
function formatWhatsAppPhone(phone: string): string {
  // 保留数字，移除所有非数字字符（包括 +）
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    return `62${cleaned.slice(1)}`
  }
  return cleaned
}

/**
 * 构建 Telegram 推送消息（Markdown V2 格式）
 */
export function buildTelegramMessage(data: TelegramLeadData): string {
  const {
    id,
    name,
    email,
    phone,
    style,
    size,
    tier,
    addons,
    totalPrice,
    currency,
    message,
    createdAt,
  } = data

  const addonsList = addons.length > 0 ? addons.join(', ') : 'None'
  const priceFormatted =
    currency === 'IDR'
      ? `Rp ${totalPrice.toLocaleString('en-US')}`
      : `$${totalPrice.toLocaleString('en-US')}`

  // Markdown V2 转义（仅转义变量值，保留硬编码 Markdown 语法）
  const safeName = escapeMarkdownV2(name)
  const safePhone = escapeMarkdownV2(phone)
  const safeEmail = escapeMarkdownV2(email)
  const safeStyle = escapeMarkdownV2(style)
  const safeSize = escapeMarkdownV2(size.toString())
  const safeTier = escapeMarkdownV2(tier)
  const safeAddons = escapeMarkdownV2(addonsList)
  const safePrice = escapeMarkdownV2(priceFormatted)
  const safeMessage = message ? escapeMarkdownV2(message) : 'None'
  const safeDate = escapeMarkdownV2(createdAt)

  // 代码块内部：只去除非字母数字字符，绝不使用反斜杠转义
  const safeCodeId = id.replace(/[^a-zA-Z0-9_-]/g, '')

  return `
🏛️ *Nusantara Villa - New Lead Captured*

👤 *Client Name:* ${safeName}
📱 *Phone:* ${safePhone}
📧 *Email:* ${safeEmail}

🏗️ *Config Details:*
• Style: ${safeStyle}
• Size: ${safeSize} m²
• Tier: ${safeTier}
• Addons: ${safeAddons}

💰 *Est. Investment:* ${safePrice}
📋 *Notes:* ${safeMessage}

🕐 *Time:* ${safeDate}
🆔 *Lead ID:* \`${safeCodeId}\`
  `.trim()
}

// ============================================================
// 3. 发送 Telegram 通知
// ============================================================

/**
 * 发送 Telegram 通知（Edge 原生 fetch）
 */
export async function sendTelegramNotification(
  data: TelegramLeadData,
  options?: { botToken?: string; chatId?: string; siteUrl?: string }
): Promise<TelegramSendResult> {
  const botToken = options?.botToken || process.env.TELEGRAM_BOT_TOKEN
  const chatId = options?.chatId || process.env.TELEGRAM_CHAT_ID
  const siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://nusantara-villa.com'

  if (!botToken) {
    return { success: false, error: 'TELEGRAM_BOT_TOKEN 未配置' }
  }

  if (!chatId) {
    return { success: false, error: 'TELEGRAM_CHAT_ID 未配置' }
  }

  const text = buildTelegramMessage(data)
  const clientWaUrl = `https://wa.me/${formatWhatsAppPhone(data.phone)}`

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '💬 Reply via WhatsApp',
                url: clientWaUrl,
              },
            ],
            [
              {
                text: '📋 View Lead',
                url: `${siteUrl}/admin/lead/${data.id}`,
              },
            ],
          ],
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: `Telegram API 错误 (${response.status}): ${errorText}`,
      }
    }

    const result = await response.json()
    return {
      success: true,
      messageId: result.result?.message_id,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}

// ============================================================
// 4. 简化版发送
// ============================================================

export async function sendTelegramSimple(
  params: {
    name: string
    phone: string
    email: string
    style: string
    size: number
    tier: string
    addons: string[]
    totalPrice: number
    currency: string
    message?: string
    leadId?: string
  },
  options?: { botToken?: string; chatId?: string; siteUrl?: string }
): Promise<TelegramSendResult> {
  const data: TelegramLeadData = {
    id: params.leadId || `NV-${Date.now().toString(36)}`,
    name: params.name,
    phone: params.phone,
    email: params.email,
    style: params.style,
    size: params.size,
    tier: params.tier,
    addons: params.addons,
    totalPrice: params.totalPrice,
    currency: params.currency,
    message: params.message,
    createdAt: new Date().toISOString(),
  }

  return sendTelegramNotification(data, options)
}
