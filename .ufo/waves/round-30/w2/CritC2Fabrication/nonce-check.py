import re, base64, datetime, sys
pat = re.compile(r"__CF\$cv\$params\s*=\s*\{\s*r:\s*'([0-9a-f]+)'\s*,\s*t:\s*'([^']+)'")
files = {
 "receipt (FetchS182, claimed 06:40:02Z)": "corpus/evidence/round-30/frontier/bytes/S117.html",
 "refetch (ScribeEntryDiscordHeaders, claimed 06:40:32Z)": "corpus/evidence/round-30/frontier/refetch/bytes/S117-refetch.html",
 "seat live-verify (claimed 06:46:37Z)": ".ufo/waves/round-30/w1/ScribeEntryDiscordHeaders/fetch/live-verify.html",
 "ScribeQuoteGrounding fetchA (claimed 06:41:18Z)": ".ufo/waves/round-30/w1/ScribeQuoteGrounding/refetch-discord/rate-limits.fetchA.html",
 "ScribeQuoteGrounding fetchB (claimed 06:42:50Z)": ".ufo/waves/round-30/w1/ScribeQuoteGrounding/refetch-discord/rate-limits.html",
 "CritC2Fabrication live (mine, 07:40:49Z)": ".ufo/waves/round-30/w2/CritC2Fabrication/live/S117-live.html",
}
for k, p in files.items():
    b = open(p, "rb").read().decode("utf-8", "replace")
    m = pat.search(b)
    if not m:
        print(f"{k:62s} NO NONCE"); continue
    t = int(base64.b64decode(m.group(2) + "===").decode())
    iso = datetime.datetime.fromtimestamp(t, datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"{k:62s} nonce_t={t} {iso}  ray={m.group(1)}")
