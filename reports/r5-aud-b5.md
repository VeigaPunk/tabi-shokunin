# AUD-B5 — round-5 audit: archive MANIFEST sets · lessons gates · L0 line

Lane AUD-B5, 2026-10-14. Write scope: this file only. Nothing else in
tabi-shokunin was edited by this lane — all evidence reads were read-only;
scratch `/tmp/w5-aud-b5-{work,evidence}/` (volatile). Audit boundary: the B5
deliverables were frozen when audited — manifest headers stamp 17:03:39Z,
lessons 14:04–14:05 local, L0 append 14:05:06 + newline-normalization 14:05:52
local; my poller declared the state stable (4×15 s, fp `6b2f67f9dd1e08da`)
at 17:06:58Z; checks ran 17:06:54–17:07:43Z; no audited artifact changed
between the checks and the closing snapshot 17:08:44Z (hash equality, §5).

Task: audit the archive — (1) verify 3 MANIFEST.txt hash sets against the
owning notes' pins (equality); (2) verify `corpus/lessons/` has 4 files each
with a `## Gate`; (3) verify the `.ufo/l0-questions.md` line format.
Verdict table; do NOT edit. No external site was contacted; /tmp and the lane
tree were read-only for this lane.

Scope note (observed): the archive now holds **25 groups / 25 MANIFEST.txt**
(`corpus/evidence/`, per-group `MANIFEST.txt` + in-group `sha256sum -c`
instruction; receipt `corpus/knowledge/archive-receipt-r5.md`, 179 lines).
This lane's brief caps verification at **3 sets**; selection rule = three sets
whose manifest headers declare three *distinct owning notes across three
rounds*: `tabi-r2-2-state` (webbridge-daemon-disposition.md §8 — full-64
pins), `tabi-r3-1-journey` (multi-step-journey.md §1–§2 — 12-hex + full-64
pins), `w4-t41-network` (network-evidence-rung.md §2 — 12-hex pins). The other
22 sets' pin equality is **not** verified by this lane (U1).

## 1. Verdict table

| # | check | scope | method | result | verdict |
|---|---|---|---|---|---|
| 1a | MANIFEST set A ↔ note §8 | `tabi-r2-2-state` 6 files | re-hash + mechanical pin extraction | `sha256sum -c` exit 0, 6 OK / 0 FAILED; **6/6 full-64 pin instances MATCH** | **PASS** |
| 1b | MANIFEST set B ↔ note §1–§2 | `tabi-r3-1-journey` 63 files | re-hash + mechanical pin extraction | exit 0, 63 OK / 0 FAILED; **33/33 pin instances MATCH** (9 × 12-hex names + 24 full-64 PNG/shape rows) | **PASS** |
| 1c | MANIFEST set C ↔ note §2 | `w4-t41-network` 200 files | re-hash + mechanical pin extraction | exit 0, 200 OK / 0 FAILED; **13/13 pin instances MATCH** | **PASS** |
| 1d | manifest ↔ directory parity (3 sets) | 269 entries | resolve every entry; sweep for unlisted files | unresolvable = 0; files-not-in-manifest = 0 in all three sets | **PASS** |
| 1e | byte-identity to source (3 sets) | 6 + 63 + 200 files | archived sha256 vs live `/tmp` source sha256 | 269/269 IDENTICAL; source-missing = 0 | **PASS** |
| 2 | lessons gates | `corpus/lessons/round-{1,2,3,4}.md` | `ls` + `grep -c '^## Gate'` | 4/4 files; one `## Gate` each; sections carry candidates / admitted / rejected-with-reasons / spot-check | **PASS** |
| 3 | L0 line | `.ufo/l0-questions.md` | pre/post byte compare + format regex | exactly **one** line appended (line 25); format `<lane> \| round-<N> \| <question>` exact; packet + sha256 cited | **PASS** |

Aggregate: **52 pin instances compared, 52 MATCH, 0 mismatch; 269 re-hashed
files OK; 0 discrepancies.** No append-only or write-scope violation was
found in the audited artifacts.

## 2. Equality detail

- **Set A** (`tabi-r2-2-state`, owning note `webbridge-daemon-disposition.md`
  §8 "Evidence files (scratch; volatile — pins recorded here)"): six files,
  six full sha256 pins extracted from the note's table rows; every manifest
  value equals its pin (e.g. `tabi-r2-2-baseline.txt`
  `b255d1f80d59d4ea…03902`, `tabi-r2-2-final-state.txt`
  `7c508bdbe3c922e4…2038b1`; full list in the audit log).
  Extraction was mechanical (rows containing `/tmp/tabi-r2-2-*` + 64-hex).
- **Set B** (`tabi-r3-1-journey`, note `multi-step-journey.md` §1–§2): the six
  `site/` fixture pins (`index 42d7a35b82be`, `detail 353d8107a072`, `form
  50d811502ef8`, `confirm 84b6ea0c17f4`, `style 6380986105b3`, `data
  bf141027b3ef`) + harness (`journey.mjs b52074a33876`, `driver.sh
  9509c07f49f9`, `compare.mjs ecce1c73dc56`) + all 12 PNG full-64 and 12
  shape full-64 values — all equal, run1 ≡ run2 for every PNG/shape pair,
  reproducing the note's byte-determinism claim inside the archive.
- **Set C** (`w4-t41-network`, note `network-evidence-rung.md` §2): fixture
  (`site/index.html 9736f2ef9f05`, `async 1ab7b86f55c7`, `confirm
  23e39f537f25`, `style a984704c5702`, `slow.json 274e22192d1d`,
  `quick.json 3dee70f8b9fd`) + `server.py a5ceef29fae5` + harness
  (`net-journey.mjs 46c81f99decf`, `net-driver.sh 67c94a3a275d`,
  `compare.mjs 9823428b4a40`, `summary.mjs ae5c8fee0d68`, `pixel-scan.py
  34b802d04cd9`, `pngdiff.py 24565a826526`) — all equal.
  Path nuance (observation, not a failure): the note's §2 table captions the
  fixture as `/tmp/w4-t41-network/site/`, but `server.py` lives one level up
  (source `/tmp/w4-t41-network/server.py`) and is archived at the set root
  (`server.py`) — its hash still equals the pin.
- Extraction hygiene (recorded because two artifacts appeared and were
  resolved): a first extractor pass that took the *first hex on the matching
  line* flagged three rows (`confirm.html`, `driver.sh`, `compare.mjs`) and
  set C's harness names; all three were **extraction artifacts** (name
  adjacency / the notes wrap `driver.sh`-class pins onto the next line), not
  hash mismatches. Corrected extraction (name-adjacent; newline-tolerant for
  the wrapped pins) yields MATCH for every one. Detail evidence:
  `/tmp/w5-aud-b5-evidence/{audit-sets.txt,audit-sets2.txt}`.
- Bonus corroboration (beyond the brief): each set's in-group
  `methodology-sha.txt` re-checks clean (`sha256sum -c` exit 0 in sets B and
  C); sets B and C include it; set A has no such file.

## 3. Lessons — `corpus/lessons/` (4 files, each with `## Gate`)

| file | lines | `## Gate` at | sha256 (first 16) | Gate content |
|---|---|---|---|---|
| `round-1.md` | 59 | 32 | `bdd46c85b349d37d` | candidates / 3 admits / 3 rejects+incident / scribe spot-check / re-run |
| `round-2.md` | 60 | 39 | `a862d69cb0b90d6e` | candidates / 2 admits / rejects+deferrals / spot-check / falsifier + carried debt |
| `round-3.md` | 68 | 48 | `153a1b9831bb3ed1` | candidates / 3 admits / gaps kept / spot-check / falsifier + carried debt |
| `round-4.md` | 87 | 64 | `cde3960eb1a93366` | candidates / admits / rejects+deferrals / SC-A…D spot-check / falsifier + carried debt |

All four conform to the plan clause (b) shape (`plans/round-5.plan.md`: `##
Gate` = candidates / admitted / rejected with reasons / spot-check result).
Round-4's is assembled from `plans/round-4-record-draft.md` as designed.

## 4. L0 line — `.ufo/l0-questions.md`

- Pre-state (my snapshot 17:03:38Z): 24 lines (`wc -l`), 20,653 bytes,
  sha256 `0a86973bd17c37f7fa454cde82aad0d8b41cbdcca37de2315b7a563a149de6f3`,
  zero `tabi` lines.
- Post-state (audit): 25 lines, 21,539 bytes, sha256
  `02c53ec60acfda4889e0cd57eb08e8f1bd5583708fcb8399bfc5a5593713613f`.
- **Append-only proof:** `head -c 20653` of the post file hashes to
  `0a86973b…` (byte-identical prefix) — the only change is a 886-byte suffix
  (one line + newline). `git diff --stat` on the main repo: 1 insertion.
- **Format:** line 25 = `tabi | round-5 | Operator approval requested — filed:
  tabi-shokunin/corpus/handoffs/operator-approval-request.md sha256
  94dc63f5… (<121 lines; harness-only, no session, no operator tab). …` —
  matches `<lane> | round-<N> | <question>`; the cited packet exists and its
  on-disk sha256 **is** `94dc63f5fb9e3d9818008663fe46a4d08776ff7d79a7a1a821903b2d0f1ac0aa`
  (corroboration, not scope: packet itself not audited here).
- Chronology observation: the first append (14:05:06 local) ended **without**
  a trailing newline (21,538 bytes, `wc -l` still 24 — the source of the
  transiently confusing line count); a newline was appended at 14:05:52,
  46 s later. Final state is clean; recorded because `wc -l` alone is not the
  line-count witness after such an append.

## 5. Spot-checks (three, exact)

1. **Re-hash all three sets:**
   `cd corpus/evidence/<set> && sha256sum -c MANIFEST.txt` →
   `tabi-r2-2-state` 6 OK/0 FAILED (exit 0); `tabi-r3-1-journey` 63 OK/0
   FAILED (exit 0); `w4-t41-network` 200 OK/0 FAILED (exit 0).
2. **Full-64 equality example (set B):** manifest
   `run1/step-3-form-filled.png 8cc96fdf637a606e…b8ad7c` == the note's
   §2 bullet value, and `run2/step-3-form-filled.png` identical; same for
   `site/` six fixture pins vs §1 table.
3. **L0 boundary:** `head -c 20653 .ufo/l0-questions.md | sha256sum` =
   `0a86973b…` (equals my pre-state snapshot) and
   `grep -c '^tabi | round-'` = 1.

## 6. Unknowns / notes (observation / inference / unknown kept separate)

- **U1 (unknown):** 22 of 25 sets were not pin-audited (brief cap = 3 sets).
  Their manifests exist and declare pin sources; unverified by this lane.
- **U2 (boundary):** this audit is a snapshot. The owning notes used as pin
  sources are currently dirty vs HEAD (`M corpus/knowledge/*.md` — round
  machinery); a later edit cannot retroactively invalidate the checked bytes,
  but pin-source hashes below should be re-checked before citing.
- **U3 (observed, resolved):** L0 interim state without trailing newline
  (14:05:06→14:05:52); normalized; final state asserted above.
- **U4 (observed, resolved):** a stray empty directory `corpus/evidence/1000`
  existed at ~14:02–14:03 local (seen in my pre-state listing) and is absent
  from the audited 25-group tree; no file impact found.
- **U5 (out of scope):** exclusion completeness (`*profile*` bytes never read,
  shape-only) and the receipt's widened exclusion rule are B5-1 claims I did
  not re-verify; not part of this brief.
- Manifest headers cite `archive-receipt-r5.md` SC2 for the byte-identity
  claim — the file exists (179 lines); my direct source-compare (§2) is
  independent corroboration on the 3 audited sets.

## 7. Audited-state snapshot (sha256)

```
47186827a24edffd0a01749a45b48ae1eb155d57d804be0b2375a076626e8e65  corpus/evidence/tabi-r2-2-state/MANIFEST.txt
661ba59d643ffac3347d61d0998a6b56233884e235bd41f34c7a12010313f799  corpus/evidence/tabi-r3-1-journey/MANIFEST.txt
6afffe6c748fdeae20aa9cd5170fb4255bc677c070198fc5f86b9ad6f49102e1  corpus/evidence/w4-t41-network/MANIFEST.txt
bdd46c85b349d37dfe566e10b97a63cd384ba15ac6348905c8b8c0818e1a458e  corpus/lessons/round-1.md
a862d69cb0b90d6ed69a133126e31cfc1c183c59ce411bf8be36b8435afc2536  corpus/lessons/round-2.md
153a1b9831bb3ed11ec61a36018a826864ee1ba7aa8f5b807b10f154999e1f0a  corpus/lessons/round-3.md
cde3960eb1a9336622a27bc69d0345a74dc6d65f101e59b6ef0e5823041e2c15  corpus/lessons/round-4.md
02c53ec60acfda4889e0cd57eb08e8f1bd5583708fcb8399bfc5a5593713613f  .ufo/l0-questions.md
7e9185cc1f68149cf2655d5065ed050c9e149cbfb5262effc984b28624491cdd  corpus/knowledge/webbridge-daemon-disposition.md (pin source, set A)
f5019cd58a5c69ae7e53dcd719038394673d5c4f9509c9adbca414a16b52e247  corpus/knowledge/multi-step-journey.md (pin source, set B)
418b3bd25804c2de9140d8efad59328d4317d184617e72c498b1ec91516b2b3d  corpus/knowledge/network-evidence-rung.md (pin source, set C)
b41c2f6fb5a43483e4e84cdc916f736ceff214e98584bb3aafd923291b4d9f5f  corpus/knowledge/archive-receipt-r5.md
```

Verdict: **all three audited clauses PASS.** Nothing in this audit blocks the
round's freshness claim; the residual risk is scope (3/25 sets), recorded in
U1 rather than absorbed.