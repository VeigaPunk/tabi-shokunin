# SrcChromiumSwitchMerge — Chromium 154 duplicate-switch merge and feature-list parsing (source open, round 18)

VERDICT: PASS

Seat `TabiR18.SrcChromiumSwitchMerge`. Opened 2026-10-20. Purpose: settle, from the build's own
source, which of two `--enable-features=` tokens survives on one Chromium 154 command line and how
that single value is parsed — the fact C2 hazard S1 relies on (PLAN §C2: "exactly one
`--enable-features=` and at most one `--disable-features=` token in every launched browser's
effective argv, union of intended features preserved").

**Answer:** the **last** `--enable-features=` token wins; every earlier one is dropped whole. There
is no union across tokens — the only way to keep N features is one comma-separated value. And for a
feature named in both lists, disable beats enable.

## Opened source

| Field | Value |
|---|---|
| canonical URL | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/base/command_line.cc?format=TEXT |
| grep-able URL (no `?format=TEXT`) | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/base/command_line.cc |
| revision | tag `154.0.8037.97` → commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (`/repos/chromium/chromium/git/ref/tags/154.0.8037.97`, fetched 2026-10-20); git blob `3a95f227d419ebe02319c065f3cdedf2a65c69a4` (local `git hash-object` of the decoded bytes) |
| access date | 2026-10-20 |
| raw-fetch sha256 (as served, base64, 39,224 B) | `edd7d45a01cb9c290f4f9288d08553f9fa98422eb49eeddcef81c50b886ce991` |
| decoded sha256 (29,417 B, 860 lines) | `05eb1d1afc5f24dfb1d3c2ee0f709a39f37643f86dd7a9cac3ff2a8d7699bb53` |
| anchor | `CommandLine::InitFromArgv` 344-352; `GetSwitchValueNative` 419-425; `AppendSwitchNative` 436-468; `AppendSwitchesAndArguments` 643-677; duplicate-handler global 43 and setter 186-189 |
| kind / tier / recheck | `code` / **A**, scoped to the switch-merge semantics of this pinned tag / `on-release` |
| second file (same row's teaching, not the row URL) | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/base/feature_list.cc?format=TEXT — raw `6e399c8bdbacc94239fb64812bb868c59b1a1a037e4a3903dee9b3247a788ed8` (78,032 B base64), decoded `ffac846218de0bcdab248b6d4fd6cbba788d00045db297bed9df5423ce277c45` (58,523 B, 1,532 lines), blob `638645475a4318b769d48ceafcfa9cf0161c17ca` |

## The proof, in order

- **F1 — argv is parsed left to right.** `InitFromArgv` clears `switches_` and hands `argv[1..]` to
  `AppendSwitchesAndArguments` (`command_line.cc:344-352`); that function's `for (StringType arg :
  argv)` (`:648`) reaches `AppendSwitchNative(switch_string, …)` once per token (`:668-669`).
- **F2 — the map is keyed by switch name and overwritten.** After stripping the `--` prefix,
  `switches_[std::string(key)] = StringType(value);` (`:454`). The only alternative branch needs a
  `DuplicateSwitchHandler`, and the global is `nullptr` unless an embedder installs one
  (`:43` declaration, `:186-189` setter). No handler is installed on this path, so the later token
  replaces the earlier token's value.
- **F3 — one value per name on read.** `GetSwitchValueNative` does a single `switches_.find` and
  returns that entry (`:419-424`); `GetSwitchValueASCII` wraps it (`:380-382`). There is no
  "all values" accessor on `CommandLine`.
- **F4 — the argv text can still show two tokens.** `AppendSwitchNative` also inserts the combined
  switch into `argv_` (`:457-467`), so the browser's own argv keeps both `--enable-features=` tokens
  while the lookup map holds only the last. Consequence for a harness: counting tokens in the
  launched argv is the right probe, and two tokens mean the first list is dead even though it is
  visible.
- **F5 — the consumer reads the deduped value.** `components/variations/service/variations_field_trial_creator.cc:304-306`
  calls `feature_list->InitFromCommandLine(command_line->GetSwitchValueASCII(::switches::kEnableFeatures),
  command_line->GetSwitchValueASCII(::switches::kDisableFeatures));` — two plain strings, so
  `FeatureList` never sees the discarded list.
- **F6 — disabled beats enabled for the same name.** `InitFromCommandLine` registers the disable list
  first and the enable list second (`feature_list.cc:451-453`); the comment at `:449-450` states why
  ("disabled ones take precedence … since RegisterOverride() uses emplace()"). A name present in both
  lists ends disabled.
- **F7 — one list is comma-split, trimmed, empties dropped.** `SplitFeatureListString` is
  `SplitStringPiece(input, ",", TRIM_WHITESPACE, SPLIT_WANT_NONEMPTY)` (`feature_list.cc:872-875`);
  entries may carry `Feature:param`, `Feature.group`, `Feature<Study` parts, each separator at most
  once (`:308-329`, `:878-917`). Entries are then joined back into one comma list (`:367-373`).
- **F8 — a malformed entry fails the whole list, silently in release.** `ParseEnableFeatures` returns
  false as soon as one entry fails (`feature_list.cc:350-353`); `InitFromCommandLine` only DCHECKs
  that result (`:424-429`), and `parsed_enable_features` starts empty (`:421`). With DCHECK compiled
  out, [INFERENCE] an unparsable `--enable-features=` therefore registers no overrides at all, so a
  malformed merge turns the whole intended set off without a runtime error.

## Verbatim quotes

**Quote 1 — which of the two survives** (13 words; `command_line.cc:449-455`; file sha256
`05eb1d1a…bb53`):

> `if (g_duplicate_switch_handler) { g_duplicate_switch_handler->ResolveDuplicate(key, value, switches_[std::string(key)]); } else { switches_[std::string(key)] = StringType(value); }`

**Quote 2 — disable registered before enable** (23 words; `feature_list.cc:449-453`; file sha256
`ffac8462…7c45`; the comment runs across both lines, hence the second `//`):

> `// Process disabled features first, so that disabled ones take precedence over // enabled ones (since RegisterOverride() uses emplace()). RegisterOverridesFromCommandLine(disable_features, OVERRIDE_DISABLE_FEATURE); RegisterOverridesFromCommandLine(parsed_enable_features, OVERRIDE_ENABLE_FEATURE);`

## What it teaches the lane, one line

A second `--enable-features=` silently replaces the first, so the hardened harness must merge every
intended feature into exactly one comma-separated token (never append a second), and must not expect
a feature listed in `--disable-features` to come back on.

## PLAN §C2 S1 — contradiction check

**No contradiction.** PLAN §C2's S1 ("exactly one `--enable-features=` … union of intended features
preserved") is the only shape this source permits: union across two tokens is impossible because the
map keeps one value (F2-F5), so "union preserved" and "exactly one token" are the same requirement
seen from argv and from the map. Three sharpenings, none of which changes the PLAN text:

1. **Union must be built before the launch, not by the browser.** `split`/join above means the
   harness may concatenate `A,B` itself; Chromium will not.
2. **"Union of intended features" excludes names also in `--disable-features`.** F6 makes disable
   win per name; a probe that asserts a feature enabled while also disabling it would be green on
   argv and wrong at runtime.
3. **Argv can lie about the effective set in the other direction too.** F4 keeps both tokens in the
   browser's argv; F8 means a malformed merged list can leave argv looking correct while no override
   is registered. A behavioural probe (a known feature actually reported on) is stronger than token
   counting; S1's argv assertion is necessary but not sufficient. [INFERENCE on F8's release effect —
   not executed; DCHECK build config of the lane's Chromium not inspected.]

## Supporting file opened at the same tag (not the row URL)

| path | sha256 (decoded) | role |
|---|---|---|
| `components/variations/service/variations_field_trial_creator.cc` (37,643 B, blob `5f9f039faa263b644463bd72e318f1cd1c506c95`) | `ecc463dbaa4c44cf06172f83486cddbc5806a0189d93ab6b75a95e7d8e0e0265` | the call site that hands the two deduped switch values to `FeatureList::InitFromCommandLine` (`:304-306`) |

## Cross-host byte check

`base/command_line.cc` and `base/feature_list.cc` were fetched twice: raw on
`raw.githubusercontent.com/chromium/chromium/154.0.8037.97/<path>` (plain text, HTTP 200) and on
`chromium.googlesource.com/…?format=TEXT` (base64, HTTP 200). The decoded gitiles bytes hash
**exactly** to the raw GitHub bytes — `05eb1d1a…bb53` and `ffac8462…7c45` — so the digests above are
not host-specific.

## normalize-only probe output

Command (quote 1):

```
node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode base64 --body /tmp/tabi-r18-switchmerge/command_line.cc.b64 --quote 'if (g_duplicate_switch_handler) { g_duplicate_switch_handler->ResolveDuplicate(key, value, switches_[std::string(key)]); } else { switches_[std::string(key)] = StringType(value); }'
```

```json
{"found":true,"offset":13888,"normalizedLength":27201,"window":"ew switch_key = switch_string; StringType combined_switch_string(switch_key); #endif size_t prefix_length = GetSwitchPrefixLength(combined_switch_string); auto key = switch_key.substr(prefix_length); if (g_duplicate_switch_handler) { g_duplicate_switch_handler->ResolveDuplicate(key, value, switches_[std::string(key)]); } else { switches_[std::string(key)] = StringType(value); } // Preserve existing switch prefixes in |argv_|; only append one if necessary. if (prefix_length == 0) { combined_switch_string.insert(0, kSwitchPrefixes[0].data(), kSwitchPrefixes[0].size()); } if ("}
```

Command (quote 2):

```
node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode base64 --body /tmp/tabi-r18-switchmerge/feature_list.cc.b64 --quote '// Process disabled features first, so that disabled ones take precedence over // enabled ones (since RegisterOverride() uses emplace()). RegisterOverridesFromCommandLine(disable_features, OVERRIDE_DISABLE_FEATURE); RegisterOverridesFromCommandLine(parsed_enable_features, OVERRIDE_ENABLE_FEATURE);'
```

```json
{"found":true,"offset":15639,"normalizedLength":52391,"window":"_trials_result = FieldTrialList::CreateTrialsFromString(force_fieldtrials); DCHECK(create_trials_result) << StringPrintf(\"Invalid field trials are specified in --%s.\", ::switches::kEnableFeatures); } // Process disabled features first, so that disabled ones take precedence over // enabled ones (since RegisterOverride() uses emplace()). RegisterOverridesFromCommandLine(disable_features, OVERRIDE_DISABLE_FEATURE); RegisterOverridesFromCommandLine(parsed_enable_features, OVERRIDE_ENABLE_FEATURE); initialized_from_command_line_ = true; } void FeatureList::InitFromSharedMemory(PersistentMemoryAllocator* allocator) { DCHECK(!initialized_); PersistentMemoryAllocator::Iterator iter(allocator); con"}
```

A first attempt at quote 2 without the wrapped comment's second `//` returned `{"found":false,
"offset":-1,…}`; the quote above is the corrected verbatim continuation of `feature_list.cc:449-450`.

## Registry row draft (11 cells, no `|` inside cells)

| S0?? | Chromium 154 base/command_line.cc — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/base/command_line.cc?format=TEXT | code | A | Duplicate-switch resolution and feature-list parsing in Chromium 154, where the effective `--enable-features` value is decided | tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d), command_line.cc:43, 344-352, 419-424, 449-467, 643-669; feature_list.cc:417-453, 872-875; decoded sha256 05eb1d1a…bb53 and ffac8462…7c45 | Switches are keyed by name and the last occurrence overwrites the map entry, so a second `--enable-features=` discards the first list; a harness must emit one merged comma list and expect `--disable-features` to beat `--enable-features` for the same feature | mined | 2026-10-20 | on-release | corpus/knowledge/harness-hardening-round-18.md |

Integration note for L1: assign the real id (PLAN says the C2 rows start at S059) and make
`corpus/knowledge/harness-hardening-round-18.md` — drafted by seat `DraftNoteHarness` — cite that id;
`scripts/check-sources.mjs` reports `used_by_missing` until the note exists and `used_by_uncited`
until it names the id. If the note is not committed in this round, the alternative is `status
queued` with `used-by —`. URL is distinct from every row at B (no row cites `base/command_line.cc` or
`base/feature_list.cc`), so no `E04`. Scope cell is one sentence and the anchor cell names both
files, so a future C1 recheck of the row URL covers `command_line.cc` only — the `feature_list.cc`
digest is recorded here for a second row if the L1 prefers one URL per row.

## Gate entry

| Field | Value |
|---|---|
| URL | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/base/command_line.cc?format=TEXT |
| access date | 2026-10-20 |
| revision | tag `154.0.8037.97`, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, blob `3a95f227d419ebe02319c065f3cdedf2a65c69a4` |
| quote + location | "if (g_duplicate_switch_handler) { g_duplicate_switch_handler->ResolveDuplicate(key, value, switches_[std::string(key)]); } else { switches_[std::string(key)] = StringType(value); }" — `base/command_line.cc:449-455` (13 words) |
| sha256 | decoded `05eb1d1afc5f24dfb1d3c2ee0f709a39f37643f86dd7a9cac3ff2a8d7699bb53`; as served (base64) `edd7d45a01cb9c290f4f9288d08553f9fa98422eb49eeddcef81c50b886ce991` |

## Limits

- Static read only. No browser was launched by this seat and no `--enable-features=` run was made;
  the answer is the code path, not an observation of a live process.
- The duplicate-handler default was read at `command_line.cc:43` (nullptr). Embedders that call
  `SetDuplicateSwitchHandler` were not enumerated; the claim is limited to "on this path, with no
  handler installed, last write wins".
- F8's release behaviour is [INFERENCE] from `DCHECK` semantics as read, not from a build.
- `feature_list.cc` is cited inside this row's anchor rather than as its own row URL; see the
  integration note.
- Credentials: none used; every fetch was an unauthenticated read-only GET; the `/tmp` working
  directory was deleted after the reads.
