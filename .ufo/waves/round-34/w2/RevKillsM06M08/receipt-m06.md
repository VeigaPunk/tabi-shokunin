# RevKillsM06M08 — mutant M06 run receipt (rev 04f9623dde8ad35d470cecf766e421eafbcb47fa)

Mutant (frozen counter .ufo/waves/round-34/counters/c2-gate-mutants.mjs lines 89-93, verbatim):

    "id": "M06",
    "area": "sessionId regex shape (uppercase allowed)",
    "find": "const SESSION_ID = /^[0-9a-f]{32}$/;",
    "replace": "const SESSION_ID = /^[0-9a-fA-F]{32}$/;"

Applied with the edit tool to clone scripts/check-bidi-runtime.mjs line 145; clone line 145 after edit:

    const SESSION_ID = /^[0-9a-fA-F]{32}$/; // ChromeDriver 154 classic session id shape

Commands:

    TMPDIR=/fast/scratch/hyaku/tabi-r34/RevKillsM06M08 node scripts/check-bidi-runtime.mjs --selftest
    TMPDIR=/fast/scratch/hyaku/tabi-r34/RevKillsM06M08 node scripts/check-bidi-runtime.mjs --selftest --json | node -e '<filter printing !ok results>'

## Result — exit 3, sole failing case is the M06 kill case (55/56)

    CASE id=v3-a-m06-session-id-uppercase expected_exit=1 exit=1 expected_admitted=0 admitted=0 expected_population=1 population=1 expected_reason=t1-receipt reason=t1-receipt FAIL
    BIDI_RUNTIME_SELFTEST verdict=failed cases=56 passed=55
    SELFTEST_EXIT_M06:3

No other case failed (56 results, 55 passed).

Failing-case json (mutated gate's runtime output):

    {"id":"v3-a-m06-session-id-uppercase","ok":false,"expectedExit":1,"exit":1,"expectedAdmitted":0,"admitted":0,"expectedPopulation":1,"population":1,"expectedReason":"t1-receipt","reason":"t1-receipt","detail":"run1: webSocketUrl is not ws://<host>/session/<sessionId>: ws://127.0.0.1:9515/session/585E9EC1343EAA7FAA0718A636677BC9","expectedDetailIncludes":"sessionId is not 32 lowercase hex"}

Kill mechanism: under M06 the session-shape rule (clone gate:145, message built at clone gate:382) accepts the upper-case id, so the refusal reroutes to the ws-shape rule (clone gate:386-387) and the runtime detail no longer contains the pinned `sessionId is not 32 lowercase hex` — exit/admitted/population/reason all still matched; the kill rides `detailIncludes` alone.
