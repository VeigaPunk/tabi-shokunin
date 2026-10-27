# RevFreezeIntegrity — claim recheck

Commands:
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 1f4260aeb3af186e84444cbb417a31b8a35bdb55:.ufo/waves/round-39/counters/c1-egress-session-bound.mjs | sha256sum` → `75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e  -`
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 1f4260aeb3af186e84444cbb417a31b8a35bdb55:.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs | sha256sum` → `891c1e9d4b1fb31d8a019bcdfb6270d7fc9a68d2d2d16ed0901ce26d3ea10166  -`
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 1f4260aeb3af186e84444cbb417a31b8a35bdb55:scripts/playwright-firefox-egress-round39.mjs | sha256sum` → `3fba8b680cb1a415517266d722640aebf38e280a929d3ae5335054a3f09a33fc  -`

Claims comparison: C1 expected frozen digest `75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e`, equal. Driver expected `3fba8b680cb1a415517266d722640aebf38e280a929d3ae5335054a3f09a33fc`, equal. C2 expected `eefc8997f9952a4f2fe9cdef0da3929cb46d14b54bc5d98b379826aa32058c7c`; observed differs (`891c1e9d4b1fb31d8a019bcdfb6270d7fc9a68d2d2d16ed0901ce26d3ea10166`).

Predicate byte comparison by direct text inspection: C1 claims predicate and counter constant `PREDICATE_SENTENCE` match exactly. C2 claims predicate and counter constant match exactly. Counter comments identify both as frozen predicate sentences; C2 also explicitly states byte-identical requirement.

VERDICT finding — C2 frozen digest mismatch at the requested commit.
