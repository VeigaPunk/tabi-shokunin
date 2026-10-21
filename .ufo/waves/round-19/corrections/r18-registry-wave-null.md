# Round 18 registry wave-label correction

Both round-18 specs declared `tabi-round-18-w1` / `tabi-round-18-w2`, but both final `swarm-registry.json` files and their `record.json` outputs contain `"wave": null`. The saved dispatch payloads retain the correct top-level `wave`; their nested `.registry` objects contain `schema`, `path`, `reportDir`, and `members`, but no `wave`.

The validator has two distinct outputs: `run` writes the canonical registry from the plan before emitting the dispatch payload, whereas the payload's embedded `registry` is only the plan's member/path object. `record` reads an existing registry and carries its `doc.wave` through; the canonical writer turns an absent wave into `null`. The post-dispatch registry/record timestamps, initial `agentId: null` dispatch rows versus assigned final IDs, and equal `createdAt`/`updatedAt` times are consistent with a registry based on the embedded dispatch object being passed to `record`, rather than the file `run` wrote. The exact external staging command is not retained; that final attribution is therefore inferential.

For round 19, preserve the registry file written by `run` as the input to `record`; do not treat `validation.json.registry` as a complete serialized registry document. Require each resulting registry's `wave` to match its spec.

Affected files (all four carry `"wave": null`; none is rewritten — they stay historical):
`.ufo/waves/round-18/w1/record.json`, `.ufo/waves/round-18/w1/swarm-registry.json`,
`.ufo/waves/round-18/w2/record.json`, `.ufo/waves/round-18/w2/swarm-registry.json`.

Cause in one line: the dispatch output's embedded registry object has no `wave` key, while the registry file
written by `run` does; a registry rebuilt from that embedded object and passed through `record` serializes the
missing label as null.

L1 reproduction (TabiR19-2, 2026-10-21, /tmp/tabi-r19-wavetest, own UFO_PROJECT_ROOT, policy v2): a 64-item
spec with `"wave": "tabi-r19-test"` → `run` exit 0, the written `swarm-registry.json` carries
`"wave": "tabi-r19-test"`, the dispatch output's `registry` object carries no `wave`; `record` with 64
assignments preserved `"wave": "tabi-r19-test"`. The round-18 validation snapshot's `agentId: null` rows are
the pre-dispatch shape by design (ids arrive only through `record`).

Round-19 practice: `record` is applied to the file `run` wrote; each round-19 registry and record is checked
for `wave` == spec `wave` and non-null member `agentId` (`.ufo/waves/round-19/measure-c3.mjs` d3).
