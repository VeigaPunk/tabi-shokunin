VERDICT: ISSUES

# NewS063 — S063 live re-open and adjacent-cell falsification (round 18, wave 2)

Seat `TabiR18.NewS063-2` (leaf scout). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`;
measured revision `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (`git rev-parse HEAD` → same,
HEAD detached; `git rev-parse refs/heads/master` → same). Baseline B `2bff864`. Read-only
production: no lane edit, no git write, no jj; all fetches into `/tmp/tabi-s063/`. Tooling:
host `curl`, `node` v24.21.0, read-only `git ls-remote`; nothing installed or upgraded.

The S063 *row evidence* reproduces exactly at REV. The issues are in the row's `teaches`
cell (unsourced second clause), two dossier-vs-row inconsistencies, one reversed paraphrase
in the used-by knowledge note, and the S057/S053 publisher premise that survives the C3 D4
correction.

## 1. S063 — row URL re-opened (the assigned quote)

Row at REV: `corpus/SOURCES.md:77`.

```
| S063 | Node signal events — https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md | docs | A | POSIX signal defaults and listeners in Node v24.21.0 | §Signal events, doc/api/process.md:756-759 and :761-766, tag v24.21.0 commit 955266bfdd854cd280dffd47548673914484e4c0 | Installing listeners removes default SIGTERM/SIGINT/SIGHUP termination; an abort handler must explicitly own shutdown and its exit result | mined | 2026-10-20 | on-release | corpus/knowledge/harness-hardening-round-18.md |
```

Fetch (2026-10-20):

```
$ curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-r18/1' \
    -o node-v24.21.0-process.md -w 'HTTP:%{http_code} bytes:%{size_download}\n' \
    https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md
HTTP:200 bytes:33699 url:https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md
$ sha256sum node-v24.21.0-process.md
3107879760e5fcd72bc2c48e77460b418b714a693a54073c51314934586ab3b7
$ wc -c node-v24.21.0-process.md
134327
```

That is the exact digest and size in the Gate entry (`corpus/lessons/round-18.md:44`,
`3107879…ab3b7 (134327 B raw md at v24.21.0)`), and the fetch is HTTP 200 with a fixed
tag-pinned body.

Revision binding (`git ls-remote https://github.com/nodejs/node 'refs/tags/v24.21.0*'`,
read-only):

```
f37d7da830134b5314a14ced553273786a2bb4cd	refs/tags/v24.21.0
955266bfdd854cd280dffd47548673914484e4c0	refs/tags/v24.21.0^{}
```

`v24.21.0` tag object `f37d7da8…2bb4cd`, peeled commit `955266bf…84e4c0` — matches the row,
the lesson Gate entry and dossier §1/§3. Release date (`https://nodejs.org/dist/index.json`,
HTTP 200, 333611 B, sha256 `b52f521b8e24898364b74f03596afef1f97c1448014df7c2b5ebdcd2b69ca4a9`):
`v24.21.0` 2026-09-07 Krypton; `v24.22.0` 2026-10-14 Krypton.

Quote, located and counted:

```
$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode none \
    --body /tmp/tabi-s063/node-v24.21.0-process.md \
    --quote 'If one of these signals has a listener installed, its default behavior will be removed (Node.js will no longer exit).'
{"found":true,"offset":23798,"normalizedLength":130740,"window":"… If one of these signals has a listener installed, its default behavior will be removed (Node.js will no longer exit). * `'SIGPIPE'` …"}
EXIT:0
```

Word count (JS `.trim().split(/\s+/).length`) = **20**, i.e. ≤25. Exact source lines from the
fetched body:

```
756  * `'SIGTERM'` and `'SIGINT'` have default handlers on non-Windows platforms that
757    reset the terminal mode before exiting with code `128 + signal number`. If one
758    of these signals has a listener installed, its default behavior will be
759    removed (Node.js will no longer exit).
761  * `'SIGHUP'` is generated on Windows when the console window is closed, and on
765    behavior of `SIGHUP` is to terminate Node.js, but once a listener has been
766    installed its default behavior will be removed.
```

The Gate entry's location `doc/api/process.md:757-759` is correct (the quote starts mid-757),
and the row anchor's `:756-759 and :761-766` covers the SIGTERM/SIGINT bullet head and the
SIGHUP default-terminate bullet. No divergence by comment or backticks: the quote is plain
prose; the only backticked token in the neighbourhood is `` `128 + signal number` `` in the
preceding sentence at :757, outside the quote. The quote differs from the raw file only by the
md line wrap, which the shared normalizer collapses.

Pinned rendered form and the rolling page:

```
$ curl … https://nodejs.org/docs/v24.21.0/api/process.html
HTTP:200 bytes:46948 ; on disk 359605 B ; sha256 1224adf135fbd77cddbada63b43a8fbcd6f56e22d8c2ac02c46a2d9b9180a4b5
--normalize-only --decode html-text → {"found":true,"offset":31411,…} EXIT:0

$ curl … https://nodejs.org/docs/latest-v24.x/api/process.html
HTTP:200 bytes:47046 ; on disk 359705 B ; sha256 5573303fa35e48625332b0f2fe18bc211b4e4b341d9c60ac2ed081ace1ae55f6
<title>Process | Node.js v24.22.0 Documentation
--normalize-only --decode html-text --quote '<S063 quote>' → {"found":false,"offset":-1,"normalizedLength":128747,"window":null} EXIT:1
--normalize-only --decode html-text --quote 'Signal events are emitted asynchronously, so Node.js may exit before the listener is called if the event loop is otherwise empty.' → {"found":true,"offset":31499,…} EXIT:0
```

All three digests equal the lesson Gate entry and dossier §1. The lesson's claim
(`corpus/lessons/round-18.md:44`) that the quote is absent from the rolling page served as
24.22.0 is reproduced (exit 1); the replacement async sentence is present.

### Finding N1 (medium) — S063 `teaches` carries an unsourced second clause

`corpus/SOURCES.md:77` teaches two things:

1. "Installing listeners removes default SIGTERM/SIGINT/SIGHUP termination" — grounded by the
   quote (:757-759, SIGTERM/SIGINT) and the anchored SIGHUP bullet (:764-766).
2. "an abort handler must explicitly own shutdown and its exit result" — **not in the quote
   and not in the anchored lines**. The fate of the handler is a design consequence of the
   listener removing Node's default exit; "its exit result" additionally depends on
   `process.exit()` semantics at `doc/api/process.md:4228-4247` (dossier F6), which the row's
   anchor does not cite. The dossier derives this in §6A ("H1 is met only if …") but does not
   mark it `[INFERENCE]`, and the source contract (`SOURCES-CONTRACT-v1.md` rule 1) says the
   Gate quote with location grounds `teaches`. The row's `scope` is "POSIX signal defaults and
   listeners", so tier A does not cover a harness shutdown rule either.
   Fix: either split `teaches` (source fact only) and move "handler must exit" to the knowledge
   note as a derived requirement, or extend the anchor to :4228-4247 and label the clause as
   derived. This does not falsify the first clause or the quote.

## 2. Dossier vs committed row — two concrete inconsistencies

Dossier `.ufo/waves/round-18/sources/SrcNodeSignals.md` (parts cited by the Gate entry as
`§3 (Gate entry), §4 (normalize-only A), §6C–D`):

### Finding N2 (low) — §3 names the wrong URL as the row source

`SrcNodeSignals.md:59`:

```
| URL (row source) | https://nodejs.org/docs/latest-v24.x/api/process.html#signal-events — HTTP 200, served v24.22.0, body 359705 B, sha256 5573303f… |
```

The committed row (`corpus/SOURCES.md:77`) and the Gate entry (`corpus/lessons/round-18.md:44`)
use `https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md`. The document
that the dossier calls the "row source" is the rolling page on which I measured
`found:false` / exit 1 for the S063 quote. The raw md appears only under "Anchor URL (pinned
revision)" at `:60`. A C1 receipt built from the dossier's "row source" URL would fail the
`quoteFound` rule (PLAN §C1). Draft provenance explains it (`:46` drafts the same rolling URL,
status `queued`, `used-by —`), but the field label is false at REV. Fix: relabel `:59` as
"rolling witness URL" and put the raw tag URL in the row-source slot; or add a line stating
the committed row source is the raw URL.

### Finding N3 (low) — stale registry count in §2

`SrcNodeSignals.md:36`: "The registry holds 57 rows and its highest id at the lane tip is
`S057`". At REV the registry has 64 rows and the highest id is S064:

```
$ node scripts/check-sources.mjs
SOURCES_GATE verdict=clean rows=64 tiers=A:52,B:4,C:8 status=queued:8,mined:48,rejected:8 findings=0 file=corpus/SOURCES.md
EXIT:0
```

The note also elides the counting command's output (`awk … | sort -V | tail -1` with `…`), so
it fails `corpus/QUALITY.md:143-146` rule 34's "count with its command and pasted output at the
measured revision". Fix: qualify the sentence as "at baseline B (`2bff864`)" and paste the
`git show B:corpus/SOURCES.md` count, or recompute at REV.

## 3. The used-by note — reversed paraphrase of the 24.22.0 sentence

`corpus/knowledge/harness-hardening-round-18.md` cites S059–S064 in its six `source:` lines
(`:1`–`:6`; S063 at `:5`) and `corpus/SOURCES.md` S059–S064 all list it as `used-by`;
`check-sources.mjs` reports `findings=0`, so the used-by binding exists. S063 is also cited in
the body (`:24`, `:36`, `:38`).

### Finding N4 (medium) — the note states the async sentence backwards

`:24` says:

> The v24.22.0 page adds that signal events may run after Node has exited when the loop is empty (S063, §Signal events, latest page); the v24.21.0 tag does not carry that sentence.

The served v24.22.0 sentence (normalizer offset 31499, quoted verbatim in dossier F7 and
reproduced by my fetch) is:

> Signal events are emitted asynchronously, so Node.js may exit before the listener is called if the event loop is otherwise empty.

The note reverses the direction: the listener may never be called because Node exits first;
it does not "run after Node has exited". The dossier's own F7/§6B3 state it correctly ("A
listener is not guaranteed to run if the loop is empty"), so the note contradicts its cited
dossier. The same note then uses F6 (`:4228-4247`) correctly for the synchronous abort-record
write at `:36` ("The abort record is written with a synchronous file write before
`process.exit(2)` (S063 F6)"). Fix the `:24` clause to "Node may exit before the listener is
called when the loop is empty"; keep the v24.22.0/v24.21.0 attribution, which is accurate.

### Finding N5 (low) — the note cites a v24.22.0 claim to a v24.21.0 row

The `:24` citation is `S063`, whose row scope and source URL are pinned to v24.21.0. The async
sentence is absent from that tag (my `grep -c` on the raw md → 0; versioned HTML → 0) and only
exists on the rolling 24.22.0 page (→ 1). The note does say "latest page", so it is not a
hidden claim, but S063's tier does not cover the 24.22.0 revision; there is no registry row
pinned to 24.22.0. Either register the 24.22.0 observation (dossier fetch #1 is the only
evidence) or cite it as an out-of-row observation rather than as S063.

## 4. S058 rejection reason and flip — verified live

Row at `corpus/SOURCES.md:72`; Gate entry `corpus/lessons/round-18.md:39`.

```
$ curl -sSL --compressed --max-time 90 -A '… tabi-shokunin-s063/1' -o listing.html \
    https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd
HTTP:200 bytes:109633 ; on disk 695875 B ; sha256 5072dfe90fbbff6f3c3aae6842c112361eee3a46b45669fc8c2e8e071eeab4fd
```

Observed on that body: `Developer` card value `Google Ireland, Ltd.` + `Gordon House Barrow
Street Dublin 4 D04 E5W5 IE` (byte offset 567515 in this fetch), `Offered by` = `François
Beaufort`, version `1.9.19`, `Chrome 150.0.7861.0`, `Prerequisites` present twice; token
counts `\bAPI\b` = 0 and `invoke` = 0; `individual publisher` = 0. Normalizer:

```
--decode html-text --quote 'Google Ireland, Ltd. Gordon House Barrow Street Dublin 4 D04 E5W5 IE'
{"found":true,"offset":936,...} EXIT:0
```

So the corrected developer/offerer facts in `S058` (and the lesson quote) still hold, and the
rejection reason ("adds no invocation contract beyond S041/S048") and flip ("listing or
extension source publishes a concrete invocation API contract") are not triggered. S058's
`teaches` starts `supersedes S057 —`, contains both `REJECTED:` and `flip:`, status `rejected`;
`grep -c "individual publisher"` over S058's row is 0. `measure-c3.mjs` d4 likewise passes
(`S058_supersession_verified`).

Caveat (not a falsification): the recorded byte locator is fetch-specific and does not
reproduce — the dossier's fetch #4 was 649152 B / `fbc214a8…c4d2` with value byte 523625;
S057's C1 receipt was 695881 B / `361a9a0f…`; today's re-open is 695875 B / `5072dfe9…` with
value byte 567515. The lesson states "Offsets shift per fetch; locate by quote", but the S058
row anchor cell (`corpus/SOURCES.md:72`) carries only "recorded byte 523625" and the
developer name. A reader following the byte offset fails; following the text succeeds.
Recommend the row anchor name the quote/developer string before the byte.

### Finding N6 (medium) — the falsified publisher premise survives in two registry cells

The C3 D4 correction is scoped by its counter to S058 only
(`.ufo/waves/round-18/measure-c3.mjs:450-471`: unique S058, `supersedes S057 —`, no
`individual publisher`, `developer Google Ireland, Ltd.`, dossier pointer, date), and it
passes. But at REV the phrase is still present in live registry cells:

- `corpus/SOURCES.md:67` (S053, `teaches`): "REJECTED: **individual-publisher** extension
  listing that only restates the S048 DevTools workflow …"
- `corpus/SOURCES.md:71` (S057, `anchor`): "listing fetched 2026-10-20, Offered by François
  Beaufort **(individual publisher)**, …"

Both rows are `rejected` and superseded forward (S057's `teaches` opens `supersedes S053 —`;
S058's opens `supersedes S057 —`), and `corpus/QUALITY.md:140` (rule 33) says "old append-only
rows remain explicitly superseded", so retention is arguably compliant. What is not accurate
is the lesson sentence `corpus/lessons/round-18.md:62` — "S058 supersedes S057 in every cell
that repeated the unsupported publisher classification" — read as a sweep of those cells: the
S057 anchor cell still repeats it, and no cell in S053/S057 carries an inline "superseded by"
marker (only the forward rows do). The next lesson line (`:64`) does say old S053/S057 retain
their bytes, and the source-recheck note acknowledges it:

- `corpus/knowledge/source-recheck-round-18.md:102` reproduces S057's anchor verbatim,
  including `(individual publisher)`, labeled "registry-recorded … (S053 record)"; `:136`
  says "`corpus/SOURCES.md` S057 still carries the 'individual publisher' wording … the
  correction to that cell is outside this note."
- `corpus/evidence/round-18/source-recheck/S057.json` `note` itself says "Anchor cell
  (individual publisher) is corrected by S058 per PLAN D4".

So the premise is knowingly retained, not silently unnoticed; but the D4 wording and the
counter's scope let a reader believe every carrying cell was swept. Fix: change `:62` to
"S058's cells carry none of the falsified classification; S053/S057 remain as explicitly
superseded records", and, if the registry convention allows, add the S057→S058 and S053→S057
pointers in a form a reader of the old row can see (forward rows are the only available
mechanism under append-only).

## 5. Counters and lane state (finite checks run)

```
$ node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
{"rev":"530f…c004","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,…} EXIT:0
$ node .ufo/waves/round-18/measure-c3.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
{"c3_routed_closed":5,"defects":{"d1":{"pass":true,…},"d2":{…},"d3":{…},"d4":{"pass":true,"why":"S058_supersession_verified"},"d5":{…}}} EXIT:0
$ node scripts/check-sources.mjs
SOURCES_GATE verdict=clean rows=64 tiers=A:52,B:4,C:8 status=queued:8,mined:48,rejected:8 findings=0 file=corpus/SOURCES.md  EXIT:0
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
tabi	W04	S058 duplicate url chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd across scopes
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md  EXIT:0
$ git status --porcelain
?? .ufo/waves/round-18/w2/
```

Notes on scope of those outputs: `eligible_rows=58` is 64 rows at REV minus the six superseded
ids; the 51 accepted receipts are the baseline selection, so S063 (new this round, no receipt)
is not counted by C1 — its quote verification is the Gate entry plus this re-open, not a
receipt. The census `W04` is a warning by design ("warnings do not affect clean lanes",
`sources-census.sh:33`); it appears because S053/S057 (`kind=tool`) and S058 (`kind=docs`) share
the listing URL across differing scopes. It does not fail validation, and the lesson's
"census began tabi ok, exit 0" remains true; the warning is simply not recorded. Lane tip
equals REV and the only worktree addition is the wave-2 directory; no lane file was modified by
this seat.

## 6. Limits

- Fetch date for every GET here is 2026-10-20; digests are over the on-disk decoded body
  (`--compressed`), matching the lane's stated convention.
- The raw md, versioned HTML and rolling page are separate bodies; only the raw md and the
  versioned HTML are pinned, and both carry the quote. The rolling page is a witness, not a
  citation.
- No harness was run; C2 behaviour is outside this ticket. The `h3`/`h4` observations in the
  knowledge note were not re-executed.
- The Chrome Web Store body is dynamic (695881 → 695875 → 649152 B across same-day fetches), so
  byte offsets in S058/the lesson are not stable locators; the developer/offerer strings are.
- I did not evaluate `S059`–`S062` or `S064` quotes beyond confirming the note's six `source:`
  lines and the S063-related statements; each has its own wave-2 seat.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/NewS063.md`
- `/tmp/tabi-s063/{node-v24.21.0-process.md,latest-v24-process.html,v2421-process.html,index.json,listing.html,SOURCES-at-REV.md}` (scratch, outside lane; no reproducibility dependency)
