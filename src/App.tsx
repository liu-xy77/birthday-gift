import { useState } from 'react'
import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Sparkles, PerspectiveCamera, Environment, Html } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'

import { useStore } from './store'
import { MEMORY_DATA } from './data/memories'
import { ParticleMaterial, HolographicMaterial } from './materials/shaders'

import { Gatekeeper } from './components/Gatekeeper'
import { RitualUI } from './components/RitualUI'
import { LyricsUI } from './components/LyricsUI'
import { AudioController } from './components/AudioController'
import { ParticleDisplay } from './components/MemoryDisplay'
import { ShootingStar } from './components/ShootingStar'
import { MessageBottle } from './components/MessageBottle'
import { CosmicMusicBox } from './components/CosmicMusicBox'
import { MouseTrail, MemoryConnections, TimeCrystal, MemoryParticle } from './components/SceneElements'

// Register shaders
extend({ ParticleMaterial, HolographicMaterial })

// --- 场景容器 ---
function LiminalScene() {
  const phase = useStore((state) => state.phase)
  const isInputFocused = useStore(state => state.isInputFocused)
  
  const particles = useMemo(() => 
    MEMORY_DATA.map((m, i) => {
      // 斐波那契球形分布
      const count = MEMORY_DATA.length
      const radius = 18 
      const phi = Math.acos(1 - 2 * (i + 0.5) / count)
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5)
      
      return {
        ...m,
        pos: [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        ] as [number, number, number]
      }
    })
  , [])

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 30]} />
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <MouseTrail />
      
      <Suspense fallback={null}>
        <ParticleDisplay />
      </Suspense>

      <ShootingStar />
      <MessageBottle />

      {phase === 'LIMINAL' && (
        <Suspense fallback={
          <Html center>
            <div style={{ color: 'white', letterSpacing: '4px' }}>Loading Universe...</div>
          </Html>
        }>
          <CosmicMusicBox />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Sparkles count={200} scale={20} size={2} speed={0.3} />
          
          <MemoryConnections particles={particles} />
          
          {particles.map((p) => (
            <MemoryParticle 
              key={p.id} 
              id={p.id} 
              initialPos={p.pos} 
            />
          ))}
        </Suspense>
      )}

      {phase === 'POST_LIMINAL' && (
        <Suspense fallback={null}>
          <TimeCrystal />
          <Stars radius={50} depth={20} count={1000} factor={2} saturation={1} fade speed={0.5} />
          <Environment preset="city" />
        </Suspense>
      )}
          
      <OrbitControls 
        enabled={!isInputFocused} // 输入时完全禁用控制器
        enablePan={false} 
        autoRotate={phase === 'LIMINAL' && !isInputFocused} 
        autoRotateSpeed={0.2}
        maxDistance={40}
        minDistance={3}
      />
      
      <EffectComposer enabled={false}>
        <Bloom luminanceThreshold={1} mipmapBlur intensity={1.2} />
        <ChromaticAberration 
          offset={new THREE.Vector2(0.002, 0.002)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  )
}

export default function App() {
  const [isGateOpen, setIsGateOpen] = useState(false)

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <Gatekeeper onUnlock={() => setIsGateOpen(true)} />
      
      {isGateOpen && (
        <>
          <RitualUI />
          <AudioController />
          <LyricsUI />
          
          <Canvas dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} />
            <LiminalScene />
          </Canvas>
        </>
      )}
    </div>
  )
}
