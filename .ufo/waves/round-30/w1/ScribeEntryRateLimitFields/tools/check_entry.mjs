import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const lane = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const entry = readFileSync(join(HERE, '..', 'rate-limit-policy-fields.md'), 'utf8');
const raw = readFileSync(join(HERE, '..', 'bytes', 'ratelimit-headers-11.txt'), 'utf8');
const collapse = (s) => String(s).replace(/\s+/g, ' ').trim();
const words = (s) => collapse(s).split(' ').filter(Boolean).length;
const normalise = (t) => t.replace(/\s+/g, ' ').trim();
const norm = normalise(raw);
const lines = entry.split('\n');
const head = lines.slice(0, 15), body = lines.slice(15).join('\n');
const stripped = body.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
const flat = collapse(stripped);
const out = [];
for (const m of flat.matchAll(/"([^"]{1,600}?)"|“([^”]{1,600}?)”/g)) {
  const q = collapse(m[1] ?? m[2]);
  if (words(q) >= 4) out.push({ q, ok: norm.includes(q) });
}
console.log(JSON.stringify({ headerLines: head.length, head, quoteCount: out.length, failing: out.filter((o) => !o.ok), all: out.map((o) => o.q) }, null, 1));
