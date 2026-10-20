22. A claim's measurement binds the counter blob digest (sha256 at the measured
    revision), the declared counted inputs and the measured revision, and is
    reproduced at, or diffed to, the delivered HEAD. A revision-only pin or a
    measurement taken at an older revision is not admissible. Enforced by
    `scripts/check-measurement-binding.mjs`; a legacy-shaped record reports
    `counter_digest_unrecorded`, never clean.
    (lesson: corpus/lessons/round-16.md#mistakes; round15 outside routed1/2)
23. A browser-API observation names the exact exposed surface: object path
    (e.g. `document.modelContext`, not `navigator.modelContext`), enabling flags,
    Chromium version and secure-context state. It never generalizes a CG-draft
    API name to the implementation; spec names are cited as spec, observed names
    as observed. The test surface is a loopback `http://127.0.0.1` page, not `data:`.
    (lesson: corpus/lessons/round-16.md#mistakes; WebMCP spec S020 vs observed surface)
