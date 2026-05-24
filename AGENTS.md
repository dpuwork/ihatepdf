# OpenCode Agent Instructions — ihatepdf

This document contains repo-specific constraints, quirks, and configurations to prevent agents from breaking things or wasting time.

---

## Architecture & Mandate
*   **100% Client-Side Only:** No server-side components, backend uploads, or API-based PDF manipulation are permitted. All processing must happen in the browser using WASM or local JS libraries.
*   **SPA Routing:** Uses `react-router-dom` with `BrowserRouter`. Static deployments require fallback rewrites pointing to `index.html`.
*   **Design System Compliance:** Always adhere to the project's monospaced, terminal-native aesthetic specified in [DESIGN.md](./DESIGN.md). All new pages, modals, workflows, or controls must follow its precise layout, color codes, ASCII styling, and light/dark theme conventions.

---

## Core Developer Commands
*   **Dev Server:** `bun dev`
*   **Linting:** `bun run lint` (runs Biome via `biome check .`)
*   **Compilation & Verification:** `bun run build` (runs `tsc -b && vite build`). This is the definitive typecheck and build command.
*   **No Test Suite:** There is currently no automated test runner configured. Verification must be done manually via the dev server.

---

## Critical Framework & Toolchain Quirks

### 1. Vite Bundler Aliasing for `@jspawn` WASM wrappers
*   **The Gotcha:** `@jspawn` packages ship with `.mjs` wrappers that rely on a global `this.exports` side-effect chain which Vite's esbuild pre-bundler breaks.
*   **The Fix:** You must alias them directly to their CommonJS `.js` entries in `vite.config.ts`:
    ```typescript
    alias: {
      '@jspawn/ghostscript-wasm': resolve(__dirname, 'node_modules/@jspawn/ghostscript-wasm/gs.js'),
      '@jspawn/qpdf-wasm': resolve(__dirname, 'node_modules/@jspawn/qpdf-wasm/qpdf.js'),
    }
    ```

### 2. WASM Asset Placement
*   At runtime, WASM engines are fetched directly from the public directory. These files must reside in the static assets folder:
    *   `public/mupdf-wasm.wasm`
    *   `public/qpdf-wasm.wasm`
    *   `public/ghostscript-wasm.wasm`
    *   `public/pdf.js/pdf.worker.min.mjs`

### 3. Emscripten/WASM Initialization Order (MuPDF)
*   **The Gotcha:** Setting dynamic WASM paths for MuPDF requires defining a global locate configuration hook *before* the package import occurs.
*   **The Pattern:** Always dynamically import `mupdf` after setting up the global configuration object:
    ```typescript
    (window as any)["$libmupdf_wasm_Module"] = {
        locateFile: (path: string, prefix: string) => {
            if (path.endsWith('.wasm')) return '/mupdf-wasm.wasm';
            return prefix + path;
        }
    };
    const mupdfModule = await import('mupdf');
    ```

### 4. TypeScript 5.6+ and `pdf-lib` Blob Assignability
*   **The Gotcha:** In TS 5.6+, `pdf-lib`'s `save()` returns a specialized `Uint8Array` variant that is not directly compatible with the `BlobPart` type.
*   **The Fix:** Wrap the output in a clean, standard `Uint8Array` constructor:
    ```typescript
    const pdfBytes = await pdfDoc.save();
    const blobData = new Uint8Array(pdfBytes);
    return new Blob([blobData], { type: 'application/pdf' });
    ```

### 5. Memory & Sequential Execution Constraints
*   **Avoid Parallelism on WASM Operations:** Running multiple WASM modules concurrently causes heavy memory spikes and crashes on low-end/mobile browsers.
*   **The Rule:** Always run heavy tasks (like trying multiple lossless compression engines in `pdf-utils.ts`) sequentially, rather than in parallel (do not use `Promise.all`).
