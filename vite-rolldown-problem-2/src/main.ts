console.log('[main.ts] Entry point starting');

// Import TinyMCE core + side effects from shared wrapper
import {tinymce} from './tinymce-wrapper';

// Import utility that ALSO imports tinymce (creates duplicate import site)
import {getPlainText} from './utils';

console.log('[main.ts] Initializing TinyMCE on #app');

tinymce.init({
	selector: '#app',
	toolbar: 'undo redo | bold italic | code | link',
	height: 300,
	license_key: 'gpl',
});

// Use the utility to demonstrate it crashes in production bundle
setTimeout(() => {
	const html = '<p>Hello <strong>World</strong></p>';
	try {
		console.log('[main.ts] Calling getPlainText...');
		console.log('Plain text result:', getPlainText(html));
	} catch (e) {
		console.error('[main.ts] getPlainText crashed:', e);
	}
}, 1000);
