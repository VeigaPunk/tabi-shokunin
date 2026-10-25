# ExecReportContract — routed lesson utility (round-27 next-iteration (b))

Seat: leaf executor/reporter. Deliverable is a **utility**, not a gate: it is
named `report-contract.mjs`, never `check-*.mjs`, and nothing in it runs during
the lane's gate pass. All commands below were run from
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/scratch/ExecReportContract/fx`
unless stated. Node `v24.21.0` (`node --version`). No tool installs.

## Work performed

Built `report-contract.mjs` (node, zero deps, 140 lines, sha256
`b1e296bfd46b6aa23c92cc99e53b5356bbc2ba485e75001b17e4afc52065ea5a`) at
`.ufo/waves/round-27/scratch/ExecReportContract/report-contract.mjs`.
`node report-contract.mjs <reportPath> [--shonen <SHONEN.md>]` exits 0 iff all
three clauses hold; exit 1 = contract violation; exit 2 = usage/IO.

Clause semantics as implemented:

- **(a) six sections, `##` level, case-insensitive, in order** — Work performed /
  Landed changes / Before → after measurements / Sources & frontier / Trend
  verdicts / SHONEN. Heading keys are normalised before comparison:
  NFC, lowercase, `→`/`⟶`/`⇒` → `->`, em/en dash → `-`, the word `and` → `&`,
  arrow whitespace collapsed, whitespace runs collapsed. That is why the fleet's
  real heading `## Before → after measurements` matches the spec's
  `Before -> after measurements`, and `## sources and frontier` matches
  `Sources & frontier`.
- **(b) exactly one `## SHONEN`** whose following lines (up to the next `##`
  heading) carry exactly one `- [x]` / `- [~]` / `- [ ]` checkbox per box parsed
  from `SHONEN.md`; zero copies, more than one copy, or a count mismatch are each
  their own diagnostic.
- **(c) path shape** — the argument must match
  `.ufo/reports/round-<N>/tabi.md`; a containing `.ufo/waves/` segment is reported
  with the round-25 defect-class wording. Checked first so a wrong path is never
  mis-attributed to (a)/(b).
- **Fence masking** (design choice, not in the letter of the spec): fenced
  ```` ``` ````/`~~~` regions are blanked before scanning (line numbers preserved),
  so a *quoted* heading or checkbox inside evidence can never satisfy a clause —
  the false-green direction the utility exists to prevent.
- **SHONEN.md discovery**: `--shonen <path>`, else walk up from `cwd`, else walk
  up from the script's own directory. Verified working from `/tmp` (run 12).

## Landed changes

**No tracked file was created, modified or deleted.** Everything is under this
seat's scratch root:

- `.ufo/waves/round-27/scratch/ExecReportContract/report-contract.mjs` — the
  utility (140 lines, sha256 above).
- `.ufo/waves/round-27/scratch/ExecReportContract/fx/` — throwaway fixtures:
  `.ufo/reports/round-{26,27,28,29,31,32,33}/tabi.md`, `.ufo/waves/round-26/tabi.md`,
  `SHONEN-2box.md`.

No git/jj write of any kind; the fleet repo was only read (its report sha256 is
identical before and after: `4eb961e7eeddbf79a759af9668b47ea9f67b128d7e6a6e60cb823ada0696e2e5`).

Lane state at hand-off is **pre-existing, not this seat's write**:
`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain` lists
` M corpus/knowledge/redirect-and-retry-after-semantics.md` (the C3 admission
landed by the L1) plus untracked wave files (`gen-w2.mjs`, `w1.ready.dispatched`,
`w1/`, `w2-spec.json` — sibling/L1 artifacts; the set drifts as peers run).
This seat's scratch root never appears: `git check-ignore -v
.ufo/waves/round-27/scratch/ExecReportContract/report-contract.mjs` →
`.gitignore:5:.ufo/waves/*/scratch/`.

## Before → after measurements

| Axis | Before | After |
|---|---|---|
| Report-path defect is mechanised | 0 utilities; the r25 M1 class relied on prose in LOG next-iteration (b) | 1 utility, run 3 rejects `.ufo/waves/...` with the round-25 wording, exit 1 |
| False-green guard vs quoted headings | untested / unrepresented | run 8: all six headings fenced → exit 1 |
| Real-report green | not measured | run 4: fleet `.ufo/reports/round-26/tabi.md` → exit 0, SHONEN 4/4 |

Line budget: `wc -l report-contract.mjs` → **140** lines (140 ceiling met
exactly; `wc -c` → 5718); zero non-`node:` imports
(`grep -cE "^import .* from '[^n]" report-contract.mjs` → 0).

Box ground truth: `grep -cE '^- \[[ xX~]\]' /home/vgpnk/Projects/shokunin/tabi-shokunin/SHONEN.md`
→ `4`, which is what the fleet round-26 report satisfies (4 checkboxes in its
`## SHONEN` block, lines 135–138).

### The utility (final source, read back from disk)

```js
#!/usr/bin/env node
// report-contract.mjs — routed lesson UTILITY (tabi r27; r26 LOG next-iteration (b)).
// Not a gate; run it by hand on a report before hand-off.
// usage: node report-contract.mjs <reportPath> [--shonen <SHONEN.md>]
// exit 0 iff: (a) six '##' sections, case-insensitive, in order — Work performed /
// Landed changes / Before -> after measurements / Sources & frontier / Trend verdicts /
// SHONEN; (b) exactly one '## SHONEN' heading with one checkbox ('- [x]' / '- [~]' /
// '- [ ]') per SHONEN.md box; (c) <reportPath> is .ufo/reports/round-<N>/tabi.md — a
// .ufo/waves/ path is refused (round-25 class). Fenced blocks are masked, so quoted
// headings never satisfy a clause. exit 1 = violation, 2 = usage or I/O error.
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SECTIONS = ['work performed', 'landed changes', 'before->after measurements', 'sources & frontier', 'trend verdicts', 'shonen']
const REPORT_RE = /(?:^|\/)\.ufo\/reports\/round-\d+\/tabi\.md$/
const WAVES_RE = /\.ufo\/waves\//
const HEADING_RE = /^##(?!#)\s*(.*?)\s*$/
const BOX_RE = /^\s*[-*]\s+\[[ xX~]\]/
const USAGE = 'usage: node report-contract.mjs <reportPath> [--shonen <SHONEN.md>]'

const norm = (s) => s.normalize('NFC').toLowerCase()
  .replace(/\u2192|\u27f6|\u21d2/g, '->')
  .replace(/[\u2014\u2013]/g, '-')
  .replace(/\band\b/g, '&')
  .replace(/\s*->\s*/g, '->')
  .replace(/\s+/g, ' ')
  .trim()

const die = (msg) => {
  console.error(`report-contract: ERROR ${msg}`)
  process.exit(2)
}
const readUtf8 = (path, label) => {
  try { return readFileSync(path, 'utf8') } catch (e) { die(`cannot read ${label} ${path}: ${e.code || e.message}`) }
}

const countBoxes = (lines) => lines.filter((l) => BOX_RE.test(l)).length
// Mask fenced blocks (line count preserved) so quoted headings/checkboxes cannot satisfy a clause.
function outsideFences(lines) {
  let open = null
  return lines.map((line) => {
    const m = /^\s*(`{3,}|~{3,})/.exec(line)
    if (m) {
      if (!open) open = m[1][0]
      else if (m[1][0] === open) open = null
      return ''
    }
    return open ? '' : line
  })
}

function headings(lines) {
  const out = []
  lines.forEach((line, i) => { const m = HEADING_RE.exec(line); if (m) out.push({ key: norm(m[1]), line: i + 1 }) })
  return out
}

function findShonen(explicit) {
  if (explicit) return resolve(explicit)
  for (const start of [process.cwd(), dirname(fileURLToPath(import.meta.url))]) {
    for (let dir = resolve(start); ; dir = dirname(dir)) {
      const candidate = join(dir, 'SHONEN.md')
      try {
        readFileSync(candidate)
        return candidate
      } catch {}
      if (dirname(dir) === dir) break
    }
  }
  return die('cannot locate SHONEN.md; pass --shonen <path>')
}

const argv = process.argv.slice(2)
let reportArg = null
let shonenArg = null
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '-h' || a === '--help') {
    console.log(USAGE)
    process.exit(0)
  } else if (a === '--shonen') {
    shonenArg = argv[++i]
    if (!shonenArg) die('--shonen needs a path')
  } else if (a.startsWith('-')) die(`unknown option ${a}\n${USAGE}`)
  else if (reportArg !== null) die(`expected exactly one report path\n${USAGE}`)
  else reportArg = a
}
if (reportArg === null) die(`missing <reportPath>\n${USAGE}`)

const given = reportArg.replace(/\\/g, '/')
const boxCount = countBoxes(readUtf8(findShonen(shonenArg), 'SHONEN.md').split(/\r?\n/))
if (boxCount === 0) die('no boxes parsed from SHONEN.md')
const lines = outsideFences(readUtf8(resolve(reportArg), 'report').split(/\r?\n/))
const problems = []

// (c) path shape first, so a wrong path is never blamed on (a)/(b).
if (WAVES_RE.test(given)) {
  problems.push(`(c) ${reportArg} is under .ufo/waves/ — land reports in .ufo/reports/round-<N>/tabi.md (round-25 defect class)`)
} else if (!REPORT_RE.test(given)) {
  problems.push(`(c) ${reportArg} does not match .ufo/reports/round-<N>/tabi.md`)
}

// (a) six sections, present and in order.
const heads = headings(lines)
const firstAt = new Map()
const seen = new Map()
for (const h of heads) {
  seen.set(h.key, (seen.get(h.key) || 0) + 1)
  if (!firstAt.has(h.key)) firstAt.set(h.key, h.line)
}
const found = SECTIONS.map((s) => ({ s, at: firstAt.get(norm(s)) }))
const absent = found.filter((f) => f.at === undefined).map((f) => f.s)
if (absent.length) problems.push(`(a) missing section(s): ${absent.join(', ')}`)
const ordered = found.filter((f) => f.at !== undefined)
for (let i = 1; i < ordered.length; i++) {
  const [prev, cur] = [ordered[i - 1], ordered[i]]
  if (cur.at < prev.at) problems.push(`(a) out of order: '${prev.s}' (line ${prev.at}) must precede '${cur.s}' (line ${cur.at})`)
}

// (b) exactly one SHONEN heading, one checkbox per SHONEN.md box.
const key = norm('shonen')
const head = heads.find((h) => h.key === key)
const copies = seen.get(key) || 0
if (copies === 0) {
  problems.push('(b) no ## SHONEN heading')
} else if (copies > 1) {
  problems.push(`(b) ${copies} ## SHONEN headings — expected exactly one`)
} else {
  const next = heads.find((h) => h.line > head.line)
  const got = countBoxes(lines.slice(head.line, next ? next.line - 1 : lines.length))
  if (got !== boxCount) problems.push(`(b) ## SHONEN carries ${got} checkbox(es); SHONEN.md defines ${boxCount}`)
}

if (problems.length) {
  for (const p of problems) console.error(`report-contract: ${p}`)
  console.error(`report-contract: FAIL ${reportArg}`)
  process.exit(1)
}
console.log(`report-contract: PASS ${reportArg} — ${SECTIONS.length}/${SECTIONS.length} sections in order; SHONEN ${boxCount}/${boxCount} boxes`)
```

### The three required runs (verbatim)

RED — report missing the SHONEN section (`node ../report-contract.mjs .ufo/reports/round-26/tabi.md`):

```
report-contract: (a) missing section(s): shonen
report-contract: (b) no ## SHONEN heading
report-contract: FAIL .ufo/reports/round-26/tabi.md
exit=1
```

RED — wrong path, the round-25 defect class (`node ../report-contract.mjs .ufo/waves/round-26/tabi.md`):

```
report-contract: (c) .ufo/waves/round-26/tabi.md is under .ufo/waves/ — land reports in .ufo/reports/round-<N>/tabi.md (round-25 defect class)
report-contract: FAIL .ufo/waves/round-26/tabi.md
exit=1
```

GREEN — conformant skeleton (`node ../report-contract.mjs .ufo/reports/round-27/tabi.md`):

```
report-contract: PASS .ufo/reports/round-27/tabi.md — 6/6 sections in order; SHONEN 4/4 boxes
exit=0
```

GREEN — real fleet report, tested read-only
(`node ../report-contract.mjs /home/vgpnk/Projects/shokunin/.ufo/reports/round-26/tabi.md`):

```
report-contract: PASS /home/vgpnk/Projects/shokunin/.ufo/reports/round-26/tabi.md — 6/6 sections in order; SHONEN 4/4 boxes
exit=0
```

Re-executed end-to-end at hand-off: runs 1–4 and controls 5–14 were re-run
against the shipped file and produced the outputs above unchanged; `sha256sum`
→ utility `b1e296bfd46b6aa23c92cc99e53b5356bbc2ba485e75001b17e4afc52065ea5a`,
fleet report `4eb961e7eeddbf79a759af9668b47ea9f67b128d7e6a6e60cb823ada0696e2e5`
(identical before/after); `node --check report-contract.mjs` → clean.

### Additional controls exercised (same command, different fixtures)

| # | Fixture / invocation | Observed |
|---|---|---|
| 5 | `round-28/tabi.md`, `## Landed changes` before `## Work performed` | exit 1 — `(a) out of order: 'work performed' (line 7) must precede 'landed changes' (line 3)` |
| 6 | `round-29/tabi.md`, 3 checkboxes | exit 1 — `(b) ## SHONEN carries 3 checkbox(es); SHONEN.md defines 4` |
| 7 | `round-31/tabi.md`, `## work PERFORMED` / `## before → after measurements` / `## sources and frontier` / `## shonen`, mixed `[x]/[~]/[ ]` | exit 0 — case, arrow and `and`/`&` tolerance confirmed |
| 8 | `round-32/tabi.md`, all six headings + 4 boxes only inside a ```` ``` ```` fence | exit 1 — six sections reported missing, `(b) no ## SHONEN heading` (false green blocked) |
| 9 | `.ufo/reports/round-30/tabi.md` (absent) | exit 2 — `ERROR cannot read report …: ENOENT` |
| 10 | no arguments | exit 2 — `ERROR missing <reportPath>` + usage |
| 11 | `round-33/tabi.md`, two `## SHONEN` headings | exit 1 — `(b) 2 ## SHONEN headings — expected exactly one` |
| 12 | `cd /tmp && node <abs>/report-contract.mjs <abs fleet report>` | exit 0 — `SHONEN.md` found via the script-dir walk-up |
| 13 | `--shonen SHONEN-2box.md .ufo/reports/round-27/tabi.md` | exit 1 — `carries 4 checkbox(es); SHONEN.md defines 2` (override honoured) |
| 14 | `--shonen SHONEN-2box.md .ufo/reports/round-29/tabi.md` | exit 1 — `carries 3 checkbox(es); SHONEN.md defines 2` |

`node --check report-contract.mjs` → clean; `wc -l` → 140; `wc -c` → 5718.

## Sources & frontier

- Box ground truth: `/home/vgpnk/Projects/shokunin/tabi-shokunin/SHONEN.md` — 4
  boxes (`grep -cE '^- \[[ xX~]\]'` → `4`); states are `[~]` in all four today.
- Contract wording: the assignment spec (six sections, one checkbox per box,
  path shape).
- Real green target: `/home/vgpnk/Projects/shokunin/.ufo/reports/round-26/tabi.md`
  (sha256 `4eb961e7…` before and after; unchanged).
- Routed-lesson provenance: the fleet round-26 report's own next-iteration (a)
  names `scripts/report-contract.mjs` (specced as ExecReportPreflight) as the
  mechanisation of the M1 report-path fix; this utility is that item in
  scratch form, named as instructed and deliberately **not** landed under
  `scripts/`.
- No web fetch was needed; no external bytes were consumed this seat.

Frontier moved: the report-shape defect class is now executable in one command
instead of prose; no corpus row, registry row or census number was touched (this
seat is read-only on tracked files, so the census is unchanged by construction).

## Trend verdicts

- **expansion — unchanged.** No knowledge entry, registry row or S-citation added;
  the deliverable is tooling, not domain ground.
- **quality — better, bounded, author-side.** The r25 M1 path defect and the
  r26 unmechanised next-iteration (a) now have a 140-line, zero-dep, deterministic
  instrument with 10 red/green controls; it has not been adopted into the lane's
  gates and no non-author reviewer has judged it (this report is the hand-off for
  that read).
- **discernment — improved in one narrow way.** The utility refuses the false-green
  direction (fenced evidence, duplicate `## SHONEN`, box-count drift), which is the
  mode that made the round-25 defect survive review.

## Risks & limitations

1. Not wired into anything: nothing invokes it, so it cannot regress a round by
   itself — and it also cannot prevent one until a seat is told to run it.
2. `SHONEN.md` box count is file-global (4). A report that truthfully reports a
   *sub-set* of boxes, or a round where `SHONEN.md` grows a box, turns red until
   the report matches the file — intended, but a future shrink/grow of SHONEN.md
   changes the expected count with no code change.
3. Heading identity is normalised, not fuzzy: `## Before/after measurements` or
   `## What I did` is red. That is deliberate (a section that does not match is a
   contract question for the L1), but it will read as strict.
4. Setext (`===`) headings are not recognised; only `##`.
5. Fence masking treats any line starting with 3+ backticks/tildes as a toggle and
   tracks only the fence character, not the run length — an unbalanced fence in a
   report blanks the remainder of the file (fails red, never green).
6. This findings report itself is *not* a `tabi.md` report: running the utility on
   `.ufo/waves/round-27/w1/ExecReportContract.md` exits 1 on clause (c) by design.

## Blockers

None. No installs needed, no external fetch needed, no tracked file touched.
Suggested check for the L1 after integration: copy the utility to
`scripts/report-contract.mjs` (or keep it in scratch) and run it against the
round-27 `.ufo/reports/round-27/tabi.md` once the report scribe lands.
