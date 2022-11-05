import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			postcss: true,
		}),
	],

	kit: {
		adapter: adapter(),
		csp: {
			directives: {
				'default-src': ['self'],
				'style-src': ['self', 'unsafe-inline', 'fonts.googleapis.com'],
				'font-src': ['self', 'fonts.gstatic.com'],
				'connect-src': ['self', 'ws.0xnotes.me', 'wss://ws.0xnotes.me'],
				'img-src': ['*'],
			}
		}
	}
};

export default config;
