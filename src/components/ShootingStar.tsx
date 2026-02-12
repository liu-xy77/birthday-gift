import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'

// --- 流星许愿系统 (Shooting Star System) ---
export function ShootingStar() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [active, setActive] = useState(false)
  const [startPos, setStartPos] = useState(new THREE.Vector3())
  const [endPos, setEndPos] = useState(new THREE.Vector3())
  const progress = useRef(0)
  
  // 监听双击事件发射流星
  useEffect(() => {
    const handleDblClick = () => {
      if (active) return
      
      // 随机起点 (上方)
      const start = new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        20,
        (Math.random() - 0.5) * 20 - 10
      )
      // 随机终点 (下方)
      const end = new THREE.Vector3(
        start.x + (Math.random() - 0.5) * 20,
        -10,
        start.z + (Math.random() - 0.5) * 20
      )
      
      setStartPos(start)
      setEndPos(end)
      progress.current = 0
      setActive(true)
    }
    
    window.addEventListener('dblclick', handleDblClick)
    return () => window.removeEventListener('dblclick', handleDblClick)
  }, [active])
  
  useFrame((_state, delta) => {
    if (active && meshRef.current) {
      progress.current += delta * 1.5 // 飞行速度
      
      if (progress.current >= 1) {
        setActive(false)
        progress.current = 0
      } else {
        const p = progress.current
        meshRef.current.position.lerpVectors(startPos, endPos, p)
      }
    }
  })

  if (!active) return null

  return (
    <Trail width={2} length={8} color={new THREE.Color('#ff0055')} attenuation={(t) => t * t}>
      <mesh ref={meshRef} position={startPos}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </Trail>
  )
}
