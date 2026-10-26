import { readFileSync } from "node:fs";
const norm = readFileSync("f1.norm.txt", "utf8");
const rows = readFileSync("numeric.tsv", "utf8").trim().split("\n").map(l => l.split("\t"));
const extra = [
  ["Exceeding the rate limit", "If the retry-after response header is present, you should not retry your request until after that many seconds has elapsed."],
  ["Exceeding the rate limit", "Otherwise, wait for at least one minute before retrying."],
  ["Exceeding the rate limit", "If your request continues to fail due to a secondary rate limit, wait for an exponentially increasing amount of time between retries, and throw an error after a specific number of retries."],
  ["Exceeding the rate limit", "Continuing to make requests while you are rate limited may result in the banning of your integration."],
  ["Checking the status of your rate limit", "There is not a way to check the status of your secondary rate limit."],
];
let hit = 0, miss = 0;
for (const [sec, sent] of [...rows, ...extra]) {
  const ok = norm.includes(sent);
  if (ok) hit++; else miss++;
  console.log((ok ? "MATCH" : "MISS ") + " | " + sec + " | " + sent);
}
console.log(`--- match ${hit} miss ${miss}`);
