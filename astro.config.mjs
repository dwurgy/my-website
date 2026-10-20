// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://davidwurgler.com',
  output: 'static',
  build: {
    // The stylesheet is small, so inline it rather than block first paint on it.
    inlineStylesheets: 'always',
  },
});
