'use client'

import { useConfiguratorStore, type Currency } from '@/store/useConfiguratorStore'

const CURRENCIES: { code: Currency; label: string }[] = [
  { code: 'USD', label: 'USD' },
  { code: 'IDR', label: 'IDR' },
]

export function CurrencyToggle() {
  const currency = useConfiguratorStore((s) => s.currency)
  const setCurrency = useConfiguratorStore((s) => s.setCurrency)

  return (
    <div 
      className="inline-flex items-center bg-gray-100 rounded-lg p-0.5" 
      role="group" 
      aria-label="选择显示货币"
    >
      {CURRENCIES.map(({ code, label }) => {
        const isActive = currency === code

        return (
          <button
            key={code}
            type="button"
            onClick={() => setCurrency(code)}
            aria-pressed={isActive}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              isActive
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
