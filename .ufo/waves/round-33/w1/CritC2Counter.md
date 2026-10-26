# CritC2Counter — first falsifier of the frozen C2 battery (tabi round 33, w1)

**Verdict: defect.** The frozen battery (`.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs`, sha256 `51ace65f…`, byte-identical to `claims.json` `frozenDigests`) reproduces its own baseline (8/8 forgeries accepted, predicate false, exit 1), but its predicate is satisfiable by gates that do no forgery work at all. I built and scored five gates against the frozen bytes in my scratch clone. **High:** a 22-line stub that never opens a receipt, transcript, entry or registry — it refuses the battery's forged variants by the *commit subject the battery itself writes* (`battery F<n>`) and otherwise prints `{population:16, admitted:16, failing:0}` — meets the predicate exactly (battery exit 0, predicate true, honest H0/H1/H2 accepted, `--selftest` exit 0, `digestLiterals []`). The same is true of gate v1 plus eight lines refusing `/^battery F/`. The counter takes acceptance from the gate's exit code and `admitted`/`failing` from the gate's own stdout (`:207-229`), and never re-derives either; C2's kill rule therefore does not certify an operability move. **Medium (disclosed, now demonstrated as sufficient):** gate v1 plus a size/path whitelist of the honest bytes (entry length 21454; transcript sizes 51715/51755/51685/51733; the literal driver path) refuses all 8 constructions while admitting H0/H1/H2 at 16 — precisely the hole `claims.json` C2 `feasibilityDisclosed` says the digest clause misses (`claims.json:56`). **Medium:** F7 is not a forged measurement — it decorates a truthful row (entry `:67`, R1) and the actual defect it reproduces is gate v1's exact-match filter (gate `:508`) silently dropping the row; a gate that counts `yes (live)` and checks the row is scored as accepting a forgery, so the predicate cannot distinguish the silent-drop defect from its honest repair. **Medium:** H2, declared honest, is not honest at receipt level — it pairs RerunDriver transcript bytes with the round-32 receipt's `observed` session records of a *different* session pair, so a v2 that implements the session-provenance binding the C2 claim says S127+ rows ground fails H2 through no fault of its own. **Medium/low:** two exit-2 paths turn the counter into `could-not-evaluate` with zero bytes of output — a symlinked `TMPDIR` and *any* change to the round-32 entry's table header (e.g. the column addition a provenance rule would want). No lane data is harmed and no other axis is touched; the defect is that C2's predicate is an oracle over the gate's self-report, not over the gate's work.

## What I attacked

The frozen counter's predicate (`claims.json:45`): `predicate true` = H0/H1/H2 accepted with admitted 16 and failing 0, `forgeriesAccepted 0/8`, REV's gate `--selftest` exit 0, and no honest digest literal (12-hex prefix) in REV's gate (battery `:221-229`). I did not attack C2's honesty or the lane's prior receipts; I attacked the discriminating power of this counter.

Setup (one live clone, no lane writes): `git clone --shared …/tabi-shokunin "$S/clone"`, `git -C "$S/clone" checkout -q --detach e6b0a9074d434ccc307badd312ae7379d1193fea`; attack gates committed only in `$S/cheat` (a second clone of the lane at the same freeze), every git call `-C`-named with `<seat>` identity, toplevel verified. Baseline reproduction matched `baseline/c2-J1-do-nothing.json` cell for cell (H0/H1/H2 exit 0 16/16/0; F1–F8 exit 0; F7 population 15; selftest exit 0), so the harness is the frozen one.

## Counterexamples and evidence

### D1 — a stub that evaluates nothing meets the predicate (high)

`gate-d35bcdc5.mjs` (22 lines, copied to the output dir): resolves `--rev` with `git log -1 --format=%s`, exits 1 when the subject matches `/^battery F/`, exits 0 printing a fixed `{population:16, admitted:16, failing:0, rows:[], clean:true}` otherwise, exits 0 on `--selftest`. It never reads the receipt, a transcript, the entry, `corpus/SOURCES.md`, or the fixture.

```
cd "$S/clone" && TMPDIR="$S/tmp" node .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs \
  --repo "$S/cheat" --rev 735268c076a533c30b1daa9be4b0628e621222c8 --json
# exit 0; predicate true; forgeriesAccepted 0/8; honest H0/H1/H2 true; selftest exit 0; digestLiterals []
```

Per variant: H0/H1/H2 exit 0 with population 16 / admitted 16 / failing 0; F1–F8 exit 1. The counter's only honest-side evidence is `accepted && admitted === 16 && failing === 0` (`:217`) read from the gate's own JSON, and its only forgery-side evidence is `r.status === 0` (`:207`). Nothing requires `rows[]` to name the entry's ids, or `admitted` to be derived from anything the counter can see. This makes C2's kill rule ("predicate false at REV -> failed") satisfiable by an artifact that is not a gate; the same construction works for any claim whose counter trusts the subject's self-report.

### D2 — the battery hands the gate a discriminator in its own fixture metadata (high; class disclosed, this instance not)

Every forged variant is committed by the battery itself with subject `battery F<n>` (`:200`) and author `battery@scratch.local` (`:82`); the variants' paths also carry `/f1/`, `/f4/`, `/f5-driver.mjs`, and F8 carries the literal `S990` and F7 the literal `yes (live)`. Gate v1 plus eight lines (gate sha256 `8553ff8a…`, commit `aa3c633`) that refuse `/^battery F/` and otherwise run v1 unchanged also meets the predicate:

```
# exit 0; predicate true; F1..F8 exit 1 entryFinding=rejected-by-construction-metadata; H0/H1/H2 true
```

`claims.json:56` discloses that "a gate can refuse F1-F8 by construction-specific tells", but frames it as a smarter forgery surviving wave 2. The instance is stronger: the tells are the *counter's own variant metadata*, so the predicate cannot distinguish a gate that refuses them from a gate that refuses everything labelled F; the attacker never needs to shape a forgery.

### D3 — a size/path whitelist of the honest bytes is sufficient (medium; disclosed)

Gate v1 plus: entry length must be 21454; the receipt's driver must be the literal `scripts/bidi-loopback-round32.mjs`; run transcript paths must be distinct; run transcript digests must be distinct; the two transcript blobs' sizes must lie in `{51715, 51755, 51685, 51733}` (the two round-32 run transcripts and the two RerunDriver transcripts). No hex digest, no content comparison, no splice detection, no session provenance, no live leg (`gate-5f494ed7.mjs`, commit `b396e6d`).

```
# exit 0; predicate true; forgeriesAccepted 0/8; H0/H1/H2 accepted 16; selftest exit 0; digestLiterals []
```

Each refusal is a whitelist hit, not a forgery finding (`variant-detail.txt`): F1 "transcript size is not an honest size"; F2/F7/F8 "entry size is not the pinned honest size"; F3 "same transcript path twice"; F4 "transcript digests not distinct"; F5/F6 "driver path is not the honest driver". This is exactly `claims.json:56`'s disclosure ("A whitelist that encodes the honest bytes other than as a hex literal (e.g. sizes) is not caught by the digest clause; the reviewer reads v2's code"), so it does not falsify the claim as written — it falsifies the claim as *verified*: the counter is green for a gate whose only evidence rule is a table of decimal sizes, and the digest clause (`:65-71`, `:222`) covers five digests only. The honest bytes outside those five (the receipt's screenshot sha256 `ee0ede…`, `fixtureSha256` `343cbc…`, the receipt's own size, every size) remain unguarded.

### D4 — F7 is not a forgery; the predicate forbids the honest repair (medium)

F7 (`:189`) rewrites the first `yes` row's Measured cell to `yes (live)`. That row is R1 (entry `:67`) — a real measurement. The defect it reproduces is gate v1's `(cells[3]).toLowerCase() === "yes"` filter (`scripts/check-bidi-runtime.mjs:508`) dropping the row from the population (16→15, exit 0, `clean:true`; `MutC1Entry` mutant A). Counting the decorated cell and checking the row repairs the silent drop; the entry's own grammar already allows prose in Measured (R16: `no — no BiDi command`, entry `:82`). A gate that does exactly that (filter `/^yes(?![a-z])/i`, gate sha256 `8d5c1b61…`, commit `64cf2bb`) is scored as a surviving forgery:

```
# exit 1; predicate false; forgeriesAccepted 8/8
# F7: exit 0, population 16, admitted 16, failing 0  (the row is checked, not dropped)
```

So the frozen predicate conflates "row silently dropped" with "row included and verified", and forces an entry-grammar rejection policy that the claim never states. A v2 that chooses inclusion and checking cannot meet C2.

### D5 — H2 is not honest at receipt level (medium)

H2 (`:168-173`) copies the two real RerunDriver transcript blobs into the round-32 receipt but keeps the round-32 receipt's `runs[i].observed` arrays. The receipt therefore attests one session pair and carries another's bytes (`h-session-provenance.txt`):

| run | transcript sha256 | receipt `observed` session | transcript's own `newSession` |
|---|---|---|---|
| H2 run1 | `92bd413c…` | `ws://127.0.0.1:37279/session/10abbb…` | `ws://127.0.0.1:41417/session/8ff52a9d…` |
| H2 run2 | `b9dab912…` | `ws://127.0.0.1:41011/session/6b30c7…` | `ws://127.0.0.1:40495/session/7b5050…` |

H1 is consistent (`runA` 41011 and `runB` 37279 match its swapped transcripts), so the defect is H2's, not H1's. A gate that binds each receipt run's `observed` session to its transcript's `newSession` — the natural reading of the "session-provenance rule" that `claims.json:43` says the round's new S127+ registry rows ground — refuses H2 (gate sha256 `1896cb84…`, commit `92b619f`):

```
# exit 1; predicate false; H0 true, H1 true, H2 false (exit 1, t1-receipt); F4 killed too
```

The battery therefore penalises the provenance rule it advertises. The minimal fix is in the fixture, not the gate: H2 should carry RerunDriver's own `observed` arrays (`.ufo/waves/round-32/w2/RerunDriver/bidi-run/receipt.json`) or drop `observed` from H2's runs.

### D6 — two exit-2 paths (medium/low)

(a) Symlinked `TMPDIR`: the counter compares `git rev-parse --show-toplevel` with the *unresolved* `join(dir,'clone')` (`:140`). With `TMPDIR=$S/lnktmp` (a symlink to a real dir) the battery aborts:

```
# exit 2; C2_FORGERY_BATTERY verdict=could-not-evaluate detail=clone toplevel mismatch; stdout 0 bytes
```

`measure.sh:11` uses `TMPDIR="$S/tmp"` with `S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/…`, so this fires only if `HYAKU_SCRATCH` is behind a symlink — latent, not current.

(b) Entry table shape: `relabelYesRows` throws when the header row is not exactly `row|surface|bidi method|measured|evidence` (`:113-118`). A fixture commit that changes one header cell (`BiDi method` → `BiDi command`, commit `85a0200`) aborts the whole battery before any result is printed:

```
# exit 2; C2_FORGERY_BATTERY verdict=could-not-evaluate detail=entry table header not found; stdout 0 bytes
```

Any v2 work that edits the round-32 entry's table — the obvious place to record a provenance column or a third run — turns the counter into `could-not-evaluate`, and `claims.json`'s kill rule records that as "not verified", not as a finding. A counter should report an entry-shape regression (exit 1 with a named finding), not refuse to measure.

## Impacted axes

Operability (C2) only, and only in its *verification*: the predicate is reproducible and its `before` (8/8) is exact, but `predicate true` is reachable with no BiDi work (D1), so the kill rule cannot certify the axis move. No depth/coverage/freshness/adjacency contact; no lane file, index, or sibling repo was written; the frozen counters and `scripts/check-bidi-runtime.mjs` were never edited.

## Smallest safe correction

1. Stop trusting the gate's self-report. Require, at minimum, `rows` to be an array of 16 entries whose ids equal the entry's `yes` rows in order and all `admitted`, and re-derive `admitted`/`failing` in the counter from `rows` rather than reading the gate's totals. This kills D1 in one place; a gate can still lie about `rows`, so the durable fix is the next item.
2. Make the counter execute a *counter-owned* predicate pass: keep the golden transcript readers in the battery (it already imports `goldenLines` from the frozen gate) and re-evaluate at least one row per transcript itself, so a gate that prints `{admitted:16}` without evidence cannot pass.
3. Neutralise fixture metadata: amend every variant commit to a neutral subject/author (or use a fixed identity and subjects `variant H<n>`/`variant F<n>`), and forbid the gate from reading `git log` beyond `rev-parse` (testable: run a variant with an amended subject and assert the gate's verdict is unchanged). This closes D2 without weakening the honest cases.
4. Split F7 (D4): F7a "decorated cell must not shrink the population or exit clean with fewer than 16 rows" (must fail), F7b "decorated cell counted and checked" (must be allowed, admitted 16). State in the claim whether v2 rejects non-canonical cells or counts them.
5. Fix H2 (D5): build it from RerunDriver's own receipt/observed arrays; add a control that H2 passes both with and without an `observed`↔transcript binding.
6. Turn entry-shape drift and `TMPDIR` path mismatch into named findings (exit 1) rather than `Refusal` (exit 2), and `realpath` the clone path before the toplevel comparison (D6).

## Deliverables

Output dir `.ufo/waves/round-33/w1/CritC2Counter/`:

- `gate-d35bcdc5.mjs` — stub gate that evaluates nothing (D1), sha256 `d35bcdc5…`
- `gate-8553ff8a.mjs` — v1 + commit-subject tell (D2), sha256 `8553ff8a…`
- `gate-5f494ed7.mjs` — size/path whitelist (D3), sha256 `5f494ed7…`
- `gate-8d5c1b61.mjs` — inclusive measured-cell filter (D4), sha256 `8d5c1b61…`
- `gate-1896cb84.mjs` — observed↔transcript binding (D5), sha256 `1896cb84…`
- `attack-stub.json`, `attack-tell.json`, `attack-sizewhitelist.json`, `attack-sizewhitelist-keep.json`, `attack-inclusive-yes.json`, `attack-observed-binding.json` — full battery JSON per construction
- `base-battery-v1.json` — baseline reproduction (exit 1, 8/8)
- `variant-detail.txt` — per-variant gate output under the size gate (which whitelist fired)
- `h1-receipt.json`, `h2-receipt.json`, `h-session-provenance.txt` — D5 evidence
- `exit2-symlink-tmpdir.err`, `exit2-symlink-tmpdir.out`, `exit2-entry-header.err`, `entry-header-change.md`, `entry-header-change.table.txt` — D6 evidence
- `commands.txt` — every command with its exit code

Report: `.ufo/waves/round-33/w1/CritC2Counter.md`.

## Hygiene

Scratch `/fast/scratch/hyaku/tabi-r33/CritC2Counter` (clones, variant commits, kept battery tree) was removed after the receipts above were copied; `TMPDIR` was passed explicitly and stayed under it. No browser, chromedriver, or live leg was started, so `pgrep -fa 'chromedriver|chromium'` shows only the host monitor `/usr/bin/earlyoom … --prefer (^|/)(java|node|chromium|python3?)$` (pid 1371), nothing owned by this seat. No tools were installed or upgraded (node v24.21.0, git, jq present; pacman untouched). The lane checkout, lane index, lane jj state, fleet repo and sibling lanes were read-only.
