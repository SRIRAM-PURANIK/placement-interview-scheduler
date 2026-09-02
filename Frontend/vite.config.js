import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: true // This completely disables the domain host check
  }
})
