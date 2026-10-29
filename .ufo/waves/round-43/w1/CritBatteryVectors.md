# CritBatteryVectors — Round 43 C1 battery adequacy

**Impacted axes:** coverage (primary), operability (battery control works for the tested vectors).

**Counterexample / finding:** `NODE_COMPILE_CACHE=/fast/scratch/hyaku/tabi-r43/CritBatteryVectors/node-compile-cache` passed to the frozen `scripts/measure-c1-round43.mjs --battery-probe` returned **exit 0**, `contaminated:false`, and `finding:null`. This is a new Node runtime-environment vector not represented by the six attack cases. The frozen `FORBIDDEN_ENV` expression does not include `NODE_COMPILE_CACHE`; `selfEnvCheck()` only reports names matching that expression. By the seat criterion, the accepted vector is a gate hole. This establishes a missed environment-boundary vector, not arbitrary-code execution or a do-nothing browser reach.

**Evidence:** `w1/CritBatteryVectors/evidence.txt` records the exact commands and outputs. The measure-script and Node SHA-256 values matched the frozen claims pins. Two new `NODE_OPTIONS` variants (`--redirect-warnings` and `--openssl-config`) both refused with exit 2 / `environment-loader-contamination`. A BASH_ENV marker test through `--battery` returned `allPass:true` and left the marker absent; the battery's spawn uses `scrubEnv()`, so this attempt did not expose BASH_ENV to its bash children.

**Smallest safe correction:** do not change the frozen round-43 bytes. Route this as a finding; for a future authorized freeze, add `NODE_COMPILE_CACHE` to the forbidden environment names and add a `--battery` spawn case asserting exit 2 with the expected finding (or explicitly narrow the claimed environment boundary if this variable is intentionally out of scope).

**Limitations:** only the frozen probe and its battery mode were exercised. I did not demonstrate cache poisoning or run the full Firefox measurement chain. No install or upgrade was performed; `RULES.md` was read first.

VERDICT finding NODE_COMPILE_CACHE is accepted by --battery-probe, so the current battery misses a runtime-environment vector.
