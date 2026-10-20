# AttackSkillAppend — round-16 SKILL.md EOF append

- Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Snapshot under attack: `b444ca8e024f386124418169e8e400221524bba3` (commit A `8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + counter repair)
- Round-15 head compared against: `e38d2599a922cb729186353830fff8e159b4fef0`
- Reviewer: `TabiR16.AttackSkillAppend` (author-side, non-certifying)
- Tooling installed/updated: **none**. Node `v24.21.0`, git `2.56.0` as present; REA MCP disabled (not used); no LSP device mounted (semantic checks done by source read + execution, recorded below).

**Overall verdict: HOLDS** — every claim made by the append reproduces. Six low-severity documentation-accuracy findings, none claim-breaking (details in §Findings).

| Facet | Verdict | One-line basis |
|---|---|---|
| A. Pure EOF addition, prefix bytes preserved | **HOLDS** | `cmp` of all 147,204 old bytes = identical prefix of the 151,055-byte new file; no byte removed |
| B. `check-freshness` (witness + worktree) | **HOLDS** | both modes `verdict=clean`, exit 0, `lane=31 public=3`; SKILL row is a pre-append prefix pin |
| C. Registry row vs gate CLI | **HOLDS** (3 LOW findings F1–F3) | entry forms, 0/1/2 map, reason vocabulary, selftest, write scope all observed; one printed command does not execute, one checked-list is `--check`-only |
| D. Decision table vs note (and receipt) | **HOLDS** (2 LOW findings F4–F5) | all 7 rows map to the note; every cited receipt case exists and is `pass`; 11/11 |
| E. Rule (QUALITY 22) paragraph and cross-references | **HOLDS** (1 LOW finding F6) | legacy run reproduces the exact five claimed findings; `--check --reproduce` clean at `--at b444ca8` with the worktree manifest; retained receipt replays byte-identically |

---

## A. Pure EOF addition — HOLDS

```
$ git show e38d259:SKILL.md > /tmp/r16_skill_old.md
$ git show b444ca8:SKILL.md > /tmp/r16_skill_new.md
$ wc -c /tmp/r16_skill_old.md /tmp/r16_skill_new.md
147204 /tmp/r16_skill_old.md
151055 /tmp/r16_skill_new.md
$ cmp -n 147204 /tmp/r16_skill_old.md /tmp/r16_skill_new.md && echo PREFIX_IDENTICAL
PREFIX_IDENTICAL
$ tail -c +147205 /tmp/r16_skill_new.md | head -c 40 | od -c
0000000  \n  \n   #   #       R   o   u   n   d       1   6     342 200
```

```
$ git diff --stat e38d259 b444ca8 -- SKILL.md
 SKILL.md | 51 +++++++++++++++++++++++++++++++++++++++++++++++++-
 1 file changed, 50 insertions(+), 1 deletion(-)
$ git diff --numstat e38d259 b444ca8 -- SKILL.md
50	1	SKILL.md
```

The single `-` is the `\ No newline at end of file` marker on the last round-15 line; the new file re-emits that same line terminated. The old bytes are a **strict prefix** of the new bytes, so "nothing above is edited" and "no earlier registry row changes" are literally true. `git diff e38d259 b444ca8 -- SKILL.md` shows exactly one hunk at EOF.

Supporting identity: `git show 8f7feb3:SKILL.md | sha256sum` = `git show b444ca8:SKILL.md | sha256sum` = `8a5afabe…7fe70c65` (the repair commit did not touch SKILL.md). Both interface files are new at the same commit: `git log --diff-filter=A -- scripts/check-measurement-binding.mjs scripts/selftest-measurement-binding.mjs scripts/webmcp-loopback-round16.mjs` → `8f7feb3 ...`; `git ls-tree e38d259 -- <those paths>` → empty.

## B. Freshness gate — HOLDS (both modes)

```
$ node scripts/check-freshness.mjs --witness b444ca8e024f386124418169e8e400221524bba3
... 34 PIN_MATCH lines ... (SKILL.md sha256=f4d9cf5b1aa5…c9acfe newlines=1458)
FRESHNESS_GATE verdict=clean finding=freshness_witness matched=34 unique=34 lane=31 public=3 revision=b444ca8e024f386124418169e8e400221524bba3 baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production
EXIT=0

$ node scripts/check-freshness.mjs --worktree
FRESHNESS_GATE verdict=clean finding=freshness_worktree matched=34 unique=34 lane=31 public=3 revision=worktree baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production
EXIT=0
```

This is not a free pass for the append: for `SKILL.md` the gate (`scripts/check-freshness.mjs:92-101`) requires `sha(measured[0:original.length]) == baselineHash == observed`, and then requires `current.length > original.length` (`witness_append`, "Dated SKILL append absent"). Because it passes at the witness, the SKILL row independently confirms the prefix property against the pin baseline `c24eaea`, not merely "file exists". The pinned SKILL hash `f4d9cf5b…` (1458 newlines) is the **pre-append** baseline blob and its `revision` cell is `pre-append@c24eaea…`; the gate is designed for exactly this append shape.

## C. Registry row vs gate CLI — HOLDS, with LOW findings

Registry text (SKILL.md:1838-1840; the row is :1840) checked clause by clause.

| Row clause | Observed | Result |
|---|---|---|
| `--check <manifest> [--at REV] [--reproduce]` | `--help` prints `--check <manifest> [--at REV] [--reproduce] [--json] [--repo <dir>]` | accurate (optional modifiers omitted) |
| `--legacy <round-15 measurements.json> [--at REV]` | `--help` line matches; `--reproduce` correctly refused for legacy (`--reproduce requires --check`) | accurate |
| `--self-test` runs `scripts/selftest-measurement-binding.mjs` | `runSelfTest` spawns `SELFTEST_SCRIPT = <script dir>/selftest-measurement-binding.mjs` (gate:97, :671, :798); executed → `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13`, `SELFTEST_EXIT=0` | accurate |
| verdict map `0 clean, 1 findings, 2 could-not-evaluate` | `EXIT = { clean: 0, findings: 1, couldNotEvaluate: 2 }` (gate:121); observed all three: `--help`/`--reasons` 0, `--legacy` 1, no-args `usage` 2 (and the selftest asserts 0/1/2 per case) | accurate |
| reason list (9 findings, 4 CNE + `usage`) | `node scripts/check-measurement-binding.mjs --reasons` returns the same nine and the same five in the same order | exact |
| "counter blob sha256 at `measuredRevision` and at REV, ancestry, `countedInputs` drift, argv shape" | present in `evaluateClaim` (gate:454-530): `blobSha256(measured)`/`blobSha256(atRev)`, `isAncestor(measured, atRev)`, `diffNames(measured, atRev, inputs∪counter)`, `argvSupported` | accurate for `--check` (see F2 for `--legacy` scope) |
| "with `--reproduce` the worktree counter bytes before execution plus re-run of both the before and after arms" | worktree file is lstat'ed and sha256-compared to the blob at `atRev` **before** `reproduceArm`; arms are `[before, before.count]` and, unless `atRev===before`, `[atRev, after.count]`; gate:532-556 | accurate |
| `Write scope: none (read-only; selftest writes only temp repos)` | no write import/syscall in `check-measurement-binding.mjs` (`grep writeFileSync\|mkdirSync\|rmSync\|mkdtemp\|appendFile` → no hits); `selftest-measurement-binding.mjs` uses `mkdtempSync(join(tmpdir(),'tabi-binding-selftest-'))` and `rmSync` of its own roots | accurate |

End-to-end exit-map evidence (manifest read from the worktree, revisions from Git, `--at b444ca8`):

```
$ node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json --at b444ca8
MEASUREMENT_BINDING verdict=clean claims=2 bound=2
EXIT=0

$ node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json --at b444ca8 --reproduce
MEASUREMENT_BINDING verdict=clean claims=2 bound=2
EXIT=0

$ node scripts/check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json --at b444ca8
MEASUREMENT_BINDING verdict=failed claims=2 bound=0
finding claim=C1 reason=counted_inputs_undeclared detail=no countedInputs declared
finding claim=C1 reason=counter_changed_since_measurement detail=counter=.ufo/waves/round-15/measure.mjs counterCodeRevision=27dfd98b… sha256_at_counterCodeRevision=3ee59de0…
finding claim=C1 reason=counter_digest_unrecorded detail=… no counterSha256; pinned only by counterCodeRevision=27dfd98b…
finding claim=C2 reason=counted_inputs_undeclared detail=no countedInputs declared
finding claim=C2 reason=counter_digest_mismatch detail=… counterSha256=dd9c8675… blob_at_measuredRevision=3ee59de0…
EXIT=1
```

`--reproduce` passing clean means the counter independently produced `0` at `e38d259` and `1` at `b444ca8` for both C1 and C2 — the append's admissibility rule is not merely asserted.

**Provenance caveat on the `--check` evidence.** `corpus/evidence/round-16/measurement-binding.json` is **not in the snapshot**: `git cat-file -e b444ca8:corpus/evidence/round-16/measurement-binding.json` → exit 128 (also absent at `8f7feb3`), and `git status --porcelain` lists it untracked (mtime `2026-10-20 11:57:18 -0300`; it was absent from the first `git status` of this review). The clean `--check` runs above therefore bind *worktree manifest bytes + committed revisions*, not a committed artifact of `b444ca8`. The append itself names no manifest path, so this does not falsify its text, but an auditor starting from a clean checkout of `b444ca8` has no manifest to feed the gate. Recorded as an integration risk, not a BREAK.

### F1 (LOW) — printed drift command does not execute as written

SKILL:1840 says the drift check is `git diff --literal-pathspecs measuredRevision REV`. On this host:

```
$ git diff --literal-pathspecs --name-only 7054a5e b7cf044 -- corpus/SOURCES.md
usage: git diff [<options>] [<commit>] [--] [<path>...]
...
exit=129

$ git --literal-pathspecs diff --name-only 7054a5e b7cf044 -- corpus/SOURCES.md
corpus/SOURCES.md
exit=0
```

The gate passes `--literal-pathspecs` as a **git global** option before the subcommand (`diffNames`, gate:313-319, plus `GIT_LITERAL_PATHSPECS=1` in the env, gate:185). The semantic claim is right; the illustrative command is non-executable (git 2.56.0). Suggested fix: `git --literal-pathspecs diff measuredRevision REV`.

### F2 (LOW) — "per claim … ancestry, countedInputs drift, argv shape" is `--check`-only

`evaluateLegacy` (gate:588-625) performs no `isAncestor(measured, atRev)` check, has no argv to check (legacy claims carry no bound argv, and `--reproduce` is refused for legacy), and detects drift as `blob@counterCodeRevision` vs `blob@--at`, not `countedInputs` (legacy declares none). Observed with a `measuredRevision` that is **not** an ancestor of `--at`:

```
$ git merge-base --is-ancestor b7cf044 7054a5e; echo $?
1
$ node scripts/check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json --at 7054a5e | grep -c measured_revision_not_ancestor
0
```

vs the same shape in `--check` mode (synthetic manifest in `/tmp`, `measuredRevision == after.revision == b444ca8`, `--at 7054a5e`):

```
MEASUREMENT_BINDING verdict=failed claims=1 bound=0
finding claim=C1 reason=counted_input_changed detail=paths=.ufo/waves/round-16/measure.mjs,corpus/SOURCES.md
finding claim=C1 reason=counter_changed_since_measurement detail=… blob_at_at=unavailable(absent)
finding claim=C1 reason=measured_revision_not_ancestor detail=measuredRevision=b444ca8e… is not ancestor-or-equal of at=7054a5e…
EXIT=1
```

The row does not scope the checked-list to `--check`, so a reader may believe `--legacy` ancestry-checks too. Non-breaking for any count; wording fix only.

### F3 (LOW) — `--reasons` mode absent from the Entry cell

`--help` lists four modes. The row lists three entries (`--check`, `--legacy`, `--self-test`); `--reasons` (the closed-vocabulary dump used to verify the row's own reason lists) is undocumented. The row does not claim exhaustiveness, so this is a completeness gap, not a falsehood.

## D. Decision table vs note — HOLDS

Source compared: `corpus/knowledge/webmcp-chromium-loopback-round-16.md` (plus the receipt the note points at, since the table's middle column is receipt-case names).

| SKILL row | Note row | Receipt ground truth | Result |
|---|---|---|---|
| live on this build? → "flag-gated on Chromium 154.0.8037.97", minimal `--enable-blink-features=WebMCP`, never "available in Chrome" | decision table "WebMCP is available in Chromium" → "only flag-gated on 154.0.8037.97"; minimal flag set "any one of" three | probe summary `.summary.minimalForDocumentModelContext = "blink-WebMCP"`, i.e. `--enable-blink-features=WebMCP` alone | agree; the SKILL names the one flag the probe certifies as minimal |
| which object? `document.modelContext`; S020 §4.1 + S033 agree; `navigator.modelContext` wrong (S038/S039 rejected) | spec-vs-build "Entry point" row: same IDL at 154 (S033:11); "rejected S038, S039" | `model-context-location`: `documentModelContextType=object`, `navigatorHasModelContext=false`, `isSecureContext=true`, status `pass` | agree |
| `WebMCP.enable` success ≠ WebMCP works; `{}` with feature off; disappears only with `DevToolsWebMCPSupport` disabled | decision row "`WebMCP.enable` succeeded, so WebMCP works" → no; domain advertised with feature off | flags-off: `webmcpEnableResult={}` and `documentModelContext=undefined`; devtools-disabled: `documentModelContext=object` but `Protocol error (WebMCP.enable): 'WebMCP.enable' wasn't found` | agree |
| declarative tool spec is not spec behaviour; S030/S031; cite receipt and S033–S035, never S020 | spec-vs-build declarative row: S030 "not part of the specification", S031 "loose version", S033 build; "Chromium-only surface; never cite S020" | `declarative-form-tool` pass (form → `toolsAdded`) | substance agrees; see F4 on the S033–S035 range |
| navigation did not "remove" tools; no `toolsRemoved`; infer from execution-context destruction (S036) | "navigation-clears-tools" case; decision row "Tool T was removed" | `toolsRemoved: []`, `getTools: []` in new document, status `pass` | agree |
| absence of tools counts only on secure context + page feature on; CDP can announce declarative tools where the page API is absent | decision row "No tools on page P" (absence after enable + feature on + secure context); "declarative tools can still appear over CDP on data:" | `data-url-declarative`: `documentModelContext=undefined`, `isSecureContext=false`, `toolsAdded >= 1`, `divergence:true` | agree |
| invoke only loopback, never external without operator approval | decision row "Page P exposes tool T on build B" → "never for a real site (no operator approval …)" and limits ("No tool is invoked in the receipt; invocation is a probe observation only") | n/a (probe-only) | agree |

Receipt-wide: `corpus/evidence/round-16/webmcp/receipt.json` → `schema tabi-round16-webmcp-v1`, `verdict pass`, `cases 11`, all 11 `pass`; every case name used by the table (`flags-off-negative-control`, `declarative-form-tool`, `model-context-location`, `devtools-domain-disabled`, `navigation-clears-tools`, `data-url-declarative`) resolves.

Harness entry claim: `node scripts/webmcp-loopback-round16.mjs [--out PATH]` (0/1/2; refuses to overwrite differing receipt bytes) — harness header lines 1-34 state `[--out PATH] [--fixtures DIR] [--chromium PATH] [--force]`, `pass→0, fail→1, could_not_evaluate→2 (also for a refused overwrite of differing receipt bytes unless --force)`, and `receipt_differs` exits 2 (harness:1598-1601). Accurate; see F5 for what the prose omits.

### F4 (LOW) — citation range over-extends the note's declarative grounding

The note grounds the declarative row in S030/S031 (proposal, not spec) and S033 (154 IDL/observation). The SKILL adds S034 (runtime_enabled_features) and S035 (CDP PDL) to the citation range. Those rows support "Chromium-only/flag-scoped surface" elsewhere in the note, but they are not the note's evidence for the declarative-form claim. Non-contradictory; tighten to `S033` (or `S030, S031, S033`).

### F5 (LOW) — C2 harness registered without a write-scope/default-path cell

The C1 interface gets a registry row with an explicit `Write scope` column. The C2 harness is registered in prose only; it **writes by default** to `corpus/evidence/round-16/webmcp/receipt.json` (harness header: "Defaults: --out corpus/evidence/round-16/webmcp/receipt.json") and writes via tmp-file + rename (harness:1604-1610). The prose says `[--out PATH]` and "refuses to overwrite differing receipt bytes" but omits (a) the default output path and (b) the `--force` escape, so the refusal reads as absolute. Wording/registration asymmetry, not a false statement.

## E. Rule (QUALITY 22) paragraph and cross-references — HOLDS

**Legacy findings.** The five reasons the SKILL claims for the real round-15 file are exactly the five emitted (see §C run). The retained evidence replays byte-identically at its own `--at`:

```
$ node scripts/check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json --at 36240c70ee114347a79abb91cacab6c63044ce36 > /tmp/r16_legacy_36240c7.txt; echo $?
1
$ # compare with corpus/evidence/round-16/binding/legacy-r15.json .run.stdout
stdout_matches_receipt true
```

**Digest parenthetical verified.** SKILL:1854-1856 claims C2's recorded digest is the post-measurement repair blob `9fd8bca`, not the blob at measured `b7cf044`:

```
$ for r in 27dfd98b… 9fd8bca b7cf044… b444ca8; do git show "$r:.ufo/waves/round-15/measure.mjs" | sha256sum; done
3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384   # 27dfd98 (executedCodeRevision)
dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d   # 9fd8bca  ← recorded C2 digest
3ee59de0…                                                          # b7cf044 (measuredRevision)
dd9c8675…                                                          # b444ca8 (delivered)
$ git merge-base --is-ancestor b7cf044 9fd8bca && echo "b7cf044 IS ancestor of 9fd8bca"
```

So "its recorded digest is the post-measurement repair blob, `9fd8bca`, not the blob at measured `b7cf044`" is exact. C1's `counter_changed_since_measurement` detail likewise reports `sha256_at_counterCodeRevision=3ee59de0…` (blob at `27dfd98`/`b7cf044`) vs the delivered blob.

**Line pointers (all exact).**

- `corpus/lessons/round-15-verifier-spotcheck.md` lines 90-101: line 90 is `## Erratum to the round-14 verifier wording (non-author, …)`; line 101 is the closing `**Corrected statement:** …` sentence. The claim "§Erratum … (lines 90-101), the non-author correction" is correct.
- `SKILL.md:1744` is the decision-table row `observed Node differs from pin.node.recorded | Report observed version, enforced minimum and descriptive record separately; do not claim exact equality was checked`.
- `SKILL.md:1766-1777` is exactly the "Named correction to round14's Node table and the frozen sidecar's note" paragraph, ending "The old sidecar, receipt, spec and producer remain immutable evidence." (`:1764` is the Round-15 heading).

These are unchanged lines, consistent with the prefix proof.

### F6 (LOW) — "routed defects 1/2, now machine-detectable" overstates legacy coverage

Round-15 routed defect 1 is counter identity (C1 `counterCodeRevision` only; HEAD counter repaired at `9fd8bca`) — fully machine-detected by the legacy run (`counter_digest_unrecorded`, `counter_changed_since_measurement`, C2 `counter_digest_mismatch`). Routed defect 2 is "measured at `b7cf044`, not the delivered `36240c7` … no counted input or gate drift in between". In `--legacy` mode the gate can only evidence counter-blob drift; `countedInputs` and gate-drift checks exist only in `--check` (and the round-15 file declares no `countedInputs`, so they cannot run). The parenthetical should say the counter-identity halves of defects 1/2, or point defect 2 at a `--check` manifest.

---

## Residual risk and verification gaps

- **Not run:** `scripts/webmcp-loopback-round16.mjs`. It launches Chromium and compares/writes the tracked receipt; the receipt-runtime attack is another lane's scope, and my contract restricts harness runs to `--out /tmp/<unique>.json`. Everything about the harness here is header/source reading plus receipt inspection, explicitly not a runtime re-observation.
- **Not run:** `scripts/check-round-contract.mjs` — different contract (ten-round SCORECARD markers, `HARD_BASELINE`), not the append's gate; running production mode before integration would be an unrelated verdict.
- **Untracked binding manifest:** `corpus/evidence/round-16/measurement-binding.json` exists only in the worktree at review time (`git cat-file -e b444ca8:…` → 128; `git status` → `??`; mtime `11:57:18`). Every `--check`/`--check --reproduce` result in §C is reproducible only from this worktree. If the wave intends the append's Rule (QUALITY 22) to be checkable from the snapshot alone, the manifest (or a path to reconstruct it) must be committed; the append names no manifest path.
- **No LSP device mounted**, so no `references`/`definition`/`diagnostics` pass was possible; the gate was reviewed by reading `check-measurement-binding.mjs`/`selftest-measurement-binding.mjs` and executing them, and the Markdown/JSON by byte-level comparison and replays. No text-grep was used as semantic proof except for the exact-string checks reported verbatim.
- **Freshness gate caveat:** its `SKILL.md` check is a prefix pin against baseline `c24eaea`; it proves the prefix property and append presence, not the *content* of the appended lines. Content accuracy is what §C/§D attack.
- **Read-only compliance:** no lane file was modified except this Report; mutation probes were confined to `mktemp -d` manifests under `/tmp` (`/tmp/r16-skill-probe.*`, `/tmp/r16-skill-probe2.*`) and `/tmp` scratch files. No commits, no delegation, no background jobs, no REA, no tool installs.
- The append's own claims about *counts* (C1 0→1, C2 0→1) were corroborated only instrumentally: `--check --reproduce` against `corpus/evidence/round-16/measurement-binding.json` at `b444ca8` exits 0 with `claims=2 bound=2`, meaning the gate re-ran both counter arms and observed the declared before/after counts. That manifest is untracked in the snapshot (see §C provenance caveat), so this is a worktree-plus-committed-revisions result. Independent semantic audit of `measure.mjs` is another lane's target and was not attempted here.
