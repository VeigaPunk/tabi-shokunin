FINDINGS

# R77Exec4 — Probe: the walk boundary and the seat tree

Hypothesis under test: with the frozen counter, a receipt of schema `tabi-chrome-cdp-filechooser-r77` placed under `.ufo/waves/round-77-seats/` is NOT seen by prior-set-complete, but becomes visible (counter exit 1, prior-set-complete) as soon as a symlink inside a walked tree points at it.

**Adjudication: the visibility boundary holds mechanically; the stated exit-1 outcome is nonce-conditional.** Part 1 (seats invisible) holds — even with the seats tree itself symlinked into the lane. Part 2 holds only for receipts whose `nonce` differs from `--expect-nonce`; the committed receipt (nonce `tabi-r77-l1-dcdf582add58` = expected) is read through the symlink but exempted by the run-under-test clause, exit 0. New finding: the exemption is keyed to the walked file's **self-claimed** nonce, so an extra forged receipt claiming the run's nonce is invisible to prior-set-complete (R10). The predicate is frozen; this is informational for the L1, not a fix proposal.

## Setup

- Scratch: `/fast/scratch/hyaku/tabi-r77/R77Exec4/` (mirror `m/`, script `probe.sh`); removed at end. Disk guard checked first: `bash /home/vgpnk/Projects/shokunin/scripts/hyaku/disk-guard.sh status` → rc 0, 419.8G free on `/fast`.
- Mirror built exactly like `mkMirror` (`scripts/negatives-filechooser-r77.mjs:416-427`): `rm -rf m && mkdir -p m/.ufo/waves/round-77 m/corpus/evidence && ln -sfn $LANE/scripts m/scripts`, every top-level entry of the real `.ufo/waves/round-77` symlinked into `m/.ufo/waves/round-77/`, `corpus/evidence/round77` symlinked whole. One documented strengthening deviation: an extra `m/.ufo/waves/round-77-seats` symlink → the real seats tree (read-only direction; mkMirror does not have it), so "seats not walked" is tested even through a symlinked seats dir.
- Seats copies (SEAT-OUTPUT RULE zone): `cp $LANE/corpus/evidence/round77/chromium-file-chooser/receipt.json $SEATS/receipt-committed.json` (sha256 `1d3c24755770ad1a58c97eb67c7230a8c909a10fd66479d5739d9f87be50374d` — byte-identical to the original, verified); smoke1 copy with nonce rewritten `tabi-r77-smoke1` → `tabi-r77-exec4-smoke1x` (all other bytes equal, verified programmatically).
- Every run: `node check-filechooser-r77.mjs --lane <mirror> --receipt <real committed receipt> --expect-driver-sha256 9954db07...58a6 --expect-nonce tabi-r77-l1-dcdf582add58 --prior-set <real prior-set.txt> --json`. Counter validates the receipt under test identically in every run (183 checks each, receipt checks all green); the only variable is the walk content.

## Results (11 runs; full stdout JSON at `.ufo/waves/round-77-seats/R77Exec4/out-<case>.json`, all stderr 0 B)

| Case | Setup (inside `m/.ufo/waves/round-77/exec4-probe/` unless noted) | rc | Finding ids | Declared semantics hold? |
|---|---|---|---|---|
| R0-baseline | empty probe dir | 0 | — | yes — mirror reproduces leg (a): clean, 183 checks, 19 prior lines |
| R1-seats-invisible | `cp` committed receipt + `smoke1-renonce.json` into the REAL seats tree (seats tree symlinked into mirror) | 0 | — | yes — limit sentence (counter header line 50-51) confirmed: seats tree is not one of the two walked trees (`check-filechooser-r77.mjs:279` hardcodes `.ufo/waves/round-77`, `corpus/evidence/round77`) |
| R2-link-committed-copy | `ln -sfn $SEATS/receipt-committed.json link-committed.json` | 0 | — | **hypothesis falsified for this receipt**: symlink IS followed and the file IS parsed, but `j.nonce !== expectNonce` (`check-filechooser-r77.mjs:277`) exempts it — visible to the walk, refused by nothing |
| R2b-link-corpus-receipt | `ln -sfn <real corpus receipt> link-corpus.json` | 0 | — | yes — same nonce exemption; corpus occurrence then realpath-deduped |
| R3-link-foreign-nonce | `ln -sfn $SEATS/smoke1-renonce.json link-smoke1x.json` | 1 | `prior-set-complete` | yes — outside lists exactly `.ufo/waves/round-77/exec4-probe/link-smoke1x.json`; hypothesis part 2 holds for foreign-nonce receipts |
| R4-hardlink | `cp` smoke1-renonce → `hard/a.receipt.json`; `ln hard/a.receipt.json hard/b-link.same.json` (same inode 1145666405, verified via `stat -c %i`) | 1 | `prior-set-complete` | yes — **both** names listed in outside; dedupe is realpath-only (`real()` at `:257`, `seen` at `:270`), hard links are separate paths, not deduped. Cross-device `ln` from seats → mirror fails: `ln: ... Invalid cross-device link` (`ln-cross-device.err`) — seats (/home, `/dev/mapper/root`) and walked trees on /fast (`/dev/nvme1n1p2`) can never share inodes, so the hard-link smuggle from seats is topologically impossible here |
| R5-no-read-perm | `cp` smoke1-renonce → `secret.receipt.json`; `chmod 000` | 1 | `prior-set-unparsable` | **counter REFUSES, does not skip**: `.ufo/waves/round-77/exec4-probe/secret.receipt.json (unreadable)` — `readFileSync` failure is bucketed as unparsable at `:271` |
| R6-70mb-padded | 70,400,086-byte valid JSON `{schema, nonce: tabi-r77-exec4-smoke1x, pad}` written as `big-padded.txt` | 1 | `prior-set-complete` | yes — read whatever the extension, parsed (0.69 s), no size cap anywhere in the walk; padding does not evade classification |
| R7-cycle | `ln -sfn .. loop` (symlink cycle back into the walked dir) | 0 | — | yes — terminates, cycle cut by realpath dedupe (`:263`), 0.15 s |
| R8-broken-schema-json | `printf '{"schema":"tabi-chrome-cdp-filechooser-r77", TRUNCATED-BROKEN' > broken.receipt.json` | 1 | `prior-set-unparsable` | yes — declared refuse-not-skip for JSON-looking schema-bearing unparsable files (header line 28-30) |
| R9-prose-names-schema | prose sentence naming the schema in `notes.md` | 0 | — | yes — prose is not a receipt (not JSON-looking: first 64 bytes fail `/^\s*[[{]/`, name not `.json`), skipped silently |
| R10-forged-expected-nonce | forged, non-identical JSON `{schema, nonce: tabi-r77-l1-dcdf582add58, events: [], forged: true, pad}` as `forged-expected-nonce.json` | 0 | — | **gap**: an extra walked receipt is exempt whenever its self-claimed `nonce` equals `--expect-nonce` — prior-set-complete cannot see it |

## Declared walk semantics (counter header lines 26-30) vs observed

1. "reads every file WHATEVER the name or case of the extension" — holds (R6: `.txt` parsed and classified).
2. "symlinks are followed (files and directories, real paths de-duplicated, cycles cut)" — holds (R3 file symlink; mirror directory symlinks in every run; R7 cycle cut; realpath dedupe at `:263,270`).
3. "a file that carries the schema string is parsed" — holds (R6, R3).
4. "JSON-looking + unparsable is refused (`prior-set-unparsable`) instead of skipped" — holds (R8); extends to unreadable files, bucketed `(unreadable)` (R5), which the header sentence does not name but the check detail string does.
5. "prose that names the schema is not a receipt" — holds (R9).
6. Limit sentence (lines 50-51): "nor a receipt outside the prior set and outside the two walked trees" — holds (R1, seats tree invisible even when symlinked into the lane).

The one behavior the D2 header sentences do not state — and the hypothesis missed — is the run-under-test nonce exemption at `:277` (`j.nonce !== expectNonce`); it IS declared in the `prior-set-complete` check detail ("not the run under test (nonce ...)") and is what keeps leg (a) clean with the receipt living in `corpus/evidence/round77`.

## Finding for the L1 (attack result; predicate frozen, no amendment proposed)

`prior-set-complete`'s walk exemption is keyed to the walked file's **self-claimed** `nonce` field, not to file identity. Consequences, all demonstrated in the mirror:
- A byte-identical copy of the run-under-test receipt at a new walked path is exempt (R2) — benign.
- Any *other* crafted file whose top-level `schema` is the receipt schema and whose `nonce` equals `--expect-nonce` is invisible to prior-set-complete, whatever else it contains (R10: rc 0, findings []). A same-nonce second receipt could therefore sit in a walked tree undeclared.
- Everything else is tight: foreign-nonce receipts are caught via file or symlink (R3) or hard link (R4); refusal paths refuse (R5, R8); padding and extensions do not help an evader (R6); seats placement evades only because the walk trees are hardcoded, exactly as the limit sentence declares (R1).

## Bounds compliance

Writes: only `/fast/scratch/hyaku/tabi-r77/R77Exec4/` (mirror + probe.sh, removed: `rm -rf` executed, exit 0) and `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-77-seats/R77Exec4/` (11 `out-*.json`, 11 empty `err-*.txt`, `ln-cross-device.err`, `receipt-committed.json`, `smoke1-renonce.json`). Nothing written into `.ufo/waves/round-77/` or `corpus/evidence/round77/` — the mirror's walked-tree entries are symlinks that were only read; the probe dir was a real mirror-local directory. No git/jj mutations (no git invocation at all). No tool installs. No delegation, no subagents.

Evidence: `.ufo/waves/round-77-seats/R77Exec4/out-R0-baseline.json` … `out-R10-forged-expected-nonce.json` (11 files), `err-*.txt` (all 0 B), `ln-cross-device.err`, `receipt-committed.json` (sha256 `1d3c24755770ad1a58c97eb67c7230a8c909a10fd66479d5739d9f87be50374d`), `smoke1-renonce.json`. Setup commands verbatim: `/fast/scratch/hyaku/tabi-r77/R77Exec4/probe.sh` (scratch copy, since removed — its full text is quoted case-by-case above and every command is reproducible from this report).
