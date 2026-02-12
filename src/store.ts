import { create } from 'zustand'

type Phase = 'PRE_LIMINAL' | 'LIMINAL' | 'POST_LIMINAL'

interface UniverseState {
  phase: Phase
  setPhase: (phase: Phase) => void
  windingLevel: number
  setWindingLevel: (level: number) => void
  activeMemoryId: number | null
  setActiveMemoryId: (id: number | null) => void
  isGameActive: boolean
  setGameActive: (active: boolean) => void
  gameMode: 'none' | 'memory' | 'resonance'
  setGameMode: (mode: 'none' | 'memory' | 'resonance') => void
  currentLyric: string
  setCurrentLyric: (lyric: string) => void
  isInputFocused: boolean
  setIsInputFocused: (focused: boolean) => void
}

// --- 高性能音频数据流 ---
// 不存储在 Zustand 中以避免重渲染，直接使用 Mutable Ref
export const audioData = {
  current: {
    average: 0,   // 整体音量 (0-1)
    bass: 0,      // 低频能量 (0-1)
    mid: 0,       // 中频能量 (0-1)
    treble: 0,    // 高频能量 (0-1)
    dataArray: new Uint8Array(0) // 原始数据
  }
}

export const useStore = create<UniverseState>((set) => ({
  phase: 'PRE_LIMINAL',
  setPhase: (phase) => set({ phase }),
  windingLevel: 0,
  setWindingLevel: (windingLevel) => set({ windingLevel }),
  activeMemoryId: null,
  setActiveMemoryId: (id) => set({ activeMemoryId: id }),
  isGameActive: false,
  setGameActive: (isGameActive) => set({ isGameActive }),
  gameMode: 'none',
  setGameMode: (gameMode) => set({ gameMode }),
  currentLyric: '',
  setCurrentLyric: (currentLyric) => set({ currentLyric }),
  isInputFocused: false,
  setIsInputFocused: (isInputFocused) => set({ isInputFocused }),
}))
