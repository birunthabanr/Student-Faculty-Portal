import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // <-- alias '@' to './src'
    },
  },
  server: {
    port: 5173,
    cors: {
      origin: 'http://localhost:8000',
      credentials: true
    }
  }
})
