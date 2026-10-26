# S041 refetch log — seat RefetchS041, 2026-10-26T05:10:35Z

## fetch A (scratch fetch/)
GET https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT
http=200 b64_bytes=5504 decoded=4126 sha256=f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f
GET ...refs/tags/154.0.8037.97/<same path>?format=TEXT
http=200 b64_bytes=5292 decoded=3969 sha256=26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff

## fetch B (fetch2/, timestamped)
t0=2026-10-26T05:09:37Z t1=2026-10-26T05:09:38Z http=200 decoded=4126 sha256=f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f (identical to fetch A)

## tag commits (Gitiles ?format=JSON, http 200)
154.0.8037.97 -> b510e9d7cd3a2fbd78d0ddc42234103206c5f78d (row anchor)
156.0.8078.47 -> 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775

## chromiumdash Stable/Linux (http 200)
156.0.8078.47 prev 155.0.8059.84

## byte authenticity
my 154 == committed 154 : identical (cmp exit 0)
my 156 == committed 156 : identical (cmp exit 0)
