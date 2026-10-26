#!/usr/bin/env node
// ScribeMistakes round-30 w1: fixture demos of the frozen frontier-admission
// counter's g5-quote-located and r3-used-by reasons against the round-29
// attribution defect (S114 reuses S111's quote) and routed defect 1 (used-by
// reciprocity). Reads lane bytes read-only; writes only under $S.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";

const S = "/fast/scratch/hyaku/tabi-r30/CritMistakes/ademo";
const LANE = "/home/vgpnk/Projects/shokunin/tabi-shokunin";
const COUNTER = `${S}/clone/scripts/check-frontier-admission.mjs`;
const HTML_FORM_156 = `${LANE}/corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc`;
const HTML_SELECT_156 = `${LANE}/corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_select_element.cc`;
const sha256 = (b) => createHash("sha256").update(b).digest("hex");

const S111_QUOTE = "Filling out the form controls dispatches `input` and `change` events, whose handlers may have detached the document.";
const S114_GATE_CELL = "`:201-202` same comment as S111 (same blob, different scope: navigation sentinel)";
const S114_OWN_QUOTE = "If this form already made a request to navigate another frame which is";
const URL = "https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT";
const ENTRY = "corpus/knowledge/fx-entry.md";
const SOURCES = "corpus/SOURCES.md";
const LESSON = "corpus/lessons/round-30.md";
const RECEIPTS = "corpus/evidence/round-30/frontier";

const formBytes = readFileSync(HTML_FORM_156);
const selectBytes = readFileSync(HTML_SELECT_156);

function makeRepo(name) {
  const root = `${S}/fixtures/${name}`;
  rmSync(root, { recursive: true, force: true });
  mkdirSync(root, { recursive: true });
  const run = (args) => {
    const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`git ${args[0]} failed: ${r.stderr}`);
    return r.stdout;
  };
  run(["init", "-q"]);
  const top = run(["rev-parse", "--show-toplevel"]).trim();
  if (top !== root) throw new Error(`fixture root mismatch ${top} != ${root}`);
  run(["-c", "user.name=ScribeMistakes", "-c", "user.email=ScribeMistakes@scratch.local", "commit", "--allow-empty", "-q", "-m", "init"]);
  return {
    root,
    put(rel, data) { const abs = join(root, rel); mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, data); },
    commit() {
      const r = spawnSync("git", ["-C", root, "-c", "user.name=ScribeMistakes", "-c", "user.email=ScribeMistakes@scratch.local", "commit", "-q", "-a", "-m", "fixture"], { encoding: "utf8" });
      if (r.status !== 0) {
        const a = spawnSync("git", ["-C", root, "add", "-A"], { encoding: "utf8" });
        if (a.status !== 0) throw new Error(a.stderr);
        const c = spawnSync("git", ["-C", root, "-c", "user.name=ScribeMistakes", "-c", "user.email=ScribeMistakes@scratch.local", "commit", "-q", "-m", "fixture"], { encoding: "utf8" });
        if (c.status !== 0) throw new Error(c.stderr);
      }
      return run(["rev-parse", "HEAD"]).trim();
    },
  };
}

const REGISTRY_HEAD = "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|";
const row = (usedBy) => `| S114 | Chromium 156 html_form_element.cc — ${URL} | code | A | navigation sentinel | html_form_element.cc:175-339,767-796,856-880 | teaches | mined | 2026-10-26 | 180d | ${usedBy} |`;

function entry() {
  const head = [
    "# Fixture entry",
    "",
    `source: S114 — ${URL} — html_form_element.cc:767-796`,
    "verified-at: 2026-10-26",
    "recheck: 180d",
    "frontier: rate-tos-signal",
  ];
  while (head.length < 15) head.push("");
  return `${head.join("\n")}\nNo quoted span in this body.\n`;
}

function build(name, { quote, bytes, usedBy = ENTRY, lessonQuote }) {
  const d = makeRepo(name);
  d.put(SOURCES, ["# SOURCES", "", "## Registry", "", REGISTRY_HEAD, row(usedBy), ""].join("\n"));
  d.put(ENTRY, entry());
  const bp = `${RECEIPTS}/bytes/S114.txt`;
  const rbp = `${RECEIPTS}/refetch/bytes/S114.txt`;
  d.put(bp, bytes);
  d.put(rbp, bytes);
  d.put(`${RECEIPTS}/S114.json`, JSON.stringify({ id: "S114", url: URL, fetched_at: "2026-10-26T07:00:00Z", fetched_by: "W1-fetch", http_status: 200, bytes_path: bp, sha256: sha256(bytes), quote }));
  d.put(`${RECEIPTS}/refetch/S114.json`, JSON.stringify({ id: "S114", seat: "W2-refetch", fetched_at: "2026-10-26T07:05:00Z", http_status: 200, bytes_path: rbp, sha256: sha256(bytes) }));
  d.put(LESSON, `# Round 30 fixture\n\n## Gate\n\n- S114: ${URL}, 2026-10-26, "${lessonQuote ?? quote}"\n`);
  return d.commit();
}

function runCounter(root, rev) {
  const r = spawnSync("node", [COUNTER, "--repo", root, "--rev", rev, "--frontier", "rate-tos-signal", "--since", "2026-10-26", "--json"], { encoding: "utf8", env: { ...process.env, TMPDIR: `${S}/tmp` } });
  let out = null;
  try { out = JSON.parse(r.stdout); } catch { /* keep null */ }
  return { exit: r.status, admitted: out?.admitted ?? null, population: out?.population ?? null, entries: out?.entries ?? null, stderr: r.stderr.trim() };
}

const collapse = (s) => String(s).replace(/\s+/g, " ").trim();
const results = [];
const cases = [
  { name: "a1-gate-cell-is-a-pointer", quote: S114_GATE_CELL, bytes: formBytes, expect: "g5-quote-located" },
  { name: "a2-s111-quote-in-s114-blob", quote: S111_QUOTE, bytes: formBytes, expect: "g5-quote-located" },
  { name: "a3-s111-quote-in-other-156-blob", quote: S111_QUOTE, bytes: selectBytes, expect: "g5-quote-located" },
  { name: "a4-used-by-omits-entry", quote: S111_QUOTE, bytes: formBytes, usedBy: "corpus/knowledge/other.md", expect: "r3-used-by" },
  { name: "a5-s114-own-scope-quote", quote: S114_OWN_QUOTE, bytes: formBytes, expect: "admitted" },
];
for (const c of cases) {
  const rev = build(c.name, c);
  const out = runCounter(`${S}/fixtures/${c.name}`, rev);
  const qn = collapse(c.quote);
  results.push({ case: c.name, expected: c.expect, quote_located_in_fixture_bytes: collapse(c.bytes.toString("utf8")).includes(qn), quote_words: c.quote.replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length, exit: out.exit, population: out.population, admitted: out.admitted, reasons: out.entries?.flatMap((e) => e.reasons) ?? [], stderr: out.stderr });
}

// Locate S111's own quote directly in the two committed 156 blobs (normalisation
// identical to the counter: whitespace collapsed, no HTML path for .cc text).
const located = {
  "html_form_element.cc@156 contains S111 quote": collapse(formBytes.toString("utf8")).includes(collapse(S111_QUOTE)),
  "html_form_element.cc@156 contains S111 first line only": collapse(formBytes.toString("utf8")).includes(collapse("// Filling out the form controls dispatches `input` and `change` events,")),
  "html_form_element.cc@156 contains S114 own quote": collapse(formBytes.toString("utf8")).includes(collapse(S114_OWN_QUOTE)),
  "html_select_element.cc@156 contains S111 quote": collapse(selectBytes.toString("utf8")).includes(collapse(S111_QUOTE)),
  sha256_html_form_156: sha256(formBytes),
  sha256_html_select_156: sha256(selectBytes),
};
console.log(JSON.stringify({ results, located }, null, 2));
