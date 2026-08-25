// ============================================================
// Nusantara Villa - 案例数据访问层 (纯静态，SSG 友好)
// 数据源: src/content/cases.json (22 个设计案例)
// ============================================================

import casesData from '@/content/cases.json'
import type { VillaStyle } from '@/store/useConfiguratorStore'

// ============================================================
// 类型定义
// ============================================================

export interface CaseStudy {
  slug: string
  title: string
  location: string
  areaSqm: number
  styleTag: VillaStyle
  /** 原文风格名称，如「法式风格」 */
  styleLabel: string
  /** 设计机构来源，如「派尚设计」「⑤号设计」 */
  source: string
  /** 造价/获奖备注，可为空字符串 */
  note: string
  description: string
  designHighlights: string[]
  coverImage: string
  galleryImages: string[]
  sortOrder: number
}

export type StyleFilterValue = 'all' | VillaStyle

export interface StyleFilterOption {
  value: StyleFilterValue
  label: string
}

export const STYLE_FILTERS: StyleFilterOption[] = [
  { value: 'all', label: '全部风格' },
  { value: 'wabi_sabi', label: '侘寂风' },
  { value: 'mediterranean', label: '法式/地中海' },
  { value: 'modern_tropical', label: '现代/热带' },
]

// ============================================================
// 内部数据（按 sortOrder 升序，模块加载时排序一次）
// ============================================================

const allCases: CaseStudy[] = (casesData as CaseStudy[])
  .slice()
  .sort((a, b) => a.sortOrder - b.sortOrder)

// ============================================================
// 查询函数
// ============================================================

export function getAllCases(): CaseStudy[] {
  return allCases
}

export function getCaseBySlug(slug: string): CaseStudy | undefined {
  return allCases.find((c) => c.slug === slug)
}

export function getLatestCases(n: number): CaseStudy[] {
  return allCases.slice(0, Math.max(0, n))
}

export function getCasesByStyle(style: VillaStyle): CaseStudy[] {
  return allCases.filter((c) => c.styleTag === style)
}

/** 校验 URL 筛选参数，非法值回退为 'all' */
export function normalizeStyleFilter(value: string | undefined): StyleFilterValue {
  if (!value) return 'all'
  const matched = STYLE_FILTERS.find((f) => f.value === value)
  return matched ? matched.value : 'all'
}
