# W2 · W2Trends — the three trend verdicts, held to LEARNING.md's observables

Read-only at `03c1b4d9a9ea7719ff4a13a63989fa9be36229c3` (HEAD moved `a89f193` → `03c1b4d` mid-review; every command names its revision); before-arm baseline `a89f1935f523a64b00991d792fca6a8c0d321948`.
Finding 12 reads the worktree §Round 23 text, uncommitted at review time.

**Verdict line:** expansion **improved** (bounded: one admitted documented-upstream entry on uncovered
ground) · quality **unchanged** · discernment **unchanged** for round 23's own decisions, provable only
in the carried criterion channel (`QUALITY.md` 61–63 ← lesson M1–M3 ← the `a89f193` spot-check).

| Trend | Observable (`LEARNING.md`) | Evidence pointer | Verdict |
|---|---|---|---|
| expansion | :33 admitted entry on ground the map did not hold, `source:` citing a `mined` row, net new | findings 1–4 | improved, bounded |
| quality | :34 entries re-verified / deepened / superseded; `verified-at` freshness | findings 6, 7 | unchanged |
| discernment | :35 gate decisions vs the outside spot-check; `QUALITY.md` criteria | findings 8, 9 | unchanged; criterion channel carried |

## Findings

1. **The expansion counter is commit-scoped and now reproduces.** `git grep -lE '^source: S10[23] '
   a89f1935f523a64b00991d792fca6a8c0d321948 -- corpus/knowledge | wc -l` → `0`; at `03c1b4d` → `1`
   (a worktree `grep -l` returns 1 too, from untracked bytes — not the claim's counter).
2. **Net new on uncovered ground; nothing else in `knowledge/` moved.** `git diff --diff-filter=A
   --name-only a89f1935f523a64b00991d792fca6a8c0d321948 03c1b4d -- corpus/knowledge` → exactly
   `csrf-defense-shape-boundary.md`; `--name-status` → one `A`; `ls-tree | wc -l` → 41 / 42.
3. **Both cited rows are `mined`, opened this round** (the clause at :33).
   `git show 03c1b4d:corpus/SOURCES.md | grep -E '^\| S10[23] ' | awk -F'|' '{print $2"|"$9"|"$10}'`
   → `S102|mined|2026-10-25`, `S103|mined|2026-10-25`.
4. **The entry passes its bar, so expansion is not harmed** (:33 harmed-when). Every blockquoted span
   normalises into bytes whose digest equals the row pin (`sha256sum …/SrcS102/rfc6265bis-13.txt` →
   `06223931…d85fbf`); `grep -n 'offer a robust defense\|not the extent of\|strongly encouraged' …` →
   `2815 / 2817 / 2822`, inside the row's `2815–2828` (heading `2813`, `8.8.2` at `2830`). The absent
   span is the deliberately quoted non-existent staged heading (E2).
5. **Ground novelty reproduces at the baseline only.** `git grep -rniE 'synchroni[sz]er token|
   double-submit|custom request header' a89f1935f523a64b00991d792fca6a8c0d321948 -- corpus SKILL.md`
   → exit 1, no hits. Held SameSite text is a fixture disclosure plus one unknown (`git grep -n -i
   samesite <baseline> -- corpus/knowledge` → 6 `SameSite=Lax` in `stateful-fixture-evidence.md`, 1
   `U7` in `state-changing-matrix-r9.md`).
6. **Refuse "frontier area entered".** `sed -n '/## Round 23 — CSRF/,/Counting commands/p'
   corpus/README.md` keeps the measured half open (`still untested`, `narrows rather than falls`,
   `none has been read off a site`). Expansion credit is the admitted entry, never the frontier.
7. **Refuse capability→expansion and operability→quality.** :33 lists "a capability admitted to
   `SCORECARD.md`" in the *observable* column but demands net new admitted entries in its
   *improved-when* column; :87's "quality by … `operability`" is an axis→trend mapping, not quality's
   :34 observable. `grep -n "Capabilities table" SCORECARD.md` → the row exists at `03c1b4d`, so this
   is a test failure, not a missing artifact: neither trend may take C1 as its mover.
8. **Quality is `unchanged`, mechanically.** `git grep -l 'verified-at: 2026-10-25' 03c1b4d --
   corpus/knowledge` → only the new entry; nothing held re-verified, deepened or superseded (finding
   2's `A`-only diff). Every "quality improved" sentence would lack a :34 observable.
9. **Quality is not `harmed` either.** The one false citation lived in the never-admitted staged bytes
   — `git grep -c 'offers a robust defense' a89f1935f523a64b00991d792fca6a8c0d321948 --
   corpus/knowledge` → `0` — and the landed entry quotes `offer` verbatim with "deployed in strict
   mode" and an ellipsis (`git show 03c1b4d:…/csrf-defense-shape-boundary.md | sed -n '24,30p'`).
10. **Discernment has no round-23 sample; the only sample is prior-round bytes.** `git log -1
    --format='%h %s' 03c1b4d` → the lane's own landing commit and `claims.json` `notClaimed[2]` → "no
    non-author judgment: every seat is lane-dispatched"; `git log -1 --format='%h %s'
    a89f1935f523a64b00991d792fca6a8c0d321948` → `round-22 verifier spot-check … non-author
    admit/reject`. :42 samples *that round's* decisions, so "discernment improved — the spot-check
    agrees" is a relabel and must be refused.
11. **The carried criterion channel is grounded and byte-visible, if claimed at all.** `git show
    03c1b4d:corpus/QUALITY.md | grep -c 'lesson: corpus/lessons/round-23.md#mistakes'` → `3` (61–63 ←
    M1–M3 ← the spot-check's six routed defects); no criterion exists without a lesson (:35
    harmed-when) — M4 has none and none was invented for it. Acceptable only with the
    "carried from `a89f193`" label.
12. **Filed figure in this round's own bytes is not reproducible** — the class C1 mechanises.
    `git grep -ciE 'csrf|samesite' a89f1935f523a64b00991d792fca6a8c0d321948 -- corpus/knowledge
    SKILL.md corpus/*.md` → **10 files / 23 lines**, not the §Round 23 text's "15 files / 30 lines";
    `git grep -c 'SameSite=Lax' …` → **6**, all in `stateful-fixture-evidence.md`, not "7 … in the
    stateful-fixture and state-changing-matrix notes". The paragraph's operative clause (defence-shape
    sweep → exit 1) reproduces, so ground novelty survives and expansion is unaffected; the counts are
    not. Correction: append the derived `10 / 23` and `6` with their revision, and quote no count from
    that paragraph in any trend row.
