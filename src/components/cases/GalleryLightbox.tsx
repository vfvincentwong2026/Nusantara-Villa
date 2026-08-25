// ============================================================
// Nusantara Villa - 实景图集 + 手写灯箱 (Client Component)
// 功能: 缩略图网格 → 点击全屏灯箱，左右切换，ESC/点击遮罩关闭
// 不依赖任何第三方 UI 库
// ============================================================

'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface GalleryLightboxProps {
  images: string[]
  title: string
}

export function GalleryLightbox({ images, title }: GalleryLightboxProps) {
  const [current, setCurrent] = useState<number | null>(null)
  const isOpen = current !== null

  const close = useCallback(() => setCurrent(null), [])

  const showPrev = useCallback(() => {
    setCurrent((c) => (c === null ? c : (c - 1 + images.length) % images.length))
  }, [images.length])

  const showNext = useCallback(() => {
    setCurrent((c) => (c === null ? c : (c + 1) % images.length))
  }, [images.length])

  // 键盘导航: ESC 关闭, 左右箭头切换
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') showPrev()
      else if (e.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, close, showPrev, showNext])

  // 灯箱打开时锁定背景滚动
  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen])

  return (
    <>
      {/* ---------- 缩略图网格 ---------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setCurrent(i)}
            className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 group focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label={`查看大图 ${i + 1}`}
          >
            <Image
              src={src}
              alt={`${title} 实景图 ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {/* ---------- 灯箱 ---------- */}
      {current !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} 图片灯箱`}
        >
          {/* 关闭按钮 */}
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="关闭灯箱"
          >
            <X className="w-6 h-6" />
          </button>

          {/* 上一张 */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                showPrev()
              }}
              className="absolute left-3 sm:left-6 z-10 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="上一张"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          {/* 大图（阻止点击穿透关闭） */}
          <div
            className="relative w-[92vw] h-[82vh] max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[current]}
              alt={`${title} 实景图 ${current + 1}`}
              fill
              sizes="92vw"
              priority
              className="object-contain"
            />
          </div>

          {/* 下一张 */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                showNext()
              }}
              className="absolute right-3 sm:right-6 z-10 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="下一张"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}

          {/* 计数器 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium">
            {current + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
