# w2 · CritC1CasesS106 — attack on the three round-30 s106 cases

**Verdict.** I attacked the three cases added by 38891ca0 — `same-length-tamper-invalid` (`scripts/check-s106-evidence.mjs:233-245`), `duplicate-anchor-invalid` (`:247-265`), `receipt-byte-count-mismatch-invalid` (`:266-278`) — at 072af95fe2822f0785a6ff88a578e2142dd258e5 (gate bytes `85dfd5e0…5467`). Each case **holds**: on the pristine gate all ten cases pass, and against the catalogue mutant of its own term each case fails for that term only (fixture field dump: same-length flips only `sha_match`, with 2614 bytes on both sides and shas `d721cd40…` vs `db29b63a…`; duplicate flips only `anchor_unique`, occurrences 2, everything else true; byte-count flips only `byte_count_match`, receipt 2621 vs observed 2614). Each is also load-bearing: `same-length-tamper-invalid` is the **only** case that kills `s106-sha-drop` and the only case that kills a gate reading its sha/anchor/bytes from `measured_rev`; `duplicate-anchor-invalid` is the only killer of both `s106-anchor-unique-*` mutants; `receipt-byte-count-mismatch-invalid` is the only killer of both `s106-byte-count-*` mutants. The suite as a whole, however, is **under-determined**: of 14 plausible wrong gates I built beyond the catalogue, **9 pass all 10 cases** (W2, W3, W4, W5, W6, W8, W9, W10, W12). Root causes are fixture monoculture (every fixture is ASCII, LF, unindented, anchor-as-whole-line; receipt counts exact or overstated by +7) and a **self-referential digest oracle** (`FIXTURE_SHA = sha256(FIXTURE_BYTES)` at `:160` feeds `decoded_sha256` at `:177`, so any mutation of the gate's own `sha256()` is invisible by construction). All nine are **coverage gaps, not C1 claim failures**: the frozen counter at 072af95 gives `fault_total 27, fault_killed 27, fault_survivors 0, benign_total 13, benign_killed 0, exit 0`; the catalogue does not contain these mutants, and each survivor's divergence is unreachable on today's single production document (line 187 of the committed S106 bytes is unindented, ASCII, LF-only — verified). Smallest safe correction, prototyped and validated in scratch: four **additive** cases, no gate-logic edit, catalogue and counter bytes untouched.

## 0. Method and provenance

Lane HEAD was af0664e (wave-1 report commit); I measured the named tip 072af95 in a `--shared` clone.

```
$ git -C "$S/clone" rev-parse HEAD                     -> 072af95fe2822f0785a6ff88a578e2142dd258e5
$ git -C "$S/clone" status --porcelain | wc -l         -> 0
$ sha256sum clone/scripts/check-s106-evidence.mjs       -> 85dfd5e0cb9d5a99f311a8f94728df31e9308a2fd7e63853ed11a4f3b5e95467 (== lane)
$ node scripts/check-gate-mutants.mjs --rev 072af95… --json --work "$S/counterwork"
  -> exit 0; {"fault_total":27,"fault_killed":27,"fault_survivors":0,
              "benign_total":13,"benign_killed":0,"survivors":[],"benign_killed_ids":[]}
     s106 pristine self-test: cases 10; release-pins: cases 29
```

Attribution is **behavioural, by reading**, not from the counter's run directory (wave-1 `w1/CritC1Counter.md` showed that directory leaks mutant identity). I copied the pristine gate to `$S/harness/gate.mjs`, added a field dump to the selftest result object only (`gate-dump.mjs`; no check line and no case expectation touched), then applied each catalogue `find→replace` exactly once and ran `--selftest --json` on the copy. `find`-count is asserted to be 1 by the driver; a non-1 count would be recorded as an apply error.

## 1. Do the three cases fail on the pristine mutant for the intended term only? — holds

Pristine: `node gate.mjs --selftest --json` → exit 0, 10/10.

Catalogue s106 fault mutants (each applied to pristine bytes), failing cases:

| mutant | failing cases | target-case field vectors under that mutant |
|---|---|---|
| `s106-sha-drop` (valid drops sha) | **same-length-tamper-invalid** only | same-length: rev T, **sha F**, loc T, uniq T, bytes T |
| `s106-sha-true` (`shaMatch = true`) | sha-mismatch-invalid, **same-length-tamper-invalid** | same-length: rev T, **sha T**, loc T, uniq T, bytes T |
| `s106-anchor-unique-drop` | **duplicate-anchor-invalid** only | duplicate: rev T, sha T, loc T, **uniq F**, bytes T, occ 2 |
| `s106-anchor-unique-true` | **duplicate-anchor-invalid** only | duplicate: rev T, sha T, loc T, **uniq T**, bytes T, occ 2 |
| `s106-byte-count-drop` | **receipt-byte-count-mismatch-invalid** only | byte-count: rev T, sha T, loc T, uniq T, **bytes F** |
| `s106-byte-count-true` | **receipt-byte-count-mismatch-invalid** only | byte-count: rev T, sha T, loc T, uniq T, **bytes T** |
| `s106-revision-drop` / `-true` | measured-revision-bytes-mismatch only | all three target cases unchanged |
| `s106-anchor-located-true` | anchor-off-by-one only | all three target cases unchanged |
| 6 benign `*-eq-swap` / `-reorder` | none (exit 0) | all three target cases unchanged |

No target case appears in any other mutant's failing list, and no target case's fixture trips a second term (the field dump above shows exactly one false term per fixture, except `sha-true` where the mutated term becomes true and the kill comes from exit/valid). `same-length-tamper-invalid` is the sole killer of `s106-sha-drop` — the older coarse `sha-mismatch-invalid` fixture also breaks length and measured-rev, so it cannot see that drop; the new case carries that kill alone. The duplicate case sets `occurrences_in_file: 2` in the receipt but the gate never reads that field, so the kill is behavioural, not literal.

Caveat, correctly scoped: `s106-sha-true` is killed by two cases, and `same-length-tamper-invalid`'s failure under `sha-drop` comes from `valid`/exit while its declared `sha_match` assertion still passes (the field is computed false but not consulted). That is the intended kill shape for a conjunct-drop mutant.

## 2. Can a wrong gate still pass all 10 cases? — yes, 9 of 14

Fourteen single-site wrong gates beyond the catalogue, each applied to the pristine gate; "survives" = `--selftest` exit 0, 10/10.

| # | gate edit (one line) | result | killed by |
|---|---|---|---|
| W1 | `valid = revisionMatch && shaMatch && anchorLocated` (drops uniq+bytes) | killed | duplicate, byte-count |
| **W2** | `occurrences = lines.filter(l => l === receipt.anchor.text).length` (untrimmed) | **survives** | — |
| **W3** | `sha256` helper hashes `Buffer.from(text,"latin1")` | **survives** | — |
| **W4** | `anchorLocated = recorded.includes(receipt.anchor.text)` (substring) | **survives** | — |
| **W5** | `byteCountMatch = bytesText.length === receipt.decoded_bytes` (UTF-16 code units) | **survives** | — |
| **W6** | `sha256` helper normalises `\r\n`→`\n` before hashing | **survives** | — |
| W7 | `valid = shaMatch && byteCountMatch` | killed | measured-rev-mismatch, anchor-off-by-one, duplicate |
| **W8** | `anchorLocated = recorded.trim() === receipt.anchor.text` (one-side trim) | **survives** | — |
| **W9** | `occurrences = bytesText.split(receipt.anchor.text).length - 1` | **survives** | — |
| **W10** | `revisionMatch` compares `sha256(measuredBytes)` to `sha256(bytesText)` instead of the receipt digest | **survives** | — |
| W11 | `bytesText = measuredBytes` (sha/anchor/bytes all read measured_rev) | killed | same-length-tamper only |
| **W12** | `byteCountMatch = Buffer.byteLength(bytesText) >= receipt.decoded_bytes` | **survives** | — |
| W13 | `valid = byteCountMatch` only | killed | 4 cases incl. same-length |
| W14 | `valid = shaMatch` only | killed | 4 cases incl. byte-count |

Raw results: `catalogue-mutants.json`, `wrong-gates-final.json`, `wrong-gates-onlyterm.json`; exact diffs: `wrong-gate-diffs.txt`. A first W10 build placed `revisionMatch` before `bytesText` and crashed on TDZ (`ReferenceError`, exit 1; preserved in `wrong-gates.json`); the re-run with the comparison ordered after `bytesText` is `W10-revision-measured-vs-rev` in `wrong-gates-final.json`, and it survives.

## 3. Why the nine survive — four structural causes

**(a) Fixture monoculture (W2, W4, W5, W8, W9).** Every fixture body is pure ASCII, `\n`-separated, and its anchor line is exactly `FIXTURE_LINE` with no surrounding whitespace; the duplicate fixture adds the same string as a whole second line. Trim policy, substring-vs-line equality, substring occurrence counting, and code-unit-vs-byte length all coincide on that shape. The production evidence is the same shape — I re-checked the committed blob: 73952 bytes, sha `9b93fe64…6c44`, line 187 exactly the anchor text, 0 non-ASCII code points, no `\r` — so these variants are **equivalent on today's single document**, a gap in what the self-test pins, not an admission hole today.

**(b) Self-referential digest oracle (W3, W6).** `FIXTURE_SHA = sha256(FIXTURE_BYTES)` (`:160`) is what `fixtureReceipt()` puts in `decoded_sha256` (`:177`), and the duplicate case likewise calls the gate's own `sha256()` (`:259`). A mutation **inside** `sha256()` therefore shifts claim and observation together. Demonstrated: I rebuilt the corrective gate so its non-ASCII+CRLF fixture computes its digest with the gate's helper (`gate-fix-selfref.mjs`) — W3 and W6 still pass 14/14 and die only when the fixture's digest is computed independently of that helper (`gate-fix.mjs`). This is structural: no case built the current way can see a `sha256()`-level mutation, which is why the catalogue only places sha mutants at the comparison site.

**(c) Field-only divergence (W10).** With `shaMatch` true, `sha(measured)=sha(text)=digest` is transitively the correct revision claim, so W10's `valid` predicate is logically equivalent to the pristine one; only the reported `revision_match` flips (false where pristine reports true on the same-length fixture). It is a **reporting/field gap**, not an admission gap — but the self-test's job here is exactly the declared field, and no case asserts `revision_match` on a fixture where measured and rev bytes differ while measured still hashes to the receipt digest.

**(d) Inequality direction (W12).** The only byte-count fixture has the receipt **overstating** by +7, which `===` and `>=` both reject. A receipt **understating** its `decoded_bytes` is accepted by `>=`.

## 4. Smallest safe correction (additive, validated in scratch)

The claim's standing rule is that only self-test cases and fixtures may change; these four cases change nothing the catalogue targets (the catalogue's 9 s106 fault `find` strings all remain present exactly once), and the frozen counter/catalogue bytes are untouched. Prototype `gate-fix.mjs` (sha256 `7bcb013b…18d0`) adds:

1. **`anchor-text-whitespace-tolerant-valid`** — receipt `anchor.text` = two leading spaces + `FIXTURE_LINE`, line 187 = `FIXTURE_LINE`, expect valid / `anchor_located` true. Kills **W2, W4, W8, W9**.
2. **`non-ascii-crlf-bytes-valid`** — 186-line body joined with `\r\n`, plus a `// café tail` line; receipt `decoded_bytes = Buffer.byteLength(body)` and `decoded_sha256` computed **independently of the gate's helper** (`createHash(…).update(Buffer.from(body,"utf8"))`), anchor line 187 unchanged; expect valid. Kills **W3, W5, W6**. (Without the independent digest this case kills only W5 — see §3b.)
3. **`receipt-byte-count-understated-invalid`** — receipt `decoded_bytes = observed − 7`, sha unchanged; expect invalid / `byte_count_match` false. Kills **W12**.
4. **`same-length-tamper-measured-revision-holds`** — same bytes and commits as `same-length-tamper-invalid`, asserting `revision_match` **true**; expect exit 1 / valid false. Kills **W10**.

Result on the prototype: `--selftest` **14/14 clean** (exit 0); all **14/14** wrong-gate variants killed; all **9/9** s106 fault mutants still killed; all **6/6** benign mutants still survive. Receipts: `gate-fix-pristine.json`, `gate-fix-wronggates.json`, `gate-fix-catalogue.json`, `selfref-probe.json`.

Safety argument beyond the prototype: benign mutants preserve behaviour at the mutated site, so any new case that asserts a behavioural field must still pass them — confirmed empirically for all six.

## 5. Limits

- I ran no release-pins case attack (other seats' scope) and did not touch C2.
- The 14 variants are single-site weakenings of the five declared terms and their helpers, not an exhaustive mutation space.
- No network fetches, no tool installs, no lane writes; all measurement in `$HYAKU_SCRATCH/tabi-r30/CritC1CasesS106/clone` (porcelain 0) and its `harness/`.

## 6. Commands run (exit codes)

```
git clone --shared … && git -C clone checkout -q 072af95…          -> 0
git -C clone status --porcelain | wc -l                            -> 0
sha256sum clone/scripts/check-s106-evidence.mjs                    -> 85dfd5e0…5467 (== lane)
node clone/scripts/check-gate-mutants.mjs --rev 072af95… --json --work …  -> 0  (27/27, benign 0)
node gate.mjs --selftest --json                                    -> 0  (10/10)
node gate-dump.mjs --selftest --json                               -> 0  (10/10, field dump)
node driver.mjs gate-dump.mjs runs-catalogue2 spec-catalogue.json  -> 0  (9 fault killed, 6 benign survive)
node driver.mjs gate-dump.mjs runs-final spec-all-wrong.json        -> 0  (9 of 14 survive)
node driver.mjs gate-fix.mjs runs-fix-wrong spec-all-wrong.json     -> 0  (14/14 killed)
node driver.mjs gate-fix.mjs runs-fix-cat spec-catalogue.json       -> 0  (9 fault killed, 6 benign survive)
node gate-fix.mjs --selftest --json                                 -> 0  (14/14)
node driver.mjs gate-fix-selfref.mjs runs-selfref spec-selfref.json -> 0  (W3, W6 survive; W5 killed)
```

## 7. Receipts (`.ufo/waves/round-30/w2/CritC1CasesS106/`)

Measured with `sha256sum .ufo/waves/round-30/w2/CritC1CasesS106/*` after all runs:

| file | sha256 |
|---|---|
| `gate-fix.mjs` (corrective prototype) | `7bcb013b69d35c638958472a7bad1d454f858b04a4c52c8289e1cde9d18318d0` |
| `gate-fix-selfref.mjs` (self-reference probe) | `19acfd917c4e1ee6db9343b7ef2607c52b797848dd25dba29d542d13deb0feaf` |
| `c1-counter.json` | `0392fc1005dc52bd95e9d1e934cdaeba1a224357c41723b87ac2a5fcda4122e2` |
| `pristine-selftest.json` | `c3a1eb161818b3da29f5ca03548da6e8503c0a3b5c65d4e87fbb3e77f2bf7764` |
| `pristine-dump.json` | `00882dbdd9c68d8ee7bf1e587ec6986c5263d6d1080d734462696db8e8ea3182` |
| `catalogue-mutants.json` | `98ee038f3ca8b35657420caac8fd74169f2e90ede6a536c6883706e2d99b4a3b` |
| `wrong-gates.json` (first run; W10 TDZ crash) | `e23b822803039cc2e53485728bf4e74ee968265ef63058e2d15d16b399f05bff` |
| `wrong-gates-final.json` (14 variants, authoritative) | `6b64f9233e03a56345d9fb59bd4cc2d2f0cbf8616b25ad16c453871050fe35f5` |
| `wrong-gates-onlyterm.json` (W13/W14) | `4239710aae8f8ef9c88d93bed8b1a4226422cf4060577d6cb8e30e635ce15bbf` |
| `gate-fix-pristine.json` | `096ac3b3a33d36e26041c03b254f35968e19514a3c26b01ae2d6440e7a3e6cf4` |
| `gate-fix-wronggates.json` | `fe9abcb46cc71f5b104326db9389d70d479b9a6aa224ca21dbcf71e881244d47` |
| `gate-fix-catalogue.json` | `3f82dd30318a2cb829dad3bca5586ce38f7b04b3a6111212df12f5c128dfe37c` |
| `selfref-probe.json` | `60c297ed35dd703d9abf175eee22f363a6539e5a8e18c90629f82bda1a05c93e` |
| `wrong-gate-diffs.txt` | `aaef411c40a0abe95b8e046838943fa70988771029c9828af3c7b0f79007e621` |
| `provenance.json` | `9562432821b86d165bfa4733cc2cdeeb37e19159afe4b371e330ab34511aa66a` |
| `spec-catalogue.json` | `4d2cbe0f50d3933c77196966edbc327e921b7410a917a6b130261add3fa283b4` |
| `spec-wrong.json` | `b1bb832fa8ca320601bcdc7dbbaa8f359ae14817ae92a20a45adbe864e32883a` |
| `spec-w10.json` | `8c0f33d9a0ef19f9862c7d34c42f1ff07c51b33ddd263c7eabc13891c095431b` |
| `spec-onlyn.json` | `68f386bfd4a369a8a87989fef625a8776a370a7720317f795313a69b1cbcb8c7` |

Gate under test at 072af95: `85dfd5e0cb9d5a99f311a8f94728df31e9308a2fd7e63853ed11a4f3b5e95467`; catalogue `cd1c27a2…3833`; counter `02945f88…3a55` (all byte-identical to `claims.json` frozenDigests).
