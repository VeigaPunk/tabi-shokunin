# AdjKaidoku7 — C1 round 35, 16 kaidoku candidate lines: dispositions

Pin `kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f`. Decision rule `SKILL.md:2861-2881` asked in order for
every line; map rows proposed: **0**; screens: **16** (all `same-surface`); `l0.txt`: none.

Every line is kaidoku's own work on one of three splits this lane already has a verified map row for
(`corpus/adjacency.tsv` at the freeze `a4bfef0f75027c915e715649950b1d46dcb33d83`): row 2
`cdp-runtime-observation` (ruled: "kaidoku keeps CDP only as an REA provider surface for shipped-artifact analysis"),
row 16 `recorded-har-producer-channel`, row 17 `screenshot-pair-compare-semantics`. Step 2 of the rule therefore decides
each line: the surface is already owned for this sibling and the line adds a fact on the sibling's own side of it
(QUALITY 91). Step 1 was checked and fails as a screen ground: every line is genuinely browser/CDP sense, so none is
`not-browser-sense`; no line is another lane's census/report (`third-lane-report`) — "the census" in these two files is
kaidoku's own `corpus/knowledge/2026-10-13-r4-16-frontier-rescan.md` unexercised-verb census (its own REA queue); and no
line declares a deliberate refusal or non-goal (`no-claim-declared`), so that reason is not used.

| key (line) | disposition | one sentence, both sides |
|---|---|---|
| `…r10-01-queue-ops.md:263` | screen `same-surface` `recorded-har-producer-channel` | kaidoku's `chromium --log-net-log` call is the netlog provisioning leg whose product its own `inspect-web-network-capture` gate refuses, i.e. the producer-admission object row 16 splits from tabi's admitted HAR channel (`SKILL.md:403-406`). |
| `…r10-01-queue-ops.md:264` | screen `same-surface` `recorded-har-producer-channel` | the `playwright recordHar` capture via `/usr/bin/chromium` is the recorded HAR kaidoku's own gate decodes `historical-reference`/`observed`, the same object row 16 already splits on the producer rule. |
| `…r10-01-queue-ops.md:300` | screen `same-surface` `recorded-har-producer-channel` | the line's `refuses` is kaidoku's own verb refusing its own census's netlog hint as a HAR (BG+SIDE match, but the side is on its own gate), i.e. row 16, not a second row (QUALITY 91). |
| `…r10-01-queue-ops.md:301` | screen `same-surface` `recorded-har-producer-channel` | "typed against a real 1,310-event netlog" states kaidoku's refusal of a non-HAR channel, a decode fact on its side of row 16. |
| `…r10-01-queue-ops.md:302` | screen `same-surface` `recorded-har-producer-channel` | a playwright-recorded, self-launched-chromium HAR decoding losslessly is the admission result row 16 splits; tabi's side is the producer-named admission of its own HARs. |
| `…r10-02-queue-ops-2.md:3` | screen `same-surface` `cdp-runtime-observation` | the title's object is REA verbs exercised on kaidoku's own self-launched loopback chromium (row 2, `PROVINCE.md:9` endpoints/targets), and the compare verbs it lists are row 17's separately mapped surface. |
| `…r10-02-queue-ops-2.md:16` | screen `same-surface` `cdp-runtime-observation` | "Endpoints self-launched and loopback: chromium 152" is kaidoku's own self-launch, the object the round-16 ruling keeps as its REA provider surface (row 2). |
| `…r10-02-queue-ops-2.md:17` | screen `same-surface` `cdp-runtime-observation` | `--remote-debugging-port=9222` with `user-data-dir /tmp/r10-02-chrome` repeats kaidoku `PROVINCE.md:53` and is a throwaway launch flag, not the contested operator-profile lease (round-34 w2 CritScreenKaidoku counterexample 3). |
| `…r10-02-queue-ops-2.md:28` | screen `same-surface` `cdp-runtime-observation` | the subject is kaidoku's own r4-16 census listing only its r3 CDP verbs, a bookkeeping fact about its own provider surface (row 2). |
| `…r10-02-queue-ops-2.md:45` | screen `same-surface` `cdp-runtime-observation` | CDP envelopes embedding window timestamps and session target ids is evidence identity of kaidoku's own REA observations (row 2), and the line's "NOT re-derived" denies byte-exact reproduction of its own ids, not tabi's ground. |
| `…r10-02-queue-ops-2.md:99` | screen `same-surface` `cdp-runtime-observation` | the CDP hash equalling the file digest is a property of kaidoku's own `observe-javascript-runtime` payload, inside row 2. |
| `…r10-02-queue-ops-2.md:161` | screen `same-surface` `screenshot-pair-compare-semantics` | the snapshot wrapper and artifact-block input contracts are `compare-web-captures`' contract, inside row 17's split (kaidoku owns the artifact differ; tabi reads rendered state through pixels). |
| `…r10-02-queue-ops-2.md:187` | screen `same-surface` `cdp-runtime-observation` | "need only a loopback CDP target" premises kaidoku's own three verbs on its self-launched target, row 2's object. |
| `…r10-02-queue-ops-2.md:196` | screen `same-surface` `cdp-runtime-observation` | the r3/r4-08 self-launch pattern named as the cheap first target is kaidoku's own launch recipe, row 2. |
| `…r10-02-queue-ops-2.md:198` | screen `same-surface` `cdp-runtime-observation` | killing its own chromium tree, node inspectors and fixture server is cleanup hygiene of the mapped self-launch, not a browser-inventory or profile claim. |
| `…r10-02-queue-ops-2.md:220` | screen `same-surface` `cdp-runtime-observation` | the run-log launch of `http.server` + `chromium headless :9222` + `node --inspect :9229` stands up kaidoku's own loopback targets, row 2's object. |

## Why no map row

Step 5 ("otherwise it is an overlap") never applies: no line states kaidoku's side of a browser-ground split that a
verified row does not already carry for kaidoku. The one line that could pass the counter's mechanical `split-declared`
floor (`:300`, BG `chromium` + SIDE `refuses`) refuses kaidoku's *own* provisioning hint inside its own gate — exactly
the "naming is necessary, not sufficient" case of QUALITY 88/91. Proposing a map row here would re-key row 16 or row 2
under a new surface name and hide, not record, a boundary.

No `contested-open` question was drafted: nothing in these 16 lines contests a surface between tabi and kaidoku; the
9222/user-data-dir line is a throwaway profile, not the operator lease already open at fleet L0.

## Validation

Scratch clone `--shared` of the lane at `a4bfef0f75027c915e715649950b1d46dcb33d83`, this seat's commit
`f6a97a570ace286ecb8f4967a24d3fe7b2150b75` (one file added: `corpus/adjacency-screen-browser.tsv`, 17 lines).
`SKILL.md` and `corpus/adjacency.tsv` are untouched because no declaration and no map row were proposed (`decl.md` and
`rows.tsv` are therefore empty). Frozen counter:

```
node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev f6a97a570ace286ecb8f4967a24d3fe7b2150b75 \
  --repo <scratch>/clone --fleet /home/vgpnk/Projects/shokunin --json        # exit 1
adjacency clean rows 16 verified 16 | candidates 383 | mapped 0 | screened 16 | unaccounted 367 | newMapped 0
screenFindings []            # none of my 16 keys is in unaccountedKeys
```

Predicate false is the wave-1 partial reading: only this seat's 16 of 383 candidates are screened at this commit;
`newMapped` is a lane-level count and this chunk proposes none.
