# Rolldown Bug: Chunk Contamination with `strictExecutionOrder: true`

## The Problem
When `strictExecutionOrder: true` is enabled in Vite 8 (using Rolldown 1.0.0-rc.10), CommonJS wrappers (like `__commonJSMin`) are sometimes incorrectly bundled directly into an entry point chunk instead of being hoisted to a shared chunk.

This causes a violation of module isolation. If `EntryA` needs that shared wrapper, it is forced to import `EntryB`. In projects where entry points have top-level side effects (like rendering a UI), loading `EntryA` inadvertently executes all side effects in `EntryB`.

## Reproduction Steps

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Build the project:**
    ```bash
    npm run build
    ```

3.  **Inspect the output:**
    Check `dist/entryA.js`. In the buggy scenario, it will contain an import for `entryB.js`:
    ```javascript
    import { _ as __commonJSMin } from './entryB.js';
    ```

4.  **Run the preview:**
    ```bash
    npm run preview
    ```
    Open the `entryA.html` page (e.g., http://localhost:4173/entryA.html).
    
    **Buggy Behavior:** The page executes the code from `entryB.js`, causing the wrong UI components to render.


