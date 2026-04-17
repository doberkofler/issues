import { defineConfig } from "vite";

type OutputChunkType = {
  type: "chunk";
  readonly fileName: string;
  readonly isEntry?: boolean;
  readonly imports: string[];
  viteMetadata?: {
    readonly importedCss?: Set<string>;
  };
};

type OutputAssetType = {
  type: "asset";
};

type OutputType = OutputChunkType | OutputAssetType;

function inspectChunkOrder() {
  return {
    name: "inspect-chunk-order",
    apply: "build" as const,
    generateBundle(_opts: unknown, bundle: Record<string, OutputType>): void {
      const entries = Object.values(bundle).filter(
        (output): output is OutputChunkType => {
          return output.type === "chunk" && output.isEntry === true;
        },
      );

      for (const entry of entries) {
        console.log(
          `[entry] ${entry.fileName} imports: ${entry.imports.join(", ")}`,
        );

        for (const importFile of entry.imports) {
          const imported = bundle[importFile];
          if (!imported || imported.type !== "chunk") {
            continue;
          }

          const importedCss = [
            ...(imported.viteMetadata?.importedCss ?? new Set<string>()),
          ];
          console.log(
            `  [chunk] ${imported.fileName} css: ${importedCss.join(", ")}`,
          );
        }
      }
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
      },
    },
  },
  plugins: [inspectChunkOrder()],
});
