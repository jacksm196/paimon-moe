import { resolve } from 'path';
import { sveltekit } from '@sveltejs/kit/vite';
import { build } from 'vite';
import { banners } from './src/data/banners';
import { characters } from './src/data/characters.js';

/** @type {import('vite').Plugin} */
const firebaseSwPlugin = {
  name: 'firebaseplugin',
  apply: 'build',
  enforce: 'post',
  buildEnd: async () => {
    const conf = {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/firebase-messaging-sw.js'),
          formats: ['es'],
        },
        rollupOptions: {
          output: {
            entryFileNames: 'firebase-messaging-sw.js',
          },
        },
        outDir: resolve(__dirname, '.svelte-kit/output/client'),
        emptyOutDir: false,
      },
      configFile: false,
    };

    await build(conf);
  },
};

function homepageBanner() {
  const moduleId = 'v:homepage-banner';
  const resolvedModuleId = '\0' + moduleId;

  return {
    name: 'v-homepage-banner',
    resolveId(id) {
      if (id === moduleId) {
        return resolvedModuleId;
      }
    },
    load(id) {
      if (id === resolvedModuleId) {
        const banner = banners.characters[banners.characters.length - 1];
        const featured = banner.featured;
        const chars = [
          { id: featured[0], name: characters[featured[0]].name },
          { id: featured[1], name: characters[featured[1]].name },
        ];
        return `export const latestBanner = ${JSON.stringify(chars)};`;
      }
    },
  };
}

/** @type {import('vite').UserConfig} */
const config = {
  build: {
    sourcemap: true,
  },
  plugins: [homepageBanner(), sveltekit(), firebaseSwPlugin],
};

export default config;
