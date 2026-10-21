# Round 18 d3 — registry wave labels

VERDICT: ISSUES

Axes: causal fidelity, run-versus-record writer contract, evidence confidence.

## Finding

Both round-18 specs declare a wave (`w1/spec.json:2` = `tabi-round-18-w1`; `w2/spec.json:2` = `tabi-round-18-w2`), while both final registries and matching `record.json` outputs say `"wave": null` (`w1/swarm-registry.json:2-6`, `w1/record.json:2-7`; same at `w2/swarm-registry.json:2-6`, `w2/record.json:2-7`). The validator does not inherently lose the spec value in `run`: it keeps the wave on the plan and `run` persists a canonical registry separately from its dispatch payload. The payload's nested `registry` is a partial plan object and omits `wave`. The likely failure is that the post-dispatch registry/record flow used that embedded object as the file to record, instead of retaining the on-disk registry produced by `run`. That missing field is accepted by the record loader and canonicalized to explicit `null`.

## Evidence chain and divergence

1. The source validator `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` reads `spec.wave` into the local `wave` at line 790 and returns it on the plan at lines 1206-1209. `plan.registry` is constructed with `schema`, `path`, optional `reportDir`, and `members` at lines 1253-1260; it has no `wave` field. `planToDispatchPayload` copies both values independently: top-level `wave: plan.wave` and nested `registry: plan.registry` at lines 1292-1298.
2. The saved `validation.json` files have exactly that shape: correct top-level waves (`w1/validation.json:2-3`, `w2/validation.json:2-3`); nested registry starts at lines 21-25 with `schema`, `path`, `reportDir`, `members`, and no `wave`. Its initial member rows have `agentId: null` (`w1/validation.json:25-30`; `w2/validation.json:25-30`).
3. `run` does not use the nested object as its disk file. In `main`, it calls `persistWaveRegistry(plan)` before constructing/emitting `planToDispatchPayload(plan)` (`ufo-swarm-wave.mjs:1808-1820`). The persistence path calls `buildRegistryDoc` with `wave: plan.wave ?? existing?.wave` and writes that document (`:1497-1511`); the canonical builder emits `wave: wave ?? null` and `createdAt: createdAt ?? now` (`:616-628`). Therefore, with these nonempty spec wave values, this `run` path should write the corresponding string.
4. `record` is not the operation that strips an existing string: it loads the registry from the named path (`:1601-1602`), passes `doc.wave` unchanged to the canonical builder (`:1734-1741`), then emits `{path, ...registryDoc}` (`:1744`). If the starting document has no wave, the builder's `wave: wave ?? null` converts the missing value to null. Its own loader returns `doc.wave` without requiring a string (`:521-525, 569`); the builder comment explicitly documents absent/null/string inputs (`:609-615`).
5. Round-18 artifacts align with the dispatch-then-record sequence, not an untouched `run` registry: in w1, `spec.json` mtime was `16:04:18.146 -0300`, `validation.json` `16:04:18.175 -0300`, successful dispatch output `dispatch-result.txt` `16:04:31.541 -0300`, final registry `16:04:46.914 -0300`, and `record.json` `16:04:46.918 -0300`. The registry's `createdAt` and `updatedAt` are both `2026-10-20T19:04:46.915Z` (`swarm-registry.json:4-5`), and it now has assigned agent IDs (`:8-12`), unlike the earlier embedded object.
6. In w2, `spec.json`, `validation.json`, and the initial failed dispatch result were modified at `16:58:14.343`, `16:58:14.371`, and `16:58:14.380 -0300`; the later successful `dispatch-attempt-2.json` at `17:01:46.164`; then registry at `17:01:51.272` and `record.json` at `17:01:51.276`. The second dispatch result says it spawned 80 agents (`dispatch-attempt-2.json:2`); the saved registry's `createdAt` and `updatedAt` both equal `2026-10-20T20:01:51.272Z` and its members have assigned IDs (`swarm-registry.json:4-5, 8-13`). The recorded output repeats the same null wave and times (`record.json:2-6`).

**Reconstructed cause — [INFERENCE], medium-high confidence:** the dispatch JSON's embedded `registry` object was used/re-materialized as the registry input for the later `record` call, rather than using the registry file created by `run`. It lacks `wave` (and `createdAt`); `record` preserves the absent wave as `undefined`, then `buildRegistryDoc` serializes it as `null` and supplies the record-time timestamps. The matching dispatch shape, null-valued final outputs, assigned member IDs, and post-dispatch creation/update times strongly support this route. The exact external write/copy command and any pre-record file bytes are not retained, so they cannot be asserted as directly observed. The round-18 artifacts also do not pin the producer hash of the validator; the source-chain statement above is for the assigned read-only validator snapshot, not proof that this exact byte version produced those historical files.

This is not explained by the config path or external-tools gate: in the inspected source they configure policy/path admission (`:112-127, 414-424`), while the wave value is taken from the spec and handled by the independent registry writer paths above.

## Draft correction note (text only; not written as a production file)

### `.ufo/waves/round-19/corrections/r18-registry-wave-null.md`

# Round 18 registry wave-label correction

Both round-18 specs declared `tabi-round-18-w1` / `tabi-round-18-w2`, but both final `swarm-registry.json` files and their `record.json` outputs contain `"wave": null`. The saved dispatch payloads retain the correct top-level `wave`; their nested `.registry` objects contain `schema`, `path`, `reportDir`, and `members`, but no `wave`.

The validator has two distinct outputs: `run` writes the canonical registry from the plan before emitting the dispatch payload, whereas the payload's embedded `registry` is only the plan's member/path object. `record` reads an existing registry and carries its `doc.wave` through; the canonical writer turns an absent wave into `null`. The post-dispatch registry/record timestamps, initial `agentId: null` dispatch rows versus assigned final IDs, and equal `createdAt`/`updatedAt` times are consistent with a registry based on the embedded dispatch object being passed to `record`, rather than the file `run` wrote. The exact external staging command is not retained; that final attribution is therefore inferential.

For round 19, preserve the registry file written by `run` as the input to `record`; do not treat `validation.json.registry` as a complete serialized registry document. Require each resulting registry's `wave` to match its spec.

## Reproduction and limits

No runtime reproduction was run. This seat's revenger role prohibits invoking another runtime; consequently I did not invoke Node/the validator, create `/tmp/tabi-r19-RevRegistryWaveNull`, set the requested environment, or claim observed reproduction output. The finding is a static source-and-artifact reconstruction only. No build, test, or lint command was run. No tool was installed or updated.

The requested LSP device is unavailable in this session: `read xd://lsp` returned `No such tool: xd://lsp` and the mounted-device inventory did not list an LSP tool. Grep was used only to locate source symbols; the semantic evidence above comes from direct reads of the exact source line ranges, not grep output.

## Source identities and artifact digests

The quoted source is local, un-decoded file content; SHA-256 values below are of the exact file bytes. Access date for the validator source: 2026-10-21. `file:///home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs`, anchors `:790, 1206-1209, 1253-1260, 1292-1298, 1497-1511, 1601-1602, 1734-1744, 616-628`; SHA-256 `1d33a03ffb204bc499310589199590d305b677fbe4fb2dfdb924f7c0f5f09d0a`. Verbatim source snippets, each under 25 words: `wave: plan.wave ?? existing?.wave` (`:1498`); `wave: doc.wave` (`:1735`); `wave: wave ?? null` (`:620`).

SHA-256 of the round-18 artifact bytes:

- w1 `spec.json`: `e7d3471fd0e5a9887ea02dd376a433ad42f575b2e3409ae1ea1846d14352b6b6`
- w1 `validation.json`: `7550823dd3e3bd062792e960ad033d79ec008dcb279ce455a9188d64b7849cf2`
- w1 `dispatch-result.txt`: `aaf495f1b16cf7ca4ff7845f28f1c745063634b76e47d2f310df820827990f04`
- w1 `swarm-registry.json`: `30461ac06689f08cf9e7041bee0cbf394bcd0222025b2aa38b744d7e722671ee`
- w1 `record.json`: `7ca7d53f3d38d4b2df4a9b4256947a3f359ee6b07f2d77d2dc61121dc396a3be`
- w2 `spec.json`: `afb527b02dc69bdce95e26354b835d655ff6d84bb2990119f95caf3f996d3bd0`
- w2 `validation.json`: `6955b005327751a788822592ab3979188c133f7320cd74994366411a32b02cfd`
- w2 `dispatch-result.json`: `b54ccf0ebe31ee1446cf46ee683bfae5085f8c40260e881679500af3480c79f0`
- w2 `dispatch-attempt-2.json`: `659300d2602f2d631070deb114e5b273a8c996ab6004124a6a44e8e5737dcfa1`
- w2 `swarm-registry.json`: `48ad1fe01a60beba1a8fd4106124cf2a57381f8d547acc4852d766e3c60672e1`
- w2 `record.json`: `42147a2af424611e4406f532386acd4c0f674ff2d5d849c5426a363af18bf881`

Files written: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/RevRegistryWaveNull.md`

## Isolation

- Clone path: N/A (report-only investigation; no production file)
- Branch: N/A
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: N/A (no Git write performed)
- Changed paths: `.ufo/waves/round-19/w1/RevRegistryWaveNull.md` only