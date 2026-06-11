import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base must match the GitHub Pages repo name
export default defineConfig({
  base: '/prompt-forge/',
  plugins: [react(), tailwindcss()],
})
