console.log('[module4.ts] Starting');
import {tinymce} from './tinymce-wrapper';
import {getPlainText} from './utils';

console.log('[module4.ts] Initializing TinyMCE');

tinymce.init({
	selector: '#app',
	toolbar: 'bold italic',
	height: 200,
	license_key: 'gpl',
});

setTimeout(() => {
	console.log('[module4.ts] Testing getPlainText');
	try {
		console.log(getPlainText('<p>Module 4 test</p>'));
	} catch (e) {
		console.error('[module4.ts] Error:', e);
	}
}, 1000);
