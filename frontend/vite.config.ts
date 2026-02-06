import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allows docker
    port: 5173,
    watch: {
      usePolling: true, // allows hotreload
    }
  }
})
