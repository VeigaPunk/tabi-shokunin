# R96Critic3 — controls and do-nothing attack (C1, `client-oopif-filechooser-linux`)

Axes: (A) do-nothing reachability, (B) timeout attribution, (C) freeze-before-data, (D) library binding.
Frontier verdict: hold on all four; no falsification.

## Q1 — Can a do-nothing / wrong instrument reach the after-state? No.

Built two forgeries from the frozen positive receipt (`controls/receipt-positive.json`,
nonce `tabi-r96-ctl-positive`) and scored them with the frozen counter (`--receipt`):

- `R96Critic3-forged-noclick.json`: PPX/PPW legs claim the cross-site timeout and empty child
  but `childClicks=[]` on all 6 cross-site legs — plus PPW `witnessEvents=[]` (no chooser can
  ever open without a click). The committed instrument kills it on **two independent checks**:
  `click` (leg PPX-1/2/3, PPW-1/2/3, `child clicks []`) and `witness` (PPW-1/2/3, events empty).
  rc=1, verdict `findings`. Evidence: `R96Critic3-out-noclick.json`.
- `R96Critic3-forged-nochooser.json`: clicks present and recorded, but PPW witness saw no
  chooser. Killed on `witness` alone (PPW-1/2/3). rc=1. Evidence: `R96Critic3-out-nochooser.json`.

Commands (absolute paths; absolute-path counter — first attempt used a stale `$K` env and
failed with `MODULE_NOT_FOUND` rc=1, which is a setup error, not a finding; rerun clean):

```
K=/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-client-oopif-chooser-round96.mjs
node "$K" --lane "$L" --expect-driver-sha256 4020e57e...ce63b91 --receipt forged-noclick.json --expect-nonce tabi-r96-ctl-positive --json   # rc 1
node "$K" ... --receipt forged-nochooser.json ...                                                                                              # rc 1
```

The frozen battery (`negatives-...mjs`, 63/63 killed in `controls/battery.json`) already contains
the click trio (`click-untrusted`/`click-double`/`click-none` → `click`) and the witness law
(`ppw-no-chooser-opened` → `witness`) — the attack above is therefore covered twice: by battery
and by construction. The compound do-nothing (no click AND no chooser) dies on the conjunction.
A *whole consistent* receipt passes `--receipt` by declared limit 6, which is why the claim's
counting command is `--live` (nonce in driver env, `driver-exit`, `ports-bound`).

## Q2 — Is the PPX timeout attributable to OOPIF routing, not a broken click or a slow load?

What rules it out (receipt-level, scored `live-receipt.json` / `scored/c1-live.json`, 165 checks):

- **Not a broken click:** every leg records exactly one trusted child click
  (`childClicks=[["s",true]]`, counter `click`), the client listed exactly the two expected
  frames (`frames`), and PPS/PWX/PWS resolve and fill the child with exactly
  `[["tabi-r96-answer.txt",22]]` through the same click path — a dead click fails those too.
- **Not a missing iframe / slow load:** cross-site legs show exactly one browser-level `iframe`
  target with `url` = child URL (counter `iframe-targets`, read after load, before click);
  the same-site legs show none (single renderer). PWX resolving on the *same* cross-site shape
  proves the child loaded and its chooser opened; the only leg-class difference is the client.
- **Chooser really opened in the OOPIF:** PPW's raw-CDP witness intercepted exactly one
  `Page.fileChooserOpened` (`mode=selectSingle`, `backendNodeId>0`, `frameId`=that iframe
  target) on every rep (counter `witness`), while Puppeteer's `waitForFileChooser` timed out
  with the exact message ``Waiting for `FileChooser` failed: 3000ms exceeded`` (`TimeoutError`).
  Same click → browser-level chooser event seen on the iframe session → Puppeteer wait never
  resolves. That conjunction *is* the attribution, and the S236 source bytes (staged
  `sources/Page.ts`, pinned by sha256) give the mechanism: listener + interception on the
  primary-target client only (decl. limit 5: mechanism is source account; counter checks behaviour).

What does **not** rule it out (honest gaps, all inside declared limits 2–4):

1. On **PPX** legs nothing enables interception on the iframe session, so the claim states only
   timeout + empty child — whether a chooser opened there is unmeasured by design (limit 4).
   The OOPIF-routing attribution rests on PPW (witness) + PWX (resolve on identical shape).
2. **No per-leg wall clock:** the receipt carries `timeoutMs:3000` and the exact timeout
   message, but no measured duration field. "3000 ms" is Puppeteer's own error string, not a
   stopwatch reading — a hung event loop could in principle emit the same text. The frozen
   wording ("times out at 3000 ms") matches the counter's check, so this is a [INFERENCE]-level
   caveat, not a falsification.
3. The witness tweaks the system (interception enabled on the iframe session on PPW only), so
   PPW and PPX are not the same system; the claim is carefully worded to claim chooser-opened
   only where the witness exists (limit 4). No sleight found, but the PPX leg alone cannot
   carry the attribution.

## Q3 — Was the freeze before the data? Yes.

| artifact | timestamp |
|---|---|
| `claims.json.frozenAt` | 2026-11-08T23:47:33-03:00 |
| freeze commit `ba611b22` (plan + claims + instruments + controls + probes + Page.ts, 32 files) | 2026-11-08 23:47:33 -0300 |
| `scored/started-at.txt` | 2026-11-08T23:47:41-03:00 (8 s after freeze) |
| scored commit `75fe36dc` (clean, 165 checks) | 2026-11-08 23:48:31 -0300 |
| `w1.ready` dispatch | 2026-11-08 23:49:53 |

`git -C <lane> log --format='%H %ci' -- <path>` (read-only) shows `controls/` and `probes/`
were introduced *in the same* commit `ba611b22`; `scored/started-at.txt` exists on disk but
`git show ba611b22:.../scored/started-at.txt` → fatal (not in freeze). The positive receipt's
`generatedAt` (02:46Z) and probe-a's (02:31Z) predate it. Frozen bytes verified: worktree
`check-client-…mjs` sha256 = `git show ba611b22:` bytes = claims.json pin
`778d429f…23f5d`; driver `4020e57e…3b91` matches. No counter edit after the freeze.

## Q4 — Does the wrong-library control prove library identity binding? Yes, in the receipt model.

`counter-wronglib-live.json` (puppeteer-core 25.15.0, `--live --reps 1`) gives rc=1 with
**exactly one** finding: `libs` (version `25.15.0`, integrity `sha512-DEk7S2…`, Page.js sha
`934299a9…` vs pinned `25.16.0`/`sha512-VA5Pf54N…`/`31a522df…`). The 5 legs otherwise scored
identically — 25.15.0 behaves the same — so the kill is purely the `libs` pin, as intended:
version + lockfile integrity + one chooser-bearing file sha per package, re-derived by the
driver from the `--deps` tree and eq-checked by the counter. Battery `lib-*` cases kill each
field independently. Per limit 2 only that file is pinned; the rest of the tree is trusted as
npm extracted it — a patched tree that keeps those three fields would pass `libs`; that is a
declared trust boundary, not a hole.

## Smallest safe correction

None required. Optional (not a falsification, not owed): add a measured per-leg duration field
in a future round if the "at 3000 ms" wording should rest on a stopwatch rather than the
client's own error string.

## Evidence

- Forged receipts + counter outputs: `.ufo/waves/round-96/w1/R96Critic3-forged-noclick.json`,
  `R96Critic3-out-noclick.json`, `R96Critic3-forged-nochooser.json`, `R96Critic3-out-nochooser.json`
  (both rc=1 `findings`; checks `click`+`witness` / `witness`).
- Quoted counter lines: counter L212 `click`, L226 `witness`, L215 `pp-timeout`, L183 `libs`.
- Frozen inputs: `claims.json` (pin `4020e57e…`), `controls/rc.txt` (all expected rcs),
  `controls/battery.json` (63/63), `scored/c1-live.json` (clean, 165).
- No tool installs (nothing needed beyond repo bytes + frozen counter); no chromium runs
  (receipt-mode only); scratch `/fast/scratch/hyaku/tabi-r96/R96Critic3` removed after copying.

VERDICT C1: neutral
