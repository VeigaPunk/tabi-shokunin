# ScoutWakeEvidence — W1 wake/event counts vs the 64 w1/*.md reports

Item: W1 wake/event history (`.ufo/waves/round-22/w1-event-history.json`, `w1-returns.json`,
`w1-outcomes.json`): counts of completed/errored seats and provider errors vs the `w1/*.md`
reports present; any seat without a report.
Revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (read only via `git show`).
Seat: `TabiR22-2.ScoutWakeEvidence-16` (leaf).
Mode: static review. No lane script was executed, no browser, no VCS mutation of lane/fleet,
no seat messaging/revival. Only this report was written.

## Verdict

Seat, completion, error and report counts all check out: **64/64 seats have a report**, every
declared report digest matches the committed blob, and the 72 error events classify exactly as
3/22/24/23. The substantive defect is in the **message/wake branch** of the event history: the
same 64 owned transcripts contain **15** inbound IRC message records — 7
`custom_message/irc:incoming` peer messages plus **8 user-role parent-channel records**
(`[Wait interrupted by message] <irc from="parent" agent="TabiR22"> …`) — but
`w1-event-history.json` retains only the 7 `irc:incoming` ones. The 8 omitted parent messages
are the L1's own delivered messages; three of
them immediately precede (by 21–252 ms) the three `unsupported_native_inflight_message`
errors, and all eight reappear as user-role injections in the recipients. The event history is
therefore a complete error/exit inventory but an incomplete message inventory. Secondary
defects: a raw provider message used as an `errorClassCounts` key, and a per-seat "completed"
count that reads like a dispose count.

## Axes

1. **Count fidelity** — every declared integer recomputed independently from the source
   transcript JSONL and the committed blobs.
2. **Report presence/identity** — 64 seats ↔ 64 assigned paths ↔ 64 committed report blobs
   ↔ 64 declared digests.
3. **Evidence completeness/reproducibility** — can a later auditor reproduce each number, and
   is each channel (error, exit, message) as complete as its source transcripts?

## Exercised commands (exit codes)

| Command (abridged) | Exit |
|---|---|
| `git -C <lane> log --oneline -5 e3cf4e0…` / `git show --stat e3cf4e0…` | 0 |
| `git -C <lane> ls-tree -r --name-only e3cf4e0… .ufo/waves/round-22/w1/` | 0 |
| `git -C <lane> show e3cf4e0…:<path> \| sha256sum` for all 64 report blobs | 0 |
| `jq` structural/count queries on `w1-event-history.json`, `w1-returns.json`, `w1-outcomes.json`, `w1/swarm-registry.json` | 0 |
| `python3` recomputation over the 64 transcripts + artifacts (counts, set equality, digest checks, record-shape inventory) | 0 |
| `grep -lF <intent>` over `TabiR22/*.jsonl` for the eight parent intents | 1 (0 files — misleading: the injected body does not repeat the intent line) |
| `grep -lF <body phrase>` over `TabiR22/*.jsonl` (e.g. `semantic-expectations.json schema`, `Pre-measurement classification correction`) | 0 (found BuildOracle/BuildSelftest records; superseding check) |
| `grep -rl <body phrase> . --exclude-dir=.git` over the lane | 1 (0 files; parent bodies are not retained as lane artifacts) |
| first `comm` over `ls`/`git` lists without `LC_ALL=C` | 1 (sort-order error; rerun with `LC_ALL=C`, exit 0) |
| one `xargs stat` batch on repo-relative report paths from the `.ufo/waves/round-22` cwd | 123 (path/cwd error; replaced by `git show` blob sizes, exit 0) |
| `grep -rn "completedStopSnapshots\|deadSeats\|assistantErrorEvents"` repo-wide | 1 (no consumer outside the producer artifacts and LOG) |

No tools installed or upgraded. No `run-checks.py`, `measure-c1.mjs`, `selftest-c1.mjs` run;
their check semantics are outside this item and are not claimed here.

## Independently recomputed counts

Set equality first: registry `w1/swarm-registry.json` members = 64; `w1-returns.json` seats =
64; `w1-event-history.json` seats = 64; `w1-spec.json` items = 64; the four name sets are
identical (0 diffs either way). Exactly 64 `TabiR22.*.jsonl` transcripts exist anywhere under
`~/.omp/agent/sessions`; the `TabiR22/` directory holds those 64 `.jsonl` plus the 64
`w1/*.md` reports, nothing else. Every seat's captured `reportPath` equals the absolute path
assigned in its `w1-spec.json` prompt ("Only report output: …"), 0 mismatches.

| Claim (source:line) | Recomputed | Verdict |
|---|---|---|
| `freshSeats: 64` (`w1-outcomes.json:3`) | 64 registry members / 64 returns seats / 64 event seats / 64 spec items | match |
| `completedStopSnapshots: 64` (`w1-outcomes.json:4`) | 64/64 seats have ≥1 assistant `stop` before `readAt` (`w1-returns.json:4`) and a non-empty returned output | match per seat; see F3 |
| `deadSeats: 0` (`w1-outcomes.json:5`) | all 64 seats: last assistant event is `stop` (not error); each produced an output and a report | match (0 dead) |
| `assistantErrorEvents: 72` (`w1-outcomes.json:6`) | `errors` arrays total 72; `events[kind=assistant-error]` total 72; per-seat arrays agree 64/64 | match |
| `errorClassCounts` sum 72 (`w1-outcomes.json:7-12`) | independent classification: 3 native-in-flight / 22 weekly-limit / 24 Devin `resource_exhausted` / 23 Zai 1302 | counts match; key shape fails, see F2 |
| `retryExhaustedEvents: []` (`w1-outcomes.json:13`) | 0/72 error messages contain "Retry budget exhausted" | match |
| `replacementSeats: 0` (`w1-outcomes.json:14`) | `w1-validation.json` spawn=64, resume=0, `resumeSends: []` | match |
| `notYetDisposedAtSnapshot` = 1 seat (`w1-outcomes.json:16-18`) | exactly 63 `session_exit` records; ReviewChronology has none at snapshot time | match |
| "64 hashed reports" (`LOG.md:1568`) | 64 distinct non-null `reportSha256`; each equals the SHA-256 of the report blob at the revision; 0 mismatches | match |
| "7 live peer messages" (`LOG.md:1572`) | 7 `irc:incoming` events: BuildSelftest→BuildOracle ×3, BuildOracle→BuildSelftest ×3, ConnProvince→BuildDebt ×1; all `broadcast=false`; body SHA-256 and sender match; all before the recipient's exit | literal match for `irc:incoming` records; **undercounts total inbound message records 15 → 7**, see F1 |
| "no broadcast was sent by this lane" (`LOG.md:1573-1574`) | no `write` to `agent://all` in the W1 parent transcript; the `agent://all` text hits are instructions or round-21 report text | match |
| exits are all `dispose/normal` | 63/63 `session_exit` records carry `reason=dispose, kind=normal`; latest 15:21:00.238Z (AttackInputTypes) | match |

Derived figures the artifacts do **not** state (useful for any later audit):

- **Errored seats: 52 of 64.** Distribution: 0 errors on 12 seats, 1 error on 32 seats,
  2 errors on 20 seats. All 20 double-error seats are `devin → zai1302` in that order; no
  seat repeats a class.
- Class → distinct seats: native-in-flight 3, weekly-limit 22, Devin 24, Zai 23 (one event
  per seat in every class). Error model/provider pairing is uniform per class:
  `openai-codex/gpt-6-luna` 3, `commandcode/deepseek/deepseek-v4.1-flash` 22,
  `devin/swe-2` 24, `zai/glm-5.3-flash` 23.
- Raw assistant `stop` turns: **65**, not 64 — BuildSelftest stops twice
  (15:06:05.702Z and 15:06:39.999Z, transcript lines 139/141) before its single dispose.
  `completedStopSnapshots: 64` is therefore a per-seat count and cannot be reproduced by
  counting `stop` records.
- Reports: 64/64 present, 64 unique paths, total 1,227,518 bytes (mean ≈19,179); the `w1/`
  tree at the revision is exactly 64 `.md` + `swarm-registry.json`.
- Inbound IRC message records present in the 64 transcripts: **15** = 7 `irc:incoming`
  (recorded) + 8 parent-channel user-role records (not recorded), see F1. One additional
  `custom_message` in a seat is a `system-notice/async-result` background-job notice, not a
  peer message.

## Findings

### F1 — Eight inbound parent-channel messages are absent from the event history (actual bug: message/wake channel incomplete)

Where: `.ufo/waves/round-22/w1-event-history.json` (its `events[kind=message]` inventory) at
`e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`; source records are in the same 64 owned
transcripts it names, shape `type=message, role=user,
content="[Wait interrupted by message] <irc from=\"parent\" agent=\"TabiR22\"> … </irc>"`.

The parent L1 (`TabiR22`) sent eight messages to three seats. Each write has a non-empty body
(252–621 chars) and a sender result "Delivered to <seat>."; each then appears in the recipient
transcript as a user-role parent-channel record:

| Seat | Parent write delivered (sender result) | Recipient record (line, at) | Recipient body chars |
|---|---|---|---|
| BuildSelftest | 14:51:33.084Z | line 55, 14:51:33.539Z | 491 |
| BuildOracle | 14:52:12.476Z | line 93, 14:52:12.994Z | 337 |
| BuildDebt | 14:55:48.711Z | line 62, 14:55:49.840Z | 670 |
| BuildSelftest | 14:55:20.189Z | line 96, 14:56:14.940Z | 624 |
| BuildOracle | 14:56:08.937Z | line 138, 14:56:12.438Z | 694 |
| BuildOracle | 14:56:39.109Z | line 150, 14:57:08.812Z | 679 |
| BuildSelftest | 15:04:34.376Z | line 132, 15:04:48.759Z | 385 |
| BuildSelftest | 15:05:41.869Z | line 140, 15:06:05.704Z | 325 |

`sender ledger = /home/vgpnk/.omp/agent/sessions/-Projects-shokunin/2026-10-21T03-31-39-302Z_01a15c83-baa6-76c9-b209-ce1123c6cc22/TabiR22.jsonl`
(toolCall message / tool_execution_start / toolResult triples at lines 156–158, 173–175,
212–214, 220–222, 228–230, 238–240, 313–315, 348–350; bodies are retained only in the
toolCall arguments).

None of the eight is retained by `w1-event-history.json`: its `message` events total **7** and
their senders are only `BuildSelftest` (3), `BuildOracle` (3), `ConnProvince` (1) — zero from
`TabiR22`. The retained events correspond one-for-one to the 7 `custom_message/irc:incoming`
records; the user-role `[Wait interrupted by message]` shape that the harness uses for
parent-channel delivery is not represented. The same 64 transcripts therefore contain **15**
inbound IRC message records while the artifact reports 7. A further `custom_message` inside a
seat is a `system-notice/async-result` job notice, not an inbound peer message and not counted
here. `LOG.md:1572` ("7 live peer messages") reports only these and does not
note the eight parent-channel deliveries, so the wave record reads as seven total messages
while a later auditor counting the same transcripts finds fifteen.

Sharpest counterexample — the missing messages are temporally adjacent to recorded errors: the
three `unsupported_native_inflight_message` errors follow three of these deliveries by tens of
milliseconds, matching the error text ("cannot accept stateful WebSocket messages while
a native turn is running"); the delivery attempt errors; the same message is re-injected
as a user-role record 0.4–0.9 s later. Order is observed; cause is not established here.

| Seat | Parent write delivered | Recorded assistant error | Recipient parent record |
|---|---|---|---|
| BuildSelftest | 14:51:33.084Z | 14:51:33.105Z (+21 ms) | 14:51:33.539Z |
| BuildOracle | 14:52:12.476Z | 14:52:12.507Z (+31 ms) | 14:52:12.994Z |
| BuildDebt | 14:55:48.711Z | 14:55:48.963Z (+252 ms) | 14:55:49.840Z |

In BuildDebt the same instant *is* represented by a different sender: ConnProvince→BuildDebt
`irc:incoming` at 14:55:48.725Z is in the event history, while the L1's own message 14 ms
earlier is not.

Preserving positive: every one of the 7 retained `irc:incoming` events is individually correct
(body SHA-256, sender, broadcast-absence, delivery-before-exit all verified); the error
inventory (72), the class counts (3/22/24/23) and the exit inventory (63 dispose/normal) are
complete and unchanged by this finding; the 8 omitted messages are all present in the source
transcripts and therefore recoverable without the parent session store.

Smallest fix: extend the `message` extraction (or a sibling `parentMessages` array) to
user-role records whose text starts `[Wait interrupted by message]` and whose wrapper carries
`<irc from="parent" agent="TabiR22">`; record `{to, at, from:"TabiR22", bodySha256, deliveredAt}`
from the wrapper and the sender ledger. Then either the total message count is 15, or the field
is explicitly labelled `ircInboundMessages: 7`. Amend `LOG.md:1572` to state "7 peer-to-peer
`irc:incoming` + 8 parent-channel delivered messages, 3 preceding native-in-flight errors".
No error/exit count changes.

### F2 — `errorClassCounts` uses a raw provider message as a class key (actual bug, low)

Where: `.ufo/waves/round-22/w1-outcomes.json:11`.

The fourth key is
`"429 Rate limit reached for requests\nRate limit reached for requests (type=1302)"` — the
first two lines of the Zai error message, embedded literally (with a newline), not a class
label, and truncated before the message's `param=RATE_LIMITED` tail.

Smallest counterexample: `jq -r '.errorClassCounts|keys[]' w1-outcomes.json` returns a key
containing a newline, while the sibling keys at lines 8-10 are normalized names
(`native_inflight_message`, `weekly_rate_limit`, `devin_resource_exhausted`). A consumer that
groups by class renders a message blob as a class; a consumer that matches `zai`/`1302`
finds nothing.

Preserving positive: the value **23 is correct**. Independent classification of all 72 error
records yields exactly 23 Zai 1302 events, 22 weekly-limit, 24 Devin, 3 native-in-flight,
and the four values still sum to 72. `LOG.md:1571` already names the class "Zai1302".

Smallest fix: replace the key with `zai_1302_rate_limit` (value 23 unchanged). No recount.

### F3 — `completedStopSnapshots` reads as a dispose count but is a per-seat output count (definitional gap, not a count error)

Where: `w1-outcomes.json:4` (`"completedStopSnapshots": 64`) together with
`w1-outcomes.json:16-18` (`notYetDisposedAtSnapshot: ["TabiR22.ReviewChronology"]`).

At the stated observation window there are **63** `session_exit` records and one seat with no
exit. ReviewChronology's final assistant `stop` is 15:31:56.454Z (transcript line 383); its
dispose record is 15:38:56.493Z (line 384), after both the event snapshot and the returns
read. The number 64 is correct only as "one final output per seat"; it is not reproducible
from exit records (63) or from stop records (65, because BuildSelftest stops twice).

Smallest counterexample: count `session_exit` events → 63; read `completedStopSnapshots` → 64.
Both are true under different definitions, and the field name does not say which.

Preserving positive: every one of the 64 seats has a stop before `readAt` and a non-empty
returned output, so "64 completed outputs" is supported; `LOG.md:1568-1572` states the nuance
correctly ("At that snapshot63 dispose records existed; ReviewChronology had returned but not
yet disposed").

Smallest fix: add `"disposedSeats": 63` beside line 4 (or rename line 4 to
`perSeatStopOutputs`). Leave both numbers; do not recount.

### F4 — completion-notification evidence is split across two mechanisms (informational; note is true, single-source reproduction fails)

Where: `w1-returns.json:7`: "All64 completion notifications observed before capture…".

The parent transcript contains `task-result … status="completed"` records for **64 distinct
seat ids**, the latest first appearing at 15:31:56.482Z (ReviewChronology), i.e. before the
capture call (15:32:20Z) and the recorded `readAt` (15:33:51.020769Z). So the note is true.
However the 33 `async-result` background notices name only **50** of the 64 seats; the other
14 completions (e.g. RevInvoke, RevPreservation, Semantic01, Semantic07, Semantic09,
AttackChronology, AttackDelayed, AttackHashLinks, AttackRawSummary, AttackWindows,
CriticNoHarm, Raw03, Raw06, ReviewChronology) have their completion records only inside
`wait` snapshot tool results (RevInvoke completed in the snapshot at 15:09:22.566Z). An
auditor counting only `async-result` records
undercounts 64 → 50 and would wrongly flag 14 missing notifications.

Smallest fix (documentation): in `w1-returns.json:7`, name both mechanisms or add
`"completionRecords": 64`. No value changes.

### F5 — observation-window overstatement (cosmetic)

`w1-outcomes.json:15` says `observedThrough: 2026-10-21T15:34:39.137423Z`, 16 s after the
event snapshot (`w1-event-history.json:4`, 15:34:23.370631Z). No exit, error or message falls
in that gap (latest exit 15:21:00.238Z), so no count is affected. Smallest fix: set
`observedThrough` to the event snapshot time or record the recheck separately.

## Transcript-digest spot check (positive)

`w1-event-history.json` claims "exact source-byte digests". 63 of 64 transcript SHA-256 values
still match today; the only divergence is ReviewChronology, which grew from 1,448,695 bytes /
383 lines to 1,448,934 bytes / 384 lines because its post-snapshot `session_exit` was appended.
This confirms the disclosed "not-yet-disposed" state rather than a rewritable record. Every
transcript source path exists, is unique per seat, and its basename matches the seat id;
`errors[].line` and `events[].line` are within each transcript's recorded line count (0
anomalies); all 7 retained message digests match.

## Remaining unknowns

- Whether the extractor intentionally scoped `message` to `irc:incoming`. The artifact's scope
  sentence ("only model/error/message/exit metadata retained") does not say so, and the eight
  parent records are messages in the same transcripts; absent an explicit definition, 7 is an
  undercount of the message channel.
- Non-author authenticity of the reports and the returns snapshot is not assessable from these
  artifacts (out of scope; author-side falsification only). Digest equality proves the committed
  report bytes are the bytes the returns snapshot names, not who authored them.
- `w1-outcomes.json` has no `erroredSeats` field, so 52 is a derived figure, not a claim; no
  downstream artifact was found that depends on it.

## Net falsification result

Seat/completion/report counts are sound: 64/64 reports present, assigned, committed and
digest-matched; 72 error events classifying as 3/22/24/23; 0 retry-exhausted; 0 dead;
0 replacements; 63 dispose/normal + 1 disclosed post-snapshot dispose. The falsified claim is
the completeness of the **message/wake** channel: 7 retained vs 15 inbound message records in
the same 64 transcripts, the 8 missing ones being the L1's own delivered parent-channel
messages, 3 of which immediately preceded native-in-flight errors (F1). F2 is a real
low-severity key-shape bug; F3–F5 are definition/wording gaps with no numeric effect.
