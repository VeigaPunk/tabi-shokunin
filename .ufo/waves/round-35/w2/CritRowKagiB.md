# CritRowKagiB — w2 second attack on `cdp-bridge-vault-dom-refusal` (adjacency.tsv row 18)

**Verdict: HOLDS — no defect.** The nami side at `SKILL.md:2970` is a truthful declaration of a real tabi surface (CDP session discipline, `PROVINCE.md:9`, with DOM/screenshot evidence capture) that genuinely meets kagi's `cdp-bridge` line as one half of a two-sided split. Tabi **does not claim to drive the musketeer Chrome** and **does not touch the 1Password NMH** — and nothing in the lane's SKILL.md/corpus contradicts the declaration's scope: its positive content ("drives browsers and captures DOM/screenshot evidence") is grounded in tabi's documented CDP runbook (`SKILL.md:134-244,348-447`; `corpus/knowledge/cdp-evidence-patterns.md`), and its negative scope ("without reading a vault DOM or a session value") matches `PROVINCE.md:16` (secrets → kagi; session material shape-only). Kagi's own line 40 (verbatim at pin `69b61db4`) states kagi's side — `cdp-bridge ensure`/`status`, `open-popup` hard refusal (exit 2), vault-DOM scraping refused, NMH manifest location — so the row cites a sibling line in which the sibling itself states its side (QUALITY 97). The row is verified and counted by both gates (see commands). The only counter non-success is the global `newMapped >= 2` predicate (integration fact: newMapped 1), not a row defect; this row carries no finding.

## Attacked item

Row 18 of `corpus/adjacency.tsv` at `083c5c643be7aa5965a5de3458a32ed0d289ead3`:
`cdp-bridge-vault-dom-refusal | kagi | kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:SKILL.md:40 | <sibling quote> | SKILL.md:2970 | the `open-popup` refusal kagi states at `kagi-shokunin/SKILL.md:40` | split-declared | - | tabi's CDP session discipline (PROVINCE.md:9) drives browsers and captures DOM/screenshot evidence`.

## Evidence

Scratch: `S=/fast/scratch/hyaku/tabi-r35/CritRowKagiB`, `TMPDIR=$S/tmp`, clone `--shared` checked out detached at the wave-1 integration rev.

### 1. Mechanical verification (pasted)

Clone (exit 0):
```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
git -C "$S/clone" checkout -q --detach 083c5c643be7aa5965a5de3458a32ed0d289ead3
git -C "$S/clone" rev-parse HEAD   # 083c5c643be7aa5965a5de3458a32ed0d289ead3
```

Adjacency gate (exit 0):
```
cd $S/clone && node scripts/check-adjacency.mjs --at 083c5c643be7aa5965a5de3458a32ed0d289ead3 --repo "$PWD" --fleet /home/vgpnk/Projects/shokunin --json
```
→ `{"verdict":"clean","rows":17,"verified":17,...,"findings":[]}` — row 18 (`cdp-bridge-vault-dom-refusal`) reports no finding; sibling quote verbatim on kagi `SKILL.md:40` at pin `69b61db4` (kagi tip `refs/heads/master`), tabi quote verbatim on `SKILL.md:2970` at rev, split-declared ruling_quote verbatim in the tabi file. Full JSON: `.ufo/waves/round-35/w2/CritRowKagiB/adjacency-gate.json`.

Frozen C1 counter (exit 1 — expected; global predicate unmet at integration, `newMapped 1 < 2`):
```
cd $S/clone && TMPDIR=$S/tmp node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev 083c5c643be7aa5965a5de3458a32ed0d289ead3 --repo "$PWD" --fleet /home/vgpnk/Projects/shokunin --json
```
→ `candidates 383, mapped 1, screened 382, unaccounted 0, newMapped 1, newMappedRows [{row 18, surface cdp-bridge-vault-dom-refusal, sibling kagi, disposition split-declared}], newRowRefusals [], screenFindings [], unaccountedKeys []`; `adjGateSha256 4e2c2a64…` matches the frozen digest (`claims.json` `frozenDigests`). The row is **verified and counted**. Full JSON: `.ufo/waves/round-35/w2/CritRowKagiB/c1-counter.json`.

Declaration newness (n1 mechanical floor):
```
git show 2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684:SKILL.md | grep -c '1Password native-messaging bridge'   # 0, exit 1 → absent at baseline
git show 083c5c643be7aa5965a5de3458a32ed0d289ead3:SKILL.md | grep -n '1Password native-messaging bridge'        # line 2970
```

### 2. Sibling side (kagi SKILL.md:40 at pin)

```
git -C /home/vgpnk/Projects/shokunin/kagi-shokunin show 69b61db46be4ed955994f6f1d1cba522bc5f4e97:SKILL.md | sed -n '40p'
```
→ `| 1Password in musketeer Chrome | `cdp-bridge ensure` then `status` | `open-popup` (hard refusal, exit 2); scraping vault DOM | manifest at `$MUSKETEER_CHROME_PROFILE/NativeMessagingHosts/` |` — a decision-table row in kagi's own skill doc: correct procedure (`cdp-bridge ensure`/`status`), the refused operations (`open-popup` hard refusal exit 2; scraping vault DOM), and the NMH manifest location. **Kagi states its own side** (custody + refusals) — not a third-lane report, not a census of tabi's text → QUALITY 97 satisfied.

### 3. Tabi side truthfulness

- **Tabi really owns/practices CDP session discipline with DOM/screenshot evidence capture.** `PROVINCE.md:9` owns "CDP session discipline (endpoints, targets, screenshot/DOM evidence capture)". `SKILL.md:134-244` (runbook: `driver.sh` launches a browser with a loopback debug port 19412, waits for `http://127.0.0.1:19412/json/version`, connects a CDP client, opens a session slot, sends commands, records receipt fields, kills by PID), `SKILL.md:348-447` (`Page.navigate`, `Network.enable`, `Page.captureScreenshot`, `DOM.getDocument`/`DOMSnapshot.captureSnapshot`), `SKILL.md:555-556` (fresh throwaway profile per run), `corpus/knowledge/cdp-evidence-patterns.md`. The declaration's "drives browsers and captures DOM/screenshot evidence" is grounded.
- **Tabi never claims to drive the musketeer Chrome.** The only musketeer lines in the lane are: `SKILL.md:1965` (contested scope waits on fleet `.ufo/l0-questions.md:62` — the-musketeer CDP lease, kagi/kake), `SKILL.md:2966` (the sweep regex vocabulary), and the round-35 BiDi entry noting `127.0.0.1:9222` is the operator's musketeer CDP lease port (never bound/probed). The declaration says only "drives browsers" — tabi's own loopback instances. No overclaim.
- **Tabi does not operate the 1Password NMH.** All 1Password/NMH material in the lane is shape-only census (`corpus/knowledge/browser-surface-census.md:37,42,70,77-84,174,219,223,249,252` — NMH shells, manifest bytes/modes, no binary/package) or incidental process observation (`hygiene-sweep-r4.md:20,77` — crashpad handler). No line shows tabi invoking or driving the NMH; grep for `cdp-bridge` in tabi files finds **no operational use** — the token appears only in the declaration and the sweep's regex vocabulary. The boundary "without reading a vault DOM or a session value" matches `PROVINCE.md:16` (secrets → kagi; session material shape-only, never content-read).
- **Not "written only to name kagi".** The declaration carries positive tabi content (real CDP discipline) plus a boundary; it is not a roster sentence. It is not the w1 red-state shapes: not the J8 junk split-row forgery (tabi side here is real and grounded), not a single-refusal-line `refused-route` reuse.
- **Same-surface consistency.** Kagi's other cdp-bridge/NMH lines (`SKILL.md:11,164,172`; `corpus/knowledge/cdp-bridge-1password.md`; `adjacency-breadth/scope.md` rows) were screened `same-surface` onto the already-verified `musketeer-cdp-9222-profile-lease` row (or `secrets-vault-ops`, `not-browser-sense`, `no-claim-declared`). Line 40 is the one kagi line where kagi states its side of the **1Password-bridge custody** with browser ground and a side-stating word — ground not owned by rows 7-8 (profile lease) or row 9 (vault ops generally). Mapping it follows decision rule step 5; no already-mapped row owns this surface for kagi.

## Conclusion

Row 18 `cdp-bridge-vault-dom-refusal` **holds**: verified clean by `check-adjacency` (17/17), counted as newMapped by the frozen C1 counter (mapped 1, unaccounted 0, no screen findings, no refusals), and its tabi side is truthful, grounded, and bounded — not fabricated, not a naming-only sentence. No withdrawal or screen is warranted. The counter's exit 1 reflects only the global `newMapped >= 2` target (integration fact), which this seat does not repair.

## Deliverables

- Report: `.ufo/waves/round-35/w2/CritRowKagiB.md`
- Receipts: `.ufo/waves/round-35/w2/CritRowKagiB/adjacency-gate.json`, `.ufo/waves/round-35/w2/CritRowKagiB/c1-counter.json`, `.ufo/waves/round-35/w2/CritRowKagiB/kagi-skill-40.txt`
- Scratch `/fast/scratch/hyaku/tabi-r35/CritRowKagiB/` deleted before yield (receipts copied first). No browser launched, no network fetch, no tool installed, no lane file edited.
