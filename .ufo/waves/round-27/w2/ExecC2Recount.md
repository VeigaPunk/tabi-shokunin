# ExecC2Recount — C2 current-tip recount and anchor attack

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Read-only reporter; only this report was written. No tool installation was needed.

## Finding

C2 re-derives cleanly at the named current commit: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-s106-evidence.mjs --rev 5ed6484da66e6bf73654281d2e9ba3703f0c2ef0 --json` returned exit 0, `valid=true`, `present=true`, `sha_match=true`, `anchor_located=true`, `anchor_unique=true`, and `byte_count_match=true`; claimed and observed SHA-256 both `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44`, decoded byte count 73952. `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-s106-evidence.mjs --selftest` returned `S106_SELFTEST verdict=clean cases=5 passed=5`; all five printed cases PASS, including missing receipt and bytes as exit 2.

Anchor attack/reopen: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show master:corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc | sed -n '185,189p'` returned:

```
// Enable using the BackForwardCache.
BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);

// Set a time limit for the page to enter the cache. Disabling this prevents
```

Thus the recorded anchor is exactly decoded source line 187, with the recorded comment at line 186. The reopened source corroborates the claimed anchor and adjacency. Receipt `corpus/evidence/round-26/sources/s106.json:4,14-18` records that URL and anchor/comment; its decoded digest/size at lines 10-12 match the recount. This reopening is a committed-source check, not a new network fetch.

Wave-1 findings folded into this attack: `RevC2Gate.md:12-14` identifies residual M1: the gate does not pin anchor text/URL to the frozen source, accepting a self-consistent fabricated receipt/bytes pair; the authentic pair at this tip passes. `ExecC2Reopen.md:34-49,190-225` records prior live-GET/byte-identity evidence and the earlier measurement-revision caveat; this report independently executes the requested current-tip counter, resolving its stated lack of a tip-revision counter run for this tested revision. `MutC2Gate.md:47-52,120-126` independently reports valid tip output and 5/5 selftest, while noting selftest coverage gaps for duplicate anchors and fabricated digest/key cases. No mutation fixtures were recreated in this scoped recount.

## Evidence classification

- Observed: exact command results above; source excerpt from the named `master` path; receipt values from the checked-in receipt.
- Inference: the displayed `master` source excerpt is the blob represented by the explicit commit tested by the gate; the commands use `master` for the source and a full hash for the counter, and no ref movement was measured here.
- Unknown: no fresh documented external GET was performed; this assignment asked to re-decode/reopen the committed URL anchor, not to fetch it. Gate provenance/content-pinning limitation remains as reported by RevC2Gate M1.

## Exact retained evidence

Commands executed verbatim:

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-s106-evidence.mjs --rev 5ed6484da66e6bf73654281d2e9ba3703f0c2ef0 --json
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-s106-evidence.mjs --selftest
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show master:corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc | sed -n '185,189p'
```

Risks/blockers: no blocker to recount. Gate's self-consistency/provenance limitation and the selftest coverage limits remain; see cited wave-1 findings. No builds, linters, formatters, git writes, fixture commits, or installs were run.
