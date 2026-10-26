# AdjKagiKama — C1 build, kagi + kama candidates (round 34, w1)

**Verdict.** All seven assigned candidates are accounted for, each by a **screen row that
verifies mechanically**, and none is an unruled overlap: kagi's four lines
(`SKILL.md:450`, `:488`, `corpus/knowledge/cdp-bridge-1password.md:70`, `:77`) all restate the
one `musketeer-cdp-9222-profile-lease` boundary already mapped contested-open (adjacency row 6,
fleet `.ufo/l0-questions.md:62`), and kama's `listener-census.md:56` and
`consumer-registry.md:235` restate the one `cdp-live-target-census` boundary already mapped
contested-open (row 11, L0:65), while `consumer-registry.md:9` is a registry-scope sentence that
claims nothing on tabi's surface (`no-claim-declared`). **This seat drafts no map row, no
declaration bullet and no L0 line**: the 1Password bridge's "start/inspect via the browser lane"
is *not* a distinct boundary from the musketeer lease — the object it starts is the burner Chrome
on `--remote-debugging-port=9222` whose profile is `the-musketeer` (kagi `PROVINCE.md:43`), tabi's
side of that row already says tabi "never attaches to 9222 or the musketeer profile"
(L0:62), and no honest disposition was available to a new row (no `tabi` token on any of the seven
lines, so no `split-declared`; no fleet line outside `.ufo/` names kagi or kama with tabi, so no
`ruled`; both surfaces are already contested, so no new contest; no deferral runs away from tabi,
so no `refused-route`). Measured at the delivered commit: `check-adjacency` **clean (13 rows, 13
verified, findings [])**, counter `candidates 67, mapped 1, screened 7, unaccounted 59 (baseline
66), newMapped 0, screenFindings []`, and **none of this seat's seven keys is in
`unaccountedKeys`**. `predicate=false` at exit 1 is the correct single-seat reading: the wave's
`newMapped >= 3` must come from the set-A lines that name tabi (kake, kotoba, kumitate…), which
are other seats' candidates, and I did not manufacture a row to move the counter.

**Attack-me (wave 2).** (1) `cdp-bridge-1password.md:70` is the sharpest call: is "start/inspect
via the browser lane" the lease, or a distinct browser-start/inspection boundary? My ground:
same object (the 9222 burner on the-musketeer profile), tabi's recorded side already fixes the
driver question (fresh throwaway profile, `SKILL.md:556-557`; L0:62 "tabi holds no lease half").
(2) Row `consumer-registry.md:9`: `no-claim-declared` vs `not-browser-sense` — the substantive
claim is the same (kama takes no browser verdict); the best counter-material is
`consumer-registry.md:236`, the 10086 kimi-webbridge pin recorded "**DEAD** at probe time", which
is a measurement, not a disposition (tabi records the same state in
`corpus/knowledge/webbridge-plugin-anatomy.md`). (3) Rows `listener-census.md:56` and
`consumer-registry.md:235` share one surface: if the integrator splits the listener table row from
the consumer-config pin, row 11's surface name stops covering both.

## Evidence

Clone: `git clone --shared` of the lane, detached at the freeze
`59f1b47aae277e1670e4a824173da8cde7e388ee` (`rev-parse HEAD` printed it), then re-attached to
`master` for the commit; `git rev-parse --show-toplevel` printed the clone path before every
mutation. Delivered commit **`37c64dbb205cf200bdd6a6862dbe12f78c775678`** (parent `8c8fab3`).
Only change vs the freeze: `git diff --numstat 59f1b47…..HEAD` → `8  0  corpus/adjacency-screen-skill.tsv`
(header + 7 screen rows); `git status --porcelain` empty. No map row appended; no `SKILL.md` edit.

Frozen counter bytes first: `sha256sum` of the counter taken with
`git show 59f1b47…:.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs` →
`0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e`, equal to
`claims.json:frozenDigests`. Both gate runs echo `adjGateSha256
4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` (the pinned gate).

```
TMPDIR=$S/tmp node $S/clone/scripts/check-adjacency.mjs --at 37c64db… --repo $S/clone \
  --fleet /home/vgpnk/Projects/shokunin --json            # exit 0
  {"verdict":"clean","rows":13,"verified":13,"selfRulings":[2],...}   findings=[]
TMPDIR=$S/tmp node $S/c1.mjs --rev 37c64db… --repo $S/clone \
  --fleet /home/vgpnk/Projects/shokunin --json            # exit 1
  candidates=67 candidatesBySet={A:38,B:29} mapped=1 screened=7 unaccounted=59
  newMapped=0 newMappedRows=[] screenFindings=[] predicate=false
  unaccountedKeys ∩ {kagi@69b61db4…, kama@0163fea2…} = []
node $S/verify-screen.mjs <out>/screen.tsv $S/cands.tsv    # exit 0
  SCREEN_VERIFY rows_ok=7 rows_bad=0
```
Full transcripts, including the first commit's run and the row-6 reason correction, are in
`AdjKagiKama/commands.md`; raw JSON in `AdjKagiKama/check-adjacency.json` and
`AdjKagiKama/c1-sweep.json`; the 67-row candidate list the counter itself emitted is
`AdjKagiKama/candidates.tsv`.

Key file:line anchors I read (both sides):
- tabi: `PROVINCE.md:9` (CDP session discipline), `SKILL.md:556-557` (fresh throwaway profile per
  run, never a user profile), `SKILL.md:2861-2881` (ordered map-or-screen decision rule),
  `corpus/adjacency.tsv` rows 6 and 11, `corpus/adjacency-screen.tsv` (round-33 precedent:
  kagi `PROVINCE.md:20`/`:59`/`:81` were screened `same-surface` on the same lease).
- kagi: `PROVINCE.md:43` (9222 + the-musketeer "contested with kake"), `:59` (lease question
  "reported to the integrator, never adjudicated here"), `SKILL.md:450`, `:488`,
  `corpus/knowledge/cdp-bridge-1password.md:30-55` (manifest writer + reachability probe),
  `:77-82` (cross-domain note).
- kama: `corpus/knowledge/listener-census.md:56` (census row 8) and `:355` (the mapped line),
  `corpus/knowledge/consumer-registry.md:9`, `:11`, `:230-231`, `:235`, `:236`.
- fleet `.ufo/l0-questions.md:62` and `:65` (read-only; nothing written there).

## Per-candidate decision (full reasoning in `AdjKagiKama/decisions.md`)

| key (pin abbreviated) | decision | one-sentence ground |
|---|---|---|
| kagi `SKILL.md:450` | screen `same-surface` → `musketeer-cdp-9222-profile-lease` | kagi records the shared 9222 + musketeer profile and hands the conflict to the integrator — the same declaration as `PROVINCE.md:43`, already row 6. |
| kagi `SKILL.md:488` | screen `same-surface` → same | anti-pattern against "Absorbing cross-domain surfaces (CDP lease, musketeer profile)": the refusal half of row 6, no new claim. |
| kagi `cdp-bridge-1password.md:70` | screen `same-surface` → same | "start/inspect via the browser lane" is the driver half of the lease on the burner Chrome at 9222 (the-musketeer profile), and tabi's recorded side already answers it (L0:62; `SKILL.md:556`); the bridge only writes the NMH manifest and probes reachability. |
| kagi `cdp-bridge-1password.md:77` | screen `same-surface` → same | the cross-domain note says port 9222 + the-musketeer are shared, ownership unresolved, "filed to the integrator rather than claimed here" — row 6 verbatim. |
| kama `listener-census.md:56` | screen `same-surface` → `cdp-live-target-census` | census row 8 for the same `127.0.0.1:9222`, same `chrome` pid 3080080, same FOREIGN_SERVICE-for-models verdict as the `:355` prose row 11 maps. |
| kama `consumer-registry.md:9` | screen `no-claim-declared` | registry-scope sentence: non-model pins are filed separately and "deliberately not given a model verdict" (`:230-231`), so kama asserts nothing about CDP, targets or a browser daemon. |
| kama `consumer-registry.md:235` | screen `same-surface` → `cdp-live-target-census` | the consumer-config pin to `localhost:9222` is the same endpoint row 11 dispositions, scored `NOT_HTTP / FOREIGN_SERVICE "for model purposes"`; no target enumeration. |

## Deliverable paths (all under `tabi-shokunin/.ufo/waves/round-34/w1/`)

- `AdjKagiKama.md` — this report.
- `AdjKagiKama/screen.tsv` — 7 screen rows, 5 TAB columns, no header (the file that goes under
  the `corpus/adjacency-screen-skill.tsv` header); sha256
  `50ddab114ce910dad32edcdc2e04e4bcf2f0571ee41e06ae9ddd770d109bf463`.
- `AdjKagiKama/rows.tsv` — **0 bytes, zero map rows by design**.
- `AdjKagiKama/decl.md` — declaration bullets: **0**, with the four-clause reason no map row was
  available.
- `AdjKagiKama/l0.txt` — **0 bytes**; no L0 line drafted (each contested surface already has one:
  fleet L0:62, L0:65).
- `AdjKagiKama/decisions.md` — per-candidate table + the ordered-rule derivation + attack notes.
- `AdjKagiKama/commands.md` — every command with its exit code and the emitted line.
- `AdjKagiKama/check-adjacency.json`, `c1-sweep.json`, `candidates.tsv`, `verify-screen.out`,
  `verify-screen.mjs`, `clone-diff.numstat`, `sha256.txt`.

## Limits, and what this seat did not do

- **Single-seat predicate.** `c1-adjacency-sweep-v2` reads `predicate=false` (exit 1) here by
  construction: `newMapped 0` and `unaccounted 59` of 67. The 59 remaining candidates belong to
  the other w1 seats; the wave predicate is an integration reading, not this seat's.
- **Semantics not measured.** The counter cannot judge overlap quality (`claims.json`
  `feasibilityDisclosed`); the guard is wave 2 plus the closure spot-check. I therefore record the
  three attack points above rather than presenting the screens as self-evidently right.
- **No network, no browser, no tool install.** Nothing was fetched, launched or installed. TMPDIR
  stayed under `/fast/scratch/hyaku/tabi-r34/AdjKagiKama/tmp`; the scratch tree (clone included)
  is deleted after the receipts above were copied out.
- **No lane write.** The lane checkout, its index, its jj state, the fleet repo and every sibling
  repo were read-only; the only commit lives in the scratch clone and is named
  `AdjKagiKama <AdjKagiKama@scratch.local>`.
