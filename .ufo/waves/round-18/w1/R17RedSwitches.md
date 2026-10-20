VERDICT: PASS

# Round-18 W1 red-before evidence — S1 and F6

Baseline B: `2bff864fdfee684ddbcd066cc8e735adaba2735c`. The lane's `refs/heads/master` was B. All probes ran in separate `git clone --no-hardlinks` sandboxes; no lane implementation files were changed. Temporary sandbox clones and the generated receipt were removed after extracting the evidence. No tools were installed or updated.

## S1 — round-17 harness has duplicate feature switches at B

Command in the sandbox checked out at B:

```text
NODE_PATH=/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-13/aria/node_modules /run/user/1000/fnm_multishells/4348_1792501188326/bin/node /tmp/tabi-r18-R17RedSwitches-s1/repo/scripts/webmcp-invoke-round17.mjs --out /tmp/tabi-r18-R17RedSwitches-s1/receipt.json
```

Exit `0`; stdout ended `WEBMCP_INVOKE verdict=pass cases=11 passed=11 failed=0 missing=0 controls=4 out=/tmp/tabi-r18-R17RedSwitches-s1/receipt.json`. Receipt verdict `pass`, Chromium `Chrome/154.0.8037.97`, 3 launches. Receipt SHA-256: `ee1a06fcee8c31a122f68ee322267bf252f9be4b0bab41330d19bce3d0becd57`. Producer SHA-256 in the receipt, matching the harness blob: `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`.

The following values were extracted from each receipt run's `effectiveArgv` using `jq`; token counts are exact `--enable-features=` / `--disable-features=` counts. `D` below is the full token `--disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,BlockOriginHeaderModificationOnRedirect,Translate,AutoDeElevate,OptimizationHints,NetworkTimeServiceQuerying,AimEnabled,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion`.

- `flagged` (pid `957505`, effective argv length 49): enable count **2**, values `--enable-features=CDPScreenshotNewSurface` and `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp`; disable count **1**, value `D`.
- `flag-off` (pid `960957`, effective argv length 47): enable count **1**, value `--enable-features=CDPScreenshotNewSurface`; disable count **1**, value `D`.
- `domain-disabled` (pid `974454`, effective argv length 49): enable count **1**, value `--enable-features=CDPScreenshotNewSurface`; disable count **2**, values `D` and `--disable-features=DevToolsWebMCPSupport`.

The separate Blink switches were `--enable-blink-features=WebMCP,WebMCPTesting` (flagged), none (flag-off), and `--enable-blink-features=WebMCP` (domain-disabled); they are not included in the counts above.

**S1 is red at B:** `flagged` violates the one-enable-token bound, and `domain-disabled` violates the at-most-one-disable-token bound. Chromium source supports the loss interpretation: in the default branch of `CommandLine::AppendSwitchNative`, line 454 assigns the current value into the keyed switch map (`base/command_line.cc:436-455`; the duplicate handler is initialized null at line 43). Thus the flagged run's earlier `CDPScreenshotNewSurface` enable value is superseded by the later WebMCP list; the domain-disabled run's earlier `D` disable list is superseded by `DevToolsWebMCPSupport`. Those earlier feature values are silently lost rather than merged.

Chromium source fetched by read-only GET from `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/base/command_line.cc?format=TEXT`, base64-decoded body SHA-256 `05eb1d1afc5f24dfb1d3c2ee0f709a39f37643f86dd7a9cac3ff2a8d7699bb53` (29,417 decoded bytes). Quote (line 454, 3 code tokens): `switches_[std::string(key)] = StringType(value);`

## F6 — `check-freshness --witness HEAD` accepts off-branch HEAD at B

In a separate sandbox cloned at B, checked out detached at B, then made empty off-branch commit P while detached. Observed `HEAD=P=2bd63645c7577fc33ae61b01158e53d35ea7a462`; `HEAD` was detached; `refs/heads/master` remained the lane tip `2bff864fdfee684ddbcd066cc8e735adaba2735c`.

HEAD arm command: `node scripts/check-freshness.mjs --witness HEAD`.

```text
exit=0
first: PIN_MATCH target=corpus/knowledge/arc-synthesis.md sha256=f42428bd9af738c5dc0ec5361edd56e667acf84b6c96d23459bc5d46ab0a9269 newlines=183
last:  FRESHNESS_GATE verdict=clean finding=freshness_witness matched=34 unique=34 lane=31 public=3 revision=HEAD baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production
```

Lane-tip arm used the dynamically resolved `git -C /tmp/tabi-r18-R17RedSwitches-f6/repo rev-parse --verify refs/heads/master` value via `xargs` as the `--witness` argument; resolved value was `2bff864fdfee684ddbcd066cc8e735adaba2735c` (equivalent argument to `--witness "$(git rev-parse --verify refs/heads/master)"`).

```text
exit=0
first: PIN_MATCH target=corpus/knowledge/arc-synthesis.md sha256=f42428bd9af738c5dc0ec5361edd56e667acf84b6c96d23459bc5d46ab0a9269 newlines=183
last:  FRESHNESS_GATE verdict=clean finding=freshness_witness matched=34 unique=34 lane=31 public=3 revision=2bff864fdfee684ddbcd066cc8e735adaba2735c baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production
```

Both witnesses pass, while `HEAD` names P and the lane tip remains B. This reproduces F6: the byte-frozen gate accepts the symbolic witness and reports clean for a revision other than the lane tip. Source pointers at B: `scripts/check-freshness.mjs:49` accepts any `--witness` value not beginning `--`; `:65` resolves its commit time; `:68` checks baseline ancestry; `:114` prints the supplied witness as `revision=`.

## Risks and blockers

These are baseline-only red-before observations, not a fix or a claim about other Chromium versions. No blockers.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/R17RedSwitches.md`
