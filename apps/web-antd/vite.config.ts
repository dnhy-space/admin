import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api-proxy': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api-proxy/, ''),
            target: 'http://localhost:44300',
            ws: true,
          },
          // 编辑器中直接使用 /api/app/file/xxx 展示图片
          '/api/app/file': {
            changeOrigin: true,
            target: 'http://localhost:44300',
          },
        },
      },
    },
  };
});
