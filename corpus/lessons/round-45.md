# Round 45 — tabi (Windows host; fresh-start discipline maintained)

Baseline `d252ea17bf8d39ea2e1da9770316146f264f8a0e` → freeze `51ee19219427497b69bbd4567d21c5478f4efbad`
→ measured claims `fb8e2435000df47d86fbab8ce89c1e8f3d0a733f` → data correction (adjacency lane
rows re-bound to current sibling heads under the frozen kill-rule flow) `0360b069c5f8465c0a230638b24229e774df7ea3`
(the cited measured revision; instrument bytes unchanged since the freeze). Three declared claims
(C1 calibration — the r44-freeze r5 hardening closing routed defect D1; C2 coverage capability
`edge-cdp-loopback-windows`; C3 adjacency — the host-roster re-base of the adjacency ledger, the
lowest owned axis at 8, nudge inactive since the r44 capability restarted the window). All three
verified under their frozen predicates at the measured revision; no axis harmed; no scalar moved
(no rubric authorizes one).

Fresh-start spot-checks (the r41/r42/r43 rejected closures): the r41 untracked receipt limb is
closed in committed bytes (`corpus/evidence/round41/playwright-egress/receipt.json` +
`receipt.witness.json` are blobs at HEAD); the r42 nonce-relabel/synthetic-receipt false-green
class is closed by the r44 counter clauses (nonce shape, invocation binding, runner digest pin —
verified in the committed bytes); the r43 checker false-green/crash class closed this round with
the D3 crash receipt (below). Ruled out for r45, with reasons in `.ufo/waves/round-45/claims.json`
`freshStartNote`: Firefox/BiDi moves (surface absent), wave-settled claims (no dispatch surface —
L0 open, routed around per carry-in D4), note-count claims and the D1 file-edit alone
(do-nothing reachable), and reusing the r36 adjacency meter v4 (bound to the old host fleet path
and absent lanes).

## Carry-in items from the r44 non-author closure (all addressed)

- **D1 (stale `frozenDigests` pin)** — repinned append-only: `.ufo/waves/round-44/claims-amendments.json`
  records old `d994ab716df4cb97ab007f7f955b000df1091265e77993e7f06331de4b3feb72` → new
  `f796ae84085087b6acde10a7d32787e95589f3202386f33bce7d8dfaaf101cc5` for
  `.ufo/waves/round-44/counters/chrome-cdp-receipt-r44.mjs`; the freeze file itself keeps its
  committed blob id `a38b24ee66108fb8c55e7f08463732c378bc28f6` byte-for-byte. Enforcement is
  C1's checker, which refuses a relabel, an invented repin, or a second stale entry.
- **D2 (revision-wording drift)** — correction of record: the r44 honest-state C1/C3 receipts are
  measured at the freeze amendment `8c23879945882dc13c62cdc6d3f5917bfe8b60ac` (their `rev` fields
  say so) while the r44 report's C1/C3 lines say "at `844a5b3a`". Per-revision baselines, explicit:
  instrument bytes and the freeze live at `8c238799`; the evidence tree and measure receipts live
  at `844a5b3a`; the read-set of both instruments is identical between the two revs (`844a5b3a`
  adds only round-44 evidence/measure files), so no r44 verdict changes. This row is the
  correction; the r44 report bytes are never rewritten.
- **D3 (unreceipted r43-crash before-state limb)** — receipted:
  `.ufo/waves/round-45/measure/d3-r43-pathtype-crash.json` (+ raw stderr tail) records the
  extracted r43 checker bytes (sha256 `2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743`)
  exiting 1 with uncaught `TypeError: b.path.replace is not a function` at :196:35 on the pathtype
  fixture — rebuilt deterministically at `7c558d5e2eae93a5f32a8f9235f97775a3fb488c` (same rev as
  the r44 controls), 55 files, from source rev `5c3f4cca`.
- **D4 (L2-floor L0 open)** — routed around, never treated as answered: no wave-settled clause
  appears in any claim predicate; the round ran L1-inline; the r44 L0 line stands.

## Gate

| Source | Opened | Command | Located quote (≤25 words) |
|---|---|---|---|
| S154 — Microsoft Edge DevTools Protocol, https://learn.microsoft.com/en-us/microsoft-edge/devtools/protocol | 2026-10-31 | `curl -sL -o edge-devtools-protocol.html https://learn.microsoft.com/en-us/microsoft-edge/devtools/protocol` → 57,251 B, sha256 `ab6c14c535b5ccf0be9ddeea2796e7bc6794dfb285305121fb4514f8f5b58626` (staged copy committed `.ufo/waves/round-45/sources/edge-devtools-protocol.html`; the first URL tried, `.../devtools-protocol/`, redirected to a legacy EdgeHTML page and was not used) | intro paragraph: "The Microsoft Edge DevTools Protocol matches the APIs of the Chrome DevTools Protocol." (13 words; 1 hit in the raw bytes) |

Admit/reject on the round's own outputs (L1 gate; the outside non-author spot-check remains the
closure's duty): ADMIT — S154 (raw-fetched, quote verified verbatim, staged, load-bearing for C2);
ADMIT — the Edge capability demonstration (live exit 0, counter clean on committed bytes,
cross-refusal of the r44 receipt, repro with fresh nonces and byte-identical screenshot); ADMIT —
the adjacency host re-base (meter green at the measured rev, red at baseline). REJECT — the first
C3 measurement at `fb8e2435` (chousa-shokunin advanced its HEAD between ledger regeneration and
the meter run; `lane-screen-head-mismatch`; corrected as data under the frozen kill rule and
re-measured at `0360b069` — the head binding caught a real sibling move mid-round); REJECT — the
first delta keyword list (265+ hit lines on the non-map lanes; narrowed pre-freeze, see Mistakes).

## Measurements (counting commands, paste-able)

- C1: `node .ufo/waves/round-45/counters/check-r44-freeze-round45.mjs --rev 0360b069c5f8465c0a230638b24229e774df7ea3 --repo <lane>` → exit 0 (receipt `measure/c1-checker-green-at-measured.json`); same command at `d252ea17…` → exit 1, findings `amendment-missing` + `frozen-digest-stale` naming the counter path (receipt `measure/c1-checker-red-at-baseline.json`); `--selftest` → 11/11.
- C2: `node scripts/chrome-cdp-loopback-round45.mjs --browser edge --out … --shot … --scratch …` → exit 0 (Edg/156.0.4314.50, discoveryVia devtools-active-port, invocation-bound, PNG 8,194 B sha `7dfce09d…`); `node .ufo/waves/round-45/counters/chrome-cdp-receipt-r45.mjs corpus/evidence/round45/edge-cdp/receipt.json --shot corpus/evidence/round45/edge-cdp/screenshot.png --runner scripts/chrome-cdp-loopback-round45.mjs` → exit 0, 0 findings on the committed bytes; repro run exit 0 with fresh nonces (run1 `7543027b…` / run2 `10bc2096…`; fixture nonces `2a3f9a27…` / `76926454…`) and byte-identical screenshot; cross-refusal control: counter vs the r44 chrome receipt → exit 1, 5 findings.
- C3: `node .ufo/waves/round-45/counters/c1-adjacency-host-v5.mjs --rev 0360b069… --repo <lane> --fleet <fleet>` → exit 0, counts roster 16 / mapRows 16 / auditRows 16 / deltaLanes 12; at `d252ea17…` → exit 1, 28 findings (16 audit-missing, 12 roster-lane-uncovered). Drift observed (the result, recorded not smoothed): 6 sibling-absent (kaidoku ×4, revenger ×2), 9 stale (kake ×5, kagi ×2, kumitate, kama), 1 moved (kake accessibility :79 → :85). Delta screen: 14 hit lines dispositioned (12 no-tabi-ground, 2 contested-open — the CDP runtime-observation ground in `shokunin-reverse-engineering` :53/:137, the revenger successor of fleet L0 `b6b3b5e…:65`, routed to the integrator, not absorbed).
- Registry: `grep -c '^| S[0-9]' corpus/SOURCES.md` 153 → 154. Knowledge: `ls corpus/knowledge/*.md | wc -l` 61 → 62. Evidence: `git ls-tree -r --name-only d252ea17… -- corpus/evidence/round45 | wc -l` → 0; at `0360b069…` → 2.

## Mistakes

| Class | Evidence | Captured-by | Fix / status |
|---|---|---|---|
| stale instrument pin in a freeze (mined from r44 per the §2b duty) | the r44 `claims.json` `frozenDigests` entry for the C2 counter pinned the pre-amendment digest `d994ab71…` while the committed bytes hash `f796ae84…` (r44 closure D1) | the r44 non-author verifier spot-check | repinned append-only via `.ufo/waves/round-44/claims-amendments.json` (old→new, bound to committed bytes) and ratcheted by C1's checker, which refuses any future uncovered stale entry, relabel, or invented repin; selftest cases 3-5 demonstrate the refusals |
| revision-wording drift in a report (mined from r44) | r44 honest receipts carry `rev` `8c238799…` while the report's C1/C3 lines say `844a5b3a` (r44 closure D2) | the r44 non-author verifier spot-check | correction row above (Carry-in D2); this round names per-revision baselines explicitly in every measurement line |
| delta-screen keyword list too broad (instrument-design, caught pre-data) | the first draft keyword list (browser/chrome/edge/chromium/screenshot/webkit/puppeteer included) produced 265+ hit lines on the 12 non-map lanes — per-line disposition would have been noise, not discernment | the L1's own pre-freeze burden measurement (`cut`/node screen of all 16 provinces before freezing) | list narrowed to the owned-ground vocabulary (cdp, devtools, remote-debugging, headless, webdriver, geckodriver, selenium, playwright, bidi, crawl, screenshot, recordhar, record-har) BEFORE the freeze; 14 bounded, honestly dispositioned hit lines; the frozen list is in the meter bytes |
| module import ran CLI (instrument bug, caught in dev) | importing the meter as a module for ledger validation executed the CLI path and killed the importer (first validation run produced no output) | the authoring-aid validation run in scratch | import guard added before the freeze; selftest still 13/13; the guard pattern (`import.meta.url` vs `argv[1]`) noted for the next counter |

## Census

Start (2026-10-31, round open): `bash <fleet>/scripts/sources-census.sh validate --root <fleet> tabi`
→ exit 0, `tabi ok`, 21 pre-existing W04 duplicate-URL warnings (same set r43/r44 disclosed).
End (round close): same command → exit 0 (receipt at `.ufo/waves/round-45/measure/census-end.*`).
`node scripts/check-sources.mjs` clean at the integration tip (S154's used-by note and lesson land
in the same commit).

## Assimilation

`considerthese/` does not exist in the lane repo (checked 2026-10-31). Shokuknow register not
reachable from this host.
