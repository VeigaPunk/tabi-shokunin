# ExecSentence — three-site sentence identity receipt (round 43, wave 1)

Seat: `ExecSentence` · Lane: tabi · Axis judged: **calibration**
Milestone: three-site sentence identity receipt for C1 and C2.
Frozen commit: `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` · Baseline: `ab592825cd195599822ca227f7768914df208201`

Scope note: this seat produces a **receipt**, not a verdict on the claims. It neither amends the
frozen counter/claims/checker bytes nor proposes an amendment; it measures, hashes and reports the
diff verdict of the predicate sentence at its three declared sites per claim.

---

## 1. Result

**C1 — three sites byte-identical. C2 — three sites byte-identical.** The frozen
`sentenceIdentity` block in `claims.json` (which declares `byteIdentical: true` for both claims)
is **confirmed by measurement**, at the frozen commit, on the bytes the instruments actually load.

| Claim | Site 1 (claims.json) | Site 2 (header `PREDICATE-SENTENCE` comment) | Site 3 (`const PREDICATE`, `\'` unescaped) | Distinct sha256 | Diff verdict |
|---|---|---|---|---|---|
| **C1** | `claims[0].counterPredicate` | `c1-signature-bound-v5.mjs:8` | `c1-signature-bound-v5.mjs:24` | **1** | **IDENTICAL** |
| **C2** | `claims[1].predicate` | `check-routed-defects-round43.mjs:19` | `check-routed-defects-round43.mjs:35` | **1** | **IDENTICAL** |

### The three sha256s per sentence

**C1** — 1343 UTF-8 bytes at every site:
```
9bc9545343000b4806cd9628d97ba63e390fdda64104da62a250a8ea2fe75598  claims.json claims[0].counterPredicate
9bc9545343000b4806cd9628d97ba63e390fdda64104da62a250a8ea2fe75598  c1-signature-bound-v5.mjs header PREDICATE-SENTENCE comment
9bc9545343000b4806cd9628d97ba63e390fdda64104da62a250a8ea2fe75598  c1-signature-bound-v5.mjs const PREDICATE (\' unescaped)
```

**C2** — 1314 UTF-8 bytes at every site:
```
49f7a1e787fd226157c0b9aed72b5d6936dc750392b2f72f4839bb79160cb969  claims.json claims[1].predicate
49f7a1e787fd226157c0b9aed72b5d6936dc750392b2f72f4839bb79160cb969  check-routed-defects-round43.mjs header PREDICATE-SENTENCE comment
49f7a1e787fd226157c0b9aed72b5d6936dc750392b2f72f4839bb79160cb969  check-routed-defects-round43.mjs const PREDICATE (\' unescaped)
```

Full sentence text at each site: `w1/ExecSentence/C1-sentence.txt`, `w1/ExecSentence/C2-sentence.txt`.
Per-site digests and lengths: `w1/ExecSentence/C1-sites.json`, `w1/ExecSentence/C2-sites.json`.
Machine receipt: `w1/ExecSentence/three-site-identity-receipt.json`.

---

## 2. Exact observed commands and output

All commands were run read-only against `/home/vgpnk/Projects/shokunin/tabi-shokunin`; the full
transcript with every `### $` marker and `### exit=` line is `w1/ExecSentence/transcript.txt`
(132 lines, replayable via `w1/ExecSentence/transcript.sh`).

### 2.1 Bytes taken from the frozen commit (not the worktree)

```
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD
ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c

$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin merge-base --is-ancestor 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc HEAD && echo 'freeze is ancestor of HEAD: YES'
freeze is ancestor of HEAD: YES

$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin cat-file -p 7ca6f018...:.ufo/waves/round-43/claims.json > $S/frozen/claims.json
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin cat-file -p 7ca6f018...:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs > $S/frozen/c1-signature-bound-v5.mjs
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin cat-file -p 7ca6f018...:.ufo/waves/round-43/counters/check-routed-defects-round43.mjs > $S/frozen/check-routed-defects-round43.mjs

$ sha256sum $S/frozen/*
290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029  frozen/claims.json
6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c  frozen/c1-signature-bound-v5.mjs
2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743  frozen/check-routed-defects-round43.mjs
```

The worktree copies hash identically to the frozen-commit copies (same three digests above), and
`git log --oneline 7ca6f018..HEAD -- .ufo/waves/round-43/claims.json .ufo/waves/round-43/counters/`
is **empty** — the three files are unchanged between the freeze and HEAD, so the freeze digest and
the bytes the instruments load today are the same bytes.

### 2.2 All six `frozenDigests` re-derive at the frozen commit

```
$ python3 - <<'EOF'   # git cat-file -p <freeze>:<path> | sha256, compared to claims.json frozenDigests
import hashlib,subprocess
c=json.loads(subprocess.run(['git','-C',LANE,'cat-file','-p',FREEZE+':.ufo/waves/round-43/claims.json'],capture_output=True).stdout)
for p,d in c['frozenDigests'].items():
    b=subprocess.run(['git','-C',LANE,'cat-file','-p',FREEZE+':'+p],capture_output=True).stdout
    a=hashlib.sha256(b).hexdigest()
    print(('OK  ' if a==d else 'MISMATCH '), p, d, a)
EOF
OK   scripts/measure-c1-round43.mjs 23afa29d5def9d4043f19e8be020ef0a50b3565f92ee5965facf70c4a95992a0 23afa29d5def9d4043f19e8be020ef0a50b3565f92ee5965facf70c4a95992a0
OK   scripts/playwright-firefox-egress-round43.mjs 3718235934d1fd06ffef2b976cfe09fabdc5af75d295bd78ee4d95b04e487c7e 3718235934d1fd06ffef2b976cfe09fabdc5af75d295bd78ee4d95b04e487c7e
OK   .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs 6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c 6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c
OK   .ufo/waves/round-43/counters/check-routed-defects-round43.mjs 2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743 2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743
OK   .ufo/waves/round-43/fixtures/v0-fabrication.mjs b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c
OK   .ufo/waves/round-43/fixtures/tree-vs-blob.mjs 7407f6cd498362658fb0c78b61698489c373444ff3ce6982824ded877259ab6d 7407f6cd498362658fb0c78b61698489c373444ff3ce6982824ded877259ab6d
```

### 2.3 Extraction (python, independent of the counters)

```
$ python3 $S/extract.py $S/frozen $S/out
[C1] verdict=IDENTICAL distinct_sha256=1
  9bc9545343000b4806cd9628d97ba63e390fdda64104da62a250a8ea2fe75598  claims.json claims[0].counterPredicate  (1343 bytes)
  9bc9545343000b4806cd9628d97ba63e390fdda64104da62a250a8ea2fe75598  c1-signature-bound-v5.mjs header PREDICATE-SENTENCE comment  (1343 bytes)
  9bc9545343000b4806cd9628d97ba63e390fdda64104da62a250a8ea2fe75598  c1-signature-bound-v5.mjs const PREDICATE (\' unescaped)  (1343 bytes)
[C2] verdict=IDENTICAL distinct_sha256=1
  49f7a1e787fd226157c0b9aed72b5d6936dc750392b2f72f4839bb79160cb969  claims.json claims[1].predicate  (1314 bytes)
  49f7a1e787fd226157c0b9aed72b5d6936dc750392b2f72f4839bb79160cb969  check-routed-defects-round43.mjs header PREDICATE-SENTENCE comment  (1314 bytes)
  49f7a1e787fd226157c0b9aed72b5d6936dc750392b2f72f4839bb79160cb969  check-routed-defects-round43.mjs const PREDICATE (\' unescaped)  (1314 bytes)
```

Extraction rules actually applied (see `w1/ExecSentence/extract-three-site-identity.py`):
- claims side: `JSON.parse(claims.json)` → `claims[i].counterPredicate` (C1) / `claims[i].predicate` (C2);
- header side: the **single** line matching `/^\/\/\s*PREDICATE-SENTENCE:\s*(.*)$/`, sentence = group(1);
- const side: `/const\s+PREDICATE\s*=\s*'((?:[^'\\]|\\.)*)'/` with `\'` → `'` unescaped;
- sha256 over the UTF-8 bytes of the extracted sentence.

Site multiplicity was checked before hashing, so a second or third copy of the sentence could not be
silently ignored:
```
$ grep -c 'PREDICATE-SENTENCE' frozen/c1-signature-bound-v5.mjs frozen/check-routed-defects-round43.mjs
frozen/c1-signature-bound-v5.mjs:1
frozen/check-routed-defects-round43.mjs:1
$ grep -c 'const PREDICATE' frozen/c1-signature-bound-v5.mjs frozen/check-routed-defects-round43.mjs
frozen/c1-signature-bound-v5.mjs:1
frozen/check-routed-defects-round43.mjs:1
```
Exactly one header comment and one `const PREDICATE` per instrument; a repo-wide grep for the two
sentence openings finds them only in the two counters, `claims.json`, and wave-43 seat artifacts
(`.ufo/waves/round-43/w1/**`) — no committed fourth copy.

### 2.4 Cross-check 1 — shell-only re-extraction (awk/sed/grep, no python)

```
$ awk '/PREDICATE-SENTENCE:/ {sub(/^[^:]*PREDICATE-SENTENCE: /,""); print; exit}' c1-signature-bound-v5.mjs > sh-c1-header.txt
$ grep -o "const PREDICATE = '.*'" c1-signature-bound-v5.mjs | head -1 | sed "s/^const PREDICATE = '//; s/'$//; s/\\\\'/'/g" > sh-c1-const.txt
$ python3 -c "import json; ... write(c1['counterPredicate'])" > sh-c1-claims.txt
$ sha256sum sh-c1-*.txt
a618794009af6b528b6698db91a2a9372ff8b22f65dcffc25694d77369f22205  sh-c1-claims-predicate.txt   <- claims[0].predicate  (NOT a declared site)
9bc9545343000b4806cd9628d97ba63e390fdda64104da62a250a8ea2fe75598  sh-c1-claims.txt            <- claims[0].counterPredicate
10c958ef3d0280e17b36bcb79894f7f4f90adbf0ea0b2f8010b68d24066d48de  sh-c1-const.txt
10c958ef3d0280e17b36bcb79894f7f4f90adbf0ea0b2f8010b68d24066d48de  sh-c1-header.txt
$ sha256sum sh-c2-*.txt
49f7a1e787fd226157c0b9aed72b5d6936dc750392b2f72f4839bb79160cb969  sh-c2-claims.txt
3252e087bafbbc0b30931d7293f839e02be0abd6b4b8e06afd035aca057f9577  sh-c2-const.txt
3252e087bafbbc0b30931d7293f839e02be0abd6b4b8e06afd035aca057f9577  sh-c2-header.txt
```
Shell header and const digests differ from the python digests **only** because `awk`/`sed` append a
trailing newline (`wc -c` 1344 vs 1343, 1315 vs 1314). Stripping that single trailing newline makes
the shell digests equal the python digests exactly; `cmp` on the newline-stripped files reports no
difference:
```
$ cmp C1-site0.txt C1-site1.txt && echo "site0==site1 OK"   # header vs claims
$ cmp C1-site0.txt C1-site2.txt && echo "site0==site2 OK"   # const  vs claims
[C1] site0==site1 OK ; site0==site2 OK
[C2] site0==site1 OK ; site0==site2 OK
```

### 2.5 Cross-check 2 — the runtime value of `const PREDICATE` under node

`eval()`-ing the extracted literal (not a regex) reproduces the same digests, so the unescaping is
correct and the literal is well-formed JS:
```
$ node $S/out/eval-const.mjs $S/frozen
C1 file=c1-signature-bound-v5.mjs bytes=1343 sha256=9bc9545343000b4806cd9628d97ba63e390fdda64104da62a250a8ea2fe75598
C1 tail=" no private half of either per-invocation signing key is persisted by any chain component."
C2 file=check-routed-defects-round43.mjs bytes=1314 sha256=49f7a1e787fd226157c0b9aed72b5d6936dc750392b2f72f4839bb79160cb969
C2 tail="stent fabrication with the measure-blob-pin finding and names the frozen generator digest."
```
The C1 literal contains exactly 3 escaped apostrophes (`witness\'s`, `counter\'s`, `measure record\'s`);
the C2 literal contains 0 (its sentence has no apostrophe). No `\\` (escaped backslash) occurs in
either literal, so the `\'`→`'` unescape is unambiguous.

### 2.6 Cross-check 3 — runtime emission by the instruments themselves

Both instruments emit `predicateSentence: PREDICATE` in their JSON output, so the value the
instrument actually reports at run time can be compared with the claims member:

C2 checker, at HEAD, on the lane repo:
```
$ node .ufo/waves/round-43/counters/check-routed-defects-round43.mjs --rev ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
exit=0
rev ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c findingCount 0
runtime predicateSentence bytes 1314 sha256 49f7a1e787fd226157c0b9aed72b5d6936dc750392b2f72f4839bb79160cb969
findings []
```
→ matches the claims member and both in-file sites for C2 exactly.

C1 counter v5, direct offline invocation on the committed round-43 receipt and measure record:
```
$ node .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs \
    corpus/evidence/round43/playwright-egress/receipt.json \
    --measure .ufo/waves/round-43/measure/c1-measure-r43.json
exit=1
runtime predicateSentence bytes 1343 sha256 9bc9545343000b4806cd9628d97ba63e390fdda64104da62a250a8ea2fe75598
challengeVerified False challengeError EINVAL predicate False
```
→ the emitted C1 sentence matches the claims member and both in-file sites exactly. The
`exit=1` / `challengeVerified False` / `challengeError EINVAL` is the **expected** refusal of a
direct offline invocation: the counter writes a fresh 32-byte challenge to fd3 and reads the
Ed25519 signature back on fd4, and with no fd4 channel it cannot verify. This is consistent with
the frozen counter's documented wrapper-only design; this seat does not score C1.

---

## 3. Findings and observations (routed, not amended)

No amendment to any frozen byte is proposed by this seat. Two observations are routed for the
parent:

**F1 — C1's claim object carries two claims-side sentence members, and only one is a declared site.**
`claims[0]` has both `counterPredicate` (1343 B, sha256 `9bc95453…`) and `predicate` (2012 B,
sha256 `a6187940…`). The frozen `sentenceIdentity.C1.sites` list names `claims[0].counterPredicate`,
and that member is byte-identical to the two counter sites — so the declared three-site identity
holds. But `claims[0].predicate` is **not** one of the three declared sites; it is the
`counterPredicate` text with a 669-byte suffix appended:
```
 THE CLAIM: the counting command exits 0 on a fresh nonce AND the produced receipt.json,
receipt.witness.json and signed measure record are committed at the measured revision AND …
```
The suffix begins with the exact marker `" THE CLAIM: "`. This is a **naming-collision hazard for
future rounds and for any tool that reads `claims[i].predicate` generically**: a reader that picks
`predicate` for C1 (the natural key for C2) gets a different byte string than the counter's
`const PREDICATE`, and would report a false divergence. The C1 counter itself only reads
`claims.json` for `frozenDigests`/pins, and never compares the claims-side sentence to its own
`PREDICATE`, so this seat's measurement is not affected. Severity: low for the round-43 claims as
frozen; worth an explicit member-name convention (or a `claimSentence`/`admissionClause` split) in
a later round. Frozen bytes are not touched here.

**F2 — the three-site identity is declared but not instrumented.**
`claims.json.sentenceIdentity` asserts `byteIdentical: true` for C1 and C2, and this seat confirms
the assertion holds at the freeze. However, no round-43 counter, checker, control or measure record
re-checks it:
```
$ grep -rn 'byteIdentical\|sentenceIdentity' .ufo/waves/round-43/controls/ .ufo/waves/round-43/measure/
(empty)
$ grep -rn 'sentenceIdentity\|counterPredicate\|predicateSentence' .ufo/waves/round-43/counters/*.mjs
c1-signature-bound-v5.mjs:234:  return { schema: 'tabi-r43-c1-measured-v5', predicateSentence: PREDICATE, …
check-routed-defects-round43.mjs:222:const out = { schema: 'tabi-r43-routed-defects', predicateSentence: PREDICATE, …
```
Both instruments only **emit** `predicateSentence`; neither compares the emitted value against the
claims-side member. The identity is therefore a freeze-time assertion with no runtime re-check —
the same class of gap the round-42 closure raised for the routed-defect checker (a rule that
accepts what its sentence denies). A one-line assertion in either instrument (emit the claims-side
member's digest alongside `predicateSentence`, or compare them) would close it. Frozen bytes are not
touched here; routed to round 44.

---

## 4. Limitations

- The seat measures **byte identity** of the sentence at its three declared sites. It does not
  decide whether the sentence's *content* correctly describes what the instruments do; that is
  other seats' scope (C2's r1–r6 rule coverage is exercised by `ExecC2*`/`MutC2*` seats, C1's
  in-model reach by `CritC1*`/`MutC1*` seats).
- The header site is parsed from the single `// PREDICATE-SENTENCE:` line. If a future edit wraps
  that comment across lines, this extractor would find zero matches and the extraction script
  asserts `count == 1` rather than silently degrading — it would raise, not mis-report.
- Cross-check 3 for C1 uses a **direct offline invocation** of the counter, which is refused by the
  challenge-response by design; it was run only to observe the emitted `predicateSentence` value.
  It is not a C1 measurement and does not bear on the C1 kill rule.
- The C2 runtime check was run at HEAD (`ba433c94`), not at the frozen commit; the file bytes are
  identical between the two, so the emitted sentence is the frozen sentence.
- Peer seat `CritPredC1` independently extracted the same three-site groups and its
  `extraction-output.json` records the same four digests
  (`9bc95453…` ×3 for C1, `49f7a1e7…` ×3 for C2) and the same `counterPredicate`/`predicate`
  composition. This is corroboration between two independent extractions, not a shared instrument.

## 5. Files changed

Only files under `tabi-shokunin/.ufo/waves/round-43/w1/ExecSentence/` and this report were written.
Nothing in the production tree, the fleet repo, sibling `*-shokunin` repos or `shokuknow` was
created, modified or deleted. No commit, push, fetch, or git/jj mutation was performed anywhere
(`git cat-file`, `git log`, `git merge-base`, `git rev-parse`, `git ls-tree`, `git show` are all
read-only). No agents were spawned. Scratch root
`/fast/scratch/hyaku/tabi-r43/ExecSentence/` was used for extraction and was deleted before yield.

Evidence files (all under `.ufo/waves/round-43/w1/ExecSentence/`):
`three-site-identity-receipt.json` (machine receipt), `summary.json`, `C1-sites.json`,
`C2-sites.json`, `C1-sentence.txt`, `C2-sentence.txt`, `C1-sentence-sha256.txt`,
`C2-sentence-sha256.txt`, `extract-three-site-identity.py`, `eval-const-predicate.mjs`,
`transcript.sh`, `transcript.txt`.

## 6. Tooling

No tool was installed or upgraded. `python3` (stdlib only), `node`, `git`, `grep`, `awk`, `sed`,
`cmp`, `sha256sum`, `wc` — all pre-existing. Per the operator directive of 2026-10-19 the pacman
channel was **not** used (pacman transactions are paused host-wide); the `~/.local/bin` and
`cargo`/`npm -g` channels were likewise not needed.

---

Both diff verdicts are IDENTICAL: three identical sha256s per sentence — C1
`9bc9545343000b4806cd9628d97ba63e390fdda64104da62a250a8ea2fe75598` (1343 B) and C2
`49f7a1e787fd226157c0b9aed72b5d6936dc750392b2f72f4839bb79160cb969` (1314 B) — confirmed by four
independent paths (python extraction, shell-only re-extraction, node `eval` of the literal, and the
instruments' own runtime `predicateSentence` emission) at the frozen commit; two non-blocking
observations (F1 claims-side member naming collision; F2 the identity is declared but not
instrumented) are routed for round 44 without touching frozen bytes.

VERDICT ok C1 and C2 predicate sentences are byte-identical at all three declared sites at 7ca6f018 (C1 9bc95453..., C2 49f7a1e7...); two non-blocking observations routed, no frozen byte amended.
