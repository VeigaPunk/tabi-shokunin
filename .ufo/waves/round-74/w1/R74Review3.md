FINDINGS

# Round 74 C1 conformance review (Tabi R74, wave w1, seat R74Review3)

Read-only review. Measured lane HEAD **db59ed42bc974554d9f40fae4eefddf3357dce49** (2026-11-07T00:30:00-03:00), base **c72235d6aebca89269809050e983d53df36273f5**, digests commit D **ca30e1a3b7b23d56260196ef7af19929f544b80b**. Command receipts and re-run outputs are beside this file in `receipts/` (`ordering.txt`, `pins.txt`, `nonce.txt`, `before-after.txt`, `quality.txt`, `residual.txt`, plus the re-run JSONs). No production, lane-root, fleet or sibling file was written.

No LSP server/device answers this repo (`xd://lsp` is not mounted: "No such tool"), so every check below is git plumbing, direct file reads, and re-executed node instruments; text search is used only for literal string presence, never as semantic proof.

## Assigned items (1)-(5)

### (1) Ordering: HOLDS

`git log --format='%H %ci %s' c72235d6..master -- .ufo/waves/round-74 scripts corpus SCORECARD.md` (receipts/ordering.txt) returns exactly five commits, and `git rev-list --parents -n 1` shows a linear chain:

| commit | time | parent | role |
|---|---|---|---|
| b70e0a27 | 00:22:57 | c72235d6 (base) | pre-freeze instruments, sources S187-S193, controls, 9/9 repetitions |
| 8faa903a | 00:23:04 | b70e0a27 | claims.json (freeze) |
| ca30e1a3 | 00:23:10 | 8faa903a | freeze.txt (D) |
| 19c301da | 00:29:48 | ca30e1a3 | scored run + `corpus/evidence/round74/.../receipt.json` |
| db59ed42 | 00:30:00 | 19c301da | w1 spec/dispatch |

Supporting facts: `git merge-base --is-ancestor c72235d6 master` = exit 0. `git show --name-only b70e0a27 | grep -E 'scored/|corpus/evidence'` = exit 1 (no scored evidence in the pre-freeze commit). `git diff --stat b70e0a27..ca30e1a3` = only `claims.json` (+45) and `freeze.txt` (+8) — the instruments were not modified between the pre-freeze commit and D. `git log ca30e1a3..19c301da -- scripts .ufo/waves/round-74/controls .ufo/waves/round-74/claims.json .ufo/waves/round-74/freeze.txt` is empty — no instrument commit between D and the scored commit. The scored receipt path is first committed in 19c301da (`git log -1 -- <receipt>`).

### (2) Pins: HOLDS

`freeze.txt` names six files. sha256 at D (`git show ca30e1a3:<f> | sha256sum`) and at the working tree = HEAD (`sha256sum <f>`) both equal the recorded rows, all six:

```
afacee1b193ea2ba7ccab945956cee912eeed18cc5aa2fcacf5d65dc261dc2dc  scripts/chrome-cdp-imecompose-round74.mjs
5901d895ced1305f27935b93b409363c5822c7a730a6d2c7d00446ed7d33d251  scripts/check-imecompose-r74.mjs
8c0dd93a61177eb02691bee7f3a6d3762eb51cdf9d51599e7e23867ffe91fb26  scripts/negatives-imecompose-r74.mjs
dcc8308bea91639daf9cd412ec01d5b7acc72754eb48be68c03e4ca5c4967c69  .ufo/waves/round-74/controls/c1/kill-power-r74.mjs
423ae94f3fd4b946647e1cd79526bcc5c52e40d0ba0dbc5b6327b006b3c2f6d6  .ufo/waves/round-74/claims.json
c6527ccfcd95d718897c5ca96c8f98b7d1e2472ad6066de5221691ba93fa9c3c  .ufo/waves/round-74/run-scored.sh
```

Additional pin checks: the five instrument files present at pre-freeze b70e0a27 hash to the same recorded values (`pins.txt`); `claims.json` at its own commit 8faa903a hashes to its recorded 423ae94f…; `git diff --stat ca30e1a3..master -- <the six>` is empty (exit 0). `git status --porcelain` shows no modification to any pinned file (only a peer in-flight `corpus/README.md` edit and untracked w1/selftest paths). The scored receipt's own `driverSha256` = afacee1b… (freeze row) and its `fixture.sha256` = 63be9141…; the counter's fixture-hash check reads the driver beside the counter (`scripts/check-imecompose-r74.mjs:38`, detail at `:149`).

### (3) Nonce: HOLDS

- Scored receipt `nonce` and `nonceOnPage` are both `tabi-r74-l1-ca30e1a3b7b2`; `git rev-parse ca30e1a3 | cut -c1-12` = `ca30e1a3b7b2`; `scored/c1-a.args.txt` starts with the same nonce (then http 34129, cdp 46743, driver pin — all matching the receipt: `fixture.origin` port 34129, `host.devtoolsListening.url` port 46743).
- `git grep -n 'tabi-r74-l1-ca30e1a3b7b2' ca30e1a3 -- .` = exit 1 (absent from the D tree); `git log ca30e1a3 -S'tabi-r74-l1-ca30e1a3b7b2'` = empty (no commit in D's ancestry introduces it); `git grep -c 'ca30e1a3b7b2' ca30e1a3` = exit 1 (even the D hash prefix is absent).
- `git grep -c 'tabi-r74-l1' ca30e1a3` = `claims.json:2`, `controls-c1.mjs:1`, `run-scored.sh:1` — template/placeholder occurrences only (`claims.json:27` counting command, `claims.json:33` predicate, both `tabi-r74-l1-<first 12 hex of D>`; `controls-c1.mjs:27` `POST = 'tabi-r74-l1-control0000'`; `run-scored.sh:11` `NA="tabi-r74-l1-${D:0:12}"`). The derived nonce string itself is absent from the D tree.
- First appearance in any ref: 19c301da (00:29:48), plus two jj keep refs (see F4), both after D. The nonce is self-derived from D (`run-scored.sh:9,11`), so it could not have been known before D.

### (4) Before -> after: HOLDS

Base state, re-derived at c72235d6 (`git show`/`git grep`): SCORECARD capability row `grep -c '^| \`chromium-ime-composition-linux\` |'` = **0** (exit 1); `git grep -l imeSetComposition c72235d6 -- corpus/knowledge | wc -l` = **0**; `corpus/evidence/round74/chromium-ime-composition/receipt.json` absent from the base tree (`git cat-file -e` = 128); the r73 pinch receipt present (0).

Before commands re-run with the frozen counter (exit codes captured in `receipts/before-after.txt`):

- no receipt -> `exit 2`, verdict `unreadable`, id `receipt-unreadable`.
- base-extracted r73 pinch receipt (`git show c72235d6:corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json`) with the scored nonce/pin and the 12 PRE priors -> `exit 1`, 98 finding ids, and all five declared ids present (`schema`, `nonce-shape`, `nonce-expected`, `driver-pin`, `ime-call-count`).
- Counter flag requirements confirmed: no flags -> exit 2 `usage` ("--receipt required"); pin+nonce but no `--prior` -> exit 2; `--list-checks` = 148.

After command re-run at HEAD on the committed receipt with `--expect-driver-sha256 afacee1b…`, `--expect-nonce tabi-r74-l1-ca30e1a3b7b2` and the 12 PRE priors:

```
exit=0  verdict=clean  checkCount=148  findings=0  nonce=tabi-r74-l1-ca30e1a3b7b2  allChecks=true
re-run sha256 = 796df7f844fb12ed3aaf3fda0dea7e6e6424601e391d8560f63fcca309d286e7
committed scored/c1-counter-a.json = the same 796df7f8…  (identical)
```

Receipt has 16 legs (`start, focus-f, compose-a, compose-b, commit, plain, select-f, compose-c, replace-half, cancel, focus-ce, ce-compose, ce-commit, blur, nofocus-compose, nofocus-insert`), 11 `Input.imeSetComposition`/`Input.insertText` calls, host `Chromium 155.0.8059.84 Arch Linux`, predicate true / CONFIRMED.

### (5) QUALITY 130/131/133/137 conformance of the committed control and summary files: HOLDS

- **130 (rc captured on the next line, exit agrees with verdict):** capture sites are `run-prefreeze.sh:19-20` (`local rc=$?` immediately after the driver, written to `$n.driver.exit`) and `prefreeze-eval.sh:19,22,25,31` (`echo $? > *.exit` immediately after each node line). Matrix over smoke1..9: all nine rows AGREE (driver 0; counter 0/clean/148; battery 0 with passed==cases==239; killpower 0 with holds true); `receipts/quality.txt`.
- **131 (expected exit AND expected ids, evaluated mechanically):** every entry in `controls-summary.json` names `expectExit`+`expectIds` (+`exact`), and the evaluator recomputes `ok` (`controls-c1.mjs:77`) and `allOk`/exit (`:88,:91`). Recomputing each `ok` from the committed bytes gives **no mismatches** (9/9 results ok, `allOk=true`, `capabilityRowCount=0`, 12 priors, counter sha 5901d895…, driver sha afacee1b…).
- **133 (look-alike label owned and mismatch refused):** `degenerate-{dispatch-key,exec-command,script-events}.receipt.json` each carry `degenerate` = their control name, `imeComposeHypothesis=REFUTED`, `predicate=false`, driver exit 1; the check is `controls-c1.mjs:83` (`driver.exit=='1' && receipt.degenerate===name && …`).
- **137 (fail-closed repetition summary):** the committed `prefreeze-summary.json` reports 9 receipts, 9 ok, `checkCount=148`, `allOk=true`, `prefreeze-summary.exit` = 0, all nine row `ok` true. The enumerator fails closed (`prefreeze-summary.mjs:12` CHECKS from `--list-checks`; `:15-16` missing/unparsable -> null; `:26` row.ok false on any null/mismatch; `:35` exit 1 unless allOk). Demonstrated on copies (no production write): with only smoke1 outputs present -> `allOk=false 1/9`, exit 1; with smoke2's battery JSON truncated -> smoke2 RED with `battery.passed=null`, `allOk=false 1/9`, exit 1 (`receipts/prefreeze-missing.json`, `receipts/prefreeze-unparsable.json`).

Committed leg (c) artifacts (read, not re-executed): battery `cases=239` (231 refuse, 5 must-accept, 3 laundered), `passed=239`, `isolatedCases=140`, `idsWithIsolatedCase=79`, `checkIds=148`, `coverageGap=[]`, `failed=[]`, exit 0; kill power `unmutatedExit=0`, forceTrue 148/148, semantic 26/26 (including `M5-producer-verdict-and-to-or`), `mutants=174`, `killed=174`, `survivors=[]`, `holds=true`, exit 0.

## Findings

**F1 (MEDIUM, evidence not rule violation) — the (a) leg's prior set is not bound by any scored artifact.** The counter output is invariant to the prior set: `--prior` with smoke1 only, with all 12 PRE priors, and the committed `scored/c1-counter-a.json` are byte-identical (all sha256 `796df7f8…`, `receipts/residual.txt`); the counter JSON's fields are `schema, verdict, receipt, nonce, checkCount, checks, findings, derived` — no prior list/digest. `scored/c1-a.args.txt` records nonce, ports and driver pin only. So "with the 12 PRE priors" (predicate (a)) is attested solely by the pinned `run-scored.sh:15-16` (which constructs exactly smoke1..9 + the three degenerate receipts) and by the counter's own `>= 1 --prior` requirement (`check-imecompose-r74.mjs:106`); no receipt-side bytes distinguish a 12-prior run from a 1-prior run. This is the class QUALITY 138 governs, and it is carried: r73's scored counter JSON has the same field set, and r73 compensated only for its cross-generation set with `cross-generation-priors.txt`; r74 has no prior-list file at all. I record the attack, not an amendment request: the frozen predicate stays as written; the artifact simply cannot witness its own prior width. Routed defect for the next generation's instrument.

**F2 (MEDIUM, actionable at integration) — predicate (d) is not satisfied at the measured tip.** `grep -c '^| \`chromium-ime-composition-linux\` |' SCORECARD.md` = **0** (exit 1) at db59ed42; the six `^| \`chromium-` rows are the earlier capabilities, none is the IME one. The knowledge note half of (d) is present: `corpus/knowledge/chromium-ime-composition-runtime-round-74.md` committed at b70e0a27, absent at base (cat-file 128), first line cites S187-S193. Until the row lands, the claim's own kill rule ("any predicate leg (a)-(d) false at the lane tip") applies; this is integration work for the L1, measured here as absent.

**F3 (LOW) — the instruments' interpreter identity is not recorded.** The receipt records Chromium (`host.chromium`, `host.argv[0]=/usr/bin/chromium`) but no node/engine field (`host` keys: `chromium, cdpProduct, cdpProtocolVersion, argv, launchToken, devtoolsListening, childExit, stderrHead`). All runs in this review used node v24.21.0 from the fnm shim on PATH. The freeze pins bytes, not the runtime that evaluates them; reproducible only as long as the same interpreter class is used.

**F4 (INFO) — jj keep refs contain the nonce after D, not before.** `git log --all -S'<nonce>'` also lists `refs/jj/keep/e98c59f8…` (parent D, same scored content, 00:29:47) and `refs/jj/keep/41e542ae…` (parent 19c301da, w1-spec content, 00:30:00). Neither is an ancestor of D (`git merge-base --is-ancestor … ca30e1a3` = exit 1), and both timestamps are after D; they are jj working-copy snapshots of the same commits, not pre-freeze leakage.

## Residual risk and verification gaps

- The battery and kill power were **not re-executed** (outside item (4)); their committed outputs, exit files and JSON verdicts were cross-checked for agreement but the mutants themselves were not run. Unrun = not passed for those two instruments in this review.
- Leg (b) (R74Exec1's cold run) was not measured; not in this seat's scope and not yet present at the measured tip.
- No scored-run reproduction: I did not launch Chromium; the driver's observable behavior is taken from the committed receipt (16 legs, 11 IME calls, Chromium 155.0.8059.84) and the counter's 148 re-derived checks.
- The lane worktree is a detached HEAD at db59ed42 with a peer's unstaged `corpus/README.md` edit; HEAD bytes are what the pins and every check above refer to.
- `freeze.txt` pins six files; the control-side files that produced the pre-freeze control summaries (`controls-c1.mjs`, `prefreeze-summary.mjs`, `prefreeze-eval.sh`, `run-prefreeze.sh`) are unpinned. `git diff b70e0a27..HEAD -- <those four>` is empty, so nothing was modified after their pre-freeze commit; the digests simply do not cover them.
- Host state: nothing outside this seat's scratch (`/fast/scratch/hyaku/tabi-r74/R74Review3`, removed at exit) was written; no tool installation was needed.
