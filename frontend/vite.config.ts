import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env= loadEnv(mode, process.cwd())

  return {
    plugins: [react(),tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true, // Allows docker
      allowedHosts:[env.VITE_DOMAIN_NAME],
      port: 5173,
      watch: {
        usePolling: true, // allows hotreload
      }
    }
}
})
