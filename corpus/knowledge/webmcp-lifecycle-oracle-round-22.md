source: S101 — corpus/evidence/round-21/runtime/receipt.json and per-case raw CDP/fixture bytes; .ufo/waves/round-21/runtime-execution-finalized.json
verified-at: 2026-10-21; historical Chromium154.0.8037.97 acquisition, not a new browser execution; revision-bound oracle measurements belong in SCORECARD.md round22
recheck: node .ufo/waves/round-22/measure-c1.mjs FULL40HEXREV; node .ufo/waves/round-22/measure-c1.mjs --selftest; a different build/acquisition needs independently reviewed expectations

# Finite lifecycle outcome oracle — round22

## What this adds, and what it does not

Round21 admitted twelve finite lifecycle observations. Its retained structural
counter and all-silent synthetic positive were deliberately not semantic outcome
oracles. The separate semantic witness and non-author closure supported that
admission; this note does not invalidate or recount those observations as new ones.
Round22 makes the finite outcome distinctions failure-capable and re-runnable.
C1 counts twelve explicit semantically checked rows, not twelve new observations,
new branches, a coverage denominator, an additional capability or a scalar promotion.
The operative axis is operability: baseline0 means the new failure-capable
instrument was absent, not that semantic knowledge or review was absent.
The observation population is non-additive12→12; depth content is unchanged.
This is a recheck/method note on held ground, not another frontier admission.

The fixed case expectations are in
`corpus/evidence/round-22/semantic-expectations.json`; the gate is
`.ufo/waves/round-22/measure-c1.mjs`. Expected statuses and outcome shapes are
independent of the evaluated receipt: a coherently changed raw event and summary,
with corrected digest links, must still fail the case's semantic expectation.
Cryptographic self-consistency is necessary, not an outcome oracle or a guarantee
against an author changing both the evidence and the independent expectations.

## Case-specific decisions

All paths abbreviate `corpus/evidence/round-21/runtime/`. Each `<id>.json`
retains the invocation-correlated ordered frames; the matching receipt row is
an index and summary, not independent corroboration of the raw event.

| Case ID | Required finite recorded distinction | Reject rather than silently normalize |
|---|---|---|
| `na-pending` | no correlated response within the two recorded windows; active form | a fabricated terminal response or an indefinite-pending conclusion |
| `na-click` | Completed, dummy object with ok=true and nonce/q equal the case nonce | silent trail, wrong status or a different output nonce |
| `na-requestsubmit` | Completed with the same dummy-object contract | human-only completion or an absent-user-activation inference |
| `na-native-submit` | Completed, output array containing the landing JSON-LD object; /landing with case nonce; old-document submits unavailable/null | dummy respondWith object, array-to-object collapse, null-to-empty collapse or no navigation |
| `na-reset` | Canceled, exactly “Tool execution cancelled by a form reset” | Completed, silent cancellation, absent/wrong diagnostic or invented implementation authority |
| `na-remove` | Canceled, exactly “Tool execution cancelled, since tool definition was updated” | generalizing this tested removal to every DOM edit |
| `na-reject` | Error, exactly “respondWith promise was rejected” | swapping the programming-error diagnostic or adding success output |
| `na-throw` | Error, programming-error diagnostic naming preventDefault without respondWith | treating a different handler ordering or ordinary promise rejection as this case |
| `na-delayed` | active intermediate state before release; Completed with dummy object only after release marker | response before release, absent intermediate observation or generic eventual-settlement claim |
| `na-invalid-submit` | Error, exact required-field native-validity diagnostic; no submit event | initial-fill/type-refusal conflation or a successful submit |
| `auto-positive` | Completed dummy object already present before the initial observation ends | pretending this held-ground control is a new non-autosubmit branch |
| `auto-invalid` | Error, exact malformed-email native-validity diagnostic already present in the initial window; no submit event | arbitrary nonempty error text or toolautosubmit-guarantees-success |

Exact diagnostic strings and structural contracts are in the fixed expectations,
not locale-independent or universal browser promises. The evidence projection is
one finite pending, five Completed, two Canceled and four Error cases in this
retained acquisition. Re-derive rather than trust prose:

```sh
node .ufo/waves/round-22/measure-c1.mjs FULL40HEXREV
```

The metric is `c1_semantically_checked_lifecycle_rows`; target12 is conditional
on all twelve rows, the case population and their declared evidence bindings.
Before/after command outputs and measured revisions are retained in the round22
measurement receipts and binding manifest. No output from an unrun check is claimed.

## Review chronology and wake-history correction

The round21 non-author closure at fleet `MANIFEST.json rounds[417]`, retained in
`.ufo/waves/round-22/round21-closure.json`, supersedes narrower author-side wave
reporting. First-terminal failure snapshots were not complete final event history.
It found peer IRC to five failed W1 seats; a Main routing broadcast reached55 W1
seats, including23 already failed;24 failed seats showed post-broadcast activity,
and20 later failure notices appeared. Three initially Zai-failed seats later
exhausted Codex capacity. These events do not create new seat IDs or completed
reviews. Only two productive writer revivals had been disclosed in the author
report. The broader wake/routing surface is now explicitly retained as debt,
not relabeled as clean actor settlement or reconstructed historical observations.

Round22's bounded transcript re-reading is retained in
`.ufo/waves/round-22/w1/WakeHistory.md`: its definitions distinguish55 broadcast
deliveries/23 retry-exhausted recipients,46 peer messages on8 seats,9 peer
deliveries to terminal seats, and3 post-dispose peer deliveries on2 seats
(BuildSelftest twice, BuildCounter once). Hub “woken” is not a terminal-state
classification. Those source-defined counts are not interchangeable with the
closure's first-terminal/later-activity counts. The old causal attribution
“peers revived BuildRuntime/BuildCounter” is unsupported: their first normal
turns followed the broadcast, while prior peer attempts exhausted retries.
Ordering is observed; a unique cause is not. BuildSelftest's two post-dispose
wakes were omitted by the old revival list. Scope is the retained transcript
snapshot and stated classifier definitions, never complete future history.

W1 returns were captured13:15:40Z, before four final exits; all exited by13:19:45Z.
W2's final exit13:45:46Z preceded returns13:49:02Z, but the finalized acquisition
began13:51:46Z with producer digest
`bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`.
Thus W2 attacked older bounded artifacts, not those finalized bytes. Final-byte
support was L1 serial verification and the later independent immutable/raw closure,
not a W2 review of a future artifact. These times are closure-reported evidence;
they are not new authenticated event observations by this note's author.

`.ufo/waves/round-22/check-review-chronology.mjs` is a bounded evidence classifier,
not a scheduler or actor-authentication system. Supplied ordered seat history must
retain failures and later wake/activity distinctly; absent history is unavailable,
not an empty event list proving no wakes. Review scope requires exact artifact
identity and defensible chronology. A historical gap remains a gap after a new
classifier is added. Broader host orchestration belongs to its existing owner.

## Limits and retained rejects

No new browser run, real site, other build, default profile, absent activation,
human actor identity, source/binary equivalence, served-wire identity, exhaustive
fault cleanup or malicious-author authenticity is established. PID cleanup remains
sampled owned-process evidence. Finite no-response is not permanent pending.
Re-running an outcome oracle over immutable bytes is not re-running the browser.
All author-dispatched reviewers remain author-side; independent non-author admission
and SHONEN promotion are not self-attested. Historical reports/lessons/counters,
producer and acquisition stay unchanged; corrections are new entries.
