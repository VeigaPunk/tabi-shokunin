import { readFileSync } from "node:fs";
const raw = readFileSync("s121-live.html", "utf8");
const show = (label, needle, before, after) => {
  let from = 0, n = 0;
  for (;;) {
    const i = raw.indexOf(needle, from);
    if (i < 0) break;
    n++;
    console.log(`--- ${label} #${n} @${i}`);
    console.log(raw.slice(Math.max(0, i - before), i + after).replace(/\n+/g, " ⏎ "));
    from = i + needle.length;
    if (n >= 6) break;
  }
  if (!n) console.log(`--- ${label}: NOT FOUND`);
};
show("li-bullet 'Make too many'", "Make too many", 300, 700);
show("anchor calculating", 'id="calculating', 200, 200);
show("href calculating", "calculating-points", 150, 150);
