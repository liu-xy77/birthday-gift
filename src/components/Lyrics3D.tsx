import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { useStore, audioData } from '../store'

// 工具：生成歌词纹理
function createLyricTexture(text: string): { texture: THREE.CanvasTexture, aspect: number } {
  const canvas = document.createElement('canvas')
  // 足够宽以容纳长歌词，高度适中
  canvas.width = 1024
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  
  // 绘制背景 (透明)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 文字样式
  // 使用 Cinzel 或系统衬线体，加粗以增加粒子密度
  ctx.font = 'bold 60px "Cinzel", "Times New Roman", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'white'
  
  // 绘制文字
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)
  
  // 稍微裁剪一下透明区域，计算有效内容的宽高比会更好，但这里简单起见使用 canvas 比例
  // 为了让粒子更集中，我们可以测量文字宽度
  const metrics = ctx.measureText(text)
  const textWidth = metrics.width
  // 估算宽高比 (稍微留点余量)
  const aspect = Math.max(2, textWidth / 60) // 假设字号60是高度基准
  
  return { texture: new THREE.CanvasTexture(canvas), aspect }
}

// 歌词粒子组件
function ParticleLyric({ text, isExiting }: { text: string, isExiting: boolean }) {
  const materialRef = useRef<any>()
  const { viewport } = useThree()
  
  const { texture, aspect } = useMemo(() => createLyricTexture(text), [text])
  
  // 歌词尺寸：高度固定为 1.5，宽度自适应
  const height = 1.5
  const width = height * aspect

  const geometry = useMemo(() => {
    // 歌词粒子不需要像照片那么高密度，128x128 足够 (1.6w)
    // 或者是 256x64 ? 适应长条形
    const segW = 200
    const segH = 40
    const geo = new THREE.PlaneGeometry(width, height, segW, segH)
    
    const count = geo.attributes.position.count
    const randomPos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // 随机散开范围稍大一些
      const theta = Math.random() * Math.PI * 2
      const r = 10 + Math.random() * 5
      randomPos[i * 3] = r * Math.cos(theta)
      randomPos[i * 3 + 1] = (Math.random() - 0.5) * 10
      randomPos[i * 3 + 2] = r * Math.sin(theta)
    }
    geo.setAttribute('aRandomPos', new THREE.BufferAttribute(randomPos, 3))
    return geo
  }, [width, height])
  
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.getElapsedTime()
      materialRef.current.uDpr = viewport.dpr
      
      // 读取高频能量 (Treble) 驱动粒子闪烁
      materialRef.current.uAudio = audioData.current.treble
      
      const target = isExiting ? 0 : 1
      const speed = isExiting ? 2.5 : 1.2 // 歌词出现慢一点，消失快一点
      materialRef.current.uProgress = THREE.MathUtils.lerp(materialRef.current.uProgress, target, delta * speed)
    }
  })

  return (
    <points geometry={geometry}>
      {/* 复用 ParticleMaterial */}
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

// 全息歌词组件
function HolographicLyric({ text, show }: { text: string, show: boolean }) {
  const materialRef = useRef<any>(null!)
  const groupRef = useRef<THREE.Group>(null!)
  
  const { texture, aspect } = useMemo(() => createLyricTexture(text), [text])
  const height = 1.5
  const width = height * aspect
  
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.getElapsedTime()
      
      const targetOpacity = show ? 1 : 0
      const speed = show ? 1.0 : 3.0
      materialRef.current.uOpacity = THREE.MathUtils.lerp(materialRef.current.uOpacity, targetOpacity, delta * speed)
      
      groupRef.current.visible = materialRef.current.uOpacity > 0.01
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <planeGeometry args={[width, height]} />
        {/* 复用 HolographicMaterial */}
        {/* @ts-ignore */}
        <holographicMaterial 
          ref={materialRef} 
          uTexture={texture} 
          transparent 
          depthWrite={false} // 歌词不遮挡
          blending={THREE.AdditiveBlending} // 歌词用发光混合更好看
          uColor={new THREE.Color('#ffffff')}
        />
      </mesh>
      {/* 倒影 */}
      <mesh position={[0, -height*0.8, 0]} scale={[1, -1, 1]} rotation={[0.1, 0, 0]}>
         <planeGeometry args={[width, height]} />
         {/* @ts-ignore */}
         <holographicMaterial 
           uTexture={texture}
           transparent
           uOpacity={0.2} // 倒影更淡
           blending={THREE.AdditiveBlending}
           uColor={new THREE.Color('#00ffff')}
         />
      </mesh>
    </group>
  )
}

export function Lyrics3D() {
  const currentLyric = useStore(state => state.currentLyric)
  const phase = useStore(state => state.phase)
  
  // 状态管理
  const [displayLyric, setDisplayLyric] = useState('')
  const [isExiting, setIsExiting] = useState(false)
  const [showHologram, setShowHologram] = useState(false)
  
  useEffect(() => {
    if (phase === 'PRE_LIMINAL') return

    if (currentLyric !== displayLyric) {
      if (displayLyric) {
        // 1. 旧歌词：隐藏全息 -> 粒子散开
        setShowHologram(false)
        setIsExiting(true)
        
        const timer = setTimeout(() => {
          setIsExiting(false)
          setDisplayLyric(currentLyric)
          // 2. 新歌词：粒子聚拢 -> 显示全息
          if (currentLyric) {
             setTimeout(() => setShowHologram(true), 1000)
          }
        }, 800) // 等待散开动画
        return () => clearTimeout(timer)
      } else {
        // 第一次显示
        setDisplayLyric(currentLyric)
        setIsExiting(false)
        if (currentLyric) {
           setTimeout(() => setShowHologram(true), 1000)
        }
      }
    }
  }, [currentLyric, displayLyric, phase])

  if (phase === 'PRE_LIMINAL' || !displayLyric) return null

  return (
    <group position={[0, -3.5, 5]}> 
      {/* 放在八音盒下方，靠近相机 */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
         <ParticleLyric 
           key={`pl-${displayLyric}`} 
           text={displayLyric} 
           isExiting={isExiting} 
         />
         <group position={[0, 0, 0.02]}>
           <HolographicLyric 
             key={`hl-${displayLyric}`}
             text={displayLyric}
             show={showHologram}
           />
         </group>
      </Billboard>
    </group>
  )
}
