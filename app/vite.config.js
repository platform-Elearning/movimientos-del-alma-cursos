import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Puerto fijo y estricto: si 5180 esta ocupado, vite falla con un error claro
  // en vez de saltar a otro puerto y dejar el CORS del backend apuntando mal.
  server: { port: 5180, strictPort: true },
})
