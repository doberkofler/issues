import './index.css';

console.log('[tinymce-wrapper.ts] Loading TinyMCE core + side effects');

// Import TinyMCE core
import tinymce from 'tinymce/tinymce';

// Import side effects (models, themes, icons)
import 'tinymce/models/dom';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';

// Optional: import skin (if not using CDN)
import 'tinymce/skins/ui/oxide/skin.min.css';

export {tinymce};
