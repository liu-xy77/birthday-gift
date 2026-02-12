// --- 核心数据：记忆碎片 ---
export const MEMORY_DATA = Array.from({ length: 78 }, (_, i) => ({
  id: i + 1,
  label: `Memory ${i + 1}`,
  date: "2024.02.10", 
  imageUrl: `memories/0210 (${i + 1}).jpg`
}))
