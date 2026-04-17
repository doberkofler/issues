import { defineConfig } from "vite";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type OutputChunkType = {
  type: "chunk";
  readonly fileName: string;
  readonly isEntry?: boolean;
  readonly name?: string;
  readonly imports: string[];
  readonly dynamicImports: string[];
  viteMetadata?: {
    readonly importedCss?: Set<string>;
  };
};

type OutputAssetType = {
  type: "asset";
};

type OutputType = OutputChunkType | OutputAssetType;

function inspectChunkOrder() {
  const reportFile = resolve(process.cwd(), "reports", "build-report.json");

  const collectCssStable = (
    chunk: OutputChunkType,
    bundle: Record<string, OutputType>,
    seenChunks: Set<string> = new Set(),
    seenCss: Set<string> = new Set(),
  ): string[] => {
    if (seenChunks.has(chunk.fileName)) {
      return [];
    }
    seenChunks.add(chunk.fileName);

    const files: string[] = [];
    for (const importedFile of [...chunk.imports, ...chunk.dynamicImports]) {
      const imported = bundle[importedFile];
      if (!imported || imported.type !== "chunk") {
        continue;
      }
      files.push(...collectCssStable(imported, bundle, seenChunks, seenCss));
    }

    for (const cssFile of chunk.viteMetadata?.importedCss ?? new Set<string>()) {
      if (!seenCss.has(cssFile)) {
        seenCss.add(cssFile);
        files.push(cssFile);
      }
    }

    return files;
  };

  const createBuggyCollector = () => {
    const cache = new Map<string, string[]>();

    const collectCssBuggy = (
      chunk: OutputChunkType,
      bundle: Record<string, OutputType>,
      seenChunks: Set<string> = new Set(),
      seenCss: Set<string> = new Set(),
    ): string[] => {
      if (seenChunks.has(chunk.fileName)) {
        return [];
      }
      seenChunks.add(chunk.fileName);

      const cached = cache.get(chunk.fileName);
      if (cached) {
        return cached.filter((file) => {
          if (seenCss.has(file)) {
            return false;
          }
          seenCss.add(file);
          return true;
        });
      }

      const files: string[] = [];
      for (const importedFile of [...chunk.imports, ...chunk.dynamicImports]) {
        const imported = bundle[importedFile];
        if (!imported || imported.type !== "chunk") {
          continue;
        }
        files.push(...collectCssBuggy(imported, bundle, seenChunks, seenCss));
      }

      cache.set(chunk.fileName, [...files]);

      for (const cssFile of chunk.viteMetadata?.importedCss ?? new Set<string>()) {
        if (!seenCss.has(cssFile)) {
          seenCss.add(cssFile);
          files.push(cssFile);
        }
      }

      return files;
    };

    return {
      collectCssBuggy,
      getCacheSnapshot: () => {
        const snapshot: Record<string, string[]> = {};
        for (const [chunkFileName, files] of cache.entries()) {
          snapshot[chunkFileName] = [...files];
        }
        return snapshot;
      },
    };
  };

  function walkChunkGraph(
    start: OutputChunkType,
    bundle: Record<string, OutputType>,
    onChunk: (chunk: OutputChunkType) => void,
  ): void {
    const seen = new Set<string>();
    const stack = [start.fileName];

    while (stack.length > 0) {
      const currentFile = stack.pop();
      if (!currentFile || seen.has(currentFile)) {
        continue;
      }

      seen.add(currentFile);
      const current = bundle[currentFile];
      if (!current || current.type !== "chunk") {
        continue;
      }

      onChunk(current);

      for (const next of [...current.imports, ...current.dynamicImports]) {
        stack.push(next);
      }
    }
  }

  return {
    name: "inspect-chunk-order",
    apply: "build" as const,
    generateBundle(_opts: unknown, bundle: Record<string, OutputType>): void {
      const orderedChunkKeys = Object.keys(bundle).filter((fileName) => {
        return bundle[fileName]?.type === "chunk";
      });

      const entries = orderedChunkKeys
        .map((fileName) => bundle[fileName])
        .filter(
          (output): output is OutputChunkType => {
            return output.type === "chunk" && output.isEntry === true;
          },
        );

      const buggyCssByEntry: Record<string, string[]> = {};
      const stableCssByEntry: Record<string, string[]> = {};
      const { collectCssBuggy, getCacheSnapshot } = createBuggyCollector();

      for (const fileName of orderedChunkKeys) {
        const chunk = bundle[fileName];
        if (!chunk || chunk.type !== "chunk" || chunk.isEntry === true) {
          continue;
        }

        collectCssBuggy(chunk, bundle);
      }

      for (const entry of entries) {
        console.log(
          `[entry] ${entry.fileName} imports: ${entry.imports.join(", ")} dynamic: ${entry.dynamicImports.join(", ")}`,
        );

        walkChunkGraph(entry, bundle, (chunk) => {
          const importedCss = [...(chunk.viteMetadata?.importedCss ?? new Set<string>())];
          console.log(`  [chunk] ${chunk.fileName} css: ${importedCss.join(", ")}`);
        });

        buggyCssByEntry[entry.fileName] = collectCssBuggy(entry, bundle);
        stableCssByEntry[entry.fileName] = collectCssStable(entry, bundle);
      }

      const entryNameByFile = entries.reduce<Record<string, string>>((acc, entry) => {
        acc[entry.fileName] = entry.name ?? entry.fileName;
        return acc;
      }, {});

      const entriesMissingSharedCss = entries
        .filter((entry) => {
          const stable = stableCssByEntry[entry.fileName] ?? [];
          const buggy = buggyCssByEntry[entry.fileName] ?? [];

          const stableHasSharedCss = stable.some((file) => file.includes("shared-") && file.endsWith(".css"));
          const buggyHasSharedCss = buggy.some((file) => file.includes("shared-") && file.endsWith(".css"));

          return stableHasSharedCss && !buggyHasSharedCss;
        })
        .map((entry) => entryNameByFile[entry.fileName]);

      const report = {
        orderedChunkKeys,
        entries: entries.map((entry) => ({
          fileName: entry.fileName,
          name: entry.name ?? "",
          imports: [...entry.imports],
          dynamicImports: [...entry.dynamicImports],
        })),
        warmedNonEntryChunks: orderedChunkKeys.filter((fileName) => {
          const output = bundle[fileName];
          return output?.type === "chunk" && output.isEntry !== true;
        }),
        buggyCacheAfterWarmup: getCacheSnapshot(),
        buggyCssByEntry,
        stableCssByEntry,
        entriesMissingSharedCss,
      };

      mkdirSync(dirname(reportFile), { recursive: true });
      writeFileSync(reportFile, JSON.stringify(report, null, 2));

      console.log(`[report] ${reportFile}`);
    },
  };
}

export default defineConfig({
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        a: "./src/a.ts",
        b: "./src/b.ts",
        c: "./src/c.ts",
      },
    },
  },
  plugins: [inspectChunkOrder()],
});
