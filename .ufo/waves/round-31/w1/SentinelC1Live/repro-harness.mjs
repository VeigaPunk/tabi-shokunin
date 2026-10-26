// Loads the FROZEN counter's own source as a function body (imports supplied
// as parameters, `export ` stripped, trailing main() removed) so that
// normalise/hostOf/liveOk/evaluate can be exercised verbatim. Nothing is
// re-implemented; the source text is the file on disk.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as path from "node:path";
import * as url from "node:url";
import * as fs from "node:fs";
import * as os from "node:os";
import * as crypto from "node:crypto";
import * as cp from "node:child_process";

const file = process.env.COUNTER;
const src = readFileSync(file, "utf8");
const names = [];
const params = [];
for (const m of src.matchAll(/^import \{([^}]+)\} from "node:([a-z]+)";$/gm)) {
  const mod = m[2] === "child_process" ? cp : m[2] === "path" ? path : m[2] === "url" ? url
    : m[2] === "fs" ? fs : m[2] === "os" ? os : crypto;
  for (const n of m[1].split(",").map((s) => s.trim())) { names.push(n); params.push(mod[n]); }
}
let body = src.replace(/^#![^\n]*\n/, "")
  .replace(/^import .*$/gm, "")
  .replace(/^export /gm, "")
  .replace(/import\.meta\.url/g, JSON.stringify("file://" + file))
  .replace(/\nmain\(\);\s*$/, "\n");
const wanted = process.argv[3] ? process.argv[3].split(",") : ["normalise", "hostOf", "liveOk", "evaluate", "parseTable"];
const factory = new Function(...names, body + `\nreturn { ${wanted.join(", ")} };`);
export const mod = factory(...params);
export { src };
