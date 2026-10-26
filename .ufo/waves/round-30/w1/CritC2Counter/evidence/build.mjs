// CritC2Counter fixture driver — builds one attack variant in the seat's scratch
// clone at 061e62024c0523d3c6c7e819506a773ff2cd7d75, commits it inside the
// scratch clone only, runs the frozen counter (offline and --live), prints a
// compact JSON summary.  Never touches the lane.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
const { normalise } = await import("./norm-probe.mjs");

const S = "/fast/scratch/hyaku/tabi-r30/CritC2Counter";
const D = join(S, "clone");
const FROZEN = "061e62024c0523d3c6c7e819506a773ff2cd7d75";
const LIVE = join(S, "live");
const SEAT = "CritC2Counter";
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const git = (args) => spawnSync("git", ["-C", D, ...args], { encoding: "utf8" });

const RL11 = join(LIVE, "rl11.txt");
const RL10 = join(LIVE, "rl10.txt");
const DISCORD = join(LIVE, "discord.html");
const RFC6585 = join(LIVE, "rfc6585.txt");

const Q116 = "The field value SHOULD remain consistent over a sequence of HTTP responses";
const Q117 = "Total time (in seconds) of when the current rate limit bucket will reset";
const Q429 = "The 429 status code indicates that the user has sent too many requests in a given amount of time";

const E116 = "corpus/knowledge/host-rate-limit-signal-classes.md";
const E117 = "corpus/knowledge/host-rate-limit-header-set.md";
const U116 = "https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt";
const U117 = "https://docs.discord.com/developers/topics/rate-limits";

const MY = ["corpus/knowledge/host-rate-limit-signal-classes.md", "corpus/knowledge/host-rate-limit-header-set.md",
  "corpus/lessons/round-30.md", "corpus/evidence/round-30/frontier", "corpus/evidence/round-30"];

function reset() {
  const co = git(["checkout", "-q", "-B", "atk-branch", FROZEN]);
  if (co.status !== 0) throw new Error(`checkout failed: ${co.stderr}`);
  for (const p of MY) rmSync(join(D, p), { recursive: true, force: true });
  // restore the one tracked file a variant may edit
  git(["checkout", "-q", FROZEN, "--", "corpus/SOURCES.md"]);
  const st = git(["status", "--porcelain"]).stdout.trim();
  if (st) throw new Error(`dirty tree after reset:\n${st}`);
}

function put(rel, data) {
  const abs = join(D, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, data);
}

function row(id, { url, opened = "2026-10-26", usedBy, status = "mined" }) {
  return `| ${id} | Fixture source — ${url} | docs | A | scope | §3 | teaches | ${status} | ${opened} | 180d | ${usedBy} |`;
}

function registry(rows) {
  const cur = readFileSync(join(D, "corpus/SOURCES.md"), "utf8");
  return `${cur}\n${rows.join("\n")}\n`;
}

function entry({ id, tag = "frontier: rate-tos-signal", body }) {
  const head = [`# Fixture ${id}`, "", `source: ${id} — fixture — §3`, "verified-at: 2026-10-26", "recheck: 180d", tag];
  while (head.length < 15) head.push("");
  return `${head.join("\n")}\n${body}\n`;
}

function receipt({ id, url, bytes, quote, fetchedBy = "seat-a", refetchSeat = "seat-b", refetchBytes = bytes, timestamp = "2026-10-26T00:00:00Z" }) {
  const bp = `corpus/evidence/round-30/frontier/bytes/${id}.txt`;
  const rp = `corpus/evidence/round-30/frontier/refetch/bytes/${id}.txt`;
  put(bp, bytes);
  put(rp, refetchBytes);
  const base = {
    id, url, fetched_by: fetchedBy, http_status: 200, bytes_path: bp,
    sha256: sha256(bytes), quote,
  };
  if (timestamp) base.fetched_at = timestamp;
  put(`corpus/evidence/round-30/frontier/${id}.json`, JSON.stringify(base, null, 2));
  put(`corpus/evidence/round-30/frontier/refetch/${id}.json`, JSON.stringify({
    id, seat: refetchSeat, fetched_at: "2026-10-26T01:00:00Z", http_status: 200,
    bytes_path: rp, sha256: sha256(refetchBytes),
  }, null, 2));
}

function lesson(quotes) {
  put("corpus/lessons/round-30.md", `# Round 30\n\n## Gate\n\n${quotes.map((q) => `- fetched, 2026-10-26, "${q}"`).join("\n")}\n`);
}

const bytes = {
  rl11: readFileSync(RL11), rl10: readFileSync(RL10), discord: readFileSync(DISCORD), rfc6585: readFileSync(RFC6585),
};

const VARIANTS = {
  // control: nothing admitted (reproduces J1)
  baseline: () => { put("corpus/knowledge/.keep", ""); },
  // the intended shape, all real and consistent
  honest: () => {
    put("corpus/SOURCES.md", registry([row("S116", { url: U116, usedBy: E116 }), row("S117", { url: U117, usedBy: E117 })]));
    put(E116, entry({ id: "S116", body: `The draft separates the two fields: "${Q116}".` }));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}".` }));
    receipt({ id: "S116", url: U116, bytes: bytes.rl11, quote: Q116 });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: Q117 });
    lesson([Q116, Q117]);
  },
  // A1: file:// receipt urls in production --live; bytes are invented by the seat
  filelive: () => {
    const f116 = `${S}/fx/S116.txt`, f117 = `${S}/fx/S117.txt`;
    mkdirSync(`${S}/fx`, { recursive: true });
    const t116 = "Policy windows are published per bucket and remain stable across a sequence of responses.\n";
    const t117 = "Every bucket carries a reset instant and the remaining budget is reported per route.\n";
    writeFileSync(f116, t116); writeFileSync(f117, t117);
    const u1 = `file://${f116}`, u2 = `file://${f117}`;
    put("corpus/SOURCES.md", registry([row("S116", { url: u1, usedBy: E116 }), row("S117", { url: u2, usedBy: E117 })]));
    put(E116, entry({ id: "S116", body: `The page says "${t116.trim()}".` }));
    put(E117, entry({ id: "S117", body: `The page says "${t117.trim()}".` }));
    receipt({ id: "S116", url: u1, bytes: Buffer.from(t116), quote: t116.trim() });
    receipt({ id: "S117", url: u2, bytes: Buffer.from(t117), quote: t117.trim() });
    lesson([t116.trim(), t117.trim()]);
  },
  // A3: q1 blind to single / curly-single quotes and to <4-word double quotes
  singlequote: () => {
    put("corpus/SOURCES.md", registry([row("S116", { url: U116, usedBy: E116 }), row("S117", { url: U117, usedBy: E117 })]));
    put(E116, entry({ id: "S116", body: `The draft separates the two fields: "${Q116}". It also proves that 'servers MUST publish a policy on every response' and that rate limits may be reset arbitrarily.` }));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}". It also states ‘the bucket string is stable across all routes’ and "MUST always publish".` }));
    receipt({ id: "S116", url: U116, bytes: bytes.rl11, quote: Q116 });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: Q117 });
    lesson([Q116, Q117]);
  },
  // A3b: the same fabricated bytes behind an https url -> the J4 live control
  selfquotehttps: () => {
    const t116 = "Policy windows are published per bucket and remain stable across a sequence of responses.\n";
    const t117 = "Every bucket carries a reset instant and the remaining budget is reported per route.\n";
    const u1 = "https://example.org/spec-116.txt", u2 = "https://example.org/spec-117.txt";
    put("corpus/SOURCES.md", registry([row("S116", { url: u1, usedBy: E116 }), row("S117", { url: u2, usedBy: E117 })]));
    put(E116, entry({ id: "S116", body: `The page says "${t116.trim()}".` }));
    put(E117, entry({ id: "S117", body: `The page says "${t117.trim()}".` }));
    receipt({ id: "S116", url: u1, bytes: Buffer.from(t116), quote: t116.trim() });
    receipt({ id: "S117", url: u2, bytes: Buffer.from(t117), quote: t117.trim() });
    lesson([t116.trim(), t117.trim()]);
  },
  // A3c: a legitimate quote hard-wrapped inside a markdown blockquote
  blockquote: () => {
    put("corpus/SOURCES.md", registry([row("S116", { url: U116, usedBy: E116 }), row("S117", { url: U117, usedBy: E117 })]));
    put(E116, entry({ id: "S116", body: "The draft separates the two fields:\n\n> \"The field value SHOULD remain consistent over a sequence of HTTP\n> responses\"\n" }));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}".` }));
    receipt({ id: "S116", url: U116, bytes: bytes.rl11, quote: Q116 });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: Q117 });
    lesson([Q116, Q117]);
  },
  // A4: emphasis inside a legitimate quoted span breaks q1 (false refusal)
  emphasis: () => {
    put("corpus/SOURCES.md", registry([row("S116", { url: U116, usedBy: E116 }), row("S117", { url: U117, usedBy: E117 })]));
    put(E116, entry({ id: "S116", body: `The draft separates the two fields: "The field value *SHOULD* remain consistent over a sequence of HTTP responses".` }));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}".` }));
    receipt({ id: "S116", url: U116, bytes: bytes.rl11, quote: Q116 });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: Q117 });
    lesson([Q116, Q117]);
  },
  // A5: one honest admitted entry -> counter exit 0 though the target is population 2
  onepop: () => {
    put("corpus/SOURCES.md", registry([row("S116", { url: U116, usedBy: E116 })]));
    put(E116, entry({ id: "S116", body: `The draft separates the two fields: "${Q116}".` }));
    receipt({ id: "S116", url: U116, bytes: bytes.rl11, quote: Q116 });
    lesson([Q116]);
  },
  // A5b: the second entry's tag sits on line 16 -> silently outside population
  tag16: () => {
    put("corpus/SOURCES.md", registry([row("S116", { url: U116, usedBy: E116 }), row("S117", { url: U117, usedBy: E117 })]));
    put(E116, entry({ id: "S116", body: `The draft separates the two fields: "${Q116}".` }));
    const head = ["# Fixture S117", "", "source: S117 — fixture — §3", "verified-at: 2026-10-26", "recheck: 180d", ""];
    while (head.length < 16) head.push("");
    put(E117, `${head.join("\n")}\nfrontier: rate-tos-signal\n\nThe page says "${Q117}".\n`);
    receipt({ id: "S116", url: U116, bytes: bytes.rl11, quote: Q116 });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: Q117 });
    lesson([Q116, Q117]);
  },
  // A7: duplicate registry rows, first one wins, contradictory second invisible
  duprow: () => {
    put("corpus/SOURCES.md", registry([
      row("S116", { url: U116, usedBy: E116 }), row("S117", { url: U117, usedBy: E117 }),
      row("S116", { url: "https://example.invalid/other", opened: "2020-01-01", usedBy: "corpus/knowledge/somewhere-else.md", status: "retired" }),
    ]));
    put(E116, entry({ id: "S116", body: `The draft separates the two fields: "${Q116}".` }));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}".` }));
    receipt({ id: "S116", url: U116, bytes: bytes.rl11, quote: Q116 });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: Q117 });
    lesson([Q116, Q117]);
  },
  // A8: impossible calendar dates pass r4 (format regex + lexicographic compare)
  baddate: () => {
    put("corpus/SOURCES.md", registry([
      row("S116", { url: U116, usedBy: E116, opened: "2026-13-45" }),
      row("S117", { url: U117, usedBy: E117, opened: "2026-11-31" }),
    ]));
    put(E116, entry({ id: "S116", body: `The draft separates the two fields: "${Q116}".` }));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}".` }));
    receipt({ id: "S116", url: U116, bytes: bytes.rl11, quote: Q116 });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: Q117 });
    lesson([Q116, Q117]);
  },
  // A9: receipts carry no fetch timestamp at all
  notimestamp: () => {
    put("corpus/SOURCES.md", registry([row("S116", { url: U116, usedBy: E116 }), row("S117", { url: U117, usedBy: E117 })]));
    put(E116, entry({ id: "S116", body: `The draft separates the two fields: "${Q116}".` }));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}".` }));
    receipt({ id: "S116", url: U116, bytes: bytes.rl11, quote: Q116, timestamp: null });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: Q117, timestamp: null });
    lesson([Q116, Q117]);
  },
  // A10: one-word receipt quotes
  oneword: () => {
    put("corpus/SOURCES.md", registry([row("S116", { url: U116, usedBy: E116 }), row("S117", { url: U117, usedBy: E117 })]));
    put(E116, entry({ id: "S116", body: `The draft separates the two fields: "${Q116}".` }));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}".` }));
    receipt({ id: "S116", url: U116, bytes: bytes.rl11, quote: "RateLimit" });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: "bucket" });
    lesson(["RateLimit", "bucket"]);
  },
  // A11: refetch is a different document + arbitrary seat labels
  refetchlabel: () => {
    put("corpus/SOURCES.md", registry([row("S116", { url: U116, usedBy: E116 }), row("S117", { url: U117, usedBy: E117 })]));
    put(E116, entry({ id: "S116", body: `The draft separates the two fields: "${Q116}".` }));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}".` }));
    receipt({ id: "S116", url: U116, bytes: bytes.rl11, quote: Q116, fetchedBy: "nobody-at-all", refetchSeat: "someone-else", refetchBytes: bytes.rl10 });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: Q117, fetchedBy: "x", refetchSeat: "y" });
    lesson([Q116, Q117]);
  },
  // A12: receipt url is a cross-host redirect; committed bytes come from the other host
  redirect: () => {
    put("corpus/SOURCES.md", registry([
      row("S116", { url: "https://www.ietf.org/rfc/rfc6585.txt", usedBy: E116 }),
      row("S117", { url: U117, usedBy: E117 }),
    ]));
    put(E116, entry({ id: "S116", body: `The status is defined for throttled clients: "${Q429}".` }));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}".` }));
    receipt({ id: "S116", url: "https://www.ietf.org/rfc/rfc6585.txt", bytes: bytes.rfc6585, quote: Q429 });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: Q117 });
    lesson([Q429, Q117]);
  },
  // A13: plain-text bytes that merely mention <html> get HTML-normalised; a quote
  // spanning a stripped tag becomes "located"
  htmlsniff: () => {
    const f116 = `${S}/fx/H116.txt`;
    mkdirSync(`${S}/fx`, { recursive: true });
    const t116 = "A draft that discusses <html> documents.\nThe response carries a RateLimit-Policy field and the quota is stable <span class=\"x\">across a sequence of responses</span>.\n";
    writeFileSync(f116, t116);
    const u1 = `file://${f116}`;
    put("corpus/SOURCES.md", registry([row("S116", { url: u1, usedBy: E116 }), row("S117", { url: U117, usedBy: E117 })]));
    put(E116, entry({ id: "S116", body: `The page says "The response carries a RateLimit-Policy field and the quota is stable across a sequence of responses".` }));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}".` }));
    receipt({ id: "S116", url: u1, bytes: Buffer.from(t116), quote: "The response carries a RateLimit-Policy field and the quota is stable across a sequence of responses" });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: Q117 });
    lesson(["The response carries a RateLimit-Policy field and the quota is stable across a sequence of responses", Q117]);
  },
  // A18: a quoted claim in the entry title (header lines) is outside q1 entirely
  headquote: () => {
    put("corpus/SOURCES.md", registry([row("S116", { url: U116, usedBy: E116 }), row("S117", { url: U117, usedBy: E117 })]));
    put(E116, entry({ id: "S116", body: `The draft separates the two fields: "${Q116}".` }).replace("# Fixture S116", "# Fixture S116 — \"MUST always publish a policy on every response\""));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}".` }));
    receipt({ id: "S116", url: U116, bytes: bytes.rl11, quote: Q116 });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: Q117 });
    lesson([Q116, Q117]);
  },
  // A19: committed "source bytes" are a local re-expression whose normalised text
  // equals the live page; l3 compares normalised text, never the wire bytes
  reexpress: () => {
    const reflow = Buffer.from(bytes.rl11.toString("utf8").replace(/\n/g, " "), "utf8");
    const plain = Buffer.from(normalise(bytes.discord) + "\n", "utf8");
    put("corpus/SOURCES.md", registry([row("S116", { url: U116, usedBy: E116 }), row("S117", { url: U117, usedBy: E117 })]));
    put(E116, entry({ id: "S116", body: `The draft separates the two fields: "${Q116}".` }));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}".` }));
    receipt({ id: "S116", url: U116, bytes: reflow, quote: Q116 });
    receipt({ id: "S117", url: U117, bytes: plain, quote: Q117 });
    lesson([Q116, Q117]);
  },
  // A17: q1 skips quoted spans over 600 chars and fenced blocks
  q1scope: () => {
    put("corpus/SOURCES.md", registry([row("S116", { url: U116, usedBy: E116 }), row("S117", { url: U117, usedBy: E117 })]));
    const long = "Servers MUST publish a policy field on every response and clients MUST treat every advertised quota as a hard ceiling without exception, and every intermediary MUST rewrite the policy field before forwarding the response to any downstream client so that no stale quota survives".padEnd(680, " and so on");
    put(E116, entry({ id: "S116", body: `The draft separates the two fields: "${Q116}".\n\nA longer passage: "${long}".\n\n\`\`\`\n"the quota is reset by the server without notice"\n\`\`\`\n` }));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}".` }));
    receipt({ id: "S116", url: U116, bytes: bytes.rl11, quote: Q116 });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: Q117 });
    lesson([Q116, Q117]);
  },
  // A16: a citation that also mentions a superseding id pulls that id into the set
  supersede: () => {
    put("corpus/SOURCES.md", registry([row("S116", { url: U116, usedBy: E116 }), row("S117", { url: U117, usedBy: E117 })]));
    put(E116, entry({ id: "S116", body: `The draft separates the two fields: "${Q116}".` }).replace("source: S116 — fixture — §3", "source: S116 — fixture — §3; supersedes S118"));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}".` }));
    receipt({ id: "S116", url: U116, bytes: bytes.rl11, quote: Q116 });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: Q117 });
    lesson([Q116, Q117]);
  },
  // A15: g6 only greps the whole lesson file — no Gate-section scoping
  lessonloose: () => {
    put("corpus/SOURCES.md", registry([row("S116", { url: U116, usedBy: E116 }), row("S117", { url: U117, usedBy: E117 })]));
    put(E116, entry({ id: "S116", body: `The draft separates the two fields: "${Q116}".` }));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}".` }));
    receipt({ id: "S116", url: U116, bytes: bytes.rl11, quote: Q116 });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: Q117 });
    put("corpus/lessons/round-30.md", `# Round 30\n\n## Unrelated notes\n\nA passing remark: "${Q116}" and "${Q117}".\n`);
  },
  // A14 (offline only): g2 is a substring test — receipt url is a strict prefix of the row url
  urlprefix: () => {
    put("corpus/SOURCES.md", registry([row("S116", { url: U116, usedBy: E116 }), row("S117", { url: U117, usedBy: E117 })]));
    put(E116, entry({ id: "S116", body: `The draft separates the two fields: "${Q116}".` }));
    put(E117, entry({ id: "S117", body: `Discord documents the reset window: "${Q117}".` }));
    receipt({ id: "S116", url: "https://www.ietf.org/archive/id", bytes: bytes.rl11, quote: Q116 });
    receipt({ id: "S117", url: U117, bytes: bytes.discord, quote: Q117 });
    lesson([Q116, Q117]);
  },
};

const name = process.argv[2];
const runsLive = process.argv.includes("--live");
if (!VARIANTS[name]) throw new Error(`unknown variant ${name}`);
reset();
VARIANTS[name]();
let add = git(["add", "-A"]);
if (add.status !== 0) throw new Error(add.stderr);
const commit = spawnSync("git", ["-C", D, "-c", `user.name=${SEAT}`, "-c", `user.email=${SEAT}@scratch.local`, "commit", "-q", "-m", `fixture ${name}`], { encoding: "utf8" });
if (commit.status !== 0) throw new Error(`commit failed: ${commit.stdout}${commit.stderr}`);
const rev = git(["rev-parse", "HEAD"]).stdout.trim();

const out = { variant: name, rev, runs: {} };
for (const live of runsLive ? [false, true] : [false]) {
  const args = ["scripts/check-frontier-admission.mjs", "--rev", rev, "--repo", D, "--frontier", "rate-tos-signal", "--since", "2026-10-26", "--json"];
  if (live) args.push("--live");
  const r = spawnSync("node", args, { cwd: D, encoding: "utf8", env: { ...process.env, TMPDIR: join(S, "tmp") } });
  let parsed = null;
  try { parsed = JSON.parse(r.stdout); } catch { parsed = null; }
  out.runs[live ? "live" : "offline"] = {
    exit: r.status,
    population: parsed?.population ?? null,
    admitted: parsed?.admitted ?? null,
    failing: parsed?.failing ?? null,
    clean: parsed?.clean ?? null,
    reasons: parsed ? parsed.entries.map((e) => `${e.path}: ${e.admitted ? "ADMITTED" : e.reasons.join("; ")}`) : null,
    stderr: r.stderr.trim() || null,
    raw: join(S, "out", `${name}.${live ? "live" : "offline"}.json`),
  };
  mkdirSync(join(S, "out"), { recursive: true });
  writeFileSync(join(S, "out", `${name}.${live ? "live" : "offline"}.json`), r.stdout);
}
console.log(JSON.stringify(out, null, 2));
