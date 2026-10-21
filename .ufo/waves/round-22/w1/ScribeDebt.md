# ScribeDebt — round-22 W1 — round-21 conformance correction draft

Status: read-only draft. No round-21 report, closure, transcript, or evidence file was edited. The correction below is for append-only placement at the end of the round-21 report. No quiescence is certified; the full history stays unknown beyond the observations listed here.

## Scope and method

- Closure read: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-22/round21-closure.json` (`verification.wave_conformance_debt`, `verification.seats`, `verification.conformance`, `notes`).
- Filed report read: `/home/vgpnk/Projects/shokunin/.ufo/reports/round-21/tabi.md` (lines 1–140). The closure's `report` field `.ufo/reports/round-21/tabi.md` does not resolve under the lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin/`; it resolves at the fleet root `/home/vgpnk/Projects/shokunin/`. Not verified: that `report_commit f5a3d0c9c24dd20f4da3b98c2a55310680612363` is reachable (`git cat-file` failed in the lane repo; not retried).
- Round-21 evidence read: `.ufo/waves/round-21/w1-returns.json`, `w2-returns.json`, `w1-failures.json`, `w2-failures.json`, `peer-revival.json`, `provider-errors.txt`, `runtime-execution-bounded.json`, `runtime-execution-final.json`, `runtime-execution-finalized.json`, and `.ufo/waves/round-21/w1/*.md` file presence.
- Seat transcripts read (JSONL, read-only): `/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/2026-10-21T03-31-39-302Z_01a15c83-baa6-76c9-b209-ce1123c6cc22/TabiR21/TabiR21.<seat>.jsonl` (128 files with session-exit records; 64 W1 names from `w1-returns.json`, 64 W2 names from `w2-returns.json`).
- Operations: `jq`, `grep`, `stat`, `wc`, `sort`, `uniq` over those files. No tests, builds, linters, formatters, browser, network, REA, services, or installs. No installs or updates were made.
- Definitions used: "terminal notice" = an assistant `stopReason:"error"` turn whose `errorMessage` contains `Retry budget exhausted`, or the direct Haiku 429 (ScribeLessonInputs). "Routing broadcast" = the `irc:incoming` entry from agent `Main` (header "Routing update (session-only, applies to FRESH seats…)") at 2026-10-21T12:43:47.993Z. "Stop turn" = an assistant turn with `stopReason:"stop"`.

## Verified observations (what this pass establishes)

### A. Routing broadcast and peer IRC (W1)

1. The `Main` routing broadcast reached 55 of 64 W1 transcripts. Nine seats have none: BuildSelftest, ScribeLessonInputs, CriticNoHarm, CriticCounterLiar, CriticSourceRuntime, CriticIsolation, CriticVacuity, CriticExpansion, CriticOracle. All nine are first-terminal failed seats. Of the 32 first-terminal failed seats, 23 received the broadcast.
2. Of the 32 first-terminal failed seats, 24 have assistant turns after 12:43:47.993Z and 20 have error turns after that time (operational definitions above).
3. Peer IRC (`irc:incoming` from `TabiR21.*`) reached five first-terminal failed seats, not two:
   - BuildRuntime: 18 incoming peer messages.
   - BuildCounter: 15.
   - BuildSelftest: 2 (from BuildCounter at 2026-10-21T12:45:45.975Z and 2026-10-21T12:50:58.752Z).
   - ReviewThrow: 1 (from BuildRuntime at 2026-10-21T13:04:01.894Z).
   - ReviewFreshContext: 2 (from BuildRuntime at 2026-10-21T13:09:41.060Z; from BuildCounter at 2026-10-21T13:09:52.212Z).
4. `peer-revival.json` names only BuildRuntime and BuildCounter as `revivedByPeerMessages`. `w1-failures.json` `unexpectedPeerRevivals` names the same two.
5. Session-exit records show re-entry after exit for two seats not named in the revival records:
   - BuildSelftest: session-exit at 2026-10-21T12:43:18.126Z, then a second at 2026-10-21T12:58:12.794Z. It has 18 error turns and no stop turn.
   - BuildCounter: session-exit at 2026-10-21T13:03:39.640Z, then a second at 2026-10-21T13:16:52.219Z.
   The trigger for each re-entry was not identified in this pass.
6. BuildRuntime has user-role turns at 2026-10-21T12:56:27.189Z (two entries); its transcript shows that turn is the parent "STOP implementation and browser execution now" steering message. BuildCounter has a user-role turn at 2026-10-21T12:56:27.868Z; its content was not read.

### B. First-terminal scope and later errors (W1)

7. First-terminal notices across the 32 failed seats: 12 Codex, 19 Zai, 1 Haiku. This matches `w1-failures.json` groups and the report's "12/19/1" count. The grouping is consistent with the first terminal notice.
8. Three seats had a Zai terminal and then a later Codex terminal:
   - SrcForm03: Zai terminal 2026-10-21T12:42:38.929Z, Codex terminal 2026-10-21T12:45:47.585Z.
   - SrcCdpContract: Zai terminal 2026-10-21T12:42:38.952Z, Codex terminal 2026-10-21T12:49:11.505Z.
   - SrcPriorProbe: Zai terminal 2026-10-21T12:42:39.912Z, Codex terminal 2026-10-21T12:49:11.385Z.
   This matches the closure's "three initial-Zai seats later exhausted Codex capacity."
9. SrcForm07 and ReviewPriorHistory had non-terminal 429 turns followed by a Codex terminal at 2026-10-21T12:40:18.591Z and 2026-10-21T12:40:19.365Z respectively.
10. 15 of the 32 first-terminal failed seats have at least one stop turn in their transcript: BuildRuntime, BuildCounter, RevCase06, RevCase09, ReviewCountMeaning, ReviewFlags, ReviewFreshContext, ReviewNonce, ReviewPriorHistory, ReviewSourceLink, ReviewThrow, SrcEventDocs, SrcForm05, SrcForm07, SrcForm15. Their last stop-turn timestamps fall between 12:43 and 13:10 UTC.
11. 14 of the 32 have a file at `.ufo/waves/round-21/w1/<seat>.md`: BuildCounter, RevCase06, RevCase09, ReviewCountMeaning, ReviewFlags, ReviewFreshContext, ReviewNonce, ReviewPriorHistory, ReviewSourceLink, ReviewThrow, SrcEventDocs, SrcForm05, SrcForm07, SrcForm15. BuildRuntime has no report file.
12. `w1-returns.json` `terminalNoOutputCount: 30` counts seats whose returned `latestOutput.text` is empty. Of those 30, 13 have stop turns and report files (RevCase06, RevCase09, ReviewCountMeaning, ReviewFlags, ReviewFreshContext, ReviewNonce, ReviewPriorHistory, ReviewSourceLink, ReviewThrow, SrcEventDocs, SrcForm05, SrcForm07, SrcForm15). Their last stop turns precede the return read time, so the empty return is a capture gap, not absence of output. The other 17 have no stop turn and no report file: BuildSelftest, SrcForm01, SrcForm03, SrcForm04, SrcForm06, SrcCdpContract, SrcPriorProbe, RevCase03, ReviewAutoControl, ScribeLessonInputs, CriticNoHarm, CriticCounterLiar, CriticSourceRuntime, CriticIsolation, CriticVacuity, CriticExpansion, CriticOracle.

### C. W1 return before final exits

13. `w1-returns.json` `readAt` is 2026-10-21T13:15:40.534838Z, with `allActorQuiescenceCertified: false`.
14. Four W1 seats recorded session exit after `readAt`: BuildRuntime 2026-10-21T13:16:41.062Z; BuildCounter 2026-10-21T13:16:52.219Z; ReviewFreshContext 2026-10-21T13:17:13.525Z; ReviewBinding 2026-10-21T13:19:45.708Z. The last W1 exit is 13:19:45.708Z. The closure's "all exited by 13:19:45Z" matches.
15. ReviewFreshContext's returned `latestOutput.text` is empty (length 0), though its last stop turn (2026-10-21T13:10:13.512Z) precedes `readAt`.

### D. W2 return before finalized acquisition

16. `w2-returns.json` `readAt` is 2026-10-21T13:49:02.529912Z, with `allActorQuiescenceCertified: false`. The latest W2 session-exit record is SemanticAutoPositive at 2026-10-21T13:45:46.468Z, so the closure's "W2 final exit 13:45:46Z precedes returns 13:49:02Z" matches. The 128 transcripts with session-exit records all have one at or before that time; this is an observed exit record, not a quiescence certificate.
17. Producer/acquisition run timestamps (`startedAt`):
    - `runtime-execution-final.json`: 2026-10-21T12:53:34.135286Z (the 847d0467 run flagged in ReviewBinding F1).
    - `runtime-execution-bounded.json`: 2026-10-21T13:07:01.895287Z. W2 transcripts cite the 13:07:02–13:07:14Z run (`w2/FixtureNaReject.md` line 139).
    - `runtime-execution-finalized.json`: 2026-10-21T13:51:46.597742Z, which is 2 min 44 s after the W2 `readAt`. The file's mtime (10:51 local) matches this. It is the acquisition named in the report's line 7 as "current worktree acquisition".
18. Therefore no W2 return preceded by a finalized run exists. The W2 wave did not read the `bc11e4d` finalized acquisition; the closure's "not final bc11e4d producer" is consistent with this.

### E. W2 failure classes

19. All six W2 failed-seat transcripts begin with a first error "Devin stream error resource_exhausted: Reached free model rate limit…" at 2026-10-21T13:21:39.497Z–13:21:40.614Z. This class is absent from `w2-failures.json` and report line 11. It is a first error, not a terminal notice, in these transcripts.
20. All six W2 failed seats have zero stop turns. Last-error classes: TraceNaRemove, SemanticNaRemove, ReviewRegistry, SemanticNaNativeSubmit: Codex; TraceNaNativeSubmit, SemanticNaReset: Zai. SemanticNaNativeSubmit's `invalid_prompt` turn is at 2026-10-21T13:24:49.892Z. The report's "3 Codex / 2 Zai / 1 invalid_prompt" count was not independently re-derived for each seat beyond these last-error classes.

## Draft append-only text for the round-21 report

Place at the end of `/home/vgpnk/Projects/shokunin/.ufo/reports/round-21/tabi.md`, after line 140. Do not edit earlier lines.

```
## Conformance correction (append-only, round-22 scribe)

This block adds to, and does not replace, the text above. It records observations of the retained transcripts and round-21 evidence. It certifies no quiescence and does not establish completeness of any seat's event history. Only the observations listed here are established; other history is unknown.

1. Routing and peer wakes. A `Main` routing update was delivered at 2026-10-21T12:43:47.993Z to 55 of 64 W1 transcripts. Nine seats did not receive it: BuildSelftest, ScribeLessonInputs, CriticNoHarm, CriticCounterLiar, CriticSourceRuntime, CriticIsolation, CriticVacuity, CriticExpansion, CriticOracle. Of the 32 first-terminal failed W1 seats, 23 received it; 24 show assistant turns after it and 20 show error turns after it. Peer IRC reached five failed W1 seats, not two: BuildRuntime (18 incoming peer messages), BuildCounter (15), BuildSelftest (2, from BuildCounter at 12:45:45.975Z and 12:50:58.752Z), ReviewThrow (1, from BuildRuntime at 13:04:01.894Z), ReviewFreshContext (2, from BuildRuntime at 13:09:41.060Z and BuildCounter at 13:09:52.212Z). `peer-revival.json` names only BuildRuntime and BuildCounter. BuildSelftest recorded session exits at 12:43:18.126Z and 12:58:12.794Z; BuildCounter recorded session exits at 13:03:39.640Z and 13:16:52.219Z. The triggers for these re-entries are not identified. None of these wakes is treated here as a completion cause.

2. First-terminal scope and later errors. The 12 Codex / 19 Zai / 1 Haiku counts are first-terminal notice classes; they are unchanged. Three seats had a Zai terminal and later a Codex terminal: SrcForm03, SrcCdpContract, SrcPriorProbe. SrcForm07 and ReviewPriorHistory had non-terminal 429 turns before a Codex terminal. Errors before a terminal notice are not terminal. The 30 "terminalNoOutput" returns count empty `latestOutput` at readAt, not absence of output: 13 of those 30 (RevCase06, RevCase09, ReviewCountMeaning, ReviewFlags, ReviewFreshContext, ReviewNonce, ReviewPriorHistory, ReviewSourceLink, ReviewThrow, SrcEventDocs, SrcForm05, SrcForm07, SrcForm15) have stop turns and report files before readAt. Seventeen have neither a stop turn nor a report file.

3. W1 return before final exits. W1 readAt was 2026-10-21T13:15:40.534838Z with allActorQuiescenceCertified false. Four W1 seats recorded session exit after readAt: BuildRuntime 13:16:41.062Z, BuildCounter 13:16:52.219Z, ReviewFreshContext 13:17:13.525Z, ReviewBinding 13:19:45.708Z. The last W1 exit is 13:19:45.708Z. ReviewFreshContext's returned text is empty although its last stop turn (13:10:13.512Z) precedes readAt.

4. W2 return before finalized acquisition. W2 readAt was 2026-10-21T13:49:02.529912Z with allActorQuiescenceCertified false. The latest W2 session-exit record is 13:45:46.468Z. The finalized acquisition named in line 7 (runtime-execution-finalized.json) has startedAt 2026-10-21T13:51:46.597742Z, after W2 readAt. The W2 wave read or reviewed only the bounded run (startedAt 2026-10-21T13:07:01.895287Z) and earlier producer/acquisition material; it did not review the finalized bc11e4d run.

5. W2 failure classes. All six W2 failed-seat transcripts show a first error "Devin stream error resource_exhausted: Reached free model rate limit" at 13:21:39–13:21:40 UTC, which is absent from w2-failures.json and this report's line 11. W2 failed seats have no stop turns.

6. Unknown. Peer IRC content beyond headers was not read in full; the trigger for the BuildSelftest and BuildCounter re-entries is not identified; the content of BuildCounter's 12:56:27.868Z user turn is not recorded here; the 17 zero-stop seats were not checked for non-stop assistant text. No completeness or quiescence claim is made.
```

## Checks and tools

- Checks run: read-only `jq`/`grep`/`stat`/`wc` queries listed above. No test, build, linter, formatter, browser, network, REA, service, or pacman action.
- Installs/updates: none.
- Temporary file: `/tmp/_w1cls.tsv` was written during the classification pass and is removed in the final step below.

## Unresolved

- Closure path mismatch: the closure's `report` field `.ufo/reports/round-21/tabi.md` resolves at fleet root, not lane root.
- `report_commit f5a3d0c9c24dd20f4da3b98c2a55310680612363` was not verified in this pass.
- No replacement or revival was assessed beyond the two `peer-revival.json` records and the re-entry timestamps above.
