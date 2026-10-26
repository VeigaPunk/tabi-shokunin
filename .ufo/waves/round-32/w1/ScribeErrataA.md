# ScribeErrataA — routed defect 4, queue items E1–E9

**Verdict.** Of the nine carried errata, two are closed as already landed (E2's actor/scope clause at
`corpus/QUALITY.md:463-464`; E4's marker half, decided by the entry's own rule at
`corpus/knowledge/rate-signal-decision-table.md:36-41`), three are open and only in wave artifacts (E1 and E5 were
"corrected here" inside `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md` — no durable document carries either
correction, and E5's own proposed replacement pointer had already rotted when the counter was rewritten at `2f8535c`),
and four are live sensor defects that I re-measured rather than trusted (E6–E9: `--live` attests this host's `curl`
resolution, not the cited origin; a soft-404 echo passes; a site root can stand in for the cited document; two
unparseable hosts compare equal). E3's example-value admission also re-measured true at the frozen bytes. Nothing was
repaired — `scripts/**` is frozen after the freeze and decision-table v2 is explicitly unclaimed this round — so every
open item is drafted as append-only text with a flip condition, never as a code change.

## Behavior

1. Re-read the queue (43 items) and took E1–E9 by its own numbering; round-31 lesson `:333-335` confirms the split
   (9 corrected in-block, 3 corrected as a rule, 27 carried, 4 no action) and round-32 `claims.json` says the carried
   set is "dispositioned by wave-1 scribes, curation".
2. Cloned the lane `--shared` at `4181fffb…` (`git rev-parse --show-toplevel` = the clone; every git call named
   `-C "$CLONE"`) and re-derived **every** line citation from current bytes; none was copied from the queue.
3. Re-measured the four live-oracle claims and the example-value claim against the frozen counter's own `evaluate()` in
   a scratch fixture repo, with **injected fetchers or a `PATH` stub** — no external network, no packet to any host.
   The probe imports a byte-identical copy of `scripts/check-decision-table.mjs` with only the trailing `main();`
   bootstrap removed (482 → 481 lines, sha256 recorded).
4. Ran the counter's own self-test from the **original** file as a control on the probe environment.
5. Drafted nine blocks: two closed, three correction drafts to `corpus/lessons/round-31.md` / entry §Errata, one
   criterion draft (83) for the modal-rendering gap, one shared criterion draft (84) for E6–E9, and explicit refusals
   with flip conditions for the sensor halves.

## Gates (commands and exit codes)

All run in `/fast/scratch/hyaku/tabi-r32/ScribeErrataA/clone` at `4181fffb…` with `TMPDIR` under my scratch.

| command | exit | result |
|---|---|---|
| `git -C "$CLONE" rev-parse HEAD` | 0 | `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` |
| `sha256sum scripts/check-decision-table.mjs scripts/check-selfassessment.mjs` | 0 | `d15f3bd7…f832`, `77b5c8ed…c6a9` |
| `git -C "$CLONE" grep -n TALLY_PATTERNS -- scripts/` | 0 | one hit, `:130` (declaration only) — E5 holds |
| `grep -n 'check-selfassessment.mjs:[0-9]' corpus/lessons/round-31.md` | 0 | 10 stale-pointer lines (`:66,67,72,73,91,123,159,212,236,346`) — E5 widened |
| `grep -rn 'no entry maps an observed signal' corpus SKILL.md SCORECARD.md LOG.md README.md` | 1 (no match) | E1's correction exists only in the wave artifact |
| `grep '_cases' scripts/check-selfassessment.mjs` | 1 (no match) | v3 still cannot read `cli_cases=36` — M7 holds |
| `node scripts/check-decision-table.mjs --selftest` | 0 | `DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34`; no example-value case |
| `node receipts/probe-erratas.mjs "$CLONE" "$SCRATCH"` | 0 | six cases, all as tabled below |
| `pgrep -fa 'chromedriver\|chromium'` | 0 | only `earlyoom`'s own pattern string; no browser started by me |
| external HTTPS GETs | — | **0** (all fetches injected or stubbed) |
| tool installs / upgrades | — | **none** |

Probe results (`receipts/probe-out.txt`, verbatim):

```
HOSTOF_SOURCE_FOUND copy=y
HOSTOF a=null b=null guard_passes=true
CASE	EXIT	POP	ADM	FAIL	REASON	WHAT
E3-a-example-admitted	0	1	1	0	-	quote carries '(for example, 30 days)', threshold 30 days
E3-b-example-marker-truncated	0	1	1	0	-	same figure, 'for example' deleted; threshold 30 days
E7-echo-page-live	0	1	1	0	-	receipt bytes hold the sentence; the live page is a soft-404 echo
E8-prefix-url-live	0	1	1	0	-	receipt url https://example.org, source cell cites the document at /spec.txt
E9-null-host-guard	0	1	1	0	-	receipt url and effective url both unparseable by new URL()
E6-pathstub-live	0	1	1	0	-	default curlFetch (no injected fetcher), stub curl first in PATH
```

`E6-pathstub-live` used the counter's **default** fetcher; the stub recorded the exact argv
(`-q -sS --proto =https --proto-redir =https -L --max-redirs 5 --max-time 60 -o - -w …`), which is the queue's A5 arm.
The A3 arm (`HTTPS_PROXY` + `SSL_CERT_FILE` against a loopback CONNECT MITM) was **not** re-run — it is read from the
queue and not upgraded by me.

## Touched surfaces

Written (only these):

- `.ufo/waves/round-32/w1/ScribeErrataA/errata-A.md` — the deliverable, one block per erratum.
- `.ufo/waves/round-32/w1/ScribeErrataA/receipts/` — `verification.txt`, `probe-erratas.mjs`, `probe-out.txt`,
  `counter-nocli.mjs` (derivative, bootstrap line removed), `fakebin/curl`, `fakebin/curl.calls`, `sha256.txt`.
- `.ufo/waves/round-32/w1/ScribeErrataA.md` — this report.
- Scratch `/fast/scratch/hyaku/tabi-r32/ScribeErrataA/` — removed before yielding (receipts copied first).

Not touched: no lane tracked file, no lane git index or jj state, no fleet repo, no sibling lane, no counter, no claim,
no control, no reading, no `commit`/`push`. Lane HEAD is still `4181fffb…`; the only untracked paths are the round-32
wave directories.

## Findings (ordered by what a reader is most likely to get wrong)

1. **E5 is a class, not a pointer.** Ten `scripts/check-selfassessment.mjs:<line>` references in
   `corpus/lessons/round-31.md` were read against v2 and land on different code after the v3 rewrite; the two M7
   references (`:72`, `:212`) tell a reader the detector is `TALLY_PATTERNS`, which `git grep` shows has no reader.
   The queue's own proposed fix (`:189-203`) is already stale.
2. **E1/E5 "corrected here" never became durable.** Both corrections live only in the a2w1 wave artifact; a reader of
   the round-31 claim or lesson sees the uncorrected text.
3. **The four `--live` mechanisms all reproduce at the frozen bytes** (E6–E9), two of them with the counter's default
   fetcher or with lane bytes evaluated verbatim (`hostOf`).
4. **E3's example-value admission reproduces both ways** (marker kept, marker truncated), and the counter's 34-case
   self-test contains no example-value case; control J4 still attacks only fabricated numbers.
5. **E4's premise has partly expired**: the marker question is decided by the entry's own rule (`:36-41`); what is open
   is that a Decision cell capitalises a lower-case modal while criterion 80 says "as written".

## Out of scope / not done

- Queue items **E10–E43** are not dispositioned by me (my slot is E1–E9); routed defect 4 stays open for them.
- No counter, entry, criterion, claim, control or reading was edited; decision-table v2 and selfassessment v3 are
  untouched and remain unclaimed this round.
- The A3 proxy arm of E6 was not re-run; `[INFERENCE]` is labelled wherever I reasoned from code rather than measured
  (E7's script-only-quote mirror case is the only one).
- No build, lint or formatter was run; no lane script was executed in the lane checkout.

## Artifact paths

- `.ufo/waves/round-32/w1/ScribeErrataA/errata-A.md`
- `.ufo/waves/round-32/w1/ScribeErrataA/receipts/verification.txt`
- `.ufo/waves/round-32/w1/ScribeErrataA/receipts/probe-erratas.mjs`
- `.ufo/waves/round-32/w1/ScribeErrataA/receipts/probe-out.txt`
- `.ufo/waves/round-32/w1/ScribeErrataA/receipts/counter-nocli.mjs`
- `.ufo/waves/round-32/w1/ScribeErrataA/receipts/fakebin/curl`, `…/curl.calls`
- `.ufo/waves/round-32/w1/ScribeErrataA/receipts/sha256.txt`
