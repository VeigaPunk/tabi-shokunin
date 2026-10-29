# ExecReplayAll — extraction record (r39–r42 C1 receipts + measure records)

Lane `tabi`, round 43, wave 1. Read-only from
`/home/vgpnk/Projects/shokunin/tabi-shokunin` (the lane repo). Nothing was written,
committed, fetched or pushed there; all extracted bytes were written into the seat's
scratch `/fast/scratch/hyaku/tabi-r43/ExecReplayAll/` and then into this evidence dir.

HEAD at extraction time: `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`
("round-43: C1 receipt+witness committed as explicit files").

## Round-39 receipt path discovery

`.ufo/waves/round-39/claims.json` names the round-39 C1 counter
(`.ufo/waves/round-39/counters/c1-egress-session-bound.mjs`, `--rev/--repo` based) and
its "before" clause names the round-38 receipt as the do-nothing control; it does not
name round-39's own receipt path. The path was recovered from round-39's own wave
material and corpus:

* `.ufo/waves/round-39/w1/RevC1Receipt/report.md:23` — "Committed receipt blob:
  `2e607b4aa60444e1caf0d183d8086da07fe84f49` at
  `corpus/evidence/round-39/playwright-egress/receipt.json`."
* `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md:11` — "The two-run
  receipt is `corpus/evidence/round-39/playwright-egress/receipt.json`".
* The commit that adds it: `690b0500fab8eac5ab85485bbcecbc0076247bea`
  ("round-39: control receipts and session-bound egress receipt").

## Extraction (`git show <rev>:<path>`) and byte identity with HEAD

Every extracted blob was re-hashed from `HEAD:<path>` and compared: all nine paths are
`SAME` (no post-commit drift), and each is a `blob` object (not a tree).

| round | path | rev | sha256 |
|---|---|---|---|
| 39 | `corpus/evidence/round-39/playwright-egress/receipt.json` | `690b0500fab8eac5ab85485bbcecbc0076247bea` | `e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493` |
| 40 | `corpus/evidence/round40/playwright-egress/receipt.json` | `22883df61d8deb55e03a1afebc81f7290c3a3cfc` | `a72f4eea8a9a9245dff1760b4de2f3e3e8de84a7755e0ceba1e8699d830c3722` |
| 40 | `corpus/evidence/round40/playwright-egress/measure.json` | `22883df61d8deb55e03a1afebc81f7290c3a3cfc` | `373648139c6cdfc950923271c7ed9bbcd3c2ecf2341198e45c66340ecbcfa325` |
| 41 | `corpus/evidence/round41/playwright-egress/receipt.json` | `9b6de3a19de11abdb80e82a1310abc64a40215bb` | `416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1` |
| 41 | `corpus/evidence/round41/playwright-egress/receipt.witness.json` | `9b6de3a19de11abdb80e82a1310abc64a40215bb` | `d3c9972e2724e8737027c8a511434d780eff661aa2b2d70e70e848e2240f39d3` |
| 41 | `.ufo/waves/round-41/measure/c1-measure.json` | `123e55c77bb101be008db4cbf8ffca626423335a` | `5e2a83ac02b9a4ec3f7d0ebec21f5fa9b3469d4110ac23f8e78af18b43913f13` |
| 42 | `corpus/evidence/round42/playwright-egress/receipt.json` | `227956616c5413f280cc43cdcf0e6bc8f30da8b6` | `3984455276a5b54a0a7652fc76923eb46d446f0630556d6775abc7c1fd317b7e` |
| 42 | `corpus/evidence/round42/playwright-egress/receipt.witness.json` | `227956616c5413f280cc43cdcf0e6bc8f30da8b6` | `163f4eba7f8b6c93daa0e5742b0ade81ee16ff716cc27bc578fb76795a57d339` |
| 42 | `.ufo/waves/round-42/measure/c1-measure.json` | `236c4f49f6cf8be7fd2efc71c7e89b7465b47a27` | `bae3868b4dabcbe267c0412e30e48d71c82111eac2627ecd642d4d110d6b0825` |

Round-40 has two copies of its measure record — `corpus/evidence/round40/playwright-egress/measure.json`
and `.ufo/waves/round-40/measure/c1-live-run.json` — committed in the same commit and
**byte-identical** (`cmp` → identical, both sha256 `373648139c6cdfc950923271c7ed9bbcd3c2ecf2341198e45c66340ecbcfa325`).

## Round-39 has no measure record

`git log --all --pretty=format:'' --name-only | sort -u | grep 'round-39/measure'` lists
only `.txt` census/before/probe files plus `proc-endian-{before,after}.json` — **no signed
measure record exists for round 39 anywhere in history** (the Ed25519 signing chain only
appears in round 41). Round-39's C1 counter is `--rev/--repo` based and reads the committed
receipt out of the repo; it never had a signed measure artifact. Round-39 was therefore
replayed twice: once with the measure slot absent (the honest "own measure" state) and once
against round-40's own measure record so the refusal is not an artifact of a missing file.

## Producer pins observed at run time

```
23afa29d5def9d4043f19e8be020ef0a50b3565f92ee5965facf70c4a95992a0  scripts/measure-c1-round43.mjs
3718235934d1fd06ffef2b976cfe09fabdc5af75d295bd78ee4d95b04e487c7e  scripts/playwright-firefox-egress-round43.mjs
6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c  .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs
290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029  .ufo/waves/round-43/claims.json   (== claims.json at freeze 7ca6f018)
1f637a7cfe8f1a3ec814a7da7e38c360a3e3c39553b8c7245ac5d6643fd495eb  /home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox
7fde7b8afa198da66257f42ee2001d874c7355631e6d1579a5fb5ef1f246df4c  node (process.execPath, fnm-managed v24.21.0)
```

All six equal the frozen pins in `.ufo/waves/round-43/claims.json` (`frozenDigests`,
`producerPins`) exactly.
