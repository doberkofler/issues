console.log('[module3.ts] Starting');
import {tinymce} from './tinymce-wrapper';
import {getPlainText} from './utils';

console.log('[module3.ts] Initializing TinyMCE');

tinymce.init({
	selector: '#app',
	toolbar: 'bold italic',
	height: 200,
	license_key: 'gpl',
});

setTimeout(() => {
	console.log('[module3.ts] Testing getPlainText');
	try {
		console.log(getPlainText('<p>Module 3 test</p>'));
	} catch (e) {
		console.error('[module3.ts] Error:', e);
	}
}, 1000);
