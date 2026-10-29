# RevC1Driver — driver delta review vs r41 (tabi round 43, w1)

Date: 2026-10-29. Seat: RevC1Driver (leaf). Scope: diff
`scripts/playwright-firefox-egress-round43.mjs` against
`scripts/playwright-firefox-egress-round41.mjs` at baseline
`ab592825cd195599822ca227f7768914df208201`; confirm the only deltas are
schema r41→r43, strings TABI-R41→TABI-R43, and the nonLoopbackRemotes
recording (observeSs peers; observeProc decoded little-endian rem per QUALITY
102; final sweeps); check the `ss` peer column index f[4] against live
`ss -Htnp` on this host.

Tooling: no installs/upgrades performed (nothing needed). Operator rules read
at `/home/vgpnk/.omp/agent/RULES.md`; pacman untouched. All work read-only
against the repo; scratch at `/fast/scratch/hyaku/tabi-r43/RevC1Driver`
(deleted after report write).

## Evidence

### 1. Frozen identity of the r43 file

```
$ git show 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:scripts/playwright-firefox-egress-round43.mjs > egress-r43-frozen.mjs   # exit 0
$ sha256sum egress-r43-frozen.mjs scripts/playwright-firefox-egress-round43.mjs
3718235934d1fd06ffef2b976cfe09fabdc5af75d295bd78ee4d95b04e487c7e  egress-r43-frozen.mjs
3718235934d1fd06ffef2b976cfe09fabdc5af75d295bd78ee4d95b04e487c7e  scripts/playwright-firefox-egress-round43.mjs
```

Working-tree r43 content == freeze-commit blob == `claims.json`
`frozenDigests["scripts/playwright-firefox-egress-round43.mjs"]`
(`3718235934d1…c7e`). Git blob id at the freeze commit is `a4af8edd…`
(git SHA-1 over `blob 23371\0` header — same bytes, different algorithm).

### 2. r41 side is stable across the freeze range

```
$ git rev-parse ab592825…:scripts/playwright-firefox-egress-round41.mjs
5691f987c9c14745a07fb4a7703b637a63fdf25d
$ git rev-parse 7ca6f018…:scripts/playwright-firefox-egress-round41.mjs
5691f987c9c14745a07fb4a7703b637a63fdf25d   # SAME-BLOB
$ git log --oneline -6 -- scripts/playwright-firefox-egress-round41.mjs
8c32528d round-41 freeze: hardened C1 measurement chain (F4/F1/F3), C2 forgery-class entry, claims+controls
```

The r41 driver was untouched between the round-41 freeze, the r43 baseline
(`ab592825`), and the r43 freeze commit; the diff basis is sound.

### 3. Full unified diff: 11 hunks, all in the three allowed classes

```
$ git show ab592825…:scripts/playwright-firefox-egress-round41.mjs > egress-r41.mjs   # 22834 bytes, 455 lines
$ diff -u egress-r41.mjs egress-r43-frozen.mjs   # 131 lines of diff, 11 hunks (grep -c '^@@' = 11)
```

Hunk-by-hunk mapping:

| Hunk | Location | Delta class |
|---|---|---|
| @@ -1,5 +1,5 @@ | header comment | string: filename token round41→round43 |
| @@ -17,7 +17,7 @@ | Usage line | string: filename token |
| @@ -34,7 +34,7 @@ | `const SCHEMA = 'tabi-pw-firefox-egress-receipt-r41'` → `-r43` | schema r41→r43 |
| @@ -60,12 +60,12 @@ | fixture `<title>` and `<h1>` TABI-R41→TABI-R43 (2 lines) | string TABI-R41→TABI-R43 |
| @@ -84,7 +84,7 @@ | `FIXTURE2` replace-string TABI-R41→TABI-R43 | string |
| @@ -163,12 +163,13 @@ | `observeSs`: add `nonLoopbackRemotes` array; push raw `peer` (f[4]); return it | nonLoopbackRemotes recording (observeSs peers) |
| @@ -225,6 +226,7 @@ | `observeProc`: declare `nonLoopbackRemotes` | nonLoopbackRemotes recording |
| @@ -237,11 +239,16 @@ | `observeProc`: on non-loopback row, split `row.rem`, `decodeProcIp(iphex.toUpperCase())`, push `` `${b ? b.join('.') : iphex}:${parseInt(porthex, 16)}` `` | nonLoopbackRemotes recording (observeProc decoded little-endian rem) |
| @@ -256,8 +263,8 @@ | per-sample `ss`/`proc` objects passthrough `nonLoopbackRemotes` | nonLoopbackRemotes recording (sweeps) |
| @@ -367,8 +374,8 @@ | `finalSweep` `ss`/`proc` objects passthrough `nonLoopbackRemotes` (both available branches) | nonLoopbackRemotes recording (final sweeps) |
| @@ -419,12 +426,12 @@ | mkdtemp prefix `tabi-r41-pwegress-` → `tabi-r43-pwegress-`; `receipt.driver` round41→round43 | string |

Stronger residual check — apply only the allowed token substitutions to r41
and diff against the frozen r43 bytes:

```
$ sed -e 's/round41\.mjs/round43.mjs/g' -e 's/TABI-R41/TABI-R43/g' \
      -e 's/receipt-r41/receipt-r43/g' -e 's/tabi-r41-pwegress/tabi-r43-pwegress/g' \
      egress-r41.mjs > egress-r41-normalized.mjs
$ diff -u egress-r41-normalized.mjs egress-r43-frozen.mjs
```

The residual diff contains exactly the 6 nonLoopbackRemotes hunks
(observeSs decl/record/return; observeProc decl/record/return; sample
passthrough; final-sweep passthrough) and nothing else — no import, pin,
env-gate, nonce, timing, classifier, or control-flow drift.

### 4. Decoder usage verification (QUALITY 102)

`corpus/QUALITY.md:715` (criterion 102, round-39 additions): "A
`/proc/net/tcp{,6}` loopback classifier decodes Linux's little-endian 32-bit
words before testing the remote address and cross-checks `ss` output…",
sourced from `corpus/lessons/round-39.md` M1 (wrong-hex-byte-order defect).
The r39 red/green evidence files exist:
`.ufo/waves/round-39/measure/proc-endian-before.json`,
`proc-endian-after.json`, `proc-endian-raw-row.txt`.

`decodeProcIp` and `isLoopbackHexRem` are byte-identical between r41 and r43
(they sit in non-hunk regions). The r43 change adds a *call site* in
`observeProc` only:

```js
const [iphex, porthex] = row.rem.split(':');
const b = decodeProcIp(iphex.toUpperCase());
nonLoopbackRemotes.push(`${b ? b.join('.') : iphex}:${parseInt(porthex, 16)}`);
```

`decodeProcIp` reverses each 32-bit word's bytes (little-endian decode), IPv4
8-hex and IPv6 32-hex forms; returns `null` on other lengths, and the call
site falls back to the raw hex in that case. Port is decoded
`parseInt(porthex, 16)`. Live test against this host's real
`/proc/net/tcp` (decoder re-implemented verbatim in a read-only `node -e`;
the production file was not executed):

```
raw rem: 1A70528C:01BB -> decoded: 140.82.112.26:443 (ss showed 140.82.112.26:443)
0100007F -> 127.0.0.1
decodeProcIp length-12 guard -> null
```

Row `1A70528C:01BB` was the live ESTABLISHED chromium peer also shown by
`ss` as `140.82.112.26:443` — decode agrees with ss exactly, and the loopback
word `0100007F` decodes to 127.0.0.1, matching criterion 102's required
little-endian decode. Recording shape: decoded IPv4 is dotted-quad; IPv6
records the 16 decoded bytes dot-joined; `unavailable: true` sweep branches
carry no `nonLoopbackRemotes` key (consistent shape choice, not a defect).

### 5. `ss` peer column index f[4] on this host

`observeSs` runs `spawnSync('ss', ['-Htnp'], …)`, filters lines by
`pid=(?:tree)` regex, then `f = l.trim().split(/\s+/)` with `peer = f[4]`.
Live shape check:

```
$ ss -Htnp        # first rows:
ESTAB 0 0 192.168.0.253:48932 140.82.112.26:443 users:(("chromium",pid=3990326,fd=38))
ESTAB 0 0 127.0.0.1:4550 127.0.0.1:52766 users:(("MainThread",pid=3610201,fd=26))
…
$ node -e '<field-shape check over all lines>'
lines: 267 field-shape anomalies: 0 => f[3]=local, f[4]=peer on all 267 sampled lines
```

With `-H` (no header) the columns are State, Recv-Q, Send-Q, Local, Peer,
users:… — so index 4 is the peer address:port on this host's
iproute2 `ss`, including pid-tagged lines (which is what the pidRe filter
keeps). `isLoopbackPeer` regexes (`127.`, `[::1]`, `[0:0:0:0:0:0:0:1]`,
`[::ffff:127.`) match the observed textual forms. f[4] is correct.

## Findings

None. Every delta in the 11-hunk diff falls inside the three declared
classes; the normalized-residual diff is exactly the nonLoopbackRemotes
recording; the decoder call site follows QUALITY 102's little-endian rule and
agrees with live `ss`; the f[4] peer index is verified against 267 live
`ss -Htnp` lines; and the measured file hashes to the digest frozen in
`claims.json`.

Observations (not defects): the git file mode changed 100755 (r41) → 100644
(r43); both drivers are invoked as `node <script>`, so this has no runtime
effect, and the freeze binds content sha256, which matches. The r43 header
comment still says "tabi round 41, hardened session-bound" — cosmetic
carried text inside an allowed string hunk, noted for completeness.

## Limitations

- The driver was reviewed as bytes and its decode helper exercised against
  live `/proc`/`ss` data; the full browser egress run itself is the C1
  measurement lane's job, not this review seat's.
- `ss` column layout is iproute2-version-dependent in principle; verified
  against this host's current output only (267-line sample, 0 anomalies).

VERDICT ok r43 driver is a clean minimal delta of r41: schema+TABI-R43 strings and nonLoopbackRemotes recording only; decoder little-endian per QUALITY 102 verified live; ss f[4]=peer confirmed on host.
