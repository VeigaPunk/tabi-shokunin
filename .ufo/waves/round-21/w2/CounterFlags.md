# CounterFlags — round21 C1 counter flag-pin falsification (static, author-side)

Seat: TabiR21.CounterFlags. Static review only. No selftest or counter run; every
"would" below is derived from reading the code [INFERENCE], not an observed result.
Tools installed or updated: none.

Read: `.ufo/waves/round-21/measure-c1.mjs`, `selftest-c1.mjs`,
`fixtures/expected.json`, `fixtures/positive-ordered.json` (decoded with node),
`scripts/webmcp-lifecycle-round21.mjs`, `corpus/evidence/round-21/runtime/receipt.json`,
`.ufo/waves/round-21/runtime-execution-bounded.json`, the note, SCORECARD round21, and
the Playwright 1.64.0 `playwright-core/lib/coreBundle.js` used by the fnm Node v24.21.0
install.

## F1 — The hypothesis that the counter accepts any flags containing a `DeclarativeWebmcp` substring is false for the counter code

- Anchor: `measure-c1.mjs:49` requires `equal(environment.flags, FLAGS)`, where
  `equal` is `JSON.stringify(a) === JSON.stringify(b)` (`:30`). That check is exact,
  ordered and type-sensitive against the hardcoded `FLAGS` at `:18-23`.
- Derived outcomes: each of the following produces the `environment` finding with
  exit 1 and value 0:
  - drop the token (`…DevToolsWebMCPSupport`);
  - change its case (`DeclarativeWebMCP`);
  - append `--disable-features=DeclarativeWebmcp`;
  - reorder the elements;
  - join the array into one string;
  - change whitespace inside the `--host-resolver-rules` value;
  - add a duplicate element.
- The receipt's `flags` field (`receipt.json:12-17`) matches the counter's `FLAGS` and
  the producer's `FLAGS` (`webmcp-lifecycle-round21.mjs:28`) exactly.
- Verdict: no defect in the counter's comparison.

## F2 — No selftest control catches a substring-only or superset-only relaxation of the flags check (missing mutants)

- Anchor: the only flags control is `flags-missing` (`selftest-c1.mjs:44`,
  `r.environment.flags.pop()`, expected `environment` at `expected.json:159`). It
  removes the last element, `--disable-extensions`. `wrong-build` (`:45`) changes only
  `chromium`.
- Counterexample: replace `:49` with
  `String(environment.flags).includes('DeclarativeWebmcp')`. After `pop()`, `flags[0]`
  still contains the token, so `flags-missing` would get no `environment` finding and
  fail only as a selftest expectation mismatch. Under a superset relaxation
  (`FLAGS.every(f => environment.flags.includes(f))`), `flags-missing` still catches
  the change. However, an appended `--disable-features=DeclarativeWebmcp` would pass
  both relaxations, and no persisted case appends anything.
- Smallest finite red case: add these two entries to the `mutate` switch, plus their
  two `expected.json` rows.

```js
 case 'flags-token-drop':r.environment.flags[0]=r.environment.flags[0].replace(',DeclarativeWebmcp','');break;
 case 'flags-disable-appended':r.environment.flags.push('--disable-features=DeclarativeWebmcp');break;
```

```json
  {"name":"flags-token-drop","exit":1,"finding":"environment","value":0},
  {"name":"flags-disable-appended","exit":1,"finding":"environment","value":0}
```

- Expected result: both cases give `environment`, exit 1 and value 0 under the current
  counter, derived from F1. `flags-disable-appended` is the single case that only
  exact equality catches.
- Impacted axis: strength of the mutation controls, not the measured count.

## F3 — Producer identity is only self-attested, so the flags pin is detached from what was launched (main finding)

- Anchors:
  - `measure-c1.mjs:47` checks `receipt.producer.sha256 !== sha(get(PRODUCER))`. The
    expected hash comes from the receipt under test. No constant analogous to
    `SOURCE_SHA` (`:33`) exists.
  - The canonical producer hash `5363d576…eceb9` appears only in
    `runtime-execution-bounded.json:12`. That file is not in `INPUT_PATHS` (`:27`).
  - The producer writes `flags: FLAGS` into the receipt (`webmcp-lifecycle-round21.mjs:146`)
    independently of `args: FLAGS` at `:164`. The receipt therefore records the
    requested constant, not the launched argv.
- Existing evidence that any producer bytes are accepted: the selftest positive fixture
  `positive-ordered.json` carries a 32-byte stub producer whose sha256 is
  `123b9cac…454754`. The fixture receipt's `producer.sha256` equals that stub hash, and
  the persisted oracle expects `positive` to give exit 0 and value 12
  (`expected.json:3-7`). The counter's contract therefore admits a non-producer as the
  producer by design.
- Counterexample against real artifacts [INFERENCE]: edit producer `:164` to
  `args: FLAGS.slice(0, 2)` and leave `FLAGS` unchanged. This drops the
  `--host-resolver-rules` loopback rule and `--disable-extensions` while keeping both
  WebMCP flags, so the declarative `toolname` fixture still runs, and
  `context.route` keeps intercepting page requests. Rerun the producer and copy the
  output into `PREFIX`. `receipt.producer.sha256` reseals to the edited bytes, so `:47`
  passes, and `environment.flags` still equals `FLAGS`, so `:49` passes. The count
  would be 12 while the note claims the receipt's flags and a loopback-only boundary
  (note lines 9-10).
- Smallest finite red case:

```js
 case 'producer-resealed':files['scripts/webmcp-lifecycle-round21.mjs']+='\n// resealed';r.producer.sha256=HASH(files['scripts/webmcp-lifecycle-round21.mjs']);break;
```

  - Under the current counter: exit 0, value 12, so the mutant survives [INFERENCE].
  - After the correction below: `producer_digest`, exit 1, value 0.
- Smallest safe correction:
  1. Add `const PRODUCER_SHA = '5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9'`
     and require `receipt.producer.sha256 === PRODUCER_SHA` at `:47`, mirroring
     `SOURCE_SHA`.
  2. Replace the stub producer in `positive-ordered.json` with the real producer bytes
     and set the fixture receipt's `producer.sha256` to the same hash. Otherwise the
     positive case turns red.
  3. Add `producer-resealed` with expected `producer_digest`.
- Consequence: once producer bytes are pinned, they pin `args: FLAGS`, so the counter's
  duplicated `FLAGS`/`CONFIG` copies (`:10-23`) become one consistent authority instead
  of a second, self-declared one.
- Impacted axes: provenance of the claimed environment and boundary; duplicated
  authority between producer and counter. The measured count is unchanged.

## F4 — The note calls the node command line "exact argv"; the effective browser argv is not recorded anywhere

- Anchors:
  - Note line 2: "producer and exact argv in .ufo/waves/round-21/runtime-execution-bounded.json".
    That file's `argv` (`:5-10`) is the node command line for the producer, not the
    Chromium command line.
  - Playwright 1.64.0 builds the browser argv as its own defaults followed by the user
    args (`coreBundle.js:44754-44782`). The defaults include
    `--disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,…,AimEnabled,…`
    (`:36171-36225`), `--headless`, `--no-sandbox` and `--enable-unsafe-swiftshader`.
  - `ignoreDefaultArgs` filters exact strings over that whole list (`:41188-41189`).
    Only Playwright's own `--enable-features=CDPScreenshotNewSurface` (`:36226`) is
    removed; the user's combined `--enable-features=…,DeclarativeWebmcp` is kept.
  - [INFERENCE] The effective argv therefore carries a single `--enable-features`,
    as intended. This depends on `PLAYWRIGHT_LEGACY_SCREENSHOT` being unset in the
    producer's own environment. The switch is computed in the producer process, and
    the producer neither records nor sanitizes that environment; only the browser
    environment at `:164` is sanitized.
  - The producer already reads `/proc/<pid>/cmdline` (`:56`) and discards it after the
    `--user-data-dir` root test.
- Classification: a tradeoff, not something fixable inside this acquisition. Recording
  the root browser process's cmdline would need a new runtime acquisition and must not
  be claimed retroactively.
- Smallest safe correction (wording only): change note line 2 to say "producer node
  argv", and add that the receipt records the requested browser flags while the
  effective browser argv was not recorded.
- Impacted axis: provenance accuracy (no false "exact argv" pin).

## F5 — The counted revision lacks the producer blob (repo-state blocker)

- Anchors:
  - `git status --short` shows `?? scripts/webmcp-lifecycle-round21.mjs`: the producer
    is untracked and not ignored.
  - `git ls-tree -r HEAD` (HEAD = `1b5f449`) lists `receipt.json` and `measure-c1.mjs`
    but not the producer.
  - The HEAD receipt names producer sha `5363d576…`, which equals the current worktree
    file.
- Derived outcome [INFERENCE, not run]: `node measure-c1.mjs 1b5f449…` would have
  `filesAt` omit the producer, so `:47` `!get(PRODUCER)` fires and the result is
  `producer_digest`, exit 1, value 0.
- Correction: L1 must commit the producer bytes before the revision that is counted.
- Impacted axis: whether the claimed count of 12 is reproducible at a revision.

## Checks for L1's final serial run

- `node .ufo/waves/round-21/selftest-c1.mjs`, after adding `flags-token-drop`,
  `flags-disable-appended` and `producer-resealed` together with the `PRODUCER_SHA`
  pin and the real producer bytes in the positive fixture.
- `node .ufo/waves/round-21/measure-c1.mjs <full rev>` on a revision that contains the
  producer.
