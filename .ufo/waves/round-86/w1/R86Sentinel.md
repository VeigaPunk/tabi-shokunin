# R86Sentinel — bounds and provenance audit, round 86 (wave w1)

**Seat:** R86Sentinel (sentinel; read-only, leaf, no subagent dispatch)
**Lane:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`
**Audit window:** 2026-11-08 05:04 → 06:16 -03 (round-86 wave live)
**Base:** `57265864` · **D:** `4bd89a80f439` · **nonce:** `tabi-r86-l1-4bd89a80f439`
**Tools:** node v24.21.0, python3, chromium 155.0.8059.84, jq-free shell. No installs; no tool/channel actions taken.

---

## Verdict

**Scope is clean.** Every path the round wrote lies inside the lane tree, the fleet-root
round-report path, or the L0 file. No sibling lane, no fleet tracked file, no `PATH`
directory, no host sysctl, no pacman transaction, and no scratch tree left behind by any
instrument that I could attribute to this round.

**One provenance defect found** — F1 below, a *staleness* defect in the committed
do-nothing control, not a scope violation and not a claim defect.

Every number in this report is one I measured. Commands are quoted inline so each claim
is checkable without trusting me.

---

## F1 — MEDIUM — the committed do-nothing control `nowork-r85-under-r86.json` is stale: it no longer reproduces, and its recorded finding set omits a finding the counter now raises

**Artifact:** `.ufo/waves/round-86/controls/c1/nowork-r85-under-r86.json`
(mtime `2026-11-08 05:32:49 -0300`, committed in `9919aa52`)

**Exploit path (how to observe it):** re-run the frozen counter on the r85 receipt with the
frozen r85 identity pins and diff the finding ids against the committed control.

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node scripts/check-showpicker-r86.mjs \
  --lane $PWD \
  --receipt corpus/evidence/round85/chromium-showpicker/receipt.json \
  --expect-driver-sha256 1690c63d14447a08ea9fe915a49d317e2953c5fb08e064e8f160a100089ab8ee \
  --expect-nonce tabi-r85-l1-620623a43f74 \
  --expect-fixture-sha256 0b0129377711954ddae722a7ad6db8f00f5eb94759ef45786f21b6eede3d252a \
  --prior-set .ufo/waves/round-86/controls/c1/prior-set.txt --json
```

**Measured result (exit 1, verdict `findings`, checkCount 89):**

| | committed control | my re-run |
|---|---|---|
| findings | 39 | **40** |
| extra finding id | — | `prior-set-complete` |

The extra finding's detail is verbatim:

> `receipts of schema tabi-chrome-cdp-showpicker-r86 in the round-86 wave/evidence trees, not
> the receipt under test (path corpus/evidence/round85/chromium-showpicker/receipt.json), not
> exempted by sha256 and not among the priors:
> /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round86/chromium-showpicker/receipt.json`

**Cause.** The control was captured at 05:32:49. The scored r86 receipt was written at
05:43:08 (`stat corpus/evidence/round86/chromium-showpicker/receipt.json`), i.e. **10m19s
after** the control. The counter's `prior-set-complete` check walks `TREES = ['.ufo/waves/round-86',
'corpus/evidence/round86']` (script line 45, walk at line 796) and refuses any file in those
trees carrying schema `tabi-chrome-cdp-showpicker-r86` that is not the receipt under test, not
a declared prior, and not tree-exempt. When the control ran, the r86 receipt did not exist
yet, so the walk was empty of r86 receipts. Now the r86 receipt is present in the walked tree
and is correctly refused as an undeclared receipt. The control is measuring a tree state that
no longer exists.

**Evidence the rest of the control is otherwise faithful.** With the r85 pins the finding ids
are identical apart from the one extra:

```
repro-only:    ['prior-set-complete']
committed-only: []
```

and `checks` differs in exactly one key (`prior-set-complete`). The `limit` block, the
`priorSetFile` sha256 (`1a3d47bf7cb8d1dd731a0634eb190f9b6fb11fc96fed5c1e0eba5964e9413af9`),
and the 89-check count all match the committed file byte-for-byte on those fields.

**Impact.** The control's *purpose* — "the r85 scored receipt is refused by the r86 counter"
— still holds: exit is still 1, verdict is still `findings`, and `plan-frozen`/`leg-order`
are still present. The defect is that the committed artifact is a **stale snapshot of a
counter run**, and it now records `checks.prior-set-complete == true` (i.e. "the walked trees
contain no undeclared r86 receipt"), which is **false against the committed tree**. Anyone
re-verifying the committed control byte-for-byte gets a different document and cannot tell
whether the difference is a regression or a stale capture.

Note this is *not* a claim-integrity defect: the committed control is a control, the C1/C2
predicates do not read it, and `scripts/check-record-drift-r86.mjs` does not assert on it
(it asserts `r86-numbers` from `scored/`, and `census-artifacts` from the census pair). The
selftest's `nowork-control` gate only requires `r.status === 1 && ids.includes('schema')
&& ids.length >= 5` — satisfied both before and after — so no gate is red.

**Smallest remediation (no predicate, counter, pin, prior, threshold or kill rule touched).**
Re-capture the control against the *current* tree and commit the fresh output, keeping the
same command and the same exit-1 semantics — i.e. re-run the command quoted above and
overwrite `.ufo/waves/round-86/controls/c1/nowork-r85-under-r86.json` with its stdout.
The extra `prior-set-complete` finding is the *correct* current answer and should be
recorded rather than suppressed. (An alternative that needs no re-capture is to note the
capture timestamp and the tree state in the control's own `limit`/detail text, so a later
reader can tell a stale capture from a regression.) I did not make this edit: my seat is
read-only and the L1 is the sole integration owner.

**Severity rationale:** MEDIUM, not HIGH, because no claim depends on the artifact and the
refusal the control exists to demonstrate is intact. It is a recorded-evidence-provenance
defect, which is exactly the class this seat exists to catch.

---

## (1) Path scope — every path the round wrote

**Lane working tree, in-lane only.** `git -C <lane> status --porcelain` returns exactly
the lane's own tracked edits plus the round's own untracked artifacts:

```
 M LOG.md
 M SCORECARD.md
 M SKILL.md
?? .ufo/waves/round-86/
?? corpus/evidence/round86/
?? corpus/knowledge/chromium-showpicker-runtime-round-86.md
?? corpus/lessons/round-86.md
?? plans/round-86.md
?? scripts/check-record-drift-r86.mjs
?? scripts/check-showpicker-r86.mjs
?? scripts/chrome-cdp-showpicker-round86.mjs
?? scripts/kill-power-r86.mjs
?? scripts/negatives-showpicker-r86.mjs
?? scripts/selftest-r86-gates.mjs
?? scripts/witness-families-r86.mjs
```

Every one of those is under `/home/vgpnk/Projects/shokunin/tabi-shokunin/`. Nothing resolves
outside it: `git ls-files` / `find` over the round's wave tree and evidence tree returns no
path under another lane, the fleet root, or `PATH`.

**Round-86 wave tree, all in-lane.** `find .ufo/waves/round-86` yields only
`census/ claims.json controls/ freeze.txt scored/ sources/ w1/ w1-dispatch.json w1-spec.json
w1.ready w1.ready.dispatched` — all under the lane. The only absolute path that appears
*inside* round-86 files is the fleet-root round-report path the L1 is instructed to write
(`/home/vgpnk/Projects/shokunin/.ufo/reports/round-86/tabi.md`), which is the L0/report
side channel the lane prompt sanctions (`.ufo/prompts/tabi-round-86.md:101`). Measured:

```
$ ls -la --time-style=full-iso .ufo/reports/round-86/tabi.md
-rw-r--r-- 1 vgpnk vgpnk 14454 2026-11-08 06:13:48 .160555919 -0300 tabi.md
```

That file is untracked in the fleet repo (`git status --porcelain` → `?? .ufo/reports/round-86/tabi.md`),
consistent with the fleet-commit step being separate from the lane commit.

**Commit scope.** `git show --stat HEAD` (9919aa52) = **42 files, 81219 insertions**, every
path lane-relative: the 7 r86 instruments, the round's wave tree, the receipt, the three
record files, and the 3 lane tracked edits. `git diff --stat 57265864..HEAD -- corpus/SOURCES.md`
is **empty** — the round did not touch the shared registry.

**Sibling lanes: untouched by this round.** I measured per-lane file counts newer than the
round start (05:04) for every sibling lane and checked each hit:

```
souji 1197   chousa 1295   kagi 423   mado 196   tameshi 2096
kumitate 0   kasegi 0   tsukuroi 365   kaidoku 0   kake 0   kengaku 0
kotoba 0    kotodama 0   revenger 0   mori 0
```

Those non-zero lanes are **other lanes' own concurrent rounds** (souji r86, chousa r89,
kagi r66, mado r100, tameshi r94, tsukuroi r94), each with its own base and its own
commits — not tabi writes. The only cross-lane hits for r86-specific tabi content were
`chromium-showpicker` string matches in chousa's `scan_supersed.tsv` and tameshi's
`T91CN1-hits.tsv`, and both resolve to **older tabi corpus rows**:

```
chousa  …/scan_supersed.tsv:4555  tabi-shokunin/corpus/lessons/round-81.md:79 … chromium-showpicker-runtime-round-80.md
tameshi …/T91CN1-hits.tsv:1628   tabi-shokunin/corpus/SOURCES.md:234  S219 … chromium-showpicker-runtime-round-81.md
```

Both are other lanes *reading* tabi's committed corpus — not tabi writing into them. A
fleet-wide grep for this round's unique markers (`sp86-accept-wildcard`, `tabi-r86-l1-4bd89a80f439`)
outside the lane tree returns exactly one file: the sanctioned fleet round report.

**Fleet repo tracked files: untouched by tabi.** `git -C /home/vgpnk/Projects/shokunin status --porcelain`:

```
 M .scratch/goal-20261103-hyaku-run15.md     (fleet orchestrator's own goal file — mtime 2026-11-07)
 M .scratch/run15-state.json                 (fleet orchestrator's lane registry — mtime 2026-11-08 05:41, before the 05:47 wave spawn)
 M .ufo/l0-questions.md                      (tsukuroi round-92 lines — mtime 2026-11-08 02:18, before this round)
?? .scratch/closure-tabi-r83-entry.json     (r83, mtime 03:22 — an earlier round)
?? .scratch/run15-wrapup/misroot-cff0b4cb/  (Nov 6)
?? .ufo/reports/round-86/tabi.md             (THIS round's sanctioned fleet report)
?? .ufo/reports/round-89/chousa.md           (chousa r89)
?? .ufo/reports/round-94/tameshi.md          (tameshi r94)
```

Every modified fleet file predates this round except the sanctioned round report. Note the
fleet L0 file `.ufo/l0-questions.md` carries a `tsukuroi | round-92` pair, not a tabi
line — tabi r86 added no L0 question (correct: it routed none).

`MANIFEST.json` at the fleet root has mtime 05:47 but is **not** in `git status`, i.e. its
content is unchanged (`git diff --stat` empty, `git status --porcelain MANIFEST.json` empty).
Its mtime moved with a rewrite that reproduced the same bytes — no content write.

**Round-86 writes outside the lane tree during the run: none.** All three r86 instruments
that touch the filesystem write only under `--work` (scratch) or under `lane`:
`negatives-showpicker-r86.mjs` writes its case files and its `mirror/tabi-shokunin` clone
under `path.join(work, ...)` (lines 73, 76) and copies lane→mirror with `path.join(lane, rel)`
(line 88); `kill-power-r86.mjs` writes mutants under `path.join(work, 'mutants', name)`
(line 116); `witness-families-r86.mjs` writes under `path.join(work, generation, label)`
(line 100). A grep for fleet-root or `PATH` writes in the seven r86 instruments returns
nothing.

**Symlinks: none added.** `find .ufo/waves/round-86 -type l` → 0. The pre-existing
round-13/19/28/61 symlinks are unrelated and predate this round.

---

## (2) The scored receipt — provenance

**Artifact:** `corpus/evidence/round86/chromium-showpicker/receipt.json`
(508858 bytes, sha256 `035ac3f03e3e3f039b98ac7086a4e8160571db59c4a36cc453fbca119492b64d`,
committed in `9919aa52` and byte-identical to the working-tree file).

### Loopback-only — CONFIRMED

Every origin in the receipt is loopback. Measured over the whole file:

```
origin hosts: ['127.0.0.1:19730', '127.0.0.1:19732']
```

- `fixture.origin` = `http://127.0.0.1:19730`
- `fixture.child.origin` = `http://127.0.0.1:19732`
- `devtoolsListening.url` = `ws://127.0.0.1:19731/devtools/browser/<uuid>` — all 60 distinct
  ws URLs are `127.0.0.1:19731`; **zero** non-loopback ws hosts.
- `contexts`: every leg carries the same three — id 1 origin `://` (the browser's own
  default context, no page), id 2 = `http://127.0.0.1:19730`, id 3 = `http://127.0.0.1:19732`.
- `serverLog` / `childServerLog`: the only request paths present across all 30 legs are
  `('/', 200)`, `('/favicon.ico', 404)`, `('/child.html', 200)`. No third-party host, no
  external path.

The driver binds all three servers to loopback explicitly
(`scripts/chrome-cdp-showpicker-round86.mjs:357-358` → `listen(port, '127.0.0.1', ...)`) and
serves the child origin on a **separate port** (19732 vs 19730), which is what makes the
cross-origin legs real rather than nominal.

### Throwaway profile under the scratch root — CONFIRMED

All 30 legs launch `/usr/bin/chromium` with `--user-data-dir=/fast/scratch/hyaku/tabi-r86/scored2/profile-<12hex>`,
**30 distinct profile dirs**, each under the round scratch root. argv flags, uniform
across all 30 legs:

```
/usr/bin/chromium, --headless=new, --remote-debugging-port, --remote-debugging-address=127.0.0.1,
--user-data-dir, --no-first-run, --no-default-browser-check, --disable-background-networking,
--disable-component-update, --disable-sync, --disable-search-engine-choice-screen,
--disable-dev-shm-usage, --disable-extensions, --disable-smooth-scrolling,
--force-device-scale-factor, --window-size
```

No `--proxy-server`, no credential flags, no `--user-data-dir` outside the scratch root.
HOME/XDG are also redirected per leg (`home-<token>` under the same scratch root — driver
line 279-287), and I confirmed the host home was not written: `~/.config/chromium` mtime is
`2026-11-08 00:59` and `~/.cache/chromium` is `2026-11-06 12:31`, both **before** the round.

The profiles still exist on disk (30 profile + 30 home + 30 upload dirs under `scored2/`),
so the delivered bytes are re-verifiable from the filesystem, not only from the receipt.

### No credential material — CONFIRMED

Pattern scan over the entire r86 tree (receipt + both priors + all wave files + scripts +
record files) for credential shapes — `AKIA[0-9A-Z]{16}`, `gh[pousr]_<36>`, `glpat-`,
`xox[baprs]-`, `BEGIN … PRIVATE KEY`, `-----BEGIN`, JWT `eyJ….….…`, `bearer <tok>`,
`set-cookie`, `authorization` — returns **zero** matches.

The only hits for the loose words `secret`/`token` are benign and I classified each:

- `wrong_secret` (30 in the receipt, 26 in each prior) — the literal string
  `Authentication Failed: wrong_secret` inside Chromium's **own** stderr, from
  `google_apis/gcm/engine/mcs_client.cc` — i.e. Chromium failing to register with Google's
  push service. It is Chromium's error text, not a secret of ours, and it appears only
  because the driver captures `stderrHead`.
- `launchToken` — the driver's own per-leg 12-hex launch id (30 unique values, checked
  disjoint from both priors' sets).
- `devtoolsListening.browserId` — the per-leg browser UUID.

No `HOME=`, `PATH=`, `LS_COLORS` or any other environment dump is present (grep → 0).
No `vgpnk` appears anywhere in the receipt (grep → 0), and **no `/home/` path at all**
(grep → 0) — the receipt references only `/fast/scratch/...` paths.

Note on provenance hygiene worth flagging to the L1 (not a violation): the receipt embeds
Chromium's raw stderr including GCM registration noise. It contains no secret, but the
string `wrong_secret` in a pushed artifact is exactly the shape that trips a naive
secret-scan on push (the fleet has hit that class of block before — `kasegi | round-93`
and `tsukuroi | round-92` in the fleet L0 file). No action is required for correctness;
it is a heads-up for the push step.

### Deliverable bytes re-verified from disk

The counter's byte laws are backed by the on-disk uploads, not only by the receipt. I
re-hashed what was delivered:

```
scored2/upload-dee3b3c648de/tabi-r86-dir/inner-a.txt  7ccf3ffdb39bc1fbe9c76209c59044003e601851789bf5a2af9a1e30be198873
scored2/upload-dee3b3c648de/tabi-r86-dir/inner-b.png  58e98c838df190955e57ec1331f63f6d856badbe41ad3b5f74d92efbc54798ec
scored2/upload-*/tabi-r86-b.png                      575d88a4154ed4f5cc7e9d1f6fe9a508c31f08c934a6c99f0b8596920e947050
```

all matching the receipt's recorded `uploadDir.files[].sha256` and `uploadPng.sha256`.

### The six new legs carry the claimed facts

`fixtureInputs` in the receipt contains the three accept-token inputs exactly as claimed:

```
aw  accept "image/*"            am  accept "image/png, .txt"     ap  accept "application/pdf"
cos type "color"                (plus the 10 pre-existing inputs s m d k f dis disd tes ses txs)
```

Per-leg measurement from the receipt's own `cdpEventLog` / `pageEvents` / `answer`:

| leg | target | choosers | answered file | read-back |
|---|---|---|---|---|
| `sp86-accept-wildcard-text` | aw | 1 | `tabi-r86-a.txt` | `hex:746162692d7238332d612e7478740a` (text/plain into `image/*`) |
| `sp86-accept-wildcard-png` | aw | 1 | `tabi-r86-b.png` | `hex:89504e470d0a1a0a746162692d7238332d706e670a` |
| `sp86-accept-mixed-text` | am | 1 | `tabi-r86-a.txt` | text/plain into `image/png, .txt` |
| `sp86-accept-mixed-png` | am | 1 | `tabi-r86-b.png` | png into `image/png, .txt` |
| `sp86-accept-pdf-token-png` | ap | 1 | `tabi-r86-b.png` | png into `application/pdf` |
| `sp86-same-origin-color-activated` | cos | **0** | — | **0** read events |

So: five answers land with bytes the accept token does not permit (the law — accept is a
dialog filter, never a validator on a programmatic answer), and the colour arm opens
**zero** `Page.fileChooserOpened` events with zero input/change. `setError` is `null` on
all five answer legs.

### The scored receipt is not one of the priors, and its fixture is reproducible

I independently **re-derived** the fixture bytes from the frozen r78 template plus the r86
driver's own patch constants, with the round nonce and child port substituted:

```
recomputed fixture sha 94421dc0cceba84082aa3e75d501e14876b7eac6942c809f98f7fef6b774a3a1
claimed           sha 94421dc0cceba84082aa3e75d501e14876b7eac6942c809f98f7fef6b774a3a1   MATCH
```

and the child document the same way:

```
child sha 0a2c8a8f4f4ab7a356efe92b0cb4672fa3e2577baa338ec94e042ed1b47e22ad   MATCH
```

Both priors also re-derive exactly (`prior1 → 0deddd2a9064f9d67657b8af64e887954190a909cbfc42b2b6fdd7e841d5e1e4`,
`prior2 → 68f9c07e12c72d32faca6aa3a5c2eb6dab9f778a8c14979499b9cf33c01afcf3`) — so all three
receipts are products of the *same* frozen driver + template with different nonces/ports,
which is what makes the prior-set replay rule meaningful.

### I re-ran the frozen instruments against the committed evidence

Read-only re-runs, using the committed bytes:

```
counter  : exit 0, verdict clean, checkCount 95, priorSet 2, findings []
           → byte-identical to the committed scored/counter-a.json  (python: a==b → True)
do-nothing, missing receipt : exit 2, verdict unreadable (receipt-unreadable)  → matches the committed
do-nothing, r85 receipt     : exit 1, verdict findings                       → see F1
drift     : 8 claims, 0 mismatches, 0 failed
selftest  : 10/10 gates ok, clean true (committed scored/selftest.json)
```

---

## (3) The prior set — provenance

**Artifact:** `.ufo/waves/round-86/controls/c1/prior-set.txt` (102 bytes, 2 lines), with
the two priors at `controls/c1/probes/prior1.json` and `controls/c1/probes/prior2.json`.

### The two priors are distinct receipts from each other — CONFIRMED

| | prior1.json | prior2.json | receipt under test |
|---|---|---|---|
| nonce | `tabi-r86-probe1-a1` | `tabi-r86-probe2-b1` | `tabi-r86-l1-4bd89a80f439` |
| driver sha256 | `5a435da6…` | `5a435da6…` | `5a435da6…` |
| file sha256 | `7d75af47bf5355fd…` | `de9b8289066a49fd7…` | `035ac3f03e3e3f03…` |
| fixture sha256 | `0deddd2a9064f9d6…` | `68f9c07e12c72d32…` | `94421dc0cceba840…` |
| legs | 30 | 30 | 30 |
| failures | `[]` | `[]` | `[]` |
| started→finished | 08:12:17→08:14:49Z | 08:16:44→08:19:10Z | 08:40:56→08:43:08Z |

Three different nonces, three different file digests, three different fixture digests, three
disjoint time windows.

### Neither prior is the receipt under test — CONFIRMED

- Neither prior's file sha256 equals the receipt's (`7d75af47…`, `de9b8289…` vs `035ac3f0…`).
- Neither prior's nonce equals the receipt's.
- **Launch tokens are disjoint across all three sets.** 30 tokens each, and every pairwise
  intersection is empty:
  ```
  scored∩prior1 = set()   scored∩prior2 = set()   prior1∩prior2 = set()
  ```
- **DevTools browser ids are disjoint across all three sets** (per-leg `browserId`, all 30
  per receipt): `prior1 ∩ scored = set()`, `prior2 ∩ scored = set()`.
- Neither prior's fixture sha equals the receipt's fixture sha (different nonces/ports).

The two priors are also *not* byte-identical to each other and neither is a copy of the
receipt — no laundering through a prior.

### The prior set is genuinely consumed, not decorative

`prior-set.txt` lists exactly the two priors by lane-relative path, and the counter reads
those paths relative to the lane (`path.join(lane, rel)`, script line 91). The scored
counter output records `priorSet: 2` with
`priorSetFile.sha256 = 1a3d47bf7cb8d1dd731a0634eb190f9b6fb11fc96fed5c1e0eba5964e9413af9`,
and the counter's replay rule consumed them for real: `ownEvents 121` against
`priorEvents 121` per prior, `absNeed 61`, `absMatched 0/1`, `gapNeed 7/5`, `gapMatched 0/0`,
`refused: false`. The scored receipt's own event timeline therefore does **not** replay a
prior's timeline — which is the point of the prior set.

### The prior set is complete relative to the walked trees

The counter walks `.ufo/waves/round-86` and `corpus/evidence/round86` and requires every
r86-schema receipt there to be the receipt under test, a declared prior, or tree-exempt.
Independently enumerating every JSON file in those two trees that carries an r86 schema:

```
corpus/evidence/round86/chromium-showpicker/receipt.json   schema tabi-chrome-cdp-showpicker-r86
.ufo/waves/round-86/controls/c1/probes/prior1.json          schema tabi-chrome-cdp-showpicker-r86
.ufo/waves/round-86/controls/c1/probes/prior2.json          schema tabi-chrome-cdp-showpicker-r86
```

Exactly three — the receipt under test plus the two declared priors. **No stray fourth
receipt** is hiding in the tree (the counter's `prior-set-complete` and `prior-set-unparsable`
checks both passed in my re-run, and `treeExemptSha256` was `[]`, i.e. no exemption was
needed or used).

---

## (4) Host state — no sysctl, no pacman, no stray scratch

### sysctl — CLEAN

No sysctl write is attributable to this round. `/etc` has **no** file modified since 05:00:

```
$ find /etc -maxdepth 3 -newermt '2026-11-08 05:00' -type f    →  (empty)
```

`journalctl --since '2026-11-08 00:00' | grep -ci sysctl` → **0**. No r86 instrument
contains a `sysctl` call (grep over `scripts/*r86*.mjs` → 0 hits; the only fleet-wide
mention of `sysctl` is prose in `scripts/hyaku/lane-addendum.md`). `/proc/sys/net/ipv4/ip_forward`
reads `1`, which is the host's pre-existing value and is not a file-backed setting — nothing
in the round or its instruments writes it.

### pacman — CLEAN

`/var/log/pacman.log` mtime is `2026-11-05 18:54 -0300` — three days before this round. The
last transaction is `ai.storyteller.craft-anything (0.3.0-1)`. No pacman run during round
86. No r86 instrument invokes `pacman`, `sudo`, `apt` or `yum` (grep → 0).

### Services — CLEAN

`journalctl --since '2026-11-08 05:00'` shows only `app-org.chromium.Chromium-*.scope`
units (the driver's own 30 headless launches per run, exiting normally) plus the
host's own snapper/dbus timer at 05:00:03. **No host service was restarted by this round.**
No `/etc` unit file was touched.

### Scratch trees — the round left 1.27 GB behind under its own scratch root

This is the one hygiene item I can measure and that is squarely inside my remit.

```
$ du -sm /fast/scratch/hyaku/tabi-r86
1270  /fast/scratch/hyaku/tabi-r86        (38 entries)
```

Breakdown:

- **Seat-named, orphaned:** `R86Critic` (4 MB). Its report
  `.ufo/waves/round-86/w1/R86Critic.md` is written and committed, no process holds the
  directory (`ps`/`/proc` scan → 0 live references), and the disk-guard log shows the
  round's own tree is only `keep-young`:
  `2026-11-08T08:56:58Z keep-young /fast/scratch/hyaku/tabi-r86 ? idle=1 younger-than-min-age=10m`.
  It will be reclaimed by the fleet's `disk-guard.sh sweep` once it ages past
  `MIN_AGE_MIN=10m` and the tree goes idle, so this is not a permanent leak — but it is
  currently left on disk by a finished seat.
- **Shared, non-seat-named:** 1272 MB across `scored scored2 scored-battery scored-kp
  scored-witness probe1 probe2 selftest selftest2 pincheck validate-battery val2 val3 val4
  val5 s2bat s2kp s2wit kpval kpval2 witval witval2 witval3` plus loose
  `batval*.json kpval*.json witval*.json tmp-prior-set.txt validate-prior.txt
  validate-wave.{json,err}`. These are the round's shared working directories (the scored
  run's `scored2` alone is 76 MB of browser profiles + delivered uploads). They are **not**
  under any `<seat-name>/` subdirectory, so the fleet's `disk-guard.sh purge-lane tabi 86`
  (which targets exactly `$HYAKU_SCRATCH/<lane>-r<round>`) is the intended reclaim path —
  and the same log line shows it is still pending, at `keep-young`.

Two observations on this, both non-blocking:

1. `scored2/` is where the **scored receipt's own browser profiles and delivered uploads**
   live. Those are the artifacts a verifier needs to re-derive the delivered bytes
   (I used them, above). If `disk-guard` sweeps `scored2` before the L1 finishes its
   verification pass, the re-derivation source disappears — the receipt itself carries the
   hashes and hex, so the *claims* remain checkable, but the on-disk delivered bytes would
   not be. Worth the L1 knowing before a sweep lands.
2. The bound I was given says "Scratch root: `/fast/scratch/hyaku/tabi-r86/<your-seat-name>/`
   … Never leave a scratch tree behind." My own seat's scratch is `R86Sentinel/` and I am
   removing it before yielding (below). The orphans above belong to other seats and to the
   L1's shared dirs; per the round-close hook the fleet owns reclaim. I am reporting, not
   touching.

Also measured, for completeness: **the tabi-r85 scratch tree is already gone**
(`/fast/scratch/hyaku/tabi-r85` → `No such file or directory`; the disk-guard log shows
`2026-11-08T08:05:25Z ok /fast/scratch/hyaku/tabi-r85 ? idle=? absent`). So r85 was reclaimed
and r86 is simply not reclaimed yet.

### No orphan browser, no orphan listener

`pgrep -c chromium` → **0**; `ss -ltn` shows **no** listener on 19730/19731/19732 (nor on
the prior probes' 19700/19702/19710/19712). No CDP endpoint from this round is still
reachable — the receipt's `ws://127.0.0.1:19731/...` URLs are dead. The one `ws://` host
in the receipt is loopback and the process is gone.

### Nothing written outside the sanctioned places

`/home/vgpnk` has no new files outside `~/Projects/shokunin`, `~/.omp` (the harness),
`~/.cache`, `~/.config/ai-usage`, `~/.local/state/shokunin-hyaku` (the fleet's own state
dir) and `~/.ollama/cache` — all of which are other tools' normal activity, none of them
r86 artifacts (a fleet-wide grep for `tabi-r86-l1-4bd89a80f439` outside the lane returns
only `~/Projects/shokunin/.ufo/prompts/tabi-round-86.md` (the fleet's own prompt file) and
`~/Projects/shokunin/.ufo/state/disk-guard.log`). No file was written into
`~/.local/bin`, `/usr/local/bin` or `/usr/bin` during the window.

---

## Scope of my own actions

- Read-only throughout. No commit, no push, no `jj` mutation, no `git add`/`checkout`/
  `reset`, no write into the fleet repo, no sibling lane, no `.ufo/state`, no `.scratch`.
- The only writes I made are: my report at `.ufo/waves/round-86/w1/R86Sentinel.md`, and
  temporary files under my own seat scratch `/fast/scratch/hyaku/tabi-r86/R86Sentinel/`
  (removed before yielding). The two `/tmp/r86sentinel-*.out` files from my control re-runs
  were removed.
- I ran the frozen counter/battery/drift instruments with `--work`/output redirected into my
  own seat scratch; no instrument wrote into the lane tree.
- I ran `sources-census.sh` (fleet, read-only) with `--out` into my scratch and separately
  with `--out` into my scratch twice to confirm append-vs-truncate semantics. It wrote
  nothing into the fleet tree.

---

## Summary table

| # | Area | Result | Severity |
|---|---|---|---|
| F1 | Committed do-nothing control is stale; `checks.prior-set-complete` now false against the committed tree; re-run yields 40 findings vs the recorded 39 | **defect** | MEDIUM |
| 1 | Path scope: every round-86 write inside the lane tree, the sanctioned fleet report path, or the L0 file; no sibling lane, no fleet tracked file, no `PATH` dir | clean | — |
| 2 | Receipt provenance: loopback-only origins; throwaway per-leg profiles + HOME under the scratch root; no credential material; delivered bytes re-hashed from disk | clean | — |
| 3 | Prior set: two priors, three distinct nonces/digests, disjoint launch tokens and browser ids, neither is the receipt under test, no stray fourth receipt in the walked trees | clean | — |
| 4 | Host: no sysctl write, no pacman, no service restart, no orphan chromium, no live CDP listener | clean | — |
| 4 | Scratch: 1.27 GB left under `/fast/scratch/hyaku/tabi-r86` (1 orphaned seat dir + shared L1 dirs), `keep-young` per disk-guard, reclaim pending | observation | LOW / for L1 |
| 4 | `scored2/` holds the receipt's own profiles + delivered uploads; a sweep before the L1's verification pass would remove the on-disk source of the delivered bytes (hashes remain in the receipt) | observation | LOW / for L1 |
| — | Receipt embeds Chromium's own `wrong_secret` GCM stderr text (not a secret); a push-time secret-scan could flag the string | observation | LOW / for L1 |
