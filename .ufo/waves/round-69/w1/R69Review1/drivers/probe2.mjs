import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const SNAP = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/c1/sibling-heads-r69.tsv';
const FLEET = '/home/vgpnk/Projects/shokunin';
const COUNTER = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-sibling-matrix-r69.mjs';
const W = '/fast/scratch/hyaku/tabi-r69/R69Review1/probes';
const base = fs.readFileSync(W + '/A-base.md', 'utf8');
const idx = base.indexOf('## Adjacent');
let mat = base.slice(idx);
for (const lane of ['revenger', 'kaidoku', 'kagi']) {
  const re = new RegExp('(\\| ' + lane + ' \\| )[^|]+(\\| )');
  mat = mat.replace(re, '$1none$2');
}
const prov = fs.readFileSync('/fast/scratch/hyaku/tabi-r69/R69Review1/PROVINCE.base.md', 'utf8');

const variants = {};
// AK: fake Refuses paragraph BEFORE the real one (regex takes first match)
variants['AK-fake-first'] = '**Refuses:** nothing routed anywhere.\n\n' + prov + '\n' + mat;
// AL: Refuses inside inline code span earlier in doc
variants['AL-code-refuses'] = 'Note: the token `**Refuses:**` appears in prose.\n\n' + prov + '\n' + mat;
// AM: real Refuses paragraph but lane names pushed past first blank line — i.e. Refuses para mentions lanes, then blank line, then a second para continuing the list (already K tested continuation AFTER para end -> outbound missed? K inserted extra para after blank; the outbound lanes were still in first para? Let me re-check K: it inserted "\n\n**outbound-extra:** revenger..." AFTER the refuses text but BEFORE the paragraph's closing blank? The replace put fake para inside? Actually K replaced first "\n\n" after Refuses content — inserting a new paragraph, so lanes in para2 not counted, but revenger etc were already in para1 via "revenger/kaidoku". K set revenger->none and still got outbound-relation-none — because kaidoku/kake/kagi? No, outbound check is per-lane: revenger IS in refusesText (para1). So K didn't test the miss. Real test: a lane ONLY named in para2 of Refuses block.
variants['AM-refuses-para2'] = prov.replace(/(\*\*Refuses:\*\*[\s\S]*?)(\n\n)/, (m, a, b) => a + b + 'Continued routing: audio chassis and lore indexing go to siblings.\n\n') + '\n' + mat.replace(/(\| audio \| )[^|]+(\| )/, '$1none$2').replace(/(\| lore \| )[^|]+(\| )/, '$1none$2');
// AN: '## Adjacent — sibling matrix' heading where table is inside a fenced code block — lines still start with | -> counted. Is that a defect? Markdown-wise it's code, not a table. Counter can't tell. Test: wrap matrix in ``` fences.
{
  const t = prov + '\n```markdown\n' + mat.replace('## Adjacent — sibling matrix', '## Adjacent — sibling matrix') + '\n```\n';
  // heading inside fence: prov.search finds it anyway (regex doesn't know fences)
  variants['AN-fenced'] = t;
}
// AO: heading appears in an HTML comment <!-- ## Adjacent — sibling matrix --> then real table later without heading? search finds comment line; rest includes comment close + real content; table lines still parsed. Weird but passes?
variants['AO-comment-heading'] = prov + '\n<!-- ## Adjacent — sibling matrix\n' + mat.split('\n').slice(1).join('\n') + ' -->\n';
// AP: CRLF line endings — split('\n') leaves \r; heading regex $ with \r? '^## Adjacent — sibling matrix\b.*$' — .*$ matches \r? In JS, $ matches before \n; \r is a char matched by .*? Actually '.*$' — '.' doesn't match \n but matches \r, so heading line 'matrix\r' matches. Table lines '| ... |\r' — cells trim() removes \r? trim removes whitespace incl \r. cite regex on cell ok. quote norm ok. Probably passes — test.
variants['AP-crlf'] = (prov + '\n' + mat).replace(/\n/g, '\r\n');
// AQ: matrix rows use \| escaped pipes legitimately; also test cell with ONLY escaped pipe '\|' as lane -> unescape '|' -> unknown-lane.
// AR: quote exactly at cited line but cite uses absolute-ish 'PROVINCE.md:3 ' trailing space — cite cell trimmed already.
// AS: two rows same lane where FIRST is invalid (bad head) and second valid — duplicate-lane fires on second; first also head-not-snapshot. Refuses anyway.
// AT: 'tabi side' 4 words but meaningless 'the the the the'? words counts them — passes. Meaningless side accepted (AA showed punct passes too).
// AU: lane 'tabi' row inside matrix -> snap.has('tabi') false -> unknown-lane. good.
// AV: snapshot lane 'game-dev-2d' contains regex chars? counter doesn't regex lanes for matching rows — row.lane compared via snap.has — fine.
// AW: outbound detection — Refuses text contains lane name inside a URL 'example.com/kake/x' -> \bkake\b matches -> outbound. If PROVINCE Refuses legitimately mentions 'kake' only as part of URL, false outbound => forces non-none. Wrong-direction (refusal not green). Test anyway? It produces findings = safe. Skip.
// AX: inbound — sibling PROVINCE names 'tabi' as substring of another word? \btabi\b — 'tabi' inside 'tabish'? no. Inside 'multi-tab-interface'? \b before t? '-' boundary => 'tabi' in 'multi-tabi-x' matches! Same hyphen issue. Sibling line "see multi-tabi notes" would force inbound. Edge.
// AY: The BIG one — inbound detection only reads PROVINCE.md. Sibling could name tabi in SKILL.md/README and counter sees nothing. We verified no real sibling currently does (empty list). But a FALSE GREEN exists structurally: if sibling's boundary claim lives in SKILL.md only, relation 'none' passes. Can't demonstrate with real fleet unless one exists — none do. Report as latent gap with the check command.
// AZ: quote length counts words AFTER backtick strip? words(r.quote) computed on raw cell (with backticks). A quote of 25 words + backticks still 25. fine.
// BA: cite 'PROVINCE.md:0' -> line -1 undefined -> cite-line-absent. cite 'PROVINCE.md:-1'? regex (\d+) no minus -> cite-shape? ':-1' -> m fails -> cite-shape. fine.
// BB: cite file 'PROVINCE.md' vs 'province.md' case — git show case-sensitive on Linux -> absent. fine.
// BC: What about lane row where cite points to sibling's OWN file at DIFFERENT path e.g. 'docs/PROVINCE.md'? allowed if exists.
// BD: section end detection — '/^## /' ends section. A '### Adjacent — sibling matrix' INSIDE the section? table filter takes all '|' lines until next '## '. A second '## ' heading ends it — rows after ignored -> lane-missing. covered M-ish.
// BE: heading '## Adjacent — sibling matrix' followed immediately by EOF no table -> matrix-header. fine.
// BF: What if PROVINCE.md has the matrix section BEFORE Refuses? order irrelevant.
// BG: outbound lanes set computed from snap.keys() — all 20. If Refuses names a lane NOT in snapshot (typo 'kaek') no outbound — and row for real 'kake' could be none -> but kake is contested inbound anyway.
// BH: FALSE GREEN candidate — inbound check requires cite line == a tabi-naming line, but ONLY when named.length>0. If sibling PROVINCE names tabi, row MUST cite that exact line. But quote just needs to be on that line — the cited line could be the.tabi mention in a totally unrelated context (kengaku:103 script citation). Already shown E: arbitrary contested passes.
// BI: 'contested' text detection — /contested/i on the LINE. Sibling kake line 45: 'The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)'. If a sibling line says 'formerly contested, now resolved' naming tabi -> row forced contested = wrong-direction refusal.
// BJ: Matrix inside blockquote '> | lane |...' — lines start with '>' not '|' -> not table -> matrix-header/missing. safe.
// BK: Table with leading '|' missing on rows '| lane |...' vs 'lane | relation |...' no leading pipe -> not counted. safe.
// BL: separator row variants — regex /^\|[\s|:-]+\|\s*$/ requires ONLY pipes/spaces/colons/dashes. '|---|---|' ok. A separator like '|:--|--:|' ok. '| - | - |' ok? chars allowed. Fine.
// BM: header regex requires exact 'tabi side' last col — 'Tabi side' fails (case). tested via battery header-renamed.
// BN: What about EXTRA columns in header (7 cols)? header regex anchored $ after 'tabi side |' -> 7-col header fails -> matrix-header. safe.
// BO: rows with 6 cells but lane cell contains '|' escaped -> unescape makes lane 'a|b' unknown. fine.
// BP: NUL/binary in PROVINCE — skip.
// BQ: The 'bound' metric: emit prints bound=N/20 but exit depends only on findings. A row can be 'ok' (bound++) yet semantically wrong — that's the whole false-green class. Documented.
// BR: timing — counter reads sibling files via git show at SNAPSHOT heads — pinned, good.
// BS: '--fleet' could point anywhere; usage constraint. Not a PROVINCE defect.
// BT: snapshot TSV parsed by split('\t') taking first 3 fields; extra columns ignored; lane names with spaces? snapshot fixed.
// BU: refusesText — if '**Refuses:**' paragraph contains lane name inside backticks `kake` — \b matches -> outbound (conservative). If contains 'kake.' punctuation fine.
// BV: What if PROVINCE Refuses paragraph is INSIDE the matrix section or after it — irrelevant.
// BW: duplicate detection — seen.set before checks; a duplicated lane with FIRST occurrence invalid still counts as seen -> second 'duplicate-lane' + first's own findings. refuses.
// BX: rows.length reported but unused in verdict — 20 rows + 1 unknown = findings anyway.
// BY: '## Adjacent — sibling matrix' uses em-dash '—'. A hyphen variant '## Adjacent - sibling matrix' -> no match -> matrix-missing. Case/dash sensitivity = wrong-reason? It's a refusal (safe) but brittle: author using ASCII hyphen gets matrix-missing which is arguably correct-ish (different heading). Note as brittleness.
// BZ: Check 'lane-missing' loop condition `secStart >= 0` — if matrix-missing, no lane-missing spam. good.
// CA: inbound.push only when named.length — output field, cosmetic.
// CB: 'inbound-contested-unnamed' requires r.relation !== 'contested' — if relation IS contested, passes even when contested text refers to different scope. E.g. sibling says "the X lease is contested (a/b)" naming tabi incidentally -> row contested OK. Direction: forces contested. And arbitrary contested (AF) greened.
// CC: CRLF test AP.
// CD: What about a row whose cite is 'PROVINCE.md:45' for kake but quote from line 45 while relation none — inbound fires anyway.
// CE: Does counter verify the matrix is in PROVINCE.md at all vs appended after '## Next'? section end at next '## ' — if matrix is LAST section, body=rest. If author puts matrix then '## Appendix' then MORE table rows — ignored -> lane-missing. safe.
// CF: git show uses spawnSync per row — 20 lanes x 2 files = 40 git calls; fine.
// CG: showFile returns stdout even for binary/huge — fine.
// CH: quote check `lineText.includes` — quote could match ANYWHERE in the line incl. inside a URL or hash. e.g. cite line is a git SHA line; quote 'abc123 def456' matching hash chars? words>=3 needed. Minor.
// CI: IMPORTANT — quote normalization strips backticks from BOTH line and quote, but does NOT strip other markdown: '*', '_', '[', ']'. A quote written without markdown chars won't match a line full of them — refusal direction. But reverse: quote WITH '*' etc must appear literally. The backtick asymmetry: claim says "verbatim, whitespace-normalised" — backtick stripping makes it NON-verbatim. Demonstrated Q: quote 'Only writes .shokunin/audio/** and its own reports.' passed against raw line 'Only writes `.shokunin/audio/**` and its own reports.' — the quote is NOT a substring of the actual line (backticks removed). That's a spec-vs-implementation gap: quote needn't be verbatim. Severity: low-medium (evidence authenticity).
// CJ: Similarly cells strip ^`|`$ — a lane cell '`audio`' passes (N). A quote cell wrapped in backticks: '`foo bar baz`' -> cell unwrapped to 'foo bar baz' then backtick-strip anyway. fine.
// CK: What about quote cell that is entirely '`code`' 1 word -> quote-length fail. fine.
// CL: side cell — strips backticks at edges only. side '— — — —' passed (AA). side could be 'tabi owns nothing relevant here ok' 6 words of vacuous text — passes. The 'tabi side' check is only >=4 words, no semantic content. Vacuous side = false-green dimension. Demonstrated.
// CM: Does anything check the ROW ORDER or that matrix documents ALL siblings' perspectives? No — one-directional.
// CN: 'relation' semantics: 'none' means no boundary; but nothing checks relation against sibling's own declared relation toward tabi! kotoba's PROVINCE line 76 literally has a table row '| tabi | none | ...' documenting ITS relation to tabi. Counter only checks: sibling names tabi -> cite that line + relation != none + contested propagation. It does NOT parse the sibling's stated relation ('none' in kotoba's row) vs tabi's claimed relation. If kotoba says 'none' and tabi says 'adjacent', counter is silent — asymmetric disagreement undetected. Check: does any sibling PROVINCE state a relation toward tabi that contradicts? kotoba:76 says none. Our A-base has kotoba=adjacent and passed! Wait — A-base set kotoba 'adjacent' and exit 0. kotoba's own matrix says tabi|none. So counter greened a CONTRADICTION: sibling declares none, tabi declares adjacent. That's a real false-green finding! Let me verify kotoba line 76 content again: '| tabi | none | 856fa9e... | tabi owns browser-session ... it states no split with kotoba on its scope surfaces. |' — yes sibling-side relation 'none'. tabi row 'adjacent' citing that very line. Counter passed. HUGE finding: no bidirectional consistency check.
// CO: Also kengaku:103 — '**tabi** `scripts/...`' is a citation of a SCRIPT not a boundary claim; forcing cite+adjacent on it is over-trigger (wrong-direction). And our E showed 'contested' arbitrary passes.
// CP: Refuses outbound: 'revenger/kaidoku' in Refuses — regex \brevenger\b matches. But what about lane names that are substrings of OTHER lane names? 'kake' vs 'kake'? 'kagi' vs 'kage'? LANES: kagi, kaidoku, kake, kama, kasegi, kengaku... 'kake' is substring of nothing. 'mado' vs 'madori'? no. 'lore' in 'explore'? \b prevents. 'kama' in 'kamae'? no such lane but word boundary handles. 'souji' fine. 'mori' in 'memorial'? \bmori\b — 'memorial' contains 'mori' but preceded by 'm' word char -> no boundary -> safe. BUT 'tameshi' etc fine. What about 'audio' in 'audio-'? boundary yes. OK.
// CQ: heading regex /^## Adjacent — sibling matrix\b.*$/m — '## Adjacent — sibling matrix:' with colon? \b after 'matrix' before ':' -> boundary exists -> matches. fine.
// CR: emit() — when usage error, findings printed; exit 2. fine.
// CS: Does counter handle PROVINCE.md that IS a directory or unreadable -> exit 2. fine.
// CT: snapshot 'captured_at' unused — fine.
// CU: Multiple '## Adjacent — sibling matrix' — first wins (I greened with two valid). If first is STALE/decoy valid and second is authoritative — both pass anyway since identical requirements. If first has all-valid rows and second differs — counter only sees first: a doc could carry a valid decoy matrix AND a contradictory real matrix later; counter green. Demonstrated I partially. The real risk: section ordering ambiguity — 'first match wins' undocumented.
// CV: '## Adjacent — sibling matrix' inside the matrix's own section end? covered.
// CW: Check whether counter validates that cited file is INSIDE the sibling repo (cite 'PROVINCE.md' vs absolute '/etc/passwd' — git show head:/etc/passwd fails; cite ':/path'? m[1] regex [^:\s]+ can't contain ':'; 'HEAD:...' no. safe-ish. cite '..' tested AC fails.
// CX: quote with newline? cell is single line; \n can't appear. fine.
// CY: 'words' counts '—' as word? split(' ') — '—' is a token -> counts. AA showed punct passes.
// CZ: Final — does battery cover false-greens? Battery negatives are all refusal-direction (each expects a finding). NO negative asserts a wrong-but-green case because battery can't know semantics. The false-green class is exactly what battery misses by design. Report.

for (const [name, text] of Object.entries(variants)) {
  const f = W + '/' + name + '.md';
  fs.writeFileSync(f, text);
  const p = spawnSync(process.execPath, [COUNTER, '--province', f, '--snapshot', SNAP, '--fleet', FLEET, '--json'], { encoding: 'utf8', maxBuffer: 256 << 20 });
  let j = null; try { j = JSON.parse(p.stdout); } catch { j = { raw: p.stdout.slice(0, 300) }; }
  console.log(name, 'exit=' + p.status, 'bound=' + (j.bound ?? '?'), 'ids=' + JSON.stringify(j.findings ? j.findings.map((x) => x.id) : j.raw));
}
