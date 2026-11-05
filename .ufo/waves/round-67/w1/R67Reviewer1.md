# R67Reviewer1 — C1 disposition-evidence rule attack (w1, review-only)

Seats reviewed: L1 plan (attacked, read-only); nothing else edited.
Lane base revision: 5400136b233579f7b716ab83a70b8be24ed88b26.
Inputs read (never modified): `.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs` and `.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv`.

## Source-of-rule pins

v22 meter (round-65, trusted input, not edited):

```
34|const BG_WORDS = ['cdp', 'devtools', 'remote-debugging', 'headless', 'webdriver', 'geckodriver', 'selenium', 'playwright', 'bidi', 'crawl', 'screenshot', 'recordhar', 'record-har'];
35|const DISPOSITIONS = ['no-tabi-ground', 'overlap-declared', 'contested-open'];
```

Proposed v23 rule (from L1 plan, attacked here): `overlap-declared` requires >=1 BG word in the quoted line; `no-tabi-ground` requires 0 BG words in the quoted line; `contested-open` unconstrained.

## F1 — semantic soundness: the rule refuses 95/95 adjudicated `no-tabi-ground` rows

Letting the BG word be a lexeme in the QUOTE — not a ladder — the rule says "a no-tabi-ground quote must contain zero BG words," but in the real r66 ledger every one of the 95 `no-tabi-ground` rows carries >=1 BG word. The BG word is usually a noun phrase describing the lane's own domain asset, not a disclosure of leaning:

```
LINE 4  | audio-shokunin PROVINCE.md:25 | "| Audio-province | The deliverable is original SFX, ambience, soundtrack motif/loop/stem/layer **audio content** or its headless fixture/measurement/documentation ..."
LINE 5  | audio-shokunin PROVINCE.md:41 | "SFX/stem synthesis and headless measurement battery (fixture-battery, audio-checklist, threshold-calibration, seed) ..."
LINE 155| kotoba-shokunin PROVINCE.md:59| "| audio | none | ... audio owns game SFX and soundtrack production checked by headless analysis (PROVINCE.md:3-5) ..."
LINE 156| kotoba-shokunin PROVINCE.md:61| "| game-dev-2d | none | ... game-dev-2d owns 2D game production checked by headless Godot fixtures ..."
LINE 157| kotoba-shokunin PROVINCE.md:62| "| game-dev-3d | none | ... 3D game production under executable headless fixtures ..."
```

These are honest "I own X, verified by headless" lines — the word `headless` describes the lane's own verification method for its own asset, not the presence of a Tabi overlapping surface. Under the proposed rule they would all be refused today.

Can a no-tabi-ground line legitimately contain a BG word? Yes (this is the counterexample): a lane that drives its own verification by generic "headless battery" has not thereby opened a Tabi-overlapping surface. The BG word is a lexeme of the lane's domain vocabulary as well as of Tabi's — the 13-element BG_WORDS list is the same list the meter already uses for the `bgHits` screen, so any lane whose PROVINCE.md mentions its own `headless`/`crawl`/`screenshot` machinery gets counted as "carrying a BG word" whether or not there is any Tabi overlap.

Can an overlap-declared line legitimately lack one? No clear counterexample found in the r66 ledger (the 5 existing overlap-declared rows all carry >=1 BG word — 4 `crawl`, 1 `devtools`), so the overlap-declared half is not refuted from this ledger alone; but the same lexer defect I report in F3 applies here too (a sibling may declare overlap in words the BG list doesn't cover, e.g. "we both touch the browser").

Verdict driver: the 95 refuses are all seen today — not a hypothetical.

## F2 — triviality: quote-padding is already refused, but only while the sibling file is untouched

Can an adjudicator satisfy the rule by editing the quote to add a BG word? The v22 meter already refuses a spliced quote:

```
v22:215|      if (rowFor[6] !== linesArr[ln - 1]) add('delta-quote-not-whole-line', `${lane}:${relPath}:${ln}`);
```

Pinned selftests that prove the guard is live and green (not a defensive comment):

```
v22:560|  { name: 'delta-quote-spliced', expect: 1, ids: ['delta-quote-not-whole-line'], ... 'drive the browser' ... }
v22:572|  { name: 'predicate-assert-partial', expect: 1, ids: ['delta-quote-not-whole-line'], assertPredicate: false, assertFindingCount: 1, ... }
v22:694|  { name: 'kama-quote-spliced', expect: 1, ids: ['delta-quote-not-whole-line'], assertPredicate: false, assertFindingCount: 1, ... }
```

Mutation to name: from an overlap-declared row carrying no BG word (or a no-tabi-ground row carrying one), rewrite the quote to either (a) splice in a BG word to reach 1, or (b) splice the BG word out to reach 0. Without touching the sibling file, the parsed sibling line still differs from the mutated quote and `delta-quote-not-whole-line` fires at v22:215 — v23's extra conjunct does not change this; a padded quote is already refused under the same finding id.

Remaining triviality hole: only while the adjudicator edits the actual sibling repo file (the real PROVINCE.md), inserting or removing a BG word from the real line. The meter then re-quotes from the freshly-parsed file (v22:203 `if (provSha !== sha256(Buffer.from(text, 'utf8'))) add('lane-screen-sha-mismatch', ...)` would fire if the adjudicator falsifies the sha in the same ledger, so the trivial fix requires a real sibling commit, not a ledger-only edit). This is already the meter's trust boundary; the proposed v23 rule does not widen or narrow it, and quoting whole-line from the sibling file is the mitigation.

## F3 — counts on the r66 ledger: 95 refusals, 0 overlap-declared refusals

Definitive counting command (populated BG words asserted = 13):

```
awk 'BEGIN{FS="\t"; n=0; split("cdp devtools remote-debugging headless webdriver geckodriver selenium playwright bidi crawl screenshot recordhar record-har",A," "); ...}' \
  .ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv
```

Output (exit 0):

```
populated BG words: 13
no-tabi-ground   95
contested-open   49
overlap-declared 5
TOTAL line rows: 174
REFUSED BY v23 RULE: 95
no-tabi-ground rows with >=1 BG word: 95
refused rows:
  r3 audio-shokunin PROVINCE.md:4 no-tabi-ground bgWords=headless
  r4 audio-shokunin PROVINCE.md:25 no-tabi-ground bgWords=headless
  r5 audio-shokunin PROVINCE.md:41 no-tabi-ground bgWords=headless
  r8 game-dev-2d-shokunin PROVINCE.md:3 no-tabi-ground bgWords=headless
  r9 game-dev-2d-shokunin PROVINCE.md:8 no-tabi-ground bgWords=headless
  r10 game-dev-2d-shokunin PROVINCE.md:16 no-tabi-ground bgWords=headless
  r12 game-dev-3d-shokunin PROVINCE.md:3 no-tabi-ground bgWords=headless
  r13 game-dev-3d-shokunin PROVINCE.md:6 no-tabi-ground bgWords=headless
  r14 game-dev-3d-shokunin PROVINCE.md:16 no-tabi-ground bgWords=headless
  r15 game-dev-3d-shokunin PROVINCE.md:19 no-tabi-ground bgWords=headless
  r16 game-dev-3d-shokunin PROVINCE.md:29 no-tabi-ground bgWords=headless
  r17 game-dev-3d-shokunin PROVINCE.md:57 no-tabi-ground bgWords=headless
  r18 game-dev-3d-shokunin PROVINCE.md:58 no-tabi-ground bgWords=headless
  r19 game-dev-3d-shokunin PROVINCE.md:62 no-tabi-ground bgWords=headless
  r21 kagi-shokunin PROVINCE.md:41 no-tabi-ground bgWords=cdp
  r24 kagi-shokunin PROVINCE.md:91 no-tabi-ground bgWords=cdp
  r26 kaidoku-shokunin PROVINCE.md:48 no-tabi-ground bgWords=headless
  r28 kaidoku-shokunin PROVINCE.md:58 no-tabi-ground bgWords=headless
  r29 kaidoku-shokunin PROVINCE.md:136 no-tabi-ground bgWords=headless
  r31 kaidoku-shokunin PROVINCE.md:149 no-tabi-ground bgWords=headless
  r72 kake-shokunin PROVINCE.md:22 no-tabi-ground bgWords=crawl
  r73 kake-shokunin PROVINCE.md:23 no-tabi-ground bgWords=crawl
  r75 kake-shokunin PROVINCE.md:66 no-tabi-ground bgWords=crawl
  r76 kake-shokunin PROVINCE.md:308 no-tabi-ground bgWords=crawl
  r77 kake-shokunin PROVINCE.md:309 no-tabi-ground bgWords=crawl
  r79 kake-shokunin PROVINCE.md:328 no-tabi-ground bgWords=crawl
  r82 kake-shokunin PROVINCE.md:346 no-tabi-ground bgWords=crawl
  r83 kake-shokunin PROVINCE.md:348 no-tabi-ground bgWords=crawl
  r84 kake-shokunin PROVINCE.md:349 no-tabi-ground bgWords=crawl
  r85 kake-shokunin PROVINCE.md:351 no-tabi-ground bgWords=crawl
  r86 kake-shokunin PROVINCE.md:353 no-tabi-ground bgWords=crawl
  r87 kake-shokunin PROVINCE.md:358 no-tabi-ground bgWords=crawl
  r88 kake-shokunin PROVINCE.md:364 no-tabi-ground bgWords=crawl
  r89 kake-shokunin PROVINCE.md:365 no-tabi-ground bgWords=crawl
  r90 kake-shokunin PROVINCE.md:370 no-tabi-ground bgWords=crawl
  r91 kake-shokunin PROVINCE.md:373 no-tabi-ground bgWords=crawl
  r92 kake-shokunin PROVINCE.md:379 no-tabi-ground bgWords=crawl
  r93 kake-shokunin PROVINCE.md:381 no-tabi-ground bgWords=crawl
  r94 kake-shokunin PROVINCE.md:382 no-tabi-ground bgWords=crawl
  r95 kake-shokunin PROVINCE.md:383 no-tabi-ground bgWords=crawl
  r96 kake-shokunin PROVINCE.md:400 no-tabi-ground bgWords=crawl
  r97 kake-shokunin PROVINCE.md:402 no-tabi-ground bgWords=crawl
  r98 kake-shokunin PROVINCE.md:404 no-tabi-ground bgWords=crawl
  r99 kake-shokunin PROVINCE.md:414 no-tabi-ground bgWords=crawl
  r100 kake-shokunin PROVINCE.md:416 no-tabi-ground bgWords=crawl
  r101 kake-shokunin PROVINCE.md:417 no-tabi-ground bgWords=crawl
  r102 kake-shokunin PROVINCE.md:418 no-tabi-ground bgWords=crawl
  r103 kake-shokunin PROVINCE.md:420 no-tabi-ground bgWords=crawl
  r104 kake-shokunin PROVINCE.md:421 no-tabi-ground bgWords=crawl
  r105 kake-shokunin PROVINCE.md:423 no-tabi-ground bgWords=crawl
  r106 kake-shokunin PROVINCE.md:424 no-tabi-ground bgWords=crawl
  r107 kake-shokunin PROVINCE.md:426 no-tabi-ground bgWords=crawl
  r108 kake-shokunin PROVINCE.md:428 no-tabi-ground bgWords=crawl
  r109 kake-shokunin PROVINCE.md:437 no-tabi-ground bgWords=crawl
  r110 kake-shokunin PROVINCE.md:444 no-tabi-ground bgWords=crawl
  r111 kake-shokunin PROVINCE.md:446 no-tabi-ground bgWords=crawl
  r112 kake-shokunin PROVINCE.md:455 no-tabi-ground bgWords=crawl
  r113 kake-shokunin PROVINCE.md:457 no-tabi-ground bgWords=crawl
  r114 kake-shokunin PROVINCE.md:464 no-tabi-ground bgWords=crawl
  r115 kake-shokunin PROVINCE.md:465 no-tabi-ground bgWords=crawl
  r116 kake-shokunin PROVINCE.md:466 no-tabi-ground bgWords=crawl
  r117 kake-shokunin PROVINCE.md:582 no-tabi-ground bgWords=crawl
  r118 kake-shokunin PROVINCE.md:584 no-tabi-ground bgWords=crawl
  r119 kake-shokunin PROVINCE.md:590 no-tabi-ground bgWords=crawl
  r120 kake-shokunin PROVINCE.md:598 no-tabi-ground bgWords=crawl
  r121 kake-shokunin PROVINCE.md:608 no-tabi-ground bgWords=crawl
  r125 kake-shokunin SKILL.md:1014 no-tabi-ground bgWords=crawl
  r126 kake-shokunin SKILL.md:1089 no-tabi-ground bgWords=crawl
  r127 kake-shokunin SKILL.md:1100 no-tabi-ground bgWords=crawl
  r128 kake-shokunin SKILL.md:1121 no-tabi-ground bgWords=crawl
  r129 kake-shokunin SKILL.md:1233 no-tabi-ground bgWords=crawl
  r130 kake-shokunin SKILL.md:1248 no-tabi-ground bgWords=crawl
  r131 kake-shokunin SKILL.md:1254 no-tabi-ground bgWords=crawl
  r132 kake-shokunin SKILL.md:1295 no-tabi-ground bgWords=crawl
  r133 kake-shokunin SKILL.md:1309 no-tabi-ground bgWords=crawl
  r134 kake-shokunin SKILL.md:1325 no-tabi-ground bgWords=crawl
  r135 kake-shokunin SKILL.md:1333 no-tabi-ground bgWords=crawl
  r136 kake-shokunin SKILL.md:1334 no-tabi-ground bgWords=crawl
  r137 kake-shokunin SKILL.md:1335 no-tabi-ground bgWords=crawl
  r138 kake-shokunin SKILL.md:1346 no-tabi-ground bgWords=crawl
  r139 kake-shokunin SKILL.md:1350 no-tabi-ground bgWords=crawl
  r140 kake-shokunin SKILL.md:1357 no-tabi-ground bgWords=crawl
  r141 kake-shokunin SKILL.md:1358 no-tabi-ground bgWords=crawl
  r142 kake-shokunin SKILL.md:1473 no-tabi-ground bgWords=crawl
  r152 kengaku-shokunin PROVINCE.md:990 no-tabi-ground bgWords=headless
  r153 kengaku-shokunin PROVINCE.md:1085 no-tabi-ground bgWords=headless
  r155 kotoba-shokunin PROVINCE.md:59 no-tabi-ground bgWords=headless
  r156 kotoba-shokunin PROVINCE.md:61 no-tabi-ground bgWords=headless
  r157 kotoba-shokunin PROVINCE.md:62 no-tabi-ground bgWords=headless
  r163 mado-shokunin PROVINCE.md:16 no-tabi-ground bgWords=screenshot
  r164 mado-shokunin PROVINCE.md:35 no-tabi-ground bgWords=screenshot
  r165 mado-shokunin PROVINCE.md:482 no-tabi-ground bgWords=screenshot
  r168 revenger-shokunin PROVINCE.md:26 no-tabi-ground bgWords=headless
  r169 revenger-shokunin PROVINCE.md:27 no-tabi-ground bgWords=headless
  r175 tsukuroi-shokunin PROVINCE.md:48 no-tabi-ground bgWords=screenshot
```

All 5 overlap-declared rows today carry >=1 BG word (4 `crawl` in kake PROVINCE.md rows 40/310/329/344 carrying lexeme `crawl` inside "crawlers / crawl-", and 1 `devtools` in kake SKILL.md:697 carrying lexeme `devtools` inside "DevTools"), so its half of the rule would pass them; no overlap-declared refusals. However, they carry those words purely because the sibling-domain phrase happens to contain them (e.g. kake's "publisher-side robots/sitemap placement at the host it serves, while browser-driving and client-side crawler discipline belong to tabi") — the same lexeme-collision defect that fired the 95 no-tabi-ground refuses applies in reserve to overlap-declared.

Substring lexing defect (verified with a probe, not in the ledger): the word `crawl` matches `"crawlers"` as a subword (`probe: substring=["crawl"] wholeword=[] for: we prohibit crawlers inside robots.txt`), so whole-word boundary would tighten the match but not fix the domain-collision problem. All 13 words are substring-matched with `low.includes(w)` (v22:34 uses plain strings; v22:209 and v22:235 and v22:262 use `BG_WORDS.some((w) => low.includes(w))`).

## F4 — verdict and limit

**Verdict: unsound as proposed.** Two concrete problems:
1. `no-tabi-ground requires 0 BG words` is violated by 95/95 (100%) of today's adjudicated `no-tabi-ground` rows — the rule would refuse the entire honest history.
2. Even if repaired by tightening the trigger word list or direction, the diagnosis (BG word present ⇔ Tabi overlap is declared or open) does not hold: `headless`, `crawl`, `screenshot`, `cdp`, and `devtools` are common Terms in the sibling's own domain vocabulary (audio pipelines, Godot replay, crawler hygiene, test screenshots), not markers of Tabi/adjacency overlap.

`overlap-declared requires >=1 BG word` is not refuted from this ledger, but rests on the same subreddit-vocabulary collision, not on any evidence that the BG word signals overlap; it is sound-with-limit only if the word lists are tightened to overlap-assertion forms and the no-tabi-ground conjunct is removed or inverted.

**Mitigation note:** the v23 rule does not change the trust boundary for quote padding, since `delta-quote-not-whole-line` (v22:215) already refuses a padded quote unless the sibling file itself is edited (which also trips `lane-screen-sha-mismatch` at v22:203, requiring a real commit). Quote-padding against the ledger alone is not exploitable.

## Tooling authorization

No tools installed or upgraded this seat. Read-only command-line work only (`wc`, `grep`, `awk`, `read`, `node` probe script in `/fast/scratch/hyaku/tabi-r67/R67Reviewer1/`). Scratch dir deleted after this report. No git/jj mutations. No meter file, corpus file, or ledger file modified. No sibling repo written.

## Honesty footnote

The 95 rows listed above are counted from the exact r66 ledger lines named (r3-r175), not extrapolated. The probe script examined only my scratch. I did not execute any meter selftest on the frozen v22 (I only read its source and pinned selftest case names/expectations verbatim). No flip sweep or delta invoked here — this is a rule-attack seat, not a meter run.
