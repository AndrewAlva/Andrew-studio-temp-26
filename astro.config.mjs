import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  vite: {
    assetsInclude: ['**/*.vert', '**/*.frag'],
  },
});
