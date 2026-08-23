// ============================================================
// Nusantara-Villa Telegram 通知服务
// ============================================================

interface LeadData {
  id: string
  name: string
  email: string
  phone: string
  style: string
  size: number
  tier: string
  addons: string[]
  totalPrice: number
  message?: string
  createdAt: string
}

/**
 * 发送 Telegram 通知
 */
export async function sendTelegramNotification(lead: LeadData): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.warn('Telegram 未配置，跳过通知')
    return false
  }

  const message = `
🏡 *新意向线索*

👤 姓名: ${lead.name}
📱 电话: ${lead.phone}
📧 邮箱: ${lead.email}

🏗️ 项目配置:
• 风格: ${lead.style}
• 面积: ${lead.size} m²
• 档次: ${lead.tier}
• 增值模块: ${lead.addons.join(', ') || '无'}

💰 预估预算: $${lead.totalPrice.toLocaleString()}

📋 备注: ${lead.message || '无'}

🕐 提交时间: ${lead.createdAt}

🔗 查看详情: https://nusantara-villa.com/admin/lead/${lead.id}
  `.trim()

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Telegram 通知发送失败:', error)
    return false
  }
}
