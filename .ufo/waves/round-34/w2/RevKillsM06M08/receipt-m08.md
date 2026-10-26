# RevKillsM06M08 — mutant M08 run receipt (rev 04f9623dde8ad35d470cecf766e421eafbcb47fa)

Mutant (frozen counter .ufo/waves/round-34/counters/c2-gate-mutants.mjs lines 101-105, verbatim):

    "id": "M08",
    "area": "context-id regex case",
    "find": "const CONTEXT_ID = /^[0-9A-F]{32}$/;",
    "replace": "const CONTEXT_ID = /^[0-9a-fA-F]{32}$/;"

Applied with the edit tool to clone scripts/check-bidi-runtime.mjs line 146 (after M06 had been reverted; `git status --porcelain` empty before edit). Clone line 146 after edit:

    const CONTEXT_ID = /^[0-9a-fA-F]{32}$/; // ChromeDriver 154 browsing-context id shape

Commands:

    TMPDIR=/fast/scratch/hyaku/tabi-r34/RevKillsM06M08 node scripts/check-bidi-runtime.mjs --selftest
    TMPDIR=/fast/scratch/hyaku/tabi-r34/RevKillsM06M08 node scripts/check-bidi-runtime.mjs --selftest --json | node -e '<filter printing !ok results>'

## Result — exit 3, sole failing case is the M08 kill case (55/56)

    CASE id=v3-a-m08-context-id-lowercase expected_exit=1 exit=0 expected_admitted=0 admitted=16 expected_population=16 population=16 expected_reason=t1-receipt reason=- FAIL
    BIDI_RUNTIME_SELFTEST verdict=failed cases=56 passed=55
    SELFTEST_EXIT_M08:3

No other case failed (56 results, 55 passed).

Failing-case json (mutated gate's runtime output):

    {"id":"v3-a-m08-context-id-lowercase","ok":false,"expectedExit":1,"exit":0,"expectedAdmitted":0,"admitted":16,"expectedPopulation":16,"population":16,"expectedReason":"t1-receipt","reason":null,"detail":null,"expectedDetailIncludes":null}

Kill mechanism: under M08 the context-shape rule (clone gate:146, enforced at clone gate:806-807) accepts the 32-lower-hex context id, so the receipt is judged CLEAN — exit 1→0, admitted 0→16, reason t1-receipt→null. No detailIncludes pin; the kill rides the refused→clean flip, which no message rewording can mask.
