import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'

// --- 星际漂流瓶 (Message Bottle) ---
export function MessageBottle() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [inputText, setInputText] = useState('')
  const bottleRef = useRef<THREE.Group>(null!)
  const setIsInputFocused = useStore(state => state.setIsInputFocused)
  
  // 加载留言
  useEffect(() => {
    const saved = localStorage.getItem('star_messages')
    if (saved) {
      setMessages(JSON.parse(saved))
    } else {
      setMessages(["Welcome to the universe!", "Happy Birthday!"])
    }
  }, [])
  
  const handleSend = () => {
    if (!inputText.trim()) return
    const newMsgs = [...messages, inputText]
    setMessages(newMsgs)
    localStorage.setItem('star_messages', JSON.stringify(newMsgs))
    setInputText('')
  }
  
  useFrame((state) => {
    if (bottleRef.current) {
      // 漂浮动画
      bottleRef.current.position.y = -5 + Math.sin(state.clock.getElapsedTime()) * 0.5
      bottleRef.current.rotation.y += 0.01
      bottleRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1
    }
  })

  return (
    <>
      <group 
        ref={bottleRef} 
        position={[8, -5, 0]} 
        onClick={(e) => { e.stopPropagation(); setIsOpen(true) }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        {/* 瓶身 */}
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 1.2, 16]} />
          <meshPhysicalMaterial 
            color="#aaddff" 
            transmission={0.8} 
            thickness={0.5} 
            roughness={0.1} 
            clearcoat={1}
          />
        </mesh>
        {/* 瓶颈 */}
        <mesh position={[0, 0.7, 0]}>
           <cylinderGeometry args={[0.1, 0.3, 0.4, 16]} />
           <meshPhysicalMaterial color="#aaddff" transmission={0.8} thickness={0.5} />
        </mesh>
        {/* 瓶塞 */}
        <mesh position={[0, 0.95, 0]}>
           <cylinderGeometry args={[0.12, 0.1, 0.2, 16]} />
           <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* 内部发光信纸 */}
        <mesh position={[0, 0, 0]}>
           <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
           <meshBasicMaterial color="#ffffaa" />
        </mesh>
        <Sparkles count={10} scale={2} size={2} speed={0.5} color="#ffff00" />
      </group>

      {/* 留言板 UI */}
      {isOpen && (
        <Html position={[0, 0, 0]} center>
          <div style={{
            width: '400px',
            height: '500px',
            background: 'rgba(0, 20, 40, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            color: 'white',
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)',
            fontFamily: '"Cinzel", serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#00ffff' }}>Star Messages</h3>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false) }}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
              >✕</button>
            </div>
            
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              marginBottom: '20px',
              paddingRight: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  {msg}
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onKeyDown={(e) => {
                  e.stopPropagation() // 阻止冒泡到 Canvas
                  // e.nativeEvent.stopImmediatePropagation() // 确保阻止所有其他监听器
                }}
                onKeyUp={(e) => e.stopPropagation()} // 同时阻止 KeyUp
                onPointerDown={(e) => e.stopPropagation()} // 阻止鼠标点击穿透到 Canvas
                placeholder="Write a wish..."
                style={{
                  flex: 1,
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  color: 'white',
                  padding: '8px',
                  outline: 'none'
                }}
              />
              <button 
                onClick={handleSend}
                style={{
                  background: '#00ffff',
                  color: 'black',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </Html>
      )}
    </>
  )
}
