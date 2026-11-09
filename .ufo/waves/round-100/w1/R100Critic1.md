# R100Critic1 — C1 wording-vs-instrument map (round 100, w1)

Axes: (1) claim↔counter alignment, (2) claim↔driver-pin honesty, (3) number re-derivation, (4) limits cover the gaps.
Method: line-by-line map of plans/round-100.md §Claim + limits 1-8 against
scripts/check-client-oopif-uploadsets-round100.mjs (counter) and
scripts/client-oopif-uploadsets-round100.mjs (pinned driver, sha256 97947b0b…306b90 = claims.json pin).
All shas/sizes recomputed from counter constants (counter L81-89) and from the committed receipt
(corpus/evidence/round100/client-oopif-uploadsets/receipt.json) — every value MATCHes (see §Numbers).
No live run: static map + re-derivation; scored run .ufo/waves/round-100/scored/c1-live.json is
verdict clean, checkCount 216, 18 legs, findings [] (read, not re-run).

## Map — Surface moved (L18-30)
- "r99 measured two files per call … (24 legs × 3 reps)" — not-enforced history fact; true of r99 receipt,
  cited by receipt path, not a universal over instruments (E1 answered; freeze text carries no
  "No lane instrument has ever…" sentence — grep of 468c2b94:plans/round-100.md hits only the A1 note L246).
- "seven limit-4 probes (3/3 each)" / lead list / "turns six of those leads into counted legs" — history of
  R99Exec3.md; the six legs are the subject of the predicate below. Enforced-by-counter: arm set L99.
- Source paragraphs (S240/S238/S216/S237 re-opens; S248-S250 new rows) — source-pin, not counter-enforced;
  no code-path claim is made by the predicate (limit 5).

## Map — Predicate preamble + driver-pin facts (L53-81)
- Host/Chromium 155.0.8059.84 — enforced: counter L238 `chromium` (substring) + L272 per-leg
  `Browser === 'Chrome/155.0.8059.84'` and client version (Puppeteer L272 BROWSER / Playwright L272 tag).
- sha-checked driver, nonce in env, receipt in fresh mkdtemp — enforced: counter L151-154 (pin checked
  BEFORE spawn, exit 1 `driver-pin` without running), L155 nonce, L167-168 mkdtemp receipt dir,
  L236 nonce equality. (Driver self-hashes at L376; counter cross-checks L237.)
- TMPDIR before load; own browser per leg; launch args; connectOverCDP ±isLocal; parent/child HTML with
  #pp/#s/#m/#d and [inputId,type,isTrusted] listeners; call shapes; file bytes/sizes; 400 ms settle; read
  sweep — driver-pin facts as declared (L58-59: "performed by the driver whose sha256 equals the pin;
  the counter enforces only their recorded consequences"). Consequences enforced: legs carry
  lib/mode/isLocal/input/target (L270), exact parent/child URLs (L271), frames list (L273),
  iframe target (L275), parent #pp [] (L276), file tuples (L282), events (L283), reads (L284),
  distinct UUID browser ids (L258, `fresh-browser`).

## Map — every-leg bullet (L83-88)
- All enforced: versions L272; arm fields L270; URLs L271; frames L273; one iframe target w/ child url
  L275 (+ non-empty targetId, r99 survivor closed); #pp [] L276; non-target inputs [] via files eq L282.

## Map — arm bullets (L89-107)
- DUP3: resolved + err null L278; exact 4-tuples in order (name,size,type,webkitRelativePath) L282 via
  DUP3F L101 — "lands in order" is exact-equality, stated in the bullet itself; events L283 (click
  excluded by exact eq, parenthetical L109-110); reads = counter-recomputed sha of sent bytes L284.
- EMPTY1: same + empty sha e3b0… L86/L105/L284. Re-derived: sha256('') = e3b0c442…b855 ✓.
- MIXED: outcome error name/message L280; files s/m/d [] L282; events [] L283; reads [] L284.
  "Nothing set / no event / no read" is exactly this triple — enforced. Limit 5 declares "refused before
  any file is set" is read from outcome, not a protocol trace. Covered.
- LAUNCH2PL/PU: resolved L278; exact AB tuples L100/L282; trusted events L283 EV(_,true); reads L284.
  "Trusted" = listener-seen isTrusted only (limit 3), enforced by the exact event tuples.
- DIR: resolved; exact DIRF tuples incl. probe-dir/one.txt + probe-dir/sub/two.txt L102/L282 — the two
  observed files only; "recursively" is bounded by limit 4 (deeper nesting unmeasured). events on #d L283;
  reads L284. Counter checks descriptor subfields name/size/webkitRelativePath/sha256 (L242), omitting
  driver-written `type` — plan lists exactly those subfields (L114-117), and leg tuples pin `type` anyway.
- Descriptors (dup1/2/3, empty, payload1, dirOne/Two, fileA/B): counter L241-242 exact eq against its
  own recomputed constants; driver descriptors L371-389. MATCH (receipt dump compared field-by-field).

## Map — receipt level (L110-122)
- All enforced: schema/nonce/driver-pin/chromium/reps L235-239; libs exact eq L240 (version, lock
  integrity, file sha, tree files+sha — LIBS L93-94, MATCH); files/payloads L241-242;
  missing absolute+basename+missingExists===false L244 (strict, survivor closed); tmpdir basename `t` L245;
  ports distinct ints 1024..65535 L247; leg list exact L251 (18 = 6 arms × reps 3, order rep-major);
  failures empty + no leg error L253; 18 distinct UUID browser ids L258; live-only driver-exit /
  ports-bound / missing-bound / tmpdir-bound L229-233.

## Map — Before→After / kill rule (L124-133)
- Before: no-work controls in controls/rc.txt (no-work-base rc=128; r99 receipt rc=1). After: scored
  c1-live.json clean/216 checks/0 findings. Kill rule is procedural; consistent with counter exit codes
  (0 clean / 1 findings / 2 setup, L116/L292-294).

## Map — Declared limits 1-8
1. One build/OS, cross-site only — declared scope; frames/URLs pin the relation (L268-273).
2. Two client versions, top-level dirs only; "launch vs connect" a driver-pin fact — declared.
3. isTrusted-as-seen; reads arrayBuffer+FileReader once; digest in page vs counter constants — enforced
   L283/L284 exactly as worded.
4. Three files; ≥4 / deeper nesting / non-dir-on-#d / dir-on-#m/#s / dup path basenames unmeasured — declared.
5. Mechanism is sources' account; behaviour only — declared; "refused before any file is set" = outcome.
6. Receipt-mode forgery + same-UID /proc — declared; counting command is --live.
7. tmpdirAtLoad is driver-recorded; strace control is the evidence — declared; counter checks value L245/L233.
8. Exit 3 / D3 mapping — **overclaims** (finding W2 below).

## Finding W2 — limit 8, first clause (L169-175) claims more than the counter enforces
Frozen sentence: "the counter still checks the receipt, skips the per-leg checks of the launch-failed legs
and reports `findings` (rc 1) when any other check fails (`driver-exit` and `failures` excepted), else
`setup` (rc 2); every leg launch-failed is `setup`."
Counter L253-256: receipt-level findings ARE computed (L235-258), but `if (partialLaunch &&
!lawLegs.length) refuse('chromium never came up … on every leg')` (L256) discards them — when every leg
is launch-failed the counter answers `setup` whatever the receipt checks say, contradicting "reports
findings when any other check fails". The laundering caveat (last sentence) is a correct driver-pin fact
(L254: label read from driver's own `error` prefix `chromium never came up`, driver L70/L293/L299).
Narrowest true restatement (same as Amendment A1 §2): "When at least one leg is not launch-failed, a
failure of any check other than driver-exit/failures gives findings (rc 1); when every leg is
launch-failed the counter gives setup (rc 2) whatever the receipt-level checks say."
Impact: none on this round — scored run had launchFailed [] and driver status 0 (c1-live.json), so the
false clause was never exercised; A1 below records the narrowing without altering the frozen text.

## Finding W1 (history, no action) — "No lane instrument has ever put two files into one input"
Not present in the frozen r100 Surface-moved paragraph (freeze grep hits only A1 L246); the r99-scoped
grep `git grep -c webkitdirectory scripts/*round99*` = 0/1/0/0 confirms E1's glob point, and the
whole-`scripts/` grep hits r77/r78 choose-file instruments. A1 §1 narrows it to the client-oopif r95-r99
drivers. Frozen r100 text already complies.

## Minor instrument drift (neutral, not claim-affecting)
- Counter header L53-68 duplicates the Usage block mid-comment and repeats the D3 paragraph with stale
  "r98 D3" (L59) vs "r99 D3" (L43); L53 begins mid-sentence. Comment-only; single code branch (L206/L254).
- Driver L78-79 BIN/BIN_NAME (256-byte) and counter L91 NF are unused constants. Dead weight only.

## Numbers re-derived — all MATCH
- 18 legs = 6 arms × 3 reps (receipt leg ids DUP3-1…DIR-3, 18 distinct browserIds; c1-live checkCount 216).
- Sizes 23/31/21/22/11/0/28/13/13 = byte lengths of counter L81-89 literals (python hashlib, run this seat).
- sha256: A 1072bde6…, B fcd3e36a…, dup1 bb6d8edc…, dup2 7fb4cba7…, dup3 1a1308a9…, empty e3b0c442…b855,
  P1 b11d7548…, dirOne d23bc5bb…, dirTwo c40815e6… — all equal receipt values and probe-a-log.txt reads.
- Error string `File paths cannot be mixed with buffers` + `Error` — receipt MIXED legs (3/3) + probe lines.
- Driver sha 97947b0b…306b90 = claims.json pin = scored c1-live.json driverSha256; counter sha
  5c3d56d8…90f = instrument-sha256.txt. Controls rc.txt: every control at its frozen rc.

## Evidence artifacts
Counter scripts/check-client-oopif-uploadsets-round100.mjs L43-47, L151-168, L206, L229-256, L270-284;
driver scripts/client-oopif-uploadsets-round100.mjs L70, L284-365, L376; scored
.ufo/waves/round-100/scored/c1-live.json; receipt corpus/evidence/round100/client-oopif-uploadsets/receipt.json;
controls .ufo/waves/round-100/controls/rc.txt + instrument-sha256.txt; probe
.ufo/waves/round-100/probes/probe-a-log.txt; Amendment A1 plans/round-100.md L241-258.
Commands run this seat: sha256sum of both instruments; python3 hashlib re-derivation of all sizes+shas;
receipt field-by-field comparison (9 descriptors + 18 legs + libs); freeze grep of plans/round-100.md
(468c2b94); scored c1-live.json read. No live/chromium run; no files outside this report written.

VERDICT C1: falsifies-wording
