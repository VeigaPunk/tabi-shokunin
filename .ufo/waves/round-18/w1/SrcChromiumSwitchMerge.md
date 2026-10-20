# SrcChromiumSwitchMerge — Chromium 154 duplicate-switch merge (w1 report)

VERDICT: PASS

Seat `TabiR18.SrcChromiumSwitchMerge` (leaf). Source document:
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/sources/SrcChromiumSwitchMerge.md`.
Question answered: of two `--enable-features=` tokens on one Chromium 154 command line, **the last
one survives and the earlier one is discarded whole — there is no union across tokens**; and for a
feature named in both lists, disable beats enable.

## Findings

1. **Overwrite on append.** `AppendSwitchesAndArguments` walks argv in order
   (`base/command_line.cc:648`, calls `AppendSwitchNative` at `:668-669`); `AppendSwitchNative`
   stores `switches_[std::string(key)] = StringType(value);` (`:454`). The only other branch needs a
   `DuplicateSwitchHandler`, whose global is `nullptr` unless an embedder installs one
   (`:43` declaration, `:186-189` setter). Verified by reading the tag, not by launching a browser.
2. **One value per name on read.** `GetSwitchValueNative` is a single `switches_.find`
   (`:419-424`); `GetSwitchValueASCII` wraps it (`:380-382`). No multi-value accessor exists.
3. **Argv can still show both tokens.** `AppendSwitchNative` also inserts the switch into `argv_`
   (`:457-467`), so a launcher that passed two tokens yields a browser argv with two while the map
   keeps one — token counting is the right probe, and two tokens already mean the first list is dead.
4. **The consumer reads the deduped value.** `components/variations/service/variations_field_trial_creator.cc:304-306`
   passes `GetSwitchValueASCII(kEnableFeatures)` / `(kDisableFeatures)` into
   `FeatureList::InitFromCommandLine`; `FeatureList` never sees the dropped list. (Supporting file at
   the same tag, sha256 `ecc463dbaa4c44cf06172f83486cddbc5806a0189d93ab6b75a95e7d8e0e0265`.)
5. **Disable wins per name.** `base/feature_list.cc:449-453` registers the disable list first, enable
   second, and `RegisterOverride` uses `emplace()` — a name in both lists ends disabled.
6. **One list is comma-split with empty tokens dropped.** `SplitFeatureListString` =
   `SplitStringPiece(input, ",", TRIM_WHITESPACE, SPLIT_WANT_NONEMPTY)` (`feature_list.cc:872-875`);
   each entry may carry at most one `:`, `.` and `<` part (`:308-329`, `:878-917`).
7. **A malformed entry fails the whole list, silently in release.** `ParseEnableFeatures` returns
   false on one bad entry (`feature_list.cc:350-353`); `InitFromCommandLine` only `DCHECK`s that
   (`:424-429`) and `parsed_enable_features` starts empty (`:421`), so [INFERENCE] a release build
   registers no overrides at all. Not executed; the DCHECK configuration of the lane's Chromium was
   not inspected.

Fetches (read-only GET, no credentials): gitiles `?format=TEXT` base64, HTTP 200, raw sha256
`edd7d45a01cb9c290f4f9288d08553f9fa98422eb49eeddcef81c50b886ce991` (`command_line.cc`, 39,224 B) and
`6e399c8bdbacc94239fb64812bb868c59b1a1a037e4a3903dee9b3247a788ed8` (`feature_list.cc`, 78,032 B);
decoded sha256 `05eb1d1afc5f24dfb1d3c2ee0f709a39f37643f86dd7a9cac3ff2a8d7699bb53` (29,417 B, 860 lines)
and `ffac846218de0bcdab248b6d4fd6cbba788d00045db297bed9df5423ce277c45` (58,523 B, 1,532 lines), each
byte-identical to the same file fetched raw from `raw.githubusercontent.com/chromium/chromium/154.0.8037.97`.
Tag `154.0.8037.97` resolves to commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` via
`api.github.com/repos/chromium/chromium/git/ref/tags/154.0.8037.97` (fetched 2026-10-20).

## PLAN §C2 S1 — contradiction?

**None.** S1 demands "exactly one `--enable-features=` and at most one `--disable-features=` token …
union of intended features preserved". Chromium keeps one value per switch name, so a single token is
the only way a union can exist; the requirement is the same fact seen from argv and from the map.
Three sharpenings (no PLAN text change implied):

- Union must be composed by the launcher; Chromium never merges two tokens.
- "Union of intended features" cannot include a name also passed to `--disable-features` — disable
  wins (F5 above).
- Argv can also under-report: a malformed merged list leaves argv looking right while nothing is
  registered (F7). S1's token assertion is necessary but not sufficient; a behavioural check that an
  intended feature reports enabled would close the gap.

## Registry row draft (11 cells, no `|` inside cells)

| S0?? | Chromium 154 base/command_line.cc — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/base/command_line.cc?format=TEXT | code | A | Duplicate-switch resolution and feature-list parsing in Chromium 154, where the effective `--enable-features` value is decided | tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d), command_line.cc:43, 344-352, 419-424, 449-467, 643-669; feature_list.cc:417-453, 872-875; decoded sha256 05eb1d1a…bb53 and ffac8462…7c45 | Switches are keyed by name and the last occurrence overwrites the map entry, so a second `--enable-features=` discards the first list; a harness must emit one merged comma list and expect `--disable-features` to beat `--enable-features` for the same feature | mined | 2026-10-20 | on-release | corpus/knowledge/harness-hardening-round-18.md |

Structural check, run against a `/tmp` copy of the registry (the lane registry itself was not written):
row inserted with id `S059` after `| S057 |`, `node scripts/check-sources.mjs --root /tmp/tabi-r18-srcgate
--file corpus/SOURCES.md` → `SOURCES_GATE verdict=failed rows=58 tiers=A:47,B:4,C:7
status=queued:8,mined:43,rejected:7 findings=3`; the three findings are `E11 path_missing` on S028 and
S029, whose `used-by` paths are non-`corpus/knowledge` files absent from the temp root — **no finding
names S059**. Counts move 57→58 rows, A46→47, mined42→43 as expected.

Integration note for L1: assign the real id and have `corpus/knowledge/harness-hardening-round-18.md`
(seat `DraftNoteHarness`) cite it, or set `status queued` / `used-by —` until that note lands. No row at B
cites `base/command_line.cc` or `base/feature_list.cc`, so no `E04` duplicate URL.

## Gate entry

| Field | Value |
|---|---|
| URL | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/base/command_line.cc?format=TEXT |
| access date | 2026-10-20 |
| revision | tag `154.0.8037.97`, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, blob `3a95f227d419ebe02319c065f3cdedf2a65c69a4` |
| quote + location | "if (g_duplicate_switch_handler) { g_duplicate_switch_handler->ResolveDuplicate(key, value, switches_[std::string(key)]); } else { switches_[std::string(key)] = StringType(value); }" — `base/command_line.cc:449-455` (13 words) |
| sha256 | decoded `05eb1d1afc5f24dfb1d3c2ee0f709a39f37643f86dd7a9cac3ff2a8d7699bb53`; as served (base64) `edd7d45a01cb9c290f4f9288d08553f9fa98422eb49eeddcef81c50b886ce991` |

Secondary quote inside the same source (23 words, `base/feature_list.cc:449-453`, file decoded sha256
`ffac846218de0bcdab248b6d4fd6cbba788d00045db297bed9df5423ce277c45`):
"// Process disabled features first, so that disabled ones take precedence over // enabled ones (since RegisterOverride() uses emplace()). RegisterOverridesFromCommandLine(disable_features, OVERRIDE_DISABLE_FEATURE); RegisterOverridesFromCommandLine(parsed_enable_features, OVERRIDE_ENABLE_FEATURE);"

## normalize-only output (pasted verbatim)

```
$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode base64 --body /tmp/tabi-r18-switchmerge/command_line.cc.b64 --quote '<quote 1>'
{"found":true,"offset":13888,"normalizedLength":27201,"window":"ew switch_key = switch_string; StringType combined_switch_string(switch_key); #endif size_t prefix_length = GetSwitchPrefixLength(combined_switch_string); auto key = switch_key.substr(prefix_length); if (g_duplicate_switch_handler) { g_duplicate_switch_handler->ResolveDuplicate(key, value, switches_[std::string(key)]); } else { switches_[std::string(key)] = StringType(value); } // Preserve existing switch prefixes in |argv_|; only append one if necessary. if (prefix_length == 0) { combined_switch_string.insert(0, kSwitchPrefixes[0].data(), kSwitchPrefixes[0].size()); } if "}

$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode base64 --body /tmp/tabi-r18-switchmerge/feature_list.cc.b64 --quote '<quote 2>'
{"found":true,"offset":15639,"normalizedLength":52391,"window":"_trials_result = FieldTrialList::CreateTrialsFromString(force_fieldtrials); DCHECK(create_trials_result) << StringPrintf(\"Invalid field trials are specified in --%s.\", ::switches::kEnableFeatures); } // Process disabled features first, so that disabled ones take precedence over // enabled ones (since RegisterOverride() uses emplace()). RegisterOverridesFromCommandLine(disable_features, OVERRIDE_DISABLE_FEATURE); RegisterOverridesFromCommandLine(parsed_enable_features, OVERRIDE_ENABLE_FEATURE); initialized_from_command_line_ = true; } void FeatureList::InitFromSharedMemory(PersistentMemoryAllocator* allocator) { DCHECK(!initialized_); PersistentMemoryAllocator::Iterator iter(allocator); con"}
```

Both exit 0 (`found:true`). A first attempt at quote 2 without the wrapped comment's second `//`
returned `{"found":false,"offset":-1,"normalizedLength":52391,"window":null}` (exit 1); the pasted
quote is the corrected verbatim continuation.

## Limits

- Static source read only; no browser was launched and no two-token run was made. The answer is the
  code path at the tag.
- The duplicate-handler default (nullptr) was read; embedders that install a handler were not
  enumerated — the claim is scoped to "no handler installed on this path".
- F7's release effect is [INFERENCE]; the `DCHECK` call site is observed, its compiled-out behaviour
  is not.
- Tooling: no tools installed or upgraded. `/tmp/tabi-r18-switchmerge` and `/tmp/tabi-r18-srcgate`
  were deleted after the reads.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/sources/SrcChromiumSwitchMerge.md
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/SrcChromiumSwitchMerge.md
