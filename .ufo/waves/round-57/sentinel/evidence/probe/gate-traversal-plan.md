# Sentinel probe plan — gate v2 relative-citation path traversal

Read-only w.r.t. the lane. All artefacts under
`/fast/scratch/hyaku/tabi-r57/R57Sentinel/probe/`.

## What the v2 contract says (R57Gate item, .ufo/waves/round-57/w1-spec.json:50)

> an UNPREFIXED token starting with a known wave-dir component
> (counters|measure|controls|adj|gate|gate-fixtures|sources|scout|reviewer|
> critic|connector|mutant|sentinel|labrat|scribe|quarantine|assimilation)
> followed by '/' resolves against .ufo/waves/round-<N>/ with N = the gate's
> --round; missing at that path -> finding relative-citation-missing; present
> -> no finding. ... Refuse path traversal outright: a token containing '..'
> emits finding relative-citation-traversal (never resolve outside the round
> dir).

## Tokens to try against the delivered v2 (fixture tree, --round 57)

| # | token | expected |
|---|-------|----------|
| T1 | `measure/c1-meter-green-at-correction1.json` | relative-citation-missing (or present -> no finding) |
| T2 | `measure/../../../etc/passwd` | relative-citation-traversal, NEVER resolved |
| T3 | `counters/../../../../etc/passwd` | relative-citation-traversal |
| T4 | `measure/..%2f..%2fetc/passwd` | traversal or no-match; NEVER resolved outside |
| T5 | `counters/..` | relative-citation-traversal (token contains '..') |
| T6 | `measure/./x.json` | normal relative handling; NOT a traversal |
| T7 | `measurefoo/x.json` | NO match (component must be followed by '/') |
| T8 | `measure the count` | NO match (prose) |
| T9 | `mutant/foo.json` | relative rule applies (mutant is a listed component) |
| T10 | `.ufo/waves/round-57/measure/x.json` | full-prefix path — v1 semantics, NOT touched by the relative rule |
| T11 | `.ufo/waves/round-55/measure/x.json` | cross-round full-prefix — untouched |
| T12 | `gate-fixtures/x.json` | relative rule applies (component is 'gate-fixtures', not 'gate') |
| T13 | `/etc/passwd` | absolute path — must NOT be resolved |
| T14 | `measure//etc/passwd` | must resolve INSIDE the round dir |

## Pass criteria

1. NO token containing '..' ever resolves to a path outside
   `.ufo/waves/round-<N>/` — verified by observing the gate's reported path
   AND by confirming the gate reports a traversal finding.
2. The gate must not resolve a path outside the round dir even when the file
   EXISTS there (plant a decoy outside the round dir in the fixture tree; the
   gate must still refuse).
3. v1 semantics unchanged on full-prefix tokens (differential run).
