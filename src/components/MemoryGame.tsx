import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MEMORY_DATA } from '../data/memories'

// --- 工具：Fisher-Yates 洗牌算法 ---
function shuffle<T>(array: T[]): T[] {
  const newArr = [...array]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr
}

// --- 星际连连看 (Memory Match Game) ---
export function MemoryGame({ onComplete }: { onComplete: () => void }) {
  const [cards, setCards] = useState<{id: number, img: string, isFlipped: boolean, isMatched: boolean}[]>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [, setMatches] = useState(0)

  // 初始化卡片
  useEffect(() => {
    // 1. 使用 Fisher-Yates 算法从总库中随机抽取 8 张不同的图片
    const allMemories = [...MEMORY_DATA]
    const selected = shuffle(allMemories).slice(0, 8)
    
    // 2. 生成配对数据 (8对 = 16张)
    const pairs = [...selected, ...selected].map((item, index) => ({
      id: index, // 唯一的卡片 ID (0-15)
      img: item.imageUrl,
      isFlipped: false,
      isMatched: false
    }))
    
    // 3. 再次打乱这 16 张卡片的位置
    setCards(shuffle(pairs))
    
    // 预加载图片
    selected.forEach(item => {
      const img = new window.Image()
      img.src = encodeURI(item.imageUrl)
    })
  }, [])

  // 处理点击
  const handleCardClick = (index: number) => {
    if (flippedIndices.length >= 2 || cards[index].isFlipped || cards[index].isMatched) return

    const newCards = [...cards]
    newCards[index].isFlipped = true
    setCards(newCards)
    
    const newFlipped = [...flippedIndices, index]
    setFlippedIndices(newFlipped)

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped
      if (cards[first].img === cards[second].img) {
        // 配对成功
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => 
            (i === first || i === second) ? { ...c, isMatched: true } : c
          ))
          setFlippedIndices([])
          setMatches(m => {
            const newM = m + 1
            if (newM === 8) {
              setTimeout(onComplete, 1000)
            }
            return newM
          })
        }, 500)
      } else {
        // 配对失败
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => 
            (i === first || i === second) ? { ...c, isFlipped: false } : c
          ))
          setFlippedIndices([])
        }, 1000)
      }
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <h2 style={{ color: '#00ffff', fontFamily: '"Cinzel", serif', letterSpacing: '8px', marginBottom: '30px' }}>
        MEMORY MATCH
      </h2>
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px',
        maxWidth: '600px', width: '90%'
      }}>
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0, opacity: card.isMatched ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleCardClick(i)}
            style={{
              aspectRatio: '3/4',
              cursor: 'pointer',
              perspective: '1000px',
              position: 'relative',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* 背面 (星空) */}
            <div style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
              background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)',
              border: '1px solid #00ffff', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {/* 使用 CSS 模拟 Sparkles，避免在 Canvas 外使用 R3F 组件 */}
              <div style={{
                position: 'absolute', width: '100%', height: '100%',
                background: 'radial-gradient(circle, transparent 20%, #000 90%)'
              }} />
              <div style={{ color: '#00ffff', fontSize: '24px' }}>✧</div>
            </div>
            {/* 正面 (照片) */}
            <div style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              // 使用 encodeURI 处理路径中的空格和括号，并添加引号
              backgroundImage: `url("${encodeURI(card.img)}")`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              border: '1px solid #ffffff', borderRadius: '8px'
            }} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
