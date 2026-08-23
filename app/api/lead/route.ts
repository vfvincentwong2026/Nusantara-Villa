// ============================================================
// Nusantara Villa - 线索提交 API (Cloudflare Workers Edge)
// 技术规范：
//   1. export const runtime = 'edge'
//   2. 使用原生 fetch 调用 Telegram Bot API
//   3. 禁止 Node.js 独有依赖 (fs, http, etc.)
//   4. 毫秒级执行，适合 Cloudflare Edge 节点
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
  source?: string // 'website' | 'whatsapp' | 'referral'
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
  const random = Math.random().toString(36).substring(2, 8)
  return `lead_${timestamp}_${random}`
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'IDR') {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }
  return `$${amount.toLocaleString()}`
}

function escapeMarkdown(text: string): string {
  // Telegram Markdown V2 转义
  const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']
  let result = text
  for (const char of specialChars) {
    result = result.replaceAll(char, `\\${char}`)
  }
  return result
}

// ============================================================
// 主处理函数
// ============================================================

export async function POST(request: Request): Promise<Response> {
  const startTime = performance.now()

  try {
    // 1. 解析请求体
    const body: LeadRequest = await request.json()

    // 2. 基础验证
    const { name, email, phone, style, size, tier, totalPrice, currency } = body

    if (!name || !email || !phone) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '请填写完整信息 (姓名、邮箱、电话)',
        } as LeadResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 3. 生成 Lead ID
    const leadId = generateLeadId()
    const timestamp = new Date().toISOString()

    // 4. 构建 Telegram 消息 (符合规范：Markdown V2)
    const addonsList = body.addons && body.addons.length > 0
      ? body.addons.join(', ')
      : '无'

    const message = `
🏡 *新意向线索*

👤 *姓名:* ${escapeMarkdown(name)}
📱 *电话:* ${escapeMarkdown(phone)}
📧 *邮箱:* ${escapeMarkdown(email)}

🏗️ *项目配置:*
• 风格: ${escapeMarkdown(style)}
• 面积: ${escapeMarkdown(size.toString())} m²
• 档次: ${escapeMarkdown(tier)}
• 增值模块: ${escapeMarkdown(addonsList)}

💰 *预算:* ${escapeMarkdown(formatCurrency(totalPrice, currency))}

📋 *备注:* ${body.message ? escapeMarkdown(body.message) : '无'}

🕐 *提交时间:* ${escapeMarkdown(timestamp)}

🔗 *Lead ID:* ${escapeMarkdown(leadId)}
    `.trim()

    // 5. 调用 Telegram Bot API (Edge 原生 fetch)
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    let telegramSuccess = false
    let telegramError = ''

    if (botToken && chatId) {
      try {
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`
        const telegramResponse = await fetch(telegramUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: true,
          }),
        })

        if (telegramResponse.ok) {
          telegramSuccess = true
        } else {
          const errorText = await telegramResponse.text()
          telegramError = errorText
        }
      } catch (err) {
        telegramError = err instanceof Error ? err.message : 'Unknown error'
      }
    } else {
      telegramError = 'Telegram Bot 未配置 (缺少 TELEGRAM_BOT_TOKEN 或 TELEGRAM_CHAT_ID)'
    }

    // 6. 构建 WhatsApp 链接 (印尼本地化: 前缀 +62)
    const cleanPhone = phone.replace(/[^0-9+]/g, '')
    const waNumber = cleanPhone.startsWith('+') ? cleanPhone.substring(1) : cleanPhone
    const waMessage = `Halo%2C%20saya%20tertarik%20dengan%20proyek%20villa%20${encodeURIComponent(style)}%20(${size}m²)%20-%20Lead%20ID%3A%20${leadId}`
    const whatsappLink = `https://wa.me/${waNumber}?text=${waMessage}`

    // 7. 计算响应时间 (Edge 性能监控)
    const elapsedMs = Math.round(performance.now() - startTime)

    // 8. 返回响应
    const response: LeadResponse = {
      success: telegramSuccess,
      leadId,
      message: telegramSuccess
        ? '线索已提交，我们的团队将在 24 小时内联系您'
        : '线索已记录，但通知服务暂时不可用。我们的团队将尽快联系您',
      whatsappLink,
    }

    // 日志记录 (Edge 环境通过 console 输出，可在 Cloudflare Dashboard 查看)
    console.log(`[Lead API] leadId=${leadId} | telegram=${telegramSuccess ? 'ok' : 'fail'} | elapsed=${elapsedMs}ms`)

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error(`[Lead API Error] ${errorMessage}`)

    return new Response(
      JSON.stringify({
        success: false,
        leadId: '',
        message: '服务器处理请求时发生错误，请稍后重试',
      } as LeadResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// ============================================================
// 健康检查 (GET)
// ============================================================

export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      runtime: 'edge',
      service: 'Nusantara Villa Lead API',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
