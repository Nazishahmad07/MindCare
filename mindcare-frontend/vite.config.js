import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL?.trim()

  if (mode === 'production' && !apiUrl) {
    throw new Error('VITE_API_URL must be set to the deployed backend URL for production builds')
  }
  if (mode === 'production' && !/^https?:\/\//i.test(apiUrl)) {
    throw new Error('VITE_API_URL must be an absolute HTTP(S) URL for production builds')
  }

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
            'motion-vendor': ['framer-motion'],
            'chart-vendor': ['recharts'],
          }
        }
      }
    }
  }
})
