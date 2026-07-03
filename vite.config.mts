import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Crucial for Electron to load relative assets under file://
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
