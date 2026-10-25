#!/usr/bin/env node
// check-bfcache-receipt.mjs — tabi lane gate: C1 depth (observed bfcache restore receipt).
//
// Verdict: 0 clean (receipt present, valid, restores>=1), 1 failed (present but
//          invalid, or restores=0), 2 could-not-evaluate (usage, missing receipt
//          at the revision, git failure, unexpected error). Any other nonzero
//          code is undeclared and reads as could-not-evaluate.
// Self-test: `--selftest` (isolated cases over temp fixtures; asserts exit code
//          AND stable finding id; creates and removes its own temp trees even on
//          a crash).
// Pinned values: the expected exit/finding table is the CASES constant in this
//          file; corpus/evidence/round-25/bfcache/ carries the round's receipt.
// Write scope: stdout/stderr only. Production reads committed git blobs only.
// Owner: tabi L1.
//
// What it decides
// ---------------
// The receipt is `corpus/evidence/round-25/bfcache/receipt.json` (schema
// tabi-bfcache-journey-v1). The counter verifies:
//   f1-missing-receipt   no receipt at the measured revision -> could-not-evaluate.
//   f2-invalid-schema     JSON does not parse or lacks run/steps/events/summary.
//   f3-no-history-step     run.steps contains no goBack step AND run.history_result.ok
//                          is not true (the harness records the CDP result of the
//                          history step; Page.goBack does not exist on this build,
//                          so a failed/absent step is not a history step).
//   f4-forbidden-flag      flags_effective includes --disable-back-forward-cache or
//                          a --disable-features list containing BackForwardCache.
//   f5-event-digest        events_sha256 does not match sha256 of the raw events array.
//   f6-restore-mismatch    summary.restores != count of distinct BackForwardCacheRestore
//                          events; duplicate events and restores exceeding goBack steps
//                          are findings.
//   f7-non-loopback        every step URL must be http://127.0.0.1:<port>/...
//   f8-loaderid-continuity a restore event must carry the same loaderId as the
//                          original Navigation event for the same URL; missing loaderId
//                          is a finding.
//   f9-page-witness        run.page_side must record persisted=true and
//                          state_survived=true (pageshow.persisted + a window marker
//                          that survives the restore).
//   f12-notused-contradiction  when restores>=1, no Page.backForwardCacheNotUsed event
//                          may appear in other_events.
//   f13-history-index      run.history_result must record currentIndex_after =
//                          currentIndex_before - 1 (the history index dropped by one).
// Findings are stable ids; the counted field is `restores` (integer, null when
// invalid). Exit 0 only when valid && restores>=1.
//
// Usage:
//   node scripts/check-bfcache-receipt.mjs --rev <40-hex-or-ref> [--json]
//   node scripts/check-bfcache-receipt.mjs --selftest [--json]
//   node scripts/check-bfcache-receipt.mjs --repo <dir> --rev <ref> [--json]   (tests)
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SCHEMA = "tabi-bfcache-journey-v1";
const SELFTEST_SCHEMA = "tabi-bfcache-selftest-v1";
const RECEIPT_PATH = "corpus/evidence/round-25/bfcache/receipt.json";
const LANE = join(dirname(fileURLToPath(import.meta.url)), "..");

const sha = (b) => createHash("sha256").update(b).digest("hex");

class Refusal extends Error {
  constructor(message) {
    super(message);
    this.name = "Refusal";
  }
}

function git(repo, args) {
  const env = {};
  for (const k of Object.keys(process.env)) {
    if (!k.startsWith("GIT_")) env[k] = process.env[k];
  }
  const r = spawnSync("git", ["--no-replace-objects", "-C", repo, ...args], { encoding: "utf8", env, timeout: 20000, maxBuffer: 16 * 1024 * 1024 });
  if (r.error) throw new Refusal(`git ${args[0]} failed: ${r.error.message}`);
  return { out: r.stdout ?? "", status: r.status };
}

function resolveRev(repo, rev) {
  const r = git(repo, ["rev-parse", "--verify", "--end-of-options", `${rev}^{commit}`]);
  if (r.status !== 0) throw new Refusal(`git rev-parse ${rev} failed: ${r.stderr.trim()}`);
  return r.out.trim();
}

function readBlob(repo, rev, path) {
  const r = git(repo, ["show", `${rev}:${path}`]);
  if (r.status !== 0) return null;
  return r.out;
}

function score(repo, rev) {
  const findings = [];
  let blob;
  try {
    blob = readBlob(repo, rev, RECEIPT_PATH);
  } catch (e) {
    return { schema: SCHEMA, rev, valid: false, restores: null, findings: [{ class: "f1-missing-receipt", detail: e.message }], clean: false, exit: 2 };
  }
  if (blob === null) {
    return { schema: SCHEMA, rev, valid: false, restores: null, findings: [{ class: "f1-missing-receipt", detail: `no receipt at ${rev}:${RECEIPT_PATH}` }], clean: false, exit: 2 };
  }
  if (blob.length > 5_000_000) {
    return { schema: SCHEMA, rev, valid: false, restores: null, findings: [{ class: "f2-invalid-schema", detail: "receipt too large" }], clean: false, exit: 1 };
  }
  let r;
  try {
    r = JSON.parse(blob);
  } catch (e) {
    return { schema: SCHEMA, rev, valid: false, restores: null, findings: [{ class: "f2-invalid-schema", detail: e.message }], clean: false, exit: 1 };
  }
  if (r.schema !== SCHEMA || !r.run || !Array.isArray(r.run.steps) || !Array.isArray(r.events) || !r.summary || typeof r.summary.restores !== "number") {
    findings.push({ class: "f2-invalid-schema", detail: "schema/run/steps/events/summary shape" });
  }
  const steps = Array.isArray(r.run?.steps) ? r.run.steps : [];
  const historyOk = r.run?.history_result && r.run.history_result.ok === true && typeof r.run.history_result.method === "string";
  if (!steps.some((s) => String(s.action) === "goBack") || !historyOk) {
    findings.push({ class: "f3-no-history-step", detail: `steps=${steps.length} history_result=${JSON.stringify(r.run?.history_result)}` });
  }
  const badUrl = steps.find((s) => typeof s.url !== "string" || !/^http:\/\/127\.0\.0\.1:\d+/.test(s.url));
  if (badUrl) {
    findings.push({ class: "f7-non-loopback", detail: `step ${badUrl.seq} url=${badUrl.url}` });
  }
  const flags = Array.isArray(r.run?.flags_effective) ? r.run.flags_effective : [];
  const forbiddenFlag = flags.some((f) => {
    const s = String(f);
    if (s.includes("disable-back-forward-cache")) return true;
    if (s.includes("disable-features=")) {
      const list = s.slice(s.indexOf("disable-features=") + "disable-features=".length);
      return list.split(",").some((t) => t.toLowerCase().includes("backforwardcache"));
    }
    return false;
  });
  if (forbiddenFlag) {
    findings.push({ class: "f4-forbidden-flag", detail: `flags_effective=${JSON.stringify(flags)}` });
  }
  const events = Array.isArray(r.events) ? r.events : [];
  if (typeof r.events_sha256 !== "string" || sha(Buffer.from(JSON.stringify(events))) !== r.events_sha256) {
    findings.push({ class: "f5-event-digest", detail: "events_sha256 missing or mismatch" });
  }
  const restoreEvents = events.filter((e) => e && e.method === "Page.frameNavigated" && e.params && e.params.type === "BackForwardCacheRestore");
  const distinct = new Set(restoreEvents.map((e) => JSON.stringify(e)));
  if (distinct.size !== restoreEvents.length) {
    findings.push({ class: "f6-restore-mismatch", detail: `duplicate restore events: ${restoreEvents.length - distinct.size}` });
  }
  const restores = distinct.size;
  const goBacks = steps.filter((s) => String(s.action) === "goBack").length;
  if (restores > goBacks) {
    findings.push({ class: "f6-restore-mismatch", detail: `restores=${restores} goBacks=${goBacks}` });
  }
  if (r.summary && r.summary.restores !== restores) {
    findings.push({ class: "f6-restore-mismatch", detail: `summary.restores=${r.summary.restores} distinct=${restores}` });
  }
  const navByUrl = new Map();
  for (const e of events) {
    if (e && e.method === "Page.frameNavigated" && e.params && e.params.type === "Navigation" && typeof e.params.url === "string") {
      navByUrl.set(e.params.url, e.params.loaderId);
    }
  }
  for (const e of restoreEvents) {
    const lid = e.params && e.params.loaderId;
    const expect = navByUrl.get(e.params.url);
    if (typeof lid !== "string" || lid.length === 0 || (expect !== undefined && lid !== expect)) {
      findings.push({ class: "f8-loaderid-continuity", detail: `url=${e.params && e.params.url} loaderId=${lid} expected=${expect}` });
    }
  }
  const ps = r.run?.page_side;
  if (!ps || ps.persisted !== true || ps.state_survived !== true) {
    findings.push({ class: "f9-page-witness", detail: `page_side=${JSON.stringify(ps)}` });
  }
  const other = Array.isArray(r.other_events) ? r.other_events : [];
  if (restores >= 1 && other.some((e) => e && e.method === "Page.backForwardCacheNotUsed")) {
    findings.push({ class: "f12-notused-contradiction", detail: "backForwardCacheNotUsed fired although restores counted" });
  }
  const hr = r.run?.history_result;
  if (!hr || typeof hr.currentIndex_before !== "number" || typeof hr.currentIndex_after !== "number" || hr.currentIndex_after !== hr.currentIndex_before - 1) {
    findings.push({ class: "f13-history-index", detail: `history_result=${JSON.stringify(hr)}` });
  }
  const valid = findings.length === 0;
  const exit = valid ? (restores >= 1 ? 0 : 1) : 1;
  return { schema: SCHEMA, rev, valid, restores: valid ? restores : null, findings, clean: valid && restores >= 1, exit };
}

const CASES = [
  { name: "clean-valid-receipt", exit: 0, finding: null },
  { name: "malformed-schema", exit: 1, finding: "f2-invalid-schema" },
  { name: "no-history-step", exit: 1, finding: "f3-no-history-step" },
  { name: "history-error", exit: 1, finding: "f3-no-history-step" },
  { name: "forgiven-flag", exit: 1, finding: "f4-forbidden-flag" },
  { name: "disable-features-spelling", exit: 1, finding: "f4-forbidden-flag" },
  { name: "non-loopback-url", exit: 1, finding: "f7-non-loopback" },
  { name: "digest-mismatch", exit: 1, finding: "f5-event-digest" },
  { name: "restore-mismatch", exit: 1, finding: "f6-restore-mismatch" },
  { name: "duplicate-restore-event", exit: 1, finding: "f6-restore-mismatch" },
  { name: "restores-exceed-gobacks", exit: 1, finding: "f6-restore-mismatch" },
  { name: "loaderid-mismatch", exit: 1, finding: "f8-loaderid-continuity" },
  { name: "witness-false", exit: 1, finding: "f9-page-witness" },
  { name: "notused-contradiction", exit: 1, finding: "f12-notused-contradiction" },
  { name: "history-index-stale", exit: 1, finding: "f13-history-index" },
  { name: "restores-zero", exit: 1, finding: null },
  { name: "missing-receipt", exit: 2, finding: "f1-missing-receipt" },
];

function fixtureReceipt(over) {
  const base = {
    schema: "tabi-bfcache-journey-v1",
    run: {
      browser: "chromium 154.0.8037.97 (--headless=new)",
      flags_effective: ["--headless=new", "--remote-debugging-port=19412", "--remote-debugging-address=127.0.0.1", "--user-data-dir=/scratch/profile", "--disable-extensions"],
      history_result: { ok: true, method: "Page.navigateToHistoryEntry", currentIndex_before: 2, currentIndex_after: 1 },
      page_side: { persisted: true, state_survived: true },
      steps: [
        { seq: 1, action: "navigate", url: "http://127.0.0.1:19411/a.html" },
        { seq: 2, action: "navigate", url: "http://127.0.0.1:19411/b.html" },
        { seq: 3, action: "goBack", url: "http://127.0.0.1:19411/a.html" },
      ],
    },
    other_events: [],
    events: [
      { seq: 1, method: "Page.frameNavigated", params: { type: "Navigation", url: "http://127.0.0.1:19411/a.html", loaderId: "L1" } },
      { seq: 2, method: "Page.frameNavigated", params: { type: "Navigation", url: "http://127.0.0.1:19411/b.html", loaderId: "L2" } },
      { seq: 3, method: "Page.frameNavigated", params: { type: "BackForwardCacheRestore", url: "http://127.0.0.1:19411/a.html", loaderId: "L1" } },
    ],
    summary: { restores: 1, navigations: 2, goBacks: 1 },
  };
  const merged = {
    ...base,
    ...over,
    run: { ...base.run, ...(over.run ?? {}) },
    events: over.events ?? base.events,
    other_events: over.other_events ?? base.other_events,
    summary: { ...base.summary, ...(over.summary ?? {}) },
  };
  merged.events_sha256 = sha(Buffer.from(JSON.stringify(merged.events)));
  return merged;
}

function selftest() {
  const root = mkdtempSync(join(tmpdir(), "tabi-bfcache-selftest-"));
  try {
    const results = [];
    for (const c of CASES) {
      const r2 = mkdtempSync(join(tmpdir(), "tabi-bfcache-case-"));
      try {
        const repo2 = join(r2, "repo");
        mkdirSync(join(repo2, "corpus/evidence/round-25/bfcache"), { recursive: true });
        git(repo2, ["init", "-q"]);
        git(repo2, ["config", "user.email", "t@t"]);
        git(repo2, ["config", "user.name", "t"]);
        let receipt = null;
        switch (c.name) {
          case "clean-valid-receipt": receipt = fixtureReceipt({}); break;
          case "malformed-schema": receipt = { schema: "tabi-bfcache-journey-v1", run: { steps: [] } }; break;
          case "no-history-step": receipt = fixtureReceipt({ run: { steps: [{ seq: 1, action: "navigate", url: "http://127.0.0.1:19411/a.html" }, { seq: 2, action: "navigate", url: "http://127.0.0.1:19411/b.html" }], history_result: { ok: false, method: "Page.goBack" } } }); break;
          case "history-error": receipt = fixtureReceipt({ run: { history_result: { ok: false, method: "Page.navigateToHistoryEntry" } } }); break;
          case "forgiven-flag": receipt = fixtureReceipt({ run: { flags_effective: ["--disable-back-forward-cache"] } }); break;
          case "disable-features-spelling": receipt = fixtureReceipt({ run: { flags_effective: ["--disable-features=WebMCP,BackForwardCache,Other"] } }); break;
          case "non-loopback-url": receipt = fixtureReceipt({ run: { steps: [{ seq: 1, action: "navigate", url: "https://example.com/a" }, { seq: 2, action: "navigate", url: "http://127.0.0.1:19411/b.html" }, { seq: 3, action: "goBack", url: "http://127.0.0.1:19411/a.html" }] } }); break;
          case "digest-mismatch": { receipt = fixtureReceipt({}); receipt.events_sha256 = "0".repeat(64); break; }
          case "restore-mismatch": receipt = fixtureReceipt({ summary: { restores: 0 } }); break;
          case "duplicate-restore-event": {
            const ev = fixtureReceipt({}).events;
            receipt = fixtureReceipt({ events: [...ev, ev[2]], summary: { restores: 2 } });
            break;
          }
          case "restores-exceed-gobacks": {
            const ev = fixtureReceipt({}).events;
            const dup = { ...ev[2], params: { ...ev[2].params, loaderId: "L1" } };
            receipt = fixtureReceipt({ events: [...ev, dup], summary: { restores: 2 } });
            break;
          }
          case "loaderid-mismatch": {
            const ev = fixtureReceipt({}).events;
            ev[2].params.loaderId = "L9";
            receipt = fixtureReceipt({ events: ev });
            break;
          }
          case "witness-false": receipt = fixtureReceipt({ run: { page_side: { persisted: false, state_survived: false } } }); break;
          case "notused-contradiction": receipt = fixtureReceipt({ other_events: [{ seq: 4, method: "Page.backForwardCacheNotUsed", params: { notRestoredExplanations: [] } }] }); break;
          case "history-index-stale": receipt = fixtureReceipt({ run: { history_result: { ok: true, method: "Page.navigateToHistoryEntry", currentIndex_before: 2, currentIndex_after: 2 } } }); break;
          case "restores-zero": {
            const ev = fixtureReceipt({}).events.slice(0, 2);
            receipt = fixtureReceipt({ events: ev, summary: { restores: 0 } });
            break;
          }
          case "missing-receipt": receipt = null; break;
        }
        if (receipt) {
          const p = join(repo2, "corpus/evidence/round-25/bfcache/receipt.json");
          writeFileSync(p, JSON.stringify(receipt, null, 2) + "\n");
        } else {
          writeFileSync(join(repo2, "corpus/evidence/round-25/bfcache/.keep"), "");
        }
        writeFileSync(join(repo2, "corpus/README.md"), "# fixture\n");
        git(repo2, ["add", "corpus"]);
        git(repo2, ["commit", "-q", "-m", c.name]);
        const rev = git(repo2, ["rev-parse", "HEAD"]).out.trim();
        const s = score(repo2, rev);
        const ok = s.exit === c.exit && (c.finding === null || s.findings.some((f) => f.class === c.finding));
        results.push({ name: c.name, expectedExit: c.exit, expectedFinding: c.finding, gotExit: s.exit, gotFindings: s.findings.map((f) => f.class), ok });
      } finally {
        rmSync(r2, { recursive: true, force: true });
      }
    }
    const passed = results.filter((r) => r.ok).length;
    return { schema: SELFTEST_SCHEMA, cases: results.length, passed, results, clean: passed === results.length, exit: passed === results.length ? 0 : 1 };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const out = (o) => process.stdout.write(JSON.stringify(o, null, json ? 2 : 0) + "\n");
  try {
    if (args.includes("--selftest")) {
      const s = selftest();
      out(s);
      process.exit(s.exit);
    }
    const revIdx = args.indexOf("--rev");
    const repoIdx = args.indexOf("--repo");
    let repo = LANE;
    if (repoIdx !== -1) repo = args[repoIdx + 1];
    if (revIdx === -1) {
      out({ schema: SCHEMA, error: "usage: --rev <40-hex-or-ref> [--json] | --selftest [--json]" });
      process.exit(2);
    }
    const revArg = args[revIdx + 1];
    let rev;
    try {
      rev = resolveRev(repo, revArg);
    } catch (e) {
      out({ schema: SCHEMA, rev: revArg, error: e.message, exit: 2 });
      process.exit(2);
    }
    const s = score(repo, rev);
    out(s);
    process.exit(s.exit);
  } catch (e) {
    out({ schema: SCHEMA, error: e.message, exit: 2 });
    process.exit(2);
  }
}

main();
