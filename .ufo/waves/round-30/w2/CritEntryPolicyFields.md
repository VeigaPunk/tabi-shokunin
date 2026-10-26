# CritEntryPolicyFields — round 30, w2 falsification of `corpus/knowledge/rate-limit-policy-fields.md`

**Seat:** CritEntryPolicyFields (attack only, leaf — no repairs, no subagents).
**Attacked:** every claim sentence of `corpus/knowledge/rate-limit-policy-fields.md` (S116, 123 lines) against
`corpus/evidence/round-30/frontier/bytes/S116.txt` (67097 B, sha256 `d6016dd0…d412`) and, for the `t` meaning change,
against the `-10` bytes the entry names. REV `072af95fe2822f0785a6ff88a578e2142dd258e5`, clean `--shared` clone
(`git status --porcelain` → 0 lines).

## Verdict

**The entry's substance holds; five of its claims about *itself* do not.** All 22 double-quoted spans locate in the `-11`
bytes under whitespace collapse (0 misses), the four-class ordering is a faithful test-order construction from the draft's
own stability distinction, every named parameter (`q`, `qu`, `w`, `pk`, `r`, `t`) is right including the REQUIRED/OPTIONAL
split and the `requests` default, the `-10`→`-11` change of `t` from the **Reset Parameter** (seconds until *additional*
quota) to the **effective window** (seconds within which the current quota must be used) is exactly as stated, "no
epoch-reset field" is true of the draft's own syntax, the 24 November 2026 expiry is in the fetched bytes, the I-D
boilerplate reading is fair, and the entry claims **no measurement** and makes **no approval-table change** (diff empty).
What fails is the bookkeeping around the claims: the `ground:` line puts the 429/403 status class in a file that contains
neither code (grep rc=1); the §2 `Service Limit` definition is quoted with a period the source does not have, cutting off
the effective-window half that is class 2's own subject; four of the 22 quoted spans come from sections (`§2`, `§8.1`,
Status of This Memo) the `source:` line does not name; a 180-day recheck is scheduled 151 days past the 29-day expiry the
entry itself records; the "two package sentences that survived" count is one short; and the w1 evidence path the entry
points at for the `-09`/`-10` bytes does not exist at REV (it lands one commit later, at `af0664e`). Severity is low
throughout — no quote is fabricated, no measurement is claimed — but D1 and D7 are the two a canonical judge should not
wave through, because they are *false provenance*, the failure class this lane keeps re-learning.

## Sentence → verdict table

Columns: entry line | claim (abbreviated) | verdict | evidence. `S116:n` = line in the fetched `-11` bytes; `-10:n` = line
in `.ufo/waves/round-30/w1/ScribeEntryRateLimitFields/bytes/ratelimit-headers-10.txt` (same bytes at `af0664e`).

| entry | claim | verdict | evidence |
|---|---|---|---|
| 1 | title: published quota fields a record classifies against | **supported** | S116:302 §3, S116:432 §4: two fields, policy vs service limit |
| 3 | URL + 67097 B + sha256 `d6016dd0…` | **supported** | `sha256sum` on the committed blob; matches receipt `corpus/evidence/round-30/frontier/S116.json` |
| 3 | section list `§3–§3.2, §4–§4.2, §5.1–§5.3, §6, §7, Appendix A, FAQ` | **defect D3** | 4/22 quoted spans are from §2 (S116:289, S116:293), §8.1 (S116:816) and Status of This Memo (S116:63) — none named; `quote-map.tsv` |
| 4 | `verified-at: 2026-10-26 — round 30` | **supported** | both receipts dated 2026-10-26 (06:39:52Z / 06:40:26Z) |
| 5, 88-89 | `recheck: 180d` | **defect D4** | 2026-10-26 + 180d = 2027-04-24; the draft expires 2026-11-24 (S116:8, 56, 66) — 29 days out |
| 6 | `frontier: rate-tos-signal` | **supported** | tag present; S117 entry carries the same tag |
| 7 | ground: two fields "on top of the 429/403 status class and RFC 9110 `Retry-After` already held in `redirect-and-retry-after-semantics.md`" | **defect D1** (Retry-After half holds, 429/403 half false) | `grep -nE '\b429\b\|\b403\b' corpus/knowledge/redirect-and-retry-after-semantics.md` → **rc=1** (57-line file: 301/302/303/307/308 + Retry-After §10.2.3 only). The 429/403 class is held at `interaction-approval-table.md:62` (C6, "429s") and `external-class-fixture-v2.md` (24 hits), not there |
| 9-12 | "no host was queried for these fields this round and no browser ran" | **supported** (narrow wording note) | no receipt anywhere in the round shows a host emitting `RateLimit`/`RateLimit-Policy`; the only round-30 host reads are the spec text itself and Discord docs (S117). "for these fields" must be read as *observed in a response*, since www.ietf.org *was* fetched this round |
| 16-19 | `RateLimit-Policy` = list of quota-policy items; `q` required quota in quota units, `qu` unit (`requests` default), `w` a window, `pk` partition key | **supported** | S116:304-306 non-empty List[SF]; S116:340-342 `q` REQUIRED; S116:344-346 `qu` OPTIONAL, "default quota unit is `requests`"; S116:348-350 `w`, `pk` OPTIONAL |
| 19-20 | "stable half"; `SHOULD remain consistent` | **supported** | S116:307-309, exact sentence |
| 21-24 | contrast quote + "enables clients to control their own flow…" | **supported** (but see D5) | S116:309-311, S116:311-313 |
| 26-31 | `RateLimit` = "List[SF] of Service Limit Items"; `r` available quota, `t` effective window, optional `pk` | **supported** | S116:438; S116:461-463 `r` REQUIRED; S116:464-466 `t` OPTIONAL; S116:468-470 `pk` |
| 33-34 | "A service limit is the currently available quota under a specific quota policy" | **defect D2** (truncated, period fabricated) | S116:293-296 continues "**and, if defined, the effective time window within which the client can use no more than the available quota.**" — the dropped clause is class 2's subject (`t`) |
| 34 | "Neither field is a promise" | **supported** | S116:240-242 ("Conveyed quota hints do not imply any service guarantee"), S116:482-486 |
| 35-37 | positive quota ≠ guarantee; low `r` ⇒ "may soon throttle" | **supported** | S116:482-486, exact |
| 38-39 | "fully restored after the time indicated by the effective window" | **supported** | S116:512-513, exact |
| 43 | "Four classes, in the order a receipt should test them" | **opinion** (unmarked) | no source sentence orders them; it is the entry's design ordering (policy → budget → status → Retry-After), consistent with §3's stability contrast |
| 45-49 | class 1 policy present, states quota not outcome, details "informative and MAY be ignored", need not be published | **supported** | S116:722-723; S116:289-290 ("not required to be") |
| 50-52 | class 2: `r`,`t`; small `r` predicts, does not report throttling | **supported** | S116:461-466, S116:482-486 |
| 53 | "Status code — 429, or 403, or 503." | **changed** (synthesis, not a draft sentence) | the draft never enumerates a three-code set: 429/403 from Appendix A (S116:1184-1186) + FAQ (S116:1633-1635), 503 from the §5.2 problem-type *example* (S116:586-591); S116:623-626 explicitly declines any mandated correlation |
| 53-55 | fields do not imply a status | **supported** | S116:623-625, exact |
| 55 | "Nor does a 429 imply the fields" | **supported** (by absence) | S116:623-626, S116:679-680; FAQ Q2 (S116:1619-1629) says the fields *may* be used with 429, never that they accompany it |
| 56-57 | appendix: quota refusals "replying instead with a 4xx … (e.g. 429 or 403)" | **supported** | S116:1184-1186, exact |
| 57 | "§5.2 pairs a temporary capacity reduction with 503" | **supported** | S116:574 heading, S116:586-591 (`HTTP/1.1 503 Server Unavailable`, `temporary-reduced-capacity`) |
| 58-60 | FAQ quote (429 an example among several) | **supported** | S116:1631-1635 (Q3, RFC 6585), exact |
| 61-64 | `Retry-After` older field wins; "MUST take precedence and the effective window MAY be ignored" | **supported** | S116:733-735, exact |
| 64-65 | "records `t` as the wait … records the wrong number" | **changed D6** | "MAY be ignored" is permissive, and S116:640-642 says Retry-After SHOULD NOT be earlier than the effective window's end — i.e. the two normally agree; what precedence decides is *which field is authoritative*, not that the number is wrong. Also L85-86's "reset instant" contradicts L82's own "seconds until…" |
| 67-72 | three absences: not every response, no set predictability, malformed ignored | **supported** | S116:679-680 (§6.2), S116:708-710 (§7), S116:712 (§7) |
| 76 | "No measurement, and no known publisher in this lane" | **supported** | `grep -rn 'RateLimit-Policy' corpus/knowledge/` outside this entry → only the S117 cross-reference (`host-published-rate-limit-headers.md:135`); no lane entry reports a host emitting these fields |
| 77-79 | S117 covers one vendor's `X-RateLimit-*`, "not this draft's syntax" | **supported** | S117 §1 header table (`X-RateLimit-Limit/Remaining/Reset/…`), §6 maps them as *analogues* |
| 78-80 | draft does not require emission ⇒ absence ≠ no quota | **supported** | S116:289-290, S116:679-680 |
| 81-84 | `t` = Reset Parameter in `-10` §4.1.2, effective window in `-11` §4.1.2 | **supported** | `-10:479-482` "4.1.2. Reset Parameter / … number of seconds until additional quota … is made available"; `-10:456-457` "time until additional quota is made available"; S116:488-492 effective window |
| 84-85 | "`t=30` parses identically under both" | **supported** | identical example shape `-10:521` vs `S116:530` |
| 86-88 | all three revisions fetched this round; `-09` 67876, `-10` 67803, `-11` 67097 | **supported at `af0664e`, not verifiable at REV** (D7) | `af0664e` blobs: e088940d…/67876, f40a2411…/67803, d6016dd0…/67097; at `072af95` the path is absent (`git cat-file -e` → rc=128; `ls-tree 072af95 -- .ufo/waves/round-30` → 30 paths, none in `w1`) |
| 88-89 | "the bytes are kept beside this draft" | **defect D7** (pointer only resolves post-REV) | same; the pointer is `.ufo/waves/round-30/w1/ScribeEntryRateLimitFields/` (L119-120) |
| 90-92 | expiry 24 November 2026 | **supported** | S116:8, S116:56, S116:66 |
| 91-93 | Status of This Memo quote + boilerplate reading | **supported** | S116:63-65 ("…or to cite them other than as \"work in progress.\"") |
| 93-95 | "re-locatable only in the fetched revision" | **supported** | revision id in S116:15 |
| 96-97 | `t` delay-seconds-shaped; no epoch-reset field | **supported** | S116:490-492 ("non-negative Integer compatible with the delay-seconds rule"); no reset/epoch member in §3.1/§4.1 (grep: "reset" only as prose S116:880, 1210 and as non-standard `X-RateLimit-Reset`, S116:1766, 1804) |
| 97-98 | absolute-epoch host set needs a named translation | **opinion** (defensible) | Appendix A names the epoch form S116:1766; FAQ Q5 (S116:1649-1662) is why the draft refuses timestamps |
| 99-100 | "This specification does not prevent clients from making requests." | **supported** | S116:816 (§8.1) |
| 100-102 | C6 gate still decides; `r=0` ≠ a refusal | **supported** | `interaction-approval-table.md:62` (C6 row); S116:623-626 |
| 106-108 | package path, staged S159, anchored `-09`, fetched 2026-10-23 | **supported** | package `source:` line (read-only): "S159 … -09.txt — §3 (line 301) and the examples at lines 322 and 409 — draft-09 fetched 2026-10-23" |
| 108-109 | package header claimed `-10 and later currently return 404 (not run in this round)` | **supported** (verbatim) | package `recheck:` line, word for word |
| 109-112 | premise stale: `-09` 200/67876, `-10` 200/67803, `-11` 200/67097, `-12` 404 | **supported at `af0664e`** (D7 applies) | `fetch-receipts.json` at `af0664e`: 200/67876, 200/67803, 200/67097, 404/77297 |
| 112-114 | datatracker page 06:40:06Z, dynamic render, sha differs across two same-day fetches, links only `-11`'s `.txt` | **supported** | two 114084-byte copies: `00871dc8…` (this seat) vs `e819780c…` (CritPackageStaleClaims); grep of the page → exactly one `/archive/id/…-11.txt` link, revisions `-00…-03, -07, -08, -11` named elsewhere |
| 114-116 | re-grounded against `-11`, renumbered S159 → S116; anchors 301/322/409 dropped; "the two examples … sit at 323 and 417" | **supported** | `-09:301` = §3 heading, `-09:322` = burst/daily example, `-09:409` = `"default";q=100;w=10`; in `-11` those examples are S116:323 and S116:417. (The 301 header's own new address, S116:302, is unstated but is in the SOURCES row) |
| 116-118 | "The two package sentences that survived re-location are at lines 308-309 and 309-311 … every other sentence was rewritten" | **defect D5** | the package retains **three** quoted clauses; the third — "enables clients to control their own flow of requests based on policy information provided by the server" — survives verbatim in the entry (entry:23-24 = S116:311-313) and is not counted. The two counted spans are wider than the package's fragments (it quotes from "SHOULD…" and "contains…"), so "the two package sentences" matches neither count |
| 119-120 | "Quote-to-line table and all three revisions' bytes: `.ufo/waves/round-30/w1/ScribeEntryRateLimitFields/`" | **defect D7** | absent at REV (rc=128); present at `af0664e` |
| 120-121 | "S118 stays reserved for the S044 superseding row" | **supported** | `SOURCES.md:132` S118 row contains "supersedes S044 — the invocationId the panel keeps …" |

## Findings, severities, smallest safe correction

**D1 — ground line mis-attributes the 429/403 status class. (defect, low-medium; calibration / adjacency)**
`corpus/knowledge/rate-limit-policy-fields.md:7` says the entry sits "on top of the 429/403 status class and RFC 9110
`Retry-After` already held in `corpus/knowledge/redirect-and-retry-after-semantics.md`". That file holds Retry-After
(§10.2.3, `:41-43`) and the redirect codes, and **no 429 and no 403 anywhere** (`grep -nE '\b429\b|\b403\b'` → rc=1).
The status class is held at `interaction-approval-table.md:62` (C6: "request budgets, 429s, ToS rate terms"),
`external-class-fixture-v2.md` (429+`Retry-After`, 403 instruments; 24 hits) and `layer-routing-synthesis.md:85` (RT15).
Correction: restrict the clause to `Retry-After`, or name the C6 row + fixture as the holders of the status class.

**D2 — §2 `Service Limit` quoted with a fabricated sentence boundary. (defect, low; quote integrity)**
Entry:33-34 closes the quote with a period after "…under a specific quota policy". S116:293-296 has no boundary there; it
continues "and, if defined, the effective time window within which the client can use no more than the available quota."
The omitted half is the `t` half that class 2 (entry:50-52) is about, so the truncation hides the term's second component
while the gloss ("a quantity, not an outcome") reads as the whole definition. QUALITY 74's "never a span assembled across a
boundary the source does not carry" is not tripped (the kept bytes are contiguous), but the presented boundary is invented.
Correction: extend to S116:296 or mark the omission.

**D3 — `source:` section list omits 4 of 22 quoted spans' sections. (defect, low; provenance completeness)**
Sections actually quoted: §2 (S116:289, 293), §3, §4, §4.1, §4.1.1, §4.1.2, §6, §6.2, §7, Appendix A, FAQ, **§8.1
(S116:816)**, **Status of This Memo (S116:63)**. Declared: `§3–§3.2, §4–§4.2, §5.1–§5.3, §6, §7, Appendix A, FAQ`. A
rechecker following the declared list cannot re-locate the service-limit definition, the "quota policies can be advertised"
sentence, the "does not prevent clients" sentence, or the boilerplate quote. Correction: add `§2, §8.1, Status of This Memo`.

**D4 — 180-day recheck runs 151 days past the draft's own expiry, and past its own staleness evidence. (defect, low-medium; freshness)**
`recheck: 180d` from 2026-10-26 → 2027-04-24. The fetched `-11` expires 2026-11-24 (S116:8, 56, 66; I-Ds are "valid for a
maximum of six months", S116:61-62) — 29 days out. The entry's own Adopted-from paragraph documents a 180-day recheck
(staged 2026-10-23) whose premise failed within **three** days (2026-10-26), and its L88-89 justification ("this is why the
recheck is not longer than 180d") is about the `t` wording change, not about expiry. Correction: `recheck: on release of
-12/-13, or by 2026-11-24` (the convention another lane entry already uses: "on-release for S102 … -13 has Expires 18 May
2024").

**D5 — "the two package sentences that survived" is one short. (defect, low; assimilation accounting)**
Three package quoted clauses survive: `SHOULD remain consistent over a sequence of HTTP responses`, `contains information
that MAY change on every request`, and `enables clients to control their own flow of requests based on policy information
provided by the server`. The third is verbatim in the entry (entry:23-24) and sits at S116:311-313; the entry counts only
the first two (as S116:308-309 and 309-311), and those two are *wider* than the package's fragments. Correction: say
"three quoted clauses survive (S116:308-309, 309-311, 311-313); the first two were widened to their full sentences".

**D6 — "records the wrong number" overstates a MAY. (changed, low; calibration)**
`"…the effective window MAY be ignored"` (S116:734-735) is a permission, and S116:640-642 adds that Retry-After SHOULD NOT
reference a time earlier than the effective window's end — so the two numbers normally agree and what precedence settles is
which field is authoritative. Line 85-86 ("stored `t` as a reset instant") also contradicts line 82's own "seconds until
further quota is made available" (`-10:479-482`, a delay, not an instant). Correction: "records the wrong field for the
wait"; drop "instant".

**D7 — the evidence pointer for the `-09`/`-10` byte claims is not in REV. (defect, low-medium; provenance / revision identity)**
Entry:86-88 and 119-120 send the rechecker to `.ufo/waves/round-30/w1/ScribeEntryRateLimitFields/`. At REV `072af95`
that path does not exist: `git cat-file -e 072af95:…/ratelimit-headers-10.txt` → `fatal: path … exists on disk, but not in
'072af95…'` (rc=128); `git ls-tree -r 072af95 -- .ufo/waves/round-30` has 30 paths, none under `w1`. The bytes and the
receipts land in `af0664e` (lane HEAD), where they check out exactly (67876/67803/67097; receipts 200/200/200 and 404).
So at the revision under review, the only independently-backed revision is `-11` (S116's own receipt + refetch); the
`-10` comparison — the entry's one genuinely new claim, the `t` semantic change — rests on bytes committed *after* REV.
Presence on disk in the lane working tree is not a receipt at REV. Correction: cite the landing commit alongside the path,
or move the `-09`/`-10` bytes and their receipts under `corpus/evidence/round-30/frontier/` in the same commit as the entry.

## What the entry claims about measurement, and about the approval table

- **Nothing measured.** The three measurement-adjacent sentences (L9-11, L76) assert the *absence* of measurement, and no
  other sentence reports a host response. No round-30 receipt shows any host emitting `RateLimit` or `RateLimit-Policy`;
  the only host reads are the spec text and the Discord developer docs (S117). The entry is correctly tiered as
  documented-upstream. (Its `host-published-rate-limit-headers.md` sibling carries an explicit `tier:` line; this entry
  states the same thing in bold prose instead — three of 49 knowledge entries use `tier:`, so this is not a violation,
  just an inconsistency worth knowing.)
- **No approval-table change.** `git diff --stat f7c0317..072af95 -- corpus/knowledge/interaction-approval-table.md`
  → 0 lines. The entry only *references* C6 (`interaction-approval-table.md:62`), which exists and says what the entry
  attributes to it.

## Method and what was not run

- 22/22 quoted spans located in S116 bytes by whitespace-collapsed substring search; each mapped to its S116 line and
  enclosing section (`quote-map.tsv` in this seat's output dir).
- Every claim sentence read against the bytes, not against the entry. The `-10` comparison read directly from the `-10`
  file; the `-09` anchors read directly from the `-09` file; the package read read-only from `shokuknow`.
- **Not run (not this seat):** `check-gate-mutants`, `check-frontier-admission`, `check-selfassessment`, `check-gate-registry`,
  `check-release-pins`, `check-s106-evidence`, `sources-census.sh`. No builds, linters or formatters of the lane. No network
  fetches this seat (all bytes local; no fetch receipt to record). No tools installed or upgraded.

## Commands and exit codes

Full log: `commands.txt` beside this report. Highlights:

```
git -C "$C" rev-parse HEAD                                        -> 072af95fe2822f0785a6ff88a578e2142dd258e5   (rc 0)
git -C "$C" status --porcelain | wc -l                            -> 0                                          (rc 0)
sha256sum corpus/evidence/round-30/frontier/bytes/S116.txt        -> d6016dd0…d412  67097 B                    (rc 0)
grep -nE '\b429\b|\b403\b' corpus/knowledge/redirect-and-retry-after-semantics.md   -> (no output)             (rc 1)  [D1]
grep -c '429' corpus/knowledge/interaction-approval-table.md corpus/knowledge/external-class-fixture-v2.md -> 2, 24 (rc 0)
awk 'NR>=293&&NR<=296' S116.txt                                   -> definition continues past the quoted clause (rc 0)  [D2]
python3 2026-10-26 + 180d                                          -> 2027-04-24; expiry 2026-11-24; 29 days     (rc 0)  [D4]
git cat-file -e 072af95:.ufo/waves/round-30/w1/ScribeEntryRateLimitFields/bytes/ratelimit-headers-10.txt -> absent (rc 128)  [D7]
git cat-file -s af0664e:.ufo/waves/round-30/w1/ScribeEntryRateLimitFields/bytes/ratelimit-headers-{09,10,11}.txt -> 67876, 67803, 67097 (rc 0)
git -C "$C" diff --stat f7c0317..072af95 -- corpus/knowledge/interaction-approval-table.md | wc -l -> 0        (rc 0)
```

## Impacted axes

`calibration` (D1, D4, D6), `freshness` (D4), `depth` (D2, D5), `adjacency`/provenance (D1, D3, D7). `operability` and
`coverage` untouched by this entry — it admits nothing and changes no gate.
