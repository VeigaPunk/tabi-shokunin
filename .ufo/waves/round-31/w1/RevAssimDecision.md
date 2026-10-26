# RevAssimDecision — round-31 assimilation review: new lane rows S121/S122 vs the staged S126 refusal

**Seat:** RevAssimDecision (round 31, wave 1; leaf — no dispatch, no installs, no pacman call)
**Scope:** claims.json §assimilation ("none"; GitHub pages opened independently as lane rows while staged S126 stays refused) — is opening `https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api` as a new lane row circumvention of the S126 refusal, and what must the round-31 lesson Gate say for closure to accept it.
**Method:** read-only. All claims below were re-verified against primary bytes (commands + exit codes in the appendix). No LSP server answers `.md`/`.json`; text `read`/`grep` used as the recorded fallback. No network fetch was made by this seat (freeze is before data; receipts do not exist yet). Read-only access to `/home/vgpnk/Projects/shokuknow/…` (staging + campaign register); nothing written there. Scratch `/fast/scratch/hyaku/tabi-r31/RevAssimDecision/` created, unused; no clone needed (no lane scripts run — this seat runs no counter).

## Verdict

**Legitimate independent sourcing — holds, conditional on Gate disclosure.** The round-31 decision to open the GitHub rate-limits page as lane row S121 is not a circumvention of the staged S126 refusal, for five independently verified reasons. (1) The refusal is a verdict on a *staged row's* unverifiable provenance, not an embargo on the document: QuarantineB fetched the page cleanly (HTTP 200, 337116 B, title `Rate limits for the REST API - GitHub Docs`) and refused it *because the register's recorded quotes were absent* — and those quotes are provably not S126's: `absent-defect-register.md:188` records S126 with S127's native-messaging anchors while S126's own anchors (`Rate limits for the REST API` / `About secondary rate limits`) sit one row up at `:187` under S125 — a one-row register drift, exactly the F2 finding of round 27. (2) The lane does not exploit that artifact: the register is unchanged since round 27 (sha256 `5afe1810…d833` verified today), no lane file after round 27 mentions S126, and claims.json keeps the refusal standing pending a campaign-side ruling or register fix — the lane routes around a refusal it cannot and does not vacate. (3) The new row re-establishes from zero precisely what the package failed to establish: C1's predicate requires quotes located in *this round's committed fetch bytes and in the live page* (`--live`), rows *opened this round* (control J2 `r4-new-row`), source-owned numeric thresholds (control J4), and the frozen control J5 proves the packaged path fails (`host-rate-limit-signal-surface.md` copied as-is → population 0). (4) Lane precedent is on all fours: round 27 admitted S107 by re-grounding S124 — a row `absent-refused` by the round-22 quarantine — on the same document, with its own fetch and located quotes, under the recorded doctrine "staged id → lane id assignment by document … never arithmetic". (5) No collision: the lane registry (118 rows, last S118) holds **zero** `docs.github.com` URLs, the round-31 collision set is S102–S118 only, and lane S121/S122 (GitHub docs) are unrelated documents to staged S121/S122 (Chromium `runtime_enabled_features.json5`). The refusal protected provenance hygiene, and that purpose is honored, not evaded — the content overlap is expected convergence on the same public page, not laundering, *provided* the Gate carries the disclosure set in F-R1..F-R6 below.

## Findings (closure conditions; no defect found in the decision as recorded)

Severity scale: **R-must** = closure must reject the round if the lesson Gate lacks it; **R-should** = required for a complete record.

- **F-R1 (R-must) — URL identity + refusal continuation.** The Gate must state that lane S121's URL is identical to staged S126's URL (refused round 27, quarantine `absent/refuse`), that the row was opened by document with own fetch/bytes/quotes, and that **staged S126 stays refused** — not cleared, not superseded, not adopted; §assimilation decision `none`.
- **F-R2 (R-must) — register id-drift recorded as routed, not self-cleared.** The Gate must record the drift finding (register `:187`/`:188` one-row offset; QuarantineB's S126 verdict was computed against S127's native-messaging phrases; register sha256 `5afe1810…d833` unchanged) as routed to the campaign/L0. The lane's act must not read as vacating the refusal; the ruling/register fix remains campaign-side.
- **F-R3 (R-must) — receipts per new row.** S119–S122 each need URL, UTC time, HTTP status, byte count, sha256, with bytes committed under `corpus/evidence/round-31/decision-table/<id>.<ext>` and quote locators into both the committed bytes and the live page. Without these the "own fetch" claim is unverifiable and F-R1's independence assertion is empty.
- **F-R4 (R-must) — id doctrine.** The Gate must carry the by-document assignment sentence (registry continues at S118; never arithmetic), noting staged S121/S122 are Chromium json5 rows — different documents — and that collisions remain S102–S118 only.
- **F-R5 (R-should) — class distinction.** The Gate should distinguish S187/S199 (campaign-local work files under `shokuknow/lanes/` — not re-openable *public sources*, a different refusal basis) from the public `docs.github.com` pages; note S203 is a *different* document (`troubleshooting-the-rest-api`, not opened this round); and confirm the round-27 L0 question (S114/S140 present→adopt) stays open and untouched — no staged row is adopted this round.
- **F-R6 (R-should) — negative declarations.** No package bytes/rows/entry text used (control J5 demonstrates the packaged path fails); no write to `shokuknow/` or the register; no `api.github.com`/credential use; staged entry target `host-rate-limit-signal-surface.md` does not exist in this lane (lane entries are `host-published-rate-limit-headers.md`, `rate-limit-policy-fields.md`), so there is also no entry-name collision with the staged used-by.

**What would flip the verdict to circumvention (negative tests for closure):** the Gate or row (a) claiming S126 cleared/superseded/adopted by lane action; (b) reusing staged S126's gate quotes, anchor cells or teaches text without the lane's own committed fetch (the campaign gate's sentences — `"No more than 900 points per minute are allowed for REST API endpoints"`, `"x-ratelimit-limit The maximum number of requests that you can make per hour"` — are the *page's* sentences, so overlap is expected and lawful only when re-derived from the lane's own bytes); (c) appending the staged row or the staged entry under any id; (d) relying on quotes-by-register-id in either direction; (e) any write to `shokuknow/` (register fix is not lane-reachable).

## Observed facts (each verified this seat)

- **O1 — QuarantineB verdict and method.** `.ufo/waves/round-27/quarantine/QuarantineB.md`: S126 = 200 / 337116 B / sha `050be211…769`, "quote in source? no", verdict **absent/refuse**; method: "the register was used only to obtain each row's cited URL and quoted span"; Reason: "the page is exclusively REST rate-limit prose; none of the three Chrome-native-messaging phrases occurs"; B's own inference (:139) that S126's recorded quotes "most likely belong to other round-2/3 tabi pages … e.g. a Chrome native-messaging doc for S126".
- **O2 — register drift, read directly.** `absent-defect-register.md:187` (S125, a 6265bis row) carries `Rate limits for the REST API` / `About secondary rate limits`; `:188` (S126, the GitHub page) carries `Native messaging` / `Extension side` / `Native messaging host side`. The quotes are shifted one register row — matching F2's table in `.ufo/waves/round-27/w1/RevStagedProvenance.md`.
- **O3 — the campaign's real S126 gate.** `lanes/tabi/round2/SOURCES-PROPOSED.md` `## Gate — S126`: quotes are the header-table and secondary-limit sentences above — the source's own numbers C1 needs. The refusal therefore never established that the page *lacks* quotable content; it established that the *register's* quotes for the id are absent.
- **O4 — refusal still standing.** Register sha256 today `5afe1810a6c3…ad833` = the round-31 `quarantine-slice` value ("unchanged since round 27"). The only lane-side S126 mention after round 27 is `corpus/lessons/round-27.md:32` (the 35-row absent/refuse list). No ruling, no clearing, no adoption.
- **O5 — lane registry state.** 118 rows, last id S118; zero `docs.github.com` hits in `corpus/SOURCES.md` and `corpus/knowledge/`; round-30 host ground is Discord (S117) plus the ratelimit-headers draft (S116) — the new GitHub rows are new ground, and lane S121 will be the registry's first GitHub URL (no E04 duplicate possible).
- **O6 — collisions.** `.ufo/waves/round-31/assimilation/collisions` = S102–S118 (17 ids). Lane S121/S122 are free ids; staged S121/S122 (Chromium json5) are different documents — id-assignment-by-document holds.
- **O7 — frozen controls already fence the laundering paths.** c1-J5 package-as-is → population 0; c1-J2 old-rows → admitted 0 (`r4-new-row`); c1-J4 invented thresholds → admitted 0 (`n1-threshold-sourced`); c1-J3 offline vs live → `--live` is part of the predicate (README-receipts.md; all committed at the freeze tree).

## Residual risk and verification gaps

- **This verdict covers the decision, not the execution.** Receipts for S119–S122 do not exist yet (frozen before data). Closure must verify: per-row receipts (F-R3), counter `--live` admitted ≥ 10 / failing = 0, census `check-sources` clean (no E04 on the two GitHub URLs), `sources-census` exit 0.
- Whether the campaign-gate sentences still appear in today's page is unverified by this seat (no fetch); C1's `--live` predicate is exactly the instrument that will establish it. If the page changed, the row fails on its own merits — that would not resurrect S126.
- The drift *mechanism* (generator offset bug) remains [INFERENCE] per F2; the drift *content* is observed (O2). The generator was not read (it writes the fleet repo — forbidden).
- I searched lane-side records only for a post-round-27 S126 ruling; campaign round-3+ artifacts were not enumerated. Register-bytes-unchanged is the stronger evidence and is verified.

## Appendix — commands and exit codes

```
mkdir -p …/w1/RevAssimDecision /fast/scratch/hyaku/tabi-r31/RevAssimDecision && echo ok → ok (exit 0)
grep -n 'S126' corpus/SOURCES.md                      → no output (no such row; registry ends S118)
grep -n '^| S121 \|^| S122 ' corpus/SOURCES.md        → no output (exit 1: rows not yet present)
grep -n 'rate-limits-for-the-rest-api|best-practices…' corpus/SOURCES.md → no output (exit 1)
ls corpus/lessons/round-31.md                          → No such file (L1 writes it from drafts)
sed -n '60,80p' /home/vgpnk/Projects/shokuknow/lanes/tabi/round2/SOURCES-PROPOSED.md
  → S126 row + Gate — S126 quotes (O3)               → exit 0
sed -n '184,192p' …/corpus-expansion-1/absent-defect-register.md
  → :187 S125 carries S126 anchors; :188 S126 carries S127 anchors (O2) → exit 0
sed -n '1,60p' .ufo/waves/round-27/quarantine/QuarantineB.md → S126 absent/refuse detail (O1) → exit 0
grep -n 'S126' corpus/lessons/*.md LOG.md             → only round-27.md:32 (O4)
sha256sum …/absent-defect-register.md
  → 5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833 (O4) → exit 0
grep -c '^| S[0-9]\{3\} ' corpus/SOURCES.md → 118 ; last id S118 (O5)
grep '^| S203 ' …/merge/tabi/SOURCES.append.md → troubleshooting-the-rest-api row (different document)
ls corpus/knowledge | grep -i rate → host-published-rate-limit-headers.md, rate-limit-policy-fields.md (O5)
```
