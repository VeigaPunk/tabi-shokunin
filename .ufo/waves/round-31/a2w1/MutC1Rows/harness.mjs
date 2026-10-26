#!/usr/bin/env node
// MutC1Rows — mutation-test the LANDED C1 decision-table rows at 4860483.
// One mutant per commit in the scratch clone; frozen counter run offline per
// mutant, stdout written to a file (never piped into jq). Restoration after.
// Modes: scan | run | live <label> <rev>
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const SEAT = "MutC1Rows";
const S = "/fast/scratch/hyaku/tabi-r31/MutC1Rows";
const CLONE = join(S, "clone");
const PRISTINE = "486048356f0712e4396588c9dab58cd419243120";
const BASELINE = "96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc";
const ENTRY = "corpus/knowledge/rate-signal-decision-table.md";
const RECEIPTS = "corpus/evidence/round-31/decision-table";
const OUT = join(S, "out");
mkdirSync(OUT, { recursive: true });
mkdirSync(join(S, "tmp"), { recursive: true });

const sha256 = (b) => createHash("sha256").update(b).digest("hex");

function git(args) {
  const r = spawnSync("git", ["-C", CLONE, ...args], { encoding: "buffer", maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${r.stderr.toString().trim()}`);
  return r.stdout;
}

// ---- guards (contract: toplevel check before any commit) ----
const top = git(["rev-parse", "--show-toplevel"]).toString().trim();
if (top !== CLONE) { console.error(`GUARD FAIL toplevel=${top} != ${CLONE}`); process.exit(9); }
const head0 = git(["rev-parse", "HEAD"]).toString().trim();
if (head0 !== PRISTINE) { console.error(`GUARD FAIL HEAD=${head0} != ${PRISTINE}`); process.exit(9); }

// ---- verbatim copy of the frozen counter's normalise (validated below) ----
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'", "#x27": "'", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…" };
function normalise(buf) {
  let t = Buffer.isBuffer(buf) ? buf.toString("utf8") : String(buf);
  if (/<!doctype html|<html[\s>]/i.test(t)) {
    t = t.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
    t = t.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+[0-9]*);/gi, (m, e) => {
      const k = e.toLowerCase();
      if (k.startsWith("#x")) return String.fromCodePoint(parseInt(k.slice(2), 16));
      if (k.startsWith("#") && k !== "#39") return String.fromCodePoint(parseInt(k.slice(1), 10));
      return ENTITIES[k] ?? m;
    });
  }
  return t.replace(/\s+/g, " ").trim();
}

const entryAt = (rev) => git(["show", `${rev}:${ENTRY}`]).toString("utf8");
const pristineEntry = entryAt(PRISTINE);
const pristineSha = sha256(Buffer.from(pristineEntry, "utf8"));

// parse landed rows
const rows = [];
for (const [i, line] of pristineEntry.split("\n").entries()) {
  const t = line.trim();
  if (!t.startsWith("| D")) continue;
  const cells = t.slice(1, -1).split("|").map((c) => c.trim());
  if (cells.length !== 6) continue;
  const qm = cells[5].match(/^"(.+)"$/s);
  rows.push({ id: cells[0], lineNo: i + 1, signal: cells[1], decision: cells[2], threshold: cells[3], source: cells[4], quote: qm ? qm[1] : cells[5] });
}
if (rows.length !== 13) { console.error(`GUARD FAIL rows=${rows.length} != 13`); process.exit(9); }

const receiptIds = ["S119", "S120", "S121", "S122"];
const norm = {};
for (const id of receiptIds) {
  const meta = JSON.parse(git(["show", `${PRISTINE}:${RECEIPTS}/${id}.json`]).toString("utf8"));
  norm[id] = normalise(git(["show", `${PRISTINE}:${meta.bytes_path}`]));
}

const NUMBER_WORDS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, "twenty-four": 24, thirty: 30, sixty: 60, ninety: 90, hundred: 100 };
const wordsOf = (s) => s.split(" ").filter(Boolean).length;
const wordForms = (n) => Object.entries(NUMBER_WORDS).filter(([, v]) => v === n).map(([w]) => w);
const hasWord = (text, w) => new RegExp(`(^|[^a-z-])${w}([^a-z-]|$)`, "i").test(text.toLowerCase());
// verbatim copy of the counter's numbersIn (candidate filter must match n1 exactly)
function numbersIn(text) {
  const out = new Set();
  for (const m of text.matchAll(/\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?/g)) out.add(Number(m[0].replace(/,/g, "")));
  const lower = text.toLowerCase();
  for (const [w, n] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`(^|[^a-z-])${w}([^a-z-]|$)`).test(lower)) out.add(n);
  }
  return out;
}

function rep(text, oldStr, newStr, count = 1) {
  const c = text.split(oldStr).length - 1;
  if (c !== count) throw new Error(`anchor count ${c} != ${count} for: ${JSON.stringify(oldStr.slice(0, 90))}`);
  return text.split(oldStr).join(newStr);
}

function runCounter(rev, label, live) {
  const args = ["scripts/check-decision-table.mjs", "--repo", CLONE, "--rev", rev, "--baseline", BASELINE, "--entry", ENTRY, "--json"];
  if (live) args.push("--live");
  const r = spawnSync("node", args, { cwd: CLONE, encoding: "buffer", maxBuffer: 64 * 1024 * 1024, env: { ...process.env, TMPDIR: join(S, "tmp") } });
  const file = join(OUT, `${live ? "live-" : ""}${label}.json`);
  writeFileSync(file, r.stdout);
  let parsed = null;
  try { parsed = JSON.parse(r.stdout.toString("utf8")); } catch { /* leave null */ }
  return { exit: r.status, stderr: r.stderr.toString().trim(), parsed, file };
}

// ---- scan mode: validate normalise copy, collision matrix, M7 candidates ----
function scan() {
  console.log("== normalise-copy validation (each landed quote inside its own receipt) ==");
  for (const r of rows) console.log(`${r.id} ${r.source} quote-in-receipt=${norm[r.source].includes(r.quote)}`);
  console.log("== collision matrix (landed quote present in a DIFFERENT receipt) ==");
  let any = false;
  for (const r of rows) for (const id of receiptIds) {
    if (id !== r.source && norm[id].includes(r.quote)) { console.log(`${r.id} quote also in ${id}`); any = true; }
  }
  if (!any) console.log("(none)");
  console.log("== M7 candidates: other sentences in the row's own receipt whose numbersIn contains the threshold number ==");
  const landedQuotes = new Set(rows.map((r) => r.quote));
  for (const r of rows) {
    const m = /(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)/.exec(r.threshold);
    const tnum = Number(m[0].replace(/,/g, ""));
    const sents = norm[r.source].split(/(?<=[.!?])\s+/);
    const cands = [];
    for (const s of sents) {
      if (s === r.quote) continue;
      if (s.includes('"') || s.includes("|")) continue;
      const wc = wordsOf(s);
      if (wc < 6 || wc > 25) continue;
      if (!numbersIn(s).has(tnum)) continue;
      cands.push({ s, wc, isLandedQuote: landedQuotes.has(s) });
    }
    console.log(`${r.id} threshold=${r.threshold} tnum=${tnum} candidates=${cands.length}`);
    for (const c of cands.slice(0, 4)) console.log(`   [${c.wc}w${c.isLandedQuote ? " landed-quote" : ""}] ${c.s}`);
  }
}

// ---- mutant definitions ----
function thresholdAnchor(r) { return `| ${r.threshold} | ${r.source} |`; }
const byId = Object.fromEntries(rows.map((r) => [r.id, r]));

function mutants() {
  const M = [];
  const add = (id, kind, target, desc, apply) => M.push({ id, kind, target, desc, apply });

  // M1: threshold number +1 (all 13 rows)
  const plus1 = {
    D1: "at least 6 redirects", D2: "more than 6 redirects", D3: "31 days", D4: "more than 25 hours",
    D5: "at least 501 KiB", D6: "at least 2 minutes", D7: "61 requests", D8: "5,001 requests",
    D9: "no more than 101 concurrent", D10: "no more than 901 points", D11: "no more than 91 seconds",
    D12: "1 request", D13: "at least 2 seconds",
  };
  for (const r of rows) {
    add(`m1-${r.id}`, "threshold+1", r.id, `\`${r.threshold}\` -> \`${plus1[r.id]}\``,
      (t) => rep(t, thresholdAnchor(r), `| ${plus1[r.id]} | ${r.source} |`));
  }

  // M2a: unit -> out-of-vocabulary unit (t4 expected to catch)
  add("m2a-D1", "unit-out-of-vocab", "D1", "`5 redirects` -> `5 elephants`",
    (t) => rep(t, thresholdAnchor(byId.D1), "| at least 5 elephants | S119 |"));
  add("m2a-D5", "unit-out-of-vocab", "D5", "`500 KiB` -> `500 bananas`",
    (t) => rep(t, thresholdAnchor(byId.D5), "| at least 500 bananas | S119 |"));
  add("m2a-D6", "unit-out-of-vocab", "D6", "`1 minute` -> `1 fortnight`",
    (t) => rep(t, thresholdAnchor(byId.D6), "| at least 1 fortnight | S121 |"));

  // M2b: unit -> in-vocabulary but WRONG unit (n1 blind to unit)
  add("m2b-D3", "unit-in-vocab-wrong", "D3", "`30 days` -> `30 hours`",
    (t) => rep(t, thresholdAnchor(byId.D3), "| 30 hours | S119 |"));
  add("m2b-D5", "unit-in-vocab-wrong", "D5", "`500 KiB` -> `500 bytes` (1024x error)",
    (t) => rep(t, thresholdAnchor(byId.D5), "| at least 500 bytes | S119 |"));
  add("m2b-D6", "unit-in-vocab-wrong", "D6", "`1 minute` -> `1 hour` (60x error)",
    (t) => rep(t, thresholdAnchor(byId.D6), "| at least 1 hour | S121 |"));
  add("m2b-D9", "unit-in-vocab-wrong", "D9", "`100 concurrent` -> `100 requests` (in-flight -> total)",
    (t) => rep(t, thresholdAnchor(byId.D9), "| no more than 100 requests | S121 |"));
  add("m2b-D13", "unit-in-vocab-wrong", "D13", "`1 second` -> `1 minute` (60x error)",
    (t) => rep(t, thresholdAnchor(byId.D13), "| at least 1 minute | S122 |"));

  // M3: bound word changed (direction flip)
  add("m3-D1", "bound-word-flip", "D1", "`at least` -> `at most`",
    (t) => rep(t, thresholdAnchor(byId.D1), "| at most 5 redirects | S119 |"));
  add("m3-D2", "bound-word-flip", "D2", "`more than` -> `less than`",
    (t) => rep(t, thresholdAnchor(byId.D2), "| less than 5 redirects | S119 |"));
  add("m3-D4", "bound-word-flip", "D4", "`more than` -> `up to`",
    (t) => rep(t, thresholdAnchor(byId.D4), "| up to 24 hours | S119 |"));
  add("m3-D6", "bound-word-flip", "D6", "`at least` -> `at most`",
    (t) => rep(t, thresholdAnchor(byId.D6), "| at most 1 minute | S121 |"));
  add("m3-D9", "bound-word-flip", "D9", "`no more than` -> `at least`",
    (t) => rep(t, thresholdAnchor(byId.D9), "| at least 100 concurrent | S121 |"));

  // M4: one quote word changed
  add("m4-D1", "quote-word", "D1", "consecutive -> successive",
    (t) => rep(t, "SHOULD follow at least five consecutive redirects", "SHOULD follow at least five successive redirects"));
  add("m4-D6", "quote-word", "D6", "wait -> sleep",
    (t) => rep(t, "Otherwise, wait for at least one minute before retrying.", "Otherwise, sleep for at least one minute before retrying."));
  add("m4-D12", "quote-word", "D12", "should -> must",
    (t) => rep(t, "is 0 , you should not make another request", "is 0 , you must not make another request"));

  // M5: Source id swapped to another new row
  add("m5-E1", "source-swap", "D1", "S119 -> S121",
    (t) => rep(t, thresholdAnchor(byId.D1), "| at least 5 redirects | S121 |"));
  add("m5-E2", "source-swap", "D6+D12", "swap S121 <-> S122 between D6 and D12",
    (t) => rep(rep(t, thresholdAnchor(byId.D6), "| at least 1 minute | S122 |"), thresholdAnchor(byId.D12), "| 0 requests | S121 |"));
  add("m5-E2b", "source-swap", "D6", "S121 -> S122 (single-sided)",
    (t) => rep(t, thresholdAnchor(byId.D6), "| at least 1 minute | S122 |"));
  add("m5-E3", "source-swap", "D10", "S121 -> S122",
    (t) => rep(t, thresholdAnchor(byId.D10), "| no more than 900 points | S122 |"));

  // M6: row duplicated with a new id
  const dupMut = (src, dst) => (t) => {
    const line = t.split("\n").find((l) => l.trim().startsWith(`| ${src} |`));
    if (!line) throw new Error(`row ${src} line not found`);
    const dup = line.replace(`| ${src} |`, `| ${dst} |`);
    return rep(t, line, `${line}\n${dup}`);
  };
  add("m6-F1", "row-duplicate", "D9->D14", "exact copy of D9 as D14", dupMut("D9", "D14"));
  add("m6-F2", "row-duplicate", "D1->D15", "exact copy of D1 as D15", dupMut("D1", "D15"));

  // M7: quote replaced by another sentence of the same page containing the same number
  // (candidate must satisfy the counter's own n1: numbersIn(sentence).has(tnum);
  //  prefer a sentence that is not one of the 13 landed quotes, else first valid)
  const landedQuotes = new Set(rows.map((r) => r.quote));
  for (const r of rows) {
    const m = /(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)/.exec(r.threshold);
    const tnum = Number(m[0].replace(/,/g, ""));
    const sents = norm[r.source].split(/(?<=[.!?])\s+/);
    const valid = sents.filter((s) => s !== r.quote && !s.includes('"') && !s.includes("|")
      && wordsOf(s) >= 6 && wordsOf(s) <= 25 && numbersIn(s).has(tnum));
    if (!valid.length) continue;
    const cand = valid.find((s) => !landedQuotes.has(s)) ?? valid[0];
    add(`m7-${r.id}`, "quote-same-page-same-number", r.id, `quote -> [${wordsOf(cand)}w] ${cand}`,
      (t) => rep(t, `"${r.quote}"`, `"${cand}"`));
  }
  return M;
}

// ---- run mode ----
function run() {
  // pristine offline reading (live baseline is taken separately via `live` mode)
  const pOff = runCounter(PRISTINE, "pristine-offline", false);
  console.log(`pristine offline: exit=${pOff.exit} population=${pOff.parsed?.population} admitted=${pOff.parsed?.admitted} failing=${pOff.parsed?.failing}`);
  if (!(pOff.exit === 0 && pOff.parsed?.admitted === 13 && pOff.parsed?.failing === 0)) {
    console.error("PRISTINE BASELINE FAILURE — offline readings inconclusive"); process.exit(8);
  }

  const matrix = [];
  for (const mut of mutants()) {
    let text, rev;
    try { text = mut.apply(pristineEntry); } catch (e) { matrix.push({ id: mut.id, error: `apply: ${e.message}` }); console.log(`${mut.id}: APPLY-ERROR ${e.message}`); continue; }
    const f = join(CLONE, ENTRY);
    writeFileSync(f, text);
    git(["add", "--", ENTRY]);
    git(["-c", `user.name=${SEAT}`, "-c", `user.email=${SEAT}@scratch.local`, "commit", "-q", "-m", `mut(${mut.id}): ${mut.kind} ${mut.desc}`]);
    rev = git(["rev-parse", "HEAD"]).toString().trim();
    const res = runCounter(rev, mut.id, false);
    const pr = res.parsed;
    const targets = mut.target.includes("+") ? mut.target.split("+") : [mut.target];
    const targetRows = (pr?.rows ?? []).filter((x) => targets.includes(x.row) || targets.some((tg) => x.row === tg.split("->")[1]));
    const summary = {
      id: mut.id, kind: mut.kind, target: mut.target, desc: mut.desc, rev,
      entrySha: sha256(Buffer.from(text, "utf8")),
      exit: res.exit, population: pr?.population ?? null, admitted: pr?.admitted ?? null, failing: pr?.failing ?? null,
      targetReadings: targetRows.map((x) => ({ row: x.row, admitted: x.admitted, reason: x.reason })),
    };
    matrix.push(summary);
    console.log(`${mut.id} [${mut.kind}] ${mut.target}: exit=${res.exit} pop=${summary.population} adm=${summary.admitted} fail=${summary.failing} targets=${JSON.stringify(summary.targetReadings)}`);
  }
  writeFileSync(join(OUT, "matrix.json"), JSON.stringify({ pristineOffline: { exit: pOff.exit, ...pick(pOff.parsed) }, mutants: matrix }, null, 2));

  // restoration
  git(["reset", "--hard", "-q", PRISTINE]);
  const restored = readFileSync(join(CLONE, ENTRY));
  const headAfter = git(["rev-parse", "HEAD"]).toString().trim();
  const restoredSha = sha256(restored);
  const pOff2 = runCounter(PRISTINE, "pristine-restored-offline", false);
  console.log(`restored: HEAD=${headAfter} entrySha=${restoredSha} matchesPristine=${restoredSha === pristineSha} counterExit=${pOff2.exit} admitted=${pOff2.parsed?.admitted}`);
  writeFileSync(join(OUT, "restoration.json"), JSON.stringify({ pristineSha, restoredSha, headAfter, matches: restoredSha === pristineSha, counterExit: pOff2.exit, admitted: pOff2.parsed?.admitted ?? null }, null, 2));
}

const pick = (p) => p ? { population: p.population, admitted: p.admitted, failing: p.failing, clean: p.clean } : {};

// ---- live mode ----
function live(label, rev) {
  const res = runCounter(rev, `live-${label}`, true);
  const pr = res.parsed;
  console.log(`live ${label} @${rev}: exit=${res.exit} pop=${pr?.population} adm=${pr?.admitted} fail=${pr?.failing}`);
  for (const x of pr?.rows ?? []) if (!x.admitted) console.log(`  ${x.row} NOT-ADMITTED reason=${x.reason}`);
}

const [mode, a1, a2] = process.argv.slice(2);
if (mode === "scan") scan();
else if (mode === "run") run();
else if (mode === "live") live(a1, a2);
else { console.error("usage: harness.mjs scan|run|live <label> <rev>"); process.exit(2); }
