# ScribeQuality67 — draft QUALITY criteria 67 and 68 (report-only)

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, branch master.
`git rev-parse HEAD` → `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`; baseline
`f185b4e7ab10cd9e8925e8ec614c9c111772357d`. Observed 2026-10-25 17:37–17:45 UTC.
Read-only seat: no tracked file was edited; the only writes are this report and
throwaway fixtures under `.ufo/waves/round-27/scratch/ScribeQuality67/`.

## Behavior

Assigned: draft, report-only, two `corpus/QUALITY.md` criterion texts in the voice of
criteria 64–66 — (a) Q67 on base64 `?format=TEXT` source admission (routed round-26
LOG next-iteration (c), M2 fix), (b) Q68 on the report contract path/SHONEN bar (routed
round-26 M1 fix) — citing `corpus/evidence/round-26/sources/`, the round-25 closure
defect, `scripts/report-contract.mjs`, and the round-25 wrong-path defect.

**State at arrival changes the deliverable's shape.** Both ids are already taken: Q67/Q68
landed in `336d5d1` (`git show --stat 336d5d1` → `corpus/QUALITY.md | 18 +`). At HEAD the
texts sit at `corpus/QUALITY.md:360-367` and `:368-376`. While this seat ran, the working
tree acquired an **uncommitted rewrite** of both (`git status --porcelain` → `M
corpus/QUALITY.md`; `git diff -- corpus/QUALITY.md` shows Q67/Q68 replaced wholesale, now
`cases=5` and naming `scripts/report-contract.mjs`). So the L1's action is a *replacement*
of `:360-376`, never an append, and this report drafts against the shipped code, not
against either text.

Every clause below was re-derived: the criteria were read, the gate and utility source was
read line-by-line, the S106 transfer was re-fetched and re-decoded, and the report utility
was exercised in four arms from a byte-identical snapshot.

## Axes (godspeed)

| Axis | Move kept | Why it is not a loss |
|---|---|---|
| Falsifiability | each drafted predicate names a command that can fail today | Q68's four arms were executed; Q67's gate paths were read and its exit taxonomy confirmed |
| Groundedness | every path, digest, byte count, line number and case count re-measured at this tip | three stale numbers found and excluded (F3, F5, F6) |
| Non-vacuity (Q64-class) | the encoded digest is named as owed, never counted as checked | it has no reader in `scripts/` (sweep V5) — a clause claiming it would be vacuous |
| Voice/structure | numbered paragraph, clause-dense, closing `(lesson: …; routed …; instrument)` suffix | same shape as `QUALITY.md:331-358` |
| No harm | no Q63–Q66 clause duplicated or reversed; ids already unique | V1, V13 |

## Draft (a) — Criterion 67, copy-ready (replaces `corpus/QUALITY.md:360-367`)

```
67. A googlesource `?format=TEXT` source row is not admitted until its base64 transfer has
    been decoded and the decoded bytes and both digests — the transfer's `encoded_sha256`
    and the text's `decoded_sha256` — are committed as lane evidence: reading the transfer
    as the document is a reproducible defect class, the round-25 reader returning "only a
    tiny text transfer with no readable cited feature lines" while the anchor existed
    (round-25 closure defect 4: "S106 exact source line was not recoverable through
    independent source reopen"). The receipt names `bytes_path`, `decoded_sha256`,
    `encoded_sha256` and the transfer encoding, and the gate reads committed blobs at the
    named revision only — never the live URL — rehashing the decoded bytes, checking the
    byte count and requiring the anchor text at its recorded line exactly once; a missing
    receipt or missing bytes is could-not-evaluate, never valid. The encoded digest is
    provenance until an instrument compares it: its reader and red mutant are owed and
    named, never counted as checked. (lesson: corpus/lessons/round-26.md#m2; routed
    round-25 closure defect 4 — corpus/lessons/round-25-verifier-spotcheck.md:44; evidence:
    corpus/evidence/round-26/sources/{s106.json, content-features-154.0.8037.97.cc};
    `scripts/check-s106-evidence.mjs` cases=5)
```

## Draft (b) — Criterion 68, copy-ready (replaces `corpus/QUALITY.md:368-376`)

```
68. Before a round's report is fleet-committed, a runnable utility is run on it by path at
    the contract location `.ufo/reports/round-<N>/<lane>.md` and must exit 0: all six
    headings present in order — Work performed, Landed changes, Before → after
    measurements, Sources & frontier, Trend verdicts, SHONEN — exactly one `## SHONEN`
    holding one checkbox per box the lane's `SHONEN.md` defines, and no `.ufo/waves/`
    path, which is a refusal because that is where the round-25 report was first written
    without SHONEN and re-filed at the contract path only on the orchestrator's prompt.
    Fenced blocks are masked before parsing, so a quoted heading or checkbox cannot satisfy
    a clause, and the box count is read from `SHONEN.md` rather than from the report;
    multiplicity is enforced for `## SHONEN` only, and a duplicated named section passing
    today is recorded as owed, not claimed. (lesson: corpus/lessons/round-26.md#m1; routed
    round-25 closure defect 1 — corpus/lessons/round-25-verifier-spotcheck.md:9;
    `scripts/report-contract.mjs`: clean report PASS, waves-path FAIL, 3-box FAIL,
    duplicate-section PASS)
```

## Verification ledger

Run from `/home/vgpnk/Projects/shokunin/tabi-shokunin` unless a `-C` names another root.

| # | Clause | Command | Observed |
|---|---|---|---|
| V1 | ids taken / unique | `grep -n '^67\.\|^68\.' corpus/QUALITY.md`; `git show 336d5d1 --stat` | `67.` and `68.` each once; landed by `336d5d1` (+18 lines in `corpus/QUALITY.md`) |
| V2 | evidence committed | `git ls-files corpus/evidence/round-26/sources/`; `wc -c`; `sha256sum` | `content-features-154.0.8037.97.cc` 73,952 B sha256 `9b93fe64…`; `s106.json` 1,750 B sha256 `f13e55ba…` |
| V3 | receipt shape | `cat corpus/evidence/round-26/sources/s106.json` | `transfer: "base64 (?format=TEXT)…"`, `encoded_bytes: 98604`, `encoded_sha256: f17347b2…`, `decoded_bytes: 73952`, `decoded_sha256: 9b93fe64…`, `bytes_path`, `anchor.line: 187`, `occurrences_in_file: 1` |
| V4 | transfer really is base64, committed bytes reproduce | `curl -sSL …?format=TEXT -w 'HTTP=%{http_code} bytes=%{size_download}'`; `sha256sum`; `base64 -d`; `cmp` | HTTP **200**, **98,604** B, sha256 `f17347b2…`; decoded **73,952** B sha256 `9b93fe64…`; `cmp` → identical to committed bytes; anchor at `:186-187` |
| V5 | anchor unique in committed bytes | `grep -c 'BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);' <bytes>` | `1` |
| V6 | encoded digest has no reader | `git grep -c 'encoded_sha256' -- scripts/` | **no match, rc=1** — the only occurrences lane-wide are `corpus/QUALITY.md:362` and `s106.json:8` |
| V7 | gate predicate set | `sed -n '96,132p' scripts/check-s106-evidence.mjs` | `valid = shaMatch && anchorLocated && anchorUnique && byteCountMatch` (`:127`); `shaMatch` is the **decoded** digest (`:120`) |
| V8 | gate reads committed blobs, never the URL | `sed -n '66,73p' …`; `grep -n 'http' …` | `readBlob` = `git show <rev>:<path>`; header `:15` "it never fetches"; the one `http` string is the fixture URL `:164` |
| V9 | gate exit taxonomy | `grep -n 'Refusal\|process.exit' …`; `sed -n '286,310p' …` | `Refusal` → `process.exit(2)` (could-not-evaluate) at `:302-304`; missing receipt `:111`, missing bytes `:117` both `Refusal` |
| V10 | selftest case count | `grep -nE '^\s+id: "[a-z]' scripts/check-s106-evidence.mjs` | **5** cases at `:177,183,190,202,208`; registry row `SKILL.md:2514` says `cases=5, passed=5`; in-file header `:8` still says "4 isolated cases" (stale) |
| V11 | report contract path | `.ufo/prompts/tabi-round-27.md:101` | "Write the round report at `/home/vgpnk/Projects/shokunin/.ufo/reports/round-27/tabi.md`" |
| V12 | six required headings, order | `.ufo/prompts/tabi-round-27.md:104-116`; `grep -n '^## ' .ufo/reports/round-26/tabi.md` | Work performed / Landed changes / Before → after measurements / Sources & frontier / Trend verdicts, plus SHONEN; round-26 report `:15,58,74,98,118,133` in that order |
| V13 | SHONEN box count | `cat SHONEN.md`; `grep -c '^- \[' …` | **4** boxes, all `[~]` with one evidence line each |
| V14 | interim runnable check | `.ufo/prompts/tabi-round-27.md:380` | "run `grep -c '^## SHONEN' <report>` — it must print 1" |
| V15 | utility exists? | `git status --porcelain scripts/`; `git cat-file -e HEAD:scripts/report-contract.mjs`; `sha256sum` | **`?? scripts/report-contract.mjs`** (untracked), 140 lines, 5,718 B, sha256 `b1e296bf…`, byte-identical to `.ufo/waves/round-27/scratch/ExecReportContract/report-contract.mjs`; at HEAD: "exists on disk, but not in 'HEAD'", rc=128 — **F1** |
| V16 | utility arm A — clean report | snapshot sha256 `b1e296bf…`; `node <snapshot> /home/…/.ufo/reports/round-26/tabi.md` | `PASS … 6/6 sections in order; SHONEN 4/4 boxes`, exit 0 |
| V17 | utility arm B — duplicate named section | same snapshot, fixture copy + appended `## Trend verdicts` | `PASS`, exit 0 — multiplicity of non-SHONEN sections **not** enforced (**F3**) |
| V18 | utility arm C — short SHONEN | fixture, one box line deleted | `(b) ## SHONEN carries 3 checkbox(es); SHONEN.md defines 4`, exit 1 |
| V19 | utility arm D — `.ufo/waves/` path | fixture at `fakeroot/.ufo/waves/round-99/tabi.md`, otherwise valid | `(c) … is under .ufo/waves/ — land reports in .ufo/reports/round-<N>/tabi.md (round-25 defect class)`, exit 1 |
| V20 | round-25 repaired report vs the bar | `node <snapshot> /home/…/.ufo/reports/round-25/tabi.md` | `FAIL`: missing Work performed / Landed changes / Before→after; **2 `## SHONEN` headings** (`:75`, `:109`) — **F7** |
| V21 | round-25 wrong-path record | `grep -n 'wrong fleet path' corpus/lessons/round-25-verifier-spotcheck.md` | `:9` "Report initially landed at wrong fleet path `.ufo/waves/round-25/tabi.md` without a SHONEN section, then was re-filed at contract path only on orchestrator prompt." |
| V22 | was it ever committed there? | `git -C /home/vgpnk/Projects/shokunin log --all -- .ufo/waves/round-25/tabi.md \| wc -l`; same in lane | **0** and **0** — so "landed" is a working-tree landing, not a commit (**F6**) |
| V23 | defect 4 wording | `grep -n 'S106 exact source line' corpus/lessons/round-25-verifier-spotcheck.md` | `:44` "(4) S106 exact source line was not recoverable through independent source reopen; provide resolvable decoded source evidence." |
| V24 | the misread is the defect class | `sed -n '35p;45-50p' corpus/lessons/round-25-verifier-spotcheck.md` | `:35` "Reader returned only a tiny text transfer with no readable cited feature lines"; erratum `:47-50` decodes base64 and finds line 187 |
| V25 | lesson M1's own evidence sentence | `git -C /home/vgpnk/Projects/shokunin log --all --oneline -- .ufo/waves/round-25/tabi.md` | empty, rc 0 — the lesson's "shows the round-25 report first committed at the wrong path" is **not** what the command shows (**F6**) |
| V26 | no Q63–Q66 breach | read `corpus/QUALITY.md:331-358` | Q63 change↔LOG commit; Q64 gate rows/mutants; Q65 supersession; Q66 measurement-revision binding — neither draft duplicates or reverses a clause |
| V27 | round-27 tabi report not yet landed | `ls /home/vgpnk/Projects/shokunin/.ufo/reports/round-27/` | 12 lane reports, **no `tabi.md`** |

## Findings

**F1 — Q68's instrument is untracked (blocking for the citation as written).**
`scripts/report-contract.mjs` exists on disk (5,718 B, sha256 `b1e296bf…`) but is `??` in
`git status` and absent from HEAD (`git cat-file -e HEAD:scripts/report-contract.mjs` →
rc 128). Its own header says "Not a gate; run it by hand on a report before hand-off".
The criterion may cite it only once it is committed; I exercised the exact bytes from a
snapshot (V16–V20), so the arms describe the file the L1 will commit, not a claim about
HEAD. A byte-identical copy already sits at
`.ufo/waves/round-27/scratch/ExecReportContract/report-contract.mjs`, so the integration
step is a commit, not a rewrite.

**F2 — the utility is lane-bound where the criterion template is not.**
`REPORT_RE = /(?:^|\/)\.ufo\/reports\/round-\d+\/tabi\.md$/` — the shipped utility accepts
`tabi.md` only. Draft (b) keeps the generic `.ufo/reports/round-<N>/<lane>.md` (the
prompt's wording) and names the utility as the instrument; the L1 should either keep this
lane's `<lane>` = `tabi` implicit or state it, but must not read the placeholder as proof
the utility is fleet-generic.

**F3 — "each required section exactly once" is not enforced; only SHONEN multiplicity is.**
Arm B (V17) appends a second `## Trend verdicts` and the utility still prints PASS: the
section loop records presence and first line only, while `seen`/`copies` is consulted for
`## SHONEN` alone. Draft (b) therefore says "all six headings present in order" and
"exactly one `## SHONEN`", and records the duplicate-section gap as owed. Any wording that
says "every section exactly once" would name a predicate the shipped utility cannot fail.

**F4 — the landed Q67's `cases=4` became stale in the same round.**
At HEAD, `corpus/QUALITY.md:367` reads "`scripts/check-s106-evidence.mjs` cases=4". The
shipped selftest has **5** cases (V10: `:177,183,190,202,208`), `SKILL.md:2514` records
`cases=5, passed=5`, and `corpus/lessons/round-27.md` §M3 states "the fifth selftest case
asserts exit 2; the SKILL registry row records 5/5". `SCORECARD.md:1397` still says
"selftest 4/4" (stale; not this seat's file). The working-tree rewrite already carries
`cases=5`; draft (a) does too. Related: the gate's own header comment `:8` still says
"4 isolated cases" — a one-line comment fix, gate-owned, not edited here.

**F5 — "both digests" is only half mechanized.**
`git grep -c 'encoded_sha256' -- scripts/` returns no match (V6). The gate requires
`url`, `decoded_sha256`, `bytes_path` (`:96`), then compares the decoded digest, anchor and
byte count (`:127`); `encoded_sha256` is never read, and the selftest fixture receipt
(`fixtureReceipt`, `:160-172`) omits it. So a receipt with that field deleted still passes —
under Q64's rule the field has no predicate. Draft (a) keeps both digests as the bar and
states the encoded one is "provenance until an instrument compares it", with its reader
and red mutant named as owed. This matches the working-tree revision's intent without
claiming a check that does not exist.

**F6 — Q68's sourced defect is a working-tree landing, not a commit.**
`git log --all -- .ufo/waves/round-25/tabi.md` returns **0** commits in the fleet repo and
**0** in the lane (V22). `corpus/lessons/round-26.md` M1 nevertheless says that command
"shows the round-25 report first committed at the wrong path". The record that does exist
is the verifier's sentence at `corpus/lessons/round-25-verifier-spotcheck.md:9` ("initially
landed … then was re-filed at contract path only on orchestrator prompt"). Draft (b) says
"first written … re-filed … only on the orchestrator's prompt" and cites `:9`, so the
criterion does not inherit an uncommittable existence claim. (The working-tree revision's
"wrong-path draft" is accurate for the same reason.)

**F7 — the round-25 repaired report does not satisfy the bar it motivated.**
`/home/vgpnk/Projects/shokunin/.ufo/reports/round-25/tabi.md` fails the utility: it has no
`## Work performed`, `## Landed changes` or `## Before → after measurements`, and it
carries **two** `## SHONEN` headings (`:75`, `:109`) — V20. This is a calibration fact, not
a reason to weaken the bar: the criterion describes the bar from round 27 forward, and the
round-25 file is historical. Noted so the L1 does not cite it as a passing example.

**F8 — state, not a defect: HEAD and the working tree disagree about Q67/Q68.**
`git diff -- corpus/QUALITY.md` shows the L1 (or a peer landing on its behalf) already
replacing both criteria in the working tree, with `cases=5` and the utility named. HEAD
still carries the `cases=4` text. Whichever text the L1 keeps, it must be committed with
`scripts/report-contract.mjs` in the same change, or criterion 68 will cite an untracked
file (F1) and criterion 67 will cite a stale case count at the tip.

## Touched surfaces

- Written: `.ufo/waves/round-27/w1/ScribeQuality67.md` (this file) and scratch under
  `.ufo/waves/round-27/scratch/ScribeQuality67/` — `report-contract.snapshot.mjs` (sha256
  `b1e296bf…`), `s106-encoded.bin` (98,604 B), `s106-decoded.cc` (73,952 B), `base64.err`
  (empty), `fakeroot/` fixtures. Nothing else.
- Read (tracked, lane): `corpus/QUALITY.md`, `corpus/lessons/round-26.md`,
  `corpus/lessons/round-27.md`, `corpus/lessons/round-25-verifier-spotcheck.md`,
  `corpus/evidence/round-26/sources/{s106.json, content-features-154.0.8037.97.cc}`,
  `scripts/check-s106-evidence.mjs`, `scripts/report-contract.mjs` (untracked),
  `scripts/check-round-contract.mjs` (headers), `SHONEN.md`, `LOG.md`,
  `SCORECARD.md`, `SKILL.md:2514`.
- Read (fleet, read-only): `.ufo/prompts/tabi-round-27.md`,
  `.ufo/reports/round-25/tabi.md`, `.ufo/reports/round-26/tabi.md`,
  `.ufo/reports/round-27/{kama,kasegi,tsukuroi}.md`.
- Git: read-only only (`rev-parse`, `log --all`, `show`, `ls-files`, `cat-file`,
  `diff`, `grep`, `status`). No `add/commit/push/checkout/switch/reset/stash/rm`, no `jj`.
- Executed: `node` on the **snapshot copy** of `report-contract.mjs` (four arms, plus two
  real reports), `curl` (one documented GET, HTTP 200), `base64`, `sha256sum`, `cmp`,
  `grep`, `sed`. No lane gate, selftest, build, linter or formatter was run — the L1 runs
  the lane gates once after integration. No credential or session material touched; no
  subagent spawned; no peer messaged.
- Not run by this seat: the C1/C2/C3 claim counters (other wave-1 seats); writes to
  `/home/vgpnk/Projects/shokuknow` (none needed, none made).

## Artifact paths

- Report: `.ufo/waves/round-27/w1/ScribeQuality67.md`
- Landed text at HEAD: `corpus/QUALITY.md:360-367` (Q67), `:368-376` (Q68); working-tree
  rewrite present and uncommitted (`git diff -- corpus/QUALITY.md`)
- Evidence: `corpus/evidence/round-26/sources/{s106.json, content-features-154.0.8037.97.cc}`
- Instrument (Q67): `scripts/check-s106-evidence.mjs` (cases=5, registry `SKILL.md:2514`)
- Instrument (Q68): `scripts/report-contract.mjs` — **untracked at HEAD**, sha256
  `b1e296bfd46b6aa23c92cc99e53b5356bbc2ba485e75001b17e4afc52065ea5a`
- Snapshot + fixtures: `.ufo/waves/round-27/scratch/ScribeQuality67/`
- Fetch receipt: HTTP 200, 98,604 B, sha256 `f17347b2…`; decoded 73,952 B, sha256
  `9b93fe64…`, `cmp` identical to committed evidence

## Tooling

No tool was installed or upgraded; no channel was used.
