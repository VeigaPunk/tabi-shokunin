// Credential-shape screening shared by the native-trial launcher
// (run-omp-native-trial.mjs) and the handoff collector
// (collect-omp-native-handoff.mjs). Both sides screen evidence-bound text
// through the SAME mirror of detail_contains_credential (native.rs); two
// byte-identical copies drifted independently until this module became the
// single source. The judge mirror is deliberately narrow — widening it here
// would break parity, so callers layer their own literal shapes on top via
// containsSensitiveShape, never by editing the needle sets.

// Mirrors detail_contains_credential (native.rs): three literal needles plus
// provider token prefixes that only count when at least SECRET_TOKEN_MIN
// token characters follow, so benign text like "task-failed" or "sk-42"
// never trips the scan.
const SECRET_LITERAL_NEEDLES = ["dashscope_api_key=", "authorization:", "bearer "];
const SECRET_TOKEN_NEEDLES = ["sk-", "rk-", "ak-", "xai-"];
const SECRET_TOKEN_MIN = 12;

export function containsCredentialShape(value) {
  // ASCII-only fold, mirroring native.rs to_ascii_lowercase exactly: a
  // Unicode-aware fold (U+212A -> "k", U+0130 -> "i" + U+0307) would redact a
  // value the judge's mirror does not — over-redaction, never silent
  // admission, but still a mirror break against the "exactly" claim above.
  const lower = String(value ?? "").replace(/[A-Z]/g, (char) => char.toLowerCase());
  for (const needle of SECRET_LITERAL_NEEDLES) {
    if (lower.includes(needle)) return true;
  }
  const isTokenChar = (char) => /[a-z0-9_-]/.test(char);
  for (const needle of SECRET_TOKEN_NEEDLES) {
    let start = 0;
    for (;;) {
      const offset = lower.indexOf(needle, start);
      if (offset === -1) break;
      const tokenStart = offset + needle.length;
      let end = tokenStart;
      while (end < lower.length && isTokenChar(lower[end])) end += 1;
      if (end - tokenStart >= SECRET_TOKEN_MIN) return true;
      start = tokenStart;
    }
  }
  return false;
}

// The evidence-writing predicate: the judge-mirror credential check plus the
// literal shapes safeCommandDetail has always redacted. Host-attestation
// strings, telemetry detail, and command-output detail all screen through
// this — a value either side would redact must never reach launch.json,
// rejection.txt, handoff.json, or an effectiveLaunch host field. The JWT arm
// catches the compact-serialization shape (two `eyJ` base64url segment
// starts) that no flag name or token prefix covers — a bare JWT positional
// or a JWT inside command output is credential material regardless.
const SENSITIVE_LITERAL_RE = /api[_-]?key=|token=|xoxb-|AIza|PRIVATE KEY|eyJ[A-Za-z0-9_-]{4,}\.eyJ[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}/i;
// Format characters (\p{Cf}: ZWJ/ZWNJ/ZWSP, bidi overrides and isolates, soft
// hyphen, BOM) are invisible and split a shape without changing what a reader
// copies out: `sk-<ZWJ>abc…` evades both tiers raw, and call sites that
// normalize AFTER screening (collector cleanField deletes every non-field
// character) re-join it into the exact shape the screen exists to block. The
// wider tier therefore also screens the Cf-stripped text (PrimeAgent
// refinement r20 F11). containsCredentialShape above stays byte-exact to the
// judge — stripping there would break parity — so the widening lives only on
// this evidence-writing side, and Cf-free text pays no second scan.
const FORMAT_CHARS_RE = /\p{Cf}/gu;
export function containsSensitiveShape(value) {
  const text = String(value ?? "");
  if (containsCredentialShape(text) || SENSITIVE_LITERAL_RE.test(text)) return true;
  const stripped = text.replace(FORMAT_CHARS_RE, "");
  return stripped !== text
    && (containsCredentialShape(stripped) || SENSITIVE_LITERAL_RE.test(stripped));
}
