# ConnSiblingProc — kama/souji process-socket overlap refresh

Seat: connector (leaf, no subagent dispatch). Tabi round 43, attempt 1, policy-v2 wave 1.
Axes named: **adjacency** (round-43 judged axis), **coverage**, **freshness**, **calibration**.
Every command ran read-only against `/home/vgpnk/Projects/shokunin` and its lanes; no fleet, lane
or production file was written; no git/jj mutation anywhere except a `--no-checkout` scratch clone
of tabi under my own scratch root (objects only, deleted before yield). No installs (PACMAN guard
respected; nothing needed). No network beyond local files. Scratch:
`/fast/scratch/hyaku/tabi-r43/ConnSiblingProc/` (deleted before yield).

Pins read at start (`evidence/ev-01-pins.txt`, 2026-10-29T20:58Z): tabi `ba433c94` (master; 9
commits past round-42's pin `0081bfd`), kama `361c620c` (15 commits past round-42's pin
`7ee8cbdf`), souji `6a3f7594` (102 commits past `131ea87`). Round-43 frozen bytes hashed, read-only:

```
290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029  .ufo/waves/round-43/claims.json
6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c  .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs
2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743  .ufo/waves/round-43/counters/check-routed-defects-round43.mjs
```

Refresh window: sibling material committed since the round-42 ConnSiblingProc observation
(kama/souji pins of 2026-10-28) — kama rounds 63-64, souji rounds 38-42.

---

## 1. Direct answer to the seat question

**Does either lane hold new browser/process/socket instrumentation ground that tabi's PROVINCE covers?**

- **Browser ground: neither lane, nothing.** Zero new browser-instrumentation bytes in kama
  rounds 63-64 or souji rounds 38-42 (`evidence/ev-03-kama-browser-scan.txt`,
  `evidence/ev-04-souji-scan.txt`). kama's only browser-adjacent new artifact is a sentinel's
  captured GitHub HTML page stored as quarantine evidence (`.ufo/waves/round-63/w1/out/
  SC05QuarantineB/S211.md`) — an evidence capture, not a claim to browser instrumentation.
- **Process/socket ground: kama yes, souji no — and kama's new ground is llama-server serving
  identity, which kama's own cross-lane scope assigns to kama, not to tabi's province.** tabi's
  PROVINCE (browser & web-interaction craft; CDP session discipline; browser inventory) is not
  invaded.
- **The split is now bilateral on the record.** kama's own fleet overlap scan, seat
  `CN02SiblingOverlap` (round-64 wave b, committed 2026-10-28), classified tabi's
  fd-inode join as **"DUPLICATE (primitive), different job … Cite; do not merge"** (its row D1,
  naming `playwright-firefox-session-bound-tcp-round-39.md` + the egress scripts) and recorded the
  headline **"No sibling ships a pinned-binary verifier for a served process"**
  (`evidence/ev-07-kama-cn02.txt`). It also logged two tabi methods as reusable for kama (R2: the
  `0100007F:8AEF` endian fixture; R3: the environ-is-exec-time-only caveat). Both lanes now point
  at the same mechanism split from opposite sides.

## 2. What kama actually landed (rounds 63-64; 13 corpus+tools files, ~6.2k insertions)

New files checked (`evidence/ev-02-kama-diffstat.txt`): lessons `round-63.md`, `round-64.md`,
`round-63-verifier-spotcheck.md`; `knowledge/completion-request-plane.md` (modified);
tools `round63-c1-counter.py` (735 lines), `round63-c2-counter.py` (555), `round64-c1-counter.py`
(2059), `round64-c2-counter.py` (1825), `kama-completion-live.py`, `shortcut-tally.py`,
`round42-selfdesc-reconcile.py`. New ground, stated precisely:

1. **Round-63 falsification** (`corpus/lessons/round-63.md:25`): a counter that re-derives a
   receipt from the tool it judges "cannot tell a real listener from an answerer" — forged tool
   whose real child holds an inherited listener fd while a canned server answers (forgery A), and
   one where no llama-server runs at all (forgery B); both print `met=True`, 44/44. Claim
   "falsified, not repaired"; the frozen counter stays byte-intact. Plus the helper-provenance
   hole MT15: the counter obtains ownership via `port_owned_by` loaded **from the tip tree under
   judgment** (`round-63-verifier-spotcheck.md:39-41,100`).
2. **Round-64 repair plan and new source rows** (`corpus/lessons/round-64.md`, rows in
   `evidence/ev-06-kama-s529-s534.txt`): **S529 proc_pid_fd(5)** admitted with located quote
   ("the join of the listener inode to every holder"; the `PTRACE_MODE_READ_FSCREDS` limit
   stated); **S530 proc_pid_stat(5)** field 22 `starttime`; **S531** environ-is-exec-time-only;
   **S532** cmdline argv-rewritable (MT04 A3: argv rewriting passed `bind_argv`; killed only by
   `bind_exe`/`bind_maps`); **S533** status State/TracerPid; **S534** namespaces equality check;
   **S536 sock_diag(7) rejected** (flip: a netlink reader). S508 `/proc/<pid>/map_files`
   rejection restated (CAP_SYS_ADMIN/CAP_CHECKPOINT_RESTORE since 5.9). MT06: path+sha256 alone
   insufficient; `bind_ref_files` compares (path, device, inode) against the counter's own
   reference server.
3. **Knowledge entry drafted but NOT admitted.** `corpus/knowledge/process-bound-listener.md`
   exists only as the round-64 wave-b draft `.ufo/waves/round-64/b/out/SB01Knowledge/
   process-bound-listener.md` (27/27 quotes verified, pinned `f6a4ea9a`); the revise seat
   SB04KnowledgeRevise never ran, so S529-S534 stay `queued` with `used-by` `—` and
   `ls corpus/knowledge | grep -i process-bound` → empty (`evidence/ev-02`).
4. **No browser bytes anywhere new:** browser-term greps over the four new/changed corpus files,
   the six changed tools, and every committed file under kama `.ufo/waves/round-63` and
   `round-64` return hits only in CN02SiblingOverlap's three scan files, which *name tabi's tools*
   (`evidence/ev-03`).

## 3. What souji landed (rounds 38-42; 102 commits) — nothing on any of the three surfaces

New files checked (`evidence/ev-04-souji-scan.txt`, `evidence/ev-05-souji-subjects.txt`):
lessons `round-38..42.md` + spotchecks `round-37..41`; knowledge
`docstring-class-continuation-{lines,source-correction}-r40`,
`drift-record-invalid-utf8-{,source-correction}-r40`, `git-strict-descendant-relation-r40`,
`origin-record-format-gvfs{-read-boundary}-r40`, `jj-colocation-receipts`; tools
`souji-freeze-check.py` (new), `souji-citation-reconcile.py`, `souji-worktree-drift.py`. Subjects:
repo hygiene — a preregistration freeze checklist read from the git object store, citation
reconciliation, worktree drift, docstring/UTF-8/GVFS origin-record format rules.

- Instrumentation grep (`playwright|firefox|chrome|chromium|cdp|devtools|browser|/proc/net|
  socket|inode|process-tree|/proc/<pid>|listener`) over **all** changed souji corpus+tools files:
  zero hits, no match lines printed.
- Whole-corpus re-checks: still exactly **one** `/proc`-socket hit (`lessons/round-33.md:22`, the
  old S225 row, pre-window); zero browser hits in souji corpus or tools;
  `process-residue-observations.md` byte-stable since 2026-10-21 (`4eb2fda`).
- souji's proc-census tools cited in kama's CN02 scan (row D4, `(deleted)` link reading) are
  pre-existing — none of them is in this window's diff.

## 4. tabi registry state — the round-42 finding is still unlanded, and one gap-table cell is now stale

```
$ git -C tabi-shokunin diff 0081bfdb..ba433c94 -- corpus/adjacency.tsv | wc -l
0                                          # byte-identical across the rejected r42 closure
$ wc -l tabi-shokunin/corpus/adjacency.tsv ; grep -n -E 'kama|souji' corpus/adjacency.tsv
17  (header + 16 rows); kama: exactly 1 row (row 11, cdp-live-target-census, contested-open,
    stale round-17 CDP-9222 surface); souji: 0 rows
$ grep -rn -E 'loopback-listener-ownership|proc-residue-observation' tabi-shokunin/corpus | wc -l
0                                          # the round-42 proposed rows never landed
```

(`evidence/ev-08-tabi-registry.txt`.) Round-42's connector proposed two gate-verified
`split-declared` rows; they were never landed, so QUALITY.md rule 32 (a sibling scope overlap is
dispositioned in a committed `corpus/adjacency.tsv` row with pinned resolving quotes) remains
unmet for two live overlaps, and the ledger's only kama row still points at a round-17 commit and
the wrong surface. **Freshness correction to the round-42 report's §4 gap table:** the cell
"proc_pid_stat(5) field 22 — nobody in the fleet holds a located-quote row" was true on
2026-10-28 and is stale now — kama **S530** holds exactly that row (queued, located quote,
fetched-bytes pinned, `evidence/ev-06`). The round-42 remedy is unchanged: tabi should open
proc_pid_fd(5)/proc_pid_stat(5)/the tcp6 printer in its **own** registry; a sibling corpus remains
a non-citable route for tabi's SOURCES.md.

## 5. The one bounded move — land the two rows (re-verified at the round-43 pin)

Row content is unchanged: the controlling sibling entries are byte-stable (kama
`loopback-listener-ownership.md` @ `0c75c611`, untouched since 2026-10-21; souji `SOURCES.md:172`
quote). I re-ran the lane's own gate, unmodified, on a `--no-checkout` scratch clone of tabi at
`ba433c94` — sibling refs resolved against the live fleet; nothing written to the lane
(`evidence/ev-09..ev-11`):

```
control    node scripts/check-adjacency.mjs --repo $S/tabic --fleet <fleet> --at ba433c94
           → verdict=clean rows=16 verified=16 findings=[] selfRulings=[2]
candidate  --at cdf463095b5e300a72b508fac2a87d2d9b46e825
           (parent ba433c94; corpus/adjacency.tsv +2 rows, bytes identical to round-42
            w1/ConnSiblingProc/ev-09-candidate-rows.tsv)
           → verdict=clean rows=18 verified=18 findings=[] selfRulings=[2]
```

Delta is exactly `+2` verified rows; `selfRulings [2]` is the pre-existing round-16 integrator
ruling, identical in both runs. **Affected axes:** adjacency — improves on the axis's own counter
(ledger 16 → 18, rule 32 met for both overlaps, the round-40/42 finding corpus-landed with pinned
quotes); freshness — improves (kama's 2026-10-28/29 process-bound-listener facts become citable
in-corpus rather than lost in a rejected closure); coverage — neutral (the §4 registry gap is
routed, not absorbed; no SOURCES.md row is proposed); calibration — neutral (no claim, counter or
frozen byte touched). **Risks** (unchanged from round-42): `adjacency.tsv`/`SKILL.md` are
integrator-owned shared surfaces; a `ruled` disposition would fail the gate (`check-adjacency.mjs`
requires a non-tabi-authored ruling naming the sibling — none exists for kama/souji); keep both
rows at the mechanism split — kama reads `local_address` as an admissibility gate on its own port
plus a host-wide census, tabi reads `rem_address` for session-scoped peer classification, souji
reads residue after exit.

---

## Limitations

- Read-only seat: the move is re-verified on a scratch clone, not landed; the integrator owns
  `corpus/adjacency.tsv` and any SKILL.md bullet.
- The gate certifies citation/venue resolvability at pinned commits, not bilateral agreement —
  which is precisely what `split-declared` records.
- kama and souji were advancing while earlier round-43 seats ran; pins are the values read at seat
  start, and every cited sibling commit is an ancestor of the observed `refs/heads/master`, so
  later landings cannot break reachability.
- No quarantine duty, no URL fetch, no browser run, no counter execution: the frozen round-43 C1/C2
  bytes were read and hashed only, never run.
- Files checked are named per section; wave-output spot checks were grep-led over committed
  `*.md`/tools, not a seat-by-seat read of kama round-64 wave b's 42 reports.

VERDICT finding — nothing new in kama r63-64 or souji r38-42 is browser ground tabi's province covers (kama's new socket ground is llama-server process-bound-listener work it scopes to itself — S529-S534 queued, knowledge draft committed but unadmitted; souji landed zero instrumentation) and kama's own round-64 CN02 scan now bilaterally records tabi's fd-inode join as same-primitive/different-job (cite, do not merge), but tabi's registry still fails rule 32 for both overlaps — the round-42 two-row split-declared fix re-verifies clean at ba433c94 (control 16/16, candidate 18/18, findings none, selfRulings unchanged) and should land this round, with round-42's §4 gap table stale in the proc_pid_stat cell since kama S530 now holds that located-quote row.
