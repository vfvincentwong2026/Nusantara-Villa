// ============================================================
// Nusantara Villa - 线索提交 API (Cloudflare Workers Edge)
// ============================================================

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// ============================================================
// 类型定义
// ============================================================

interface LeadRequest {
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
}

interface LeadResponse {
  success: boolean
  leadId: string
  message: string
  whatsappLink?: string
}

// ============================================================
// 工具函数（Edge 兼容）
// ============================================================

function generateLeadId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 6)
  return `NV-${timestamp}-${random}`.toUpperCase()
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'IDR') {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }
  return `$${amount.toLocaleString()}`
}

/**
 * Telegram Markdown V2 安全转义
 * 只转义普通文本中的特殊字符，保留已使用的 Markdown 语法结构
 */
function escapeMarkdown(text: string): string {
  if (!text) return ''
  // 逐字符处理，只转义需要转义的字符
  // 注意：不转义空格、换行、以及 Markdown 语法中用于格式化的符号
  const chars = text.split('')
  let result = ''
  for (const char of chars) {
    // 需要转义的特殊字符列表（Markdown V2）
    if ('_*[]()~`>#+-=|{}.!'.includes(char)) {
      result += `\\${char}`
    } else {
      result += char
    }
  }
  return result
}

/**
 * 标准化手机号（用于 wa.me 链接）
 * 保留 + 号，移除空格和特殊符号
 */
function normalizePhone(phone: string): string {
  // 保留 + 和数字，移除其他字符
  return phone.replace(/[^0-9+]/g, '')
}

// ============================================================
// POST: 提交线索
// ============================================================

export async function POST(request: Request): Promise<Response> {
  const startTime = performance.now()

  try {
    const body: LeadRequest = await request.json()
    const { name, email, phone, style, size, tier, totalPrice, currency, message, addons } = body

    // ----- 验证 -----
    if (!name || !email || !phone) {
      return new Response(
        JSON.stringify({
          success: false,
          leadId: '',
          message: 'Please complete all required fields (Name, Email, Phone).',
        } as LeadResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // ----- 生成 Lead ID -----
    const leadId = generateLeadId()
    const timestamp = new Date().toISOString()
    const addonsList = addons && addons.length > 0 ? addons.join(', ') : 'None'

    // ----- 构建 Telegram 消息 -----
    const telegramMessage = `
🏛️ *Nusantara Villa - New Lead Captured*

👤 *Client Name:* ${escapeMarkdown(name)}
📱 *Phone:* ${escapeMarkdown(phone)}
📧 *Email:* ${escapeMarkdown(email)}

🏗️ *Config details:*
• Style: ${escapeMarkdown(style)}
• Size: ${escapeMarkdown(size.toString())} m²
• Tier: ${escapeMarkdown(tier)}
• Addons: ${escapeMarkdown(addonsList)}

💰 *Est. Investment:* ${escapeMarkdown(formatCurrency(totalPrice, currency))}
📋 *Notes:* ${message ? escapeMarkdown(message) : 'None'}

🕐 *Time:* ${escapeMarkdown(timestamp)}
🆔 *Lead ID:* \`${escapeMarkdown(leadId)}\`
    `.trim()

    // ----- 调用 Telegram Bot API -----
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID
    let telegramSuccess = false

    // 标准化客户手机号（用于销售快捷联系）
    const clientCleanPhone = normalizePhone(phone)
    const clientWaUrl = `https://wa.me/${clientCleanPhone}`

    if (botToken && chatId) {
      try {
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`
        const telegramResponse = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramMessage,
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
              ],
            },
          }),
        })

        if (telegramResponse.ok) telegramSuccess = true
      } catch (err) {
        console.error('[Telegram API Exception]', err)
      }
    }

    // ----- 构建官方 WhatsApp 链接（客户 → 官方）-----
    const officialWaNumber = process.env.OFFICIAL_WHATSAPP_NUMBER || '6281234567890'
    const waText = `Halo Nusantara Villa Team, I have saved my configurator quote (Lead ID: ${leadId}) for a ${style} Villa (${size}m²). I would like to receive the detailed BOQ.`
    const whatsappLink = `https://wa.me/${normalizePhone(officialWaNumber)}?text=${encodeURIComponent(waText)}`

    // ----- 日志记录 -----
    const elapsedMs = Math.round(performance.now() - startTime)
    console.log(`[Lead API] leadId=${leadId} | telegram=${telegramSuccess} | time=${elapsedMs}ms`)

    // ----- 返回响应 -----
    return new Response(
      JSON.stringify({
        success: true,
        leadId,
        message: telegramSuccess
          ? 'Lead recorded successfully. Our team will contact you within 24 hours.'
          : 'Lead recorded, but notification service is temporarily unavailable. Our team will contact you soon.',
        whatsappLink,
      } as LeadResponse),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
        },
      }
    )
  } catch (error) {
    console.error('[Lead API Error]', error)
    return new Response(
      JSON.stringify({
        success: false,
        leadId: '',
        message: 'Internal server error. Please try again later.',
      } as LeadResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// ============================================================
// GET: 健康检查
// ============================================================

export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      runtime: 'edge',
      service: 'Nusantara Villa Lead API',
      timestamp: new Date().toISOString(),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
