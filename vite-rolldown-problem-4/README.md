# Vite circular dependency repro

This project intentionally reproduces a dev-only double-execution case caused by a module URL mismatch.

## Repro steps

1. Install dependencies:

```bash
pnpm install
```

2. Start dev server:

```bash
pnpm dev
```

3. Open the local URL shown by Vite.

4. Confirm the bug in the page output:
   - `render called (If this appears twice, the double-execution bug is present)` appears twice.
   - `render count: 1` and `render count: 2` both appear.

## Why this reproduces

- `index.html` loads `/src/index.ts?t=entry`.
- `src/child.ts` imports `./index.ts`.
- In Vite dev, those are different module URLs (`/src/index.ts?t=entry` vs `/src/index.ts`), so the browser executes the same source module twice.

## Control check (fixed behavior)

Change `index.html` to load `/src/index.ts` instead of `/src/index.ts?t=entry`.
Then reload the page; `render count` should only be `1`.
