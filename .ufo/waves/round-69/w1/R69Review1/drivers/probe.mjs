// Build probe rows + mutated PROVINCE.md variants; run the frozen counter against the REAL fleet/snapshot.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const BASE = '/fast/scratch/hyaku/tabi-r69/R69Review1/PROVINCE.base.md';
const SNAP = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/c1/sibling-heads-r69.tsv';
const FLEET = '/home/vgpnk/Projects/shokunin';
const COUNTER = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-sibling-matrix-r69.mjs';
const WORK = '/fast/scratch/hyaku/tabi-r69/R69Review1/probes';
fs.mkdirSync(WORK, { recursive: true });

const prov = fs.readFileSync(BASE, 'utf8');
// snapshot map
const snap = new Map();
for (const l of fs.readFileSync(SNAP, 'utf8').split('\n').filter((x) => x.length)) {
  if (l.startsWith('lane\t')) continue;
  const [lane, , head] = l.split('\t'); snap.set(lane, head);
}
const show = (lane, p) => {
  const r = spawnSync('git', ['-C', path.join(FLEET, lane + '-shokunin'), 'show', snap.get(lane) + ':' + p], { encoding: 'utf8', maxBuffer: 64 << 20 });
  return r.status === 0 ? r.stdout : null;
};
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const words = (s) => norm(s).split(' ').filter(Boolean).length;

// pick a valid cite+quote per lane: scan first 40 lines for a 3..25-word line
function pickCite(lane) {
  const cands = ['PROVINCE.md', 'SKILL.md'];
  for (const p of cands) {
    const t = show(lane, p);
    if (t === null) continue;
    const lines = t.split('\n');
    for (let i = 0; i < Math.min(lines.length, 400); i++) {
      const w = words(lines[i]);
      if (w >= 3 && w <= 25 && norm(lines[i])) return { cite: `${p}:${i + 1}`, quote: lines[i], line: i + 1 };
    }
  }
  return null;
}

const rows = [];
for (const lane of snap.keys()) {
  const rel = lane === 'kake' ? 'contested' : (['kotoba', 'kengaku'].includes(lane) ? 'adjacent' : 'none');
  let c;
  if (lane === 'kake') { c = { cite: 'PROVINCE.md:45', quote: 'The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)', line: 45 }; }
  else if (lane === 'kotoba') { c = { cite: 'PROVINCE.md:76', quote: '| tabi | none | 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb |', line: 76 }; }
  else if (lane === 'kengaku') { c = { cite: 'PROVINCE.md:103', quote: '**tabi** `scripts/check-measurement-binding.mjs:575-613` and **kama**', line: 103 }; }
  else c = pickCite(lane);
  if (!c) { console.error('NO CITE for ' + lane); process.exit(2); }
  rows.push({ lane, rel, cite: c.cite, quote: c.quote });
}
const REFUSES_LANES = ['revenger', 'kaidoku', 'kake', 'kagi'];
// sanity: all refuses lanes must be non-none
for (const l of REFUSES_LANES) rows.find((r) => r.lane === l).rel = l === 'kake' ? 'contested' : 'adjacent';

const HEADER = '| lane | relation | head | cite | quote | tabi side |\n|---|---|---|---|---|---|';
const rowOf = (r) => `| ${r.lane} | ${r.rel} | ${snap.get(r.lane)} | ${r.cite} | ${r.quote.replace(/\|/g, '\\|')} | tabi holds no ${r.lane} ground |`;
const matrix = (rs) => `## Adjacent — sibling matrix\n\n${HEADER}\n${rs.map(rowOf).join('\n')}\n`;

const out = {};
function run(name, text) {
  const f = path.join(WORK, name + '.md');
  fs.writeFileSync(f, text);
  const p = spawnSync(process.execPath, [COUNTER, '--province', f, '--snapshot', SNAP, '--fleet', FLEET, '--json'], { encoding: 'utf8', maxBuffer: 256 << 20 });
  let j = null; try { j = JSON.parse(p.stdout); } catch { j = { raw: p.stdout.slice(0, 500), stderr: p.stderr.slice(0, 300) }; }
  out[name] = { exit: p.status, bound: j.bound, rows: j.rows, ids: j.findings ? j.findings.map((f) => f.id) : null, verdict: j.verdict };
  console.log(name, 'exit=' + p.status, 'bound=' + j.bound, 'ids=' + JSON.stringify(out[name].ids));
}

// A: baseline valid matrix
run('A-base', prov + '\n' + matrix(rows));

// B: kake contested -> adjacent (sibling PROVINCE still declares contested at line 45)
{
  const rs = rows.map((r) => r.lane === 'kake' ? { ...r, rel: 'adjacent' } : r);
  run('B-kake-adjacent', prov + '\n' + matrix(rs));
}
// C: kake contested -> none
{
  const rs = rows.map((r) => r.lane === 'kake' ? { ...r, rel: 'none' } : r);
  run('C-kake-none', prov + '\n' + matrix(rs));
}
// D: kengaku adjacent -> none (sibling PROVINCE names tabi at 103 only as citation)
{
  const rs = rows.map((r) => r.lane === 'kengaku' ? { ...r, rel: 'none' } : r);
  run('D-kengaku-none', prov + '\n' + matrix(rs));
}
// E: kengaku adjacent -> contested (no contested text anywhere naming tabi)
{
  const rs = rows.map((r) => r.lane === 'kengaku' ? { ...r, rel: 'contested' } : r);
  run('E-kengaku-contested', prov + '\n' + matrix(rs));
}
// F: kengaku cite changed to SKILL.md (sibling names tabi only in PROVINCE) -> expect inbound-unanswered
{
  const t = show('kengaku', 'SKILL.md');
  const lines = t.split('\n');
  let picked = null;
  for (let i = 0; i < Math.min(lines.length, 400); i++) { const w = words(lines[i]); if (w >= 3 && w <= 25 && norm(lines[i])) { picked = { cite: 'SKILL.md:' + (i + 1), quote: lines[i] }; break; } }
  const rs = rows.map((r) => r.lane === 'kengaku' ? { ...r, cite: picked.cite, quote: picked.quote } : r);
  run('F-kengaku-skillcite', prov + '\n' + matrix(rs));
}
// G: quote normalization abuse — pick quote with backticks that match after stripping.
//    Find a line in some lane where removing backticks creates a substring that wouldn't match raw.
{
  // audio PROVINCE line containing a `code` span; quote includes the backticks mid-word
  const t = show('audio', 'PROVINCE.md');
  const lines = t.split('\n');
  let idx = lines.findIndex((l) => l.includes('`'));
  let quote = null;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l.includes('`')) continue;
    // craft quote that only matches after backtick stripping: take text around a backtick
    const m = l.match(/`([^`]*)`/);
    if (m && words(l) >= 3 && words(l) <= 25) { quote = l; idx = i; break; }
  }
  if (quote) {
    const rs = rows.map((r) => r.lane === 'audio' ? { ...r, cite: 'PROVINCE.md:' + (idx + 1), quote } : r);
    run('G-audio-backtick', prov + '\n' + matrix(rs));
  } else console.log('G skipped: no backtick line found in audio PROVINCE first scan');
}
// H: escaped pipe inside a cell — put a literal `\|` in quote so splitter keeps 6 cells but quote contains | after unescape
{
  const rs = rows.map((r) => r.lane === 'mado' ? { ...r, quote: r.quote + ' \\| extra' } : r);
  // wait — quote cell would then be 7 words? quote+extra -> recompute words; also unescaped pipe changes cells? We escape so stays 6 cells.
  run('H-mado-escpipe', prov + '\n' + matrix(rs));
}
// I: second matrix section earlier in file (before the real one) — counter reads first `## Adjacent — sibling matrix` occurrence
{
  const fake = '## Adjacent — sibling matrix\n\n' + HEADER + '\n' + rows.map(rowOf).join('\n') + '\n\n';
  run('I-two-sections', fake + prov + '\n' + matrix(rows));
}
// J: header case variant `## adjacent — sibling matrix` (lowercase) -> matrix-missing expected
{
  run('J-lowercase-header', prov.replace('## Host surfaces', '## Adjacent — sibling matrix\n\n' + HEADER + '\n' + rows.map(rowOf).join('\n') + '\n\n## Host surfaces').replace(/## Adjacent — sibling matrix[\s\S]*?(?=## Host surfaces)/, ''));
}
// simpler J: just lowercase the heading
{
  const t = (prov + '\n' + matrix(rows)).replace('## Adjacent — sibling matrix', '## adjacent — sibling matrix');
  run('J2-lowercase', t);
}
// K: Refuses paragraph truncated at first blank line — put outbound lane mention AFTER a blank line inside Refuses block
{
  const t = prov.replace(/(\*\*Refuses:\*\*[\s\S]*?)(\n\n)/, (m, a, b) => a + '\n\n**outbound-extra:** revenger kaidoku kake kagi nowhere-else\n' + b);
  run('K-refuses-blankline', t + '\n' + matrix(rows.map((r) => r.lane === 'revenger' ? { ...r, rel: 'none' } : r)));
}
// L: Refuses mentions lane inside backticks/code — word boundary still matches; check outbound detection on `kake` inside code span — should still count (regex \b). Try lane name inside a URL/path token e.g. "foo-kake-bar" — \b fails on hyphen? \b between - and k? '-' is non-word, 'k' word -> boundary exists -> matches! Test: add "x-revenger-y" style token.
{
  const t = prov.replace('**Refuses:**', '**Refuses:** misc-x-revenger-x misc');
  // revenger already outbound via "revenger/kaidoku"; test a lane NOT otherwise refused: 'audio'
  const t2 = prov.replace('**Refuses:**', '**Refuses:** see prefix-audio-suffix for details');
  run('L-refuses-substring', t2 + '\n' + matrix(rows.map((r) => r.lane === 'audio' ? { ...r, rel: 'none' } : r)));
}
// M: matrix section but table rows BEFORE header (orphan rows) — counter only counts table.slice(2) after header; rows before header inside same section are ignored? Actually table = all lines starting with |; table[0] must be header. If a data row precedes header, table[0] is that row -> matrix-header fail. Test rows with leading spaces `  | lane |` — ^\| fails -> not counted as table -> matrix-header or missing rows.
{
  const indented = matrix(rows).split('\n').map((l) => l.startsWith('|') ? '  ' + l : l).join('\n');
  run('M-indented-table', prov + '\n' + indented);
}
// N: lane cell with backticks `audio` — counter strips ^`|`$ only at cell edges; `audio` -> audio ok. What about lane written as **audio**? not stripped -> unknown-lane. And lane with trailing space inside backticks?
{
  const rs = rows.map((r) => r.lane === 'audio' ? { ...r } : r);
  const t = (prov + '\n' + matrix(rs)).replace('| audio |', '| `audio` |');
  run('N-backtick-lane', t);
}
{
  const t = (prov + '\n' + matrix(rows)).replace('| audio |', '| **audio** |');
  run('N2-bold-lane', t);
}
// O: relation cell case 'Adjacent'/'NONE' -> relation-vocab expected
{
  const t = (prov + '\n' + matrix(rows)).replace('| audio | none |', '| audio | None |');
  run('O-relation-case', t);
}
// P: cite with CRLF / cite line number with leading zeros 'PROVINCE.md:045' -> Number ok? regex \d+ matches 045 -> Number=45 fine.
{
  const rs = rows.map((r) => r.lane === 'audio' ? { ...r, cite: 'PROVINCE.md:0' + (r.cite.split(':')[1] || '3') } : r);
  // need real line: recompute audio cite
  const c = pickCite('audio');
  const rs2 = rows.map((r) => r.lane === 'audio' ? { ...r, cite: c.cite.replace(/:(\d+)$/, ':0$1'), quote: c.quote } : r);
  run('P-cite-leadingzero', prov + '\n' + matrix(rs2));
}
// Q: quote spanning markup — quote cell contains text that matches line only after backtick strip. E.g. sibling line has `code` and quote drops backticks -> still substring? Counter strips backticks from BOTH sides, so quote "foo bar" matches line "foo `bar`"? norm(line.replace(/`/g,'')) = "foo bar" includes norm(quote) yes. So a quote can omit backticks — is that a defect? The claim says "whitespace-normalised substring"; backtick stripping is extra normalization not documented. Test whether a quote that is NOT a verbatim substring of the raw line passes.
{
  // find a lane line containing backticks; craft quote = line with backticks removed AND a word removed? No—must still be substring after strip.
  // Better: quote that crosses a markdown link: line "see [text](url) here" -> stripped line still has "[text](url)". Quote "see text here" won't match. Find line where backtick removal merges words: "`a`b" -> "ab". Craft quote containing "ab" that is not substring of raw line.
  let found = null;
  for (const lane of ['audio','chousa','game-dev-2d','game-dev-3d','kagi','kaidoku','kama','kasegi','kengaku','kotoba','kotodama','kumitate','lore','mado','mori','revenger','souji','tameshi','tsukuroi']) {
    for (const p of ['PROVINCE.md','SKILL.md']) {
      const t = show(lane, p); if (!t) continue;
      const lines = t.split('\n');
      for (let i = 0; i < Math.min(lines.length, 500); i++) {
        const l = lines[i];
        if (!l.includes('`')) continue;
        const stripped = l.replace(/`/g, '');
        const rawNorm = norm(l), stripNorm = norm(stripped);
        if (stripNorm !== rawNorm && words(l) >= 3 && words(l) <= 25) { found = { lane, cite: p + ':' + (i + 1), raw: l, stripped }; break; }
      }
      if (found) break;
    }
    if (found) break;
  }
  if (found) {
    // quote = stripped line trimmed to a window that is NOT a substring of raw line
    // e.g. take a 4-word window spanning a removed backtick
    const wordsArr = found.stripped.split(/\s+/);
    // find window containing a position where backtick was
    const btPos = found.raw.indexOf('`');
    // simpler: use whole stripped line as quote if 3..25 words — it won't be substring of raw (raw has backticks)
    const q = norm(found.stripped);
    if (words(q) >= 3 && words(q) <= 25) {
      const rs = rows.map((r) => r.lane === found.lane ? { ...r, cite: found.cite, quote: q } : r);
      run('Q-backtick-merge', prov + '\n' + matrix(rs));
      console.log('  Q detail:', JSON.stringify({ cite: found.cite, raw: found.raw.slice(0, 120), quote: q.slice(0, 120) }));
    } else console.log('Q skipped word count', words(q));
  } else console.log('Q skipped: no differing line found');
}
// R: lane cell empty / whitespace
{
  const t = (prov + '\n' + matrix(rows)).replace('| audio |', '|  |');
  run('R-empty-lane', t);
}
// S: extra 7th cell via unescaped pipe in quote -> row-shape; escaped pipe keeps 6 cells but adds | to quote text — quote-off-line likely. Try escaped pipe making quote a substring? Already covered H.
// T: matrix section heading with trailing text '## Adjacent — sibling matrix (round 69)' — regex \b.*$ allows suffix. Confirm passes (that's intended? header regex allows trailing). Also '### Adjacent — sibling matrix' — search is ^## so ### doesn't match -> matrix-missing. And '## Adjacent — sibling matrixX'? \b after 'matrix' — 'matrixX' has no boundary -> no match. Test '## Adjacent — sibling matrix-extra'? \b between 'x'... 'matrix-extra': after 'matrix' comes '-' non-word -> \b matches! So '## Adjacent — sibling matrix-extra' MATCHES. Is that a defect? Heading variant still arguably the section. Test.
{
  const t = (prov + '\n' + matrix(rows)).replace('## Adjacent — sibling matrix\n', '## Adjacent — sibling matrix-extra\n');
  run('T-heading-suffix', t);
}
{
  const t = (prov + '\n' + matrix(rows)).replace('## Adjacent — sibling matrix\n', '### Adjacent — sibling matrix\n');
  run('T2-h3-heading', t);
}
// U: duplicate lane where second occurrence is identical — duplicate-lane fires regardless. Already covered by battery.
// V: rows for all lanes but one row has relation valid, head valid, cite valid, quote valid, side 4 words — but lane name has different case 'Audio' -> unknown-lane + lane-missing audio. Test.
{
  const t = (prov + '\n' + matrix(rows)).replace('| audio |', '| Audio |');
  run('V-lane-case', t);
}
// W: 'contested' detection on sibling side uses /contested/i on the whole LINE naming tabi — a line like "not contested: boundary agreed" still triggers. And relation=contested passes even if the contested word is unrelated to tabi (same line though). Also: sibling line names tabi AND says contested but for a DIFFERENT lane pair — false contested requirement. Real example? kake line 45 mentions kagi/tabi/kake. Hard to construct without editing sibling. Skip live; note as design limit.
// X: outbound — Refuses paragraph: regex stops at FIRST \n\n. In base PROVINCE, Refuses block is one paragraph ending "operation only.\n\n**Out of province". If author adds lane names after the paragraph (later sections), not outbound. Conversely if Refuses para mentions lane inside a longer token with hyphens — \b matches at hyphen boundaries (L test covers 'prefix-audio-suffix': \b before 'a' in audio? 'prefix-audio-suffix': positions — '-' non-word, 'a' word => boundary => matches 'audio'! and after 'o' before '-' boundary => matches. So hyphenated compound DOES match. That means 'revenger-tools' in Refuses would mark revenger outbound — arguably correct anyway.
// Y: inbound detection — sibling PROVINCE.md at head names tabi ANYWHERE (any line), including kotoba's own matrix row line 76 which literally documents tabi's boundary. For kotoba the row must cite PROVINCE.md:76 — fine. But note: sibling lines naming tabi in NON-boundary contexts (kengaku:103 citation of a script path) force a cite+non-none relation. That's the 'citation is not a boundary claim' defect — already probed via D/E.
// Z: quote may cite a line that names NOTHING relevant — counter doesn't require the cited line to relate to the sibling/tabi boundary at all. Any 3-25 word line in any file at that head works. E.g. cite SKILL.md changelog line. Test: pick audio cite = last line of PROVINCE (trivial).
{
  const t = show('audio', 'PROVINCE.md');
  const lines = t.split('\n');
  // find a line about something unrelated e.g. containing 'Windows'
  let idx = lines.findIndex((l) => /Windows|host/i.test(l) && words(l) >= 3 && words(l) <= 25);
  const rs = rows.map((r) => r.lane === 'audio' ? { ...r, cite: 'PROVINCE.md:' + (idx + 1), quote: lines[idx] } : r);
  run('Z-unrelated-cite', prov + '\n' + matrix(rs));
}
// AA: side cell 4 words of pure punctuation '— — — —'? words() splits on space; '— — — —' = 4 'words' -> passes! Test.
{
  const t = (prov + '\n' + matrix(rows)).replace('tabi holds no audio ground', '— — — —');
  run('AA-side-punct', t);
}
// AB: quote cell = 3 words that appear on cited line but quote is gibberish order? must be substring — order preserved. skip.
// AC: cite path traversal 'PROVINCE.md' vs './PROVINCE.md' or 'sub/../PROVINCE.md' — git show head:./PROVINCE.md fails probably. Test '../x'.
{
  const rs = rows.map((r) => r.lane === 'audio' ? { ...r, cite: '../audio-shokunin/PROVINCE.md:3' } : r);
  run('AC-cite-traversal', prov + '\n' + matrix(rs));
}
// AD: head cell uppercase hex — snapshot lowercase; !== -> head-not-snapshot. skip (covered by vocab).
// AE: snapshot has 20 lanes; what if PROVINCE matrix contains all 20 + extra unknown -> unknown-lane fires. covered.
// AF: relation 'contested' for lane whose sibling PROVINCE does NOT name tabi — allowed? Counter only checks inbound-contested one direction (sibling contested => row contested). Row contested with no sibling contested text = no check! E.g. mark 'lore' contested arbitrarily. Test.
{
  const rs = rows.map((r) => r.lane === 'lore' ? { ...r, rel: 'contested' } : r);
  run('AF-arbitrary-contested', prov + '\n' + matrix(rs));
}
// AG: inbound-unanswered requires cite PROVINCE.md at EXACT named line. Sibling names tabi at lines 40 AND 45 (kake). Row citing 45 works even though 40 also names tabi — counter only needs SOME named line to equal cite line. Fine.
// But: if sibling PROVINCE has NO tabi mention, row may cite anything. If sibling names tabi only in SKILL.md (not PROVINCE.md), no inbound at all — detection is PROVINCE.md-only. That's assignment hint; can't easily verify a real sibling does this. Check quickly which siblings name tabi in SKILL.md but not PROVINCE.md.
{
  const hits = [];
  for (const [lane, head] of snap) {
    const sk = show(lane, 'SKILL.md');
    const pr = show(lane, 'PROVINCE.md');
    const skTabi = sk && /\btabi\b/i.test(sk);
    const prTabi = pr && pr.split('\n').some((t) => /\btabi\b/i.test(t));
    if (skTabi && !prTabi) hits.push(lane);
  }
  console.log('siblings naming tabi in SKILL.md but NOT PROVINCE.md:', JSON.stringify(hits));
}
fs.writeFileSync('/fast/scratch/hyaku/tabi-r69/R69Review1/probe-results.json', JSON.stringify(out, null, 1));
