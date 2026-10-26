import { readFileSync, writeFileSync } from "node:fs";
import { normalise } from "./extract.mjs";
const buf = readFileSync(process.argv[2]);
const norm = normalise(buf);
writeFileSync(process.argv[3], norm);
console.log(JSON.stringify({ raw_bytes: buf.length, norm_chars: norm.length }));
