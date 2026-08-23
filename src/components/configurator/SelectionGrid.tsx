// ============================================================
// Nusantara Villa - 选择网格组件
// 功能：风格 / 面积 / 档次 / 增值模块 的卡片选择
// ============================================================

'use client'

import { Check } from 'lucide-react'
import {
  useConfiguratorStore,
  STYLE_PRESETS,
  SIZE_OPTIONS,
  TIER_OPTIONS,
  ADDON_OPTIONS,
  useConfigSelection,
} from '@/store/useConfiguratorStore'

interface SelectionGridProps {
  type: 'style' | 'size' | 'tier' | 'addons'
}

export function SelectionGrid({ type }: SelectionGridProps) {
  // 订阅配置数据（用于显示选中状态）
  const { style, size, tier, addons } = useConfigSelection()

  // 获取 setter 方法（使用 getState 静态获取，避免不必要的重渲染）
  const { setStyle, setSize, setTier, toggleAddon } = useConfiguratorStore.getState()

  // 获取 clearAddons（store 中需要定义该方法）
  const clearAddons = useConfiguratorStore((s) => s.clearAddons)

  // 清除所有 addon
  const handleClearAll = () => {
    if (addons.length === 0) return
    if (clearAddons) {
      clearAddons()
    } else {
      // 兼容兜底（如果 store 中没有 clearAddons）
      addons.forEach((code) => toggleAddon(code))
    }
  }

  // 根据类型渲染不同的选项
  const getOptions = () => {
    switch (type) {
      case 'style':
        return STYLE_PRESETS.map((s) => ({
          id: s.id,
          label: s.name,
          description: s.description,
          emoji: s.emoji,
          tags: s.tags,
          isSelected: style === s.id,
          onClick: () => setStyle(s.id),
        }))
      case 'size':
        return SIZE_OPTIONS.map((s) => ({
          id: s.value,
          label: s.label,
          description: s.description,
          emoji: '📐',
          tags: [],
          isSelected: size === s.value,
          onClick: () => setSize(s.value),
        }))
      case 'tier':
        return TIER_OPTIONS.map((t) => ({
          id: t.value,
          label: t.label,
          description: t.description,
          emoji: t.emoji,
          tags: t.features.slice(0, 2),
          isSelected: tier === t.value,
          onClick: () => setTier(t.value),
        }))
      case 'addons':
        return ADDON_OPTIONS.map((a) => ({
          id: a.code,
          label: a.name,
          description: a.description,
          emoji: a.icon,
          tags: a.isPopular ? ['热门'] : [],
          isSelected: addons.includes(a.code),
          onClick: () => toggleAddon(a.code),
        }))
      default:
        return []
    }
  }

  const options = getOptions()
  const selectedCount = addons.length
  const isMultiSelect = type === 'addons'

  return (
    <div className="space-y-2.5">
      {/* Addons 的顶部统计提示 */}
      {type === 'addons' && (
        <div className="flex items-center justify-between mb-2 px-0.5 text-sm">
          <span className="text-gray-500 font-medium text-xs">
            已选择 <span className="text-primary-600 font-semibold">{selectedCount}</span> 个模块
          </span>
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium underline-offset-2 hover:underline"
            >
              全部清除
            </button>
          )}
        </div>
      )}

      {/* 选项列表 */}
      <div className="space-y-2" role={isMultiSelect ? undefined : 'radiogroup'}>
        {options.map((opt) => (
          <button
            key={String(opt.id)}
            type="button"
            role={isMultiSelect ? 'checkbox' : 'radio'}
            aria-checked={opt.isSelected}
            onClick={opt.onClick}
            className={`
              w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200
              ${opt.isSelected
                ? 'border-primary-500 bg-primary-50/60 shadow-sm ring-1 ring-primary-500/20'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 active:bg-gray-100'
              }
              ${type === 'addons' ? 'py-2.5' : ''}
            `}
          >
            {/* 图标 */}
            <div className="text-2xl flex-shrink-0 select-none">{opt.emoji}</div>

            {/* 文字信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className={`font-medium text-sm ${opt.isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                  {opt.label}
                </span>
                {/* 标签 */}
                {opt.tags && opt.tags.length > 0 && (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-md">
                    {opt.tags[0]}
                  </span>
                )}
                {type === 'addons' && opt.isSelected && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                    已选
                  </span>
                )}
              </div>
              <p className={`text-xs line-clamp-2 leading-relaxed ${opt.isSelected ? 'text-primary-700/80' : 'text-gray-500'}`}>
                {opt.description}
              </p>
            </div>

            {/* 选中/未选中标记 */}
            {opt.isSelected ? (
              <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* 空状态提示 */}
      {options.length === 0 && (
        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-sm">暂无可用选项</p>
        </div>
      )}
    </div>
  )
}
