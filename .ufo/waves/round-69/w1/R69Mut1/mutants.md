| mutant | defect (single-point) | mutant sha256 (pinned per result) | battery exit | refused/19 | positive | failed negatives | verdict | witness |
|---|---|---|---|---|---|---|---|---|
| m0 baseline | frozen bytes, unmutated | b62f9c7daebfbd0a1494e9a60a9ee06665574f1f98969ba1c08da0d698c58b20 | 0 | 19/19 | ok | — | clean baseline | — |
| m01 | drop duplicate-lane detection | 2a3d483118d722fca6add9af22c10ad01c04410114ad0d7b984b02daf4b4657b | 1 | 18/19 | ok | lane-duplicated-contradictory | **killed** | — |
| m02 | drop relation vocabulary check | cd10c49960099506e8d1fa90770d67e8e0462047e7011e5c115ec8bb8ade6105 | 1 | 18/19 | ok | relation-out-of-vocab | **killed** | — |
| m03 | accept any head (drop snapshot-head equality) | 98048b47dfda65e2cd8fa5564355e8e6f3c37e5ac91a8dc02bb5a27ea1bb9439 | 1 | 18/19 | ok | head-not-snapshot | **killed** | — |
| m04 | quote checked against whole file, not the cited line | 2aa0069385391e2fa9295269a1bec90eac6e72573744fdcbf381c829524f4a92 | 1 | 17/19 | ok | cite-line-absent, quote-off-line | **killed** | — |
| m05 | off-by-one line index (1-based read of 0-based array) | 19f6167e8960d0be0dbca0d7d6ec5f528f79fe5197bdfbd90b8da09a0ddac121 | 1 | 19/19 | FAIL | positive | **killed** | — |
| m06 | quote lower length bound 3 -> 1 word | b737b7f8c296caa8e999fad029f70c98c34e29dcfa068f5a2fab47426c85ac89 | 0 | 19/19 | ok | — | **survived** | w1-two-word-quote (pristine 1 [quote-length] / mutant 0) |
| m07 | quote upper length bound 25 -> 250 words | ab9212d3d9fa66d23c6e6f95e326ab2022d6f8e977dfc9c9d6dc17e59949d503 | 1 | 18/19 | ok | quote-too-long | **killed** | — |
| m08 | drop inbound citation-line reciprocity (inbound-unanswered) | 63454a1fc602cf004beb22b5a31cd222f66198b813d54a55d76778a1a93aa276 | 1 | 18/19 | ok | inbound-cite-elsewhere | **killed** | — |
| m09 | drop contested rule for inbound contested siblings | e84fa2ab674fadfb2ff184647cc25a15f2ee9e52a5ecea4c4f895bd9c88ebf36 | 1 | 18/19 | ok | inbound-contested-as-adjacent | **killed** | — |
| m10 | drop inbound-relation-none rule | 1faa7ad4f63703582e58ef014b48a39a9b2bff1c1c084f591e80891ff51febd8 | 1 | 18/19 | ok | inbound-relation-none | **killed** | — |
| m11 | drop outbound Refuses routing check | c8335ab6b22efd13aba2609c7022eb9e1b5809eb27e76bd2d29c4a15ccba9dc6 | 1 | 18/19 | ok | outbound-relation-none | **killed** | — |
| m12 | drop lane-missing loop over snapshot lanes | 99a57b936ca64e0a728f678ea05ab3f0d9ef201b382fd3969b48e0056a6a727f | 1 | 18/19 | ok | lane-row-dropped | **killed** | — |
| m13 | drop mandatory **Refuses:** paragraph | cd11e97f58a6fe9a0d37f596200b259a84b04ac828854837d2506dbb3f2006a6 | 1 | 18/19 | ok | refuses-removed | **killed** | — |
| m14 | tabi-side minimum 4 -> 2 words | 853a2ce459a39fd87caae505106c67efbd90be30f3f9e34f091948001627fde9 | 0 | 19/19 | ok | — | **survived** | w2-two-word-side (pristine 1 [tabi-side-empty] / mutant 0) |
| m15 | tolerate cite file absent at head | 9d22200fdd1819a04cc0be83a618a67b38e08017cd5e9fc5aeb7cd272dcf7442 | 1 | 18/19 | ok | cite-file-absent | **killed** | — |
| m16 | drop matrix header shape check | 465b2534f0f9f1ac1cb4b8ae35b889fa8f9ff426c6617ecb2748c1c581060936 | 1 | 18/19 | ok | header-renamed | **killed** | — |
| m17 | duplicate detection only when relations disagree | 4ad14677de96e8667493a3d46bd1d83a7c396ade1b90403ec68bc1588d4e6f0c | 0 | 19/19 | ok | — | **survived** | w3-exact-duplicate-row (pristine 1 [duplicate-lane] / mutant 0) |
| m18 | inbound tabi mention matched case-sensitively | 3b93a62a0b0bf7ae8596cb61e943b93cc0949d97b52dbc88c397b791ae4bb4e8 | 0 | 19/19 | ok | — | **survived** | w4-capitalised-tabi-mention (pristine 1 [inbound-relation-none] / mutant 0) |
