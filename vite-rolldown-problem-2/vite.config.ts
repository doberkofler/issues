import {defineConfig} from 'vite';

export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				index: 'index.html',
				globals: 'globals.html',
				main: 'main.html',
				module1: 'module1.html',
				module2: 'module2.html',
				module3: 'module3.html',
				module4: 'module4.html',
				module5: 'module5.html',
				module6: 'module6.html',
				module7: 'module7.html',
				module8: 'module8.html',
				module9: 'module9.html',
				module10: 'module10.html',
			},
			output: {
				entryFileNames: 'assets/[name].js',
				chunkFileNames: 'assets/[name]-[hash].js',
			},
		},
		minify: false,
		chunkSizeWarningLimit: 4096,
		cssCodeSplit: true,
	},
});
