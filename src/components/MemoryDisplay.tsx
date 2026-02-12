import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { useStore, audioData } from '../store'
import { MEMORY_DATA } from '../data/memories'

// --- 粒子重组特效 (Particle Image) ---
function ParticleImage({ url, isExiting }: { url: string, isExiting: boolean }) {
  const texture = useTexture(encodeURI(url))
  const materialRef = useRef<any>()
  const { viewport } = useThree() 
  
  // 计算宽高比，与 RealImageDisplay 保持一致
  const aspect = texture.image ? texture.image.width / texture.image.height : 1
  const maxWidth = 12
  const maxHeight = 8
  
  let width = maxWidth
  let height = width / aspect
  
  if (height > maxHeight) {
    height = maxHeight
    width = height * aspect
  }

  const geometry = useMemo(() => {
    // 提升分辨率
    const size = 256 
    // 使用计算出的宽高，而不是固定的 12x12
    const geo = new THREE.PlaneGeometry(width, height, size, size) 
    const count = geo.attributes.position.count
    const randomPos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 20 + Math.random() * 10
      randomPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      randomPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      randomPos[i * 3 + 2] = r * Math.cos(phi)
    }
    geo.setAttribute('aRandomPos', new THREE.BufferAttribute(randomPos, 3))
    return geo
  }, [width, height]) // 依赖 width, height
  
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.getElapsedTime()
      materialRef.current.uDpr = viewport.dpr 
      
      // 读取高频能量 (Treble) 驱动粒子闪烁
      materialRef.current.uAudio = audioData.current.treble
      
      const target = isExiting ? 0 : 1
      const speed = isExiting ? 2.0 : 1.5
      materialRef.current.uProgress = THREE.MathUtils.lerp(materialRef.current.uProgress, target, delta * speed)
    }
  })

  return (
    <points geometry={geometry}>
      {/* @ts-ignore */}
      <particleMaterial 
        ref={materialRef} 
        uTexture={texture} 
        transparent 
        depthWrite={false} 
        blending={THREE.NormalBlending} 
      />
    </points>
  )
}

// --- 装饰组件：四角括弧 (Corner Brackets) ---
function CornerBrackets({ width, height }: { width: number, height: number }) {
  const points = useMemo(() => {
    const w = width / 2
    const h = height / 2
    const s = 0.5 // 括弧长度
    
    // 构造线段点
    const pts = []
    
    // 左上
    pts.push(new THREE.Vector3(-w, h - s, 0))
    pts.push(new THREE.Vector3(-w, h, 0))
    pts.push(new THREE.Vector3(-w + s, h, 0))
    
    // 右上
    pts.push(new THREE.Vector3(w - s, h, 0))
    pts.push(new THREE.Vector3(w, h, 0))
    pts.push(new THREE.Vector3(w, h - s, 0))
    
    // 右下
    pts.push(new THREE.Vector3(w, -h + s, 0))
    pts.push(new THREE.Vector3(w, -h, 0))
    pts.push(new THREE.Vector3(w - s, -h, 0))
    
    // 左下
    pts.push(new THREE.Vector3(-w + s, -h, 0))
    pts.push(new THREE.Vector3(-w, -h, 0))
    pts.push(new THREE.Vector3(-w, -h + s, 0))
    
    return pts
  }, [width, height])
  
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#00ffff" transparent opacity={0.6} />
    </lineSegments>
  )
}

function RealImageDisplay({ url, show }: { url: string, show: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<any>(null!)
  const groupRef = useRef<THREE.Group>(null!)
  const texture = useTexture(encodeURI(url))
  
  // 保持纹理比例
  const aspect = texture.image ? texture.image.width / texture.image.height : 1
  // 限制最大宽高，避免过长
  const maxWidth = 12
  const maxHeight = 8
  
  let width = maxWidth
  let height = width / aspect
  
  if (height > maxHeight) {
    height = maxHeight
    width = height * aspect
  }
  
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.getElapsedTime()
      
      const targetOpacity = show ? 1 : 0
      const speed = show ? 1.5 : 3.0
      materialRef.current.uOpacity = THREE.MathUtils.lerp(materialRef.current.uOpacity, targetOpacity, delta * speed)
      
      groupRef.current.visible = materialRef.current.uOpacity > 0.01
    }
  })

  return (
    <group ref={groupRef}>
      {/* 背景遮罩：半透明黑底，遮挡星星 */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[width + 0.2, height + 0.2]} />
        <meshBasicMaterial color="black" transparent opacity={0.8} />
      </mesh>
      
      {/* 全息照片主体 */}
      <mesh ref={meshRef}>
        <planeGeometry args={[width, height]} />
        {/* @ts-ignore */}
        <holographicMaterial 
          ref={materialRef} 
          uTexture={texture} 
          transparent 
          depthWrite={true} 
          blending={THREE.NormalBlending} 
        />
      </mesh>
      
      {/* 装饰性边框 */}
      {show && (
        <group position={[0, 0, 0.02]}>
          <CornerBrackets width={width + 0.5} height={height + 0.5} />
        </group>
      )}
    </group>
  )
}

export function ParticleDisplay() {
  const activeMemoryId = useStore(state => state.activeMemoryId)
  const [displayId, setDisplayId] = useState<number | null>(null)
  const [isExiting, setIsExiting] = useState(false)
  const [showRealImage, setShowRealImage] = useState(false)
  
  useEffect(() => {
    // 如果 activeMemoryId 变了，且不等于当前显示的
    if (activeMemoryId !== displayId) {
      if (displayId !== null && activeMemoryId !== null) {
        // 1. 切换图片：先隐藏真实图片，再粒子散开
        setShowRealImage(false)
        setIsExiting(true)
        
        const timer = setTimeout(() => {
          setIsExiting(false)
          setDisplayId(activeMemoryId)
          // 2. 新图片粒子聚拢后，显示真实图片
          // 粒子聚拢大概需要 1.0s (speed 1.5)，我们在 0.8s 时开始淡入图片
          setTimeout(() => setShowRealImage(true), 800)
        }, 1200) // 等待退出动画完成
        
        return () => clearTimeout(timer)
      } else if (activeMemoryId === null) {
        // 关闭显示
        setShowRealImage(false)
        setIsExiting(true)
        const timer = setTimeout(() => {
           setDisplayId(null)
           setIsExiting(false)
        }, 1200)
        return () => clearTimeout(timer)
      } else {
        // 第一次显示
        setDisplayId(activeMemoryId)
        setIsExiting(false)
        setTimeout(() => setShowRealImage(true), 800)
      }
    }
  }, [activeMemoryId, displayId])

  const activeMemory = MEMORY_DATA.find(m => m.id === displayId)
  if (!activeMemory) return null

  return (
    <group position={[0, 0, 0]}>
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        {/* 粒子层：负责过渡动画 */}
        <ParticleImage 
          key={`p-${activeMemory.imageUrl}`} 
          url={activeMemory.imageUrl} 
          isExiting={isExiting} 
        />
        
        {/* 真实图片层：负责高清展示，稍微靠前一点避免 z-fighting */}
        <group position={[0, 0, 0.05]}>
          <RealImageDisplay 
            key={`img-${activeMemory.imageUrl}`}
            url={activeMemory.imageUrl}
            show={showRealImage}
          />
        </group>
      </Billboard>
    </group>
  )
}
