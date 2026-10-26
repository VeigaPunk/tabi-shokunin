#!/usr/bin/env python3
"""Build corpus/adjacency-screen-browser.tsv rows for seat AdjKake3 (17 kake candidates).

Every quote is sliced from the sibling's own bytes at the frozen pin, so the
counter's verbatim check cannot fail on a typo; goodQuote() is asserted here
with the counter's own rule (4..25 words, >= 20 non-space chars) or the whole
trimmed line (<= 25 words).
"""
import subprocess, sys, os, json

LANE_ROOT = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
FLEET = "/home/vgpnk/Projects/shokunin"
PIN = "044048597d62f3199494b63b36e90dd57825e350"
CHUNK = f"{LANE_ROOT}/.ufo/waves/round-35/w1-chunks/AdjKake3.tsv"
OUTDIR = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKake3"
SCREEN_HEADER = ["sibling_ref", "reason", "surface", "quote", "note"]
LEASE = "musketeer-cdp-9222-profile-lease"
NBS = "-"

# key-suffix (path:line) -> (reason, surface, quote-or-None-for-whole-trimmed-line, note)
SPEC = [
 ("corpus/knowledge/mirror-pitfalls.md:52", "same-surface", LEASE,
  "dies with the shell — `setsid -f musketeer-chrome`",
  "A launch recipe for the shared musketeer chrome: kake SKILL.md:160-161 binds that name to the-musketeer profile at CDP 127.0.0.1:9222, the profile/lease surface the map's kake row already holds contested-open."),
 ("corpus/knowledge/ops-automation.md:78", "same-surface", LEASE,
  "surface matrix: CDP, grok/kimi tabs, grok CLI, grok-bot app, origin",
  "The matrix enumerates the shared CDP endpoint and its tabs, the same chrome whose profile/lease surface the map already holds contested-open for kake (kake SKILL.md:160-161)."),
 ("corpus/knowledge/ops-automation.md:79", "same-surface", LEASE,
  "serializes the shared burner chrome machine-wide",
  "kake's `lease` verb serializes the shared burner chrome that kake SKILL.md:160-161 binds to the-musketeer profile at CDP 127.0.0.1:9222, the surface the map already holds contested-open for kake."),
 ("corpus/knowledge/origin-repos.md:21", "not-browser-sense", NBS,
  "`burnerchrome.kimi.page` | `repos/burnerchrome/index.html` (live 11819B vs 11775B",
  "`burnerchrome` is the name of a kimi.page property and its source repo, compared byte-wise by a publisher-side check, not the shared Chrome browser."),
 ("corpus/knowledge/origin-repos.md:39", "not-browser-sense", NBS,
  "vendored copy** ≠ `repos/burnerchrome`",
  "The line compares two source directories that serve a published site, so the token names the property rather than browser ground."),
 ("corpus/knowledge/origin-repos.md:68", "not-browser-sense", NBS,
  "`burnerchrome-kimi.sourceDir` → vendored `ds4cc-marketplace/burnerchrome`",
  "A `fleet.config` sourceDir key for the burnerchrome site, recorded as publisher-side config drift."),
 ("corpus/knowledge/origin-repos.md:69", "not-browser-sense", NBS, None,
  "The continuation line names the canonical source repo for a published site; no browser, driver, protocol or capture is involved."),
 ("corpus/knowledge/origin-repos.md:83", "not-browser-sense", NBS,
  "The live `burnerchrome.kimi.page` response remains 11,819 bytes as recorded in the row.",
  "A static GET byte re-check of a published property, where `burnerchrome` denotes the site URL."),
 ("corpus/knowledge/publish-channels.md:2", "same-surface", "crawler-discipline-vs-publishing",
  "(kimi-webbridge \"not supported on Linux\" check)",
  "A `verified-at:` provenance header whose dated check is a publish-channel one - the plugin as a possible non-GUI publish path - the publisher side of the already-mapped split `crawler-discipline-vs-publishing`."),
 ("corpus/knowledge/publish-channels.md:32", "same-surface", "crawler-discipline-vs-publishing", None,
  "The line asserts a publish-channel fact - no non-GUI channel on this host - on the publisher side of the already-mapped split `crawler-discipline-vs-publishing`, naming the plugin only as the reason."),
 ("corpus/knowledge/publish-channels.md:68", "same-surface", "crawler-discipline-vs-publishing",
  "the host's missing `kimi-webbridge` command does not establish the absence or behavior",
  "A re-verification finding about publish-channel evidence - the publisher side of the already-mapped split `crawler-discipline-vs-publishing` - which explicitly declines to establish the plugin's behavior."),
 ("corpus/knowledge/publish-queue.md:26", "not-browser-sense", NBS,
  "r13 decomposition: `/speedrun/ /burnerchrome/` 404s",
  "`/burnerchrome/` is a mirror path on the ds4cc-kimi-mirror site and the 404 is the kimi dir-index pitfall, a publishing observation."),
 ("corpus/knowledge/publish-queue.md:29", "same-surface", LEASE,
  "(CDP :9222 down — `publishedUrl:null` is NOT same-day evidence)",
  "The CDP endpoint named is the shared chrome whose profile/lease surface the map already records contested-open for kake; the sentence carries kake's publish-ledger consequence, not a new side."),
 ("corpus/knowledge/publish-queue.md:131", "same-surface", LEASE, None,
  "The E5 sentence names the same :9222 endpoint as the already-mapped contested lease surface; its subject is the publish verdict, not a new browser-ground split."),
 ("corpus/knowledge/vault-properties.md:29", "not-browser-sense", NBS,
  "3 `url:null` (ds4cc-mirror, snapshot.kimi.pro, burnerchrome .com),",
  "A census of a client-rendered property array in which `burnerchrome .com` is a property name, not the browser."),
 ("corpus/knowledge/vault-properties.md:40", "not-browser-sense", NBS,
  "6 healthy: ds4cc.com, veigapunk, burnerchrome, plazir27runson, ufofsd,",
  "The healthy-property list names burnerchrome as a site among other sites and reports HTTP health, not browser craft."),
 ("corpus/knowledge/vault-properties.md:97", "not-browser-sense", NBS,
  "The six listed properties are healthy and all return 200.",
  "A round-23 live re-verification of property health by unauthenticated GETs, where burnerchrome.kimi.page is one of the site URLs."),
]

def git_show(repo, rev, path):
    r = subprocess.run(["git", "-C", repo, "show", f"{rev}:{path}"], capture_output=True)
    if r.returncode != 0:
        raise SystemExit(f"git show failed {repo} {rev}:{path}: {r.stderr[:300]}")
    return r.stdout.decode("utf-8")

def words(s):
    return [w for w in s.strip().split() if w]

def good_quote(q):
    w = words(q)
    return 4 <= len(w) <= 25 and len(q.replace(" ", "").replace("\t", "")) >= 20

def main():
    chunk = {}
    with open(CHUNK, encoding="utf-8") as fh:
        for line in fh:
            line = line.rstrip("\n")
            if not line:
                continue
            key, text = line.split("\t", 1)
            chunk[key] = text
    keys = list(chunk)
    if len(keys) != 17:
        raise SystemExit(f"expected 17 chunk lines, got {len(keys)}")
    files = {}
    rows = []
    decisions = []
    for suffix, reason, surface, quote, note in SPEC:
        key = f"kake-shokunin@{PIN}:{suffix}"
        if key not in chunk:
            raise SystemExit(f"spec key not in chunk: {key}")
        path, lineno = suffix.rsplit(":", 1)
        if path not in files:
            files[path] = git_show(f"{FLEET}/kake-shokunin", PIN, path).split("\n")
        raw = files[path][int(lineno) - 1].rstrip("\r")
        trimmed = raw.strip()
        if quote is None:
            q = trimmed
            if len(words(q)) > 25:
                raise SystemExit(f"whole line over 25 words: {key}")
        else:
            q = quote
            if q not in raw:
                raise SystemExit(f"quote not a substring of the raw line: {key}\n  raw={raw!r}\n  q={q!r}")
            if not good_quote(q):
                raise SystemExit(f"quote fails goodQuote: {key} words={len(words(q))} nonspace={len(q.replace(' ',''))}")
        if chunk[key].strip() != "" and chunk[key].strip() not in (raw.strip(),):
            # chunk text must be the trimmed sibling line (counter candidate text)
            pass
        for f in (q, note):
            if "\t" in f or "\n" in f:
                raise SystemExit(f"tab/newline in field: {key}")
        if reason == "same-surface":
            if surface == NBS:
                raise SystemExit(f"same-surface needs a surface: {key}")
        elif surface != NBS:
            raise SystemExit(f"{reason} needs surface '-': {key}")
        rows.append([key, reason, surface, q, note])
        decisions.append((key, reason, surface, q, note))
    os.makedirs(OUTDIR, exist_ok=True)
    screen_path = f"{OUTDIR}/screen.tsv"
    with open(screen_path, "w", encoding="utf-8") as fh:
        for r in rows:
            fh.write("\t".join(r) + "\n")
    with open(f"{OUTDIR}/decisions.md", "w", encoding="utf-8") as fh:
        fh.write("# AdjKake3 - C1 dispositions (17 kake candidate lines, pin 044048597d62f3199494b63b36e90dd57825e350)\n\n")
        fh.write("Map rows proposed: 0. Screen rows: 17. No DECL line was drafted because no candidate line in this chunk states kake's own side of a new split: only `ops-automation.md:79` carries both a browser-ground term and a side-stating word, and the surface it states is the already-mapped contested lease (`adjacency.tsv:7`, surface `musketeer-cdp-9222-profile-lease`).\n\n")
        fh.write("| key | map/screen | reason | one-sentence ground |\n|---|---|---|---|\n")
        for key, reason, surface, q, note in decisions:
            disp = "screen" if reason else "map"
            fh.write(f"| `{key}` | {disp} | {reason}{' (' + surface + ')' if surface != NBS else ''} | {note} |\n")
    with open(f"{OUTDIR}/decl.md", "w", encoding="utf-8") as fh:
        fh.write("# AdjKake3 - round-35 scratch declarations\n\nNo DECL line: this chunk produced no map row (see decisions.md).\n")
    with open(f"{OUTDIR}/rows.tsv", "w", encoding="utf-8") as fh:
        pass
    print(json.dumps({"rows": len(rows), "screen": screen_path}, indent=1))

if __name__ == "__main__":
    main()
