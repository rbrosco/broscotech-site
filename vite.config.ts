/// <reference types="vite/client" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    rollupOptions: {
      input: undefined, // Evita a necessidade de um arquivo index.html
    },
  },
  server: {
    port: 4000,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});