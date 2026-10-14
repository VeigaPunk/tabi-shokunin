# AUD-B6 — round-6 audit: `external-class-fixture-v2.md` (429 interaction re-run · never-a-C6 boundary · cleanup)

Lane AUD-B6, 2026-10-14. Write scope: **this file only** — nothing else in
tabi-shokunin was written by this lane; the audited note was read-only
throughout (`git status` shows this lane's only tree entry would be this
report; the note stays the fixture seat's untracked file). Scratch:
`/tmp/w6-aud-b6-scratch/` (volatile). Task: audit
`corpus/knowledge/external-class-fixture-v2.md` — re-run ONE fixture
interaction; verify the never-a-C6-datum boundary held (no external
requests); cleanup; verdict table; do NOT edit.

**Audited revision (the note was in active revision during this audit —
recorded, not smoothed).** Read in full: `422ad0d8…` (mtime 17:47:30Z,
552 `wc -l` / 29,664 B). During the ~5-minute audit the note moved through
**≥8 distinct revisions**: `d20fae88` (17:50:59) → `83b3be4d` (17:51:09;
saved `note-rev/current.md`) → `079c53c7` → `e0383741` (17:51:35) →
`a4da4880` (saved `note-rev/rev-a4da4880.md`, 567 L / 30,887 B) →
`2e317f77` (17:52:13) → **closing stamp `4aa604f1…` (17:52:24, 569 L /
31,080 B; re-derived at write time)**. Key predicates were re-verified
against the closing revisions; anything after `4aa604f1` is **not**
covered (U2) and the record must re-derive every hash it cites
(note §9's own provisional-hash rule).

**Runner revision churn (observed, material to the pins).** `422ad0d8`
pinned `v2-journey.mjs` `d6ea04c8…` (20,679 B, 14:45 rev); from `83b3be4d`
onward the note pins `ccc3d837…` (21,062 B, 14:49 rev). The on-disk runner
was stable at `ccc3d837` from 14:49:06 through audit close. **Both pinned
revisions were re-run here** (r1/r2) so the audit is valid whichever pin
the record adopts.

## 1. Verdict table

| # | check | scope / method | result | verdict |
|---|---|---|---|---|
| 1a | discipline statement present | `grep` §8 (closing rev :510) | **"A loopback 429 is an instrument, never a C6 datum."** + three bullets: no real rate/ToS/robots policy measured or implied; C6 deciding evidence stays an absence (:517 cites `interaction-approval-table.md:62,:191-192` — both anchors re-read: C6 row says the deciding axis "is unmeasured here… record it when measured"; U1 says the evidence "is an absence") | **PASS** |
| 1b | pinned harness bytes (rev `422ad0d8`) | re-hash 4 scripts + 8 fixture files against §2/§3 pins | **12/12 MATCH**: `server.py 936f1584…`, `v2-journey.mjs d6ea04c8…` (sourced from `ver-b6/frozen2`, itself hash-checked), `v2-driver.sh ebdf950a…`, `compare-v2.mjs ddd839de…`; all 8 fixture shas equal (`index 098fc893…`, `style 3bbb453e…`, `robots bc0300df…`, `interstitial 918b1f6d…`, `probe 2450928f…`, `same-landed a62625fb…`, `landed cee3607e…`, `landed.css 4a8fff30…`). Closing rev still pins the same server/driver/compare/fixture values (re-checked on disk) | **PASS** |
| 1c | re-run r1 — runner `d6ea04c8`, fresh ports | `bash v2-driver.sh aud-probe-429 probe-429`; driver delta = exactly 4 lines (ROOT + 3 ports), `diff` saved | `TRIP [http-429] cell=fetch-/rate/429 matchedOn=status 429`; response **429 + `Retry-After: 7`** + `text/plain; charset=utf-8`; body 84 B sha `48321a1e…`; `issuedRequestsAtTrip 5`; `followup-interstitial` **not executed**; `journey.exit=0` | **PASS** |
| 1d | re-run r2 — runner `ccc3d837` (closing pin) | same driver, `aud-probe-429-r2` | identical trip; `trip.json` byte-equal after dropping `atUTC`/`atRelMs` to r1 **and** to the note-era run `/tmp/w6-tabi-b61/probe-429` (3-way `true`) | **PASS** |
| 1e | stop proof (note R6) | server-log grep, both runs | `grep -c '/gate/interstitial'` → **0**; the skipped cell's path never appears in the request log | **PASS** |
| 1f | no external requests (operational) | every request origin in `journey.json` (r1/r2) = `http://127.0.0.1:19671` only; `http-a.log` peers 6/6 and 6/6 = `127.0.0.1`; chromium egress-ish (`google|gcm|accounts`) line count **0/0**; note-era logs spot-checked (`probe-429`, `chain-run2` A+B) peers all `127.0.0.1` | **PASS** (log/URL-level — U1) |
| 1g | never-a-C6 semantics in the record | trip record shape | no rate datum asserted anywhere in `trip.json`; `Retry-After` recorded as a **shape only**; runner does not wait, re-request, or retry through; §8 restates the U1 absence | **PASS** |
| 1h | cleanup — per run + independent | per-run closure lines + my own re-check | both runs: `pass: no chromium process`, `pass: ports … not listening`, `curl` exit 7 (cdp + http-a); independent re-check after both: ports 19671/2/3 closed, 0 chromium for my scratch, curls exit 7 | **PASS** |
| 1i | audit did not edit | note sha re-derived at close; lane `git status` | note = `4aa604f1…` at write time (fixture seat's own file, untracked); no lane file written by AUD-B6 | **PASS** |

Aggregate: **the re-run interaction is a faithful, deterministic
reproduction of the note's `probe-429` row; the never-a-C6 boundary holds
at every surface this lane can observe; both runs closed clean.** The
residual risk is scope, not result: log/URL-level egress (U1), the note's
continuing revision (U2), and the two un-re-run "h" cells (U3).

## 2. Re-run detail (setup → result → closure)

- **Setup.** My own byte copies under `/tmp/w6-aud-b6-scratch/harness/`:
  `server.py`, `v2-driver.sh`, `compare-v2.mjs`, `site-a/`, `site-b/` from
  `/tmp/w6-tabi-b61/`; `v2-journey.mjs` from `ver-b6/frozen2` (r1,
  `d6ea04c8`) then from `b61` (r2, `ccc3d837`) — each re-hashed to its pin
  before use. Edited my driver copy only: `ROOT` + `PORT_A 19541→19671`,
  `PORT_B 19543→19673`, `CDP_PORT 19542→19672` (`driver.diff`, 4 changed
  lines; edited sha `10f46fa3…`). Ports verified free before each run.
- **Run r1** 17:50:34–36Z: listens `127.0.0.1:19671` (python) +
  `127.0.0.1:19672` (chromium) only; robots probe → no disallow match
  (`/rate/429` vs prefix `/private/instrument/`) → CONTINUE → trip on 429.
  Server log: 5 requests (`/index.html` 200, `/style.css` 200,
  `/favicon.ico` 404, `/robots.txt` 200, `/rate/429` 429) + one 404
  message line = the driver's "6 request lines". **Run r2**
  17:52:06–09Z: identical in every recorded field.
- **Determinism.** `trip.json` r1 ≡ r2 ≡ note-era after timestamp-drop —
  same-class evidence to the note's §5 "identical-cell rerun" claim,
  reproduced independently on fresh ports and two runner revisions.
  The 84-B body sha `48321a1e…` was also re-derived independently from the
  note's own authored bytes (`printf … | sha256sum`), matching §5.
- **Closure.** Both runs: chromium killed by PID from the process table
  (no self-match — `pgrep -f` on the profile path), ports closed, curls
  exit 7. My independent re-checks after each run (and again at close):
  `ss` → nothing on 19671/2/3; `ps` → 0 chromium for my scratch;
  `curl` → exit 7 both surfaces.

## 3. The boundary as verified (document + operational)

- **Document side.** §8 states the rule and its scope; the note's §1/§2/§5
  consistently call the four classes **instruments** and keep U1 (real
  rate/ToS surface) an absence; the §0 read shows no L0 answer, so no
  grant can exist (default-deny by construction). No claim in the note
  widens C6 or the approval table.
- **Operational side.** In both audit runs every HTTP request went to
  `127.0.0.1:19671`/`127.0.0.1:19672`; the server saw only `127.0.0.1`
  peers; chromium's log matched zero `google|gcm|accounts` lines under
  `--disable-background-networking`. The note-era runs I spot-checked
  (`probe-429`, `chain-run2` A+B) show the same peer census.
- **Scope caveat (kept, not absorbed).** This is URL/log-level evidence —
  the same limit the note itself records (its §9 U6): no packet-level or
  namespace-level witness was taken by this lane. "No external requests"
  is asserted at the surfaces both lanes measured, nothing stronger.

## 4. Spot-checks (three, exact)

1. **Pins re-derived before use** — 12/12 (4 scripts + 8 fixture files)
   matched the `422ad0d8` revision's §2/§3 values; the `d6ea04c8` runner
   came from `ver-b6/frozen2` (re-hashed in place); r2's runner
   (`ccc3d837`) matched the live `b61` file. Commands: `sha256sum …` over
   the copy tree; `diff` for the driver delta.
2. **Three-way trip equality + independent body hash** —
   `node` JSON compare of `trip.json` (timestamp fields dropped):
   r1 ≡ r2 ≡ note-era → `true`; the 429 body sha computed from the note's
   own authored text equals the recorded `48321a1e…`.
3. **Independent closure + boundary census** — after both runs: `ss` no
   listeners, `ps` no chrome for my profile, `curl` exit 7 (x2);
   `awk '{print $1}' http-a.log | sort | uniq -c` → `127.0.0.1` only in
   mine and in the note-era logs checked.

## 5. Observations for the owner (reported, not applied — this lane does not edit)

- **The note/runner were mid-revision throughout the audit** (≥8 note
  revisions in ~5 min; the runner pin moved `d6ea04c8`→`ccc3d837` at
  14:49). Anything the record cites from this note must carry its own
  re-derived sha at record time; my stamps (below) are audit-time only.
- **The `d6ea04c8` runner revision now survives only in `/tmp`**
  (`ver-b6/frozen2|3`, my harness copy) — the `422ad0d8`-era pin becomes
  unrecoverable unless the archive seat captures it with the current
  `ccc3d837` bytes (note §9 archive debt; `cdp-evidence-patterns.md:92`).
  The fixture bytes themselves survive in the note (§3), as designed.
- **Audit-ops incident (self-inflicted, recovered, no artifact impact).**
  This lane's `pkill -f 'w6-aud-b6-scratch/poll.sh'` matched its **own
  shell's command line** and killed the shell (exit −1) — the same class
  as AUD-TAB1 §4; the poll was rebuilt with a character-classed fixed
  part. The fleet now has two instances this wave; prefer PID-from-`ps`
  with a character-classed pattern.
- Minor, non-blocking: the driver's "server-a request lines: 6" counts
  the python 404 **message** line as well as request lines; the note's §5
  uses the correct counter (`issuedRequestsAtTrip 5`), so no correction is
  needed — noted so a future reader does not miscount the log.

## 6. Unknowns (do not convert to claims without a new probe)

- **U1.** Egress is log/URL-level only (see §3 caveat); no packet/ns
  witness was taken.
- **U2.** The note kept being revised after the closing stamp
  (`4aa604f1…` at 17:52:24Z, then **still moving at write time** — this
  report cannot certify later revisions); the record must re-derive.
- **U3.** The `probe-429h`/`probe-403h` (14:49) cells were not re-run
  (brief cap = one interaction; the base `probe-429` interaction was
  re-run twice, on both pinned runner revisions).
- **U4.** Same-cell determinism reproduced for the **trip record** only;
  the note's pixel/shape byte-determinism (chain-run2/3, 13/13) was not
  re-run by this lane.
- **U5.** r1's runner bytes were sourced second-hand (VER-B6's frozen
  copy) — hash-verified, but if that copy is not the original the r1
  provenance is one step removed; r2 used the live `b61` file.

## 7. Audited-state snapshot (sha256; audit-time, re-derive before citing)

```
4aa604f1788b0531f0cb779b81137679829c994d1853658c7a092a729b5b6b2f  corpus/knowledge/external-class-fixture-v2.md  (closing stamp, 569 L / 31,080 B, 17:52:24Z)
83b3be4dec3e734444bbb61ffa925fbdec21735b9e214bcdbc87573b74d216a5  /tmp/w6-aud-b6-scratch/note-rev/current.md      (note rev 17:51:09)
a4da48800a07f1fd4bb78e65c2ae128b02e3d6a152cdccff382ed108e61a786d  /tmp/w6-aud-b6-scratch/note-rev/rev-a4da4880.md  (note rev ~17:51:5x, 567 L)
936f1584bf81decca8cd5e588032c6748ccec70a10ec5ae29c88690efa56b83a  server.py (b61; == note pin)
d6ea04c822b1897e8cce6b36f6824df99546debd2173ab423c6651404019872d  v2-journey.mjs (r1 revision; ver-b6/frozen2 == note pin, 20,679 B)
ccc3d83703e61cfbcf3811cc35e412138d663fe3378c287de720788678f6de79  v2-journey.mjs (r2 revision; b61 live == closing note pin, 21,062 B)
ebdf950a5c6a9f1b6015809e587cf559ec7bb137e9d968f07db273aee6f3c4bd  v2-driver.sh (pinned; == note pin)
10f46fa3a7e1e59c59dc705162ab4c56f7871a88947b985c6ad6d324a46654b9  my edited driver copy (4-line port/ROOT delta)
ddd839de8264c459a0101d866bfbe82bf145e04bb0bcf3d9dbdec0b79c3875bc  compare-v2.mjs (== note pin)
098fc893… 3bbb453e… bc0300df… 918b1f6d… 2450928f… a62625fb… cee3607e… 4a8fff30…   (8 fixture pins; all == note §3)
85594f781dfe5a697d0d37c6da341e40b2b5048c9838a4e90a0e0a29714a7d89  harness/aud-probe-429/trip.json
669bc4e5e9a38978a8e500c599a797ec0d25701a491793a76b8f7540bba29d83  harness/aud-probe-429-r2/trip.json
44c3c0380cf8e3ed0ef551490cfe0b6e7dc20cfd0c44c0e70ecb99d4015e33ca  harness/aud-probe-429/journey.json
661a6718b8de3cf3d1397cbdfe3ff70be6174e9b87925e9f71d3419beb8ada43  harness/aud-probe-429-r2/journey.json
4524266ff8da17c5fa7afc5bafd146ec563b2dcfe0101cbc6567ea94dd4b0506  harness/aud-probe-429/closure.txt
ecbf51b7780130888f58af0bbb08e38c6cbd6d380296594d21ed22683d217ad3  harness/aud-probe-429-r2/closure.txt
```

Evidence tree: `/tmp/w6-aud-b6-scratch/` — `harness/` (pinned copies,
edited driver + `driver.diff`, `aud-probe-429/`, `aud-probe-429-r2/`),
`note-rev/`, `poll2.sh`+`poll2.log`. Audited window: 17:47:34–17:52:5xZ;
checks re-derived at write time where stated.

Verdict: **audit stands PASS** on the four briefed items — re-run faithful
(both pinned runner revisions), never-a-C6 boundary held at the measured
surfaces, requests loopback-only at log/URL level, cleanup proven per run
and independently. Residual risk = scope (U1–U5), recorded, not absorbed.