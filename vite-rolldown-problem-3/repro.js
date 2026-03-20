import { rolldown } from "rolldown";
import path from "node:path";
import fs from "node:fs";

const root = path.resolve("repro-work");
if (fs.existsSync(root)) fs.rmSync(root, { recursive: true });
fs.mkdirSync(path.join(root, "src"), { recursive: true });

// 1. Create a CommonJS shared module
fs.writeFileSync(
  path.join(root, "src/shared.cjs"),
  `
  module.exports = { message: "I am shared CJS" };
`,
);

// 2. Create Entry A (clean)
fs.writeFileSync(
  path.join(root, "src/entryA.js"),
  `
  import shared from './shared.cjs';
  console.log("Entry A", shared.message);
`,
);

// 3. Create Entry B (side-effect)
fs.writeFileSync(
  path.join(root, "src/entryB.js"),
  `
  import shared from './shared.cjs';
  console.log("CRITICAL BUG: Entry B side-effect triggered!");
`,
);

async function runRepro() {
  const bundle = await rolldown({
    input: {
      entryA: path.join(root, "src/entryA.js"),
      entryB: path.join(root, "src/entryB.js"),
    },
    // This is the trigger
    strictExecutionOrder: true,
  });

  const { output } = await bundle.generate({
    dir: path.join(root, "dist"),
  });

  console.log("\\n--- Generated Chunks ---");
  for (const chunk of output) {
    if (chunk.type === "chunk") {
      console.log(`Chunk: ${chunk.fileName}`);
      console.log(`Importers: ${chunk.imports.join(", ")}`);
      if (chunk.fileName === "entryA.js") {
        if (chunk.code.includes("entryB.js")) {
          console.log(">>> BUG DETECTED: entryA.js imports entryB.js! <<<");
        } else {
          console.log("Clean: entryA.js does not import entryB.js");
        }
      }
    }
  }
}

runRepro().catch(console.error);
