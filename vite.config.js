import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.VITE_DEV_PROXY_TARGET || 'http://localhost:5118'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': { target: backend, changeOrigin: true },
        '/hubs': { target: backend, changeOrigin: true, ws: true },
      },
    },
  }
})
