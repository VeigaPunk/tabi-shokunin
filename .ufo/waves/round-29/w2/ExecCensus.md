# ExecCensus — round 29 / w2, byte-exact census (round-28 routed defect 5)

Seat: ExecCensus (leaf attack seat). Item: byte-exact census; measurements only, no repair.
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only). Scratch:
`/fast/scratch/hyaku/tabi-r29/ExecCensus` (`HYAKU_SCRATCH=/fast/scratch/hyaku`), one
`git clone --shared`, removed after the receipts below were copied.

## Revision provenance (observed, not assumed)

| object | value |
|---|---|
| item's named tip | `32008a453737a27f69e9ab401d0b9775d2a944f7` |
| lane `master` HEAD when measured | `e1e3a15f2db10c135739e0ee7e81ce63a02facf6` ("round-29: wave-1 evidence …"), one commit **past** the named tip |
| `git diff 32008a45 e1e3a15 -- corpus/SOURCES.md` | empty |
| `sha256sum corpus/SOURCES.md` at `32008a45` (= in clean clone) | `ed29d04e7ad048375528dd6cdf32cc07ee52bd2355a9e52c77cbc01943f6d85d`, 178 lines |
| `sha256sum corpus/SOURCES.md` in lane working tree | identical `ed29d04…` (tracked file clean; the only porcelain entries are untracked w1 pin/byte files and `w2/`) |
| `sha256sum corpus/SOURCES.md` at baseline `856fa9e` | `e7e32abacda4e0d3bfecef1adcfd2614240df8cc5dcf74257edbb114748f9403`, 169 lines |
| measurement clone | `git clone --shared`, checked out at each revision, `git status --porcelain` = 0 lines at measurement time |

The HEAD drift past the named tip is status-neutral for this item: `corpus/SOURCES.md`
is byte-identical between `32008a45` and lane HEAD, and the lane file hash equals the
clean clone's. Everything below is therefore a measurement of 32008a45's registry bytes.

## Commands run (exact) and exit codes

Tip, twice, exactly as the item specifies:

```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate \
    --root /home/vgpnk/Projects/shokunin tabi > w2/census-tip.txt 2>&1
$ echo exit=$? >> w2/census-tip.txt                       # exit=0
$ ... same command ... > w2/census-tip-rerun.txt 2>&1
$ echo exit=$? >> w2/census-tip-rerun.txt                 # exit=0
$ cmp w2/census-tip.txt w2/census-tip-rerun.txt           # exit 0, byte-identical
```

Baseline, in a clean clone of `856fa9e` (sha guarded pre/post each run):

```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate \
    --file <clone>/corpus/SOURCES.md > w2/census-baseline.txt 2>&1
$ echo exit=$? >> w2/census-baseline.txt                  # exit=0
# repeated: cmp base-validate.out base-validate2.out       # exit 0
```

Cross-checks:

```
$ scripts/sources-census.sh validate --file <clone-at-32008a45>/corpus/SOURCES.md
$ diff <(normalise tip lane-label run) <(normalise tip file-label run)   # exit 0
$ diff <(normalise baseline clone run) <(baseline/census-start.txt minus its exit line)  # exit 0
$ scripts/sources-census.sh census  --root …/shokunin tabi (twice)        # cmp exit 0, exit=0
$ scripts/sources-census.sh census  --file <clone-at-856fa9e>/… (twice)   # cmp exit 0, exit=0
$ diff <(baseline W04 lines) <(tip W04 lines)                            # diff exit 1 (differences present)
```

`diff` exiting 1 above is its "differences found" status, not a failure; the census
commands themselves all exited 0.

## Frozen manual census commands (CORPUS.md §Census) at 32008a45 and 856fa9e

Run verbatim from the clone root so `used-by` paths resolve repo-relatively. Full
outputs: `w2/census-manual-tip.txt`, `w2/census-manual-baseline.txt`.

| metric (manual command) | baseline 856fa9e | tip 32008a45 | exit codes |
|---|---|---|---|
| rows (`grep -cE '^\|…S[0-9]{3,}…\|'`) | **107** | **115** | 0 / 0 |
| malformed rows (NF≠13) | 0 | 0 | 0 / 0 |
| tier histogram | `A=92 B=6 C=9` | `A=100 B=6 C=9` | 0 / 0 |
| status histogram | `mined=79 queued=19 rejected=9` | `mined=87 queued=19 rejected=9` | 0 / 0 |
| duplicate ids | none (empty) | none (empty) | 0 / 0 |
| enum / tier-inflation violations | none (empty) | none (empty) | 0 / 0 |
| mined rows with missing used-by path | none (empty) | none (empty) | 0 / 0 |

Row delta: **+8, S108–S115, none removed** (`comm -13` id diff). All eight are tier A
and status mined, which accounts for the entire `A 92→100` / `mined 79→87` delta;
`queued`, `rejected`, B and C are unchanged.

Maintained `census` mode agrees with the manual commands exactly at both revisions
(`w2/census-mode-tip.txt`, `w2/census-mode-baseline.txt`): tip `rows=115`,
`tier.A/B/C=100/6/9`, `status.mined/queued/rejected=87/19/9`, `FLEET.missing=0`, exit 0;
baseline `rows=107`, `92/6/9`, `79/19/9`, `missing=0`, exit 0.

## Warnings diff (`w2/census-warnings-diff.txt`)

Baseline `validate`: 16 × W04 + `tabi ok`, exit 0. Tip: **18 × W04** + `tabi ok`, exit 0.
No warning was removed; two were added:

```
> W04  S114 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/
       third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT across scopes
> W04  S115 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/
       third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT across scopes
```

Both are the round-29 C3 superseding rows (`S114` supersedes `S096`, `S115` supersedes
`S100`) citing the same 156-tag `html_form_element.cc` URL in different scopes; E04 does
not fire because the scopes differ, and warnings do not change the exit status. This is
the only validation-state change from baseline: **16 → 18 W04, exit 0 → 0**. Any future
receipt that repeats "16 W04 (pre-existing)" — as the round-27 and round-28 receipts do —
would itself no longer be byte-reproducible at this tip.

## Round-28 routed defect 5 — reproduced, and one step past the quibble

Defect text: `corpus/lessons/round-28-verifier-spotcheck.md:16(b)` — the round-28 report's
census block printed `S068 … models/web_mcp/WebMCPModel.ts` while a rerun printed
`S068 … panels/application/WebMCPView.ts`; "the quoted output is not byte-reproducible".

- At both `856fa9e` and `32008a45`, the S068 row URL is
  `…/66df492…/front_end/panels/application/WebMCPView.ts` (row line 82 at tip).
- Every revision of `corpus/SOURCES.md` in the lane's refs that contains S068 (17
  revisions, `git rev-list --all -- corpus/SOURCES.md`) carries the `WebMCPView.ts` URL
  for S068; none carries `models/web_mcp/WebMCPModel.ts` in that row.
- The `WebMCPModel.ts` path does occur in the registry history — S036's source URL and
  S044's row text (present at `6c97851` and still at this tip) — but never as S068's
  source URL.
- The quoted block in `/home/vgpnk/Projects/shokunin/.ufo/reports/round-28/tabi.md:37`
  (Before) and `:58` (After) therefore does not reproduce from any committed registry
  revision I could enumerate; it is a fabricated/mis-transcribed line rather than a stale
  snapshot of an older S068. My runs reproduce the round-28 verifier's line
  (`WebMCPView.ts`), 16 W04s at baseline and 18 at tip.
- Bounded claim: enumeration covered lane refs only (`--all` in a shared clone), not
  unreachable objects.

Byte-exactness itself: both tip runs are byte-identical (`cmp` 0), the lane-root run and
the clean-clone `--file` run agree after normalising only the invocation-dependent lane
label and the trailing file path, and the round-29 baseline receipt
`.ufo/waves/round-29/baseline/census-start.txt` reproduces byte-for-byte (after the same
normalisation). The census output is reproducible for identical invocation and input.

## Risks / limits of this census

1. `validate` output embeds the invocation-dependent lane label (`tabi` vs `file` for
   `--file`) and the absolute registry path; "byte-exact" comparisons must normalise
   those two fields or use identical invocations. I normalised, and say so.
2. `census`-mode tier/status lines and the manual histograms are emitted from `for (k in …)`
   awk hash traversal, not sorted. Observed byte-identical across repeated runs here
   (`cmp` 0 at both revisions), but line order is not specified by the script and could
   differ with another gawk build. Multi-line census artifacts are therefore only
   conditionally byte-exact; the counts are exact.
3. Exit status is insensitive to W-codes: the 16→18 W04 delta is invisible to the
   round's exit-0 receipts.
4. The lane working tree carries untracked w1 pin/byte files (not mine, not modified);
   the tracked `corpus/SOURCES.md` is clean and hash-equal to the named tip.
5. No lane file was edited, no git index/jj state touched, no build/lint/test run.
   No tool installed. No subagent dispatched.

## Artifacts (under `.ufo/waves/round-29/w2/`)

| file | sha256 |
|---|---|
| `census-tip.txt` | `9dbb91730a0143846aa5fa1753099e804cc0af8ced4ff37d1946e9293cc6cead` |
| `census-tip-rerun.txt` | `9dbb91730a0143846aa5fa1753099e804cc0af8ced4ff37d1946e9293cc6cead` (cmp-identical) |
| `census-baseline.txt` | `7b04bba11bb26fd8a643b92098f5f26811bf1bfe14a44960e4b6df431ee12462` |
| `census-manual-tip.txt` | `ff16d9d39558676c35df21976558aff7eedd79fcdb63fa9ca4fd8176d57ae983` |
| `census-manual-baseline.txt` | `444ac127a4cdc2674a393c0535720b81bd9df8eab7a4dfcb801aa2a0e5fc3c0f` |
| `census-mode-tip.txt` | `0cb5ea2dd3138fb1f729762dfecba83225339f61105d84bfab892c6b5572bf48` |
| `census-mode-baseline.txt` | `4876b3a84625142a59c54521589e0ebcab05edcca6c91cf828c515e69ab35687` |
| `census-warnings-diff.txt` | `9a696f5014011c36e01010d9927905997c48bc354d30ee2d962a34b1c1bf7779` |

`census-baseline.txt` is the raw `--file` output plus its `exit=0` line; the registry it
measured is `856fa9e:corpus/SOURCES.md`, sha256 `e7e32aba…f9403`.
