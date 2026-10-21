# ReviewChronology — W2 review bytes versus the finalized acquisition

## Question

Which exact bytes did W2 review, which exact bytes did L1 acquire at finalization,
and can any W2 review be credited against the finalized receipt? This is a
read-only chronology audit. I read the retained W2 returns, all 58 W2 reports, the
64-item W2 spec context and every item prompt's acquisition references, the
finalized execution record and receipt, every archived producer generation, and the
Git blobs that bind them. I performed SHA-256 arithmetic and read-only
`git cat-file`/`git ls-tree` only. No build, test, lint, formatter, browser, REA,
install, VCS/index mutation or production edit was made. The only lane write is
this report.

Axes: reviewed-byte identity; reviewed-versus-acquired chronology; preservation of
the reviewed generation; honesty about what was never reviewed.

## Verdict

- W2's runtime-evidence scope was the **bounded acquisition v4**, producer
  `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9`, receipt
  `323ccd591d82a8867903ea859ae45bac46eb0beb42bf27997aefac9c8773e6a6`.
- The **finalized acquisition** is producer
  `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`, receipt
  `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`.
- **No W2 report or return cites the finalized producer, receipt, counter or any
  of the 12 final case evidence digests/IDs/nonces.** Zero of 58 reports and zero
  of 64 returns contain `bc11e4d6…`, `4bc79636…`, `8d992423…` (final counter),
  `2d5eaaa…`, `5f58577…`, or any of the 12 final case evidential digests, IDs or
  nonces. By contrast, all 12 bounded invocation IDs and all 12 bounded nonces
  occur in the 58 reports; 29 reports cite the bounded producer and 5 cite the
  bounded receipt.
- The finalized run started at `2026-10-21T13:51:46.597742Z`, after the W2 returns
  were captured at `2026-10-21T13:49:02.529912Z` and after the last W2 report was
  written at `2026-10-21T13:38:38.096Z`. No retained W2 artifact can contain a
  final-byte observation; the closure asserts W2's final exit at `13:45:46Z`,
  before the run.
- The first delivered-ancestry commit containing the W2 outputs (`2d5eaaa`,
  `14:16:50Z`) is later than the finalized run; two dangling sibling commits with
  the same parent (`e26f02a9`, `ddad1edd`, `14:16:49Z`, not ancestors of delivered)
  also carry the final producer. **Commit time is not review time.** The reports'
  own content pins, not mtimes or commit ancestry, establish their scope.
- The reviewed generation is retained and reconstructable: `history/runtime-v4/*`,
  `history/webmcp-lifecycle-v4.mjs`, and Git blob `7a7a7482…` for the reviewed
  history index. The reviewed counter/selftest/fixtures/note are recoverable as the
  `1b5f449` blobs. The final counter/selftest/fixtures/note were **never**
  W2-reviewed.

No claim of authenticated acquisition, actor identity, quiescence or settlement is
made. The observations below are byte/digest/timestamp arithmetic plus the
artifacts' own assertions.

## Timeline (UTC; filesystem local time is UTC−03 in this lane)

| UTC | Event | Basis |
|---|---|---|
| 12:39:34.232–.263 | v1 preflight refusal, exit 1, `node_version_mismatch` | `runtime-execution.json` |
| 12:39:42.650–54.357 | v1 pinned acquisition, exit 0 | `runtime-execution-pinned.json`; `history/runtime-v1/` |
| 12:51:32.019–43.626 | v2 ordering repair, exit 0 | `runtime-execution-ordered.json`; `history/runtime-v2/` |
| 12:53:34.135–45.690 | v3 navigation-qualified repair, exit 0 | `runtime-execution-final.json`; `history/runtime-v3/` |
| 13:07:01.895–14.124 | v4 bounded acquisition, exit 0; receipt start/finish `13:07:02.041Z`/`13:07:14.098Z` | `runtime-execution-bounded.json`; `history/runtime-v4/` |
| 13:19:28 | commit `1b5f449…` (bounded receipt, original note, index v1, pre-repair counter/selftest, no producer blob) | `git log -1 1b5f449` |
| 13:21:46.761 | W2 registry `updatedAt` (dispatch record) | `w2-record.json`; `w2/swarm-registry.json` mtime `13:21:46.764Z` |
| 13:22:35.341 | first W2 report mtime | `w2/SourceSubmit.md` (`13:22:35.341Z`); `w2/CounterSource.md` at `.345Z` |
| 13:38:38.096 | last W2 report mtime | `w2/SemanticAutoPositive.md` |
| 13:45:46 | W2 final exit, as asserted by the closure; not present in retained artifacts | `round-22/round21-closure.json` `wave_conformance_debt` |
| 13:49:02.529912 | W2 returns captured (`allActorQuiescenceCertified:false`) | `w2-returns.json.readAt` |
| 13:49:27.925 | v4 producer archived to `history/webmcp-lifecycle-v4.mjs` | that file's mtime |
| 13:51:18.900 | finalized producer `scripts/webmcp-lifecycle-round21.mjs` mtime | that file's mtime |
| 13:51:46.597742 | finalized wrapper starts | `runtime-execution-finalized.json.startedAt` |
| 13:51:46.773 | final receipt `startedAt` | `corpus/evidence/round-21/runtime/receipt.json` |
| 13:51:58.439 | final receipt `finishedAt` | same |
| 13:51:58.451 | corpus receipt file mtime (write time; relocation not separately observed) | filesystem |
| 13:51:58.460511 | finalized wrapper ends | execution record |
| 13:51:58.461032 | execution record written | record mtime |
| 14:09:12.888 | `history/index.json` rewritten (finalized entry added, bounded demoted) | index mtime |
| 14:16:50 | commit `2d5eaaa…` (delivered ancestry; final receipt/producer/record/corrected note; W2 reports present). Dangling `e26f02a9`/`ddad1edd` at 14:16:49Z, parent `1b5f449`, also carry the producer | `git log -1 2d5eaaa`; `git cat-file -p` |
| 14:29:41 | commit `5f585773…` (delivered; same receipt/producer/record blobs) | `git log -1 5f585773` |
| 14:44:47 | closure `closed_at` | `round21-closure.json` |

Precedence that needs no clock: 29 reports cite `5363d576…` for
`scripts/webmcp-lifecycle-round21.mjs` during 13:22–13:38; the first
delivered-ancestry Git blob of `bc11e4d…` is at `2d5eaaa` (14:16:50Z), and the
final receipt's first delivered blob is also there. Dangling siblings
`e26f02a9`/`ddad1edd` (14:16:49Z, parent `1b5f449`, not ancestors) carry the same
producer. The script file mtime is `13:51:18Z` and the finalized run starts
`13:51:46Z`, corroborating the same order.

## Producer generations (all executed versions)

| Generation | Producer sha256 | Executed by | Acquisition |
|---|---|---|---|
| v1 | `a273fe77161bf6b29e1f98efbb4568d615fe1aa8109e3cb6a33dc0070f905c3d` | `runtime-execution.json` (exit1), `runtime-execution-pinned.json` (exit0) | `history/runtime-v1/` |
| v2 | `b99d1698615e6aedcb92f965ee1c54024822b3605905e46a1f9303d36534548a` | `runtime-execution-ordered.json` | `history/runtime-v2/` |
| v3 | `847d046710a0dd5e61d966f4cb985052bca1966c75481a16d9cc931aa3a786d4` | `runtime-execution-final.json` (historical "final", not finalized) | `history/runtime-v3/` |
| v4 | `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9` | `runtime-execution-bounded.json`; **W2 scope** | `history/runtime-v4/` |
| finalized | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` | `runtime-execution-finalized.json` | `corpus/evidence/round-21/runtime/` |
| revived draft | `4cdbd9e4149c9fada3bce8cb1e75c3c338d44654df4306b01567b549924910e6` (gunzip of `history/revived-runtime-draft.mjs.gz`) | **no execution record**; never integrated or run | none |

The archived v1–v4 copies match the `producerSha256` of their execution records
exactly. Archive mtimes are later than run times (v1 `09:50:31`, v2 `09:53:19`,
v3 `10:04:00`, v4 `10:49:27` local); digest equality, not mtime, binds them. The
revived draft digest appears in no execution record.

`runtime-execution-final.json` (v3) is a **different record** from
`runtime-execution-finalized.json`. W2 used "final" for v3 and this is a standing
naming hazard; the finalized record is the current one.

Execution-record pins: bounded
`794f0b68add50a884fde0d907e50ff3864587674ea53bcf5181a67635344a380` (present at
`1b5f449` and `5f585773`); finalized
`65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4` (absent at
`1b5f449`, present at `2d5eaaa`/`5f585773`). Earlier records: refusal `b6822dc1…`,
pinned `17c8d875…`, ordered `d8e423da…`, final/v3 `8a4efdee…`. The finalized
record's `revision: 1b5f449…` is the run-time HEAD, **not** a commit containing
`bc11e4d`: the producer was untracked then, and
`git cat-file 1b5f449:scripts/webmcp-lifecycle-round21.mjs` is absent.

## W2-reviewed acquisition bytes

Reviewed receipt: `323ccd59…` — 753 lines, 22,143 bytes, `startedAt
2026-10-21T13:07:02.041Z`, producer `5363d576…`. Retained byte-identically at
`.ufo/waves/round-21/history/runtime-v4/receipt.json`; the `1b5f449` Git blob has
the same sha256. Reviewed producer bytes: digest `5363d576…`; W2 reports computed
or cited that digest for the then-worktree `scripts/webmcp-lifecycle-round21.mjs`,
and a byte-identical copy is retained at `history/webmcp-lifecycle-v4.mjs`
(archived `13:49:27Z`). At `1b5f449` the script path had no blob.

Reviewed per-case evidence digests (full values), versus the finalized values now
at the same corpus paths:

| Case | Reviewed (bounded v4) | Acquired (finalized) |
|---|---|---|
| na-pending | `ae7e555b5a2d98a687857afa94454e01be9038d29bb35d0f32e5c68f846f9e20` | `f17fe86f9fe8c6ba0e9d71303d7d23cfc7518a0e9e6288a55d0b5f37047b796e` |
| na-click | `dd92265ecb65907fdd1bf94b7a4ba26e8b38ab73e73859bf90aedf18dcdcfd3a` | `36502a284bad8b0b84c13346f40b1f1de1eeb8c5b6d5ce11fa8b971f877927ba` |
| na-requestsubmit | `ecb92d9a32efa9ae2f4528d0319ba9cd6d60655c7d3fc491302a646a496b704f` | `4b8245d762fea96e463a4b21623055d7b3509cb7cd9d1e6f7b9e101d730ca8fa` |
| na-native-submit | `1ddf6e89061e7200a5698f7d8b4cf5c5d1f7bfcd8cb0a11ce01b25193ef0bead` | `28a20412dc11d4d1ed690b4d80414a359193db491518b32277cff5a12eebc9b5` |
| na-reset | `8a88a8c6734ba8635640d80ffc64fdac099a27e5750b7386330c135f2732fb42` | `097b88338a619c794d69b6baac897370f29dfe5864a22f42bb54fcc6a1139ec4` |
| na-remove | `fcf243e8c814795c927529eb005a61a78c05688eaf1c385bea0a2a3138189868` | `e7e32f5f202a7d34262f143217bf4d370b89e1497493655259a9ecc0c6339e69` |
| na-reject | `4f27fb3d372798bcaaa803dc7eedb50d25d1350609e096ffcc50dbedee06d92a` | `a57b41bd0b1c904162f32798b5d0a5797c57ec1a667ef40357846c7dac49f741` |
| na-throw | `bbe5fcac0d7186e8c197f2650d7a6521fc46860a83428ae844b88a2cc7fcfd97` | `e46d751e5b5f1927175b5a2395e3ed48e0b2033ffa80e14cb4a92ac1d44b9d1a` |
| na-delayed | `50fb7f14fa7334a859e40ff47f58cdcb87d5baeef32a671e290c8a4a96cb6c62` | `146adde4fffeea41ed4307e12c39c41a1ac2f0d88634e95b86f652134b2344f2` |
| na-invalid-submit | `ca703c843237671ec435efd9797ff4e70e1e02884b714ef5f4e2c34e488919b0` | `e7712c1b8568c3c814881ab89744e07eccbf48e78bde0ed84dcd05091795506f` |
| auto-positive | `5931ea3bc5b3d8d25fe2e53176a449adcc4e13a6c91ef88a41495ee860b3b5f0` | `62f257e90e2bc3b5a445bb08d5dc144895abe188f20570ad6ab806358099e0fe` |
| auto-invalid | `c70c2aab6f8400c76e43e2cb2d5c4878874eb32108be8f8794c5bdb1aab16095` | `28a37c0ed2563f1bd7f8649a8d7830701932c607b7fbafcb1a03576da7326aed` |

All 12 HTML fixtures also differ between the two acquisitions. Neither receipt
stores the other's nonces or invocation IDs: bounded IDs
`1C19BCCE…, 0B53A878…, DE3108…, F38D811…, A49A43…, 063A09…, B5B968…, 9F5CB6…,
6B4E789…, C07B3CB…, 7EA240…, 44FE24…` versus final IDs
`44555B4F…, 5CE5ECE3…, 56322D…, 095079…, B8BA3C…, 622C2C…, DAB4A9…, 3CE04A…,
6E3D45…, 38E3FB…, 4F3E02…, 1CB23F…`. All 12 bounded IDs and all 12 bounded
nonces occur in the W2 reports; none of the final ones does.

Other W2-cited bytes that later changed (representative):

| Path | At `1b5f449` (observed HEAD) | At `5f585773` (delivered) |
|---|---|---|
| `.ufo/waves/round-21/history/index.json` | `7a7a74825bfd92746a56b6febbd742d7ebcf1d503367a547c417cf78d00542d1` (bounded = "current bounded qualified acquisition") | `a4e09a95d933ccec9992ed263da04c498dcae8708f279bab6cb86d414c771b8d` (bounded = "historical bounded acquisition"; finalized added) |
| `corpus/knowledge/webmcp-nonautosubmit-round-21.md` | `346925a8f7733b9b55b2366e8cec25bfeb26f81cca5bcf2d6397c9d83ff86db8` | `8c9be28c7becea24b8ea588f54d8962af3ea665f479d98eb4b984bc6b7215d2c` (adds 12-line supersession append) |
| `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` | absent | `39a19b0faf7a88f3ecff3079092b6191ca2c9ffd51e3c3a53f53855cf7e20ec4` |
| `.ufo/waves/round-21/measure-c1.mjs` | `4b6f271f3948b298918df150d5413f68b4134842b7106de8905cc70873221554` | `8d99242316c3217f1c5d76edc5e4b28f8a22c1d9dd6d1e884ad4a87b17fdf5eb` |
| `.ufo/waves/round-21/selftest-c1.mjs` | `c0a4cd27c8d7b7fe3194fe14493b392e616ea41dbaebb5c2e25b5d9cb0269e89` | `1fa3d8278e4b74ef4fd4e886dbf551a21c16de663e490709030247b3fd29c953` (`git diff --stat`: 105 changed lines) |
| `.ufo/waves/round-21/fixtures/expected.json` | `d2a50551af65fb35e904a4cf97de84f1142c369b6ad7096aad0cfe33a1130979` | `37cc2995fd0ca24f445439e7716ebf8d0daba514745f5ab3738603a21d918eec` (42 changed lines) |
| `.ufo/waves/round-21/fixtures/positive-ordered.json` | `d12f5dde27e7dee40b8d2b088c86e8ad825c3e890463cbd9f76fcdd74bcdc98f` | `aa3726264f2a4f883855aecbce0fec15dcc3d597e6e19ec943fcfe78817f8e75` (37 changed lines) |
| `.ufo/waves/round-21/run-checks.py` | `8aaf575399c5fae1305178ede754397c867677f46d61e00285ec88998c835c53` | `4ed74c8e3982e780e0950d0ea829bbc167fa7cc49197745243843dda0fc6135b` (6 changed lines) |
| `SKILL.md` | `2822c8ca8b853da4727da67eac4c01f762d22e58762e72c33935bc29ab5afb1f` | `54da3b2beb2b918a7b5788731d755f92ec5f2f691bc8b241cf411f4afea6c0d3` |
| `corpus/SOURCES.md` | `477fd1eefe829a04d4735d3bbe9b9e6e029e05193ec57ec44e5cb7118e4f3f95` | `1572aa2dec255d80c25e4200ee9020ba4526a688887e5aa588aacae8acff71a3` |

Derived pins (not authenticated identities): the 26-artifact reviewed set
(receipt + 12 JSON + 12 HTML + v4 producer; path strings normalized with
`os.path.normpath`) hashes to
`a6910546c1784a34b313cb03158dee6e0b96ef70146c8b0192efbd713915e973`;
the 26-artifact finalized set hashes to
`9bae7be67d0646e57f9896121c9e2fde5b4d1606ba4d1d937d490d511a15f101`;
the 58 W2 report files at read time hash to
`2e0c72c394ff0521230a592147751a4b4ac6bcbb5102d20a442186d62ea1dfc8` and are
byte-identical to their `5f585773` blobs.

## What the W2 artifacts themselves prove

- 31 of 58 reports cite at least one reviewed-era pin. Within those 31: 29 cite
  producer `5363d576…`; 5 cite receipt `323ccd59…` (in `MutationSummaries`,
  `MutationProducer`, `MutationVacuity`, `MutationOrdering`, `ReviewFrontier`);
  4 cite counter `4b6f271f…`; 4 cite selftest `c0a4cd27…`;
  1 cites note `346925a8…`; and 9 cite `1b5f449` as the observed HEAD. Other reports
  name `runtime-execution-bounded.json` by path without a digest (e.g.
  `ConnectNoHarm.md:15`); they are content-tied, not digest-pinned.
- `ReviewFrontier.md` states that the observed canonical receipt SHA-256 is
  `323ccd59…`, and its 12-row window table is exactly the bounded receipt's values
  (e.g. `na-click 255/542`, `na-delayed 254/754`, `na-pending 254/501`). The final
  receipt records `252/547`, `252/755`, `254/503`; every case pair differs.
- `ReviewEnvironment.md`, `ReviewCounterInputs.md`, `ReviewExecutionProvenance.md`
  and `ReviewCleanupRun.md` explicitly name `runtime-execution-bounded.json` and
  `5363d576…` as the acquisition under review. `SourceS101.md:52-54` and
  `ReviewExecutionProvenance.md` correctly flag `LOG.md`'s pointer to v3
  `runtime-execution-final.json` as stale; that text is present at `1b5f449`
  `LOG.md:1387-1391`.
- The W2 spec context itself scoped the wave: "Current acquisition is
  runtime-execution-bounded.json. Earlier pinned/ordered/final acquisitions were
  preserved under .ufo/waves/round-21/history/ with exact old producers and path
  mapping." None of the 64 W2 item prompts contains a 64-hex digest or the word
  "finalized". The prompt is consistent with the `1b5f449` index blob, whose lines
  21-24 read "current bounded qualified acquisition".
- The reviewed index lines 15-19 already call v3 "historical navigation-qualified
  acquisition" and lines 21-24 call bounded "current". The retained
  `1b5f449:history/index.json` blob `7a7a7482…` reproduces both exactly.

No W2 report or return claims review of the finalized acquisition. References to
"final serial verification" are forward-looking, e.g. `ReviewNoHarm.md:11`,
`ReviewFrontier.md:82`, `ConnectProvince.md:48`, `MutationOrdering.md:7`; references
to `runtime-execution-final.json` mean the historical v3 record.

## What changed after W2 and was never re-reviewed

- **History index rewrite.** The current index (`a4e09a95…`, first committed at
  `2d5eaaa`, mtime `14:09:12Z`) demotes bounded to "historical bounded acquisition",
  moves its producer to `history/webmcp-lifecycle-v4.mjs`, and adds the finalized
  entry at lines 27-33. W2 reports that cite `history/index.json:21-24` as
  "current" therefore cite bytes that no longer exist at that path. The earlier
  bytes survive as Git blob `7a7a7482…` at `1b5f449`; the current file carries no
  generation marker. This is the concrete path-level chronology debt.
- **Producer repair.** Committed final producer `bc11e4d` differs from v4
  `5363d576` by 15 changed lines (25 diff-output lines). The final version adds
  `failure` capture, `serverError`/`tempError` recording, and a `cleanup_failed`
  rethrow, so a cleanup error no longer skips receipt persistence; v4 lacks those.
  This is the failed-server-close evidence-preservation repair. Its shape matches
  `ReviewCleanupRun.md` F1/F3's proposed fix, but the script's mtime is
  `13:51:18Z`, after every W2 report, and its first delivered-ancestry blob is at
  `2d5eaaa`, so W2 never reviewed it.
- **Counter/selftest/fixtures.** The delivered counter (`8d992423…`), selftest
  (`1fa3d827…`), expected (`37cc2995…`) and positive fixture (`aa372626…`) are not
  the bytes W2 saw. W2 line citations such as `measure-c1.mjs:47,51-58,72-77,96-97`
  and `selftest-c1.mjs:35-37,53,87-89` are against `1b5f449` blobs, not delivered
  code. The delivered files incorporate later changes (`git diff --stat`:
  77 counter lines, 105 selftest lines, 42 expected-fixture lines, 37
  positive-fixture lines); no W2 seat re-reviewed the applied bytes. Proposals from
  `CounterFlags`, `CounterErrors`, `CounterSource`, `CounterHtml`, `Mutation*`,
  `ReviewOutside` and `ReviewCleanupRun` were therefore prospective, not
  falsifications of the delivered counter.
- **Note.** W2's note findings (`ReviewNoteProvenance`, `CounterSource`,
  `MutationOrdering`) target original note `346925a8…`. Delivered retains it with a
  12-line supersession append (`8c9be28c…`) and adds the measured corrected note
  `39a19b0f…`; W2 reviewed neither.
- **LOG.** The delivered `LOG.md` (`f159d4be…`) adds the "Round-21 final
  integration corrections" section at lines 1404-1419: finalized record is current,
  the finalized execution "retains cleanup failures", and the missing-producer
  state "was reported by w2". That is a later correction outside the W2 reports;
  it does not retroactively make them final-byte reviews.

## W2 returns and completion (as retained)

`w2-returns.json` schema `tabi-round21-wave-returns-v1`, wave `tabi-r21-w2`, 64
seat records, `readAt 2026-10-21T13:49:02.529912Z`, `taskReturnBarrierObserved:true`,
`allActorQuiescenceCertified:false`. Seat keys are only
`name, role, latestOutput`; there are no per-seat timestamps. The returns file
contains zero occurrences of `bc11e4d657a9bf1`, `4bc79636d0dfd54d`,
`8d99242316c3217f`, `2d5eaaa3c8317bce`, `5f585773258b33d2`, and the word
`finalized`. Five seats have empty
`latestOutput` (`SemanticNaReset`, `SemanticNaRemove`, `TraceNaNativeSubmit`,
`TraceNaRemove`, `ReviewRegistry`); `SemanticNaNativeSubmit` has a 1,214-byte
unfinished think block and no report. `w2-failures.json` records 6 failed seats in
three groups (3 Codex capacity, 2 Zai rate limit, 1 invalid-prompt refusal), 0
replacement seats, 0 job-cap refusals, and states the partial analysis is not a
completed semantic review. Exactly those 6 seats have no `w2/*.md` report; the
other 58 do. The closure's `13:45:46Z` final-exit time is not independently
recoverable from these artifacts and is reported here as a closure assertion.

`w2-spec.json` has 64 items; `w2-record.json` registry `createdAt
12:55:20.623Z`, `updatedAt 13:21:46.761Z`. First report `13:22:35Z`.

## Facts, inference, unknowns

**Observed facts:** all digests above; 753-line/22,143-byte structural equality of
the two receipts; 12/12 bounded IDs and nonces in W2 reports; 0/12 final IDs and
nonces; 0 hits for the final-era pins listed above; 31/58 reports with reviewed-era
pins; 58/64 reports; 6 failed seats; final producer 15-line diff; index/note/counter/selftest
blob changes; 25/25 final artifact pins and 12/12 final evidence/fixture hashes
match; final receipt cleanup `{browserClosed:true, serverClosed:true}` with 13
requests.

**Inference:** the 27 reports outside the 31 carry no reviewed-era hash or HEAD
citation. They still belong to the bounded scope when they quote bounded-only IDs,
nonces, windows or line content; this is strong but per-report content-inferred,
not digest-proven. Some of the 31 also cite only the `1b5f449` commit rather than
an artifact digest.
The final producer's added guards implement `ReviewCleanupRun` F1/F3: the diff
shape and the LOG wording agree, but the code does not cite the report.

**Unresolved:** no retained per-seat clock or read telemetry; returns `readAt` and
file mtimes are assertions/filesystem observations, not authenticated timing. No
W2 seat's actual read syscalls or actor identity can be authenticated. Whether every
path-only W2 citation resolved to bounded bytes at read time is not individually
proven. The final execution record is author-side; its pin map is keyed by canonical
corpus paths although the run wrote `.ufo/waves/round-21/runtime-finalized-candidate`
(the producer hardcodes canonical evidence paths), and the candidate directories no
longer exist. The record's mtime (`13:51:58.461032Z`) postdates the corpus receipt
mtime (`13:51:58.451747Z`) by about 9 ms, so the index phrase "pins every canonical
artifact before relocation" is not established by the retained timestamps; the pins
do match the canonical bytes exactly. Same path-hardcoding behavior was flagged for
the bounded run in `w2/FixtureNaThrow.md`.

## Consequence for the debt correction

- Credit W2 only for the bounded generation: pin reviews to
  `323ccd59…`/`5363d576…` and the 12 reviewed case digests, or to the explicit
  per-report pins; path-only reports are "uncited", never "reviewed final".
- Resolve W2's `history/index.json` citation to Git blob `7a7a7482…` at `1b5f449`;
  resolve the review clock to `w2-returns.json.readAt` (`13:49:02.529912Z`), never
  to commit time (`2d5eaaa`, later) or mtime alone.
- Do not credit W2 for the finalized receipt (`4bc79636…`), producer (`bc11e4d…`),
  delivered counter/selftest/fixtures, corrected note, or the server-close repair.
  The retained verification for those bytes is L1's serial checks plus the
  closure's separate non-author remeasurement; W2 never saw them.
- Preserve history by appending a scope note that names both generations and both
  index blobs; do not rewrite the W2 reports, the original note, or the captured
  execution records.

Report: .ufo/waves/round-22/w1/ReviewChronology.md
