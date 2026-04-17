import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const root = process.cwd();
const reportsDir = resolve(root, "reports");
const distAssetsDir = resolve(root, "dist", "assets");

const run = (command) => {
  execSync(command, { stdio: "inherit", cwd: root });
};

const readReport = (name) => {
  const file = resolve(reportsDir, `${name}.json`);
  return JSON.parse(readFileSync(file, "utf8"));
};

const readDistAssets = () => {
  return readdirSync(distAssetsDir).sort();
};

const normalizeCss = (files) => {
  return [...files]
    .map((file) => basename(file).replace(/-[A-Za-z0-9_-]{6,}(?=\.css$)/, ""))
    .sort();
};

const toNameMap = (report, cssKey) => {
  const byName = {};
  for (const entry of report.entries) {
    const cssFiles = report[cssKey]?.[entry.fileName] ?? [];
    byName[entry.name] = normalizeCss(cssFiles);
  }
  return byName;
};

const listDiff = (left, right) => {
  if (left.length !== right.length) {
    return true;
  }
  return left.some((item, index) => item !== right[index]);
};

const compareByEntry = (left, right) => {
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
  const diff = {};
  for (const key of keys) {
    const l = left[key] ?? [];
    const r = right[key] ?? [];
    if (listDiff(l, r)) {
      diff[key] = { v7: l, v8: r };
    }
  }
  return diff;
};

const main = () => {
  mkdirSync(reportsDir, { recursive: true });
  rmSync(resolve(reportsDir, "build-report.json"), { force: true });

  run("npm run clean");
  run("npm run build");
  run("cp reports/build-report.json reports/v8.json");
  writeFileSync(resolve(reportsDir, "v8-dist.json"), JSON.stringify(readDistAssets(), null, 2));

  run("rm -rf dist");
  run("npx -y vite@7.3.2 build");
  run("cp reports/build-report.json reports/v7.json");
  writeFileSync(resolve(reportsDir, "v7-dist.json"), JSON.stringify(readDistAssets(), null, 2));

  const v7 = readReport("v7");
  const v8 = readReport("v8");
  const v7Dist = JSON.parse(readFileSync(resolve(reportsDir, "v7-dist.json"), "utf8"));
  const v8Dist = JSON.parse(readFileSync(resolve(reportsDir, "v8-dist.json"), "utf8"));

  const v7Buggy = toNameMap(v7, "buggyCssByEntry");
  const v8Buggy = toNameMap(v8, "buggyCssByEntry");
  const v7Stable = toNameMap(v7, "stableCssByEntry");
  const v8Stable = toNameMap(v8, "stableCssByEntry");

  const buggyDiff = compareByEntry(v7Buggy, v8Buggy);
  const stableDiff = compareByEntry(v7Stable, v8Stable);

  const missingImportTargets = (report, distFiles) => {
    const distSet = new Set(distFiles);
    const missing = [];

    for (const entry of report.entries) {
      const imports = [...entry.imports, ...entry.dynamicImports];
      for (const importedFile of imports) {
        const basename = importedFile.replace(/^assets\//, "");
        if (!distSet.has(basename)) {
          missing.push({ entry: entry.name, importedFile });
        }
      }
    }

    return missing;
  };

  const v7MissingImports = missingImportTargets(v7, v7Dist);
  const v8MissingImports = missingImportTargets(v8, v8Dist);

  const markdown = [
    "## Repro result",
    "",
    `- V7 ordered chunks: ${v7.orderedChunkKeys.join(", ")}`,
    `- V8 ordered chunks: ${v8.orderedChunkKeys.join(", ")}`,
    "",
    "## Entry imports missing from emitted dist",
    "",
    "```json",
    JSON.stringify(
      {
        v7: v7MissingImports,
        v8: v8MissingImports,
      },
      null,
      2,
    ),
    "```",
    "",
    "## Missing shared css (buggy collector)",
    "",
    `- V7: ${v7.entriesMissingSharedCss.join(", ") || "none"}`,
    `- V8: ${v8.entriesMissingSharedCss.join(", ") || "none"}`,
    "",
    "## Entry diff for buggy collector (normalized)",
    "",
    "```json",
    JSON.stringify(buggyDiff, null, 2),
    "```",
    "",
    "## Entry diff for stable collector (normalized)",
    "",
    "```json",
    JSON.stringify(stableDiff, null, 2),
    "```",
    "",
  ].join("\n");

  writeFileSync(resolve(reportsDir, "diff.md"), markdown);
  console.log("[report] reports/diff.md");

  if (v8MissingImports.length > v7MissingImports.length) {
    process.exit(0);
  }

  if (Object.keys(buggyDiff).length > 0 && Object.keys(stableDiff).length === 0) {
    process.exit(0);
  }

  process.exit(1);
};

main();
