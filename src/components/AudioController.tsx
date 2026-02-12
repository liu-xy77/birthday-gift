import { useRef, useState, useEffect } from 'react'
import { useStore, audioData } from '../store'
import { BGM_LYRICS } from '../data/lyrics'

// --- 歌词解析 ---
function parseLRC(lrc: string) {
  const lines = lrc.split('\n')
  const result: { time: number, text: string }[] = []
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/
  
  for (const line of lines) {
    const match = line.match(timeRegex)
    if (match) {
      const min = parseInt(match[1])
      const sec = parseInt(match[2])
      // 支持 2位或3位毫秒
      const msStr = match[3]
      const ms = parseInt(msStr.length === 2 ? msStr + '0' : msStr)
      const time = min * 60 + sec + ms / 1000
      const text = line.replace(timeRegex, '').trim()
      if (text) {
        result.push({ time, text })
      }
    }
  }
  return result.sort((a, b) => a.time - b.time)
}

// --- 音频控制器 (Audio Controller) ---
export function AudioController() {
  const windingLevel = useStore(state => state.windingLevel)
  const audioRef = useRef<HTMLAudioElement>(null!)
  const analyserRef = useRef<AnalyserNode>(null!)
  const dataArrayRef = useRef<Uint8Array>(null!)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  
  const setCurrentLyric = useStore(state => state.setCurrentLyric)
  const lyricsRef = useRef<{ time: number, text: string }[]>([])

  // 加载歌词
  useEffect(() => {
    try {
      lyricsRef.current = parseLRC(BGM_LYRICS)
      console.log('Lyrics loaded:', lyricsRef.current.length)
    } catch (err) {
      console.log('Parsing error', err)
    }
  }, [])
  
  // 监听发条状态来控制播放
  useEffect(() => {
    if (audioRef.current) {
      if (!analyserRef.current) {
        // 初始化 Web Audio API
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        const ctx = new AudioContext()
        const source = ctx.createMediaElementSource(audioRef.current)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        analyser.connect(ctx.destination)
        analyserRef.current = analyser
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
      }

      if (windingLevel > 0.05) {
        if (!isPlaying) {
           // Resume context if suspended (browser policy)
           const ctx = analyserRef.current.context as AudioContext
           if (ctx.state === 'suspended') {
             ctx.resume()
           }
           audioRef.current.play()
             .then(() => setIsPlaying(true))
             .catch((e) => console.error("Audio playback failed:", e))
        }
        audioRef.current.volume = Math.max(0.2, Math.min(1, windingLevel))
        audioRef.current.playbackRate = 0.8 + windingLevel * 0.2
      } else {
        if (isPlaying) {
          const fadeOut = setInterval(() => {
            if (audioRef.current.volume > 0.1) {
              audioRef.current.volume -= 0.1
            } else {
              audioRef.current.pause()
              setIsPlaying(false)
              clearInterval(fadeOut)
            }
          }, 100)
        }
      }
    }
  }, [windingLevel, isPlaying])

  // 实时分析音频数据
  useEffect(() => {
    let animationFrameId: number

    const analyze = () => {
      if (isPlaying && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current as any)
        
        const length = dataArrayRef.current.length
        let sum = 0, bassSum = 0, midSum = 0, trebleSum = 0
        
        // 分频段计算
        const bassEnd = Math.floor(length * 0.1)
        const midEnd = Math.floor(length * 0.5)
        
        for(let i=0; i<length; i++) {
          const val = dataArrayRef.current[i] / 255.0
          sum += val
          if (i < bassEnd) bassSum += val
          else if (i < midEnd) midSum += val
          else trebleSum += val
        }
        
        // 更新全局引用
        audioData.current.average = sum / length
        audioData.current.bass = bassSum / bassEnd
        audioData.current.mid = midSum / (midEnd - bassEnd)
        audioData.current.treble = trebleSum / (length - midEnd)
        
        // 更新歌词
        if (audioRef.current) {
          const currentTime = audioRef.current.currentTime
          let activeLyric = ''
          // 简单的倒序查找：找到最后一个 time <= currentTime 的歌词
          for (let i = lyricsRef.current.length - 1; i >= 0; i--) {
            if (currentTime >= lyricsRef.current[i].time) {
              activeLyric = lyricsRef.current[i].text
              break
            }
          }
          
          if (activeLyric !== useStore.getState().currentLyric) {
             setCurrentLyric(activeLyric)
          }
        }

      } else {
        // 衰减归零
        audioData.current.average *= 0.9
        audioData.current.bass *= 0.9
        audioData.current.mid *= 0.9
        audioData.current.treble *= 0.9
      }
      animationFrameId = requestAnimationFrame(analyze)
    }

    analyze()
    return () => cancelAnimationFrame(animationFrameId)
  }, [isPlaying])

  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
      <audio 
        ref={audioRef} 
        src="music/bgm.mp3" 
        preload="auto"
        crossOrigin="anonymous"
        loop 
        muted={isMuted} 
      />
      <button 
        onClick={() => setIsMuted(!isMuted)}
        style={{
          background: 'none',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          color: 'white',
          cursor: 'pointer',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isMuted ? '🔇' : '🎵'}
      </button>
    </div>
  )
}
