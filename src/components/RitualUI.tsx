import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Heart, Wind } from 'lucide-react'
import { useStore } from '../store'
import { MemoryGame } from './MemoryGame'
import { ResonanceGame } from './ResonanceGame'

// --- 辅助组件：发条滑块 (Isolated Winding Slider) ---
function WindingSlider({ onProgress }: { onProgress: (p: number) => void }) {
  const dragX = useMotionValue(0)
  const progress = useTransform(dragX, [0, 300], [0, 1])
  const opacity = useTransform(dragX, [0, 240, 300], [0.4, 0.8, 1])
  const scale = useTransform(dragX, [0, 300], [1, 1.1])

  // 监听进度并回调，使用 onChange 避免频繁更新 store 导致父组件重绘
  useEffect(() => {
    return progress.on("change", (v) => {
      onProgress(Math.min(Math.max(v, 0), 1))
    })
  }, [progress, onProgress])

  return (
    <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
      <h2 style={{ fontWeight: 300, letterSpacing: '8px', marginBottom: '60px' }}>
        上发条：蓄积时间的能量
      </h2>
      
      <div style={{ position: 'relative', width: '300px', height: '4px', margin: '0 auto', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
        {/* 进度条填充 */}
        <motion.div 
          style={{ 
            width: dragX, 
            height: '100%', 
            background: 'linear-gradient(90deg, #bd00ff, #00ffff)',
            boxShadow: '0 0 15px #00ffff',
            borderRadius: '2px'
          }} 
        />

        {/* 拖拽滑块 */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 300 }}
          dragElastic={0}
          dragMomentum={false}
          style={{
            x: dragX,
            width: '50px',
            height: '50px',
            background: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            position: 'absolute',
            top: '-23px',
            left: '-25px',
            boxShadow: '0 0 20px rgba(255,255,255,0.3)',
            zIndex: 10
          }}
          whileTap={{ cursor: 'grabbing', scale: 0.9 }}
        >
          <Wind color="black" size={20} />
        </motion.div>
      </div>

      <motion.p style={{ marginTop: '50px', fontSize: '0.8em', opacity, scale, letterSpacing: '2px' }}>
        <motion.span>
          {useTransform(progress, p => 
            (p < 0.3 ? "缓慢滑动以唤醒机械之心" : 
            p < 0.8 ? "感受到时间的阻力了吗..." : "阈限之门即将开启") as any
          )}
        </motion.span>
      </motion.p>
    </div>
  )
}

// --- 辅助组件：阈限按钮 (Isolated Threshold Button) ---
function ThresholdButton() {
  const windingLevel = useStore(state => state.windingLevel)
  const setPhase = useStore(state => state.setPhase)

  if (windingLevel <= 0.95) return null

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, boxShadow: '0 0 30px #bd00ff' }}
      onClick={() => setPhase('LIMINAL')}
      style={{
        background: 'rgba(189, 0, 255, 0.1)',
        border: '1px solid #bd00ff',
        color: '#bd00ff',
        padding: '15px 50px',
        cursor: 'pointer',
        letterSpacing: '8px',
        fontSize: '16px',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s',
        textTransform: 'uppercase'
      }}
    >
      跨越阈限
    </motion.button>
  )
}

export function RitualUI() {
  const phase = useStore(state => state.phase)
  const setWindingLevel = useStore(state => state.setWindingLevel)
  const setPhase = useStore(state => state.setPhase)
  const isGameActive = useStore(state => state.isGameActive)
  const setGameActive = useStore(state => state.setGameActive)
  const gameMode = useStore(state => state.gameMode)
  const setGameMode = useStore(state => state.setGameMode)
  
  const [showThreshold, setShowThreshold] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)

  if (phase === 'PRE_LIMINAL') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'black',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          color: 'white'
        }}
      >
        {!showThreshold ? (
          <motion.div 
            onClick={() => setShowThreshold(true)}
            style={{ cursor: 'pointer', textAlign: 'center' }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Heart size={48} color="#ff0055" fill="#ff0055" style={{ filter: 'drop-shadow(0 0 10px #ff0055)' }} />
            </motion.div>
            <p style={{ marginTop: '20px', letterSpacing: '4px', opacity: 0.6 }}>
              [ 点击开启记忆的搏动 ]
            </p>
          </motion.div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <WindingSlider onProgress={setWindingLevel} />

            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
              <ThresholdButton />
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10,
      pointerEvents: 'none'
    }}>
      <AnimatePresence>
        {phase === 'LIMINAL' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white', 
              textAlign: 'center', 
              fontFamily: 'serif',
              pointerEvents: 'all'
            }}
          >
            <p style={{ letterSpacing: '2px', opacity: 0.7, marginBottom: '20px' }}>
              时间的线性规则已暂停
            </p>
            <button 
              onClick={() => setPhase('POST_LIMINAL')}
              style={{
                background: 'none',
                border: '1px solid rgba(0,255,255,0.5)',
                color: '#00ffff',
                padding: '10px 30px',
                cursor: 'pointer',
                letterSpacing: '4px',
                fontSize: '12px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s'
              }}
            >
              收束记忆收割 (HARVEST)
            </button>
          </motion.div>
        )}

        {phase === 'POST_LIMINAL' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'radial-gradient(circle at center, rgba(189,0,255,0.2) 0%, transparent 70%)',
              pointerEvents: 'all'
            }}
          >
            {isGameActive ? (
              gameMode === 'memory' ? (
                <MemoryGame onComplete={() => {
                  setGameActive(false)
                  setGameFinished(true)
                }} />
              ) : (
                <ResonanceGame onComplete={() => {
                  setGameActive(false)
                  setGameFinished(true)
                }} />
              )
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 2 }}
                style={{ textAlign: 'center', color: 'white' }}
              >
                <h1 style={{ fontSize: '3rem', letterSpacing: '15px', fontWeight: 200, margin: 0 }}>
                  {gameFinished ? "ECHOES OF ETERNITY" : "HAPPY BIRTHDAY"}
                </h1>
                <div style={{ width: '100px', height: '1px', background: 'white', margin: '20px auto', opacity: 0.3 }} />
                <p style={{ fontSize: '1.2rem', letterSpacing: '5px', opacity: 0.8, marginBottom: '40px' }}>
                  {gameFinished ? "我们已在时间的频率中达成共振" : "愿你在时间的晶体里，永远闪耀"}
                </p>
                
                {!gameFinished && (
                  <div style={{
                    padding: '30px',
                    border: '1px dashed rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <p style={{ fontSize: '14px', letterSpacing: '4px', color: '#00ffff', marginBottom: '10px' }}>
                      [ 选择共鸣方式 ]
                    </p>
                    
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <button 
                        onClick={() => { setGameMode('memory'); setGameActive(true); }}
                        style={{
                          background: 'rgba(0,0,0,0.6)',
                          border: '1px solid #00ffff',
                          color: '#00ffff',
                          padding: '15px 30px',
                          fontSize: '1rem',
                          letterSpacing: '2px',
                          cursor: 'pointer',
                          fontFamily: '"Cinzel", serif',
                          pointerEvents: 'auto',
                          boxShadow: '0 0 15px rgba(0,255,255,0.2)',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        星际连连看
                      </button>
                      
                      <button 
                        onClick={() => { setGameMode('resonance'); setGameActive(true); }}
                        style={{
                          background: 'rgba(0,0,0,0.6)',
                          border: '1px solid #bd00ff',
                          color: '#bd00ff',
                          padding: '15px 30px',
                          fontSize: '1rem',
                          letterSpacing: '2px',
                          cursor: 'pointer',
                          fontFamily: '"Cinzel", serif',
                          pointerEvents: 'auto',
                          boxShadow: '0 0 15px rgba(189,0,255,0.2)',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        双人共鸣
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '50px' }}>
                  <button 
                    onClick={() => {
                      setPhase('PRE_LIMINAL')
                      setGameFinished(false)
                      setGameActive(false)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      fontSize: '10px',
                      letterSpacing: '2px'
                    }}
                  >
                    RESTART RITUAL
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
