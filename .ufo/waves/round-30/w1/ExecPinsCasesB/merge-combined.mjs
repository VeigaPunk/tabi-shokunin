import { readFileSync, writeFileSync } from "node:fs";
const gate = process.argv[2], patch = process.argv[3];
const src = readFileSync(gate, "utf8");
const block = readFileSync(patch, "utf8").split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1)).join("\n") + "\n";
const marker = "\n];\n\nfunction makeFixture()";
if (src.split(marker).length !== 2) throw new Error("anchor not unique");
writeFileSync(gate, src.replace(marker, "\n" + block + "];\n\nfunction makeFixture()"));
console.log("MERGED");
