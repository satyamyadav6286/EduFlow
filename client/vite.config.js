import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd());
  
  // API URL based on environment
  const apiUrl = mode === 'production' 
    ? 'https://eduflow-api.onrender.com' 
    : 'http://localhost:3000';

  return {
    plugins: [react()],
    server: {
      cors: true,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: mode === 'production',
        }
      }
    },
    define: {
      // Make environment variables available to client-side code
      'process.env.API_URL': JSON.stringify(apiUrl),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
