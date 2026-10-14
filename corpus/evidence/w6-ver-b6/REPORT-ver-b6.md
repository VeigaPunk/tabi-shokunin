# VER-B6 — fixture verifier report (scratch; final message is the handoff)

Seat: VER-B6, round-6 wave (shokunin training r6), verified lane: tabi (B6).
Write scope held: NO writes in any fleet tree (assignment: "Do NOT edit");
scratch namespace /tmp/w6-ver-b6/* only. Poll for the fixture note
(`external-class-fixture-v2.md`) started 17:42:34Z, 25-min cap.

## What was verified (read-only)

Target: B6-1's external-class fixture v2 scratch (/tmp/w6-tabi-b61/) —
`server.py`, `v2-driver.sh`, `v2-journey.mjs`, `compare-v2.mjs`, `extract.mjs`,
`site-a/`, `site-b/` + runs chain-run1..3, probe-robots, probe-429, probe-429b,
probe-403, probe-captcha.

### Re-run #1 — the one claim: "E1 redirect chain cell" (frozen rev A, 17:42:34Z)

Claim re-run under my own hands (my ports 19741/19743, my copies, my scratch):
- /chain/start → 302 → Location /chain/hop1
- /chain/hop1 → 303 → Location /deep/path/hop2 (cross-path)
- /deep/path/hop2 → 307 → Location http://127.0.0.1:<B>/chain/landed.html (origin change)
- landing 200, bytes sha256 cee3607e… == frozen site-b/chain/landed.html bytes;
  title "TABI-R6-1 landed"; curl -L: exit=0 final=200 redirects=3
- robots.txt 200, sha256 bc0300df… == B6-1's pinned robots hash; the intended
  disallowed path /private/instrument/probe: 0 hits in the server log
- instrument classes: /rate/429 → 429 + Retry-After: 7 + no-store;
  /rate/403 → 403; /gate/interstitial → 200 + marker data-tabi-gate="interstitial"
  + title "Security check"; POST /m/307 → 307 → /m/echo → {"method":"POST","bodyBytes":8}
- run1-vs-run2 (identical cell): status+body IDENTICAL for start and landing
- cleanup: servers killed by PID; ports 19741/19743 closed; curl exit 7
=> CLAIM CONFIRMED (HTTP level).

### Re-run #2 — full driver replication, frozen rev A (chromium, my ports 19741/19743/19742)

B6-1's own driver + journey (copies; only ROOT/ports patched in MY copies):
two identical-cell chain runs → compare-v2.mjs rows 10/10 IDENTICAL, and every
hash equals B6-1's own compare-chain.tsv: step-1 png b0528cebff431d7a, post-307
png b0528cebff431d7a, step-2-landed png ea09f60ce2686c75, shapes 87e1477e… /
8749e45e…, structs 7e4f1c25… / fe20eb70…. Cleanup pass in both runs.

### Re-run #3 — full driver replication, frozen rev B (17:45Z; adds same-origin chain)

Two chain runs, my ports 19841/19843/19842 → 13/13 IDENTICAL incl.
step-3-same-landed (png c76931d59e4256dd, shape d2a51ca4471a3b64, struct
fe20eb7042a15ace) == B6-1's current compare-chain.tsv values. Cell results
match theirs: chain-navigate finalUrl site-b, redirectCount 0; same-origin
finalUrl site-a/chain/same-landed.html, redirectCount 3; post-307
redirected=true finalUrl /m/echo. Cleanup pass; 14 request lines; no trip.
HTTP-level same-origin check: 302→303→307→/chain/same-landed.html, redirects=3.

## 3 spot-checks (independent recomputation)

1. Their PNG claim: sha256(chain-run2/3 step-1-index.png) =
   b0528cebff431d7a… (claimed b0528cebff431d7a) ✔; step-2-landed =
   ea09f60ce2686c75… ✔; step-3-same-landed = c76931d59e4256dd… ✔.
2. Their struct claim recomputed from raw DOMSnapshot with my own node code:
   7e4f1c2591f4fca6… / fe20eb7042a15ace… == their compare rows ✔.
3. Their stop-cell absence claims from their server logs: probe-robots →
   /private/instrument/probe hits 0 (intended not issued) ✔; probe-429/403 →
   /gate/interstitial hits 0 ✔; probe-captcha → /rate/429 hits 0 ✔.

## Cleanup check

- B6-1 runs: every closure.txt shows ports 19541/19543/19542 not listening,
  no chromium for the run profile, curl exit 7; global ss at 17:46Z: no 19xxx
  listener; no chromium processes for any /tmp/w6-tabi-b61 profile.
- My runs: all four server pairs killed by PID; all my ports closed; curl
  exit 7; no processes left (pgrep clean). My scratch: /tmp/w6-ver-b6/.
- Live-state note (not mine to own): daemon 10086 has no listener / pid
  3934817 not running (B6-2 + SCR-B6 both measured; consistent with the
  operator-side disposition owed).

## Unknowns

- The fixture revision MOVED during verification (server.py 14:43, v2-journey
  14:44, 14:45); the note's pins will name some revision — my verified
  revisions: revA v2-journey ddb5b2a8…/server e9a6fced…; revB v2-journey
  d6ea04c8…/server 936f1584…. A note pinning a later revision is unverified
  by me (re-run is cheap; window is the 25-min poll).
- The fixture note `external-class-fixture-v2.md` was NOT landed by the poll
  cap at write time (status: absent; scribe draft §3 L2a "bytes exist, note
  not landed"); the claim verified here is the chain cell as evidenced in
  scratch + the byte-identity table, not a quoted note sentence.
- The cross-origin landing witness `redirectCount` is 0 in the perf entry
  while the same-origin chain shows 3 — the 3-hop trace for the cross-origin
  case lives in the CDP network slice, not the perf nav entry; noted, not a
  contradiction.
- B6-1's "notExecuted"/trip claims are verified from their own logs and their
  trip.json bodies (attachTripBody); I did not re-run a probe cell end-to-end
  under the driver (single-claim scope: chain cell).---

## Note alignment (final) — 17:47:45Z note landed

`corpus/knowledge/external-class-fixture-v2.md`, 552 `wc -l` (553 logical) /
29,664 B / sha256 `422ad0d8…`. Its pins: `server.py` `936f1584…`,
`v2-journey.mjs` `d6ea04c8…`, `v2-driver.sh` `ebdf950a…`, `compare-v2.mjs`
`ddd839de…` — byte-identical to my frozen2/frozen3 revision. **The one claim
re-run (E1 chain cell + §6 byte-identity) therefore ran on the note's exact
pinned revision.** Verdict: **CONFIRMED**.

Note-vs-my-readings spot evidence (all agree): robots 200/44 B/`bc0300df…`;
429 84 B/`48321a1e…` + Retry-After 7; 403 43 B/`538e4a35…`; interstitial
775 B/`918b1f6d…` at status 200; `/m/echo` body 35 B/`5e4aed62…`; chain landings
`cee3607e…` (cross-origin) and `a62625fb…` (same-origin); hop codes
302→303→307 with cross-path and origin hop; `redirectCount` 3 (same-origin) vs 0
(cross-origin); my curl `-L` sees 3 redirects on both chains (a non-browser HTTP
client), which corroborates R2's "same-origin-only witness" rather than
contradicting it (curl has no redirectCount surface).

Note pins re-derived by me, all OK: 12 embedded fixture/runner byte counts +
sha256 == disk; `chain-run2/http-a.log` `3e7527d5…` (1,006 B) and `http-b.log`
`0b1f5705…` (294 B); `compare-chain.tsv` 13 rows / 13 IDENTICAL; §3's
"no file ends with a trailing newline" held on all 9 fixture files; 8/8
`closure.txt` present with 0 FAIL lines; `probe-429` vs `probe-429b` trip
records equal after deleting `atUTC`/`atRelMs` (their claim) = true.

Final state at 17:49Z: my poll + freeze watchers stopped; no fixture-range
listener (19541/43, 19741/43, 19841/43, 19941/43 all closed); no VER-B6
processes; scratch = /tmp/w6-ver-b6/ (evidence/, frozen/, frozen2/, frozen3/,
work/, poll/, this report). No writes in any fleet tree.