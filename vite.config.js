import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/stlaf-api': {
        target: 'http://localhost:80',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      }
    }
  }
})