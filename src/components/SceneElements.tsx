import { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial, Sparkles, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'

// --- 鼠标拖尾特效 (Mouse Trail) ---
export function MouseTrail() {
  const count = 30
  const meshes = useRef<THREE.Group[]>([])
  const data = useRef<{life: number, dx: number, dy: number, dz: number}[]>(
    Array.from({ length: count }, () => ({ life: 0, dx: 0, dy: 0, dz: 0 }))
  )
  const currentIdx = useRef(0)
  const lastPos = useRef(new THREE.Vector3())
  const { mouse, camera } = useThree()

  useFrame((_state, delta) => {
    // 1. 计算鼠标在 3D 空间的位置 (距离相机 10 单位)
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5)
    vector.unproject(camera)
    const dir = vector.sub(camera.position).normalize()
    const distance = 10
    const pos = camera.position.clone().add(dir.multiplyScalar(distance))

    // 2. 生成新粒子 (当移动距离超过阈值)
    if (pos.distanceTo(lastPos.current) > 0.1) {
      const idx = currentIdx.current
      const group = meshes.current[idx]
      if (group) {
        group.position.copy(pos)
        group.scale.setScalar(1)
        group.visible = true
        
        // 随机显示一种形状
        const shapeType = Math.floor(Math.random() * 3)
        group.children.forEach((child, i) => child.visible = i === shapeType)

        // 随机颜色
        const colors = ['#00ffff', '#bd00ff', '#ff0055', '#ffffff']
        const color = colors[Math.floor(Math.random() * colors.length)]
        group.children.forEach(c => {
          if ((c as THREE.Mesh).material) {
            ((c as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(color);
            ((c as THREE.Mesh).material as THREE.MeshStandardMaterial).emissive.set(color);
          }
        })
      }

      // 初始化运动数据
      data.current[idx] = { 
        life: 1.0, 
        dx: (Math.random()-0.5)*0.05, 
        dy: (Math.random()-0.5)*0.05,
        dz: (Math.random()-0.5)*0.05
      }

      currentIdx.current = (currentIdx.current + 1) % count
      lastPos.current.copy(pos)
    }

    // 3. 更新所有粒子
    for (let i=0; i<count; i++) {
      const d = data.current[i]
      const group = meshes.current[i]
      if (group && group.visible) {
        if (d.life > 0) {
          d.life -= delta * 2.5 // 消失速度
          group.scale.setScalar(d.life * 0.5) // 基础大小缩小
          group.rotation.x += delta * 2
          group.rotation.y += delta * 2
          group.position.x += d.dx
          group.position.y += d.dy
          group.position.z += d.dz
        } else {
          group.visible = false
        }
      }
    }
  })

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <group key={i} ref={el => meshes.current[i] = el!} visible={false}>
          {/* 形状 1: 球体 (Quantum) */}
          <mesh visible={false}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial emissiveIntensity={2} toneMapped={false} />
          </mesh>
          {/* 形状 2: 立方体 (Crystal) */}
          <mesh visible={false}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial emissiveIntensity={2} toneMapped={false} />
          </mesh>
          {/* 形状 3: 八面体 (Spark) */}
          <mesh visible={false}>
            <octahedronGeometry args={[0.25, 0]} />
            <meshStandardMaterial emissiveIntensity={2} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// --- 记忆粒子连接线 ---
export function MemoryConnections({ particles }: { particles: { pos: [number, number, number] }[] }) {
  const lineRef = useRef<THREE.LineSegments>(null!)
  const activeMemoryId = useStore(state => state.activeMemoryId)
  
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        if (Math.random() > 0.8) { // 随机连接
          pts.push(new THREE.Vector3(...particles[i].pos))
          pts.push(new THREE.Vector3(...particles[j].pos))
        }
      }
    }
    return pts
  }, [particles])

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  useFrame((state) => {
    if (lineRef.current) {
      const t = state.clock.getElapsedTime()
      const mat = lineRef.current.material as THREE.LineBasicMaterial
      
      // 基础透明度动画
      let targetOpacity = 0.1 + Math.sin(t) * 0.05
      
      // 如果有激活的记忆，透明度降为 0
      if (activeMemoryId) {
        targetOpacity = 0
      }
      
      // 平滑过渡
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.1)
      mat.transparent = true // 确保开启透明
      mat.depthWrite = !activeMemoryId // 当不可见时关闭深度写入，避免潜在遮挡
    }
  })

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color="#00ffff" transparent opacity={0.1} />
    </lineSegments>
  )
}

// --- 时间晶体 (Time Crystal) ---
export function TimeCrystal() {
  const meshRef = useRef<THREE.Group>(null!)
  const setGameActive = useStore(state => state.setGameActive)
  const isGameActive = useStore(state => state.isGameActive)
  const [hovered, setHover] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.rotation.z += 0.005
      const s = (isGameActive ? 2.5 : 1.5) + Math.sin(state.clock.getElapsedTime() * 2) * 0.1
      meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1)
    }
  })

  return (
    <group 
      ref={meshRef} 
      onClick={() => setGameActive(true)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* 核心几何体：正二十面体 */}
      <mesh>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={hovered ? "#00ffff" : "#ffffff"} 
          emissive="#00ffff" 
          emissiveIntensity={hovered ? 5 : 2} 
          wireframe
        />
      </mesh>
      {/* 内部发光球 */}
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <MeshDistortMaterial 
          color="#bd00ff" 
          speed={5} 
          distort={0.5} 
          radius={1}
          emissive="#bd00ff"
          emissiveIntensity={hovered ? 10 : 5}
          toneMapped={false}
        />
      </mesh>
      <Sparkles count={100} scale={2} size={4} speed={2} color="#00ffff" />
      
      {/* 交互提示 */}
      {!isGameActive && hovered && (
        <Html position={[0, 1.5, 0]} center>
          <div style={{
            color: '#00ffff',
            background: 'rgba(0,0,0,0.8)',
            padding: '5px 15px',
            border: '1px solid #00ffff',
            whiteSpace: 'nowrap',
            fontSize: '12px',
            letterSpacing: '2px',
            pointerEvents: 'none'
          }}>
            TOUCH TO SYNC
          </div>
        </Html>
      )}
    </group>
  )
}

// --- 粒子态：量子云与结晶 (Particle States) ---
export function MemoryParticle({ id, initialPos }: { id: number, initialPos: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null!)
  const [hovered, setHover] = useState(false)
  const setActiveMemoryId = useStore(state => state.setActiveMemoryId)
  
  useFrame((stateContext) => {
    const t = stateContext.clock.getElapsedTime()
    if (meshRef.current) {
      // 简单的浮动动画，保留原始位置作为基准
      meshRef.current.position.y = initialPos[1] + Math.sin(t + id * 0.1) * 0.2
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <group 
      ref={meshRef} 
      position={initialPos}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation()
        setActiveMemoryId(id)
      }}
    >
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#ff0055" : "#00ffff"} 
          emissive={hovered ? "#ff0055" : "#00ffff"} 
          emissiveIntensity={hovered ? 5 : 2}
          toneMapped={false}
        />
      </mesh>
      {hovered && (
         <Sparkles count={10} scale={2} size={2} speed={1} color="#ffffff" />
      )}
    </group>
  )
}
