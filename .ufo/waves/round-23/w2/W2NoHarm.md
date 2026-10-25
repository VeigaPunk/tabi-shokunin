# W2NoHarm — no-harm check (tabi r23 w2)

**Verdict: PASS on bytes and on the auditor's write set; one literal-criterion disagreement.**
No baseline byte of the six named files was removed or altered against a89f1935, all 475
round-21/22 evidence files still hash to their baseline blobs, and the auditor opens nothing for
writing outside `/dev/null` — its only regular-file writes are the caller's own stdout/stderr
redirects. Strict *byte-prefix* fails on `corpus/SOURCES.md` alone, proven to be a pure insertion.

Snapshot `2026-10-25T04:32:30-03:00`, `HEAD=03c1b4d` (parent `a89f1935`); the auditor was traced
again at 04:33:14. Files kept moving during wave 2 (LOG.md 04:29:38, README.md 04:30:04).

## 1 · Six files vs a89f1935

    for f in LOG.md SCORECARD.md corpus/QUALITY.md corpus/README.md corpus/SOURCES.md SKILL.md; do
      b=$(git cat-file -s a89f1935:$f); cur=$(stat -c%s $f)
      p=$(head -c $b $f|sha256sum|cut -d' ' -f1); q=$(git cat-file -p a89f1935:$f|sha256sum|cut -d' ' -f1)
      [ "$p" = "$q" ] && r=PREFIX-OK || r=PREFIX-BROKEN
      rem=$(git diff a89f1935 -- $f | grep -cE '^-[^-]'); echo "$f $r base=$b cur=$cur removed=$rem"; done

    LOG.md PREFIX-OK base=125375 cur=130061 removed=0 mtime=04:29:38
    SCORECARD.md PREFIX-OK base=88656 cur=92667 removed=0 mtime=04:27:51
    corpus/QUALITY.md PREFIX-OK base=26151 cur=27735 removed=0 mtime=04:21:26
    corpus/README.md PREFIX-OK base=52500 cur=55842 removed=0 mtime=04:30:04
    corpus/SOURCES.md PREFIX-BROKEN base=84565 cur=86001 removed=0 mtime=04:19:18
    SKILL.md PREFIX-OK base=221365 cur=221365 removed=0 mtime=03:36:21

`SKILL.md` is byte-identical: `git hash-object SKILL.md` = `git rev-parse a89f1935:SKILL.md` = `715db02ab13d…`.
SOURCES.md, why the prefix breaks (`git diff --no-index --numstat <base> corpus/SOURCES.md` → `2 0`):

    cmp <(git cat-file -p a89f1935:corpus/SOURCES.md) corpus/SOURCES.md  → differ: char 65524, line 116
    head 65523 bytes equal=YES; tail (cur 65524+1436 / base 65524) equal=YES
    inserted span = 1436 bytes "| S102 | SameSite Cookie Attributes…" … "| S103 | Cross Site Request…|\n"

## 2 · round-21/22 evidence — no byte changed

    git diff --name-status a89f1935 HEAD -- .ufo/waves/round-21 .ufo/waves/round-22   → 0 lines
    git diff --name-status a89f1935      -- …round-21 …round-22                      → 0 lines
    git status --porcelain -uall         -- …round-21 …round-22                      → 0 lines
    find …round-21 …round-22 -type f | wc -l → 475;  git ls-tree -r --name-only a89f1935 … | wc -l → 475
    find … -type f -newermt '2026-10-25 04:07:00' | wc -l → 0
    per-file content hash vs baseline blob: hashed=475 changed_or_missing=0

## 3 · Auditor write set

    strace -f -y -qq -e trace=%file,write,writev -o …/scratch/W2NoHarm/strace-y.txt \
      node scripts/round-evidence-audit.mjs --rev a89f1935f523… --round 22 --round-cap 128 --json > audit-y.json
    write-flag opens NOT /dev/null: 0   (all 141 O_RDWR opens are "/dev/null", git children)
    regular-file write targets: </…/scratch/W2NoHarm/audit-y.json>  (my stdout redirect, 8418 B JSON)
    --selftest (exit 0, 12/12) and refusal path (exit 2): identical — 0 non-/dev/null opens
    versions pinned by each output's scriptSha256: 94759966…, 87b9f678…, re-traced on 325006d2… (same result)

## Findings

1. **MEDIUM — HEAD 03c1b4d is not the tree the lane keeps writing.** `git diff HEAD --numstat -- LOG.md corpus/README.md` → `4 3 LOG.md`, `19 8 corpus/README.md` at 04:32:30; mtimes 04:29:38/04:30:04 postdate the 04:28:10 commit. Both stay baseline-prefixed with 0 baseline lines changed, so no-harm holds, but a closure auditing the commit reads bytes the lane has moved past.
2. **LOW — literal "byte-prefix" fails on corpus/SOURCES.md.** The two rows sit at byte 65524 (line 116), before `## Paths`, not at EOF. Harm is zero (2 insertions, 0 baseline lines changed, head+tail equality), so the criterion's wording is the defect, not the append.
3. **LOW — claims.json carries two counting commands.** `claims[0].countingCommand` is still `--rev <REV> --round 22 --json`; verbatim → `exit=2 … refused: --round-cap is required`. `revisions[0].to` gives `--round-cap 128`, which yields `findings 7, classes 6, clean false, exit 1`. The field verbatim refuses instead of counting.
4. **INFO — the claims file was written after the dispatch that cites it.** `claims.json` mtime 04:26:48 > `gen-w2.mjs`/`w2-spec.json` 04:23:52; at 04:25 its keys ended `…,claims,notClaimed` with `revisions: null`, while gen-w2.mjs:12 already told seats to read a "revisions" block. Wave-2 seats read different versions of the claim object.
5. **INFO — the instrument itself changed three times during wave 2.** `git diff HEAD -- scripts/round-evidence-audit.mjs` → `114 40` (40 lines removed) at mtime 04:33:14; outputs pin scriptSha256 94759966…, 87b9f678…, 325006d2…. Every result above was re-taken on 325006d2…, which still yields 7 findings / 6 classes and zero write intents.

## Residual risk / verification gaps

- Three traced modes (main, selftest, refusal) on two script versions; no `--report`/`--policy` override was traced — that path is write-free by source (`readFileSync` is the only fs import).
- Round-21/22 proof is content-based (475 hashes) plus count equality and `-uall` status, so an mtime-restoring edit is still caught.
- Valid only at the stated instants: LOG.md, README.md and the auditor were being rewritten as this report was written.
- Installs: none (node v24.21.0, git 2.56.0, strace already present).
