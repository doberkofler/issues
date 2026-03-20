import path from 'node:path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
	build: {
		target: 'es2022',
	},
	resolve: {
		alias: {
			'@alias_root': path.resolve('./'),
		},
	},
	test: {
		browser: {
			provider: 'playwright',
			enabled: true,
			headless: true,
			instances: [{browser: 'chromium'}],
		},
	},
});
