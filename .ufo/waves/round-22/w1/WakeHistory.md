# Round-21 W1 — registered wake and terminal-event history (64 IDs)

Scope: read-only extraction from the registered transcript store. Question: what peer and
broadcast wake events, and what later terminal events, are actually recorded for the 64
round-21 W1 agent IDs named by the prior registry. No event below is reconstructed; each row
cites a record that exists in a transcript or wave artifact.

Verdict (short):

- **One broadcast wake exists**: Main's `agent://all` routing update, sent
  2026-10-21T12:43:48.089Z, delivered to **55 of the 64 W1 IDs** at 2026-10-21T12:43:47.993Z.
  The sender-side ledger labels 28 "woken" / 27 "injected"; receiver-side transcripts show
  **23 of the 55 were in a retry-exhausted terminal state** at delivery (16 next bursts did
  work, 7 exhausted again).
- **Peer traffic is 46 messages on 8 seats**: 36 requests + 10 "Wake turn failed" notices.
  Only **9** of those 46 were delivered to a terminal (exhausted or disposed) seat: **8 next
  bursts failed, 1 produced work** (BuildCounter, 13:09:31, after its first dispose).
- **Post-dispose peer wakes hit 2 seats in 3 events**: BuildSelftest ×2 (both failed),
  BuildCounter ×1 (worked). The historical artifact `w1-failures.json`
  `unexpectedPeerRevivals` lists only BuildRuntime and BuildCounter — **BuildSelftest is
  omitted**, and BuildRuntime was never post-dispose before its single exit.
- **Terminal events**: 66 `session_exit` records, all `reason=dispose, kind=normal`, across
  all 64 seats; 2 seats exited twice (BuildSelftest, BuildCounter). Earliest 12:43:04.473,
  latest 13:19:45.708.
- The parent's 12:56:27 message "Peers later revived you by message" is **not supported as
  causation** for BuildRuntime/BuildCounter: every peer message to those two seats before
  12:43:47 was followed by a retry-budget-exhausted burst; the first normal turns follow the
  Main broadcast by ~6 s. Only ordering is observed, not cause.

## Sources (exact paths)

| What | Path |
|---|---|
| Prior registry, 64 W1 IDs | `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/w1/swarm-registry.json` (schema `ufo-swarm-registry-v1`) |
| Registry envelope (createdAt 2026-10-21T12:35:45.304Z) | `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/w1-record.json` |
| Historical failure list / revival claim | `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/w1-failures.json` |
| Historical revival detail | `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/peer-revival.json` |
| Historical returns read (13:15:40Z) | `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/w1-returns.json` |
| W1 transcripts (64 files, one per ID) | `/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/2026-10-21T03-31-39-302Z_01a15c83-baa6-76c9-b209-ce1123c6cc22/TabiR21/TabiR21.<seat>.jsonl` |
| Parent task transcript | `/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/2026-10-21T03-31-39-302Z_01a15c83-baa6-76c9-b209-ce1123c6cc22/TabiR21.jsonl` |
| Main (top-level) transcript, broadcast sender | `/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/2026-10-21T03-31-39-302Z_01a15c83-baa6-76c9-b209-ce1123c6cc22.jsonl` |

Partition check: that directory holds 128 `TabiR21.*.jsonl` files. The 64 registry IDs all
have a file (0 missing); the other 64 map exactly to the round-21 **w2** registry
(`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/w2/swarm-registry.json`,
set equality, 0 unmatched both ways) and are out of scope here. No other
`TabiR21.*.jsonl` exists anywhere under `/home/vgpnk/.omp/agent/sessions`
(`find -name 'TabiR21.*.jsonl'` returns only this directory).

## Record shapes used (verified in the transcripts)

- Inbound message: `{"type":"custom_message","customType":"irc:incoming","timestamp":...,
  "details":{"id","from","message","broadcast"?}}`. Broadcast deliveries carry
  `"broadcast": true`; peer messages do not.
- Outbound peer send: `custom`/`tool_execution_start` with `data.toolName="write"` and
  `data.args.path="agent://TabiR21.<target>"` (body is not in `args`; no `content` field).
- Parent-channel interrupt: a `message` with `role="user"` whose text starts
  `[Wait interrupted by message]\n<irc from="parent" agent="TabiR21">`.
- Terminal: `custom`/`session_exit` with `data:{reason:"dispose",kind:"normal",recordedAt}`.

## Definitions used (so the numbers are falsifiable)

- **State at delivery** (computed by *timestamp*, not line order): `dead_exhausted` = the last
  assistant event before delivery was an error whose text contains "Retry budget exhausted"
  and no work followed; `post_exit` = a `session_exit` precedes delivery with no assistant
  event after it; `retrying` = last assistant event was a non-terminal error; `idle_alive` =
  last was `stop`; `working` = last was `toolUse`; `none` = no assistant event yet.
- **Wake** = delivery whose state is `dead_exhausted` or `post_exit`.
- **Next-burst outcome**: `work` = the first assistant event after delivery, before the next
  message/exit, is `toolUse` or `stop`; `failed` = that burst reaches a
  "Retry budget exhausted" error first. "work" is turn activity, not task success.
- **Terminal event** = a `session_exit` record; first terminal error = first assistant error
  containing "Retry budget exhausted".

## Findings

### F1. Broadcast wake (Main → `agent://all`)

Main transcript, line 2378: `write` to `path:"agent://all"`, intent "Broadcasting updated
role routing", `startedAt` **2026-10-21T12:43:48.089Z**. Sender result at 12:43:48.353Z:
"Broadcast delivered to 223 of 223 peer(s)." with a per-agent list; the **55 W1 entries** in
that list are 28 `woken` + 27 `injected`, and the 9 W1 IDs absent from the list are exactly
the 9 seats that had already disposed before 12:43:47 (ScribeLessonInputs 12:43:04.473, seven
critics 12:43:17–12:43:19, BuildSelftest 12:43:18.126).

Body observed identically in all 55 recipients (recipient `details.message`): "Routing update
(session-only, applies to FRESH seats; already-running seats keep their captured routes):
reviewer → @m_swe; scout → @m_auto; critic → @m_auto; connector stays @m_auto. … This moves
reviewer+scout+critic load off the saturated zfl/luna/codex paths."

Delivery timestamps are identical for all 55 recipients (12:43:47.993Z); message ids are
unique per recipient (`15aeeca2e669808d` … `15aeeca2e66980c3`), listed in Table 1.

Cross-tab, hub label × receiver state at delivery:

| Hub label | dead_exhausted | idle_alive | retrying | working |
|---|---|---|---|---|
| woken (28) | 23 | 5 | 0 | 0 |
| injected (27) | 0 | 0 | 25 | 2 |

So "woken" in the hub ledger means "was not in a live turn"; it does **not** mean the seat was
terminal. 23 broadcast deliveries meet the strict wake definition (16 next-burst `work`,
7 `failed`).

### F2. Peer traffic (46 messages, 8 seats)

36 requests + 10 notices. Notices are the woken seat's own failure report back to the sender,
text beginning "Wake turn failed: [openai-codex/gpt-6-luna] Retry budget exhausted after 5
retries…", and are themselves inbound records on the sender's transcript. Per recipient:
BuildRuntime 18 (18 requests / 0 notices), BuildCounter 15 (13/2), BuildSelftest 2 (2/0),
ReviewFreshContext 2 (2/0), ReviewActivation 4 (0/4), ConnPlanner 2 (0/2), ConnSibling 2
(0/2), ReviewThrow 1 (1/0). All 46 are in Table 2 with id and timestamp.

Only 9 of the 46 were delivered to a terminal seat (7 `dead_exhausted`, 2 `post_exit`):
1 worked (BuildCounter 13:09:31), 8 exhausted again. The other 37 were delivered mid-turn
(`working`/`retrying`) or to an idle-alive seat and are not wakes.

### F3. Post-dispose wakes — the historical correction

Three events on two seats:

| Delivered (UTC) | Seat | Sender | Message id | State | Outcome |
|---|---|---|---|---|---|
| 2026-10-21T12:45:45.975Z | BuildSelftest | TabiR21.BuildCounter | `15aeed161de9814c` | post_exit (exit 12:43:18.126) | failed burst |
| 2026-10-21T12:50:58.752Z | BuildSelftest | TabiR21.BuildCounter | `15aeee47902982a4` | dead_exhausted (post-12:43:18 dispose; first revival's burst exhausted 12:45:59.582) | failed burst |
| 2026-10-21T13:09:31.080Z | BuildCounter | TabiR21.ReviewFreshContext | `15aef285d229860f` | post_exit (exit 13:03:39.640) | work (stop 13:09:52.199) |

BuildRuntime's sole `session_exit` is 13:16:41.062, i.e. *after* the inbound messages at
13:03:51.896 and 13:09:31.069; those two were delivered to an idle-alive seat, not post-exit.

Consequences for the historical record:

1. `w1-failures.json` `unexpectedPeerRevivals: ["BuildRuntime","BuildCounter"]` is incomplete:
   **BuildSelftest was also woken after dispose, twice**, by BuildCounter; both wake turns
   failed and it exited a second time at 12:58:12.794.
2. The parent message asserting "Peers later revived you by message" (BuildRuntime 12:56:27.189,
   BuildCounter 12:56:27.868) has no supporting peer-message revival: the eight peer deliveries
   to those two seats before 12:43:47 (12:38:27.108, 12:38:30.220, 12:38:38.276, 12:38:41.662,
   12:42:11.411, 12:42:11.423, 12:42:31.645, 12:42:35.515) each ended in a
   retry-budget-exhausted burst. The first normal turn follows the 12:43:47.993 broadcast
   (BuildCounter toolUse 12:43:52.717; BuildRuntime toolUse 12:43:54.742) with no
   model/credential change in between. Order is observed; cause is not established by these
   records.

### F4. Terminal events

66 exits, all `dispose/normal`; 62 seats exited once, 2 twice (BuildSelftest
12:43:18.126 + 12:58:12.794; BuildCounter 13:03:39.640 + 13:16:52.219). Per-seat exit
timestamps are in Table 1. Ordering by exit: 9 seats between 12:43:04 and 12:43:19 (the
pre-broadcast dispose group; BuildSelftest from that group was later woken post-exit), then
12:50:52 … 13:19:45.708 (ReviewBinding, last).

"Dispose" is a runtime-loop disposal, not proof the process is gone: BuildCounter accepted
and answered a message at 13:09:31, 5m51s after its 13:03:39 dispose.

### F5. Parent-channel interrupts (not peer/broadcast)

12 `[Wait interrupted by message]` user-role messages to 10 seats, 12:56:21.619–13:11:00.425:
BuildRuntime ×2 (12:56:27.189), BuildCounter ×1 (12:56:27.868), ReviewBinding ×2
(12:56:21.619, 13:11:00.425), and one each to ReviewCleanup, ReviewIdentity, ReviewInvalid,
ReviewPending, ReviewResponse (12:56:36.097–.177), RevCase05 (12:56:36.184), RevCase08
(12:56:36.299). Provenance in the parent transcript:

- `write` sends: 12:56:15.113 (BuildRuntime), 12:56:15.114 (BuildCounter), 12:56:15.115
  (ReviewBinding), 12:56:22.724 (BuildRuntime), 13:10:59.209 (ReviewBinding) — 5 messages.
- `eval` at 12:56:35.588, intent "Constraining remaining author-side reviews", result "sent to
  remaining owned reviewers only" — the 7 messages delivered at 12:56:36. The eval does not
  record per-target ids; the recipient set is the observed delivery set, not inferred beyond it.

### F6. Spawn/assignment coverage and work

- 64/64 have a `session_init` (12:36:01.920–12:36:03.417) and a user-role assignment
  (12:36:03.683–12:36:03.962). Spawn models: zai/glm-5.3-flash 50, openai-codex/gpt-6-luna 11,
  cursor/default 2, anthropic/claude-haiku-5-5 1.
- 46 seats record at least one `toolUse`; 18 never do. 47 record at least one `stop`.
- First retry-budget exhaustion is recorded on 42 seats; 23 of them were in that state at the
  broadcast delivery (all 23 are a subset of the 42). 41 seats record at least one fallback
  `model_change` to openai-codex/gpt-6-luna (`role:"fallback"`,
  `resolvedModelIsFallback:true`); only 2 seats (SrcForm07, ReviewPriorHistory) have their
  first `toolUse` after that change, so fallback is not a general explanation for first work.
- Historical list cross-check: of the 32 `originalFailedSeats`, 15 record at least one
  assistant `stop` before the 13:15:40Z returns read (BuildRuntime, BuildCounter, SrcForm05,
  SrcForm07, SrcForm15, SrcEventDocs, ReviewNonce, ReviewFreshContext, ReviewFlags,
  ReviewThrow, ReviewCountMeaning, ReviewPriorHistory, ReviewSourceLink, RevCase06, RevCase09);
  17 record none. 9 of those 17 received no broadcast at all.

## Table 1 — 64-ID ledger (registry order)

Times are UTC `HH:MM:SS.mmm` on 2026-10-21. `Wakes` = deliveries meeting the strict wake
definition; `work/failed` = next-burst outcome. `Peer in` = requests/notices (Table 2).
`Exits` = all `session_exit` timestamps. Agent id is `TabiR21.<Seat>`.

| # | Seat | Role | Spawn | Model@spawn | Assignment | First retry-exhausted | Wakes (delivered while dead/post-exit) | Wake next-burst work/failed | Broadcast id | Peer in req/notice | Exits (dispose/normal) | toolUse | stop | Last event |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | BuildRuntime | executor | 12:36:01.924 | `openai-codex/gpt-6-luna` | 12:36:03.686 | 12:36:17.492 | 4 | 1/3 | 15aeeca2e669808d | 18/0 | 13:16:41.062 | 24 | 4 | 13:16:41.062 custom |
| 2 | BuildCounter | executor | 12:36:02.011 | `openai-codex/gpt-6-luna` | 12:36:03.688 | 12:36:17.876 | 5 | 2/3 | 15aeeca2e6698090 | 13/2 | 13:03:39.640, 13:16:52.219 | 24 | 4 | 13:16:52.219 custom |
| 3 | BuildSelftest | executor | 12:36:01.969 | `openai-codex/gpt-6-luna` | 12:36:03.689 | 12:36:18.110 | 2 | 0/2 | - | 2/0 | 12:43:18.126, 12:58:12.794 | 0 | 0 | 12:58:12.794 custom |
| 4 | ConnPlanner | connector | 12:36:03.281 | `cursor/default` | 12:36:03.898 | - | 0 | 0/0 | 15aeeca2e66980c0 | 0/2 | 12:51:00.576 | 0 | 3 | 12:51:00.576 custom |
| 5 | ConnSibling | connector | 12:36:03.188 | `cursor/default` | 12:36:03.788 | - | 0 | 0/0 | 15aeeca2e66980bf | 0/2 | 12:50:58.415 | 0 | 3 | 12:50:58.415 custom |
| 6 | ScribeLessonInputs | scribe | 12:36:03.142 | `anthropic/claude-haiku-5-5` | 12:36:03.784 | - | 0 | 0/0 | - | 0/0 | 12:43:04.473 | 0 | 0 | 12:43:04.473 custom |
| 7 | SrcForm01 | scout | 12:36:03.001 | `zai/glm-5.3-flash` | 12:36:03.778 | 12:42:40.185 | 1 | 1/0 | 15aeeca2e66980b9 | 0/0 | 12:57:56.330 | 1 | 0 | 12:57:56.330 custom |
| 8 | SrcForm02 | scout | 12:36:02.841 | `zai/glm-5.3-flash` | 12:36:03.766 | - | 0 | 0/0 | 15aeeca2e66980b2 | 0/0 | 12:55:26.339 | 5 | 1 | 12:55:26.339 custom |
| 9 | SrcForm03 | scout | 12:36:02.701 | `zai/glm-5.3-flash` | 12:36:03.750 | 12:42:38.929 | 1 | 0/1 | 15aeeca2e66980ac | 0/0 | 12:52:47.597 | 0 | 0 | 12:52:47.597 custom |
| 10 | SrcForm04 | scout | 12:36:02.607 | `zai/glm-5.3-flash` | 12:36:03.754 | 12:42:36.945 | 1 | 0/1 | 15aeeca2e66980a8 | 0/0 | 12:57:21.952 | 0 | 0 | 12:57:21.952 custom |
| 11 | SrcForm05 | scout | 12:36:02.630 | `zai/glm-5.3-flash` | 12:36:03.747 | 12:42:38.347 | 1 | 1/0 | 15aeeca2e66980a9 | 0/0 | 13:03:50.666 | 6 | 1 | 13:03:50.666 custom |
| 12 | SrcForm06 | scout | 12:36:02.363 | `zai/glm-5.3-flash` | 12:36:03.709 | 12:42:39.219 | 1 | 0/1 | 15aeeca2e669809e | 0/0 | 12:57:20.475 | 0 | 0 | 12:57:20.475 custom |
| 13 | SrcForm07 | scout | 12:36:02.186 | `zai/glm-5.3-flash` | 12:36:03.694 | 12:40:18.591 | 1 | 1/0 | 15aeeca2e6698097 | 0/0 | 12:53:17.211 | 9 | 1 | 12:53:17.211 custom |
| 14 | SrcForm08 | scout | 12:36:02.162 | `zai/glm-5.3-flash` | 12:36:03.703 | - | 0 | 0/0 | 15aeeca2e6698096 | 0/0 | 12:59:54.438 | 8 | 1 | 12:59:54.438 custom |
| 15 | SrcForm09 | scout | 12:36:01.951 | `zai/glm-5.3-flash` | 12:36:03.683 | 12:44:36.471 | 0 | 0/0 | 15aeeca2e669808e | 0/0 | 12:54:55.492 | 9 | 1 | 12:54:55.492 custom |
| 16 | SrcForm10 | scout | 12:36:02.285 | `zai/glm-5.3-flash` | 12:36:03.705 | - | 0 | 0/0 | 15aeeca2e669809b | 0/0 | 12:55:50.591 | 6 | 1 | 12:55:50.591 custom |
| 17 | SrcForm11 | scout | 12:36:02.261 | `zai/glm-5.3-flash` | 12:36:03.702 | - | 0 | 0/0 | 15aeeca2e669809a | 0/0 | 12:56:32.910 | 7 | 1 | 12:56:32.910 custom |
| 18 | SrcForm12 | scout | 12:36:02.113 | `zai/glm-5.3-flash` | 12:36:03.692 | - | 0 | 0/0 | 15aeeca2e6698094 | 0/0 | 12:54:47.960 | 8 | 1 | 12:54:47.960 custom |
| 19 | SrcForm13 | scout | 12:36:02.771 | `zai/glm-5.3-flash` | 12:36:03.765 | 12:46:46.875 | 0 | 0/0 | 15aeeca2e66980af | 0/0 | 13:03:21.764 | 7 | 1 | 13:03:21.764 custom |
| 20 | SrcForm14 | scout | 12:36:03.069 | `zai/glm-5.3-flash` | 12:36:03.780 | 12:47:03.256 | 0 | 0/0 | 15aeeca2e66980bc | 0/0 | 12:57:25.927 | 7 | 1 | 12:57:25.927 custom |
| 21 | SrcForm15 | scout | 12:36:02.955 | `zai/glm-5.3-flash` | 12:36:03.773 | 12:42:38.848 | 1 | 1/0 | 15aeeca2e66980b7 | 0/0 | 13:03:14.167 | 11 | 1 | 13:03:14.167 custom |
| 22 | SrcForm16 | scout | 12:36:01.994 | `zai/glm-5.3-flash` | 12:36:03.685 | - | 0 | 0/0 | 15aeeca2e669808f | 0/0 | 12:56:07.814 | 9 | 1 | 12:56:07.814 custom |
| 23 | SrcSubmitSpec | scout | 12:36:02.864 | `zai/glm-5.3-flash` | 12:36:03.768 | - | 0 | 0/0 | 15aeeca2e66980b3 | 0/0 | 12:55:20.951 | 8 | 1 | 12:55:20.951 custom |
| 24 | SrcEventDocs | scout | 12:36:02.933 | `zai/glm-5.3-flash` | 12:36:03.770 | 12:42:35.366 | 1 | 1/0 | 15aeeca2e66980b6 | 0/0 | 13:01:42.087 | 8 | 1 | 13:01:42.087 custom |
| 25 | SrcCdpContract | scout | 12:36:02.725 | `zai/glm-5.3-flash` | 12:36:03.759 | 12:42:38.952 | 1 | 0/1 | 15aeeca2e66980ad | 0/0 | 12:56:11.514 | 0 | 0 | 12:56:11.514 custom |
| 26 | SrcFlags | scout | 12:36:02.560 | `zai/glm-5.3-flash` | 12:36:03.748 | 12:48:39.268 | 0 | 0/0 | 15aeeca2e66980a6 | 0/0 | 13:02:08.599 | 5 | 1 | 13:02:08.599 custom |
| 27 | SrcPwInput | scout | 12:36:02.459 | `zai/glm-5.3-flash` | 12:36:03.745 | - | 0 | 0/0 | 15aeeca2e66980a2 | 0/0 | 12:56:10.525 | 11 | 1 | 12:56:10.525 custom |
| 28 | SrcPriorProbe | scout | 12:36:02.386 | `zai/glm-5.3-flash` | 12:36:03.711 | 12:42:39.912 | 1 | 0/1 | 15aeeca2e669809f | 0/0 | 12:56:11.394 | 0 | 0 | 12:56:11.394 custom |
| 29 | ReviewIdentity | reviewer | 12:36:02.138 | `zai/glm-5.3-flash` | 12:36:03.700 | - | 0 | 0/0 | 15aeeca2e6698095 | 0/0 | 13:08:18.405 | 11 | 1 | 13:08:18.405 custom |
| 30 | ReviewNonce | reviewer | 12:36:02.062 | `zai/glm-5.3-flash` | 12:36:03.693 | 12:42:38.827 | 1 | 1/0 | 15aeeca2e6698092 | 0/0 | 12:58:50.090 | 12 | 1 | 12:58:50.090 custom |
| 31 | ReviewRawInvoke | reviewer | 12:36:03.023 | `zai/glm-5.3-flash` | 12:36:03.775 | 12:45:49.538 | 0 | 0/0 | 15aeeca2e66980ba | 0/0 | 13:02:46.801 | 13 | 1 | 13:02:46.801 custom |
| 32 | ReviewPending | reviewer | 12:36:02.910 | `zai/glm-5.3-flash` | 12:36:03.769 | 12:43:50.221 | 0 | 0/0 | 15aeeca2e66980b5 | 0/0 | 13:09:13.289 | 14 | 1 | 13:09:13.289 custom |
| 33 | ReviewPreAction | reviewer | 12:36:02.887 | `zai/glm-5.3-flash` | 12:36:03.771 | - | 0 | 0/0 | 15aeeca2e66980b4 | 0/0 | 12:56:55.393 | 12 | 1 | 12:56:55.393 custom |
| 34 | ReviewCleanup | reviewer | 12:36:02.678 | `zai/glm-5.3-flash` | 12:36:03.756 | 12:46:13.395 | 0 | 0/0 | 15aeeca2e66980ab | 0/0 | 13:09:39.229 | 23 | 1 | 13:09:39.229 custom |
| 35 | ReviewFreshContext | reviewer | 12:36:02.482 | `zai/glm-5.3-flash` | 12:36:03.757 | 12:42:39.628 | 1 | 1/0 | 15aeeca2e66980a3 | 2/0 | 13:17:13.525 | 29 | 3 | 13:17:13.525 custom |
| 36 | ReviewFlags | reviewer | 12:36:02.536 | `zai/glm-5.3-flash` | 12:36:03.755 | 12:42:39.789 | 1 | 1/0 | 15aeeca2e66980a5 | 0/0 | 13:00:24.079 | 10 | 1 | 13:00:24.079 custom |
| 37 | ReviewResponse | reviewer | 12:36:02.410 | `zai/glm-5.3-flash` | 12:36:03.710 | - | 0 | 0/0 | 15aeeca2e66980a0 | 0/0 | 13:08:28.989 | 18 | 1 | 13:08:28.989 custom |
| 38 | ReviewNavigation | reviewer | 12:36:02.237 | `zai/glm-5.3-flash` | 12:36:03.698 | - | 0 | 0/0 | 15aeeca2e6698099 | 0/0 | 12:59:32.104 | 15 | 1 | 12:59:32.104 custom |
| 39 | ReviewActivation | reviewer | 12:36:02.312 | `zai/glm-5.3-flash` | 12:36:03.706 | - | 0 | 0/0 | 15aeeca2e669809c | 0/4 | 12:50:52.789 | 11 | 5 | 12:50:52.789 custom |
| 40 | ReviewThrow | reviewer | 12:36:02.037 | `zai/glm-5.3-flash` | 12:36:03.690 | 12:42:38.152 | 1 | 1/0 | 15aeeca2e6698091 | 1/0 | 13:12:26.489 | 8 | 1 | 13:12:26.489 custom |
| 41 | ReviewInvalid | reviewer | 12:36:02.087 | `zai/glm-5.3-flash` | 12:36:03.696 | 12:46:24.024 | 0 | 0/0 | 15aeeca2e6698093 | 0/0 | 13:09:07.589 | 15 | 1 | 13:09:07.589 custom |
| 42 | ReviewAutoControl | reviewer | 12:36:02.794 | `zai/glm-5.3-flash` | 12:36:03.764 | 12:42:38.202 | 1 | 0/1 | 15aeeca2e66980b0 | 0/0 | 12:57:22.069 | 0 | 0 | 12:57:22.069 custom |
| 43 | ReviewCountMeaning | reviewer | 12:36:02.748 | `zai/glm-5.3-flash` | 12:36:03.760 | 12:42:39.074 | 1 | 1/0 | 15aeeca2e66980ae | 0/0 | 12:57:12.882 | 9 | 1 | 12:57:12.882 custom |
| 44 | ReviewPriorHistory | reviewer | 12:36:02.584 | `zai/glm-5.3-flash` | 12:36:03.752 | 12:40:19.365 | 1 | 1/0 | 15aeeca2e66980a7 | 0/0 | 12:55:41.434 | 10 | 1 | 12:55:41.434 custom |
| 45 | ReviewSourceLink | reviewer | 12:36:02.435 | `zai/glm-5.3-flash` | 12:36:03.712 | 12:42:39.614 | 1 | 1/0 | 15aeeca2e66980a1 | 0/0 | 13:04:11.572 | 22 | 1 | 13:04:11.572 custom |
| 46 | ReviewBinding | reviewer | 12:36:02.338 | `zai/glm-5.3-flash` | 12:36:03.707 | 12:47:03.963 | 0 | 0/0 | 15aeeca2e669809d | 0/0 | 13:19:45.708 | 15 | 1 | 13:19:45.708 custom |
| 47 | RevCase01 | revenger | 12:36:02.212 | `zai/glm-5.3-flash` | 12:36:03.701 | - | 0 | 0/0 | 15aeeca2e6698098 | 0/0 | 12:51:02.128 | 11 | 3 | 12:51:02.128 custom |
| 48 | RevCase02 | revenger | 12:36:02.512 | `zai/glm-5.3-flash` | 12:36:03.761 | - | 0 | 0/0 | 15aeeca2e66980a4 | 0/0 | 12:58:28.491 | 13 | 1 | 12:58:28.491 custom |
| 49 | RevCase03 | revenger | 12:36:03.096 | `zai/glm-5.3-flash` | 12:36:03.781 | 12:42:40.181 | 1 | 0/1 | 15aeeca2e66980bd | 0/0 | 12:57:22.273 | 0 | 0 | 12:57:22.273 custom |
| 50 | RevCase04 | revenger | 12:36:03.045 | `zai/glm-5.3-flash` | 12:36:03.779 | - | 0 | 0/0 | 15aeeca2e66980bb | 0/0 | 12:57:55.238 | 11 | 1 | 12:57:55.238 custom |
| 51 | RevCase05 | revenger | 12:36:02.978 | `zai/glm-5.3-flash` | 12:36:03.774 | - | 0 | 0/0 | 15aeeca2e66980b8 | 0/0 | 13:07:26.236 | 12 | 1 | 13:07:26.236 custom |
| 52 | RevCase06 | revenger | 12:36:02.817 | `zai/glm-5.3-flash` | 12:36:03.762 | 12:42:38.938 | 1 | 1/0 | 15aeeca2e66980b1 | 0/0 | 13:06:11.400 | 8 | 1 | 13:06:11.400 custom |
| 53 | RevCase07 | revenger | 12:36:02.655 | `zai/glm-5.3-flash` | 12:36:03.714 | - | 0 | 0/0 | 15aeeca2e66980aa | 0/0 | 12:56:50.026 | 9 | 1 | 12:56:50.026 custom |
| 54 | RevCase08 | revenger | 12:36:03.119 | `zai/glm-5.3-flash` | 12:36:03.776 | 12:48:31.509 | 0 | 0/0 | 15aeeca2e66980be | 0/0 | 13:05:51.088 | 15 | 1 | 13:05:51.088 custom |
| 55 | RevCase09 | revenger | 12:36:03.350 | `zai/glm-5.3-flash` | 12:36:03.958 | 12:42:38.550 | 1 | 1/0 | 15aeeca2e66980c2 | 0/0 | 13:02:32.772 | 9 | 1 | 13:02:32.772 custom |
| 56 | RevCase10 | revenger | 12:36:03.304 | `zai/glm-5.3-flash` | 12:36:03.895 | 12:48:02.032 | 0 | 0/0 | 15aeeca2e66980c1 | 0/0 | 13:03:18.039 | 15 | 1 | 13:03:18.039 custom |
| 57 | CriticNoHarm | critic | 12:36:03.258 | `openai-codex/gpt-6-luna` | 12:36:03.860 | 12:36:17.139 | 0 | 0/0 | - | 0/0 | 12:43:17.153 | 0 | 0 | 12:43:17.153 custom |
| 58 | CriticCounterLiar | critic | 12:36:03.372 | `openai-codex/gpt-6-luna` | 12:36:03.955 | 12:36:18.018 | 0 | 0/0 | - | 0/0 | 12:43:18.036 | 0 | 0 | 12:43:18.036 custom |
| 59 | CriticAuthorship | critic | 12:36:03.417 | `openai-codex/gpt-6-luna` | 12:36:03.962 | - | 0 | 0/0 | 15aeeca2e66980c3 | 0/0 | 12:51:16.970 | 10 | 3 | 12:51:16.970 custom |
| 60 | CriticSourceRuntime | critic | 12:36:03.165 | `openai-codex/gpt-6-luna` | 12:36:03.783 | 12:36:19.264 | 0 | 0/0 | - | 0/0 | 12:43:19.278 | 0 | 0 | 12:43:19.278 custom |
| 61 | CriticIsolation | critic | 12:36:03.211 | `openai-codex/gpt-6-luna` | 12:36:03.786 | 12:36:17.516 | 0 | 0/0 | - | 0/0 | 12:43:17.534 | 0 | 0 | 12:43:17.534 custom |
| 62 | CriticVacuity | critic | 12:36:03.234 | `openai-codex/gpt-6-luna` | 12:36:03.959 | 12:36:19.042 | 0 | 0/0 | - | 0/0 | 12:43:19.057 | 0 | 0 | 12:43:19.057 custom |
| 63 | CriticExpansion | critic | 12:36:03.327 | `openai-codex/gpt-6-luna` | 12:36:03.862 | 12:36:17.676 | 0 | 0/0 | - | 0/0 | 12:43:17.691 | 0 | 0 | 12:43:17.691 custom |
| 64 | CriticOracle | critic | 12:36:03.395 | `openai-codex/gpt-6-luna` | 12:36:03.961 | 12:36:18.132 | 0 | 0/0 | - | 0/0 | 12:43:18.151 | 0 | 0 | 12:43:18.151 custom |

Totals: wakes 32 (23 broadcast + 9 peer) → 17 next-burst work, 15 failed, 0 no-turn.

## Table 2 — all 46 peer inbound events (`irc:incoming`, broadcast flag absent)

`Kind`: request = peer content; notice = the recipient's "Wake turn failed: … Retry budget
exhausted" reply, which is itself an inbound record on the original sender. States and next
bursts as defined above.

| # | Delivered (UTC) | Recipient | Sender | Message id | Kind | State at delivery | Next burst | Body (first 75) |
|---|---|---|---|---|---|---|---|---|
| 1 | 2026-10-21T12:38:27.108Z | BuildRuntime | TabiR21.ConnSibling | `15aeeb6989297ed8` | request | dead_exhausted | failed | ConnSibling interface finding (province routing): keep r19's Playwright res |
| 2 | 2026-10-21T12:38:30.220Z | BuildCounter | TabiR21.ConnSibling | `15aeeb6c93297ed9` | request | dead_exhausted | failed | ConnSibling interface finding: the 'drift => exit1' contract has an unguard |
| 3 | 2026-10-21T12:38:38.276Z | BuildRuntime | TabiR21.ConnPlanner | `15aeeb7471297edb` | request | retrying | failed | ConnPlanner interface findings (source-read only, not predictions): (1) per |
| 4 | 2026-10-21T12:38:41.662Z | BuildCounter | TabiR21.ConnPlanner | `15aeeb77bfa97ede` | request | retrying | failed | ConnPlanner interface findings: (1) 'note contains each fixed id and S100'  |
| 5 | 2026-10-21T12:38:41.679Z | ConnSibling | TabiR21.BuildRuntime | `15aeeb77c3e97ee0` | notice | none | work | Wake turn failed: [openai-codex/gpt-6-luna] Retry budget exhausted after 5  |
| 6 | 2026-10-21T12:38:43.487Z | ConnSibling | TabiR21.BuildCounter | `15aeeb7987e97ee3` | notice | none | work | Wake turn failed: [openai-codex/gpt-6-luna] Retry budget exhausted after 5  |
| 7 | 2026-10-21T12:38:56.074Z | ConnPlanner | TabiR21.BuildRuntime | `15aeeb85d2a97eef` | notice | none | work | Wake turn failed: [openai-codex/gpt-6-luna] Retry budget exhausted after 5  |
| 8 | 2026-10-21T12:38:57.683Z | ConnPlanner | TabiR21.BuildCounter | `15aeeb8764e97ef5` | notice | none | work | Wake turn failed: [openai-codex/gpt-6-luna] Retry budget exhausted after 5  |
| 9 | 2026-10-21T12:42:11.411Z | BuildRuntime | TabiR21.ReviewActivation | `15aeec4494e97fcd` | request | dead_exhausted | failed | ReviewActivation finding/report is written. S100:163-165 maps :tool-form-ac |
| 10 | 2026-10-21T12:42:11.423Z | BuildCounter | TabiR21.ReviewActivation | `15aeec4497e97fce` | request | dead_exhausted | failed | ReviewActivation finding/report is written. Counter must not derive focus/p |
| 11 | 2026-10-21T12:42:24.687Z | ReviewActivation | TabiR21.BuildCounter | `15aeec518be97fd9` | notice | idle_alive | work | Wake turn failed: [openai-codex/gpt-6-luna] Retry budget exhausted after 5  |
| 12 | 2026-10-21T12:42:26.054Z | ReviewActivation | TabiR21.BuildRuntime | `15aeec52e1a97fdb` | notice | idle_alive | work | Wake turn failed: [openai-codex/gpt-6-luna] Retry budget exhausted after 5  |
| 13 | 2026-10-21T12:42:31.645Z | BuildCounter | TabiR21.ReviewActivation | `15aeec5857697fea` | request | dead_exhausted | failed | No reply needed. Key finding already in `.ufo/waves/round-21/w1/ReviewActiv |
| 14 | 2026-10-21T12:42:35.515Z | BuildRuntime | TabiR21.ReviewActivation | `15aeec5c1ee97ff1` | request | dead_exhausted | failed | No reply needed. Key finding already in `.ufo/waves/round-21/w1/ReviewActiv |
| 15 | 2026-10-21T12:42:44.672Z | ReviewActivation | TabiR21.BuildCounter | `15aeec651029800a` | notice | idle_alive | work | Wake turn failed: [openai-codex/gpt-6-luna] Retry budget exhausted after 5  |
| 16 | 2026-10-21T12:42:49.674Z | ReviewActivation | TabiR21.BuildRuntime | `15aeec69f2a9800d` | notice | idle_alive | work | Wake turn failed: [openai-codex/gpt-6-luna] Retry budget exhausted after 5  |
| 17 | 2026-10-21T12:45:45.975Z | BuildSelftest | TabiR21.BuildCounter | `15aeed161de9814c` | request | post_exit | failed | Counter API planned in the assigned clone: exports `evaluate(files)`, `INPU |
| 18 | 2026-10-21T12:45:59.594Z | BuildCounter | TabiR21.BuildSelftest | `15aeed236aa98166` | notice | working | work | Wake turn failed: [openai-codex/gpt-6-luna] Retry budget exhausted after 5  |
| 19 | 2026-10-21T12:48:11.413Z | BuildRuntime | TabiR21.SrcSubmitSpec | `15aeeda4256981c3` | request | working | work | WHATWG spec boundary for receipt design: record/verify the actual invocatio |
| 20 | 2026-10-21T12:48:11.414Z | BuildCounter | TabiR21.SrcSubmitSpec | `15aeeda425a981c4` | request | working | work | WHATWG spec boundary relevant to counted cases: `form.submit()` bypasses va |
| 21 | 2026-10-21T12:48:57.336Z | BuildRuntime | TabiR21.ReviewPreAction | `15aeedd0fe298258` | request | working | work | ReviewPreAction finding: runner behavior is sequential in scripts/webmcp-li |
| 22 | 2026-10-21T12:49:16.074Z | BuildCounter | TabiR21.ReviewCountMeaning | `15aeede34aa98263` | request | working | work | Static count-meaning finding in current lane `measure-c1.mjs`: it validates |
| 23 | 2026-10-21T12:49:26.030Z | BuildRuntime | TabiR21.ReviewPreAction | `15aeeded03a98267` | request | working | work | Additional concrete failure path in the current runner: lines 153-155 catch |
| 24 | 2026-10-21T12:50:00.203Z | BuildCounter | TabiR21.ReviewNonce | `15aeee0e62e98277` | request | working | work | Concrete review finding: round21 counter does not establish a current-run n |
| 25 | 2026-10-21T12:50:15.845Z | BuildCounter | TabiR21.SrcForm14 | `15aeee1da9698280` | request | working | work | S100 source is build-scoped only: pending at a finite interval is not equiv |
| 26 | 2026-10-21T12:50:15.845Z | BuildRuntime | TabiR21.SrcForm14 | `15aeee1da969827f` | request | working | work | S100 slice finding: with `executing_tool && executing_tool->CurrentlyRunnin |
| 27 | 2026-10-21T12:50:32.674Z | BuildRuntime | TabiR21.ReviewNavigation | `15aeee2e18a98295` | request | working | work | Scoped review finding: in the current lane script `scripts/webmcp-lifecycle |
| 28 | 2026-10-21T12:50:58.752Z | BuildSelftest | TabiR21.BuildCounter | `15aeee47902982a4` | request | dead_exhausted | failed | Adding fixed plan binding to the listed case IDs: each `id` must retain its |
| 29 | 2026-10-21T12:51:12.787Z | BuildCounter | TabiR21.BuildSelftest | `15aeee5544e982ab` | notice | working | work | Wake turn failed: [openai-codex/gpt-6-luna] Retry budget exhausted after 5  |
| 30 | 2026-10-21T12:53:06.674Z | BuildRuntime | TabiR21.ReviewFlags | `15aeeec47ca982ec` | request | working | work | Review finding for your runtime: current lane script config is textually al |
| 31 | 2026-10-21T12:53:14.570Z | BuildRuntime | TabiR21.BuildCounter | `15aeeecc32a982f3` | request | working | work | Counter interface check (module committed in clone): receipt `environment.n |
| 32 | 2026-10-21T12:53:50.246Z | BuildCounter | TabiR21.BuildRuntime | `15aeeeef09a982ff` | request | idle_alive | work | I will match the producer-compatible receipt contract: environment.flags as |
| 33 | 2026-10-21T12:54:01.250Z | BuildCounter | TabiR21.ReviewRawInvoke | `15aeeef9c8a98307` | request | idle_alive | work | Review finding in current clone snapshot: counter lines 318-321 requires a  |
| 34 | 2026-10-21T12:54:01.250Z | BuildRuntime | TabiR21.ReviewRawInvoke | `15aeeef9c8a98306` | request | working | work | Review finding in current clone snapshot: `makeRecorder` lines 374-382 emit |
| 35 | 2026-10-21T12:54:09.956Z | BuildRuntime | TabiR21.RevCase05 | `15aeef024929830a` | request | working | work | Source finding for `na-reset`: retained Chromium 154 html_form_element.cc ` |
| 36 | 2026-10-21T12:54:29.994Z | BuildRuntime | TabiR21.RevCase09 | `15aeef15daa9831e` | request | working | work | Source-side finding for `na-delayed` (S100 `html_form_element.cc`): fixture |
| 37 | 2026-10-21T12:55:58.514Z | BuildCounter | TabiR21.ReviewPending | `15aeef6c4ca9833e` | request | working | work | ReviewPending first-falsification from present clones: runtime frames use ` |
| 38 | 2026-10-21T12:55:58.515Z | BuildRuntime | TabiR21.ReviewPending | `15aeef6c4ce9833f` | request | working | work | ReviewPending found an existing runtime/counter interface mismatch relevant |
| 39 | 2026-10-21T12:56:03.910Z | BuildCounter | TabiR21.SrcForm13 | `15aeef7191a98340` | request | working | work | SrcForm13 (S100 slice 740-786): fresh fetch 2026-10-21 digest 8c8d6796…3691 |
| 40 | 2026-10-21T12:56:39.639Z | BuildRuntime | TabiR21.BuildCounter | `15aeef9475e983d6` | request | working | work | - **Clone:** Created `clones/BuildCounter` from baseline `e7cf11a810003d4a6 |
| 41 | 2026-10-21T13:03:51.896Z | BuildRuntime | TabiR21.ReviewThrow | `15aef13a9629854c` | request | idle_alive | work | Interface findings from ReviewThrow (throw-handler falsification review), n |
| 42 | 2026-10-21T13:04:01.894Z | ReviewThrow | TabiR21.BuildRuntime | `15aef14459a98551` | request | working | work | No further action; the prior manifest remains accurate. |
| 43 | 2026-10-21T13:09:31.069Z | BuildRuntime | TabiR21.ReviewFreshContext | `15aef285cf69860e` | request | idle_alive | work | F1 interface mismatch (reviewer ReviewFreshContext, report .ufo/waves/round |
| 44 | 2026-10-21T13:09:31.080Z | BuildCounter | TabiR21.ReviewFreshContext | `15aef285d229860f` | request | post_exit | work | F1 interface mismatch (reviewer ReviewFreshContext, report .ufo/waves/round |
| 45 | 2026-10-21T13:09:41.060Z | ReviewFreshContext | TabiR21.BuildRuntime | `15aef28f91298613` | request | working | work | No further action. The clone remains unchanged since the stop instruction. |
| 46 | 2026-10-21T13:09:52.212Z | ReviewFreshContext | TabiR21.BuildCounter | `15aef29a75298616` | request | idle_alive | work | No further changes were made after L1’s stop instruction. - **Clone eviden |

Broadcast deliveries (55) are not repeated here: each recipient's timestamp (12:43:47.993Z)
and unique message id are in Table 1's `Broadcast id` column. There are no other broadcast
records on the 64 W1 transcripts (`details.broadcast=true` count = 55).

## Table 3 — peer sends recorded by W1 seats (`write agent://…`)

34 tool sends from 20 seats. Targets `agent://Main` are coordinator reports, not wakes. The
message body is not in `args`; only `path` and `intent` are recorded.

| # | Sent (UTC) | Sender | Target | Intent |
|---|---|---|---|---|
| 1 | 2026-10-21T12:38:27.108Z | ConnSibling | `agent://TabiR21.BuildRuntime` | (none) |
| 2 | 2026-10-21T12:38:30.220Z | ConnSibling | `agent://TabiR21.BuildCounter` | (none) |
| 3 | 2026-10-21T12:38:38.276Z | ConnPlanner | `agent://TabiR21.BuildRuntime` | (none) |
| 4 | 2026-10-21T12:38:41.661Z | ConnPlanner | `agent://TabiR21.BuildCounter` | (none) |
| 5 | 2026-10-21T12:42:11.414Z | ReviewActivation | `agent://TabiR21.BuildRuntime` | Notifying runtime writer of active-state limit |
| 6 | 2026-10-21T12:42:11.425Z | ReviewActivation | `agent://TabiR21.BuildCounter` | Notifying counter writer of active-state limit |
| 7 | 2026-10-21T12:42:31.647Z | ReviewActivation | `agent://TabiR21.BuildCounter` | Retrying counter finding handoff |
| 8 | 2026-10-21T12:42:35.517Z | ReviewActivation | `agent://TabiR21.BuildRuntime` | Retrying runtime finding handoff |
| 9 | 2026-10-21T12:43:56.603Z | ConnPlanner | `agent://Main` | (none) |
| 10 | 2026-10-21T12:44:10.424Z | CriticAuthorship | `agent://Main` | Sending authorship decision to coordinator |
| 11 | 2026-10-21T12:45:45.974Z | BuildCounter | `agent://TabiR21.BuildSelftest` | Notifying counter interface |
| 12 | 2026-10-21T12:48:11.413Z | SrcSubmitSpec | `agent://TabiR21.BuildRuntime` | Sending requestSubmit interface constraint |
| 13 | 2026-10-21T12:48:11.414Z | SrcSubmitSpec | `agent://TabiR21.BuildCounter` | Sending requestSubmit counter constraint |
| 14 | 2026-10-21T12:48:57.337Z | ReviewPreAction | `agent://TabiR21.BuildRuntime` | Notifying runtime author of evidence-order gap |
| 15 | 2026-10-21T12:49:16.074Z | ReviewCountMeaning | `agent://TabiR21.BuildCounter` | Alerting counter owner to scenario-map gap |
| 16 | 2026-10-21T12:49:26.031Z | ReviewPreAction | `agent://TabiR21.BuildRuntime` | Notifying runtime author of invoke-failure continuation |
| 17 | 2026-10-21T12:50:00.203Z | ReviewNonce | `agent://TabiR21.BuildCounter` | Messaging counter owner about replay gap |
| 18 | 2026-10-21T12:50:15.845Z | SrcForm14 | `agent://TabiR21.BuildCounter` | Sharing source evidence boundary with counter executor |
| 19 | 2026-10-21T12:50:15.845Z | SrcForm14 | `agent://TabiR21.BuildRuntime` | Sharing S100 callback branch with runtime executor |
| 20 | 2026-10-21T12:50:32.675Z | ReviewNavigation | `agent://TabiR21.BuildRuntime` | Reporting navigation observation gap to runtime owner |
| 21 | 2026-10-21T12:50:58.754Z | BuildCounter | `agent://TabiR21.BuildSelftest` | Sharing fixed case plan check |
| 22 | 2026-10-21T12:53:06.675Z | ReviewFlags | `agent://TabiR21.BuildRuntime` | Notifying runtime writer of argv gap |
| 23 | 2026-10-21T12:53:14.570Z | BuildCounter | `agent://TabiR21.BuildRuntime` | Sharing runtime interface expectations |
| 24 | 2026-10-21T12:53:50.248Z | BuildRuntime | `agent://TabiR21.BuildCounter` | Sharing counter interface alignment |
| 25 | 2026-10-21T12:54:01.250Z | ReviewRawInvoke | `agent://TabiR21.BuildCounter` | Messaging counter writer about frame contract mismatch |
| 26 | 2026-10-21T12:54:01.250Z | ReviewRawInvoke | `agent://TabiR21.BuildRuntime` | Messaging runtime writer about frame contract mismatch |
| 27 | 2026-10-21T12:54:09.956Z | RevCase05 | `agent://TabiR21.BuildRuntime` | Sending reset-path contract to runtime executor |
| 28 | 2026-10-21T12:54:29.994Z | RevCase09 | `agent://TabiR21.BuildRuntime` | Sending delayed case source findings to runtime owner |
| 29 | 2026-10-21T12:55:58.515Z | ReviewPending | `agent://TabiR21.BuildCounter` | Notifying counter owner about pending evidence mismatch |
| 30 | 2026-10-21T12:55:58.515Z | ReviewPending | `agent://TabiR21.BuildRuntime` | Notifying runtime owner about counter contract mismatch |
| 31 | 2026-10-21T12:56:03.910Z | SrcForm13 | `agent://TabiR21.BuildCounter` | (none) |
| 32 | 2026-10-21T13:03:51.899Z | ReviewThrow | `agent://TabiR21.BuildRuntime` | Messaging BuildRuntime interface findings on throw semantics |
| 33 | 2026-10-21T13:09:31.072Z | ReviewFreshContext | `agent://TabiR21.BuildRuntime` | Messaging runtime builder interface findings |
| 34 | 2026-10-21T13:09:31.079Z | ReviewFreshContext | `agent://TabiR21.BuildCounter` | Messaging counter builder interface findings |

## Table 4 — parent-channel sends (TabiR21 → seats)

| Sent (UTC) | Mechanism | Target | Message id |
|---|---|---|---|
| 2026-10-21T12:56:15.113Z | `write` | `agent://TabiR21.BuildRuntime` | not recorded in `args` |
| 2026-10-21T12:56:15.114Z | `write` | `agent://TabiR21.BuildCounter` | not recorded in `args` |
| 2026-10-21T12:56:15.115Z | `write` | `agent://TabiR21.ReviewBinding` | not recorded in `args` |
| 2026-10-21T12:56:22.724Z | `write` | `agent://TabiR21.BuildRuntime` | not recorded in `args` |
| 2026-10-21T12:56:35.588Z | `eval` (batch; "sent to remaining owned reviewers only") | 7 seats (ReviewCleanup, ReviewIdentity, ReviewInvalid, ReviewPending, ReviewResponse, RevCase05, RevCase08) | not recorded; target set from the 7 deliveries at 12:56:36 |
| 2026-10-21T13:10:59.209Z | `write` | `agent://TabiR21.ReviewBinding` | not recorded in `args` |

Parent also wrote `agent://Main` at 12:36:24.415Z ("Notifying provider implementation
deaths") and 14:26:25.991Z ("Requesting parent-owned empty-snapshot reanchor") — outside W1
scope.

## Coverage limits and unresolved gaps

1. **Single store, single session.** All 64 transcripts come from
   `/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/2026-10-21T03-31-39-302Z_01a15c83-baa6-76c9-b209-ce1123c6cc22/TabiR21/`.
   No rotated, archived, or alternate-cwd transcript for these ids was found. Counts here are
   exactly what that store retains.
2. **Timestamp vs append order.** `irc:incoming` records are appended when consumed, so line
   order can disagree with `timestamp`: the broadcast's recipient delivery stamps
   (12:43:47.993Z) precede the sender's tool `startedAt` (12:43:48.089Z) by 96 ms; SrcForm02's
   broadcast record sits after a 12:44:09 toolUse; RevCase01's sits after its 12:41:18 stop.
   All state/outcome labels use timestamps; ties are not resolved.
3. **Absence is not proof of no send.** A send to an already-disposed id may be dropped
   silently. The hub's own count says "223 of 223" and its list omits exactly the 9 pre-exit
   W1 seats, so those 9 were excluded by the hub, not lost in transit; other unlisted sends
   cannot be ruled out from the receiver side alone.
4. **Bodies are recipient-side.** `write` `args` carry only `path` (and sometimes `intent`);
   peer message text and ids come from the recipient's `details.message`/`details.id`. The
   broadcast body is likewise recovered from recipients (identical in all 55), not from the
   sender.
5. **The hub's "woken" is not the strict wake definition.** 28 W1 seats were labeled `woken`,
   but only 23 were terminal at delivery; 5 were idle-alive (ConnPlanner, ConnSibling,
   ReviewActivation, RevCase01, CriticAuthorship). Both ledgers are reported; they answer
   different questions.
6. **Parent `eval` batch target list is not in the transcript.** The 7 targets are the seven
   observed 12:56:36 deliveries; the eval itself records only the aggregate result string.
7. **`session_exit` is loop disposal, not process death.** BuildCounter accepted and answered
   an inbound message 5m51s after its 13:03:39 dispose. Post-exit wake counts are therefore
   per-record, not per-process.
8. **State labels derive from provider error text.** `dead_exhausted` requires the literal
   "Retry budget exhausted"; failures without that string (e.g., ScribeLessonInputs' 429 with
   `retry-after-ms=8035000`) classify as `retrying`/none and are not counted as wakes.
9. **Out of scope:** the 64 round-21 W2 transcripts in the same directory; W2 chronology debt
   is not assessed here. Also unread: round-22 artifacts, `w1-spec.json` item text, and any
   reconstructed/canonical history outside the files listed under Sources.

## What can and cannot be claimed

- **Can**: one broadcast delivery to 55 W1 ids at 12:43:47.993Z with per-id message ids;
  23 terminal-state deliveries from it (16 work / 7 failed); 46 peer messages with ids and
  senders; 9 terminal-state peer deliveries (1 work / 8 failed); 3 post-dispose wakes on
  BuildSelftest and BuildCounter; 66 dispose/normal exits.
- **Cannot**: that the broadcast *caused* any seat's recovery (only ordering is recorded);
  that peer messages revived BuildRuntime/BuildCounter (their peer wake turns failed); that
  BuildSelftest was never revived (it was, twice, and both failed); that any wake produced a
  valid report (turn activity only); that the historical `unexpectedPeerRevivals` list is
  complete — it names BuildRuntime and BuildCounter only, while BuildSelftest was woken after
  dispose twice, and BuildRuntime's peer wakes were all pre-exit and failed, so the list does
  not distinguish pre-exit wake attempts from post-dispose wakes.
