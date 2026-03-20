// CRITICAL: This duplicate import of 'tinymce/tinymce' triggers the bug!
import tinymce from 'tinymce/tinymce';

console.log('[utils.ts] Module starting. Is tinymce defined?', typeof tinymce !== 'undefined');

/**
 * Convert HTML to plain text
 */
export function getPlainText(text: string): string {
	console.log('[utils.ts] Executing getPlainText using tinymce core');

	if (typeof tinymce === 'undefined') {
		throw new ReferenceError('[utils.ts] tinymce is undefined! This is the bug.');
	}

	const serializer = tinymce.html.Serializer();
	const parser = tinymce.html.DomParser();
	const plainText = serializer.serialize(parser.parse(text));

	// Remove HTML tags
	return plainText.replace(/<[^>]+>/g, ' ');
}
