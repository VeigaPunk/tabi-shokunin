# ExecCensus — manual census battery, tabi `corpus/SOURCES.md` (round 42, wave 1)

Seat: `ExecCensus` (leaf). Scope: run the frozen manual census commands from
`CORPUS.md` §SOURCES.md Census against the tabi registry, run the maintained
`sources-census.sh validate`, and reconcile row count + histograms against the round-40
baseline plus the expected round-42 deltas.

## 0. Tree pins (what was actually measured)

```
$ git rev-parse HEAD                      -> 0081bfdb93b6bd1bf2853bb128996f1a976b7218
$ sha256sum corpus/SOURCES.md             -> dba53f3b8f5a31ba57cb2c7a7bf62f868cde05f9d64fa38d876b5ab318099a58
$ git show 9b6de3a:corpus/SOURCES.md | sha256sum -> dba53f3b8f5a31ba57cb2c7a7bf62f868cde05f9d64fa38d876b5ab318099a58
$ git show HEAD:corpus/SOURCES.md     | sha256sum -> dba53f3b8f5a31ba57cb2c7a7bf62f868cde05f9d64fa38d876b5ab318099a58
$ git status --porcelain -- corpus/SOURCES.md    -> (empty)
```

HEAD advanced from the freeze `9b6de3a` to `0081bfd` while this seat ran (commit `236c4f4`
"round-42: C1 live measurement …", `0081bfd` "round-42: SCORECARD …"). **The registry bytes
are identical at `9b6de3a`, `236c4f4`, `HEAD` and in the working tree**, so every number below
is pinned to that one digest and is unaffected by the tree advancing.

All census commands were run with cwd = `/home/vgpnk/Projects/shokunin/tabi-shokunin` (the
lane root the contract names), verbatim from `CORPUS.md:133-156`.

## 1. Frozen manual census — exact commands and verbatim output

```sh
# rows (spacing-tolerant)
grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md
# -> 149

# malformed rows — 11 columns means NF=13; must print 0
awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' corpus/SOURCES.md
# -> 0

# tier histogram
awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {t=$5; gsub(/[[:space:]]/,"",t); n[t]++} END{for(k in n) printf "%s=%d ", k, n[k]; print ""}' corpus/SOURCES.md
# -> A=133 B=7 C=9

# status histogram
awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {s=$9; gsub(/[[:space:]]/,"",s); n[s]++} END{for(k in n) printf "%s=%d ", k, n[k]; print ""}' corpus/SOURCES.md
# -> mined=124 queued=15 rejected=10

# duplicate ids — must print nothing
awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {i=$2; gsub(/[[:space:]]/,"",i); print i}' corpus/SOURCES.md | sort | uniq -d
# -> (nothing)

# enum violations and tier inflation — must print nothing
awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF==13 {i=$2;k=$4;t=$5;s=$9; gsub(/[[:space:]]/,"",i); gsub(/[[:space:]]/,"",k); gsub(/[[:space:]]/,"",t); gsub(/[[:space:]]/,"",s); if (t !~ /^[ABC]$/) print "tier", i, t; if (s !~ /^(queued|mined|rejected)$/) print "status", i, s; if (k !~ /^(spec|docs|paper|code|tool|dataset|talk|book|community|own-work)$/) print "kind", i, k; if (t=="A" && k=="community") print "tier-inflation", i}' corpus/SOURCES.md
# -> (nothing)

# mined rows whose used-by paths do not exist — must print nothing
awk -F'|' '… $12 split on /[,;]/ … print p' corpus/SOURCES.md | while read -r p; do [ -e "$p" ] || echo "missing: $p"; done
# -> (nothing)
```

Row count is deterministic: three consecutive `grep -cE` runs printed `149`, `149`, `149`.
Full captured transcript: `manual-census.txt` (sentinel lines `== rows ==` … `== end ==`,
every section between them empty except the two histograms).

Additional structural cross-checks (not in the frozen set, cheap and supporting):

```sh
# id continuity over the whole registry
awk … print id | sort | awk '{n=substr($0,2)+0; if(prev && n!=prev+1) print "GAP …"; prev=n} END{print "max="prev}'
# -> max=149, no GAP lines (ids S001..S149 contiguous, 149 ids)

# mined used-by bookkeeping
awk … if(s=="mined"){n=split($12,a,/,/); c+=n} END{print c}   -> 167
awk … if(s=="mined" && u=="—") print $2                       -> 0 rows
awk … if($12 ~ /;/) print $2                                  -> 0 rows
```

So 167 used-by paths are declared by the 124 mined rows, all 167 resolve on disk, no mined
row carries `—` (consistent with validator W03 = 0), and no `used-by` cell relies on the
`;` separator (so the frozen manual split and the maintained parser's comma split see the
same path set).

## 2. Maintained validator

```sh
$ cd /home/vgpnk/Projects/shokunin
$ ./scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
```

- exit: **0** (captured with `set -o pipefail` around a redirect, not through `tee`)
- stdout lines: 22 = **21 warnings + 1 `ok` line**; zero `E`-codes.
- warnings, by code: `W04=21` (all "duplicate url … across scopes"); `W01=W02=W03=0`.
- 21st line: `tabi  ok  /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`
- Stability: a second identical invocation produced byte-identical output
  (`rerun-exit=0`, `diff` empty).

`census` mode agrees with the frozen manual passes on every cell:

```
tabi rows 149 | tier.A 133 | tier.B 7 | tier.C 9 | status.mined 124 | status.queued 15 | status.rejected 10
FLEET rows 149 | tier.* identical | status.* identical | tier.invalid 0 | status.invalid 0 | missing 0
```

Evidence: `validate.txt`, `validate-summary.txt`, `census-mode.txt`.

## 3. Reconciliation against the recorded baseline + expected deltas

The dispatch quotes the round-40 baseline as `145 rows; A129/B7/C9; mined121/queued15/rejected9`
and the expected round-42 deltas as `S146 mined→rejected; +S148, +S149 mined`.

I first located the baseline in bytes rather than trusting the quoted figures:

```sh
$ for rev in 22883df 8c32528 34e1779 9b6de3a HEAD; do git show $rev:corpus/SOURCES.md | <same grep/awk passes>; done
22883df rows=145 tier=[A=129 B=7 C=9 ] status=[mined=121 queued=15 rejected=9 ]   # round-40 integration
8c32528 rows=147 tier=[A=131 B=7 C=9 ] status=[mined=123 queued=15 rejected=9 ]   # round-41 freeze
34e1779 rows=147 tier=[A=131 B=7 C=9 ] status=[mined=123 queued=15 rejected=9 ]   # r42-claims-named baseline
9b6de3a rows=149 tier=[A=133 B=7 C=9 ] status=[mined=124 queued=15 rejected=10]   # round-42 freeze
HEAD    rows=149 tier=[A=133 B=7 C=9 ] status=[mined=124 queued=15 rejected=10]   # observed now
```

- The quoted baseline reproduces **exactly** at `22883df` (round-40 integration): 145 /
  A129 / B7 / C9 / mined121 / queued15 / rejected9. ✅
- The 145 → 147 step is the **round-41 freeze `8c32528`**, which introduced `S146` and `S147`
  (both `docs | A | mined`): `git log -S'| S146 |'` and `-S'| S147 |'` each return `8c32528`
  as the only introducing commit. Round-41's own `claims.json:22` states "S145, S146, S147 …
  opened this round".
- The 147 → 149 step is `9b6de3a`, which adds exactly `S148`, `S149` and flips `S146`
  `mined → rejected`:

```
$ diff <(ids at 34e1779) <(ids at 9b6de3a)
147a148,149
> S148
> S149
$ git show 34e1779:… | S146 status -> mined ;  git show 9b6de3a:… | S146 status -> rejected
```

### Arithmetic closure

| axis | round-40 (22883df) | + r41 (S146,S147) | + r42 listed deltas | predicted | observed | residual |
|---|---|---|---|---|---|---|
| rows | 145 | +2 = 147 | +2 (S148,S149) | 149 | **149** | 0 |
| A | 129 | +2 | +2 (S148,S149 A) | 133 | **133** | 0 |
| B | 7 | 0 | 0 | 7 | **7** | 0 |
| C | 9 | 0 | 0 | 9 | **9** | 0 |
| mined | 121 | +2 | −1 (S146→rejected) +2 | 124 | **124** | 0 |
| queued | 15 | 0 | 0 | 15 | **15** | 0 |
| rejected | 9 | 0 | +1 | 10 | **10** | 0 |

Every axis closes with residual 0 **once the round-41 addition of `S146`+`S147` is counted**.
The two new round-42 rows are the only row-set delta between the named baseline `34e1779` and
the freeze, and `S146` is the only status delta — exactly the three changes the dispatch lists,
plus round-41's earlier two-row addition.

### F1 — the dispatch's literal baseline + deltas under-count by two rows (instruction number-drift, not a corpus defect)

Applying **only** the listed round-42 deltas to the quoted round-40 baseline gives
`145 + 2 = 147 rows`, `mined 121 −1 +2 = 122`, `A 129 +2 = 131`. The observed registry is
`149 / mined 124 / A 133`. The 2-row gap is not in the corpus: it is round-41's `S146`+`S147`
(`8c32528`), which the dispatch's baseline figure predates but its named baseline revision
`34e1779` postdates. A seat reading the dispatch literally and comparing against the *file at
the dispatch's baseline revision* (`34e1779`, 147 rows) gets the correct answer; a seat reading
it literally as "145 + listed deltas" would report a false 2-row drift. The registry itself is
clean and matches every frozen check; the stale figure lives in the dispatch text only.
Not proposed as an amendment (counter/claims bytes are frozen) — routed as a finding.

### F2 — validator `--file` mode resolves `used-by` against the registry file's directory (observed artifact, documented as a limitation)

While pinning historical revisions I ran the validator from scratch copies via `--file`:

```
$ ./scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin --file $S/current-SOURCES.md tabi
E11=167 W04=21              # 167 === exactly the mined used-by path count
$ … --file $S/r42named-baseline-SOURCES.md tabi
E11=166 W04=20              # 166 === mined used-by count at that rev
sample: file  E11  S001 missing used-by corpus/knowledge/chrome-remote-debugging-profile-boundary.md
```

`scripts/sources-census.sh:555-567` tests `[ ! -e "$dir/$path" ]` where `$dir` is the directory
of the file being parsed; a scratch copy therefore resolves every relative `used-by` against
`/fast/scratch/…` and emits one E11 per mined path. This is a limitation of the `--file` path,
**not** a registry finding — the lane-root invocation (`--dir` = the lane) reports E11 = 0.
`W04` is path-independent and stayed usable: baseline 20 → current 21, the delta set being
exactly `{S148}` (S148 duplicates S146's `nodejs.org/docs/latest-v24.x/api/cli.html`; S146
itself is not flagged because S148 supersedes it).

## 4. Evidence files (this seat dir)

| file | contents |
|---|---|
| `manual-census.txt` | frozen manual battery, sentinel-delimited, verbatim |
| `validate.txt` | validator stdout, 21 W04 + ok (exit 0) |
| `validate-summary.txt` | `W04=21 ok=1` |
| `census-mode.txt` | `sources-census.sh census` TSV for tabi + FLEET |
| `historical-census.txt` | rows/tier/status at 22883df, 8c32528, 34e1779, 9b6de3a, HEAD |
| `w04-base.txt`, `w04-cur.txt` | W04 id sets, baseline vs current (diff = S148) |
| `sources-md.sha256` | `dba53f3b…099a58  corpus/SOURCES.md` |
| `head-rev.txt` | HEAD at measurement time: `0081bfdb…b7218` |

## 5. Limitations and bounds

- No network use; `git show`/`git log`/`git rev-parse` reads only. No commit, push, fetch,
  checkout, stash or jj mutation; the working tree was never modified (only reads, and evidence
  written under this seat dir).
- The `--file` historical comparisons produced the F2 artifact; those runs are used only for
  `W04` (path-independent) and for the raw row/tier/status counts, which are computed from
  `git show` bytes, not from the validator.
- HEAD moved during the seat (`9b6de3a → 236c4f4 → 0081bfd`); registry digest proves the census
  numbers are unaffected.
- Not evaluated here (other seats' items): C1 measurement admission, C2 routed-defects checker,
  quarantine verdicts, `overdue`/`shared` validator modes, `sources-census.sh selftest`.
- Round-40's recorded lesson does not contain the census figures, so the quoted baseline is
  corroborated only by the `22883df` bytes above — which it matches exactly.
- Scratch `/fast/scratch/hyaku/tabi-r42/ExecCensus/` created and deleted (evidence copied here
  first). No tools installed; no upgrades performed.

VERDICT finding — registry is clean and matches expected exactly at 149 rows / A133·B7·C9 / mined124·queued15·rejected10 with zero residual on every axis once round-41's S146+S147 (+2 rows at 8c32528) are counted, but the dispatch's literal "145 baseline + listed deltas" predicts 147 rows, a 2-row number-drift in the instruction text (F1), plus `--file` validator E11 resolution artifact documented (F2).
