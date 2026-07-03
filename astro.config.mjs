import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://arqow.com',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  output: 'static'
});
