# R97Scribe — round 97, wave w1, claim C1 (client-oopif-uploadfile-linux)

Milestone: knowledge note draft. Leaf member; no subagents, no background jobs, no commits, no git/jj mutation,
no lane edits outside `.ufo/waves/round-97/w1/`. No chromium started by this seat (no port triple was assigned, so
no `--live` run was made). No tools installed or upgraded.

## Deliverables (all under `.ufo/waves/round-97/w1/`)

- `R97Scribe-note.md` — the round's knowledge note draft, shaped on `corpus/knowledge/client-oopif-filechooser-round-96.md`
  (front matter source/verified-at/recheck; law in one sentence; receipt table; practitioner rules; why (source
  account); changes from r96; limits; sources; pointers). Not written into `corpus/knowledge/`.
- `R97Scribe-r97-receipt-check.json` — receipt-mode counter output on the committed receipt (see §Commands).
- `R97Scribe-r96-receipt-check.json` — receipt-mode r96 counter output, used for the r96 re-check (see §Commands).

## What I checked

1. **Plan and claim read in full** (`plans/round-97.md` §Claim, predicate, §Controls, §Counting command, §Declared
   limits 1-7). Counter read in full (`scripts/check-client-oopif-uploadfile-round97.mjs` lines 1-60 usage, 176-244
   checks). Driver read at the points that matter (lines 133-275: fixture, per-leg profile, `Target.getTargets`
   timing, call forms, `isLocal`).
2. **Scored run and receipt re-derived.** `.ufo/waves/round-97/scored/c1-live.json`: verdict `clean`, rc file `0`,
   `checkCount` 232, `findings` [], `outcomes` trusted 9 / untrusted 6 / cleared 3 / phantom 3 / enoent 3.
   The committed receipt `corpus/evidence/round97/client-oopif-uploadfile/receipt.json` is byte-identical to
   `scored/live-receipt.json` (sha256 `6c9481318388a6d6e53c8d62893755874635861699ce05ac4ffd99530ce76763` for both,
   also the `receiptSha256` in `c1-live.json`). Per-leg fields were read from the receipt (24 legs; `failures` []).
   Re-derived counts: 24 legs = 3 reps × 8 arms; trusted legs PUX/PUS/PLL = 9; untrusted PLX/PLS = 6; PUC 3; PUM 3;
   PLM 3 (PLM error `Error`, `ENOENT: no such file or directory, stat '<driver scratch>/tabi-r97-missing.txt'`);
   iframe-target count 1 on each of the 18 cross-site legs, 0 on PUS/PLS. Matches the scored file.
3. **Sources re-opened on the staged bytes** (`.ufo/waves/round-97/sources/`):
   - `ElementHandle.ts`: line 138 `if (files.length === 0)`, zero-files branch dispatches script `input`/`change`
     events (lines 143-148); line 158 `DOM.setFileInputFiles` on `this.client`. Plan's ranges 138-150 / 158-162 hold.
   - `chromium.ts`: lines 162-163 `if (!options.isLocal) browser._isBrowserCollocatedWithServer = false;` ✔.
   - `fileUploadUtils.ts`: line 32 `fs.promises.stat` inside `filesExceedUploadLimit`; line 62
     `if (!…_isBrowserCollocatedWithServer)`; line 65 `if (await filesExceedUploadLimit(localPaths))` ✔.
4. **Round-97 counter re-run in receipt mode** on the committed receipt (no browser) and **r96 counter re-run in
   receipt mode** on the r96 receipt. Both as in §Commands. Neither touches Chromium.
5. **Note wording checked against the counter's enforcement** (plan's "counter's checks and nothing more" rule).
   Every number in the note comes from the scored file or the committed receipt. Mechanism sentences are labelled as
   the sources' account (declared limit 6).

## Commands run (exact; cwd `/fast/scratch/hyaku/tabi-r97/R97Scribe`; L=`/home/vgpnk/Projects/shokunin/tabi-shokunin`)

```
mkdir -p /fast/scratch/hyaku/tabi-r97/R97Scribe                                  # rc 0
TMPDIR=/fast/scratch/hyaku/tabi-r97/R97Scribe node $L/scripts/check-client-oopif-uploadfile-round97.mjs \
  --lane $L --expect-driver-sha256 09f0c2fe2895ee0e035e8107995873328ce74f4e4d6d1ab3c8efd455b8c9e4eb \
  --receipt $L/corpus/evidence/round97/client-oopif-uploadfile/receipt.json \
  --expect-nonce tabi-r97-live-152ce8256675 --json                               # rc 0
   -> verdict clean, mode receipt, checkCount 229, findings 0
node $L/scripts/check-client-oopif-chooser-round96.mjs --lane $L \
  --expect-driver-sha256 4020e57ef865e5eed506796238bb981bb4dbcb226e8fe80eb52728585ce63b91 \
  --receipt $L/corpus/evidence/round96/client-oopif-filechooser/receipt.json \
  --expect-nonce tabi-r96-live-c1225d318ea6 --json                               # rc 0
   -> verdict clean, checkCount 163, findings 0 (r96 note says 163; sha256 aad4611df158… matches)
sha256sum <r96 receipt> <r97 scored receipt> <r97 committed receipt> <scored/c1-live.json>   # rc 0
node -e '…JSON.parse both check outputs…'                                         # rc 0
pgrep -fl "tabi-r97"  -> lists chromium/MainThread processes of OTHER seats' scored/exec runs
  (paths under /fast/scratch/hyaku/tabi-r97/L1, R97Exec1, R97Critic1); this seat did not start or signal them.
rm -rf /fast/scratch/hyaku/tabi-r97/R97Scribe                                      # rc 0 (scratch removed)
```

Not run, by design: the `--live` counting command (no assigned port triple; a live run would start chromium), and
any control. The scored run's `--live` result is taken from the committed artifacts, not re-executed.

## Knowledge-note claims: what the counter enforces (checked item by item)

Enforced (counter checks, exact): per-leg outcome for PUX/PUS/PLL (resolved; `[[answer,22]]`; events exact T/T);
PLX/PLS (resolved; `[[answer,22]]`; events exact U/U); PUC (resolved; `[]`; four events exact); PUM (resolved;
`[["tabi-r97-missing.txt",0]]`; events T/T); PLM (error `Error`, ENOENT message exact with `missingPath`; `[]`;
no events); parent `#pp` `[]`; frames exactly `[parent, child]`; iframe targets exactly one with child URL on
cross legs and none on same-site; DevTools `Chrome/155.0.8059.84` and client version strings; 24 distinct browser
ids; exact leg list; `failures` []; answer `{name, size 22}`; `missingExists` false; ports distinct in 1024..65535.

Not enforced by the counter, and not written into the note as counted facts: the mechanism (S237/S238 code paths),
the `#s.files` contents beyond name+size, what a form does with the PUM phantom, `isLocal` for a remote browser,
`launch`, a profile being fresh (see finding F1), the timing of `Target.getTargets`, the call-form strings.

## Findings

**F1 — wording narrower than the frozen sentence (affects the claim's Predicate paragraph, not the scored numbers).**
Plan §Claim says each leg runs "in a fresh browser and profile that the client connects to over its DevTools
endpoint", and that `Target.getTargets` runs "(after load, before the call)". The counter's `fresh-browser` check
enforces 24 distinct browser ids (`/^[0-9a-f]{8}-…$/`, distinct); nothing in the receipt or the counter records a
profile, and nothing records the order of `getTargets` against the call. Those two clauses are driver-code
properties held only by the pin on `scripts/client-oopif-uploadfile-round97.mjs` (per-leg profile directory
created at driver line 223 `leg-<id>/profile`; `getTargets` at line 251 before the call at line 257). The plan's own
discipline sentence says the claim is "the conjunction of the counter's checks and nothing more", so these clauses
are stated wider than the counter. No leg-level statement is shown false by any artifact (the live run is not
re-executed here; the committed run's events, frames, targets and errors are all consistent with the sentences).
The knowledge note avoids both clauses ("24 distinct browser ids"; no "profile"; no getTargets timing).

**F2 — staged source comment vs behaviour (note, not a claim).** `ElementHandle.ts` line 118 says "Locate all files
and confirm that they exist", and the code after it (lines 119-137) only resolves paths to absolute. The only
`exist`/`stat`/`ENOENT` match in that staged file is the comment. The note cites this as the sources' reading, not as
a cause of PUM; the counter measures PUM's outcome only.

**F3 — no r96 statement contradicted.** See §r96 re-check below.

## r96 re-check (statements this round touches; `corpus/knowledge/client-oopif-filechooser-round-96.md`)

| r96 statement | status after C1 |
|---|---|
| Rule 1: Puppeteer `waitForFileChooser` times out on a cross-site iframe | Still true; not re-measured in r97 (no chooser leg). Not contradicted. |
| Rule 1 / wave list: `ElementHandle.uploadFile` fills an OOPIF input 3/3, "a seat observation, not a frozen, counted law" | Now counted: PUX 3/3 (cross, `connect`, one file). Superseded in status, not contradicted. |
| Rule 3: Playwright 1.65.0 handles the cross-site case through its public API (PWX) | Still true for the chooser path. r97 adds: the same API's default path fills cross-site inputs with untrusted events (PLX). A qualifier, not a contradiction. |
| Limits: `uploadFile` outside the counted claim | True for r96's claim; r97 counts `uploadFile` on `connect` with one file. Scoped, not contradicted. |
| "Why": Playwright `coreBundle.js` sha256 `4ef83305…` | Consistent: r97 pins the full value `4ef8330594818d8f…f963f7f1` on the same file. |
| Recheck line (exit 0, `verdict: clean`, 163 checks) | Reproduced: rc 0, clean, checkCount 163 (receipt mode). |

Also r96's "Wave observations" line that Playwright `chromium.launch` fills cross-site: launch is unmeasured in r97
(declared limit 2); unaffected.

## Verdict basis

- Numbers: every number in the note matches the scored file or the committed receipt (24 legs, 232 live checks,
  229 receipt-mode checks, 9/6/3/3/3 outcomes, 18 cross-site iframe-target legs, 22-byte answer, 0-byte phantom).
  No count re-derived differs → not falsifies-number.
- Wording: the frozen sentence states two driver-process clauses (F1) that the counter does not enforce → the
  committed instrument enforces a narrower property than the frozen sentence states → falsifies-wording. No
  leg-level statement is shown false by the committed artifacts, and no number changes.
- Live: not re-run by this seat; a `--live` setup refusal would not be a law finding (none observed; none run).

## Recommendations for L1 (integration owner)

1. Integrate `R97Scribe-note.md` into `corpus/knowledge/` as `client-oopif-uploadfile-round-97.md` (or the lane's
   chosen name), keeping the note's "Limits" and "Sources" sections; the note already avoids F1's clauses.
2. Decide F1: either narrow the frozen sentence in `plans/round-97.md` §Claim (drop "and profile", drop
   "(after load, before the call)" or state them as driver-pin facts) — the honest fix in this round's own
   wording — or accept the claim as written and log F1 as a wording limit. Do not change the counter after the
   freeze.
3. Append the r96 note's correction (per `plans/round-97.md` Record work D1) only if L1 wants the r96 note to point
   at r97 rule 1's new status; this seat did not edit the r96 note.

VERDICT C1: falsifies-wording
