# PinS094 — C3 re-open of registry row S094 at Chromium stable 156.0.8078.47

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`,
work revision `97be89bc66139eb45526a04af59a35dccc006eb9` (claims frozen before data).
Scope: row `corpus/SOURCES.md:108` only. No lane tracked file, index, jj state or fleet path was written;
`git status --porcelain` shows only pre-existing untracked `.ufo/waves/round-29/` material (`git diff --stat` empty, exit 0).
No tool was installed or upgraded (nothing needed; pacman not touched).

## 1. What the row cites

`S094` is an **absence row** (status `rejected`, tier C, recheck `on-release`): the guessed unit-test
filename does not exist at tag `154.0.8037.97`, and that absence is the claim.

| cell | value (as in the registry) |
|---|---|
| source | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT` |
| anchor | `HTTP 404 fetched 2026-10-21; first line NOT_FOUND: Requested entity was not found; body sha256 9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19` |
| teaches | REJECTED: this guessed test filename does not exist at the tag; flip: a resolvable test file with a located quote (`html_form_mcp_tool_test.cc` is a lead) |
| used-by | `corpus/lessons/round-19.md` |

Chromium files cited by the row: **exactly one** —
`third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc` (from the source URL).
The anchor names no additional file by basename. **Line ranges the anchor gives for it: none** — an
absence row cannot bound lines in a 404 body, so `ranges` is `[]` (the counter's per-file 404 branch
is reached before its `f4-ranges` check, so an empty range list is the intended shape here).

Basename resolution was not needed for the entry. For the row's own flip lead I resolved
`html_form_mcp_tool_test.cc` from the Gitiles directory listing of
`third_party/blink/renderer/core/html/forms` at both tags (HTTP 200, see §3).

## 2. Bytes, statuses, digests

Gitiles `?format=TEXT` on a 404 returns a **plain-text protobuf-style error body, not base64** — so
`base64 -d` exits 1 on it; the body is kept verbatim (233 bytes at both tags). Line 7 is a
per-response `request_id`.

| tag | HTTP | curl exit | body bytes | sha256 |
|---|---|---|---|---|
| 154.0.8037.97 (committed `old_bytes`) | 404 | 0 | 233 | `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19` |
| 156.0.8078.47 (committed `new_bytes`) | 404 | 0 | 233 | `03016b0d4b5175446c24f72c845afeec449867018302f55cb767ebf6b2d7a056` |
| 154.0.8037.97 (live re-fetch today, verification copy) | 404 | 0 | 233 | `07186be4641ae6094a57002d757161e0bdc1c09863094eaf52a3f37ffc2000fc` |
| 154.0.8037.97 (earlier live re-fetch this seat) | 404 | 0 | 233 | `622bb8f0091bb6050bfd350c8a1f0a3f73aa10a18d8af48de0b6492dc2fb1ea5` |
| 156.0.8078.47 (live re-fetch today) | 404 | 0 | 233 | `d71e047953acdff3732fa01d961ba2d7f59f31996e9aacf11380c2b990a74807` |

Committed bytes live in this seat's output dir; the assembler copies them to the paths the entry names:

- `.ufo/waves/round-29/w1/pins/S094/bytes/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc`
- `.ufo/waves/round-29/w1/pins/S094/bytes/156.0.8078.47/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc`
- `.ufo/waves/round-29/w1/pins/S094/bytes-verification/154.0.8037.97/…` (today's live 154 re-fetch, kept apart
  from the digest-bound body — see F1)

**Registry digest check (step 3): match, with provenance.** The row's 64-hex digest `9d640282…` equals the
sha256 of the committed `old_bytes`. Those bytes are the lane's own retained 2026-10-21 fetch of this exact
URL at this exact tag (`corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz`;
`zcat … | sha256sum` = `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`, exit 0).
Today's live fetch of the same URL at the same tag reproduces the body **byte-for-byte except line 7**
(`diff` exit 1: `request_id: "ae2958d1…"` → `request_id: "1cdfb0bd…"`). Nothing was fabricated: the digest-bound
body is a real fetch retained in the lane, and the live re-fetch is committed separately.

## 3. Range verdicts at 156.0.8078.47

| file | old status | new status | ranges | verdict |
|---|---|---|---|---|
| `third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc` | 404 | 404 | none | **holds** (absence row: 156 still returns 404 with `NOT_FOUND: Requested entity was not found` on line 1) |

Absence corroboration (so the 404 is a real absence, not a transient Gitiles error): the directory
listing `third_party/blink/renderer/core/html/forms?format=JSON` is HTTP 200 at both tags
(37 662 B / 37 359 B) and in both lists the mcp-named files are `form_mcp_schema.cc`,
`form_mcp_schema.h`, `html_form_mcp_tool_test.cc` — **no `form_mcp_schema_unittest.cc`**. Saved as
`dir-listing-{154.0.8037.97,156.0.8078.47}.json`.

Row verdict: **holds** → no drifted range → **no superseding row drafted** (step 6's condition is unmet;
`entry.json.superseded_by` stays `null` and the counter's `s1-drift-unsuperseded` path is never reached).

## 4. Entry and fixture probe

`entry.json` is written in the exact requested shape (`ranges: []`, `superseded_by: null`,
`old_status`/`new_status` 404, `fetched_at` `2026-10-26T04:28:11Z`).

Counter probe on a throwaway `git -C` fixture under scratch (`mktemp -d -p $S`, `git init -q`,
`git rev-parse --show-toplevel` verified equal to the fixture dir before the first commit), carrying the
real `corpus/SOURCES.md` plus this entry, the two byte files and a refetch record:

| case | exit | population | unresolved | S094 |
|---|---|---|---|---|
| `base` | 1 | 23 | 22 | `resolved:true verdict:holds reasons:[]` |
| `no-refetch` | 1 | 23 | 23 | `resolved:false reasons:["f6-refetch …"]` |
| `unrelated-404-body` | 1 | 23 | 22 | `resolved:true verdict:holds reasons:[]` ← F2 |

`population=23` independently reproduces the frozen claim's population. `unresolved=22` in the fixture is
expected: the other 22 population rows have no receipt entry there. Raw output:
`fixture-counter-out/{base,no-refetch,unrelated-404-body}.json`.

## 5. Findings

**F1 — blocker for this row's `f6-refetch`, structural.**
Every Gitiles 404 body embeds a fresh `request_id` (line 7), so a 404 body's sha256 is **not reproducible**
at either tag. Two consecutive 156 fetches give `e7a5db02…` and `d33621f8…`, differing only in that line
(`diff` exit 1); the plain HTML 404 body behaves identically (`b7f6ee87…` vs `d1ec0b65…`, `request_id` only).
`check-release-pins.mjs` `f6-refetch` requires an independent seat's record with
`sha256 === new_sha256` exactly. Therefore an independent seat's live re-fetch of this path **cannot**
match `03016b0d…`; S094 cannot reach `resolved:true` under the frozen counter as the entry now stands.
Honest remedies (no fabrication): **(a)** the independent seat fetches the 156 body and *its* bytes become
the committed `new_bytes`, with `new_sha256` = that seat's sha and its refetch record matching (the entry
stays authored by `PinS094`, provenance recorded); or **(b)** a later round relaxes the 404 branch to
status + `NOT_FOUND` without body-sha binding. Writing a refetch record whose sha was not produced by that
seat's live fetch would be fabrication and is not proposed.

**F2 — the frozen counter's 404 branch does not bind absence-row content.**
Substituting the 404 body of a *different* path (`…/does_not_exist_probe.cc`, sha `09b8999d…`) as the 156
bytes, with `new_sha256` and the refetch record updated to match, still yields `resolved:true verdict:holds`.
Absence rows are resolved by status + the literal `NOT_FOUND`, so any 404 body passes; only the *old* digest
is bound. Reported as a finding for the counter owner; the counter is frozen this round and this seat does
not repair production code.

**F3 — the row's flip lead resolves at the new tag.**
`html_form_mcp_tool_test.cc` is HTTP 200 at both tags and byte-identical (`944ee9e45eb9c400143a3746296af16fcbfdea3249dec669580b751f0ae27be6`,
106 254 B; copies under `lead/…@154.0.8037.97`, `lead/…@156.0.8078.47`). The rejected row's flip target is
still available at 156.0.8078.47, relevant to whoever re-scopes S094.

**Recheck notes for citing entries.** `corpus/knowledge/` contains **no** entry citing S094
(`grep -rn 'S094' corpus/ knowledge/` → only `corpus/SOURCES.md:108`, `corpus/lessons/round-19.md:51` and
`:54`). The used-by cell points at the lesson `corpus/lessons/round-19.md`, whose line 51 records the same
404 + digest and whose line 54 records the rejection. What that lesson now gets wrong: nothing material —
its 404 and digest remain exact at `154.0.8037.97`, and the flip lead it names (`w1/SrcFormSchemaTests.md`,
`html_form_mcp_tool_test.cc`) still resolves identically at `156.0.8078.47`. The one thing it cannot claim
is digest reproducibility: `9d640282…` is one fetch instance, not a stable property of the URL (F1).

## 6. Commands and exit codes

```
git -C <lane> rev-parse HEAD                                           -> 97be89bc66139eb45526a04af59a35dccc006eb9  exit 0
curl -sS -o raw_154.b64 -w '%{http_code}' '…refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT'
                                                                       -> 404  exit 0 (233 B)
curl -sS -o raw_156.b64 -w '%{http_code}' '…refs/tags/156.0.8078.47/…form_mcp_schema_unittest.cc?format=TEXT'
                                                                       -> 404  exit 0 (233 B)
base64 -d raw_154.b64                                                  -> exit 1 (404 body is plain text, not base64)
sha256sum raw_154 body                                                 -> 9d640282…bdc8b19 (retained body) / 07186be4… (today, request_id differs)
sha256sum raw_156 body                                                 -> 03016b0d…d7a056 (committed) / d71e0479… (today, request_id differs)
zcat corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz | sha256sum
                                                                       -> 9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19  exit 0
diff <retained 154 body> <today's 154 body>                            -> exit 1, only line 7 request_id
diff <first 156 body> <second 156 body>                                -> exit 1, only line 7 request_id
curl '…/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms?format=JSON'  -> 200  exit 0 (37662 B)
curl '…/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms?format=JSON'  -> 200  exit 0 (37359 B)
curl '…/refs/tags/{154,156}/…/forms/html_form_mcp_tool_test.cc?format=TEXT'               -> 200/200 exit 0, both 944ee9e4…
git -C "$D" init -q; git -C "$D" rev-parse --show-toplevel              -> toplevel_ok=yes  exit 0
node scripts/check-release-pins.mjs --repo "$D" --rev HEAD --stable 156.0.8078.47 --json
                                                                       -> base exit 1 (S094 resolved:true holds)
                                                                          no-refetch exit 1 (f6-refetch)
                                                                          unrelated-404-body exit 1 (S094 still resolved:true)
git -C <lane> status --porcelain                                       -> only pre-existing untracked .ufo/waves/round-29/*; git diff --stat empty
```

## 7. Deliverables (all under `.ufo/waves/round-29/w1/pins/S094/`)

- `entry.json` — the requested receipt entry.
- `bytes/<tag>/<chromium path>` — committed 154 (digest-bound) and 156 (404 `NOT_FOUND`) bodies.
- `bytes-verification/154.0.8037.97/<path>` — today's live 154 re-fetch (request_id differs only).
- `fetch-log.txt` — per-fetch status, curl/fetch exit codes, shas, provenance, adjudication.
- `verdict.json` — per-file/range verdicts, digest match, counter cases, findings F1–F3.
- `dir-listing-{154.0.8037.97,156.0.8078.47}.json`, `lead/html_form_mcp_tool_test.cc@<tag>`, `receipts/`.
- `fixture-counter-out/{base,no-refetch,unrelated-404-body}.{json,stderr}`.
- No `supersede-row.md`: nothing drifted.

**Remaining dependency (not this seat's write scope):** the receipt's `new_sha256` still needs an
`corpus/evidence/round-29/release-pins/refetch/S094.json` from a seat other than `PinS094` whose sha equals
the committed 156 bytes — which, per F1, only works if that seat's own fetched bytes are the committed ones.
