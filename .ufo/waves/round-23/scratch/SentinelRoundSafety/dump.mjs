import { readFileSync, writeFileSync } from "node:fs";
const D = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23";
const spec = JSON.parse(readFileSync(`${D}/w1-spec.json`, "utf8"));
const disp = JSON.parse(readFileSync(`${D}/w1-dispatch.json`, "utf8"));
writeFileSync(`${D}/scratch/SentinelRoundSafety/context.txt`, spec.context);
const want = process.argv.slice(2);
let out = "";
for (const n of want) {
  const it = spec.items.find((i) => i.name === n);
  const dt = disp.taskCall.tasks.find((t) => t.name === n);
  out += `\n######## ${n} [${it.role}] spec ########\n${it.prompt}\n`;
  out += `\n######## ${n} dispatch ########\n${dt ? dt.task : "<absent>"}\n`;
}
writeFileSync(`${D}/scratch/SentinelRoundSafety/items.txt`, out);
console.log(out);
