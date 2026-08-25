'use client'

import { useState, FormEvent } from 'react'
import { useConfiguratorStore, useUserInfo } from '@/store/useConfiguratorStore'

export function LeadForm() {
  const { userInfo, errors, setUserInfo, clearErrors } = useUserInfo()
  const { quote, currency, style, size, tier, addons, setSubmitting, isSubmitting, complete, setWhatsappLink } =
    useConfiguratorStore()

  const [submitError, setSubmitError] = useState<string | null>(null)

  // 本地表单状态
  const [form, setForm] = useState({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || '',
    message: userInfo?.message || '',
  })

  // 本地校验状态
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

      // 实时清除错误
      if (localErrors[field]) {
        setLocalErrors((prev) => ({ ...prev, [field]: '' }))
      }
      // 只清除对应字段的 store 错误，避免影响其他字段
      if (errors[field]) {
        // 如果能按字段清除更好，目前 clearErrors 是清除所有，保持不变
        clearErrors()
      }
      setSubmitError(null)
    }

  const validateForm = () => {
    const errs: Record<string, string> = {}
    const nameTrim = form.name.trim()
    const emailTrim = form.email.trim()
    const phoneTrim = form.phone.trim()

    if (!nameTrim) errs.name = '请输入您的姓名'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailTrim) {
      errs.email = '请输入您的邮箱'
    } else if (!emailRegex.test(emailTrim)) {
      errs.email = '请输入有效的邮箱地址'
    }

    if (!phoneTrim) {
      errs.phone = '请输入您的 WhatsApp / 电话'
    } else if (phoneTrim.length < 8) {
      errs.phone = '请输入正确的电话号码（至少 8 位）'
    }

    setLocalErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validateForm()) return

    const nameTrim = form.name.trim()
    const emailTrim = form.email.trim()
    const phoneTrim = form.phone.trim()

    setUserInfo({
      name: nameTrim,
      email: emailTrim,
      phone: phoneTrim,
      message: form.message || undefined,
    })

    if (!quote) {
      setSubmitError('报价数据缺失，请返回重新配置')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameTrim,
          email: emailTrim,
          phone: phoneTrim,
          style: style || 'modern_tropical',
          size: size || 200,
          tier: tier || 'luxury',
          addons: addons || [],
          totalPrice: quote.totalPrice,
          currency,
          message: form.message || '',
        }),
      })

      const data = await response.json()

      if (data.success) {
        // 不强制跳转：先展示完成页，由用户主动点击 WhatsApp 按钮
        setWhatsappLink(data.whatsappLink || null)
        complete()
      } else {
        setSubmitError(data.message || '提交失败，请稍后重试')
      }
    } catch (error) {
      console.error('[LeadForm] 提交错误:', error)
      setSubmitError('网络错误，请检查连接后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const getFieldError = (field: 'name' | 'email' | 'phone') => localErrors[field] || errors[field]

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* 姓名 */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          姓名 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={handleChange('name')}
          placeholder="您的姓名"
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors ${
            getFieldError('name') ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isSubmitting}
        />
        {getFieldError('name') && (
          <p className="text-xs text-red-500 mt-1">{getFieldError('name')}</p>
        )}
      </div>

      {/* 邮箱 */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          邮箱 <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={handleChange('email')}
          placeholder="your@email.com"
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors ${
            getFieldError('email') ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isSubmitting}
        />
        {getFieldError('email') && (
          <p className="text-xs text-red-500 mt-1">{getFieldError('email')}</p>
        )}
      </div>

      {/* 电话 */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          WhatsApp / 电话 <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange('phone')}
          placeholder="+62 812-3456-7890"
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors ${
            getFieldError('phone') ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isSubmitting}
        />
        {getFieldError('phone') && (
          <p className="text-xs text-red-500 mt-1">{getFieldError('phone')}</p>
        )}
      </div>

      {/* 备注 */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          备注（可选）
        </label>
        <textarea
          id="message"
          value={form.message}
          onChange={handleChange('message')}
          placeholder="您有什么特别需求吗？"
          rows={2}
          disabled={isSubmitting}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors resize-none"
        />
      </div>

      {/* 错误信息 */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            提交中...
          </>
        ) : (
          '📩 Get Full BOQ via WhatsApp'
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        提交后，我们的团队将在 24 小时内通过 WhatsApp 联系您
      </p>
    </form>
  )
}
