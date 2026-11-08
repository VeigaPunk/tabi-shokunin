# tabi — round 92

L1 `TabiR92`. Base `bdf403ff` (the round-91 verifier spot-check commit; lane clean). Rounds 90 and 91
closed `rejected-honest-stop`, both on the amendment-59 class (a claim sentence wider than its
counter, falsified by the round's own wave). This round declares ONE claim — C1 coverage, the new
capability `chromium-crosssite-iframe-chooser-linux` — worded as the conjunction of its counter's
checks, frozen with its controls in commit `2bac1048` before the scored run (`a87c7176`) and before
the wave was dispatched (`4fe08d26`).

## Gate

### Sources — opened this round

The L1 fetched S227/S228 and the WHATWG page on 2026-11-08 and staged the bytes under
`.ufo/waves/round-92/sources/`; the wave scout R92Scout re-fetched S227/S228 byte-identical and
fetched S230 and the rejected candidates (`.ufo/waves/round-92/w1/R92Scout-sources/`).

- **S227** — CDP Target domain, `Target.pdl` at tag 155.0.8059.84 (19,796 B base64 → 14,847 B,
  sha256 `136ca4a240e6`), lines 229-230: "Controls whether to automatically attach to new targets
  which are considered to be directly related to this one (for example, iframes or workers)."
  (21 words).
- **S228** — Chromium `docs/process_model_and_site_isolation.md` at tag 155.0.8059.84 (decoded
  sha256 `5a371fa56628`), §Full Site Isolation (site-per-process), lines 145-147: "In
  (one-)site-per-process mode, each process is locked to documents from a single site. Sites are
  defined as scheme plus eTLD+1" (21 words).
- **S229** — WHATWG HTML §7.1.1 Sites, `https://html.spec.whatwg.org/multipage/browsers.html`
  (208,938 B, sha256 `448876c21fa5`; staged as `sources/origin.html`), the "obtain a site"
  algorithm: "If origin's host's registrable domain is null, then return (origin's scheme, origin's
  host)." (14 words).
- **S230** — Playwright `packages/playwright-core/src/server/chromium/crPage.ts` at v1.65.0
  (commit `a1f35e19…`, 59,431 B, sha256 `918f0f9beed3`), line 637: "Note: OOPIF frame has been
  already attached in the parent session, so skip it." (14 words; the guard at line 636 is
  `frameTree.frame.id === this._targetId`).

Identified 9 / screened 9 / included 4 NEW rows / excluded 5. Registry 226 → 230. `## Search log`
carries the round-92 entry. No pre-existing row changed `status`, `recheck` or `used-by`.

**Reversal before commit (discernment record).** The L1's pre-wave draft excluded the WHATWG Sites
text as "the spec's site, not Chromium's process-model site" and wrote S228's `teaches` as "sites
are scheme plus eTLD+1, so `localhost` and `127.0.0.1` are different sites". R92Scout
(`.ufo/waves/round-92/w1/R92Scout.md` §Depth findings 1-2) showed neither host has a registrable
domain (`127.0.0.1` is an IP literal; `localhost` has no PSL rule — Chromium
`registry_controlled_domain.cc:518-520`, `site_info.cc:1282-1285`), so both fall back to
scheme-and-host and S228's eTLD+1 sentence does not decide the split. Old→new before the first
commit of these rows: S228 `teaches` "sites are scheme plus eTLD+1, so `localhost` and `127.0.0.1`
are different sites …" → "each renderer process is locked to one site … the eTLD+1 sentence does
not itself decide `localhost`/`127.0.0.1` (see S229)"; S228 anchor "lines 141-147" → "lines
141-148"; WHATWG Sites excluded → admitted as S229. The C1 predicate is unaffected (declared limit
2 already said "no registrable domain").

Rejected (with flip condition):

- **MDN "Same-origin policy"** (`https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy`,
  167,208 B, opened by R92Scout) — secondary documentation with 0 occurrences of eTLD, site
  isolation, OOPIF, registrable or DevTools; it describes script-level access, not Chromium's target
  model. Flip: only as a pointer if a round's claim rests on the web-platform origin concept itself
  (WHATWG stays primary).
- **"The r91 cross-origin arm measured a cross-site iframe"** — measured false this round: a child
  on `127.0.0.1` at another port is same-site; it gets no `iframe` target and its chooser arrives on
  the page session (S arm, 3/3 legs in the scored receipt). Flip: none — the r91 capability row is
  narrowed by an appended SCORECARD correction.

Admitted: `corpus/knowledge/chromium-crosssite-iframe-chooser-round-92.md` (cites S227-S230, S221,
S222 and the r92 receipt `corpus/evidence/round92/chromium-crosssite-iframe-chooser/receipt.json`;
drafted by the wave scribe R92Scribe, integrated by the L1 with the R92ExecProbe/R92Critic2 probe
section and the S229 mechanism correction, the inference marked).

## Mistakes

1. **Class: in-place rewrite of append-only records.** Evidence: round-91 commit `249b7d0c`
   rewrote `corpus/QUALITY.md` row 163 and three lines of the round-90 `LOG.md` entry
   (`LOG.md:4079-4080, 4086` at `b1d8f07b`) in the same commit that added QUALITY 164 ("never
   rewritten in place"); `a60d2f75` and `7c59b264` rewrote five lines each of the round-91 `LOG.md`
   entry; the filed fleet report was rewritten in place twice (`49c70103`, `2beeaeb2`) — r91
   spot-check §8 items 1-2. Captured-by: PROTOCOL §Round-robin (append-only LOG) and QUALITY 164 —
   prose rules with no executable gate; the r91 drift gate checked the presence of correction
   text, not that old bytes survived. Fix: `scripts/check-append-only-round92.mjs` (written by wave
   seat R92Exec2): for each named file the base bytes must be a byte prefix of the tip bytes.
   **Shown able to fail:** `--base b1d8f07b --tip 878bc912 -- LOG.md corpus/QUALITY.md` → exit 1,
   `rewritten` at LOG.md line 4079 and QUALITY.md line 1060 (`.ufo/waves/round-92/w1/R92Exec2-demo-a.json`);
   selftest 4/4 (append ok, in-place edit rewritten, deletion deleted, new file new); passes on
   this round's range (§Gate run below). QUALITY 165 makes it the green state. Scope note: it does
   not apply to `corpus/SOURCES.md`, whose registry table grows by mid-file row insertion by design.
   The r92 report is written once, after the last lane commit; any correction is an appended erratum.

## Routed defects from the round-91 spot-check (§8)

| item | disposition this round | pointer |
|---|---|---|
| 1 filed report rewritten | process: the r92 report is filed once after the last lane commit | report commit history |
| 2 append-only repairs | appended QUALITY 165 naming 163's in-place edit and the LOG rewrites; mined above | `corpus/QUALITY.md` row 165 |
| 3 r91 C1 binding gaps | not repaired — the r91 instrument is frozen history; the r92 claim is a new surface | this table |
| 4 capability row scope | appended SCORECARD correction; this round's C1 measures the same-site vs cross-site split | `SCORECARD.md` §Correction — round 91 capability row |
| 5 r91 C2 meter strength | not repaired — r91 instrument frozen; the r92 append-only gate checks bytes, not presence | `scripts/check-append-only-round92.mjs` |
| 6 r89 item 6 wording | appended correction | `corpus/lessons/round-89.md` §Corrections carried by round 92 |
| 7 gate-run revision null | the r92 counter records `revision` (`git rev-parse master`) in every output | `.ufo/waves/round-92/scored/c1-live.json` |
| 8 post-data claim edits | claim text, instruments and controls landed in the freeze commit `2bac1048` before the scored run `a87c7176`; post-wave notes are clarifications in `plans/round-92.md` §Wave clarifications, no predicate edit | `plans/round-92.md` |
