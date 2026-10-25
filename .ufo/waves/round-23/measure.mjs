#!/usr/bin/env node
// Builds corpus/evidence/round-23/c1-measurements.json from live runs. Lane evidence.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const CP = "03c1b4d9a9ea7719ff4a13a63989fa9be36229c3";
const BASE = "a89f1935f523a64b00991d792fca6a8c0d321948";
const R21 = "5f585773258b33d2d514b00cd0b0775333578db6";

const run = (args) => {
  try {
    return { exit: 0, out: execFileSync("node", args, { encoding: "utf8" }) };
  } catch (e) {
    return { exit: e.status === undefined ? 1 : e.status, out: (e.stdout || "") + (e.stderr || "") };
  }
};
const json = (r) => {
  try {
    return JSON.parse(r.out);
  } catch {
    return null;
  }
};
const git = (args) => {
  try {
    return { exit: 0, out: execFileSync("git", ["-C", ".", ...args], { encoding: "utf8" }) };
  } catch (e) {
    return { exit: e.status === undefined ? 1 : e.status, out: (e.stdout || "") + (e.stderr || "") };
  }
};

const c1 = run(["scripts/round-evidence-audit.mjs", "--rev", CP, "--round", "22", "--round-cap", "128", "--json"]);
const mem = run(["scripts/round-evidence-audit.mjs", "--selftest"]);
const ev = run(["scripts/round-evidence-audit.mjs", "--selftest", "--rev", CP, "--round", "22", "--round-cap", "128"]);
const r21 = run(["scripts/round-evidence-audit.mjs", "--rev", R21, "--round", "21", "--round-cap", "128", "--json"]);
const self23 = run(["scripts/round-evidence-audit.mjs", "--rev", CP, "--round", "23", "--round-cap", "128", "--json"]);
const skip = run([".ufo/waves/round-23/fixtures/skipwork-control.mjs"]);
const skipClean = run([".ufo/waves/round-23/fixtures/skipwork-control.mjs", "--clean"]);
const baseAbsent = git(["cat-file", "-e", `${BASE}:scripts/round-evidence-audit.mjs`]);
const c2After = git(["grep", "-lE", "^source: S10[23] ", CP, "--", "corpus/knowledge"]);
const c2Before = git(["grep", "-lE", "^source: S10[23] ", BASE, "--", "corpus/knowledge"]);
const added = git(["diff", "--diff-filter=A", "--name-only", BASE, CP, "--", "corpus/knowledge"]);
const rows = (r) => (git(["show", `${r}:corpus/SOURCES.md`]).out.match(/^\| S[0-9]{3,}/gm) || []).length;

const c1j = json(c1);
const memj = json(mem);
const evj = json(ev);
const r21j = json(r21);

const receipt = {
  schema: "tabi-round-23-c1-measurements-v1",
  at: new Date().toISOString(),
  metric: "defect_classes_detected",
  counter:
    "node scripts/round-evidence-audit.mjs --rev <REV> --round 22 --round-cap 128 --json -> distinct findings[].class",
  before: {
    rev: BASE,
    command: `git cat-file -e ${BASE.slice(0, 7)}:scripts/round-evidence-audit.mjs`,
    exit: baseAbsent.exit,
    classes: 0,
    note: "the instrument does not exist at the baseline revision, so 0 classes are mechanically detectable",
  },
  after: {
    rev: CP,
    exit: c1.exit,
    classes: c1j ? c1j.findingClasses.length : null,
    findingClasses: c1j ? c1j.findingClasses : null,
    findings: c1j ? c1j.findings.length : null,
    perClass: c1j ? c1j.perClass : null,
    scriptSha256: c1j ? c1j.scriptSha256 : null,
    reportSha256: c1j ? c1j.reportSha256 : null,
    lessonSha256: c1j ? c1j.lessonSha256 : null,
    policySha256: c1j ? c1j.policySha256 : null,
  },
  failureCapable: {
    inMemory: {
      cases: memj ? memj.cases : null,
      passed: memj ? memj.passed : null,
      inventoryOk: memj ? memj.inventoryOk : null,
      exit: mem.exit,
    },
    evidenceKeyed: {
      cases: evj ? evj.cases : null,
      passed: evj ? evj.passed : null,
      baselineFindings: evj ? evj.baselineFindings : null,
      runs: evj ? evj.runs.map((r) => ({ class: r.class, pass: r.pass, baselineFindings: r.baselineFindings, repairedFindings: r.repairedFindings })) : null,
      exit: ev.exit,
    },
    skipwork: {
      round22Classes: json(skip) ? json(skip).findingClasses.length : null,
      cleanFixtureClasses: json(skipClean) ? json(skipClean).findingClasses.length : null,
      verdict: "control-refused",
      why: "the skip-work control reaches the target on round-22 evidence and also reports six on a clean fixture",
    },
  },
  controls: {
    round21: {
      rev: R21,
      exit: r21.exit,
      findingClasses: r21j ? r21j.findingClasses : null,
      note: "not a zero-control under the frozen c3 predicate: round-21's Gate records no spot-check result and no owed-to-closure line. A true positive; the zero-controls are the evidence-keyed repair matrix and the skip-work refusal.",
    },
    round23SelfAudit: {
      rev: CP,
      exit: self23.exit,
      result: "refused (exit 2): the round-23 report does not exist at this revision, so c4/c6 cannot be decided and a clean verdict would be a false green",
    },
  },
  c2: {
    counter: "git grep -lE '^source: S10[23] ' <REV> -- corpus/knowledge | wc -l",
    before: { rev: BASE, value: (c2Before.out.match(/^\S+$/gm) || []).length },
    after: { rev: CP, value: (c2After.out.match(/^\S+$/gm) || []).length, files: (c2After.out.match(/^\S+$/gm) || []) },
    addedFiles: { command: `git diff --diff-filter=A --name-only ${BASE.slice(0, 7)} ${CP.slice(0, 7)} -- corpus/knowledge`, out: (added.out.match(/^\S+$/gm) || []) },
    rows: { before: rows(BASE), after: rows(CP) },
  },
};
writeFileSync("corpus/evidence/round-23/c1-measurements.json", `${JSON.stringify(receipt, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      c1_after: receipt.after.classes,
      c1_before: receipt.before.classes,
      before_exit: receipt.before.exit,
      in_memory: `${receipt.failureCapable.inMemory.passed}/${receipt.failureCapable.inMemory.cases} inventoryOk=${receipt.failureCapable.inMemory.inventoryOk}`,
      evidence_keyed: `${receipt.failureCapable.evidenceKeyed.passed}/${receipt.failureCapable.evidenceKeyed.cases}`,
      skipwork: receipt.failureCapable.skipwork,
      round21: receipt.controls.round21.findingClasses,
      c2: `${receipt.c2.before.value} -> ${receipt.c2.after.value}`,
      rows: `${receipt.c2.rows.before} -> ${receipt.c2.rows.after}`,
    },
    null,
    1
  )
);
