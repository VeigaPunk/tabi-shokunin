# ScribeSources — tabi round 37 (attempt 1), wave w1

Seat: `ScribeSources` (scribe, leaf — no subagents dispatched). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Assignment: draft the S143 registry row and the round-37 `## Gate` entries (the L1 lands them), and prove the row parses.

## Behavior

1. Read the frozen contract (``.ufo/waves/round-37/claims.json``) and the routed defects
   (`corpus/lessons/round-36-verifier-spotcheck.md` §"Routed defects and notes for round 37"): routed
   defect **8** is the C2 hardening leg — `GIT_NO_REPLACE_OBJECTS` / `refs/replace` evidence for
   `git show` reads — and `claims.json` C2 `source` is `"S143 (git-replace manual, opened this round;
   grounds the replace-ref mechanism B1)"`. The assignment's S143 is therefore the row the frozen
   claim already names.
2. Read the census schema (`corpus/SOURCES.md` header, the S142 row) and the governing contract
   (`.ufo/waves/kaika/SOURCES-CONTRACT-v1.md`).
3. Verified the id: `grep -oE '^\\| S[0-9]{3} \\|'` … run as
   `grep -oE '^[|] S[0-9]{3} [|]' corpus/SOURCES.md | sort | tail -5` → `S138 S139 S140 S141 S142`;
   row count `grep -cE '^[|][[:space:]]*S[0-9]{3,}[[:space:]]*[|]' corpus/SOURCES.md` → **142**.
   Max id is S142, so **S143** is the next free registry id.
4. Opened the source myself (`curl -sSL https://git-scm.com/docs/git-replace` → HTTP 200, 38,351 B,
   sha256 `46750b9f957b96a0660e158438dec14105a955801b02f7c3a009cf47b88d9105`) and located the quotes in
   the fetched bytes, then read seat `ScoutSrc`'s independent opening
   (`.ufo/waves/round-37/w1/ScoutSrc/s143-evidence.md`: same URL, same 38,351 B, **same sha256**,
   accessed 2026-10-27T13:35:05Z). Two independent openings, byte-identical.
5. Drafted the row (`S143-row.md`) and the Gate entries (`Gate-draft.md`), then proved the row parses
   on a scratch copy of the registry with the corpus tree and the `used-by` target mirrored.
6. Read `ScoutAssim`'s published round-37 report so the Gate's REJECT row rests on this round's
   assimilation survey rather than on round 36's, and tried to message the lesson drafter. That
   attempt went to `agent://T53W1ScribeLesson`, which replied that it is the **round-53** lane's scribe
   and holds no round-37 draft — a misroute (see Conflicts 4). The corrections therefore live only in
   `Gate-draft.md` and this report, for the round-37 L1 to apply when landing the Gate.

## Gates (all executed by this seat)

| Gate | Command | Result |
|---|---|---|
| Census validate (required) | `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <copy>` | **exit 0**, `W04=20 ok=1`, zero E-codes, no output line names S143 |
| Lane source gate | `node scripts/check-sources.mjs --root <copy-lane> --file corpus/SOURCES.md` | **exit 0**, `SOURCES_GATE verdict=clean rows=143 tiers=A:127,B:7,C:9 status=queued:15,mined:119,rejected:9 findings=0` |
| Control (untouched registry, same mirror) | same two commands over a copy **without** S143 | **exit 0**, `rows=142 tiers=A:126,B:7,C:9 status=queued:15,mined:118,rejected:9 findings=0`, `W04=20 ok=1`; a diff of the finding columns is empty → the row adds no finding |
| Contract inline census | the five `awk` blocks in `SOURCES-CONTRACT-v1.md` §Census over the copy | `rows 143`; malformed `NF!=13` → **0**; duplicate ids → none; tier `A=127 B=7 C=9`; status `mined=119 queued=15 rejected=9`; enum/tier-inflation violations → none; every `mined` used-by path resolves on disk |
| Row shape | `awk -F'\|' '{print NF}' row.txt` | **13** (11 cells); 2,092 bytes; no literal or escaped pipe in any cell |
| Append-only | `diff -u SOURCES.baseline.md SOURCES.md` | **+1 line, −0 lines** — only the S143 row was added |
| Quote exactness | tag-strip + whitespace-normalise the fetched page, count exact occurrences | both quotes `exact_occurrences=1`; primary 16 words, secondary 21 words — the count is only reproducible on that normalisation, so the Gate cell now names the extraction method (a raw-byte tokenisation splits the `code` spans) |
| `used-by` accuracy | `grep -n 'S143\|GIT_NO_REPLACE_OBJECTS\|refs/replace' .ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs` | row cited at `:10`; env applied at `:121`; `refs/replace` enumeration `:124-125`; refusal `:528` — the cell points at a real citation |
| Mirror integrity | `sha256sum` scratch vs seat copy of the fetched page | both `46750b9f…d9105` |

No counter, no Firefox/geckodriver launch, no fixture repo was created; nothing outside the seat dir
and the scratch root was written.

## Touched surfaces (all inside the seat dir)

- `.ufo/waves/round-37/w1/ScribeSources/S143-row.md` — the row draft + pre-checks + measurements.
- `.ufo/waves/round-37/w1/ScribeSources/Gate-draft.md` — Gate table (admit row, supporting-fetch row, REJECT row), additional located quotes, cautions, change log, landing instructions.
- `.ufo/waves/round-37/w1/ScribeSources/evidence/SOURCES-with-S143.md` — the exact copy the validators passed.
- `.ufo/waves/round-37/w1/ScribeSources/evidence/registry-diff-S143.txt` — `+1 / −0` diff against the untouched registry.
- `.ufo/waves/round-37/w1/ScribeSources/evidence/{validate.out,check-sources.out,validate-baseline-real.out,check-sources-baseline-real.out}` — validator outputs, exit 0 each.
- `.ufo/waves/round-37/w1/ScribeSources/evidence/{contract-census.out,quote-check.out,row.txt,sha256.txt}` — inline census, quote measurements, the row line, hashes.
- `.ufo/waves/round-37/w1/ScribeSources/evidence/git-replace.html` — the raw fetched page (38,351 B) so the digest is re-derivable without a new fetch.
- `.ufo/waves/round-37/w1/ScribeSources/evidence/replay.sh` — re-runs both gates plus the quote measurement from the retained bytes alone (builds its own `mktemp -d` mirror; exit 0 on 2026-10-27: census `ok` exit 0, `verdict=clean rows=143 … findings=0`, `occurrences=1 words=16` / `words=21`). Run it instead of trusting the receipts' scratch paths, which no longer exist.
- This `report.md`.
- Nothing else: `corpus/SOURCES.md`, the counters, `claims.json`, other seats' dirs, sibling repos and fleet-root files are untouched.

## Draft summary (what the L1 lands)

- **S143** — `git-replace manual — https://git-scm.com/docs/git-replace`, kind `docs`, tier `A`, `mined`,
  opened `2026-10-27`, recheck `180d`, used-by `.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs`.
  `teaches`: replace refs rewrite what a Git command reads for an object without touching stored bytes,
  and `--no-replace-objects` / `GIT_NO_REPLACE_OBJECTS` restore the raw read, so a digest-bound receipt
  must hold both. The `scope` cell also disclaims the quarantine register's unrelated `S143` label.
- **Gate** — one admit row (URL, `2026-10-27T13:35:05Z`, 200, 38,351 B, sha256, ≤25-word located quote,
  line/section location), one supporting-fetch row explicitly **not registered** (gitrepository-layout,
  digest declared from `ScoutSrc`'s receipt and flagged unverified here), and one **REJECT** row stating
  that no other package or registry row is admitted this round because assimilation is `none`.
- Registry change log: `142 → 143` rows, tier `A 126→127`, status `mined 118→119`, no prior cell changed.

## Findings

1. **Access timestamp disagreement.** The lesson draft carries `2026-10-27T13:30Z`; `ScoutSrc`'s receipt
   records `2026-10-27T13:35:05Z` (server `date:` 13:34:54 GMT) and my independent fetch wrote at
   13:34:56Z. The Gate must carry the owning seat's recorded value, not `13:30Z`.
2. **Word count disagreement.** Measured **16** words for the primary quote; `ScoutSrc`'s receipt says 17;
   the L1 note quoted in the lesson draft says 13. All satisfy ≤25, but only 16 is reproducible from the
   bytes (`evidence/quote-check.out`). Recorded in `Gate-draft.md`; delivery to the round-37 lesson drafter failed (Conflicts 4).
3. **The quoted sentence cannot be located by a raw-byte grep.** The man-page HTML splits it across
   `code` spans (raw lines 1708-1709). Any later re-checker must normalise whitespace first or it will
   falsely report the row absent. Recorded as a Gate caution.
4. **Supporting fetch is not independently verified here.** The gitrepository-layout page (64,401 B,
   sha256 `2f736f8d…82b5`) was fetched only by `ScoutSrc`; this seat did not fetch it, so its digest is
   declared, not verified. It is refused as a row and marked as such in the Gate table.
5. **Freeze-commit disagreement (contract prose vs artifact).** See Conflicts below; no counter or claim
   byte was read for scoring by this seat, so it does not affect the row — reported, not resolved.

## Out of scope (not attempted, by assignment and write contract)

- Landing the row or Gate text into `corpus/SOURCES.md` / `corpus/lessons/round-37.md` (L1).
- Editing or re-running C1/C2 counters, `claims.json`, `measure.sh`, or any seat's evidence.
- Any Firefox/geckodriver control run (C2 control reproductions belong to the C2 seats).
- Re-fetching the quarantine slice or any package row (assimilation is `none`; refusals retained).
- Any commit, push, fetch, or mutating git/jj command; any pacman call (host guard).

## Tooling

None installed or upgraded — `curl`, `gawk`, `node` (system), `python3` (system) sufficed. No pacman
transaction attempted. Scratch root `/fast/scratch/hyaku/tabi-r37/w1/ScribeSources/` (incl. `tmp/`)
deleted at seat exit after the evidence was copied into the seat dir.

## Artifacts

- Row: `.ufo/waves/round-37/w1/ScribeSources/S143-row.md`
- Gate: `.ufo/waves/round-37/w1/ScribeSources/Gate-draft.md`
- Evidence dir: `.ufo/waves/round-37/w1/ScribeSources/evidence/` (see Touched surfaces)
- Upstream opening: `.ufo/waves/round-37/w1/ScoutSrc/s143-evidence.md`
- Replay: `bash .ufo/waves/round-37/w1/ScribeSources/evidence/replay.sh`
- Assimilation basis: `.ufo/waves/round-37/w1/ScoutAssim/report.md`

## Conflicts (verbatim, for the canonical judge)

1. **Report path.** Dispatch item: `Report: .ufo/waves/round-37/w1/ScribeSources/report.md`. Seat
   harness: `Report: write your scoped findings to .ufo/waves/round-37/w1/ScribeSources.md`. Write
   scope: "you may write ONLY under /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-37/w1/<YourSeatName>/".
   Resolution taken: written to `.ufo/waves/round-37/w1/ScribeSources/report.md` (inside the permitted
   seat dir); `ScribeSources.md` at the wave root was **not** written because the write-scope line
   forbids it. Every other seat published inside its own dir.
2. **Freeze commit.** Assignment: "Claims, counters, harness and control receipts are FROZEN at
   99437d29de036415a9f2d0524343617a3b19988a". `claims.json` itself: `"frozenAt":
   "ed8ccfc00ad3784bc424aa118e056f8edf4ee803"`, `"baseline": "ed8ccfc00ad3784bc424aa118e056f8edf4ee803"`.
   `ScribeLesson`'s draft cites `99437d29de036415a9f2d0524343617a3b19988a` as the freeze. Both hashes
   are reported here verbatim; this seat took no measurement that depends on either.
3. **Access timestamp / word count** — as Findings 1 and 2, each with both source values quoted.
4. **Coordination misroute.** The roster id `T53W1ScribeLesson` belongs to the **round-53** wave-1
   scribe (its own message: "I am T53W1ScribeLesson (round 53 wave 1) … I hold no S143 row draft, no
   Gate cells for S143, and no round-37 evidence tree"; its report is
   `.ufo/waves/round-53/w1/T53W1ScribeLesson.md`). The round-37 lesson draft lives at
   `.ufo/waves/round-37/w1/ScribeLesson/round-37-draft.md`, owned by a seat this session could not
   address by id. Consequence: its `2026-10-27T13:30Z` cell and its `PENDING` row/assimilation markers
   are unchanged by me; the L1 must apply `Gate-draft.md` when landing.
5. **Extraction-method convention (cross-round).** `T53W1ScribeLesson` reports the same defect class in
   round 53 (S275 quote described as 22 words vs 20 measured) and proposes that every Gate quote cell
   name its normalisation. `Gate-draft.md` now does: "16 words, measured on tag-stripped,
   whitespace-normalised text".

VERDICT ok — S143 row drafted (11 columns, NF=13, no pipes) and proven to parse: `sources-census.sh validate --file` exit 0 with zero E-codes and no S143 finding, lane `check-sources.mjs` `verdict=clean rows=143 findings=0` exit 0, untouched-registry control `rows=142 findings=0` (empty diff of finding columns), append `+1/−0`; Gate draft carries the admit row (2026-10-27T13:35:05Z, 200, 38,351 B, sha256 `46750b9f…d9105`, 16-word located quote at `git-replace.html:1708-1709` §DESCRIPTION), an unregistered supporting-fetch row flagged as declared-not-verified, and an explicit REJECT row (no other package/row admitted; assimilation none per `ScoutAssim`'s round-37 zero-hit survey); conflicts on report path, freeze commit, access timestamp and word count reported verbatim.
