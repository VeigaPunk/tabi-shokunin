#!/usr/bin/env node
// check-selfassessment.mjs — tabi lane gate: calibration (self-assessment vs
// observed state).
//
// Verdict: 0 clean, 1 failed (>=1 mismatch), 2 could-not-evaluate (usage,
//          unreadable revision, git failure). Any other nonzero code is
//          undeclared and reads as could-not-evaluate.
// Self-test: `--selftest` (41 isolated cases over temporary sandbox
//          repositories; asserts exit code AND stable finding id; creates and
//          removes its own temp trees, never touches the lane).
// Pinned values: the expected exit/finding table is the CASES constant in this
//          file; corpus/evidence/round-24/ carries the round's measured
//          receipts (c2-measurements.json). v2 (round 31) is frozen by
//          .ufo/waves/round-31/claims.json claim C2 (sha256 recorded there).
// Write scope: stdout/stderr only. Production reads committed git blobs plus
//          the live working tree (m3), and executes ONLY lane `scripts/` gates
//          with their declared self-test flag; every other command string is
//          could-not-evaluate. Self-test writes/deletes only its own temporary
//          repositories under the OS temp dir. Never reads credentials or
//          session material.
// Owner: tabi L1.
//
// What it decides
// ---------------
// Calibration is self-assessment quality (AXES.md): does the lane's own written
// claim match the state a reader can observe? Three classes:
//
//   m1-selftest-tally  A SCORECARD.md OR LOG.md section that names a lane gate
//                      script
//                      (block = one `##` heading section) carries a self-test
//                      tally — `` `--selftest` (N/N) ``, `N-case`, `cases=N`,
//                      `cases: N`, `N cases` — that disagrees with that gate's
//                      OWN self-test
//                      output at the measured revision. The oracle is the gate
//                      binary itself, never a committed receipt (a receipt can
//                      carry the stale figure). A gate whose blob at <rev> is
//                      not byte-identical to the runnable working copy, or
//                      whose
//                      self-test prints no tally, is could-not-evaluate — never
//                      a match. The LOG.md window is the frozen round-26 claim
//                      C1 extension (round 27): same association rule (a tally
//                      belongs to the scripts named on its own line, else to a
//                      single-script section, else could-not-evaluate) and the
//                      correction unit being a paragraph (Markdown wraps one
//                      correction over several lines): a later paragraph clears
//                      an earlier stale mention only when it names the same
//                      script, carries a correction marker, cites the stale line
//                      or a containing LOG.md/SCORECARD.md range, and states the
//                      oracle-correct number via a tally shape. Plain later
//                      claims never clear anything.
//   m2-receipt-exit    A committed evidence receipt that records a command and
//                      its exit must reproduce that exit when the command is
//                      re-run. Only a closed grammar is executed — `git cat-file
//                      -e <rev>:<path>` and `git show <rev>:<path>` — as an argv
//                      array, no shell; every other command is reported
//                      could-not-evaluate and is never counted as a mismatch.
//   m3-unlanded-paths  The newest `## Round N — executed disposition` block in
//                      SCORECARD.md asserts landed work whose evidence pointers
//                      are committed bytes; a non-empty `git status --porcelain`
//                      in the lane contradicts that assertion. Counted once per
//                      run with the porcelain path count.
//
// m4 (v3, round 32) is the stagnation-nudge class: see the m4 section below
// (statement `nudge active|inactive` vs the state AXES.md derives from the
// same round group's axis scores, saturation line, window and the
// capability entry rounds). v3 also refuses a self-test that did not pass
// as an m1 oracle (nonzero exit or a summary verdict other than `clean`).
// v3 is frozen by .ufo/waves/round-32/claims.json claim C2.
//
// Findings are stable ids: m1-selftest-tally, m2-receipt-exit,
// m3-unlanded-paths, m4-nudge-state. The counted field is `mismatches`
// (integer).
//
// Usage:
//   node scripts/check-selfassessment.mjs --rev <40-hex-or-ref> [--json]
//   node scripts/check-selfassessment.mjs --selftest [--json]
//   node scripts/check-selfassessment.mjs --repo <dir> --rev <ref> [--json]   (tests)
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, existsSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SCHEMA = "tabi-selfassessment-v1";
const SELFTEST_SCHEMA = "tabi-selfassessment-selftest-v1";
const LANE = join(dirname(fileURLToPath(import.meta.url)), "..");
const RUNNABLE_GATE = /^scripts\/(check-[a-z0-9-]+\.mjs|round-evidence-audit\.mjs)$/;
const SELF_TEST_FLAG = /--self-?test\b/;

class Refusal extends Error {
  constructor(message) {
    super(message);
    this.name = "Refusal";
  }
}

// ---- git (read-only) --------------------------------------------------------

function git(repo, args) {
  const r = spawnSync("git", ["-C", repo, ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" },
  });
  if (r.error) throw new Refusal(`git ${args[0]} failed: ${r.error.message}`);
  return r;
}

function readBlob(repo, rev, path) {
  const r = git(repo, ["show", `${rev}:${path}`]);
  if (r.status !== 0) return null;
  return r.stdout;
}

function resolveRev(repo, rev) {
  if (!rev || !/^[A-Za-z0-9][A-Za-z0-9._\/-]*$/.test(rev)) throw new Refusal(`bad revision: ${JSON.stringify(rev)}`);
  const r = git(repo, ["rev-parse", "--verify", "--quiet", `${rev}^{commit}`]);
  if (r.status !== 0) throw new Refusal(`revision does not resolve: ${rev}`);
  return r.stdout.trim();
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

// ---- m1: self-test tallies --------------------------------------------------

const SCRIPT_IN_TEXT = /((?:\.{0,2}\/)?scripts\/[A-Za-z0-9_.\/-]+\.mjs)/g;
const TALLY_PATTERNS = [
  /`?--self-?test`?[^\n|]{0,24}?\(?(\d+)\s*\/\s*(\d+)\)?/g,
  /(\d+)-case\b/g,
  /\bcases\s*=\s*(\d+)/g,
  /\b(\d+)\s+(?:isolated\s+)?(?:CLI\s+)?cases\b/g,
];

function sections(docText) {
  const lines = docText.split("\n");
  const out = [];
  let cur = { heading: "(preamble)", start: 1, lines: [] };
  lines.forEach((line, i) => {
    if (/^##\s/.test(line)) {
      out.push(cur);
      cur = { heading: line.trim(), start: i + 1, lines: [] };
    } else {
      cur.lines.push({ line, no: i + 1 });
    }
  });
  out.push(cur);
  return out;
}

function gateTally(repo, rev, script, cache) {
  if (cache.has(script)) return cache.get(script);
  let result;
  if (!RUNNABLE_GATE.test(script)) {
    result = { status: "could-not-evaluate", why: "script outside the runnable gate set" };
  } else {
    const blob = readBlob(repo, rev, script);
    const diskPath = join(repo, script);
    if (blob === null) {
      result = { status: "could-not-evaluate", why: `script absent at ${rev}` };
    } else if (!existsSync(diskPath) || sha256(readFileSync(diskPath, "utf8")) !== sha256(blob)) {
      result = { status: "could-not-evaluate", why: "script at rev is not the runnable working copy" };
    } else {
      const src = blob;
      const flag = SELF_TEST_FLAG.test(src) ? src.match(SELF_TEST_FLAG)[0] : "--selftest";
      const tmp = mkdtempSync(join(tmpdir(), "tabi-selfassessment-"));
      try {
        const r = spawnSync("node", [diskPath, flag], {
          cwd: repo,
          encoding: "utf8",
          timeout: 180000,
          maxBuffer: 32 * 1024 * 1024,
          env: { ...process.env, TMPDIR: tmp, TMP: tmp, TEMP: tmp },
        });
        if (r.error) result = { status: "could-not-evaluate", why: `spawn failed: ${r.error.message}` };
        else {
          const out = `${r.stdout || ""}\n${r.stderr || ""}`;
          // v2 (round 31): a gate's own summary line (`<NAME>_SELFTEST ... cases=N`)
          // is the oracle; per-case lines may carry other `cases=` tokens (round-30
          // lesson M8: a refusal message `cases=2 passed=1` was read as the tally).
          const summaries = [...out.matchAll(/^[A-Z][A-Z0-9_]*_SELFTEST\b[^\n]*?\bcases\s*[=:]\s*(\d+)/gm)];
          const m = summaries.length ? summaries[summaries.length - 1] : (/"?\bcases"?\s*[=:]\s*(\d+)/.exec(out) || /\b(\d+)\s*\/\s*(\d+)\b/.exec(out));
          // v3 (round 32): a self-test that did not pass is never an oracle —
          // a nonzero exit or a summary line whose verdict is not `clean`
          // (round-31 lesson M11) is could-not-evaluate, not a measured tally.
          const verdict = summaries.length ? /\bverdict=([a-z-]+)/.exec(m[0]) : null;
          if (!m) result = { status: "could-not-evaluate", why: "self-test printed no tally" };
          else if (r.status !== 0 || (verdict && verdict[1] !== "clean")) result = { status: "could-not-evaluate", why: `self-test not clean (exit=${r.status}${verdict ? ` verdict=${verdict[1]}` : ""})` };
          else result = { status: "measured", tally: Number(m[1]), exit: r.status, flag };
        }
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    }
  }
  cache.set(script, result);
  return result;
}

function m1Findings(repo, rev, docText, cache) {
  const findings = [];
  for (const sec of sections(docText)) {
    const scripts = new Set();
    for (const { line } of sec.lines) for (const m of line.matchAll(SCRIPT_IN_TEXT)) scripts.add(m[1].replace(/^\.\//, ""));
    if (!scripts.size) continue;
    for (const { line, no } of sec.lines) {
      if (!/self-?test|case/.test(line)) continue;
      const claims = [];
      let fractionOk = true;
      for (const m of line.matchAll(/`?--self-?test`?[^\n|]{0,24}?\(?(\d+)\s*\/\s*(\d+)\)?/g)) {
        if (Number(m[1]) !== Number(m[2])) fractionOk = false;
        claims.push(Number(m[1]));
      }
      for (const re of [/(\d+)-case\b/g, /\bcases\s*=\s*(\d+)/g, /\b(\d+)\s+(?:isolated\s+)?(?:CLI\s+)?cases\b/g]) {
        for (const m of line.matchAll(re)) claims.push(Number(m[1]));
      }
      if (!claims.length) continue;
      if (!fractionOk) {
        findings.push({ class: "m1-selftest-tally", doc: "SCORECARD.md", line: no, script: null, claimed: claims[0], observed: null, superseded: false, couldNotEvaluate: "malformed fraction claim (N !== M)" });
        continue;
      }
      // Association is per line: a tally belongs to the scripts named on its
      // own line, else to the section's single script, else it is ambiguous and
      // is reported could-not-evaluate (never compared against a cross-product).
      const lineScripts = new Set();
      for (const m of line.matchAll(SCRIPT_IN_TEXT)) lineScripts.add(m[1].replace(/^\.\//, ""));
      const targets = lineScripts.size ? [...lineScripts] : scripts.size === 1 ? [...scripts] : [];
      if (!targets.length) {
        findings.push({ class: "m1-selftest-tally", doc: "SCORECARD.md", line: no, script: null, claimed: claims[0], observed: null, superseded: false, couldNotEvaluate: "ambiguous script association" });
        continue;
      }
      for (const script of targets) {
        const oracle = gateTally(repo, rev, script, cache);
        if (oracle.status !== "measured") {
          findings.push({ class: "m1-selftest-tally", doc: "SCORECARD.md", line: no, script, claimed: claims[0], observed: null, superseded: false, couldNotEvaluate: oracle.why });
          continue;
        }
        findings.push({ class: "m1-selftest-tally", doc: "SCORECARD.md", line: no, script, claimed: claims[0], observed: oracle.tally, superseded: false, lineText: line });
      }
    }
  }
  // supersession: a later line clears an earlier stale mention only when it (a)
  // names the same script, (b) states the oracle-correct number, (c) carries a
  // correction marker, and (d) cites the superseded line (or restates the figure).
  // Plain later claims never clear anything; an unmarked claim leaves the stale
  // mention standing. (Falsified and hardened in wave 2: CritSupersessionGaming.)
  for (const f of findings) {
    if (f.observed === null || f.observed === f.claimed) continue;
    f.superseded = findings.some((g) =>
      g.script === f.script &&
      g.line > f.line &&
      g.observed === g.claimed &&
      g.observed === f.observed &&
      /supersed|correct|replace|replac|superseding/i.test(g.lineText || "") &&
      citesLine(g.lineText || "", "SCORECARD.md", f.line));
  }
  return findings;
}

// ---- m1 LOG.md window (frozen round-26 claim C1, executed round 27) ---------

function statedTallyNumbers(text) {
  const out = [];
  for (const m of text.matchAll(/`?--self-?test`?[^\n|]{0,24}?\(?(\d+)\s*\/\s*(\d+)\)?/g)) { out.push(Number(m[1]), Number(m[2])); }
  for (const m of text.matchAll(/(\d+)-case\b/g)) out.push(Number(m[1]));
  for (const m of text.matchAll(/\bcases\s*[:=]\s*(\d+)/g)) out.push(Number(m[1]));
  for (const m of text.matchAll(/\b(\d+)\s+(?:isolated\s+)?(?:CLI\s+)?cases\b/g)) out.push(Number(m[1]));
  for (const m of text.matchAll(/\b(\d+)\s*\/\s*(\d+)\b/g)) { out.push(Number(m[1]), Number(m[2])); }
  return out;
}

function paragraphs(docText) {
  const out = [];
  let cur = null;
  docText.split("\n").forEach((line, i) => {
    if (line.trim() === "") { cur = null; return; }
    if (!cur) { cur = { start: i + 1, lines: [] }; out.push(cur); }
    cur.lines.push(line);
  });
  return out;
}
// A citation clears a stale tally only when it names the stale line's own
// document and a line or range containing it (QUALITY 70; round-28 verifier
// routed defect 3): `SCORECARD.md:N` never clears `LOG.md:N`, nor the reverse;
// `README.md:N` (the lane root README) never clears `corpus/README.md:N`.
function citesLine(text, doc, line) {
  return [...text.matchAll(/(?<![A-Za-z0-9_\/])((?:corpus\/)?(?:LOG|SCORECARD|SKILL|README))\.md:(\d+)(?:-(\d+))?\b/g)]
    .some((match) => {
      if (`${match[1]}.md` !== doc) return false;
      const first = Number(match[2]);
      const last = Number(match[3] || match[2]);
      return first <= line && line <= last;
    });
}


// The paragraph-correction window (LOG.md since round 27; SKILL.md and
// corpus/README.md since round 31, frozen claim C2): same association rule as
// the SCORECARD window — except that in the round-31 windows (lineOnly) a
// tally belongs only to the scripts named on its own line (no section
// fallback: registry and frontier sections narrate several gates, and a
// historical receipt count is not the section gate's tally); a later paragraph
// clears a stale mention only when it names the same script, carries a
// correction marker, cites the stale line in the same document and states the
// oracle-correct number via a tally shape.
function m1LogFindings(repo, rev, logText, cache, doc = "LOG.md", lineOnly = false) {
  const findings = [];
  for (const sec of sections(logText)) {
    const scripts = new Set();
    for (const { line } of sec.lines) for (const m of line.matchAll(SCRIPT_IN_TEXT)) scripts.add(m[1].replace(/^\.\//, ""));
    if (!scripts.size) continue;
    for (const { line, no } of sec.lines) {
      if (!/self-?test|case/.test(line)) continue;
      const claims = [];
      let fractionOk = true;
      for (const m of line.matchAll(/`?--self-?test`?[^\n|]{0,24}?\(?(\d+)\s*\/\s*(\d+)\)?/g)) {
        if (Number(m[1]) !== Number(m[2])) fractionOk = false;
        claims.push(Number(m[1]));
      }
      for (const re of [/(\d+)-case\b/g, /\bcases\s*=\s*(\d+)/g, /\b(\d+)\s+(?:isolated\s+)?(?:CLI\s+)?cases\b/g]) {
        for (const m of line.matchAll(re)) claims.push(Number(m[1]));
      }
      if (!claims.length) continue;
      if (!fractionOk) {
        findings.push({ class: "m1-selftest-tally", doc, line: no, script: null, claimed: claims[0], observed: null, superseded: false, couldNotEvaluate: "malformed fraction claim (N !== M)" });
        continue;
      }
      // Association is per line, exactly as in the SCORECARD window: a tally
      // belongs to the scripts named on its own line, else to the section's
      // single script, else it is ambiguous and is reported could-not-evaluate.
      const lineScripts = new Set();
      for (const m of line.matchAll(SCRIPT_IN_TEXT)) lineScripts.add(m[1].replace(/^\.\//, ""));
      const targets = lineScripts.size ? [...lineScripts] : !lineOnly && scripts.size === 1 ? [...scripts] : [];
      if (!targets.length) {
        findings.push({ class: "m1-selftest-tally", doc, line: no, script: null, claimed: claims[0], observed: null, superseded: false, couldNotEvaluate: "ambiguous script association" });
        continue;
      }
      for (const script of targets) {
        const oracle = gateTally(repo, rev, script, cache);
        if (oracle.status !== "measured") {
          findings.push({ class: "m1-selftest-tally", doc, line: no, script, claimed: claims[0], observed: null, superseded: false, couldNotEvaluate: oracle.why });
          continue;
        }
        findings.push({ class: "m1-selftest-tally", doc, line: no, script, claimed: claims[0], observed: oracle.tally, superseded: false, lineText: line });
      }
    }
  }
  // Supersession requires a citation naming the stale line (or a containing range).
  const paras = paragraphs(logText);
  for (const f of findings) {
    if (f.observed === null || f.observed === f.claimed) continue;
    f.superseded = paras.some((p) => {
      if (p.start <= f.line) return false;
      const text = p.lines.join("\n");
      const namesScript = [...text.matchAll(SCRIPT_IN_TEXT)].some((m) => m[1].replace(/^\.\//, "") === f.script);
      return namesScript &&
        /supersed|correct/i.test(text) &&
        citesLine(text, doc, f.line) &&
        statedTallyNumbers(text).includes(f.observed);
    });
  }
  return findings;
}



const SAFE_GIT = /^git (?:-C \S+ )?(cat-file -e|show) ([0-9a-fA-F]{7,40}:[A-Za-z0-9_.\/-]+)$/;

function m2Findings(repo, rev) {
  const findings = [];
  const ls = git(repo, ["ls-tree", "-r", "--name-only", rev, "corpus/evidence"]);
  if (ls.status !== 0) return findings;
  for (const path of ls.stdout.split("\n").filter((p) => p.endsWith(".json"))) {
    const text = readBlob(repo, rev, path);
    if (!text) continue;
    let doc;
    try {
      doc = JSON.parse(text);
    } catch {
      continue;
    }
    const stack = [doc];
    while (stack.length) {
      const node = stack.pop();
      if (!node || typeof node !== "object") continue;
      if (Array.isArray(node)) {
        stack.push(...node);
        continue;
      }
      const command = typeof node.command === "string" ? node.command.trim() : null;
      const exit = typeof node.exit === "number" ? node.exit : null;
      if (command && exit !== null) {
        const m = SAFE_GIT.exec(command);
        if (!m) {
          findings.push({ class: "m2-receipt-exit", doc: path, line: null, command, claimed: exit, observed: null, superseded: false, couldNotEvaluate: "command outside the closed re-run grammar" });
        } else {
          const r = spawnSync("git", ["-C", repo, m[1] === "show" ? "show" : "cat-file", ...(m[1] === "cat-file -e" ? ["-e", m[2]] : [m[2]])], {
            encoding: "utf8",
            maxBuffer: 8 * 1024 * 1024,
          });
          findings.push({ class: "m2-receipt-exit", doc: path, line: null, command, claimed: exit, observed: r.status, superseded: false });
        }
      }
      for (const v of Object.values(node)) if (v && typeof v === "object") stack.push(v);
    }
  }
  return findings;
}

// ---- m3: unlanded paths -----------------------------------------------------

function m3Findings(repo, docText) {
  const newest = [...docText.matchAll(/^##\s+Round\s+(\d+)\s+—\s+executed disposition/gm)]
    .map((m) => ({ round: Number(m[1]), index: m.index }))
    .sort((a, b) => b.round - a.round)[0];
  if (!newest) return [];
  const r = spawnSync("git", ["-C", repo, "status", "--porcelain", "--untracked-files=all"], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  if (r.error) throw new Refusal(`git status failed: ${r.error.message}`);
  const paths = r.stdout.split("\n").filter(Boolean);
  if (!paths.length) return [];
  return [{ class: "m3-unlanded-paths", doc: "SCORECARD.md", line: null, round: newest.round, claimed: "landed", observed: paths.length, superseded: false }];
}

// ---- m4: stagnation-nudge state (v3, round 32) --------------------------------
//
// AXES.md §The stagnation nudge: the nudge is ACTIVE for round N when every
// axis sits at or above the saturation line AND no capability entered the table
// within the stagnation window (rounds N-W .. N-1). A round group is every `##`
// section whose heading starts `Round N` (also `RoundN`). Inputs come from the
// same group's own text (whitespace collapsed across lines): `Axes at round
// start:` followed by all six `<axis> <score>` pairs, and `Saturation S /
// window W`. Capability entry rounds come from the whole SCORECARD.md: prose
// `First-working round: N` and the last cell of rows under a table header
// naming `First-working round`. Each statement `nudge [is] active|inactive` in
// the group is compared with the derived state; a statement whose group lacks
// the axis or saturation inputs is could-not-evaluate (never a mismatch). A
// later paragraph clears a stale statement only when it carries a correction
// marker, cites the statement's line (`SCORECARD.md:N` or a range containing
// it) and states the derived state (`nudge [was|is] <state>`).

const AXIS_NAMES = ["depth", "coverage", "operability", "freshness", "calibration", "adjacency"];

export function capabilityRounds(docText) {
  const out = new Set();
  for (const m of docText.matchAll(/First-working round:\s*(\d+)/gi)) out.add(Number(m[1]));
  const lines = docText.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    if (!/^\s*\|.*First-working round\s*\|\s*$/i.test(lines[i])) continue;
    for (let j = i + 1; j < lines.length && /^\s*\|/.test(lines[j]); j += 1) {
      if (/^\s*\|[\s:|-]+\|\s*$/.test(lines[j])) continue;
      const cells = lines[j].trim().replace(/^\||\|$/g, "").split("|");
      const m = /(\d+)/.exec(cells[cells.length - 1] || "");
      if (m) out.add(Number(m[1]));
    }
  }
  return [...out].sort((a, b) => a - b);
}

export function m4Findings(docText) {
  const lines = docText.split("\n");
  const caps = capabilityRounds(docText);
  const groups = new Map();
  let cur = null;
  lines.forEach((line, i) => {
    if (/^##\s/.test(line)) {
      const m = /^##\s+Round\s*(\d+)\b/i.exec(line);
      cur = m ? Number(m[1]) : null;
      if (cur !== null && !groups.has(cur)) groups.set(cur, []);
    }
    if (cur !== null) groups.get(cur).push({ line, no: i + 1 });
  });
  const paras = paragraphs(docText);
  const findings = [];
  for (const [round, gl] of groups) {
    let flat = "";
    const offsets = [];
    for (const { line, no } of gl) { offsets.push({ at: flat.length, no }); flat += `${line} `; }
    const lineAt = (pos) => { let no = offsets[0].no; for (const o of offsets) { if (o.at <= pos) no = o.no; else break; } return no; };
    const text = flat.replace(/\s/g, " ");
    const axesM = /Axes at round start:\s*([^]{0,240})/i.exec(text);
    const scores = {};
    if (axesM) for (const m of axesM[1].matchAll(/\b(depth|coverage|operability|freshness|calibration|adjacency)\s+(\d+)/gi)) { const k = m[1].toLowerCase(); if (!(k in scores)) scores[k] = Number(m[2]); }
    const satM = /\bsaturation\s+(?:line\s*)?\**(\d+)\**\s*\/\s*(?:stagnation\s+)?window\s*(?:N\s*=\s*)?\**(\d+)\**/i.exec(text);
    for (const m of text.matchAll(/\bnudge\s+(?:is\s+)?(inactive|active)\b/gi)) {
      const no = lineAt(m.index);
      const claimed = m[1].toLowerCase();
      let observed = null;
      let why = null;
      if (!AXIS_NAMES.every((a) => a in scores)) why = "no `Axes at round start:` with all six axes in the round group";
      else if (!satM) why = "no `Saturation S / window W` in the round group";
      else {
        const line = Number(satM[1]);
        const window = Number(satM[2]);
        const allAtLine = AXIS_NAMES.every((a) => scores[a] >= line);
        const recent = caps.some((c) => c >= round - window && c <= round - 1);
        observed = allAtLine && !recent ? "active" : "inactive";
      }
      const f = { class: "m4-nudge-state", doc: "SCORECARD.md", line: no, round, claimed, observed, superseded: false };
      if (why) f.couldNotEvaluate = why;
      if (observed !== null && observed !== claimed) {
        f.superseded = paras.some((p) => {
          if (p.start <= no) return false;
          const pt = p.lines.join(" ");
          return /supersed|correct/i.test(pt) && citesLine(pt, "SCORECARD.md", no) && new RegExp(`\\bnudge\\s+(?:was\\s+|is\\s+)?${observed}\\b`, "i").test(pt);
        });
      }
      findings.push(f);
    }
  }
  return findings;
}

// ---- verdict ----------------------------------------------------------------

export function evaluate(repo, revArg) {
  const rev = resolveRev(repo, revArg);
  const scorecard = readBlob(repo, rev, "SCORECARD.md");
  if (scorecard === null) throw new Refusal(`SCORECARD.md absent at ${rev}`);
  const cache = new Map();
  const logText = readBlob(repo, rev, "LOG.md");
  const logFindings = logText === null ? [] : m1LogFindings(repo, rev, logText, cache);
  const skillText = readBlob(repo, rev, "SKILL.md");
  const skillFindings = skillText === null ? [] : m1LogFindings(repo, rev, skillText, cache, "SKILL.md", true);
  const readmeText = readBlob(repo, rev, "corpus/README.md");
  const readmeFindings = readmeText === null ? [] : m1LogFindings(repo, rev, readmeText, cache, "corpus/README.md", true);
  const findings = [...m1Findings(repo, rev, scorecard, cache), ...logFindings, ...skillFindings, ...readmeFindings, ...m2Findings(repo, rev), ...m3Findings(repo, scorecard), ...m4Findings(scorecard)];
  const counted = findings.filter((f) => f.observed !== null && f.observed !== f.claimed && !f.superseded);
  return {
    schema: SCHEMA,
    rev,
    mismatches: counted.length,
    findings,
    counted: counted.map((f) => ({ class: f.class, doc: f.doc, line: f.line, claimed: f.claimed, observed: f.observed })),
    couldNotEvaluate: findings.filter((f) => f.observed === null).length,
    superseded: findings.filter((f) => f.superseded).length,
    clean: counted.length === 0,
  };
}

// ---- self-test --------------------------------------------------------------

const GATE_SRC = `process.stdout.write("FIXTURE_SELFTEST verdict=clean cases=13 passed=13\\n");\n`;
const NOISY_GATE_SRC = `process.stdout.write("CASE id=pristine refusal=pristine self-test is not clean (exit=3 cases=2 passed=1) PASS\\nFIXTURE_SELFTEST verdict=clean cases=13 passed=13\\n");\n`;

function registryDoc(tally, correction = "") {
  return [
    "# SKILL",
    "",
    "## Round 30 — registry rows",
    "",
    `| fixture | gate | \`node scripts/check-fixture.mjs --rev REV\` | 0/1/2 | \`node scripts/check-fixture.mjs --selftest\` ${tally} | path | stdout | tabi L1 |`,
    ...(correction ? ["", correction] : []),
    "",
  ].join("\n");
}

function fixtureDoc(tally, extra = "") {
  return [
    "# scorecard",
    "",
    "## Round 23 — executed disposition",
    "",
    `| C1 | \`scripts/check-fixture.mjs\` ${tally} | met |`,
    extra,
    "",
  ].join("\n");
}

function logDoc(tallyLine, correction = "") {
  return [
    "# LOG",
    "",
    "## Round 23 — executed disposition",
    "",
    "`scripts/check-fixture.mjs` gate landed.",
    tallyLine,
    ...(correction ? ["", correction] : []),
    "",
  ].join("\n");
}

// Statement line is always 9 (corrections cite `SCORECARD.md:9`); round 5,
// saturation 8 / window 3, so a capability at round 1 is outside the window.
function nudgeDoc({ cap, said, adjacency = 8, wrap = false, correction = "" }) {
  const axes = `Axes at round start: depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency ${adjacency}; Saturation 8 / window 3; nudge`;
  return [
    "# scorecard",
    "",
    "| Capability | What it can now do | Evidence pointer | First-working round |",
    "|---|---|---|---|",
    `| fixture-cap | x | y | ${cap} |`,
    "",
    "## Round 5 — declared claims",
    "",
    ...(wrap ? [axes, `${said}; no axis retired.`] : [`${axes} ${said}; no axis retired.`]),
    "",
    ...(correction ? ["## Round 6 — corrections", "", correction, ""] : []),
  ].join("\n");
}

const CASES = [
  {
    id: "m1-stale-tally",
    exit: 1,
    classes: ["m1-selftest-tally"],
    build: (d) => { d.gate("scripts/check-fixture.mjs"); d.scorecard(fixtureDoc("`--selftest` (12/12)")); },
  },
  {
    id: "m1-correct-tally",
    exit: 0,
    classes: [],
    build: (d) => { d.gate("scripts/check-fixture.mjs"); d.scorecard(fixtureDoc("`--selftest` (13/13)")); },
  },
  {
    id: "m1-stale-then-superseded",
    exit: 0,
    classes: [],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (12/12)", "\n## Round 24 — corrections\n\n`scripts/check-fixture.mjs` `--selftest` (13/13) supersedes the twelve figure at `SCORECARD.md:5`.\n"));
    },
  },
  {
    id: "m1-scorecard-unrelated-citation-not-superseded",
    exit: 1,
    classes: ["m1-selftest-tally"],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (12/12)", "\n## Round 24 — corrections\n\n`scripts/check-fixture.mjs` `--selftest` (13/13) supersedes the stale figure at `SCORECARD.md:999`.\n"));
    },
  },
  {
    id: "m1-scorecard-crossdoc-citation-not-superseded",
    exit: 1,
    classes: ["m1-selftest-tally"],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (12/12)", "\n## Round 24 — corrections\n\n`scripts/check-fixture.mjs` `--selftest` (13/13) supersedes the stale figure at `LOG.md:5`.\n"));
    },
  },
  {
    id: "m1-case-phrase-stale",
    exit: 1,
    classes: ["m1-selftest-tally"],
    build: (d) => { d.gate("scripts/check-fixture.mjs"); d.scorecard(fixtureDoc("12-case in-memory matrix")); },
  },
  {
    id: "m1-ambiguous-association-is-not-counted",
    exit: 0,
    classes: [],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.gate("scripts/check-other.mjs");
      d.scorecard([
        "# scorecard",
        "",
        "## Round 23 — executed disposition",
        "",
        "Both `scripts/check-fixture.mjs` and `scripts/check-other.mjs` are cited here.",
        "The combined matrix is a 12-case one, with no script named on this line.",
        "",
      ].join("\n"));
    },
  },
  {
    id: "m1-no-tally-is-not-a-mismatch",
    exit: 0,
    classes: [],
    build: (d) => { d.gate("scripts/check-fixture.mjs"); d.scorecard(fixtureDoc("evidence retained under corpus/evidence/")); },
  },
  {
    id: "m1-log-stale-tally",
    exit: 1,
    classes: ["m1-selftest-tally"],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.log(logDoc("Non-vacuity: `--selftest` 12/12 across the fixture matrix."));
    },
  },
  {
    id: "m1-log-stale-then-corrected",
    exit: 0,
    classes: [],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.log(logDoc("Non-vacuity: `--selftest` 12/12 across the fixture matrix.", "Correction (supersedes LOG.md:6): `scripts/check-fixture.mjs` `--selftest` measured `cases: 13` at the tip."));
    },
  },
  {
    id: "m1-log-wrong-number-correction",
    exit: 1,
    classes: ["m1-selftest-tally"],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.log(logDoc("Non-vacuity: `--selftest` 12/12 across the fixture matrix.", "Correction (supersedes LOG.md:6): `scripts/check-fixture.mjs` `--selftest` measured `cases: 12` at the tip."));
    },
  },
  {
    id: "m1-log-unrelated-citation-not-superseded",
    exit: 1,
    classes: ["m1-selftest-tally"],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.log(logDoc("Non-vacuity: `--selftest` 12/12 across the fixture matrix.", "Correction (supersedes LOG.md:999): `scripts/check-fixture.mjs` `--selftest` measured `cases: 13` at the tip."));
    },
  },
  {
    id: "m1-log-crossdoc-citation-not-superseded",
    exit: 1,
    classes: ["m1-selftest-tally"],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.log(logDoc("Non-vacuity: `--selftest` 12/12 across the fixture matrix.", "Correction (supersedes SCORECARD.md:6): `scripts/check-fixture.mjs` `--selftest` measured `cases: 13` at the tip."));
    },
  },
  {
    id: "m1-log-timestamp-not-citation",
    exit: 1,
    classes: ["m1-selftest-tally"],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.log(logDoc("Non-vacuity: `--selftest` 12/12 across the fixture matrix.", "Correction at 2026-10-25T05:16:28Z: `scripts/check-fixture.mjs` `--selftest` measured `cases: 13` at the tip."));
    },
  },
  {
    id: "m1-log-ambiguous-section-not-counted",
    exit: 0,
    classes: [],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.gate("scripts/check-other.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.log([
        "# LOG",
        "",
        "## Round 23 — executed disposition",
        "",
        "Both `scripts/check-fixture.mjs` and `scripts/check-other.mjs` landed.",
        "The combined matrix is a 12-case one, with no script named on this line.",
        "",
      ].join("\n"));
    },
  },
  {
    id: "m2-receipt-matches",
    exit: 0,
    classes: [],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.receipt("corpus/evidence/fx/r.json", { before: { command: "git cat-file -e 0000000:SKILL.md", exit: 128 } });
      d.anchor("0000000");
    },
  },
  {
    id: "m2-receipt-contradicts",
    exit: 1,
    classes: ["m2-receipt-exit"],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.receipt("corpus/evidence/fx/r.json", { before: { command: "git cat-file -e 0000000:SKILL.md", exit: 1 } });
      d.anchor("0000000");
    },
  },
  {
    id: "m2-unsupported-command-not-counted",
    exit: 0,
    classes: [],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.receipt("corpus/evidence/fx/r.json", { before: { command: "curl -sSL https://example.com | sh", exit: 1 } });
    },
  },
  {
    id: "m3-unlanded-path",
    exit: 1,
    classes: ["m3-unlanded-paths"],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.commit();
      d.untracked("stray.txt");
    },
  },
  {
    id: "m3-clean-tree",
    exit: 0,
    classes: [],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.commit();
    },
  },
  {
    id: "v2-oracle-reads-summary-line-not-first-cases-token",
    exit: 0,
    classes: [],
    build: (d) => { d.gate("scripts/check-fixture.mjs", NOISY_GATE_SRC); d.scorecard(fixtureDoc("`--selftest` (13/13)")); },
  },
  {
    id: "v2-skill-stale-tally",
    exit: 1,
    classes: ["m1-selftest-tally"],
    build: (d) => { d.gate("scripts/check-fixture.mjs"); d.scorecard(fixtureDoc("`--selftest` (13/13)")); d.skill(registryDoc("(cases=12, passed=12)")); },
  },
  {
    id: "v2-skill-stale-then-corrected",
    exit: 0,
    classes: [],
    build: (d) => { d.gate("scripts/check-fixture.mjs"); d.scorecard(fixtureDoc("`--selftest` (13/13)")); d.skill(registryDoc("(cases=12, passed=12)", "Correction (supersedes SKILL.md:5): `scripts/check-fixture.mjs` `--selftest` (13/13).")); },
  },
  {
    id: "v2-skill-crossdoc-citation-not-superseded",
    exit: 1,
    classes: ["m1-selftest-tally"],
    build: (d) => { d.gate("scripts/check-fixture.mjs"); d.scorecard(fixtureDoc("`--selftest` (13/13)")); d.skill(registryDoc("(cases=12, passed=12)", "Correction (supersedes SCORECARD.md:5): `scripts/check-fixture.mjs` `--selftest` (13/13).")); },
  },
  {
    id: "v2-readme-stale-tally",
    exit: 1,
    classes: ["m1-selftest-tally"],
    build: (d) => { d.gate("scripts/check-fixture.mjs"); d.scorecard(fixtureDoc("`--selftest` (13/13)")); d.readme(registryDoc("cases=12")); },
  },
  {
    id: "v2-readme-root-citation-not-corpus",
    exit: 1,
    classes: ["m1-selftest-tally"],
    build: (d) => { d.gate("scripts/check-fixture.mjs"); d.scorecard(fixtureDoc("`--selftest` (13/13)")); d.readme(registryDoc("cases=12", "Correction (supersedes README.md:5): `scripts/check-fixture.mjs` `--selftest` (13/13).")); },
  },
  {
    id: "v2-readme-stale-then-corrected",
    exit: 0,
    classes: [],
    build: (d) => { d.gate("scripts/check-fixture.mjs"); d.scorecard(fixtureDoc("`--selftest` (13/13)")); d.readme(registryDoc("cases=12", "Correction (supersedes corpus/README.md:5): `scripts/check-fixture.mjs` `--selftest` (13/13).")); },
  },
  {
    id: "v2-readme-no-section-fallback",
    exit: 0,
    classes: [],
    build: (d) => { d.gate("scripts/check-fixture.mjs"); d.scorecard(fixtureDoc("`--selftest` (13/13)")); d.readme(["# corpus", "", "## Round 16", "", "The gate is `scripts/check-fixture.mjs`.", "Historical receipts carried 43 cases from an earlier gate.", ""].join("\n")); },
  },
  {
    id: "v3-failed-summary-is-not-an-oracle",
    exit: 0,
    classes: [],
    build: (d) => { d.gate("scripts/check-fixture.mjs", `process.stdout.write("FIXTURE_SELFTEST verdict=failed cases=12 passed=11\\n"); process.exit(3);\n`); d.scorecard(fixtureDoc("`--selftest` (13/13)")); },
  },
  {
    id: "v3-nonzero-exit-is-not-an-oracle",
    exit: 0,
    classes: [],
    build: (d) => { d.gate("scripts/check-fixture.mjs", `process.stdout.write("FIXTURE_SELFTEST verdict=clean cases=12 passed=12\\n"); process.exit(1);\n`); d.scorecard(fixtureDoc("`--selftest` (13/13)")); },
  },
  {
    id: "m4-stale-inactive",
    exit: 1,
    classes: ["m4-nudge-state"],
    build: (d) => { d.scorecard(nudgeDoc({ cap: 1, said: "inactive" })); },
  },
  {
    id: "m4-inactive-capability-in-window",
    exit: 0,
    classes: [],
    build: (d) => { d.scorecard(nudgeDoc({ cap: 4, said: "inactive" })); },
  },
  {
    id: "m4-inactive-axis-below-line",
    exit: 0,
    classes: [],
    build: (d) => { d.scorecard(nudgeDoc({ cap: 1, said: "inactive", adjacency: 7 })); },
  },
  {
    id: "m4-active-claim-capability-in-window",
    exit: 1,
    classes: ["m4-nudge-state"],
    build: (d) => { d.scorecard(nudgeDoc({ cap: 3, said: "active" })); },
  },
  {
    id: "m4-wrapped-statement-stale",
    exit: 1,
    classes: ["m4-nudge-state"],
    build: (d) => { d.scorecard(nudgeDoc({ cap: 1, said: "inactive", wrap: true })); },
  },
  {
    id: "m4-stale-then-corrected",
    exit: 0,
    classes: [],
    build: (d) => { d.scorecard(nudgeDoc({ cap: 1, said: "inactive", correction: "Correction (supersedes `SCORECARD.md:9`): the stagnation nudge was active for round 5." })); },
  },
  {
    id: "m4-correction-uncited",
    exit: 1,
    classes: ["m4-nudge-state"],
    build: (d) => { d.scorecard(nudgeDoc({ cap: 1, said: "inactive", correction: "Correction: the stagnation nudge was active for round 5." })); },
  },
  {
    id: "m4-correction-wrong-state",
    exit: 1,
    classes: ["m4-nudge-state"],
    build: (d) => { d.scorecard(nudgeDoc({ cap: 1, said: "inactive", correction: "Correction (supersedes `SCORECARD.md:9`): the stagnation nudge was inactive for round 5, as stated." })); },
  },
  {
    id: "m4-inputs-missing-not-counted",
    exit: 0,
    classes: [],
    build: (d) => { d.scorecard(["# scorecard", "", "## Round 5 — waves", "", "- saturation 8 / window 3; stagnation nudge inactive.", ""].join("\n")); },
  },
];

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "tabi-selfassessment-"));
  const run = (args) => {
    const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`fixture git ${args[0]} failed: ${r.stderr}`);
    return r.stdout;
  };
  run(["init", "-q"]);
  run(["config", "user.email", "fixture@tabi.local"]);
  run(["config", "user.name", "tabi-fixture"]);
  const top = run(["rev-parse", "--show-toplevel"]).trim();
  if (top !== root) throw new Error(`fixture root mismatch: ${top} != ${root}`);
  let committed = false;
  const d = {
    root,
    gate(rel, src = GATE_SRC) {
      const abs = join(root, rel);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, src);
    },
    scorecard(text) {
      writeFileSync(join(root, "SCORECARD.md"), text);
    },
    log(text) {
      writeFileSync(join(root, "LOG.md"), text);
    },
    skill(text) {
      writeFileSync(join(root, "SKILL.md"), text);
    },
    readme(text) {
      mkdirSync(join(root, "corpus"), { recursive: true });
      writeFileSync(join(root, "corpus", "README.md"), text);
    },
    receipt(rel, obj) {
      const abs = join(root, rel);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, `${JSON.stringify(obj, null, 2)}\n`);
    },
    anchor(rev) {
      // make the receipt's rev prefix resolve: a real commit whose object is
      // absent proves exit 128 without needing the full hash.
      void rev;
    },
    commit() {
      run(["add", "-A"]);
      run(["commit", "-q", "-m", "fixture"]);
      committed = true;
      return run(["rev-parse", "HEAD"]).trim();
    },
    untracked(rel) {
      writeFileSync(join(root, rel), "stray\n");
    },
    rev() {
      if (!committed) d.commit();
      return run(["rev-parse", "HEAD"]).trim();
    },
  };
  return d;
}

function runSelftest() {
  const results = [];
  for (const c of CASES) {
    const fx = makeFixture();
    try {
      c.build(fx);
      const rev = fx.rev();
      let out;
      let exit = 0;
      try {
        out = evaluate(fx.root, rev);
        exit = out.clean ? 0 : 1;
      } catch (e) {
        if (!(e instanceof Refusal)) throw e;
        exit = 2;
        out = { counted: [{ class: "refused" }] };
      }
      const classes = [...new Set(out.counted.map((f) => f.class))].sort();
      const expected = [...c.classes].sort();
      const ok = exit === c.exit && JSON.stringify(classes) === JSON.stringify(expected);
      results.push({ id: c.id, ok, expectedExit: c.exit, exit, expectedClasses: expected, classes });
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }
  const fx = makeFixture();
  try {
    fx.gate("scripts/check-fixture.mjs");
    fx.scorecard(fixtureDoc("`--selftest` (13/13)"));
    fx.commit();
    for (const rev of ["../etc/passwd", "0000000000000000000000000000000000000000"]) {
      let exit = 0;
      try {
        evaluate(fx.root, rev);
      } catch (e) {
        if (!(e instanceof Refusal)) throw e;
        exit = 2;
      }
      results.push({ id: rev.startsWith("..") ? "refusal-bad-rev-syntax" : "refusal-unresolvable-rev", ok: exit === 2, expectedExit: 2, exit, expectedClasses: ["refused"], classes: exit === 2 ? ["refused"] : [] });
    }
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
  const failed = results.filter((r) => !r.ok);
  return { schema: SELFTEST_SCHEMA, cases: results.length, passed: results.length - failed.length, results, ok: failed.length === 0 };
}

// ---- cli --------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { json: false, selftest: false, rev: null, repo: LANE, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--json") opts.json = true;
    else if (a === "--selftest") opts.selftest = true;
    else if (a === "--help" || a === "-h") opts.help = true;
    else if (a === "--rev") opts.rev = argv[++i];
    else if (a === "--repo") opts.repo = argv[++i];
    else throw new Refusal(`unknown argument: ${a}`);
  }
  return opts;
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`SELFASSESSMENT verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  if (opts.help) {
    console.log("usage: node scripts/check-selfassessment.mjs --rev <REV> [--json] | --selftest [--json]");
    process.exit(0);
  }
  if (opts.selftest) {
    const out = runSelftest();
    if (opts.json) console.log(JSON.stringify(out, null, 2));
    else {
      for (const r of out.results) console.log(`CASE id=${r.id} expected_exit=${r.expectedExit} exit=${r.exit} expected=${r.expectedClasses.join(",") || "-"} actual=${r.classes.join(",") || "-"} ${r.ok ? "PASS" : "FAIL"}`);
      console.log(`SELFASSESSMENT_SELFTEST verdict=${out.ok ? "clean" : "failed"} cases=${out.cases} passed=${out.passed}`);
    }
    process.exit(out.ok ? 0 : 3);
  }
  if (!opts.rev) {
    console.error("SELFASSESSMENT verdict=could-not-evaluate detail=usage: --rev <REV> or --selftest");
    process.exit(2);
  }
  let out;
  try {
    out = evaluate(opts.repo, opts.rev);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`SELFASSESSMENT verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  if (opts.json) console.log(JSON.stringify(out, null, 2));
  else {
    for (const f of out.findings) {
      console.log(`FINDING class=${f.class} doc=${f.doc} line=${f.line ?? "-"} claimed=${f.claimed} observed=${f.observed ?? "-"}${f.superseded ? " superseded" : ""}${f.couldNotEvaluate ? ` could-not-evaluate=${f.couldNotEvaluate}` : ""}`);
    }
    console.log(`SELFASSESSMENT verdict=${out.clean ? "clean" : "failed"} rev=${out.rev} mismatches=${out.mismatches} could_not_evaluate=${out.couldNotEvaluate} superseded=${out.superseded}`);
  }
  process.exit(out.clean ? 0 : 1);
}

main();
