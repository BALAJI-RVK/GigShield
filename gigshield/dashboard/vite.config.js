// vite.config.js
// Configure Vite to:
// 1. Run the devserver on port 5173 (default)
// 2. Proxy all /api requests to our backend on port 4000
//    so there are no CORS issues during development

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',   // Allow external access (judge's phone via WiFi hotspot)
    proxy: {
      // REST API calls
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      // WebSocket (Socket.io) — proxied so phone only needs port 5173
      '/socket.io': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        ws: true          // <-- this is the key: enables WebSocket proxy
      }
    }
  }
})

