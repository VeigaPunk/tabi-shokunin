# AttackQuality23 — QUALITY 23 vs the census U3 `navigator.modelContext` guess

Seat: `TabiR16.AttackQuality23` (leaf; no dispatch, no commits, no background jobs).
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Snapshot attacked: `b444ca8e024f386124418169e8e400221524bba3` (measured revision; commit A
`8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + counter repair).
Access date for every URL below: **2026-10-20**. Read-only on the lane; this report is the only
file written. No browser, counter, gate or selftest was run for this item.

## Verdict

**BREAKS.** Three separable results:

| Question | Result |
|---|---|
| Is the census U3 `navigator.modelContext` guess a real mistake? | **Yes**, and it is source-provable at the census date for the exact build the census named. |
| Would QUALITY 23 have caught it? | **No.** U3 is an unknown and 23's own third clause permits a hypothesised path as an unknown; clauses 1 and 2 do not reach it. |
| Is QUALITY 23 falsifiable? | **Only in the abstract.** A bare runtime observation can violate clause 1, but the cited U3 artifact passes under the rule's own scope (hypothesis recorded as unknown); the one delivered artifact that could fail it (`README.md:181`) has no determinate verdict because "unknown" vs "negative finding" is undefined. The rule is not falsification-backed by the mistake it cites. |

The rule's trailer says `(lesson: corpus/lessons/round-16.md#mistakes; census U3
navigator.modelContext guess)`. At the delivered snapshot that lesson file does not exist, and the
rule's text passes the census artifact it cites. The rule is therefore unsupported by its own
provenance and does not prevent recurrence of the mistake it names.

## 1. The U3 guess is a real, source-checkable mistake

Census text (line 188, unchanged since its first commit):

```
$ sed -n '186,189p' corpus/knowledge/browser-surface-census.md
- U3: Whether chromium 152 exposes native WebMCP (`navigator.modelContext` etc.) — no flag
  configured and no runtime probe performed in this census.
```

```
$ git log -1 --format='%h %ad %s' --date=iso 7961735
7961735 2026-10-14 10:36:02 -0300 probation round 1: ...
$ grep -n "navigator" corpus/knowledge/browser-surface-census.md
188:- U3: Whether chromium 152 exposes native WebMCP (`navigator.modelContext` etc.) — no flag
```

The census names build `152.0.7977.82-1` at `browser-surface-census.md:19`. Both authorities for
that build put the attribute on `Document`:

1. **Spec at the census date.** The upstream spec repository tip at the census commit
   (`7961735`, 2026-10-14 10:36 -0300) was `eada13b` (2026-10-13); the last tip of that day was
   `3279798` (2026-10-14 21:00:42 -0300). Both were checked; both have the `Document` partial and
   zero `Navigator` partial. Dumped from a read-only filtered clone of
   `https://github.com/webmachinelearning/webmcp`:

```
$ for c in eada13b 3279798; do printf '%s Document=' "$c"; git show "$c:index.bs" | grep -c "partial interface Document"; printf ' Navigator='; git show "$c:index.bs" | grep -c "partial interface Navigator"; done
eada13b Document=1 Navigator=0
3279798 Document=1 Navigator=0
```

   Zero `partial interface Navigator` hits at either tip. The getter moved on 2026-05-27, 140
   days before the census:

```
$ git log -S'navigator.modelContext' --format='%h %ad %s' --date=short -- index.bs
c7b5c70 2026-05-27 Move the `modelContext` getter to `Document` (#184)
```

   The commit is opened directly at
   `https://github.com/webmachinelearning/webmcp/commit/c7b5c7023f6e6a1c7a2495946136eb19b3109ae6`
   (HTTP 200, title "Move the `modelContext` getter to `Document` (#184)", 7 words). Its
   `index.bs` diff removes `partial interface Navigator { [SecureContext] readonly attribute
   ModelContext modelContext; }` and adds the `Document` partial.

2. **The named build itself.** Chromium tag `152.0.7977.82`, opened at
   `https://chromium.googlesource.com/chromium/src/+/refs/tags/152.0.7977.82/third_party/blink/renderer/core/script_tools/model_context_supplement.idl?format=TEXT`
   (HTTP 200; base64 decoded; sha256 `50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364`):

```idl
[
  RuntimeEnabled=WebMCP,
  ImplementedAs=ModelContextSupplement
] partial interface Document {
  [SecureContext, SameObject] readonly attribute ModelContext modelContext;
};
```

   The same file at tag `154.0.8037.97` was fetched and decoded the same way (HTTP 200, 520 B
   base64): `cmp` with the 152 file → identical, sha256 `50dd337d…6364`. So 152 and 154 carry
   the same IDL file. `third_party/blink/renderer/core/frame/navigator.idl` at
   tag `152.0.7977.82` has no `modelContext`/`ModelContext` (grep exit 1). The directory listing at
   tag contains `model_context_supplement.idl` and no Navigator supplement.

So at 2026-10-14 the census's parenthetical named a path that the spec had removed 140 days earlier
and that the named build's IDL did not declare. This is a real factual error, not only an unsourced
guess: the name is wrong against both authorities. It is *not* a claim that Chromium 152 exposes
`Document` at runtime — no 152 runtime probe exists (and the census says so). It is a source-level
name error, and it was checkable without a browser.

## 2. QUALITY 23 would not have caught it

Rule text (`corpus/QUALITY.md:85-90`):

```
23. A browser-API observation names the exact exposed object, the build, the flags and
    the origin's secure-context state, and checks the current spec text before calling
    a name a divergence; a hypothesised API path is recorded as an unknown, never as
    a negative finding. Spec citations back spec text only; implementation-only
    surfaces cite source or receipts. (lesson: corpus/lessons/round-16.md#mistakes;
    census U3 `navigator.modelContext` guess)
```

Clause-by-clause application to U3:

| Clause | Does it bind U3? | Result |
|---|---|---|
| "A browser-API observation names the exact exposed object, the build, the flags and the origin's secure-context state" | No: U3 says "no runtime probe performed in this census" — it is not an observation. If a reviewer broadens "observation" to include it, U3 names build 152 and "no flag configured" but no origin or secure-context state, so it fails. | **N/A under the stated scope; fail only under a broadening the rule does not authorize.** |
| "checks the current spec text before calling a name a divergence" | No: U3 calls nothing a divergence; it records whether the build exposes the feature. The stale name is not a divergence claim. | **N/A.** |
| "a hypothesised API path is recorded as an unknown, never as a negative finding" | Yes: U3 is exactly a hypothesised path recorded as an unknown ("Whether … exposes"). | **PASS.** |

The only textual route to a fail is reading clause 1 as binding U3. That reading collides with
clause 3: clause 3 necessarily lets a hypothesis name *some* path (an unknown must say what is
unknown), while clause 1 demands the *exact* exposed object. If clause 1 applied to unknowns, no
hypothesis could ever be recorded without already knowing the answer; clause 3 would be
inoperative. The rule states no precedence between the two clauses.

Consequences:

- 23 has **no clause that requires a hypothesised path to be checked against the spec or the
  build's IDL**. The actual U3 defect — a stale object name in a hypothesis — is exactly the gap.
- 23 would catch U3 only if the census had written "Chromium 152 does **not** expose
  `navigator.modelContext`" as a negative finding. It did not; the census wrote "Whether …".
- The phrase with "not" is in a different artifact: `corpus/README.md:181` (round-1 kaika row,
  commit `a4115fa`, 2026-10-19). That row is also hedged "open — still unprobed", so it is an
  unknown under clause 3 with a negative gloss. 23 does not define whether a gloss on an unknown
  counts as "a negative finding", so even that row has no determinate 23 verdict.

## 3. Is QUALITY 23 falsifiable? Yes in the abstract; not by its cited instance

**In the abstract, yes.** A hypothetical runtime observation such as "Chromium 154 exposes
`navigator.modelContext` on `https://example.com`" would violate clause 1 (no flags, no
secure-context state). The rule is not vacuous; a reviewer can reject a bare observation.

**Its cited instance is a pass, not a failure.** Under the natural scope (clause 1 binds
observations; clause 3 binds hypotheses), U3 is a hypothesis recorded as an unknown → pass. To make
U3 fail, a reviewer must apply clause 1 to a hypothesis, which contradicts clause 3's permission (an
unknown must name some path; if clause 1 demanded the exact object, no hypothesis could be written
without already knowing the answer). The rule states no precedence and no definition of "unknown".
The cited mistake is therefore not a demonstrated failure of the rule. The one delivered artifact
that could fail it is `README.md:181`'s negative gloss, and that has no determinate verdict because
"negative finding" is undefined for a hedged unknown.

Supporting defects:

1. **No falsification evidence for the cited mistake.** The artifact the trailer cites (`census U3
   navigator.modelContext guess`) is a pass under the rule's own scope; it cannot serve as the
   "shown able to fail" evidence the lane requires for a fix. The lesson that could record a
   different intended reading is absent at both the measured revision and the commit that
   introduced the rule:

```
$ git cat-file -e 8f7feb3:corpus/lessons/round-16.md
fatal: path 'corpus/lessons/round-16.md' does not exist in '8f7feb3'
$ echo $?
128
$ git cat-file -e b444ca8e024f386124418169e8e400221524bba3:corpus/lessons/round-16.md
fatal: path 'corpus/lessons/round-16.md' does not exist in 'b444ca8e024f386124418169e8e400221524bba3'
$ echo $?
128
$ git log --all --oneline -- corpus/lessons/round-16.md
(no output)
```

   The same absent path is cited by rule 22 (`QUALITY.md:83`). A future L1 lesson commit could
   fill the anchor, but at the delivered snapshot the rule's stated source is not a file, so it
   fails QUALITY 2 ("Every claim carries a source: a measured anchor … never oral knowledge").

2. **"Current spec text" has no required identity.** S020 records `CG-DRAFT 2026-10-16, revision
   f14762e6` (`corpus/SOURCES.md:34`); the round-16 note records the same §4.1 as `rev cb3d1696`
   (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:77`); the served page is dated
   `<time class="dt-updated" datetime="2026-10-20">20 October 2026</time>` (opened 2026-10-20,
   HTTP 200, 511,987 B). `f14762e6` is the 2026-10-16 commit; `cb3d1696` is the 2026-10-20 commit;
   both have the same `Document` IDL, so the substantive answer is stable here. But rule 23 does
   not require recording a revision or date, so a compliance verdict is read-date-relative and two
   committed artifacts already name two different identities. The rule cannot be audited later
   without a pin, unlike rule 22's digest-and-revision binding.

3. **"the origin's secure-context state" is ill-typed for opaque origins and has no defined
   granularity.** Two of the round's own 11 receipt cases have no tuple origin (`data:` and the
   `sandbox="allow-scripts"` iframe); `isSecureContext` is a property of the document's
   environment settings object, not "the origin's". Measured on the delivered receipt:

```
$ python3 - <<'EOF'
import json
d=json.load(open('corpus/evidence/round-16/webmcp/receipt.json'))
cs=d['cases']
def find(o,k):
    out=[]
    if isinstance(o,dict):
        for kk,v in o.items():
            if kk==k: out.append(v)
            out+=find(v,k)
    elif isinstance(o,list):
        for v in o: out+=find(v,k)
    return out
for k in ('isSecureContext','origin','locationOrigin'):
    print(k, sum(1 for c in cs if find(c,k)), [c['id'] for c in cs if find(c,k)])
print('cases', len(cs))
EOF
isSecureContext 3 ['flags-off-negative-control', 'model-context-location', 'data-url-declarative']
origin 0 []
locationOrigin 0 []
cases 11
```

   A strict per-observation reader fails 8/11 cases on clause 1; a per-note reader passes because
   the note has one global origin row and one `isSecureContext` row. The rule does not say which
   unit ("observation") owns the four fields. The same question applies to the note's own
   spec-versus-build table: its entry-point row names the object, the build and the §4.1 revision,
   but flags and origin live in the scope table above it (note:30-40 vs :77). Per-row strictness
   fails the note; per-note reading passes it.

4. **No executable surface or finding vocabulary.** Rule 22 names
   `scripts/check-measurement-binding.mjs`, its reasons and its exit convention; rule 23 names none.
   A prose-only rule can still be falsifiable (rules 1–5 are prose), but combined with (1)–(3) it
   is not a stable, auditable bar on its own precedent.

**Conclusion on falsifiability.** 23 is falsifiable in the abstract (a bare runtime observation can
violate clause 1), but it is not falsification-backed by the mistake it cites. That mistake — U3's
stale hypothesised path — passes the rule under the natural scope: clause 1 binds observations,
clause 3 permits a hypothesis recorded as an unknown, and U3 is an unknown. To fail it, a reviewer
must broaden clause 1 to hypotheses, which contradicts clause 3. The one delivered artifact that
could fail the rule (`README.md:181`'s negative gloss) has no determinate verdict because the rule
does not define "negative finding" for a hedged unknown. A rule whose cited mistake passes and
whose only candidate violation is undecidable is not a usable falsifiable bar for that mistake.

## 4. Provenance defects in the delivered text

**(a) The note misquotes the census.** Note lines 24–26:

```
The census guess "not `navigator.modelContext`" was an unsourced
hypothesis: the current spec puts the attribute on `Document` (S020 §4.1), so
`document.modelContext` is spec-aligned, not a divergence.
```

The census has exactly one `navigator` occurrence (line 188) and it says "Whether chromium 152
exposes native WebMCP (`navigator.modelContext` etc.)" — no "not". The "not
`navigator.modelContext`" phrase appears at `corpus/README.md:181`, added by `a4115fa` (2026-10-19),
and L1's own correction at `corpus/README.md:298-299` attributes it to "The kaika row's …", not to
the census. The note therefore contradicts the README correction committed in the same round.

**(b) The rule trailer points at the guess, but the rule's operative clause passes the guess.**
`QUALITY.md:90` says "census U3 `navigator.modelContext` guess". That is a correct description of
the census's hypothesis; it is not a negative finding. The only delivered text that could make 23
bite is the README negative gloss — and 23's trailer does not cite `README.md:181`, nor does its
text define how a hedged unknown plus a negative gloss is classified.

**(c) The rule's lesson anchor is missing.** See §3.1. At the measured revision the rule's
parenthetical resolves to an absent path; the only surviving statement of intent is the trailer's
parenthetical, which the rule's own text does not implement.

## 5. What a fix would need to say (if L1 keeps 23)

Not a recommendation to edit; the text needed to make the cited mistake catchable:

- a clause that a hypothesised API path **cites the spec revision/date or the build IDL** before
  the hypothesis is written, or is marked "name unchecked";
- a precedence rule: clause 1 binds observations only; clause 3 binds statements explicitly
  labelled unknown, and a negative gloss inside an unknown is itself a negative finding;
- a defined unit for the four fields (sentence, case record or note scope table);
- an identity for "current spec text" (revision or dated URL) in the same style as rule 22's
  counter digest;
- a decision for opaque origins: record `isSecureContext` of the relevant settings object, not
  "the origin's".

Without those, 23 remains a prose preference that cannot fail the artifact that motivated it.

## 6. Residual risk and verification gaps

- **No 152 runtime probe.** The 152 IDL is source evidence, not a runtime observation. The census's
  "no runtime probe performed" remains true. The proven mistake is the object name against the
  spec and the build IDL, not a proven 152 runtime divergence.
- **No counter/gate run.** This item reads the rule and its cited artifacts; it does not re-run
  C1/C2, the measurement-binding gate, the WebMCP harness or the C2 counter. Other wave-2 seats own
  those.
- **Spec history source.** `https://api.github.com/repos/webmachinelearning/webmcp/commits` returned
  HTTP 403 (unauthenticated); the history was read from a read-only `--filter=blob:none` clone of
  the upstream repository in `/tmp`. The 152 IDL was read from `chromium.googlesource.com` and
  cross-checked byte-for-byte against the GitHub mirror raw file (`cmp` → identical).
- **A later L1 lesson commit** could satisfy the `round-16.md#mistakes` pointer and record the
  intended reading. That would repair provenance, not the scope pass or the missing spec-check
  clause; the rule text at `b444ca8` is what is attacked here.

## 7. Tooling

No tool installed or updated; pacman untouched (host-wide pause honored). `/tmp` artifacts:
`/tmp/r16-q23-webmcp` (read-only filtered clone), `/tmp/r16-q23-webmcp-spec.html`,
`/tmp/r16-q23-152idl.txt` + decoded, `/tmp/r16-q23-152raw.idl`, `/tmp/r16-q23-152dir.json`,
`/tmp/r16-q23-152nav.txt`, `/tmp/r16-q23-commit.html`. No lane mutation except this report.
No `~/.omp/agent/agent.db*` or credential file opened.

## 8. Sources re-opened this session (2026-10-20)

| URL | HTTP | What was quoted / used |
|---|---|---|
| `https://webmachinelearning.github.io/webmcp/` | 200 (511,987 B) | §4.1 IDL block: "partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; }" (under 25 words); page `<time datetime="2026-10-20">20 October 2026</time>` |
| `https://chromium.googlesource.com/chromium/src/+/refs/tags/152.0.7977.82/third_party/blink/renderer/core/script_tools/model_context_supplement.idl?format=TEXT` | 200 (520 B base64) | Same `Document` IDL at the census's named build; sha256 `50dd337d…6364`; directory listing shows no Navigator supplement |
| `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl?format=TEXT` | 200 (520 B base64) | Byte-identical to the 152 file (`cmp`); same sha256 `50dd337d…6364` |
| `https://github.com/webmachinelearning/webmcp/commit/c7b5c7023f6e6a1c7a2495946136eb19b3109ae6` | 200 (461,038 B) | Commit title "Move the `modelContext` getter to `Document` (#184)" (7 words); diff removes the Navigator partial |
| `https://github.com/webmachinelearning/webmcp` (clone) | — | History `c7b5c70` → census-day tips `eada13b`/`3279798` → `f14762e6` → `cb3d169` → `51ed756`; `index.bs` at both census-day tips has Document only |
