// Scratch probe (ExecPinsCasesB, round-30 w1): for each of the four target
// catalogue mutants, run one new self-test case against a fixture and print
// the gate's own per-row reasons, so the intended failure path (not f6) is visible.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { createHash } from "node:crypto";

const S = "/fast/scratch/hyaku/tabi-r30/ExecPinsCasesB";
const GATE = join(S, "clone/scripts/check-release-pins.mjs");
const CAT = "/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/gate-mutants.json";
const sha256 = (b) => createHash("sha256").update(b).digest("hex");

const pristine = readFileSync(GATE, "utf8");
const cat = JSON.parse(readFileSync(CAT, "utf8"));
const targets = {
  "pins-s1-supersession-prefix": "drift-superseder-teaches-without-prefix-unresolved",
  "pins-s1-supersession-tag": "drift-superseder-not-at-stable-tag-unresolved",
  "pins-notfound-status": "absence-404-present-with-marker-unresolved",
  "pins-notfound-body": "absence-404-body-lacks-marker-unresolved",
};

const driver = (id) => `
const __target = ${JSON.stringify(id)};
{
  const __c = CASES.find((x) => x.id === __target);
  const __fx = makeFixture();
  try {
    __c.build(__fx);
    const __head = __fx.commit();
    const __out = evaluate(__fx.root, __head, NEW, DEFAULT_RECEIPT);
    console.log(JSON.stringify({ case: __target, rows: __out.rows, clean: __out.clean }));
  } catch (e) {
    console.log(JSON.stringify({ case: __target, error: e.message }));
  } finally {
    rmSync(__fx.root, { recursive: true, force: true });
  }
}
`;

const variants = [{ label: "pristine", src: pristine, ids: Object.values(targets) }];
for (const [mutId, caseId] of Object.entries(targets)) {
  const m = cat.mutants.find((x) => x.id === mutId);
  const n = pristine.split(m.find).length - 1;
  if (n !== 1) throw new Error(`find occurs ${n} times for ${mutId}`);
  const mutant = pristine.replace(m.find, () => m.replace);
  variants.push({ label: mutId, src: mutant, ids: [caseId] });
}

const results = [];
for (const v of variants) {
  for (const caseId of v.ids) {
    const n = v.src.split("\nmain();\n").length - 1;
    if (n !== 1) throw new Error(`main(); occurs ${n} times in ${v.label}`);
    const body = v.src.replace("\nmain();\n", `\n${driver(caseId)}`);
    const dir = mkdtempSync(join(S, "tmp/probe-"));
    const file = join(dir, "probe-gate.mjs");
    writeFileSync(file, body);
    const r = spawnSync(process.execPath, [file], {
      cwd: dir,
      encoding: "utf8",
      timeout: 120000,
      env: { ...process.env, TMPDIR: dir },
    });
    let parsed = null;
    try { parsed = JSON.parse(r.stdout.trim().split("\n").pop()); } catch { parsed = null; }
    rmSync(dir, { recursive: true, force: true });
    results.push({
      variant: v.label,
      exit: r.status,
      rows: parsed && parsed.rows ? parsed.rows.map((x) => ({ id: x.id, resolved: x.resolved, verdict: x.verdict, reasons: x.reasons })) : null,
      error: parsed ? parsed.error ?? null : (r.stderr || "unparseable").slice(0, 400),
    });
  }
}
console.log(JSON.stringify({ gate_sha256: sha256(readFileSync(GATE)), results }, null, 2));
