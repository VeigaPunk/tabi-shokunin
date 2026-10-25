# SrcRefusals — three staged candidates adjudicated against tabi held ground

R23, baseline `a89f1935f523a64b00991d792fca6a8c0d321948`. Read-only: no corpus write, no git/jj write, no spawn, no message. Candidates from `shokuknow/merge/tabi/knowledge/corpus/knowledge/`; held ground from `tabi-shokunin/{corpus/knowledge,corpus/SOURCES.md,corpus/README.md,SKILL.md}`.
**Verdict: refuse all three now** — (a) refuse-now/admit-later after re-scope; (b),(c) refuse as duplicate ground. No corpus write follows.

**Frame (all three).** Registry ends at S101 (`grep -c '^| S' corpus/SOURCES.md` → 101); every id cited (S105, S112, S115, S160, S246, S247) is staged-only in `merge/tabi/SOURCES.append.md`. C2 admits **one** entry counted by `git grep -lE '^source: S10[23] ' <REV> -- corpus/knowledge | wc -l` (`claims.json:36-38`), so an entry citing S105/S160/S246 is invisible to that metric — a second admission is uncounted while C2 still reports 1. Lane holds 0 `kimi-webbridge` registry rows (`grep -c 'kimi-webbridge' corpus/SOURCES.md` → 0), 0 amendment files (`ls corpus/knowledge | grep -c amendment` → 0).

## (a) `webmcp-429-counters-and-residency-friction-r26.md` — refuse-now, admit-later (re-scoped)

**Frontier claimed:** `corpus/README.md:182` "Rate/ToS surface for site-interaction records | open … round 6 measured loopback 429/403/robots-disallow instruments … the instrument, not a real surface."
1. *Coverage already allocated.* `ground:` claims "the campaign's cross-tradition lead — the eastern-language material on the lane's own subject"; that allocation is the staging package's, carried by S230/S240/S241/S246/S247 into `eastern-language-measurement-sources-r17.md` (`grep -n '^| S246\|^| S247' SOURCES.append.md` → :151,:152, both tier B community).
2. *Headline deficit false against held ground.* It calls the counters "the receipt schema the lane's own evidence standard is missing"; the lane records a 429 cell's status and `Retry-After` and forbids acting on it — `external-class-fixture-v2.md:64` ("first response with status ∈ {429, 403} → **STOP**; record"), `:338` ("Retry-After is a shape, not a schedule"), `:419` ("429, `Retry-After: 7`"); `SKILL.md:694-695` ("do not assert one; record it when measured"); `interaction-approval-table.md:62,191` (C6, U1) name the axis as an absence.
3. *Cites rows the lane does not hold.* "the lane's western residency rows" do not exist — `grep -rniE 'residen|datacenter|ASN|proxy type' corpus/knowledge/*.md SKILL.md | wc -l` → 18, all `ariaSnapshot` substrings; `grep -rnw -i 'proxy' …` → 1, `harness-hardening-round-18.md:62` (argv allowlist gap). Citing absent ground violates `corpus/QUALITY.md:2`.
4. *Budget.* Frame ¶.
**Genuinely new:** the six counters (per-IP, per-session, concurrent, per-endpoint, behavioural, account quota) and the ASN/residency deciding layer (sweep in 3: no lane holder).
**Flip:** re-scope to those two claims; land as a dated amendment to `interaction-approval-table.md` C6/U1, not a new file; fix refusal 2 in the text; lane opens S246/S247 with this round's access date and located quotes; a round whose frozen claim counts that id admits it.

## (b) `agent-approval-handshake.md` (K-G) — refuse (duplicate ground, vocabulary only)

**Ground claimed:** interaction-approval classes — held at `interaction-approval-table.md:58-62` (C2/C3/C5), `:139` (A5), `:143` (A9), `SKILL.md:698-700`, `PROVINCE.md:16-17`.
1. *No bin moves.* The entry says "the lane's rule is stricter and stays stricter" — no disposition, gate or falsifier changes; it buys vocabulary absent today (`grep -rn 'autoConnect\|filesystemRoot\|allowedUrlPattern\|redactNetworkHeaders' corpus/knowledge SKILL.md corpus/SOURCES.md` → 0).
2. *Duplicates its cluster.* `merge/tabi` stages three more over the same ground: `webmcp-tool-approval-hints.md` (K-F), `debugger-infobar-approval-surface.md` (K-I), `webmcp-hint-is-not-enforcement-r13.md`.
3. *Unreconciled with a held boundary* [inference]. `chrome-remote-debugging-profile-boundary.md:48` holds "branded Chrome ≥136 | default | refused"; the attach premise never names its enablement path (`chrome://inspect#remote-debugging`) or whether that row applies — a reader takes it as overriding a measured row.
4. *Budget.* Frame ¶.
**Flip:** amendment to A5 naming the enablement path and reconciling row 48, after the lane opens S105/S112/S115 and appends those rows, in a round whose budget admits it.

## (c) `webbridge-daemon-handshake-amendment-r14.md` — refuse (duplicate bytes, dangling parent)

**Frontier claimed:** `corpus/README.md:30,180` "Extension↔daemon link | open … `/command` auth stays unprobed by rule" (four `/status` samples, all `extension_connected:false`).
1. *All three claims already held.* POST of `{action, args, session}` — `webbridge-plugin-anatomy.md:78`; Windows `curl.exe --data-binary` + "shell corrupts non-ASCII to `?`, unrecoverable" — `:97-100`; file output `{format, path, sizeBytes, mimeType}` — `:106-108`; Windows rule = gate A11 (`interaction-approval-table.md:145`).
2. *Dangling parent.* It amends `webbridge-daemon-handshake-amendment-r13.md`, absent from the lane and itself only staged (`QUALITY.md:13`: an amendment presumes a landed parent).
3. *Cannot close the row it claims.* `QUALITY.md:14` — a documentation reading never becomes an observed host behavior; the row stays open for observation, not restatement.
4. *Budget.* Frame ¶; S160 staged-only (tier A own-work, `SOURCES.append.md:65`).
**Flip:** r13 lands and r14 rebases onto it stating only the delta; or `/command` auth (U7) is recorded only once `/status` shows the extension attached and a `/command` round-trip is observed.

## Commands (read-only; cwd `tabi-shokunin` unless prefixed)

```
grep -c '^| S' corpus/SOURCES.md → 101 · grep -c 'kimi-webbridge' corpus/SOURCES.md → 0
ls corpus/knowledge | grep -c amendment → 0
grep -rn 'autoConnect\|filesystemRoot\|allowedUrlPattern\|redactNetworkHeaders' \
  corpus/knowledge SKILL.md corpus/SOURCES.md → 0
grep -rniE 'residen|datacenter|ASN|proxy type' corpus/knowledge/*.md SKILL.md | wc -l → 18
grep -rnw -i 'proxy' corpus/knowledge/*.md SKILL.md → 1 (:62)
grep -n '^| S246\|^| S247\|^| S160' /home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md → :151 :152 :65
```

**Unknowns:** whether the "r26" `source:` numbering in (a) is a second registry namespace (its ids exist in the append; its labels do not match the lane's `S###`-per-file convention); whether a sibling seat already refused any of the three this wave (only `claims.json` and this note read).
