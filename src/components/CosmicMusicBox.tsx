import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { useStore, audioData } from '../store'

// --- 星际八音盒机芯 (Cosmic Music Box Core) ---
export function CosmicMusicBox() {
  const meshRef = useRef<THREE.Group>(null!)
  const cylinderRef = useRef<THREE.Mesh>(null!)
  const windingLevel = useStore((state) => state.windingLevel)
  const activeMemoryId = useStore(state => state.activeMemoryId)
  
  // 生成滚筒上的随机音符凸起位置
  const notePositions = useMemo(() => {
    const pos = []
    for(let i=0; i<40; i++) {
      const angle = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 3
      // 位于圆柱表面: x = r*cos, z = r*sin
      pos.push({ x: Math.cos(angle)*0.8, y, z: Math.sin(angle)*0.8, angle })
    }
    return pos.sort((a, b) => a.y - b.y) // 按高度排序，模拟音阶
  }, [])

  // 引用底座光环，用于音频可视化
  const ringRef = useRef<THREE.Mesh>(null!)
  const innerRingRef = useRef<THREE.Mesh>(null!)

  useFrame((state, delta) => {
    if (meshRef.current) {
      // 整体呼吸浮动
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1
      
      // 滚筒旋转：速度取决于上发条的程度
      if (cylinderRef.current) {
         cylinderRef.current.rotation.y += delta * (0.1 + windingLevel * 2.0)
      }
      
      // 音频律动：底座光环随 Bass 缩放
      if (ringRef.current) {
        const bass = audioData.current.bass
        // 基础大小 1.5，随 bass 增加到 2.0
        const scale = 1.5 + bass * 0.5
        ringRef.current.scale.lerp(new THREE.Vector3(scale, scale, 1), 0.2)
        // 透明度随能量闪烁
        const mat = ringRef.current.material as THREE.MeshBasicMaterial
        mat.opacity = 0.3 + bass * 0.4
      }
      
      if (innerRingRef.current) {
        const mid = audioData.current.mid
        innerRingRef.current.rotation.z -= delta * (1 + mid * 5) // 转速随中频加快
      }

      // 如果有激活的记忆，缩小至消失，给照片腾出空间
      const targetScale = activeMemoryId ? 0 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  return (
    <group ref={meshRef}>
      {/* 1. 核心滚筒 (Cylinder) */}
      <group>
        <mesh ref={cylinderRef}>
          <cylinderGeometry args={[0.8, 0.8, 3.5, 32]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.9} 
            roughness={0.2} 
            emissive="#bd00ff"
            emissiveIntensity={0.2}
          />
          
          {/* 滚筒上的音符凸起 */}
          {notePositions.map((pos, i) => (
            <mesh key={i} position={[pos.x, pos.y, pos.z]} rotation={[0, -pos.angle, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial 
                color="#00ffff" 
                emissive="#00ffff" 
                emissiveIntensity={2} 
                toneMapped={false}
              />
            </mesh>
          ))}
        </mesh>
        
        {/* 内部发光芯 */}
        <mesh>
           <cylinderGeometry args={[0.5, 0.5, 3.6, 16]} />
           <meshBasicMaterial color="#bd00ff" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* 2. 音梳 (Comb) - 悬浮在滚筒一侧 */}
      <group position={[1.2, 0, 0]}>
        {/* 梳背 */}
        <mesh position={[0.2, 0, 0]}>
          <boxGeometry args={[0.4, 3.8, 0.5]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* 梳齿 */}
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i} position={[-0.3, (i - 5.5) * 0.25, 0]} rotation={[0, 0, 0.1]}>
             <boxGeometry args={[0.8, 0.05, 0.1]} />
             <meshStandardMaterial 
               color="#ffffff" 
               emissive="#ffffff"
               emissiveIntensity={0.5}
               metalness={1} 
               roughness={0.1} 
             />
          </mesh>
        ))}
      </group>

      {/* 3. 装饰性光环底座 */}
      <group position={[0, -2.2, 0]}>
        <mesh ref={ringRef} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[1.5, 1.6, 64]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={innerRingRef} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[0, 1.5, 64]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <Sparkles count={20} scale={3} size={2} speed={0.4} color="#bd00ff" />
      </group>
      
      {/* 顶部装饰 */}
      <group position={[0, 2.2, 0]}>
         <mesh>
           <octahedronGeometry args={[0.4, 0]} />
           <MeshDistortMaterial color="#00ffff" speed={2} distort={0.6} emissive="#00ffff" emissiveIntensity={2} />
         </mesh>
      </group>

    </group>
  )
}
