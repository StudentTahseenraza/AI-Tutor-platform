import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
  optimizeDeps: {
    force: true,
    include: ['react', 'react-dom', 'axios', 'react-katex', '@monaco-editor/react', 'prop-types'],
  },
});