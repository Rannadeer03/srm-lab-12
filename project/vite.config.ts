import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['vmtech.local'],
    port: 5173,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
