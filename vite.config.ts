import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // 큰 라이브러리들을 별도 청크로 분리
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react')) return 'react';
            if (id.includes('@tanstack') || id.includes('zustand') || id.includes('axios'))
              return 'vendor';
            if (id.includes('@radix-ui') || id.includes('lucide-react')) return 'ui';
            if (id.includes('swiper')) return 'swiper';
            if (id.includes('date-fns')) return 'dateFns';
            if (id.includes('react-day-picker')) return 'datePicker';
            if (
              id.includes('micromark') ||
              id.includes('vfile') ||
              id.includes('mdast-util-to-hast')
            )
              return 'markdown';
          }
        },
      },
    },
    // 청크 크기 경고 임계값
    chunkSizeWarningLimit: 500,
  },
});
