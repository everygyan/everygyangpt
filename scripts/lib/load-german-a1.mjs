import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Compile the same pure catalog mapper used by the website, avoiding divergent seeds/PDFs.
export function loadA1() {
  const source = JSON.parse(fs.readFileSync(new URL("../../data/german-a1-source.json", import.meta.url), "utf8"));
  const code = fs.readFileSync(new URL("../../data/german-a1.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, require: (name) => {
    if (name !== "./german-a1-source.json") throw new Error(`Unexpected catalog import: ${name}`);
    return source;
  } });
  return JSON.parse(JSON.stringify(exports.germanA1Lessons));
}
