# R100Scribe — round 100 knowledge-note draft and receipt re-derivation

Seat: R100Scribe (leaf member; no subagent dispatch, no commits, no lane/mutation outside my own output paths).
Axes: coverage, quality. Milestone: Knowledge note draft.

## Deliverables

- `.ufo/waves/round-100/w1/R100Scribe-note.md` (130 lines) — the round-100 knowledge note, modelled on
  `corpus/knowledge/client-oopif-uploadsets-round-99.md` (front matter with `source:`/`verified-at:`/`recheck:`,
  law table, practitioner rules, "why", limits, relation to earlier notes, append-only correction). **`corpus/knowledge/`
  was NOT touched** — the L1 integrates.
- `.ufo/waves/round-100/w1/R100Scribe-facts.json` — the jq re-derivation (single JSON document, 21.5 kB).
- `.ufo/waves/round-100/w1/R100Scribe-derive.jq` — the jq program that produces the facts file (re-runnable).

## What the note states

Every practitioner claim in the note is a re-derivation from the committed receipt, not a paraphrase of the plan:
Playwright keeps duplicate names (DUP3: `dup.txt`/21 B, `dup.txt`/22 B, `other.txt`/11 B, in order, no dedupe,
no rename); a 0-byte payload lands size 0 `text/plain` and reads back `e3b0c442…b855` (EMPTY1); mixing one path
and one payload in one call is refused with `Error` / `File paths cannot be mixed with buffers` and nothing is
set (MIXED); client-launched Playwright and Puppeteer land two paths **trusted** (LAUNCH2PL/LAUNCH2PU); a
directory path on a `webkitdirectory` input walks recursively, keeping the subdirectory in `webkitRelativePath`,
with trusted events (DIR); and the File Upload state's filename rule (no path components) is why `File.name` is
the basename.

## Re-derivation (every number from the committed receipt, with jq)

Command (from the seat scratch; the lane's receipt is the input):

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
jq -f .ufo/waves/round-100/w1/R100Scribe-derive.jq \
   corpus/evidence/round100/client-oopif-uploadsets/receipt.json \
   > .ufo/waves/round-100/w1/R100Scribe-facts.json
```

Exit 0. `allCrossChecksPass: true`, `crossCheckFalseCount: 0` over **37** cross-checks. What they cover:
schema/nonce/driver-pin/chromium/reps; **18 legs** in the exact frozen order (DUP3, EMPTY1, MIXED, LAUNCH2PL,
LAUNCH2PU, DIR × 3); **18 distinct UUID-shaped browser ids**; 3 distinct ports in range; empty `failures` and
no leg with an `error`; `missingExists` false with the `tabi-r100-missing.txt` basename; `tmpdirAtLoad`
basename `t`; the two libraries at 25.16.0 / 1.65.0 with tree counts 927 / 116; cross-site child
(`127.0.0.1` parent, `localhost` child); frames `[parent, child]`; exactly one iframe target per leg; parent
`#pp` empty on every leg; **zero `click` events**; and per arm the exact `files`, `events` and read digests —
including that the two non-target inputs are empty on every leg.

I also re-derived the descriptor digests independently of the receipt (sha256 of the driver's byte strings:
`1072bde6…`/`fcd3e36a…` for the two path files, `bb6d8edc…`/`7fb4cba7…`/`1a1308a9…` for the three payloads,
`b11d7548…` for the MIXED payload, `e3b0c442…` for empty, `d23bc5bb…`/`c40815e6…` for the two directory files)
— all nine match the receipt descriptors exactly, and `claims.json` `libraries` matches `receipt.libs` field
for field (version, integrity, file, fileSha256, treeFiles, treeSha256).

The committed receipt's sha256 is `dac0998fce3bb282ef47917428462cebff953cbcce324f14c9fa688d1dee2dd8`, **identical**
to the `receiptSha256` recorded by the scored run `.ufo/waves/round-100/scored/c1-live.json` (verdict `clean`,
0 findings, 216 checks, nonce `tabi-r100-live-6e6168fce8a4`, revision `9a478a2e`).

I re-ran the frozen counter against the committed receipt to confirm the receipt still satisfies the frozen
predicate:

```sh
node scripts/check-client-oopif-uploadsets-round100.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 97947b0b1a4522a48cf08c3681bc13368534608841094a755dd4cf938b306b90 \
  --receipt corpus/evidence/round100/client-oopif-uploadsets/receipt.json \
  --expect-nonce tabi-r100-live-6e6168fce8a4 --json
```

Exit **0**, verdict `clean`, 212 checks, 0 findings. The 212-vs-216 gap is exactly the four `--live`-only checks
(`driver-exit`, `ports-bound`, `missing-bound`, `tmpdir-bound`) that the frozen receipt-level paragraph itself
declares — no discrepancy. This run was `--receipt` mode, which the plan's limit 6 records as forgeable by a
whole consistent receipt; the claim's command is `--live`, and the `--live` evidence is the scored run above.

## Findings (no number differs; two wording defects found, both outside the C1 predicate bullets)

**No count differs.** Every leg-level number in the frozen predicate re-derives from the committed receipt.

**F1 — S250's `webkitRelativePath` attribution is to the wrong document.** `plans/round-100.md` §Claim sources
S250 as "WHATWG `input.html` §4.10.5.1.17 second half: the File Upload state's filename/webkitRelativePath
directory semantics … plus the `webkitRelativePath` definition". The staged `whatwg-input.html` (687 515 B,
sha256 prefix `b0202de1c0b4`, matching `fetch-log.txt`) contains **zero** occurrences of `webkitRelativePath`
and zero of `webkitdirectory`; it contains the File Upload state's filename rule (lines 4021-4025) and the
"no more than one file without `multiple`" rule (S216). The attribute is Blink's:
(`third_party/blink/renderer/core/fileapi/file.idl` line 38 at tag 155.0.8059.84 —
`[MeasureAs=PrefixedFileRelativePath] readonly attribute DOMString webkitRelativePath;` (fetched from
chromium.googlesource.com, HTTP 200; the `// Non-standard APIs` comment sits directly above it). The
*normative* home is the WICG entries API (`https://wicg.github.io/entries-api/`, 316318 B, 17 occurrences:
`USVString webkitRelativePath;`, its getter steps, and the `webkitdirectory` rule that each File's
`webkitRelativePath` is a relative path starting from and including the selected directory). The *behaviour*
the DIR leg measures is unaffected — only the attribution. My note states the attribute's real home and carries
this as an append-only correction; the L1 may want to narrow §Claim's S250 row the same way. (R100Scout, a
sibling seat in this wave, independently reports the same S250 misattribution and names the same WICG home.)

**F2 — S248/S249's staged copy has no fetch-log line.** §Claim says of the three new rows: "each has a staged
copy and a fetch-log line". `fetch-log.txt` records 4 URLs; `sources/` holds 5 files. `pw-elementHandle.ts` —
the Playwright *client* file carrying both throw sites (S248 line 287, S249 line 278) — is staged and
byte-identical to upstream v1.65.0 (sha256 `b5e6046e19cb…`, re-fetched and matched by me), but it is absent from
the log. The plan also points at "§Gate in the lesson" for the ≤25-word quotes; `plans/round-100.md` has no
`§Gate` section and `corpus/lessons/` has no `round-100.md`.

**F3 — A1's narrowed "Surface moved" sentence is narrower than the receipts allow.** A1 item 1 narrows the
history sentence to "within the client-oopif r95-r99 drivers, no call puts three files, two files with a
duplicate name, or a 0-byte file into one input". The r98 (`PUR`) and r99 (`PUAM`) absent-path arms do leave a
**0-byte** `File` in one input — `[['tabi-r98-missing.txt', 0, 'text/plain']]` and
`[['tabi-r99-missing.txt', 0, 'text/plain']]` — so the clause holds only for deliberate *named payload* files,
not for the absent-path phantom (which reads back `NotFoundError`, unlike the r100 EMPTY1 payload). This is a
history sentence, not a C1 predicate bullet; the predicate does not depend on it. My note records it as a
correction rather than asserting it.

**F4 (process, for the L1's attention, not a claim defect).** Amendment A1 is dated "post-wave, 2026-11-09" and
cites wave findings ("R100Critic1 W1", "R100Critic1 W2"), yet it is already inside the freeze commit `468c2b94`
(committed 03:15:17), which *precedes* the wave dispatch (`w1.ready.dispatched` 03:17:23). `plans/round-100.md`
has mtime 03:09:49, before the wave existed, while `R100Critic1.md` was written at 03:19:05 — so the amendment
names findings that did not exist when the file was written. The substance is not in doubt: R100Critic1's own
report (now present) reaches the same two conclusions A1 records ("Narrowest true restatement (same as
Amendment A1 §2)"; W1 confirmed as a history-sentence issue), and the scored run had `launchFailed []` so
neither clause was exercised. What is anomalous is the ordering, not the content. I did not edit the plan;
reporting only.

## Out of scope / not done by this seat

- No `--live` run of my own: this seat has no assigned port triple (`w1-spec.json` assigns ports to
  R100Exec1/2/3, R100Revenger and R100Sentinel only), and the claim's `--live` evidence is the committed scored
  run, which I verified by sha256 instead.
- I did not write to `corpus/knowledge/`, `corpus/evidence/`, `plans/`, `scripts/`, `claims.json` or any lane
  file; no git/jj mutation; no commits; no background jobs; no chromium processes started (my seat started none).
- The `slice()`/`text()`/`stream()` reads, the 50 MB limit, four-or-more files, deeper `webkitdirectory`
  nesting and duplicate *path* basenames remain unmeasured (plan limit 4) — carried into the note's limits.

## Tooling

No installs or upgrades were performed; nothing was needed beyond the preinstalled `jq` (jaq 3.1.1), `node`
(v24.21.0), `curl` and `python3`. No pacman transaction was filed (none required).

VERDICT C1: neutral
