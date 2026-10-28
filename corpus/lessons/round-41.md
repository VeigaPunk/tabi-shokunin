# Round 41 — environment-injection measurement integrity

## Gate

### C1 — coverage capability (not admitted)

Frozen claim: `.ufo/waves/round-41/claims.json`, baseline `fecbdf0a3aa79ce17bce3ef7338f69112f604f88`, freeze `8c32528dd3ab04b75739a077d60884c22a085129`. The live counting command was `node scripts/measure-c1-round41.mjs --out corpus/evidence/round41/playwright-egress/receipt.json --scratch /fast/scratch/hyaku/tabi-r41/L1-final-measure/run` at evidence revision `8c84417652f7602886dcc85f74bffdadd9c3a281`.

- **Observed result:** exit 0; driver exit 0; counter exit 0; predicate true; findings empty. `measure/c1-measure.json` records elapsed 58,218 ms, receipt SHA-256 `416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1` and witness SHA-256 `d3c9972e2724e8737027c8a511434d780eff661aa2b2d70e70e848e2240f39d3`.
- **Receipt summary:** run1 132 samples / 26,171 ms / 56 ss and 56 proc observations; run2 133 / 26,439 ms / 54 ss and 54 proc observations. Both had zero observed non-loopback counts, identical first-shot SHA-256 `252cafa6e9b2f656be8c1107fc5fa2714cc50124d50a902c2a09beb39709be12`, zero survivors, closed fixture ports, and Firefox 157.0. The environment gate found no forbidden names and a matching nonce.
- **Controls:** `.ufo/waves/round-41/controls/c1-battery.json` records all five injected environment cases refused with exit 2 and a clean probe exit 0. `.ufo/waves/round-41/controls/c1-mutants.json` records all synthetic cases passing. Old r39/r40 receipts are refused in the replay controls. Baseline C1 no-op tree count is 0 (`controls/c1-baseline-noop.out`, exit 0).
- **Admission:** pending, not admitted. The validated 64-seat v2 wave is queued with 0 seats spawned and no WAVE-DONE, so the required falsification/non-author review and post-wave no-harm gate did not occur. This live run is measured evidence, not closure of the declared residuals or an outside review.

### C2 — depth, environment-injection forgery-class entry (not admitted)

The knowledge entry `corpus/knowledge/environment-injection-measurement-integrity-round-41.md` cites S146/S147 and is indexed in `corpus/README.md`; the current checker exits 0. Baseline no-op exits 1 with `entry-absent`, `coverage-row-absent`, `registry-row:S146`, and `registry-row:S147` (`.ufo/waves/round-41/controls/c2-do-nothing.json`). No independent wave review returned; do not record admission or an axis score change.

Sources opened for the entry this round:

- S146, Node.js CLI docs, https://nodejs.org/docs/latest-v24.x/api/cli.html, opened 2026-10-28, §`NODE_OPTIONS=options...`: “A space-separated list of command-line options; interpreted before command-line options” (10 words).
- S147, proc_pid_environ(5), https://man7.org/linux/man-pages/man5/proc_pid_environ.5.html, opened 2026-10-28, DESCRIPTION: “This file contains the initial environment that was set when the currently executing program was started via execve(2)” (18 words).

## Assimilation and quarantine

Assimilation: none. The round-4 quarantine-first rule permits no package adoption; no `merge/tabi/` source row was appended. `considerthese/` is absent. The previous complete 38-row adjudication remains in `corpus/lessons/round-40.md` §Quarantine-first adjudication. This round rederived the 38-row slice (`.ufo/waves/round-41/assimilation/quarantine-slice`) but did **not** complete a fresh row-by-row re-adjudication; prior-round verdicts are not represented as current-round reviews. Adoption remains closed.

## Mistakes

| Class | Evidence | Captured-by | Fix / status |
|---|---|---|---|
| malformed quarantine identifier | The extracted 38-row slice ends in `S171``; the cited plural `/features/5117755740913664` URL returned HTTP 404. The prior round-40 lesson records the alternate singular `/feature/` URL as the accessible record. | No rule rejects trailing punctuation after the quarantine ID; the extraction expression accepts `S171` inside `S171``. | Keep the malformed row unverifiable, not fabricated; do not append it or edit the read-only shokuknow register. Full current-round adjudication remains unfinished. |
| queued falsification wave | `.ufo/waves/round-41/w1/swarm-registry.json` showed 0/64 spawned and no reports at the final check; Main reported the handoff queued at the fleet seat ceiling. | The user-directed ready-file handoff is the dispatch boundary; no direct task call was authorized. | Leave the claims unadmitted and report the missing WAVE-DONE honestly; do not synthesize results or replace seats. |

## Census

- Start: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`; `.ufo/waves/round-41/measure/census-start.json` records 2026-10-28T10:58:50Z, exit 0. Full start stdout/stderr are in `census-start-stdout.txt` / `census-start-stderr.txt`.
- End: same command; exit 0, `tabi ok`, 20 W04 duplicate-URL warnings. Captured stdout/stderr/exit are `.ufo/waves/round-41/measure/census-end.out`, `.err`, and `.exit`; receipt `.json` points to those files.
- SOURCES rows: 145 at baseline to 147 current; S146 and S147 are the only additions, both tier A/mined; no existing row touched. The count was measured by `awk` over baseline `git show` and the current registry. Census passes with the existing warnings.
