// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://davidwurgler.com',
  output: 'static',
  build: {
    // The stylesheet is small, so inline it rather than block first paint on it.
    inlineStylesheets: 'always',
  },
  // Addresses from the site before this one, sent to where that work lives now.
  redirects: {
    '/work/firn': '/things/firn/',
    '/work/utu': '/things/utu/',
    '/work/deepcall': '/things/deepcall/',
    '/work/nw-remarketing': '/things/nw-remarketing/',
    '/work/copywriter-lab': '/things/copywriter-lab/',
    '/one': '/',
  },
});
