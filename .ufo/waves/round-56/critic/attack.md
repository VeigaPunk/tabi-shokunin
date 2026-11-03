# R56Critic attack list (round 56, wave w1) — read-only, pre-data

Scope: falsify the frozen C1 and C2 kill rules and do-nothing controls before any data is scored.
Probes: `critic/c1-fixture-probe.sh` (outputs `critic/probe-out/`), `critic/bg-scan.mjs` (output `critic/bg-scan.txt`).
C2 items are design-level attacks against the frozen text and the R56Counter spec (w1-spec.json); no counter or runner exists yet in the lane, so nothing C2 was executed. Each such item says so.
Live fleet is moving: frozen v15 re-run at faee4cb2 today gives 20 findings, not 19 (see C1-9).

## C1 — adjacency (v16 meter rebind)

1. **Attack:** edit the r56 audit or delta rows to a sibling's moved head/status/sha/line counts without re-deriving from snapshot bytes.
   **Verdict:** failed-to-break for status, sha, lines, bgHits and the moved-note line (the meter recomputes all of them from `git cat-file` at the per-run snapshot: v15 `observedStatus` lines 166-175, audit check 197-202, sha/lines/bgHits 228-236). The head comparison is the exception: see C1-2.

2. **Attack:** make a delta lane row carry any head (the moved one or a fabricated one) when the screened file cannot be read.
   **Verdict:** attack-succeeded. The head comparison sits inside the `else` branch of the lane check (v15 lines 227-252), so when `PROVINCE.md` is absent at head (text undefined) or HEAD is unresolvable (text null), `head` is never compared.
   **Evidence:** `probe-out/D.json` predicate true, findingCount 0, delta head `cccc…` vs real head `d2d3…`; control `probe-out/E.json` (same fake head, file present) predicate false, `lane-screen-head-mismatch`.
   **REQUIRED-BEFORE-FREEZE:** `node <v16> --selftest` must include a case "PROVINCE absent at head, delta head wrong" expecting `lane-screen-head-mismatch`, and it must pass; if the head check is moved out of the `else` branch, the claims.json clause "core byte-identical to v15" must be amended in the freeze commit.

3. **Attack:** the mapped-only lanes (lanes covered by ruled-map rows, not by delta rows) have their heads never bound, so a sibling head can move without any finding.
   **Verdict:** attack-succeeded (scope). Frozen round-open red vs today's re-run: `kagi-shokunin`, `kake-shokunin`, `kengaku-shokunin`, `tsukuroi-shokunin` heads all moved; no finding for kagi or kake (only the delta-covered tsukuroi produced one).
   **Evidence:** `probe-out/v15-rerun-now.json` vs `controls/c1-meter-v15-red-at-round-open.json` headSnapshot.
   **REQUIRED-BEFORE-FREEZE:** the claim text must say that mapped-only lane heads are recorded in `headSnapshot` as provenance and are not predicate-bound; check with `grep -c 'not predicate-bound' .ufo/waves/round-56/claims.json` ≥ 1 after the amendment.

4. **Attack:** a lane whose HEAD cannot be resolved (directory present, `.git` present but not a repository) is treated as `sibling-absent`, so an audit row claiming `sibling-absent` is green.
   **Verdict:** attack-succeeded. `headSnapshots` sets null on `rev-parse` failure (v15 lines 268-270); `makeSibRefGit` returns null for null heads; `observedStatus` maps null to `sibling-absent`. Predicate text says "lane dir does not exist".
   **Evidence:** `probe-out/A.json` predicate true, findingCount 0 (lane dir present, `.git` is a dangling gitfile); control `probe-out/B.json` (real repo carrying PROVINCE.md, same claim) predicate false, `audit-status-mismatch`.
   **REQUIRED-BEFORE-FREEZE:** v16 `--selftest` must gain a case "lane dir present, HEAD unresolvable" expecting a finding (or `could-not-evaluate`, exit 2), and `node <v16> --selftest` must still exit 0 with that case listed.

5. **Attack:** the `sibling_ref` commit SHA is decorative: the meter reads bytes at HEAD and never at the ref's SHA, and never checks that the SHA is a commit.
   **Verdict:** attack-succeeded. `parseRef` returns `rev` (v15 line 163) and `verify` never uses `parsed.rev`. Probe C changes the ref SHA from `1111…` to `2222…` with the same claim: predicate true both times (`probe-out/C.json`). The round-open red already carries a ref SHA (`kaidoku@9011581d…`) that differs from kaidoku's HEAD (`c7fe6898…`).
   **REQUIRED-BEFORE-FREEZE:** either claims.json states "sibling_ref SHA is provenance only, not read", or v16 runs `git -C <lane> cat-file -e <sha>^{commit}` for every ref and a selftest case with a nonexistent SHA expects a finding; check by running `node <v16> --selftest`.

6. **Attack:** browser-ground text outside the frozen keyword list is never screened, so the predicate is green while the browser-ground overlap is real.
   **Verdict:** attack-succeeded (scope). `BG_WORDS` (v15 line 133) lacks `chrome`, `chromium`, `browser`, `scrape`. `bg-scan.txt` finds 14 such lines across the roster at the round-open heads, e.g. `revenger-shokunin` PROVINCE.md:31 "Chrome/156.0.8078.74 at C:/Program Files/Google/Chrome/…", `kake-shokunin` PROVINCE.md:45 "The the-musketeer Chrome profile lease is contested scope", `kagi-shokunin` PROVINCE.md:103 "browser leases".
   **REQUIRED-BEFORE-FREEZE:** the report must carry the `bg-scan.mjs` TOTAL line measured at the data heads, and claims.json must name the keyword list as the screen's limit (the list itself is frozen; changing it is a new claim).

7. **Attack:** any browser-ground hit line can be marked `no-tabi-ground` and the meter accepts it.
   **Verdict:** attack-succeeded (by design, but the claim wording over-reads it). v15 line 242 validates only the vocabulary, not the judgement.
   **REQUIRED-BEFORE-FREEZE:** claims.json C1 must say "dispositions are vocabulary-checked, not judged"; check with `grep -c 'not judged' .ufo/waves/round-56/claims.json` ≥ 1.

8. **Attack:** the round-open red is a file-absent artifact, so it does not reach the predicate with a real sibling movement.
   **Verdict:** attack-succeeded (partial). No finding is a file-absent read: every byte read resolved against live git at snapshot. But only 5 of 19 findings are content or head moves: `lane-screen-sha-mismatch`, `lane-screen-lines-mismatch`, `lane-screen-head-mismatch` for kengaku, and `lane-screen-head-mismatch` for mori and tameshi. The other 14 are lane-presence changes: 6 audit-status (kaidoku ×4, revenger ×2: claimed `sibling-absent`, now present) and 5 roster-lane-uncovered (audio, game-dev-2d, game-dev-3d, lore, souji: not in the round-55 roster of 16). The 3 `delta-lane-not-on-roster` findings are for lanes whose directories are absent from the fleet root (`ls`: `shokunin-binary-forensics`, `shokunin-repo-hygiene`, `shokunin-reverse-engineering` do not exist). The round-55 delta rows for repo-hygiene and reverse-engineering carry sha and head byte-identical to live `souji-shokunin` (`c60046df…`, `f778b9d1…`) and `kaidoku-shokunin` (`50b6c259…`, `c7fe6898…`), so they look like alias rows [INFERENCE: lane aliases were relinked/removed; not verified].
   **REQUIRED-BEFORE-FREEZE:** the v16 delta ledger must not carry lane rows for absent lanes, and souji-shokunin and kaidoku-shokunin must be screened under their own names; check with `git -C tabi-shokunin show <data-rev>:corpus/adjacency-host-delta-r56.tsv | awk -F'\t' '$1=="lane"{print $2}' | sort | grep -cx -e shokunin-repo-hygiene -e shokunin-reverse-engineering -e shokunin-binary-forensics` printing 0 and the same command with `souji-shokunin` printing 1.

9. **Attack:** the claims.json "before" command (re-run of the frozen v15 at faee4cb2) is reproducible and expects 19 findings.
   **Verdict:** attack-succeeded. Re-run today: exit 1, 20 findings, predicate false; all 19 frozen findings still present plus `lane-screen-head-mismatch tsukuroi-shokunin`. `probe-out/v15-rerun-now.json`. The fleet moves while the round runs (kagi and kengaku committed at 15:03 today).
   **REQUIRED-BEFORE-FREEZE:** the claims.json "before" must reference the committed receipt by sha (`controls/c1-meter-v15-red-at-round-open.json`, record its sha256 in the freeze commit) instead of a re-run; check with `sha256sum .ufo/waves/round-56/controls/c1-meter-v15-red-at-round-open.json` equalling the recorded value.

## C2 — coverage (chromium-keyevent-control-keys-linux)

10. **Attack (r42 class):** the planned counter goes green on a relabelled or synthetic receipt.
    **Verdict:** attack-succeeded. Every planned defence is self-attested: the driver digest is a public file's sha; the nonce is the receipt's own field; server log, typed values, booleans and screenshot digests are written by the same driver process. Spec check `nonce-not-invocation-bound` is satisfied by the nonce appearing in the receipt itself. The claims.json do-nothing sentence ("a canned receipt is refused by the counter's pinned driver digest") is therefore false as written [INFERENCE: no counter exists to execute; from the spec text and r55 counter lines 186-197].
    **REQUIRED-BEFORE-FREEZE:** R56Counter must also carry the r55 checks: (i) page-side nonce echo on the form page (r55 `form-invocation-binding`, line 295); (ii) keylog entry-by-entry equality with the nonce-derived sequence (r55 `keylog-entry`, lines 466-483); (iii) `host.chromium` matches `/^Chrome\/155\./`, argv has `--headless` and `--remote-debugging-address=127.0.0.1` (r55 `journey-origin-not-loopback`, line 236); (iv) refusal when the receipt is byte-equal to any fixture or the nonce is found in the freeze tree; testable by `git grep -c "<nonce>" <freeze-rev> -- .ufo/waves/round-56/counters/` returning nothing for the live receipt, and `sha256sum` of the live receipt matching no fixture.

11. **Attack:** the Enter leg (implicit submission) is witnessed by the driver's own claim, not by the page.
    **Verdict:** attack-succeeded. Fooled witness: `enter.submitted` (driver boolean) plus `serverSawField` and the server log, both produced in-process by the driver. A runner that sends Enter keyDown without `text`, then calls `form.requestSubmit()` or `Page.navigate('/echo?field=<nonce>&field2=')`, gives a keylog Enter entry, one /echo entry, and `submitted: true`: green.
    **REQUIRED-BEFORE-FREEZE:** the receipt must carry a page-side `submit` event record with `isTrusted === true`, and the /echo request's `Referer` must equal the form URL; the counter must refuse without both. Testable: a fixture `enter-requestsubmit.json` (keylog Enter, submit `isTrusted: false`, no Referer) expects exit 1 with `control-enter-submit-wrong`.

12. **Attack:** two /echo requests (a double submit) pass.
    **Verdict:** attack-succeeded. The spec says "ONE /echo request" but the only finding is `server-log-missing (no /echo entry)`.
    **REQUIRED-BEFORE-FREEZE:** the counter must emit a finding when the /echo count is not exactly 1; testable: a fixture with two /echo entries exits 1 with exactly one finding id.

13. **Attack:** the End negative witness (value unchanged) is vacuous if End was never delivered.
    **Verdict:** attack-succeeded. The spec checks only `negativeWitness` and `valueAfter == valueBefore`, which hold trivially if no key was sent. The keylog check is length-only (`keylog-length-wrong`), and the length is derived from the receipt's own legs, so a driver that skips keys can keep it self-consistent.
    **REQUIRED-BEFORE-FREEZE:** the counter must compare keylog entries one by one with the nonce-derived sequence (End keyCode 35 at its index, `isTrusted === true` on every entry); testable: a fixture with the End entry removed expects a keylog finding.

14. **Attack:** the Tab witness is moved by `field2.focus()` through Runtime.evaluate, with no Tab keyDown.
    **Verdict:** attack-succeeded. `document.activeElement` moves field→field2 with no key delivered; spec keylog checks do not require a Tab entry.
    **REQUIRED-BEFORE-FREEZE:** the receipt must carry a page-side `focusin` record for field2 with `isTrusted === true` and the Tab keylog entry must be present; testable: a fixture with no Tab keylog entry and moved activeElement expects a finding.

15. **Attack:** the `nonce-not-invocation-bound` check fires only when the nonce is absent from both the server log and the typed values.
    **Verdict:** attack-succeeded on the spec text ("absent from the server log AND the typed values"). A receipt whose nonce is in the typed values but not in the server log passes.
    **REQUIRED-BEFORE-FREEZE:** the finding must fire when the nonce is absent from EITHER; testable: a fixture with the nonce absent from `serverLog` expects `nonce-not-invocation-bound`.

16. **Attack:** the receipt's Chromium identity is not checked (a Chromium 154, or a headed run, passes "Chromium 155 headless").
    **Verdict:** attack-succeeded (scope). The spec lists no check on `host.chromium` or the headless argv.
    **REQUIRED-BEFORE-FREEZE:** a fixture with `host.chromium` = `Chrome/154.0.0.0` expects exit 1 with a named finding (the id must be listed in the spec's exact set); testable via `--selftest`.

17. **Attack (do-nothing baseline):** the empty evidence tree is the only do-nothing control, and a no-op runner that copies the GREEN fixture and its PNGs passes both the counter and the after-count (`>= 7` files).
    **Verdict:** attack-succeeded. The empty tree is the right "before" state (faee4cb2 has 0 files under corpus/evidence/round56) but says nothing about a no-op path. A runner writing `predicate: false` is refused by the spec's `predicate-false`; a runner that copies the fixture passes. The after-command's exit code does not include the runner's exit code.
    **REQUIRED-BEFORE-FREEZE:** the after-count must be exact (`git ls-tree -r --name-only <DATA-REV> -- corpus/evidence/round56/chromium-control-keys | wc -l` equals 7), the runner's exit code must be recorded and 0, and the receipt sha must match no file under `counters/chromium-receipt-r56-fixtures/`.

18. **Attack:** the claims.json after-command does not run against the counter spec: it passes `--shot <six PNGs>` and a relative receipt path, the spec defines no `--shot` and requires `<abs receipt.json>`, and claims expects `couldNotEvaluate []` which the spec never emits.
    **Verdict:** attack-succeeded (command text, not predicate). The command as written cannot exit 0.
    **REQUIRED-BEFORE-FREEZE:** the after-command must run verbatim at the freeze commit against `green-synthetic.json` with exit 0 and no `--shot` flag; testable: `node .ufo/waves/round-56/counters/chromium-receipt-r56.mjs <abs path to green-synthetic.json> --driver <abs runner> --json; echo $?` prints 0.

## Verdict tally
- C1: 9 items. failed-to-break: 1. attack-succeeded: 8 (2, 3, 4, 5, 6, 7, 8, 9).
- C2: 9 items. attack-succeeded: 9 (10-18), all design-level; none executed.
