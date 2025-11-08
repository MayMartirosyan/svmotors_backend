import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "tailwindcss/base"; @import "tailwindcss/components"; @import "tailwindcss/utilities";`,
      },
    },
  },
});