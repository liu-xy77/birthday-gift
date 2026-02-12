import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'

// --- 歌词显示组件 (2D UI) ---
export function LyricsUI() {
  const currentLyric = useStore(state => state.currentLyric)
  const phase = useStore(state => state.phase)
  
  // 在 PRE_LIMINAL 阶段不显示歌词
  if (phase === 'PRE_LIMINAL') return null

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '120px', // 稍微抬高，避开底部按钮
        left: '0',
        width: '100%',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 50,
        mixBlendMode: 'screen'
      }}>
        <AnimatePresence mode="wait">
        {currentLyric && (
          <motion.div
            key={currentLyric}
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 style={{
              fontSize: '1.8rem',
              color: '#ffffff',
              textShadow: '0 0 10px rgba(0,255,255,0.8), 0 0 30px rgba(189,0,255,0.4)',
              fontFamily: '"Cinzel", serif',
              letterSpacing: '6px',
              margin: 0,
              fontWeight: 300
            }}>
              {currentLyric}
            </h2>
            {/* 倒影效果 */}
            <div style={{
              fontSize: '1.8rem',
              color: '#00ffff',
              fontFamily: '"Cinzel", serif',
              letterSpacing: '6px',
              fontWeight: 300,
              transform: 'scaleY(-1) skewX(-10deg)',
              opacity: 0.15,
              filter: 'blur(3px)',
              marginTop: '-15px',
              maskImage: 'linear-gradient(to bottom, black, transparent)'
            }}>
              {currentLyric}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
      
      {/* 互动提示 */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '0.8rem',
        fontFamily: '"Cinzel", serif',
        pointerEvents: 'none',
        zIndex: 40
      }}>
        <div>Double click to make a wish</div>
        <div>Find the bottle for messages</div>
      </div>
    </>
  )
}
