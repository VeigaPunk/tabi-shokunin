# R93Scribe — C1 knowledge note draft (round 93, w1)

Seat: R93Scribe (leaf scribe). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Base `192535d7ea519439ce42ec09b45038ed6756c709`; freeze `7a7f39f3f5be5acc43c66d13f4e018c268855df4`;
scored `bf0bd62299c2c317eea9337c5dddc8a46dba1233`. Claim C1, predicate `C1-CROSS-SESSION-ANSWER-R93`.
Read-only seat: nothing frozen was edited; no chromium launched; no ports taken.

## What I drafted

- `.ufo/waves/round-93/w1/R93Scribe-note.md` — the knowledge note, for the L1 to integrate as
  `corpus/knowledge/chromium-oopif-backendnode-scope-round-93.md`. Header shape matches the r92 note
  (`source:` / `verified-at:` / `recheck:` front-matter lines, then the same section skeleton:
  fixture → measured table → law → Blink explanation → practical rule → limits → not-measured →
  evidence).
- `.ufo/waves/round-93/w1/R93Scribe-sources.json` — my own re-fetch check of the two cited Blink
  sources against the staged copies (upstream sha256 == staged sha256 == `sources/sha256.txt`), plus
  the located quotes and their line ranges.

## Which numbers came from where

Every number in the note is quoted from a committed file; the jq that prints it is printed beside
it. Sources:

| number in the note | file | jq / command |
|---|---|---|
| `verdict clean`, `checkCount 101`, `findings []`, `mode live`, nonce, driver pin | `.ufo/waves/round-93/scored/c1-live.json` | `jq -c '{verdict,mode,checkCount,findings:(.findings|length),nonce,driverSha256}'` |
| schema, `chromium "Chromium 155.0.8059.84 Arch Linux"`, `crossHost localhost`, `reps 3`, `answer {name,size 22}`, `ports {19361,19362,19363}`, `failures []` | `.ufo/waves/round-93/scored/live-receipt.json` | `jq -c '{schema,nonce,chromium,crossHost,reps,answer,ports,failures:(.failures|length)}'` |
| the six per-leg rows (session, B, describeChooser/describePage nodeName, pierce count, crossAnswer error, filesAfterCross, answer session/error, childFiles) | same receipt | `jq -r '.legs[]|[.leg,(.attached|length),(.browserIframeTargets|length),.choosers[0].session,(.choosers[0].backendNodeId|tostring),.describeChooser.nodeName,.describePage.nodeName,(.pagePierceInputS|tostring),(.crossAnswer.error//"null"),(.filesAfterCross|tostring),.answer.session,(.answer.error//"null"),(.childFiles|tostring)]|@tsv'` |
| attached / listed `iframe` target counts per arm (1/1 vs 0/0) | same receipt | `jq -r '.legs[]|[.leg,(.attached|length),(.browserIframeTargets|length)]|@tsv'` |
| 101 = 11 receipt-level + 15/leg × 6 | `scripts/check-cross-session-answer-round93.mjs` (check ids read at lines 108-165) | grep of `check(` call sites; corroborated by `R93Reviewer.md` item (7) |
| exact error string, `CROSS_ERROR` | `scripts/check-cross-session-answer-round93.mjs:41` + receipt `crossAnswer.error` | — |
| instrument sha256 (driver/counter/battery) | `.ufo/waves/round-93/controls/instrument-sha256.txt` | `cat` |
| controls: base rc 128, r92-receipt rc 1, wrong-site rc 1, positive rc 0/101/0, setup rc 2, battery 65/65 | `.ufo/waves/round-93/controls/rc.txt` + the `counter-*.json` / `battery.json` | `jq -c` on each control json |
| S231 / S232 source lines and quotes | `.ufo/waves/round-93/sources/inspector_dom_agent.cc` (645-649, 1806-1809), `dom_node_ids.cc` (18, 21-26, 28-34, 48-61, 69-78) | `grep -n`; re-fetched upstream, sha256 match (see `R93Scribe-sources.json`) |
| parent-`#document` identity of the page session's B (marked as a w1 probe, outside the claim) | `.ufo/waves/round-93/w1/R93Critic3.md` + `R93Critic3-results.json` | read, not re-run |

Nothing in the note is a number I invented; the note carries the jq beside each block.

## Commands I ran (exit codes)

```
sha256sum .ufo/waves/round-93/sources/{dom_node_ids.cc,dom_node_ids.h,inspector_dom_agent.cc}
  vs .ufo/waves/round-93/sources/sha256.txt                                    → all 3 match, rc 0
curl -fsSL https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/dom/dom_node_ids.cc?format=TEXT | base64 -d | sha256sum
  → 33f40333b67fb9a00071dcd69131671ac007da23c3755f0c2777bcbdb4d40e3b  (== staged)   rc 0
curl -fsSL .../inspector/inspector_dom_agent.cc?format=TEXT | base64 -d | sha256sum
  → e7c983b4b00f47757dbb29c69a129693b8ac61a2e0e60643aa124bbae203c84f  (== staged)   rc 0
node scripts/check-cross-session-answer-round93.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 a0deddda855a3eb48f9dd02f6d01eee0f607e9ab319dd74c6182c1d9ecc9a4a0 \
  --receipt .ufo/waves/round-93/scored/live-receipt.json --expect-nonce tabi-r93-live-b39038e077b0 --json
  → verdict clean, checkCount 101, findings [], revision bf0bd62299c2…   rc 0
```
The last command is the note's `recheck:` line (receipt mode, file-only). I did **not** run the
claim's `--live` counting command — no browser was launched by this seat (no ports assigned to
R93Scribe; the scored `--live` run and the wave reproductions are the executors' evidence).

## Adversarial read of the frozen wording (for the canonical judge)

I re-read `plans/round-93.md` §Claim and §Declared limits and the committed scored receipt, looking
for anything that makes the *stated wording* (not just its numbers) false:

- "names a `#document` node (describeNode)" — receipt `describePage` = `{session:"page",
  error:null, nodeName:"#document"}` in all 3 X legs; `error` is null, so no "No node found"
  branch was taken. Consistent.
- "fails with exactly `Node is not a file input element`" — string equality in all 3 X legs; the
  counter compares the exact string (`CROSS_ERROR`, counter line 41/157). Consistent.
- "with no file delivered" — `filesAfterCross` is `[]` in all 3 X legs. Consistent.
- "on the iframe session B is the INPUT and the answer works" — `describeChooser` =
  `INPUT`/`type=file`/`id=s` on the iframe session; `answer.session == "iframe"`, `answer.error ==
  null`; `childFiles == [["tabi-r93-answer.txt",22]]`. Consistent.
- "in the same-site arm B on the page session is the INPUT" — S legs: `describePage` = `INPUT`
  with `type=file, id=s`; `pagePierceInputS == 1`; no cross answer; page-session answer no error.
  Consistent.
- Everything else in the predicate (targets, chooser count/frame/B>0, click, browser version,
  6 distinct browser ids, receipt identity) is present in the committed receipt as written.

One wording caveat I want on the record (it does **not** falsify the claim): the predicate says the
page session "names a `#document` node" and **does not** say *whose* document — declared limit 3
says exactly that, and the counter binds only `describePage.nodeName === '#document'`. My note keeps
that separation: the parent-document identity appears as a labelled w1 probe (R93Critic3), explicitly
marked outside the frozen wording. The note does not silently upgrade limit 3 into a claim clause.
(The same probe is also the basis for the note's "silently names a different node" phrasing — it is
an explanation of *why* the page session sees a `#document`, not a bound fact.)

No wording, number, or limit in C1 was found false.

VERDICT C1: neutral
Artifact: .ufo/waves/round-93/w1/R93Scribe.md (note: .ufo/waves/round-93/w1/R93Scribe-note.md;
source check: .ufo/waves/round-93/w1/R93Scribe-sources.json)

## Out of scope / not done by this seat

- No `--live` browser run (leaf scribe; no port triple assigned) — the note's `recheck:` line is the
  receipt-mode command, and it is labelled as such in the note's §Evidence.
- No edit to the plan, `claims.json`, the driver, the counter, the battery, pins, controls, or the
  scored receipt. No git/jj mutation. No commit.
- No `corpus/SOURCES.md` row for S231/S232 was added by me — that registry edit is the L1's or the
  source seat's call; I only verified the two digests.

## Tooling

No installs or upgrades were needed. `curl`, `base64`, `sha256sum`, `jq`, `node` from the host base
install; no pacman transaction (pacman is paused host-wide), no `sudo`, no host service restart, no
sysctl change.

## Scratch

`/fast/scratch/hyaku/tabi-r93/R93Scribe` created for the upstream fetches, removed before yield.
No chromium process was started by this seat; `pgrep -f "remote-debugging-port=1936"` was empty
(no port of mine was ever opened).
