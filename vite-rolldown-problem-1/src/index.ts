import './index.css';

// Import TinyMCE core and desired plugins/themes/skins
import tinymce from 'tinymce';
import 'tinymce/models/dom';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';

// Optional: import skin (if not using CDN)
import 'tinymce/skins/ui/oxide/skin.min.css';

tinymce.init({
	selector: '#app',
	toolbar: 'undo redo | bold italic | code | link',
	height: 300,
	license_key: 'gpl',
});
