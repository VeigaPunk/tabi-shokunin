# Round 2 lessons — tabi-shokunin (2026-10-14)

Wave 2 — TABI-R2-1 capture, TABI-R2-2 daemon disposition, TABI-R2-3
verify/errata, TABI-R2-4 poll — recorded by TABI-SCRIBE. Axis move: depth
(evidence ladder) (`plans/round-2.plan.md:3-4`; `SCORECARD.md:26-36`).
Evidence: commit `5d2e95d`, `LOG.md:29-75`.

## What landed

- 2 admits, 3 → 5 notes: `live-dynamic-capture.md` (220 `wc -l`; loopback
  `http.server` fixture with JS hydration + click mutation, captured
  before/after through CDP; methodology sha-pinned and byte-identical across
  two runs; det-before `c08947dc…802dc1` / det-after `7488d544…4b42c7`) and
  `webbridge-daemon-disposition.md` (236 `wc -l`; doc-authorized `start`
  executed — pid 3934817 on `127.0.0.1:10086`; `stop`/`restart`/`uninstall`
  agent-forbidden → daemon left running, operator stop owed D2).
- Errata on all three round-1 notes, append-only (pre-append hashes = the
  round-1 pins; byte-prefix proof `/tmp/tabi-r2-3-verify/append-proof.txt`):
  two anchor corrections (census `operations.md` cite off-by-4, corrected
  against `operations.md:17-22`; cdp `url`-normalization rule) and one
  unbacked sighting downgraded to non-replayable (superseded in round 4).
- SKILL.md +105 (`LOG.md:46`): evidence ladder (3 rungs), determinism
  boundaries, approval-discipline table; round-1 pin block refreshed to the
  post-append hashes.
- `/status` probed conditionally: 8 fields vs 5 documented,
  `extension_connected:false` — no session material ever present.

## Method lessons

- A state change can be the measured outcome: `start` was authorized by the
  substrate's own docs (`operations.md:11-13`), executed once, and left
  running as a recorded state change; the authority tension was resolved
  into the approval table, not by editing the round-1 anatomy text.
- Append-only verification is byte-prefix proof, not a re-read.
- Loopback ≠ no-egress: the browser's own GCM registration was logged
  despite `--disable-background-networking` — keep the differing pair
  (`live-dynamic-capture.md` §7).

## Gate

- Candidates: the two wave-2 notes; the R2-3 errata pass and the R2-4 poll
  as round machinery; TABI-A1's r2b audit harness staged, in flight at record
  time (`LOG.md:71-73`).
- Admitted: both notes, each with a coverage row; pins `56224aa88430` /
  `9240f1d66a8c` (re-run this lesson, 2026-10-14: `git show
  5d2e95d:<path> | sha256sum` → both match).
- Rejected / deferred, with reasons: the `start --foreground --addr` run-only
  daemon pattern — flagged, not executed (the round authorized one
  doc-standard start only; `webbridge-daemon-disposition.md:171-179`);
  `/command` auth — unprobed by rule (§9 U7); the r1 launch-window listing —
  downgraded for lack of a staged artifact (later reinstated once staged).
- Spot-check (non-author — scribe): agrees with both admits after re-running
  their anchors (methodology shas + capture-pair hashes; live `ss -ltnp` +
  `/status` shape); re-ran the standing Brave reject → `NativeMessagingHosts`
  only; verified the census off-by-4 independently (`operations.md:17-22`)
  (`SCORECARD.md:36`).
- Falsifier: a byte-identity claim not re-derivable from its pins; an errata
  block that is not a pure append.
- Carried debt out of this round: four `/tmp` staging groups unarchived;
  `corpus/lessons/` still empty; freshness rider only same-day-later
  (strictly-later-date recheck owed); TABI-A1's r2b audit in flight.