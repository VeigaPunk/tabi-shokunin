# CritC2Fabrication — C2 refetch independence and provenance (round 30, w2)

Seat: `CritC2Fabrication`. Milestone: C2. Lane tip measured: `072af95fe2822f0785a6ff88a578e2142dd258e5`
(clean `--shared` clone, `git status --porcelain | wc -l` → 0). Baseline `f7c0317e…`; claims frozen at
`061e62024c0523d3c6c7e819506a773ff2cd7d75` (`.ufo/waves/round-30/claims.json`, read first).

**Verdict.** I attacked the provenance of the two committed refetch records
`corpus/evidence/round-30/frontier/refetch/S116.json` and `S117.json` — whether they record genuine,
independent fetches by a different seat, whether their bytes were copied from the receipt fetcher, and
whether the S116 record is a faithful transcription of `ScribeEntryRateLimitFields`' own fetch. **Holds**
for C2's frozen predicate at `072af95`: both records are field-faithful to independently logged fetches by
seats other than their receipt's `fetched_by`; every recorded digest and byte count matches the committed
bytes; my own live GET today reproduces the S116 digest exactly; and S117's refetch is provably a distinct
origin-server response — its Cloudflare per-request nonce decodes to `2026-10-26T06:40:32Z`, the exact
second the record claims, under a different `cf-ray` than the receipt. One **low-severity provenance
defect** survives: the S116 "refetch" is the *entry author's own authoring fetch*, relabelled by the L1;
that seat's report explicitly says it "cannot supply an independent refetch and did not fabricate one", so
the record's independence is only independence from `FetchS159`, not from the seat that wrote the entry —
and because the immutable `ietf.org/archive` `.txt` is byte-stable, the committed refetch bytes are literally
the receipt blob, so nothing in the committed tree distinguishes that record from a copy (mutations M1/M2
pass; M3 shows the gate's seat check is a label test only). No fabricated bytes, digests or timestamps found.

## 1. What was attacked (axes)

- **Provenance fidelity** — does each refetch JSON agree, field for field, with the seat's own log and bytes?
- **Temporal independence** — is the refetch a response produced after (and separately from) the receipt?
- **Byte origin** — could the refetch bytes have been copied from the receipt fetcher?
- **Role honesty** — is the seat that the record names actually the seat that made the fetch, in the role
  the record implies?

## 2. Evidence

### 2.1 S116 refetch is a faithful transcription (field for field)

```
$ python3 - <<'EOF'   # compare lane refetch/S116.json with the seat's own fetch-receipts.json (-11 entry)
...
EOF
seat entry : {'file': 'bytes/ratelimit-headers-11.txt', 'url': 'https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt', 'utc': '2026-10-26T06:40:26Z', 'http_status': 200, 'bytes': 67097, 'sha256': 'd6016dd0…d412'}
lane refetch: {'id': 'S116', 'seat': 'ScribeEntryRateLimitFields', 'fetched_at': '2026-10-26T06:40:26Z', 'http_status': 200, 'bytes_path': 'corpus/evidence/round-30/frontier/refetch/bytes/S116.txt', 'sha256': 'd6016dd0…d412', 'byte_count': 67097}
url equal: True   time equal: True   status equal: True   bytes equal: True   sha equal: True      # exit 0
```

The same fetch is also recorded in that seat's own report
(`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w1/ScribeEntryRateLimitFields.md`:
"`draft-ietf-httpapi-ratelimit-headers-11` (67097 bytes, sha256 `d6016dd0…d412`, fetched
2026-10-26T06:40:26Z)"), and its bytes are committed at
`…/w1/ScribeEntryRateLimitFields/bytes/ratelimit-headers-11.txt`. So the L1's JSON is a faithful
transcription, not an invented record: every field is corroborated by a seat artifact committed in
`af0664e`.

`S117.json` is stronger still: it is the seat's own file, byte-identical.

```
$ sha256sum corpus/evidence/round-30/frontier/refetch/S117.json …/w1/ScribeEntryDiscordHeaders/receipts/S117.refetch.json
26c5a4c13e2260f4c8da5d4ea6095a3ec11d213ca536410838ad43c8a929f28b  (both paths)
$ diff -u … && echo S117_JSON_IDENTICAL        -> S117_JSON_IDENTICAL       # exit 0
```

The S116 record, by contrast, has no seat-authored counterpart anywhere in `w1/`
(`grep -rl '"seat": "ScribeEntryRateLimitFields"' .ufo/waves/round-30/w1/` returns only the seat's
`fetch-receipts.json`). It was authored by the L1, as the ticket states.

### 2.2 Digests and byte counts of the committed refetch bytes

```
$ sha256sum corpus/evidence/round-30/frontier/refetch/bytes/S116.txt \
            corpus/evidence/round-30/frontier/refetch/bytes/S117-refetch.html
d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412  S116.txt          (67097 B)
c1c2d3f9d619c9397070bb93bf8595ea51f655b687e345654f4292cfbfd4b2f3  S117-refetch.html (408912 B)
```

Both equal their `sha256`/`byte_count` fields. S117's refetch bytes equal the seat's own
`bytes/S117-refetch.html` and `fetch/raw-064032Z.html` (`cmp` exit 0); S116's refetch bytes equal the
seat's `bytes/ratelimit-headers-11.txt` and `FetchS159/bytes/S116.txt` — all three are the same immutable
archive file, so identical content is expected and proves nothing about origin by itself.

```
$ cmp refetch/bytes/S116.txt w1/ScribeEntryRateLimitFields/bytes/ratelimit-headers-11.txt   -> exit 0
$ cmp refetch/bytes/S116.txt w1/FetchS159/bytes/S116.txt                                    -> exit 0
$ git rev-parse 38891ca:…/bytes/S116.txt 38891ca:…/refetch/bytes/S116.txt
c9fd2892613199538aba6daeb455672bc98c5064  c9fd2892613199538aba6daeb455672bc98c5064   # same blob
```

### 2.3 S117: the refetch is a distinct origin-server response (decisive)

The receipt and refetch raws differ at only 11 byte positions, all inside the one Cloudflare
`__CF$cv$params` nonce at the end of the document:

```
$ cmp -l bytes/S117.html refetch/bytes/S117-refetch.html | wc -l      -> 11   (offsets 408145-408155)
$ python3 .ufo/waves/round-30/w2/CritC2Fabrication/nonce-check.py     -> exit 0
receipt (FetchS182, claimed 06:40:02Z)                     nonce_t=1792996802 2026-10-26T06:40:02Z  ray=a507779d197145a6
refetch (ScribeEntryDiscordHeaders, claimed 06:40:32Z)     nonce_t=1792996832 2026-10-26T06:40:32Z  ray=a507785b992f772a
seat live-verify (claimed 06:46:37Z)                       nonce_t=1792997197 2026-10-26T06:46:37Z  ray=a5078142f821b2b4
ScribeQuoteGrounding fetchA (claimed 06:41:18Z)            nonce_t=1792996878 2026-10-26T06:41:18Z  ray=a507797ba90adf36
ScribeQuoteGrounding fetchB (claimed 06:42:50Z)            nonce_t=1792996970 2026-10-26T06:42:50Z  ray=a5077bbafe88e0e5
CritC2Fabrication live (mine, 07:40:49Z)                   nonce_t=1793000449 2026-10-26T07:40:49Z  ray=a507d0a9ac0d6479
```

Each byte set's server-issued nonce timestamp equals its claimed UTC second to the second, and the ray
ids are distinct. A copy of FetchS182's file would carry `1792996802`/`a507779d…`; the committed refetch
carries `1792996832`/`a507785b…`. The refetch bytes were not copied from the receipt fetcher.

Normalisation (counter's own `normalise()`, extracted verbatim, 831-char snippet from
`scripts/check-frontier-admission.mjs`):

```
$ node .ufo/waves/round-30/w2/CritC2Fabrication/normcheck.mjs      -> exit 0
receipt chars 8728 sha c719ecca…4007 | refetch chars 8728 sha c719ecca…4007 | live chars 8728 sha c719ecca…4007
receipt==refetch true   receipt==live true   has_quote true ×3
```

### 2.4 S116: no server-side timestamp exists for the refetch

The archive `.txt` carries no nonce and the seat captured no response headers for it
(`ls …/ScribeEntryRateLimitFields/` → `bytes/`, `tools/`, `fetch-receipts.json`, `sha256.txt`, reports; no
`.hdr`; the sentinel, by contrast, did capture `date:`/`cf-ray` for its own `-11` GET at 06:43:54Z). What
corroborates the S116 fetch is therefore indirect but consistent:

- the seat ran its **own HTTP client**: its datatracker page render is `00871dc8…`, distinct from
  `FetchS159/5ead50d0…`, `CritPackageStaleClaims/e819780c…` and `SentinelFetchScope/5c44b1a7…` — four
  different renders of a dynamic page, i.e. four different clients;
- the static archive shas agree across all four seats (`d6016dd0…` fetched at 06:39:52Z, 06:40:26Z,
  06:40:40Z, 06:43:54Z) — exactly the signature of independent GETs of an immutable object;
- my own live GET today reproduces the digest, so the committed refetch content is the real document:

```
$ curl -sS -L --max-time 60 -o …/live/S116-live-11.txt -w 'HTTP %{http_code} bytes %{size_download}' https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt
HTTP 200 bytes 67097     (exit 0, 2026-10-26T07:40:49Z)
$ sha256sum …/live/S116-live-11.txt -> d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412
$ cmp …/live/S116-live-11.txt corpus/evidence/round-30/frontier/refetch/bytes/S116.txt   -> LIVE_EQ_REFETCH_S116 (exit 0)
```

Limitation stated plainly: the `06:40:26Z` timestamp and the fact of that one GET are self-reported by the
seat; no server-issued artifact attests them, unlike S117.

### 2.5 Role honesty: the S116 refetch is the entry author's authoring fetch

`ScribeEntryRateLimitFields` is the seat that wrote `corpus/knowledge/rate-limit-policy-fields.md`, and its
report's handoff says verbatim:

> **`g7-refetch` must be written by another seat**; this seat cannot supply an independent refetch and did
> not fabricate one.

Its own `receipt-s116.json` also books that same `06:40:26Z` fetch as *its* receipt (`fetched_by:
ScribeEntryRateLimitFields`, bytes path in its own output dir). The lane did not adopt that receipt (it
used `FetchS159`'s earlier `06:39:52Z` fetch), so the author's fetch appears exactly once, as the refetch.
Chronologically this is a genuine second fetch by a different seat than `FetchS159` — the frozen predicate's
condition. Wave 1 had proposed something stronger: `ConnSeparability.md` §5 says "every seat that touched
S116 explicitly declined to write it … `refetch/S116.json` by seat `ConnSeparability` over a fresh
byte-identical `-11` fetch", and `SentinelFetchScope` independently fetched the same URL at `06:43:54Z`
(sha `d6016dd0…`, recorded only as a note). The integrated lane used neither; it relabelled the author's
fetch. `corpus/lessons/round-30.md:15,24-26` states only the accurate narrow fact ("a different seat than
the receipt's `fetched_by`; S116 refetch bytes byte-identical"), so no lane text is false — the weakness is
in what a reader may infer from the word "refetch".

### 2.6 The counter cannot distinguish any of this (mutations at 072af95)

Frozen counter, clean clone, `--rev` reading git blobs, so mutations only affect the `HEAD` runs:

```
$ TMPDIR=$S/tmp node scripts/check-frontier-admission.mjs --rev 072af95… --frontier rate-tos-signal --since 2026-10-26 --json
exit=0  {"population":2,"admitted":2,"failing":0}
$ … --live --json
exit=0  {"population":2,"admitted":2,"failing":0,"clean":true}

M1  refetch/S116.json .seat := "FabricatedSeatNoSuchAgent"                    exit=0  admitted 2
M2  M1 + .bytes_path := corpus/evidence/round-30/frontier/bytes/S116.txt      exit=0  admitted 2
M3  refetch/S117.json .seat := "FetchS182" (== receipt fetched_by)            exit=1  admitted 1 (g7-refetch S117)
```

M1/M2 confirm wave-1's F7/J5 finding against the *actual* S116 artifacts: `g7` (counter lines 213-219)
tests only `rf.id === id`, `rf.seat !== rc.fetched_by`, `rf.http_status === 200`,
`sha256(rfBytes) === rf.sha256`, quote located — so a record naming a non-existent seat over the receipt's
own bytes passes. Independence is not measurable from committed bytes. M3 shows the seat test is live but
is a label test. This is frozen-counter semantics (routed by w1 `CritC2Counter` F7 and `CritClaimSizing`
J5), not a repair I may make.

## 3. Findings

| # | Finding | Severity | Evidence |
|---|---|---|---|
| F1 | **S117 refetch is genuine and independent.** Distinct server response, nonce second matches the record and the seat's log, distinct ray, seat's own JSON committed verbatim. | holds | §2.1, §2.3 |
| F2 | **S116 refetch is faithful but not independent of the entry author.** The record transcribes a real fetch by `ScribeEntryRateLimitFields` exactly, but that seat both wrote the entry and declared it "cannot supply an independent refetch"; independence holds only against `FetchS159`. | defect, low (provenance/role; no predicate impact) | §2.1, §2.5 |
| F3 | **S116 refetch bytes are indistinguishable from the receipt's** (same git blob, immutable URL). Copy vs. refetch is decidable only from the seat's external log, and the counter cannot decide it at all. | defect, low (evidence strength; counter limitation already routed) | §2.2, §2.6 |
| F4 | Schema asymmetry: `refetch/S116.json` has no `quote` field, `S117.json` does. The counter never reads it, so no gate effect. | note | §2.1, counter lines 213-219 |

Impacted axes: **coverage** (C2's own axis) is unaffected — admitted 2 at `072af95`, offline and live, on
my run; the finding is about how strong that admission's evidence is, not whether it holds. Operability,
freshness, depth, calibration, adjacency: no change (nothing outside `corpus/evidence/round-30/frontier/`
was written by the round; no counter or script touched).

Smallest safe correction (not applied, attack seat):
1. Amend the note in `corpus/evidence/round-30/frontier/refetch/S116.json` (or the lesson's S116 row) to
   say the refetch is the entry author's parallel authoring fetch at the same minute, independent of
   `FetchS159` but not of the authoring seat — no predicate change, and it removes the only inference the
   current text invites.
2. Alternatively (stronger, more work) record `SentinelFetchScope`'s `06:43:54Z` fetch of the same URL
   (`d6016dd0…`, headers captured with `date:`/`cf-ray`) as the S116 refetch, or `ConnSeparability`'s
   proposed fresh fetch; either is independent of the entry author.
3. Leave the counter alone this round: `rf.url === rc.url` / equal-normalised-text (w1 F7's fix) is a
   counter change, and C1/C2's frozen bytes forbid it here.

## 4. Honesty, hygiene, tooling

- Commands and exit codes are pasted above; every counter run was against git blobs at
  `072af95fe2822f0785a6ff88a578e2142dd258e5` in a clean `--shared` clone (`--rev` pinned), mutations
  committed only inside that clone (`git -C … rev-parse --show-toplevel` = the clone; `-c user.name=…`).
- Not run: any lane build/test/lint (forbidden); the seat-level fetch of `06:40:26Z` cannot be re-run
  retrospectively — I did not pretend to.
- Network: four read-only HTTPS GETs total — two explicit (`…/live/`, recorded in
  `fetch-receipts.json`: 200/67097/`d6016dd0…` and 200/408912/`814d2d82…`, both at 07:40:49Z, curl exit 0)
  and two made by the counter's `--live` path over the same two URLs (bytes not logged by the frozen
  counter). No cookies, credentials, API calls or session material.
- Tooling: **none installed or upgraded** (node v24.21.0, python 3.14.8, curl 8.23.0, git 2.56.0 already
  present). Scratch `/fast/scratch/hyaku/tabi-r30/CritC2Fabrication/` removed after copying receipts.
- Output dir `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w2/CritC2Fabrication/`:
  `counter-offline-072af95.json`, `counter-live-072af95.json`, `mutation-M{1,2,3}-*.json`,
  `fetch-receipts.json`, `nonce-check.py`/`.out`, `normcheck.mjs`, `normslice.mjs`, `live/` (my two GETs).
  The lane checkout was not edited; `git status --porcelain` in the lane shows only untracked w2/measure
  files owned by other seats.
