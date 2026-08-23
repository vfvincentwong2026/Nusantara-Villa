// ============================================================
// Nusantara Villa - 3D 场景组件 (React Three Fiber)
// 技术规范：
//   1. 'use client' 显式声明
//   2. 使用 useConfigSelection 细粒度订阅，避免不必要重绘
//   3. useEffect 卸载时彻底清理材质与几何体，释放显存
//   4. 低模占位 + 环境贴图，移动端友好
// ============================================================

'use client'

import { useRef, useEffect, useMemo, memo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Sky, Box, Sphere, Cylinder, Plane } from '@react-three/drei'
import * as THREE from 'three'
import { useConfigSelection } from '@/store/useConfiguratorStore'

// ============================================================
// 1. 常量定义（组件外部，避免每次重渲染重新创建）
// ============================================================

// 静态材质（模块作用域复用，完全避免显存泄露与重复创建）
const GROUND_MATERIAL = new THREE.MeshStandardMaterial({ color: '#E8DDD0', roughness: 0.9, metalness: 0 })
const TRUNK_MATERIAL = new THREE.MeshStandardMaterial({ color: '#5C4B3A', roughness: 0.9 })
const LEAF_MATERIAL_1 = new THREE.MeshStandardMaterial({ color: '#2F5D3A', roughness: 0.8 })
const LEAF_MATERIAL_2 = new THREE.MeshStandardMaterial({ color: '#3D7A4A', roughness: 0.8 })
const POOL_BORDER_MATERIAL = new THREE.MeshStandardMaterial({ color: '#94A3B8', roughness: 0.5 })
const RAILING_MATERIAL = new THREE.MeshStandardMaterial({ color: '#94A3B8', roughness: 0.4 })

const SPA_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: '#87CEEB',
  roughness: 0.05,
  metalness: 0.1,
  transparent: true,
  opacity: 0.6,
})

// 颜色映射
const STYLE_COLORS: Record<string, { main: string; accent: string; roof: string }> = {
  modern_tropical: { main: '#D4C5A9', accent: '#8B7D6B', roof: '#2F5D3A' },
  wabi_sabi: { main: '#E8DDD0', accent: '#C4B5A0', roof: '#5C4B3A' },
  mediterranean: { main: '#F5F0E8', accent: '#4A90D9', roof: '#E8C87A' },
}

const TIER_COLORS: Record<string, string> = {
  standard: '#94A3B8',
  luxury: '#FBBF24',
  ultra_luxury: '#EF4444',
}

// 面积 → 建筑尺寸映射
const SIZE_MAP: Record<number, { width: number; depth: number; height: number }> = {
  150: { width: 2.0, depth: 1.6, height: 1.2 },
  200: { width: 2.4, depth: 1.8, height: 1.4 },
  300: { width: 3.0, depth: 2.0, height: 1.6 },
}

// ============================================================
// 2. 树木组件（使用 memo 避免不必要的重绘）
// ============================================================

const Tree = memo(function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <Cylinder args={[0.04, 0.06, 0.5, 6]} position={[0, 0.25, 0]} material={TRUNK_MATERIAL} />
      <Sphere args={[0.25, 6, 6]} position={[0, 0.55, 0]} material={LEAF_MATERIAL_1} />
      <Sphere args={[0.18, 6, 6]} position={[0.15, 0.65, 0.1]} material={LEAF_MATERIAL_2} />
    </group>
  )
})

// ============================================================
// 3. 别墅模型组件（核心）
// ============================================================

function VillaModel() {
  // 细粒度订阅：只有配置变化时才重绘
  const { style, size, tier, addons } = useConfigSelection()
  const groupRef = useRef<THREE.Group>(null)

  // ---- 获取当前配置对应的数据 ----
  const colors = style ? STYLE_COLORS[style] : STYLE_COLORS.modern_tropical
  const tierColor = tier ? TIER_COLORS[tier] : TIER_COLORS.standard
  const dims = size ? SIZE_MAP[size] : SIZE_MAP[150]

  // ---- 材质创建（仅在颜色变化时重新创建） ----
  const materials = useMemo(() => {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: colors.main,
      roughness: 0.3,
      metalness: 0.05,
    })

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: colors.accent,
      roughness: 0.4,
      metalness: 0.1,
    })

    const roofMaterial = new THREE.MeshStandardMaterial({
      color: colors.roof,
      roughness: 0.6,
      metalness: 0.05,
    })

    const tierMaterial = new THREE.MeshStandardMaterial({
      color: tierColor,
      roughness: 0.3,
      metalness: 0.2,
      emissive: tierColor,
      emissiveIntensity: 0.05,
    })

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: '#87CEEB',
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.35,
      envMapIntensity: 0.8,
    })

    const poolMaterial = new THREE.MeshPhysicalMaterial({
      color: '#3B82F6',
      roughness: 0.05,
      metalness: 0.3,
      transparent: true,
      opacity: 0.75,
      envMapIntensity: 0.5,
    })

    const rooftopMaterial = new THREE.MeshStandardMaterial({
      color: '#D4C5A9',
      roughness: 0.7,
      metalness: 0.05,
    })

    return {
      wallMaterial,
      accentMaterial,
      roofMaterial,
      tierMaterial,
      glassMaterial,
      poolMaterial,
      rooftopMaterial,
    }
  }, [colors.main, colors.accent, colors.roof, tierColor])

  // ---- 清理动态生成的材质（组件卸载时） ----
  useEffect(() => {
    return () => {
      Object.values(materials).forEach((mat) => mat.dispose())
    }
  }, [materials])

  // ---- 清理几何体（组件卸载时，只清理动态几何体） ----
  useEffect(() => {
    const currentGroup = groupRef.current
    return () => {
      if (currentGroup) {
        currentGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // 只清理动态几何体（Box/Sphere/Cylinder 默认 geometry）
            if (child.geometry) {
              child.geometry.dispose()
            }
          }
        })
      }
    }
  }, []) // 空数组，只在组件卸载时执行

  // ---- 渲染 ----
  const { width, depth, height } = dims
  const hasPool = addons.includes('pool')
  const hasRooftop = addons.includes('rooftop')
  const hasSpa = addons.includes('spa')

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 地面 */}
      <Plane
        args={[8, 8]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
        material={GROUND_MATERIAL}
      />

      {/* 建筑主体 */}
      <Box
        args={[width, height, depth]}
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
        material={materials.wallMaterial}
      />

      {/* 屋顶 */}
      <Box
        args={[width + 0.15, 0.12, depth + 0.15]}
        position={[0, height + 0.06, 0]}
        castShadow
        material={materials.roofMaterial}
      />

      {/* 屋顶装饰线 */}
      <Box
        args={[width + 0.3, 0.05, depth + 0.3]}
        position={[0, height + 0.12, 0]}
        material={materials.tierMaterial}
      />

      {/* 窗户（玻璃条） */}
      <Box
        args={[width * 0.6, 0.3, 0.05]}
        position={[0, height * 0.6, depth / 2 + 0.01]}
        material={materials.glassMaterial}
      />
      <Box
        args={[width * 0.6, 0.3, 0.05]}
        position={[0, height * 0.6, -depth / 2 - 0.01]}
        material={materials.glassMaterial}
      />
      <Box
        args={[0.05, 0.3, depth * 0.5]}
        position={[width / 2 + 0.01, height * 0.6, 0]}
        material={materials.glassMaterial}
      />
      <Box
        args={[0.05, 0.3, depth * 0.5]}
        position={[-width / 2 - 0.01, height * 0.6, 0]}
        material={materials.glassMaterial}
      />

      {/* 入户门（正面） */}
      <Box
        args={[0.25, 0.5, 0.05]}
        position={[0, 0.2, depth / 2 + 0.01]}
        material={materials.accentMaterial}
      />

      {/* 泳池 (addon) */}
      {hasPool && (
        <Box
          args={[1.2, 0.08, 0.8]}
          position={[width / 2 + 0.5, 0.02, 0]}
          castShadow
          material={materials.poolMaterial}
        >
          {/* 泳池边框 */}
          <Box
            args={[1.3, 0.04, 0.9]}
            position={[0, 0.06, 0]}
            material={POOL_BORDER_MATERIAL}
          />
        </Box>
      )}

      {/* 屋顶露台 (addon) */}
      {hasRooftop && (
        <Box
          args={[width * 0.5, 0.06, depth * 0.4]}
          position={[0, height + 0.2, 0]}
          material={materials.rooftopMaterial}
        >
          {/* 露台栏杆 */}
          <Box
            args={[width * 0.55, 0.06, 0.04]}
            position={[0, 0.12, depth * 0.22]}
            material={RAILING_MATERIAL}
          />
        </Box>
      )}

      {/* SPA 区 (addon) */}
      {hasSpa && (
        <Sphere
          args={[0.3, 16, 16]}
          position={[-width / 2 - 0.4, 0.35, 0]}
          material={SPA_MATERIAL}
        />
      )}

      {/* 环境树木 */}
      <Tree position={[-width / 2 - 0.8, 0, -depth / 2 - 0.6]} scale={0.6} />
      <Tree position={[width / 2 + 0.8, 0, -depth / 2 - 0.6]} scale={0.5} />
      <Tree position={[-width / 2 - 0.6, 0, depth / 2 + 0.6]} scale={0.4} />
    </group>
  )
}

// ============================================================
// 4. 主场景组件
// ============================================================

export function VillaScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [4.5, 3.2, 5.5], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      className="w-full h-full"
    >
      {/* 光照 */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-4, 6, -4]} intensity={0.3} />

      {/* 环境贴图（轻量级） */}
      <Environment preset="sunset" background={false} />

      {/* 天空（轻量） */}
      <Sky
        sunPosition={[10, 8, 5]}
        turbidity={8}
        rayleigh={0.5}
      />

      {/* 模型 */}
      <VillaModel />

      {/* 轨道控制 */}
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={0.6}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0.6, 0]}
      />
    </Canvas>
  )
}
