console.log('[module2.ts] Starting');
import {tinymce} from './tinymce-wrapper';
import {getPlainText} from './utils';

console.log('[module2.ts] Initializing TinyMCE');

tinymce.init({
	selector: '#app',
	toolbar: 'bold italic',
	height: 200,
	license_key: 'gpl',
});

setTimeout(() => {
	console.log('[module2.ts] Testing getPlainText');
	try {
		console.log(getPlainText('<p>Module 2 test</p>'));
	} catch (e) {
		console.error('[module2.ts] Error:', e);
	}
}, 1000);
