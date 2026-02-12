import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { qrcode } from 'vite-plugin-qrcode'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // 使用相对路径，支持部署在任意子目录
  plugins: [
    react(),
    qrcode()
  ],
})
