# Round 44 — tabi (fresh-start round, Windows host)

Freeze `d3d314721c812df0e51a3e73100e10be28f71e27` (superseded pre-data, retained as history) →
freeze amendment `8c23879945882dc13c62cdc6d3f5917bfe8b60ac` (the operative freeze) → measured
evidence `844a5b3af07902f47751efcc61b02a90cd4d4c68`. Baseline
`5c3f4cca86e9d0c548d41e21524525c5095652d5`. Three declared claims (C1 calibration, C2 coverage
capability `chrome-cdp-loopback-windows`, C3 operability); all three verified under their frozen
predicates at the measured revision; no axis harmed; no scalar moved (no rubric authorizes one).

Fresh-start reading done first: the r41/r42/r43 rejected-closure reports and the r43 non-author
verifier spot-check (all read in full before the freeze). Ruled out, with reasons recorded in
`.ufo/waves/round-44/claims.json` `freshStartNote`: a fifth Firefox-loopback attempt (surface
absent on this host), a 64-seat attack wave (no dispatch surface here; L0 filed), an adjacency
move (stagnation nudge active — no capability rounds 39–43 — so C2 is the required frontier
move), and note-count claims (do-nothing reachable).

## Gate

| Source | Opened | Command | Located quote (≤25 words) |
|---|---|---|---|
| S152 — Chrome Headless mode docs, https://developer.chrome.com/docs/chromium/headless | 2026-10-31 | `curl -sL -o headless-docs.html https://developer.chrome.com/docs/chromium/headless` → 111,098 B, sha256 `be71bfe0ece5e3089c037e1eb372ad9146282300e9ef6aed239235c2b8715aad` (staged copy committed `.ufo/waves/round-44/sources/headless-docs.html`) | intro paragraph: "Chrome now has unified Headless and headful modes." (8 words; 1 hit in the raw bytes) |
| S153 — CDP browser_protocol.json, https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json | 2026-10-31 | `curl -sL -o browser_protocol.json https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` → 1,421,620 B, sha256 `f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2` (staged copy committed) | Page.captureScreenshot description: "Capture page screenshot." (3 words; format enum "Image compression format (defaults to png)") |

Admit/reject on the round's own outputs (L1 gate; the outside non-author spot-check remains the
closure's duty): ADMIT — S152/S153 (both raw-fetched, quoted, staged, and load-bearing for C2's
runner); ADMIT — the capability demonstration (live exit 0, counter clean, fresh-nonce
reproduction). REJECT — the first live C2 attempt (exit 1: `chromeTerminated false`; the
counter's own clause refused the run; kept at `measure/c2-live-run-stdout.json` — the round's
own instrument caught its producer's defect); REJECT — v5-blind falsification of the egress
clause as an authenticity wall (the zeroed-lying-run class stays honestly unbindable; declared
in the r44 residual model instead of being claimed closed).

## Measurements (counting commands, paste-able)

- C1: `node .ufo/waves/round-44/counters/check-routed-defects-round44.mjs --rev 844a5b3af07902f47751efcc61b02a90cd4d4c68 --repo <lane> --json` → exit 0, 0 findings (honest no-harm); on the four deterministic fixtures (builder pinned to source rev `5c3f4cca…`, fixture revs identical to the pre-data controls): honest `0bee79ee` exit 0/0 both checkers; drop3 `1648e0cf` r43 exit 0 (FALSE GREEN) vs v2 exit 1 with `r5-binding-set-missing`; fragment `eff28d05` r43 exit 0 (FALSE GREEN) vs v2 exit 1 with `r5-binding-quote-not-whole-line`; pathtype `7c558d5e` r43 crash (uncaught TypeError) vs v2 exit 1 with `r5-binding-path-type`; `--selftest` 8/8.
- C2: `git ls-tree -r --name-only 5c3f4cca… -- corpus/evidence/round44 | wc -l` → 0; `git ls-tree -r --name-only 844a5b3a… -- corpus/evidence/round44 | wc -l` → 2; live run exit 0 (Chrome/156.0.8078.74, ws `127.0.0.1:51901`, nonce `96316efa…`); counter exit 0 on the committed bytes; reproduction run exit 0 with fresh nonces (`7fd3c702…` / fixture `51667331…`), byte-identical screenshot.
- C3: v6 at `844a5b3a…`: honest exit 0 (signature verifies under the PINNED anchor `868c0d89…`); failedrun exit 1 (`anchor-pin-mismatch`, `measure-signature-invalid`, 46 × `egress-count-without-remotes`); selfauth fixture exit 1 (`anchor-pin-mismatch`, `measure-signature-invalid`); the SAME fixture under `--mutation anchor-self-select` exit 0 (the round-43 kill-class reach, deterministic and browser-free); `--selftest` 9/9.
- Registry: `grep -c '^| S[0-9]' corpus/SOURCES.md` 151 → 153. Knowledge: `ls corpus/knowledge/*.md | wc -l` 60 → 61.

## Mistakes

| Class | Evidence | Captured-by | Fix / status |
|---|---|---|---|
| teardown-detection race (instrument) | the first live C2 attempt recorded `chromeTerminated: false` and exited 1 although nothing survived: the `exit` listener was attached after `kill()`, so the already-fired event was lost (`measure/c2-live-run-stdout.json`; receipt kept out of the evidence tree) | the round's own counter (the `chrome-terminated` clause refused the run) | listener attached at spawn + `taskkill /T /F` tree fallback; runner digest re-pinned at all sites; disclosed as a pre-data freeze amendment (r40 precedent) with the old freeze retained at `d3d31472`; second run exit 0; no orphans (CimInstance sweep) |
| annotation drift in a prior lesson's Gate (mined from r43 per the §2b duty) | the r43 non-author verifier spot-check routed defect 4: S150's Gate quote annotated "7 words" (observed 5) and S151's "11 words" (observed 10) — both within the ≤25-word contract | the r43 closure spot-check (non-author) | recounted here (S152 8 words, S153 3 words, verified against raw bytes); the r43 lesson bytes are never rewritten — this row is the correction of record |
| attack-fixture construction fumble (instrument-validation) | the fragment fixture first refused to build: the builder's own guard rejected my hand-escaped quote (`'efusalLayers\": [\"v5'` carried literal backslashes; not a substring of the control bytes) | the fixture builder's substring guard (failing closed before any fixture landed) | quote taken from the actual file bytes (`refusalLayers": [`, 17 chars, inside line ` "refusalLayers": [`, not a whole line); guard kept as standard for every attack fixture |

## Census

Start (2026-10-31, round open): `bash <fleet>/scripts/sources-census.sh validate --root <fleet> tabi`
→ exit 0, `tabi ok`, 21 pre-existing W04 duplicate-URL warnings (same set r43 disclosed).
End (round close): same command → exit 0 (receipt at `.ufo/waves/round-44/measure/census-end.*`).
`node scripts/check-sources.mjs` red at the freeze (2× E11 used_by_missing for S152/S153 — the
note and lesson had not landed yet; disclosed at the freeze, r43 precedent) and clean at the
integration tip.

## Assimilation

`considerthese/` does not exist in the lane repo (checked 2026-10-31). Shokuknow register not
reachable from this host.
