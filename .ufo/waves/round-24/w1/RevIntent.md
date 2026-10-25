# RevIntent — reconstructing two round-23 artifacts (scratch over-commit; c1 before.exit)

Seat: `L1Tabi24.RevIntent` (read-only reporter). All commands were run in
`/home/vgpnk/Projects/shokunin/tabi-shokunin` (lane root) against read-only git
(`git show` / `git ls-tree` / `git cat-file` / `git grep` / `git log`). No repo files were
edited; the only output is this report. Nothing installed (no tooling change this seat).

---

## (a) The wholesale commit of `.ufo/waves/round-23/scratch/`

### What the wave specs prescribed (the design intent)

Both wave contracts put scratch *outside* the land set. From `.ufo/waves/round-23/w1-spec.json` and
`w2-spec.json` ("# Contract" paragraphs):

> "Write ONLY your single report file under … `w1/`/`w2/` plus **throwaway fixtures** under
> `…/scratch/<YourName>/`."

So per-seat scratch was defined as throwaway working space by the round's own specs. The only
things a seat was supposed to produce on the committed side were its report
(`w1/*.md`/`w2/*.md`) and the round's shared machinery (specs, dispatch, record, spawn results,
registries) plus the outcome files (script, corpus evidence, fixtures/ control).

### What the L1 intended to land (its own statement)

`LOG.md` §Round23 ("Landed paths", at baseline `573c99e`):

> "Landed paths: `scripts/round-evidence-audit.mjs`,
> `.ufo/waves/round-23/fixtures/{skipwork-control.mjs,skipwork-receipt.json}`,
> `corpus/evidence/round-23/c1-measurements.json`, `corpus/knowledge/csrf-defense-shape-boundary.md`,
> `corpus/SOURCES.md` (+2 rows), `corpus/README.md`, `corpus/QUALITY.md`,
> `corpus/lessons/round-23.md`, `LOG.md`, `SCORECARD.md`, and the wave evidence under
> `.ufo/waves/round-23/` (specs, dispatch payloads, registries, `record` receipts, spawn results,
> 88 seat reports, **scratch fixtures**)."

The L1's intended set = the script, the `fixtures/` control pair, the corpus/evidence/knowledge
deliverables, and the wave evidence (specs, dispatch, registries, receipts, spawn results, 88 seat
reports). The LOG line shows the L1 *folded "scratch fixtures" into the wave-evidence list* — i.e.
the lander treated the whole wave directory as landable and did not filter scratch out.

### How the rest came along (evidence chain)

1. **The first land was a whole-directory sweep, mid-production.** `03c1b4d` (round-23's landing
   commit) added 926 paths; **868 were scratch** and 62 were everything else
   (`git show --name-status --format='' 03c1b4d | grep '^A' | grep -c 'scratch/'` → 868).
   `W2Prune.md` measured it live: "868 scratch files (23.6 MB, 292 unique blobs)" and observed the
   commit was created while seats were still writing (committer 04:28:10 vs author backdated to
   03:50:10). No filter separated the working fixtures from the evidence.
2. **A seat explicitly warned to drop scratch — the warning did not change the landing.**
   `W2Prune.md`: "Must not be added; 868 must be dropped before landing: `scratch/**`
   (throwaway fixtures by contract, incl. a skip-work control), `assimilation/validate/corpus/**`
   (gate mirror, not evidence), `measure.mjs`, the 4 zero-byte `.err`." The scratch stayed.
3. **The bulk grew after the first land.** Scratch adds per later commit: `af00b59` +165,
   `2433ed2` +2, rest 0 (`git show --name-status --format='' <c> | grep '^A' | grep -c 'scratch/'`).
   At the tip the count is **1,034 paths / 26,999,535 bytes**
   (`git ls-tree -r --name-only 573c99e -- .ufo/waves/round-23/scratch | wc -l` → 1034;
   `git ls-tree -r -l … | awk '{s+=$4} END{print s}'` → 26999535).
4. **The round itself disclosed the over-commit and owed a cleanup that never landed.**
   `LOG.md` §Round23-post-landing: "M5's scratch count is corrected to the measured 1,034 paths"
   (`b905efb`), and "Not fixed, disclosed: `M5` (scratch over-commit, cleanup commit owed)".
   `W2SelfAudit.md` finding 1: "M5 is still open and larger than disclosed — 1034 scratch files are
   committed at the tip … the report (§Defects this round leaves open) promises a follow-up cleanup
   and cites 868 — the count has grown since." The non-author verifier routed the same:
   `corpus/lessons/round-23-verifier-spotcheck.md` lines 97–100: "`git ls-tree -r c90dffd
   .ufo/waves/round-23/scratch | wc -l` → 1,034 paths, 25.7 MB … The report promises 'a follow-up
   cleanup commit removes the committed scratch'; it never landed, and `.ufo/waves` holds 1,139
   committed paths for the round."
5. **None of the 1,034 scratch files is functionally required by the shipped gate.** The auditor
   deliberately reads only top-level wave files: `scripts/round-evidence-audit.mjs:298` —
   "A wave spec is a top-level file of the round directory. Fixtures and scratch copies can contain
   their own .ufo/waves trees; enumerating recursively would audit them as waves." So the over-commit
   is pure surplus, not a runtime dependency.

### Which paths were the "cited evidence" (intended to stay)

I extracted every `round-23/scratch/` reference from the round's *landed* documents (w1/w2 seat
reports, `corpus/lessons/*.md`, `LOG.md`, `SCORECARD.md`, `SKILL.md`,
`corpus/evidence/round-23/*.json`) at the baseline revision:

* 55 distinct citation prefixes; expanding prefixes to files gives **800 of the 1,034 scratch files
  reachable from a citation** (`comm`/union over `git ls-tree -r` vs `git grep -oE` output).
* These are the evidence pointers — e.g.:
  * `scratch/ScribeGate/audit-round22.json` (C1 receipt cited by `w1/ScribeGate.md`);
  * `scratch/SrcS102/rfc6265bis-13.txt` and `scratch/SrcS103/owasp-csrf.html` (the fetched-byte
    provenance for the C2 located-quote control; `W2Report.md` residual risk: "the two fetched
    sources live only in … scratch/SrcS102/ and SrcS103/, so the located-quote control rests on
    uncommitted bytes until a report cites a committed pointer");
  * `scratch/MutClassFalsifiers/**` (621 files — the falsifier variant forests, cited by the round's
    mutant/falsification reports);
  * `scratch/W2EvRepair/**`, `scratch/W2InMemory/**`, `scratch/W2Mistakes/**` (selftest mutant
    receipts cited by wave-2 reports).
* **234 scratch files are fully uncited** — pure working bulk, including zero-information mirrors
  (`scratch/ExecMirrorCensus/raw/corpus/**` — verbatim copies of corpus knowledge), empty probe
  outputs, and host dumps (e.g. `scratch/audio-5415115-swept-files.txt`,
  `scratch/goal-20261025-hyaku-12h.md`, `scratch/poll.sh`).

**Reconstruction (inference, marked):** the L1 intended to land the wave evidence + deliverables
listed in LOG; scratch came along because the lander staged the entire round directory (the
`03c1b4d` sweep) while seats were still writing, treating scratch as part of the wave evidence; the
"cited evidence" that should survive is the ~800-file citation-reachable set (receipts, fetched
sources, mutant fixtures), and the remaining ~234 uncited files are the incidental bulk. The cleanup
was promised (report, cited by verifier/wave-2) and never executed; the round-24 M5 mandate matches
the "cited evidence preserved, rest deleted" split.

---

## (b) The `c1-measurements.json` `before.exit` field

### Which revision the spot-check read

The non-author verifier's receipt row and defect both read the blob **at `03c1b4d`**, not at the
reviewed tip `c90dffd`:

* `corpus/lessons/round-23-verifier-spotcheck.md:37` (measurement-receipt row): "`git show
  03c1b4d:corpus/evidence/round-23/c1-measurements.json` → `before.classes 0`; `after[0] rev
  a89f1935 exit 1 …`".
* `:106-108` (routed defect 5): "`c1-measurements.json` `before.exit` is `1` while the command it
  names (`git cat-file -e …`) exits **128**, as the report correctly says."

Blob history of `corpus/evidence/round-23/c1-measurements.json`
(`git log --all --format='%H' -- <path>` + `git show <rev>:<path>`):

| Revision | Blob | `before.exit` | Observed |
|---|---|---|---|
| `03c1b4d` | `6103e58e` | **1** | `git show 03c1b4d:… \| python3` → `before.exit= 1`, `before.command= git cat-file -e a89f1935:scripts/round-evidence-audit.mjs` |
| `7ac9fff` | `a80d2434` | 128 | `before.exit= 128` (the same field corrected; `after` restructured to name `03c1b4d`) |
| `dfae5cd` | `a0532c7` | 128 | `before.exit= 128` (scriptSha256 re-pinned; `selfAudit` block added) |
| `c90dffd` / `573c99e` (baseline, tip) | `a0532c7` | 128 | `git show c90dffd:…` and `git show 573c99e:…` both → `before.exit= 128` |

In-round origin of the `1`: the receipt was generated by ScribeGate at 07:14:36Z with `exit: 1`
and was flagged in-round by `w1/ScribeGate.md:34` ("the lane receipt … records exit 1 for the same
probe; my measured code is 128"), `W2Report.md` finding 6, `W2Scorecard.md` F3. The field was
corrected at `7ac9fff` (04:33:45), before the reviewed tip.

### Does the defect reproduce today?

No — at the current tip the committed field matches the command's real exit:

* Today HEAD = `573c99e4885382db38babc3a6fc90e77afeb42a6` (`git rev-parse HEAD`).
* `git cat-file -e a89f1935f523a64b00991d792fca6a8c0d321948:scripts/round-evidence-audit.mjs` →
  `fatal: path 'scripts/round-evidence-audit.mjs' exists on disk, but not in 'a89f1935…'`, **exit
  128** (observed in this seat).
* Committed blob at `573c99e` reads `before.exit: 128` (`git show 573c99e:corpus/evidence/round-23/c1-measurements.json`).
* The stale `1` survives only (i) in the historical blob at `03c1b4d` and (ii) in the committed
  scratch snapshot `.ufo/waves/round-23/scratch/W2LandedCites/c1m-committed.json` (`before.exit= 1`,
  `git show 573c99e:…`), which captured the interim state — a historical artifact, not a live
  finding.

---

## Evidence discipline / confidence

* Every figure above carries the command that produced it; observations vs reconstruction are
  separated (the "intended land set" is reconstructed from LOG's own landed-paths list, the wave
  spec contracts, and the verifier/seat reports — marked as reconstruction).
* The round report itself (`.ufo/reports/round-23/tabi.md`) lives in the fleet repo, which this
  seat is forbidden to touch; its "follow-up cleanup" promise is sourced via the two independent
  secondary records (`W2SelfAudit.md` finding 1; verifier lesson lines 97–99).
* Confidence: high on all observed facts (blob values, counts, command exits); moderate-high on the
  intent reconstruction, which rests on the round's own documents.
