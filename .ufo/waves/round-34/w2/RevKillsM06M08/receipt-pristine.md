# RevKillsM06M08 — pristine self-test receipts (rev 04f9623dde8ad35d470cecf766e421eafbcb47fa)

Commands (run in scratch clone /fast/scratch/hyaku/tabi-r34/RevKillsM06M08/clone, detached at 04f9623):

    git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin <S>/clone
    git -C <S>/clone checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa   # -> 04f9623dde8ad35d470cecf766e421eafbcb47fa (lane master equal)
    TMPDIR=/fast/scratch/hyaku/tabi-r34/RevKillsM06M08 node scripts/check-bidi-runtime.mjs --selftest
    TMPDIR=/fast/scratch/hyaku/tabi-r34/RevKillsM06M08 node scripts/check-bidi-runtime.mjs --selftest --json

## Run 1 (untouched clone) — exit 0

    BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56
    SELFTEST_EXIT:0

Assigned cases PASS:

    CASE id=v3-a-m06-session-id-uppercase expected_exit=1 exit=1 expected_admitted=0 admitted=0 expected_population=1 population=1 expected_reason=t1-receipt reason=t1-receipt PASS
    CASE id=v3-a-m08-context-id-lowercase expected_exit=1 exit=1 expected_admitted=0 admitted=0 expected_population=16 population=16 expected_reason=t1-receipt reason=t1-receipt PASS

## Run 3 (after restoring from M08; `git status --porcelain` empty) — exit 0, per-case json detail (gate runtime output)

    cases 56 passed 56 ok true
    {"id":"v3-a-m06-session-id-uppercase","ok":true,"expectedExit":1,"exit":1,"expectedAdmitted":0,"admitted":0,"expectedPopulation":1,"population":1,"expectedReason":"t1-receipt","reason":"t1-receipt","detail":"run1: sessionId is not 32 lowercase hex: \"585E9EC1343EAA7FAA0718A636677BC9\"","expectedDetailIncludes":"sessionId is not 32 lowercase hex"}
    {"id":"v3-a-m08-context-id-lowercase","ok":true,"expectedExit":1,"exit":1,"expectedAdmitted":0,"admitted":0,"expectedPopulation":16,"population":16,"expectedReason":"t1-receipt","reason":"t1-receipt","detail":"run1: browsing-context id not ChromeDriver-shaped: 8f219b48c042686311a73bfee44a3739","expectedDetailIncludes":null}

Id derivations (node crypto):

    sha256("tabi-v3-a-session").slice(0,32) = 585e9ec1343eaa7faa0718a636677bc9  (case uses .toUpperCase() -> 585E9EC1343EAA7FAA0718A636677BC9, 32 upper hex)
    sha256("tabi-v3-a-context").slice(0,32) = 8f219b48c042686311a73bfee44a3739  (32 lower hex)
