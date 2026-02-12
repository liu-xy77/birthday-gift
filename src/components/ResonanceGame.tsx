import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'

// --- 双人共鸣小游戏 (Resonance Mini-game) ---
export function ResonanceGame({ onComplete }: { onComplete: () => void }) {
  const [freq1, setFreq1] = useState(0.2)
  const [freq2, setFreq2] = useState(0.8)
  const [target] = useState(0.5)
  const [progress, setProgress] = useState(0)
  const [isResonating, setIsResonating] = useState(false)
  const [showEasterEgg, setShowEasterEgg] = useState(false)

  useEffect(() => {
    // 检查两个频率是否都接近目标频率，且彼此接近
    const diff1 = Math.abs(freq1 - target)
    const diff2 = Math.abs(freq2 - target)
    const synergy = Math.abs(freq1 - freq2)
    
    // 降低难度：
    // 1. 单人偏差容忍度从 0.05 -> 0.15 (更容易对准中心)
    // 2. 两人同步容忍度从 0.08 -> 0.25 (不需要两人完全一致)
    if (diff1 < 0.15 && diff2 < 0.15 && synergy < 0.25) {
      setIsResonating(true)
      const timer = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(timer)
            // 触发彩蛋而不是直接完成
            setShowEasterEgg(true)
            return 100
          }
          // 加快进度增长：每次 +2 (约1.5秒即可通关)
          return p + 2
        })
      }, 30)
      return () => clearInterval(timer)
    } else {
      setIsResonating(false)
      setProgress(0)
    }
  }, [freq1, freq2, target]) // 移除 onComplete 依赖，避免循环调用

  // 彩蛋计时器
  useEffect(() => {
    if (showEasterEgg) {
      console.log("Easter Egg Triggered!")
      const timer = setTimeout(() => {
        onComplete()
      }, 6000) // 展示 6 秒
      return () => clearTimeout(timer)
    }
  }, [showEasterEgg, onComplete])

  // --- 彩蛋视图 (独立渲染，避免遮挡) ---
  if (showEasterEgg) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999, // 确保最高层级
          background: 'black', // 纯黑背景
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 中心跳动的心 */}
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            filter: [
              'drop-shadow(0 0 20px #ff0055)',
              'drop-shadow(0 0 60px #ff0055)', 
              'drop-shadow(0 0 20px #ff0055)'
            ]
          }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        >
          <Heart size={150} fill="#ff0055" color="#ff0055" strokeWidth={0} />
        </motion.div>

        {/* 环绕粒子 */}
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0],
              x: Math.cos(i * 22.5 * (Math.PI / 180)) * 200,
              y: Math.sin(i * 22.5 * (Math.PI / 180)) * 200,
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.1,
              ease: "easeOut" 
            }}
            style={{ position: 'absolute' }}
          >
            <Sparkles size={30} color={i % 2 === 0 ? "#00ffff" : "#bd00ff"} />
          </motion.div>
        ))}

        {/* 文字 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', marginTop: '80px', zIndex: 10 }}
        >
          <h2 style={{ 
            fontSize: '3rem', 
            color: '#fff', 
            letterSpacing: '10px',
            marginBottom: '20px',
            textShadow: '0 0 20px rgba(255,0,85,0.5)',
            fontFamily: '"Cinzel", serif'
          }}>
            SOUL RESONANCE
          </h2>
          <p style={{ 
            fontSize: '1.5rem', 
            color: '#00ffff', 
            letterSpacing: '5px',
            opacity: 0.9 
          }}>
            灵魂共鸣 · 此刻永恒
          </p>
        </motion.div>
      </motion.div>
    )
  }

  // --- 游戏主视图 ---
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ letterSpacing: '12px', fontWeight: 200, color: '#00ffff' }}>双人灵魂共鸣</h2>
        <p style={{ opacity: 0.4, fontSize: '0.8rem', letterSpacing: '2px' }}>需要两个人同时调整频率，在中心点汇合</p>
      </div>
      
      <div style={{ position: 'relative', width: '350px', height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* 目标中心 */}
        <div style={{
          position: 'absolute',
          width: '4px',
          height: '4px',
          background: '#00ffff',
          borderRadius: '50%',
          boxShadow: '0 0 20px #00ffff'
        }} />
        
        {/* 玩家 1 环 (左侧输入) */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          style={{
            position: 'absolute',
            width: `${freq1 * 400}px`,
            height: `${freq1 * 400}px`,
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          }}
        />
        
        {/* 玩家 2 环 (右侧输入) */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: -360 }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
          style={{
            position: 'absolute',
            width: `${freq2 * 400}px`,
            height: `${freq2 * 400}px`,
            border: '1px solid rgba(189, 0, 255, 0.3)',
            borderRadius: '60% 40% 30% 70% / 50% 60% 50% 40%',
          }}
        />

        {/* 共鸣发生时的光晕 */}
        {isResonating && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.3 }}
            style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, #00ffff 0%, transparent 70%)',
              borderRadius: '50%'
            }}
          />
        )}
      </div>

      <div style={{ display: 'flex', gap: '100px', marginTop: '50px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#00ffff', marginBottom: '10px', letterSpacing: '1px' }}>PLAYER A</div>
          <input 
            type="range" min="0.1" max="1" step="0.01" 
            value={freq1} onChange={(e) => setFreq1(parseFloat(e.target.value))}
            style={{ width: '150px', accentColor: '#00ffff' }}
          />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#bd00ff', marginBottom: '10px', letterSpacing: '1px' }}>PLAYER B</div>
          <input 
            type="range" min="0.1" max="1" step="0.01" 
            value={freq2} onChange={(e) => setFreq2(parseFloat(e.target.value))}
            style={{ width: '150px', accentColor: '#bd00ff' }}
          />
        </div>
      </div>

      <div style={{ marginTop: '40px', height: '60px' }}>
        {isResonating ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#00ffff', fontSize: '14px', letterSpacing: '4px', marginBottom: '10px' }}>
              RESONATING {progress}%
            </div>
            <div style={{ width: '300px', height: '2px', background: 'rgba(255,255,255,0.1)' }}>
              <motion.div style={{ width: `${progress}%`, height: '100%', background: '#00ffff' }} />
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '12px', opacity: 0.3, letterSpacing: '2px' }}>寻找频率的交点...</p>
        )}
      </div>
    </motion.div>
  )
}
