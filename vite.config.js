import { sveltekit } from '@sveltejs/kit/vite';
// import wasm from 'vite-plugin-wasm';
// import topLevelAwait from 'vite-plugin-top-level-await';
// import { hash } from './src/utils/hash.js'


/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit(),
		// wasm(),
		// topLevelAwait()
	],
	assetsInclude: [
		"**/*.ttl"
	],
	// build: {
	// 	rollupOptions: {
	// 	  output: {
	// 		entryFileNames: `[name]` + hash + `.js`,
	// 		chunkFileNames: `[name]` + hash + `.js`,
	// 		assetFileNames: `[name]` + hash + `.[ext]`
	// 	  }
	// 	}
	//   }
};

export default config;
