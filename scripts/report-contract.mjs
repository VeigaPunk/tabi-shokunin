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
