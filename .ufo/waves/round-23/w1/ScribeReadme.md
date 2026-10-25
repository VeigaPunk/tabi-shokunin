# Round-23 corpus/README.md append — draft (ScribeReadme)

Target text below is a literal append to `corpus/README.md` (537 lines at
`a89f1935f523a64b00991d792fca6a8c0d321948`; `wc -l corpus/README.md` → `537`).
It replaces nothing: the round-3 bullet at `:42-47` and the kaika row at `:183`
keep their bytes, as rounds 16/17 already established for their own supersessions.

---

## Round 23 — CSRF defence-shape boundary: documented taxonomy, measured submit still absent (2026-10-25)

Append-only addition. It writes one coverage-map row and restates one Frontier
clause; no earlier line is edited.

The row is written when its file exists (CORPUS.md:45-47). The entry is in
flight in wave 1 of this round: `knowledge/csrf-defense-shape-boundary.md`, whose
provenance trio names `source: S102 + S103`, `verified-at: 2026-10-25`.

| Note | Holds | Sources |
|---|---|---|
| `knowledge/csrf-defense-shape-boundary.md` *(round 23)* | Documented-upstream defence-shape taxonomy for a submit observation: SameSite is defence-in-depth, not the site's whole CSRF defence (S102 §8.8.1); the server-side defences a site can deploy leave enumerable shapes on the wire — synchronizer token, double-submit cookie, custom request header — and same-site requests initiated by JavaScript still carry cookies, circumventing the SameSite policies (S103). A classification vocabulary for a submit a journey actually observes, not a receipt: nothing in it was run, captured or observed in a browser. | S102 RFC 6265bis draft-13 §8.8.1 "Defense in depth"; S103 OWASP CSRF Prevention Cheat Sheet §"Common CSRF weaknesses and protection mechanisms", §"Limitations of SameSite". Both rows are appended by this round (`opened 2026-10-25`); each row carries its own ≤25-word located quote, and that quote's admissibility is the source-opening seat's receipt, not this row. |

### Frontier — old text, verbatim

`corpus/README.md:42-43` (round-3 bullet, historical):

    - Real-site journeys + evidence durability — third-party JS, redirects,
      POST forms, CSRF-checked submits untested by rule (journey §8.6); the

`corpus/README.md:183`, status cell only (kaika round-1 re-derivation row):

    open — the only external record is read-only public observation of `https://example.com/` (GET `/` and `/s.js`, no interaction); third-party JS, redirects, POST and CSRF-checked submits remain untested by rule.

### Frontier — new text (this append)

| Frontier item | Current status | Pointer |
|---|---|---|
| CSRF-checked submits (`:43`, `:183`) | **documented taxonomy held; measured submit still untested** — the defence a site uses can now be classified from a submit the lane observes (token field, paired cookie, non-simple request header), and a SameSite cookie is not read as a CSRF defence on its own; no submit carrying any of these shapes has been executed or captured | `knowledge/csrf-defense-shape-boundary.md`; S102 §8.8.1, S103 |

Clause-level old → new for the `:183` status cell:

- old: `third-party JS, redirects, POST and CSRF-checked submits remain untested by rule.`
- new: `third-party JS, redirects and POST submits remain untested by rule; the CSRF defence shapes a submit could carry are documented-upstream (S102 §8.8.1, S103), so an observed submit can be classified — none has been observed.`

The `:42-47` bullet keeps its historical wording and is not retroactively
narrowed: its CSRF half becomes *mapped*, still untested.

### Why this ground was not already held

Sweep `grep -ric -e 'csrf' -e 'samesite' -e 'double-submit' corpus/knowledge/*.md | grep -v ':0$'`
→ 8 files, each using the words for other purposes: a loopback cookie fixture
whose token is "a CSRF-*shaped* instrument, not a security analysis"
(`knowledge/stateful-fixture-evidence.md:79`), two SameSite-unexercised unknowns
(`stateful-fixture-evidence.md:763`, `state-changing-matrix-r9.md:374`), and the
frontier sentence itself (`multi-step-journey.md:287`). No note carries a defence
taxonomy; the shape words themselves are absent —
`grep -ric -e 'synchronizer' -e 'double-submit' -e 'X-CSRF' -e 'csrf token' corpus/knowledge/*.md corpus/*.md SKILL.md`
returns no nonzero count (exit 1) — and `PROVINCE.md` has no occurrence
(`grep -nic -e 'csrf' -e 'samesite' PROVINCE.md` → `0`).

### Re-derivation (commands run 2026-10-25)

1. `git rev-parse HEAD` → `a89f1935f523a64b00991d792fca6a8c0d321948`.
2. `git grep -lE '^source: S10[23] ' a89f193 -- corpus/knowledge | wc -l` → `0`
   (C2's before value, using the claims file's counting command).
3. `grep -cE '^\| S10[23] ' corpus/SOURCES.md` → `0`: neither row is registered
   at baseline, so the Sources cell names rows this round appends.
4. `test -f corpus/knowledge/csrf-defense-shape-boundary.md` → absent at baseline;
   row and file must land in the same commit.
5. `git ls-tree -r --name-only HEAD corpus/knowledge | wc -l` → `41`. The gain is
   one row; the sweep paragraph's first command re-ran unchanged (8 files).
6. Term sweep: `grep -ric -e 'synchronizer' -e 'double-submit' -e 'X-CSRF' -e 'csrf token' corpus/knowledge/*.md corpus/*.md SKILL.md` → exit 1, no hits.

### Limits of this append

No browser run, no HTTP fetch, no measured submit, no archive group, no axis
score: every clause above is documented-upstream. A file-count increase is not
expansion credit — C2's value (`1` admitted entry citing a row first opened this
round) is the round's Gate measurement, not this row's.
