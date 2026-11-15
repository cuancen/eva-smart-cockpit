/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Actions 会注入 GITHUB_REPOSITORY（owner/repo）。
// Project Pages 部署在 /<repo>/ 子路径下，构建时必须使用相同 base；
// 本地 npm run dev / npm run build 仍保持根路径。
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];

export default defineConfig({
  base: repository ? `/${repository}/` : '/',
  plugins: [react()],
  server: {
    port: 5173,
    // 编辑器/代理的原子写入会在 src 下留下 <name>.<pid>.<guid>.tmpdir 瞬时目录；
    // 让文件监听忽略它们，避免 dev server 因 EBUSY 崩溃。
    watch: { ignored: ['**/*.tmpdir/**', '**/*.tmp'] },
  },
  build: { sourcemap: true },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
