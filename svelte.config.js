import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// default options are shown
			pages: 'public',
			assets: 'public',
			fallback: 'index.html',
			precompress: false,
		}),
		// 'trailingSlash': 'always',
	}
};

export default config;
