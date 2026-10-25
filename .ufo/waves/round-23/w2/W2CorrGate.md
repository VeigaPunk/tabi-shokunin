# W2CorrGate — round-23 §Gate carries the round-22 spot-check (defect-3 close)

**Verdict: PASS** — §Gate carries the reviewer identity, the agree count and a resolvable pointer, and
every number in the paragraph (5 agree / 0 disagree; 1 admit + 3 rulings + 1 binding; 6 routed defects)
agrees with the cited file's own bytes. No arithmetic error; four precision/mechanization gaps, all
author-side, none falsifying the close.

Bytes read: `corpus/lessons/round-23.md` @ HEAD `03c1b4d9a9ea7719ff4a13a63989fa9be36229c3`
(sha256 `e5195499f22d…9bb8`); `corpus/lessons/round-22-verifier-spotcheck.md` @ baseline `a89f1935…`
(added by that commit, unchanged since). The lesson's worktree copy later diverged (`ac07a19f…`, the
spot-check paragraph byte-identical but shifted `:78→:90`); all line refs below are HEAD's.
No tool installed, upgraded or fetched this seat; read-only `git`/`awk`/`grep`.

| Element | round-23 §Gate | Source of truth | Match |
|---|---|---|---|
| Reviewer identity | `:80` "hyaku closure, reviewer `@m_flash`" | `:1` `author: hyaku closure (non-author integrator, @m_flash)` | ✅ |
| Pointer | `:80` `corpus/lessons/round-22-verifier-spotcheck.md` | present at `a89f193` and at HEAD | ✅ |
| Reviewed tip | `:81` "lane tip reviewed `be271a2`" | `:3` `be271a2d98f…`; ancestor of the audited rev | ✅ |
| Agree count | `:81` "**5 agree / 0 disagree**" | rows 162–166, five `**agree**`, zero `**disagree**` | ✅ |
| Composition | `:82-83` 1 admit · 3 rulings · register binding | `:162` admit, `:163`+`:164` refused, `:165` unverifiable, `:166` binding | ✅ |
| Routed defects | `:83` "**6 routed defects**" | `:200`–`:228`, numbered 1–6 | ✅ |
| Defect targeted | `:78` "closing round-22 routed defect 3" | `:212-214` "`## Gate` has no spot-check row … append the result (this file)" | ✅ |

Also meets `LEARNING.md:70` (Gate carries "the spot-check result") and `:43-45` ("at least one admit and one reject").

```sh
C1  sed -n '1,10p' corpus/lessons/round-22-verifier-spotcheck.md
C2  git cat-file -e a89f1935f523a64b00991d792fca6a8c0d321948:corpus/lessons/round-22-verifier-spotcheck.md   # exit 0
C3  git merge-base --is-ancestor be271a2d98f3e2f6ec3e179c8e17f50f80698571 a89f1935f523a64b00991d792fca6a8c0d321948   # exit 0
C4  grep -c 'agree\*\*' corpus/lessons/round-22-verifier-spotcheck.md ; grep -c 'disagree\*\*' corpus/lessons/round-22-verifier-spotcheck.md   # 5 ; 0
C5  awk -F'|' '/^## Discernment spot-check/{f=1} /^## Trend verdicts/{f=0} f && /^\|/ && !/^\|---/ && !/^[|] Item /{gsub(/^ +| +$/,"",$3); print NR": "$3}' corpus/lessons/round-22-verifier-spotcheck.md
C6  awk '/^## Routed defects/,/^## Notes for the operator/' corpus/lessons/round-22-verifier-spotcheck.md | grep -cE '^[0-9]+[.] '   # 6
C7  grep -n 'has no spot-check row' -A4 corpus/lessons/round-22-verifier-spotcheck.md   # :212
# C5 -> admit / refused / refused / unverifiable / Register input binding (5 rows, all **agree**)
```

## Findings

1. **Medium — the paragraph's numbers carry no counting command, against this round's own M1 rule.**
   `:16-25` lists four counting commands; none counts the spot-check table or its 6 defects
   (`grep -n 'verifier-spotcheck' corpus/lessons/round-23.md` → 2 hits, both pointers, neither a
   command). `c1-refusal-arithmetic` / M1 (`:129`) demands "a numeric claim carries its counting
   command" — the standard applied to round 22 is not applied to this round's new prose numbers.
2. **Medium — `c3-gate-spotcheck` mechanizes presence, not agreement, so the close cannot fail on a
   wrong count.** At HEAD the check is `/spot-?check/i.test(gate) || /owed to closure/i.test(gate)`
   (`git show HEAD:scripts/round-evidence-audit.mjs | sed -n '328,342p'` → regex at `:334`); its red
   fixture is "no spot-check line" and its green rewrites the line to `Spot-check result: owed to
   closure.` (`sed -n '527,537p'` → `:529`,`:532`). Any Gate text containing "spotcheck" clears, so
   "5 agree" is hand-derived only. §Gate's "all six … mechanical classes" (`:83`) is faithful to defect
   3's *presence* ask and overstates nothing else — residual risk, not a false claim.
3. **Low — "3 refusal rulings" (`:82`) mislabels one row.** The source's composition is "one admit,
   **two rejects and the unverifiable ruling**" (`:158`) and the row reads `reject-as-unverifiable, not
   fabrication` (`:165`). Row count 3 is right; "refusal" is the source's label for 2 of the 3
   (`grep -n 'two rejects' corpus/lessons/round-22-verifier-spotcheck.md` → `158`).
4. **Low — `S102` denotes two row-spaces in one lesson.** `:42,63` = new lane/SOURCES row (RFC 6265bis,
   `corpus/SOURCES.md:116`, now at HEAD: `git show HEAD:corpus/SOURCES.md | grep -cE '^\| S10[23] '`
   → `2`); `:66` = staged id; `:82` = the round-22 *register* row (CDP contribution README) refused
   `payload-absent`. Unqualified at `:82`, a reader can take the admitted S102 for a refusal — the
   confusion C2's `^source: S10[23] ` grep assumes away (`grep -n 'S102\|S103\|S106' corpus/lessons/round-23.md`).

## Residual risk / gaps

- I did not re-run `node scripts/round-evidence-audit.mjs` (lane gates belong to the L1); finding 2 is
  read from HEAD's source text and fixtures, not an executed probe.
- `scripts/round-evidence-audit.mjs` is dirty vs HEAD at read time (`git diff --numstat` → `92 22`;
  worktree `bf0aff59…` vs HEAD `6eeaeda7…`); the uncommitted diff touches no `c3`/`spot`/`agree` line
  (`git diff -- scripts/round-evidence-audit.mjs | grep -i 'spot\|agree'` → empty), so finding 2 holds
  for both, but §Gate's cited runs are not reproducible from HEAD's script.
- Filed (HEAD) lesson `:129` still calls round-21 "a zero-control only after …" while the worktree §Gate records it as a true positive (`c3`): the correction lives only in uncommitted bytes.
- "5 agree" measures the sampled decisions, not the round-22 population; `:84-86` keeps round 23's closure owed. No non-author judgment is asserted — every seat is lane-dispatched.
