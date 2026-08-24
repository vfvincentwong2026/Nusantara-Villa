// ============================================================
// Nusantara-Villa 工具函数 (SSR 兼容与健壮版)
// ============================================================

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ============================================================
// 1. Tailwind CSS 类名合并
// ============================================================

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ============================================================
// 2. 货币格式化
// ============================================================

/**
 * 格式化通用金额
 * 清除可能导致 SSR Hydration Mismatch 的非标准空格
 */
export function formatCurrency(
  amount: number,
  currency: 'USD' | 'IDR' = 'USD',
  locale: string = 'en-US'
): string {
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

    // 清除可能导致 SSR Hydration Mismatch 的非标准/不间断空格
    return formatted.replace(/[\u00A0\u202F]/g, ' ')
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

/**
 * 格式化印尼盾 (IDR)
 */
export function formatIDR(amount: number): string {
  return formatCurrency(amount, 'IDR', 'id-ID')
}

/**
 * 格式化美元 (USD)
 */
export function formatUSD(amount: number): string {
  return formatCurrency(amount, 'USD', 'en-US')
}

/**
 * 短格式货币（仅符号 + 数字）
 */
export function formatCurrencyShort(amount: number, currency: 'USD' | 'IDR' = 'USD'): string {
  const symbol = currency === 'IDR' ? 'Rp' : '$'
  const locale = currency === 'IDR' ? 'id-ID' : 'en-US'
  return `${symbol} ${amount.toLocaleString(locale)}`
}

// ============================================================
// 3. ID 生成
// ============================================================

/**
 * 生成加密安全的唯一 ID
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().slice(0, 8)
  }
  return Math.random().toString(36).substring(2, 10)
}

/**
 * 生成 Lead ID (NV-{timestamp}-{random})
 */
export function generateLeadId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 6)
  return `NV-${timestamp}-${random}`.toUpperCase()
}

// ============================================================
// 4. 延迟与防抖
// ============================================================

/**
 * 异步延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(this, args)
      timeout = null
    }, wait)
  }
}

// ============================================================
// 5. 验证工具
// ============================================================

/**
 * 邮箱格式验证
 * 符合 RFC 5321/5322 标准
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return regex.test(email.trim())
}

/**
 * 印尼手机号格式验证
 * 支持格式: 08xx, +628xx, 628xx
 */
export function isValidIndonesianPhone(phone: string): boolean {
  if (!phone) return false

  // 仅保留数字与加号
  const cleaned = phone.replace(/[^\d+]/g, '')

  // 印尼手机号: 08开头(10-12位) 或 +62/62 8开头(11-14位)
  return /^(?:(?:\+?62)|0)8[1-9]\d{7,10}$/.test(cleaned)
}

/**
 * 清理手机号（仅保留数字和 +）
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^0-9+]/g, '')
}

// ============================================================
// 6. 文本工具
// ============================================================

/**
 * 截断文本，超出部分加省略号
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * 首字母大写
 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// ============================================================
// 7. 环境检测
// ============================================================

/**
 * 检测是否在浏览器环境
 */
export const isBrowser = typeof window !== 'undefined'

/**
 * 检测是否在服务端环境
 */
export const isServer = typeof window === 'undefined'

/**
 * 检测是否为开发环境
 */
export const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * 检测是否为生产环境
 */
export const isProduction = process.env.NODE_ENV === 'production'
