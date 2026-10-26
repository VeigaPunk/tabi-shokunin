// Build the four ExecPinsCasesB fixtures using the gate's OWN builder (build.mjs is the
// rev-072af95 gate with `main();` removed and evaluate/CASES/makeFixture exported).
import { CASES, makeFixture } from "./build.mjs";
import { mkdirSync, writeFileSync } from "node:fs";

const WANT = [
  "drift-superseder-teaches-without-prefix-unresolved",
  "drift-superseder-not-at-stable-tag-unresolved",
  "absence-404-present-with-marker-unresolved",
  "absence-404-body-lacks-marker-unresolved",
];
const root = process.argv[2];
const out = {};
for (const id of WANT) {
  const c = CASES.find((x) => x.id === id);
  if (!c) throw new Error(`case absent: ${id}`);
  const fx = makeFixture();
  c.build(fx);
  const head = fx.commit();
  out[id] = { root: fx.root, head, expectedExit: c.exit, expectedUnresolved: c.unresolved, expectedReasons: c.reasons ?? null };
}
mkdirSync(root, { recursive: true });
writeFileSync(`${root}/fixtures.json`, JSON.stringify(out, null, 2) + "\n");
for (const [id, v] of Object.entries(out)) console.log(`FIXTURE id=${id} head=${v.head} root=${v.root}`);
