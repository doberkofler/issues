# AI Agent Guidelines (AGENTS.md)

Welcome to the `rolldown-bug-repro` repository. This document outlines the core conventions, commands, and expectations for AI agents and human contributors operating within this codebase. 

## 1. Project Context & Architecture

This repository is **NOT** a standard application. It is a highly sensitive, minimal bug reproduction environment designed to isolate and demonstrate a specific chunking failure in Vite 8 and Rolldown (`1.0.0-rc.10`).

**The Bug:** When `strictExecutionOrder: true` is enabled, CommonJS wrappers (e.g., `__commonJSMin`) are sometimes improperly bundled directly into an entry point chunk rather than being hoisted to a shared chunk. This violates module isolation, causing one entry point to inadvertently execute another entry point's side effects if they share a CommonJS dependency.

**Agent Goal:** Maintain the exact file structure provided. The bug relies on extremely specific bundler heuristics (file sizes, graph complexity). Do not over-engineer, over-type, or attempt to aggressively delete files (even seemingly "unused" ones like `entry1.js` through `entry20.js`) as this will change the shape of the module graph and stop the bug from reproducing.

## 2. Build, Lint, and Test Commands

Because this is a minimal reproduction, we avoid standard testing frameworks. Testing is done by building the project and inspecting the output chunks for contamination.

### 2.1 Installing Dependencies
Always ensure dependencies are up to date before running tests:
```bash
npm install
```

### 2.2 Method A: The Node.js Standalone Script
The fastest way to test core Rolldown chunking behavior without Vite's overhead is the `repro.js` script. 
```bash
node repro.js
```
*Note: This script programmatically generates a temporary `repro-work/` folder, creates a dummy file structure, runs Rolldown directly, and analyzes the chunks. Do not commit `repro-work/`.*

### 2.3 Method B: The Vite Pipeline Verification
If modifying Vite configurations (`vite.config.js`) or testing real browser behavior:
```bash
# 1. Build the Vite project
npm run build

# 2. Inspect the output manually
# Check dist/entryA.js to see if it imports entryB.js incorrectly.
cat dist/entryA.js

# 3. Preview in browser (Optional)
npm run preview
```

## 3. Code Style Guidelines

### 3.1 Language, Types, and Environment
*   **Environment:** Node.js, ES Modules (`"type": "module"` in `package.json`).
*   **Language:** Pure JavaScript. 
*   **NO TypeScript:** Do not introduce `.ts` files, `tsconfig.json`, or any compilation steps.
*   **Simplicity:** Keep the logic inside the `src/` folder as dumb as possible.

### 3.2 Imports and Dependencies
*   **Node Built-ins:** Always use the `node:` prefix for built-in modules in `repro.js` (e.g., `import path from "node:path";`).
*   **ESM Syntax:** Use `import` / `export` everywhere in the main `src/` files.
*   **CommonJS Mocking:** The `src/shared.cjs` file uses `module.exports` intentionally to trigger the CommonJS wrapping behavior. Do not convert it to ESM.
*   **Zero Dependencies:** Do **NOT** add new dependencies to `package.json`.

### 3.3 Formatting
*   **Indentation:** 2 spaces.
*   **Quotes:** Use double quotes (`"`) for strings in configuration and test scripts.
*   **Semicolons:** Always use semicolons at the end of statements.

### 3.4 Naming Conventions
*   **Files:** `kebab-case` for configuration files (`vite.config.js`). `camelCase` for generated entry points (`entryA.js`, `entryB.js`).
*   **Variables:** `camelCase`.

## 4. Agentic Workflow Instructions

When an AI agent is tasked with modifying this repository, follow this workflow:

1.  **Read and Understand:** Run `node repro.js` or `npm run build` first to observe the baseline chunks.
2.  **Isolate Variables:** Modify only **one** configuration flag at a time (e.g., toggling `strictExecutionOrder`).
3.  **Do Not Touch the Heuristics:** The `src/shared.cjs` file contains a massive loop intentionally. The `src/entry1-20.js` files pad the import graph intentionally. Do not "clean" these files, or you will fix the bug by masking it.

## 5. Existing AI Rules
*Note: There are no existing `.cursorrules` or `.github/copilot-instructions.md` in this repository. This `AGENTS.md` serves as the sole source of truth for AI agents.*
