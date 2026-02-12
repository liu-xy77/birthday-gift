import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Unlock, Stars } from 'lucide-react'

const PASSPHRASE = "0210" // 默认暗号，可修改

export function Gatekeeper({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)

  // 检查 localStorage
  useEffect(() => {
    const savedAuth = localStorage.getItem('stargate_auth')
    if (savedAuth === 'granted') {
      setIsUnlocked(true)
      onUnlock()
    }
  }, [onUnlock])

  const handleUnlock = () => {
    if (input === PASSPHRASE) {
      setIsUnlocked(true)
      localStorage.setItem('stargate_auth', 'granted')
      // 播放解锁音效或动画
      setTimeout(onUnlock, 1500) // 等待开门动画
    } else {
      setError(true)
      setTimeout(() => setError(false), 500)
    }
  }

  if (isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'black',
          zIndex: 9999,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <motion.div
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 20, opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeIn" }}
          style={{
            color: '#00ffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Unlock size={64} />
          <p style={{ marginTop: 20, letterSpacing: '8px', fontFamily: '"Cinzel", serif' }}>ACCESS GRANTED</p>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'black',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: '"Cinzel", serif'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at center, #0a0a1a 0%, #000000 100%)',
        opacity: 0.8
      }} />
      
      {/* 装饰性背景 */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: Math.random()
            }}
            animate={{ 
              y: [null, Math.random() * window.innerHeight],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              background: 'white',
              borderRadius: '50%'
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ zIndex: 1, textAlign: 'center', width: '100%', maxWidth: '400px', padding: '0 20px' }}
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ marginBottom: '40px', display: 'inline-block' }}
        >
          <Stars size={48} color="#00ffff" style={{ filter: 'drop-shadow(0 0 10px #00ffff)' }} />
        </motion.div>

        <h1 style={{ 
          fontSize: '1.5rem', 
          letterSpacing: '8px', 
          fontWeight: 200, 
          marginBottom: '10px',
          color: '#ffffff'
        }}>
          STAR GATE
        </h1>
        <p style={{ 
          fontSize: '0.8rem', 
          letterSpacing: '4px', 
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '50px' 
        }}>
          请输入暗号开启记忆之门
        </p>

        <div style={{ position: 'relative' }}>
          <input
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setError(false)
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            placeholder="PASSPHRASE"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${error ? '#ff0055' : 'rgba(0,255,255,0.3)'}`,
              borderRadius: '4px',
              padding: '15px',
              color: '#00ffff',
              fontSize: '1.2rem',
              letterSpacing: '4px',
              textAlign: 'center',
              outline: 'none',
              transition: 'all 0.3s'
            }}
          />
          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '100%',
                  marginTop: '10px',
                  color: '#ff0055',
                  fontSize: '0.8rem',
                  letterSpacing: '2px'
                }}
              >
                ACCESS DENIED
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, background: 'rgba(0,255,255,0.2)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUnlock}
          style={{
            marginTop: '30px',
            background: 'rgba(0,255,255,0.1)',
            border: '1px solid #00ffff',
            color: '#00ffff',
            padding: '12px 40px',
            borderRadius: '30px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            letterSpacing: '4px',
            transition: 'all 0.3s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={14} />
            <span>UNLOCK</span>
          </div>
        </motion.button>
      </motion.div>
    </div>
  )
}
