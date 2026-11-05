# Proposed S173 row (C3, round 68 w1, seat R68Exec3)

Status at seat time: a live S173 row already exists at `corpus/SOURCES.md:187` (appended
mid-wave by the L1/integration side, uncommitted like the rest of the pre-freeze round
state). `node scripts/check-sources.mjs` on the live registry currently reports 4
findings: E04 `duplicate_url` on S171, S172 and S173 (S171 repeats S157's URL, S172
repeats S167's, S173 repeats S168's) and E11 `used_by_missing` on S173 (its used-by cell
cites `corpus/lessons/round-68.md`, which does not exist yet). The gate also refuses to
evaluate registry copies outside the lane root (`could_not_evaluate
unsafe_registry_path`), so this proposal was shape-checked manually (11 cells, same as
live rows) rather than gate-run on a scratch copy.

The row below is an alternative repair variant for the L1's E04 decision, not a competing
claim: the URL is already held by S168 (same tag, same decoded bytes, sha256
5bbc6e23…c66e3d), and `check-sources.mjs:296` exempts a repeated URL only when the
teaches cell begins `supersedes S…`. This variant therefore marks S173 as superseding
S168 in the registry sense used by S054/S055/S065: one row per staged URL, re-scoped. It
does NOT refute S168's mouseWheel-delta facts; those stay valid and S168 remains in the
table as the superseded predecessor. Alternatives: keep the live row and resolve E04
another way (e.g. narrow S168's row or mark it superseded), or admit the knowledge entry
against S168 alone and drop S173 — L1's call, not made here.

| S173 | Chromium 155.0.8059.84 — CDP Input domain PDL, synthesizeScrollGesture declaration — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Input.pdl?format=TEXT | code | A | the Input.synthesizeScrollGesture declaration at build tag 155.0.8059.84 only: experimental command (decoded lines 286–287) with required x/y start coordinates, xDistance/yDistance distance signs (positive scrolls left / positive scrolls up, lines 293–296), xOverscroll/yOverscroll, preventFling default true (lines 303–304), speed default 800 px/s (lines 305–306), gestureSourceType default platform-preferred (lines 307–309), repeatCount default 0 and repeatDelayMs default 250 (lines 310–313); a protocol declaration only — not runtime delivery, not scroll-arithmetic guarantees, not any other build | tag 155.0.8059.84 (commit 5869fe313571d75152b77813cf0a4ee26a4e6df0; refs receipt .ufo/waves/round-68/w1/R68Scout/receipts/tag-155.0.8059.84.refs.json); decoded lines 286–315; located quotes: line 286 "Synthesizes a scroll gesture over a time period by issuing appropriate touch events." (13 words), line 303 "Prevent fling (default: true)." (4 words); decoded bytes staged .ufo/waves/round-68/sources/Input.pdl (14,431 B, sha256 5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d), byte-identical to the r64 staged copy .ufo/waves/round-64/w1/R64Scribe/sources/s170-chromium155-Input.pdl | supersedes S168 — same staged Input.pdl URL, re-scoped from mouseWheel delta units to also cover the synthesizeScrollGesture block; S168's delta-units facts remain valid inside the merged row | mined | 2026-11-05 | on-release | corpus/knowledge/chromium-scroll-gesture-protocol-round-68.md |
