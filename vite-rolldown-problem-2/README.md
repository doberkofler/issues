# TinyMCE + Vite 8 (Rolldown) - Module Execution Order Bug

## Issue Description

When multiple files independently import `tinymce/tinymce`, Rolldown incorrectly orders module execution in production builds. Side-effect imports (`tinymce/models/dom`) execute before the main `tinymce` module is initialized, causing `ReferenceError: tinymce is not defined`.

## Reproduction Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development mode (WORKS):
   ```bash
   npm run dev
   ```
   - Open browser → No errors
   - TinyMCE initializes correctly

3. Build for production (FAILS):
   ```bash
   npm run preview
   ```
   - Open browser console
   - **ERROR**: `Uncaught ReferenceError: tinymce is not defined`
   - Error occurs in bundled `models/dom` module

## Root Cause

The bug is triggered by **Shared Chunk Extraction** in Rolldown:
1. Multiple entry points (10 modules) import the same wrapper.
2. Rolldown extracts TinyMCE into a **shared chunk** (e.g., `assets/utils-[hash].js`).
3. Inside this shared chunk, the module order is corrupted:
   - `models/dom` is wrapped as an IIFE and executed **immediately**: `})))();`
   - `tinymce/tinymce` is wrapped as a lazy CJS module and **not yet executed**.
   - Immediate execution fails because `tinymce` global is missing.

## Verification of Bug (Manual)

If for some reason the browser console doesn't show the error immediately, you can verify the bug by inspecting the generated code:

1. Look in `dist/assets/` for the large shared chunk (e.g., `utils-v9yuU6bo.js`).
2. Search for the string `})))();`.
3. You will find it at the end of the `models/dom` module region.
4. Note that the main `tinymce` module nearby ends with `}));` (lazy) while `models/dom` ends with `})))();` (immediate). This is the bug.

## Workaround

Add to `vite.config.ts`:
```typescript
export default {
	build: {
		rollupOptions: {
			output: {
				strictExecutionOrder: true, // Forces correct module order
			},
		},
	},
};
```

## Environment

- Vite: 8.0.1
- Rolldown: 1.0.0-rc.10 (bundled with Vite 8)
- TinyMCE: 8.3.2
- Node: 22.12.0
