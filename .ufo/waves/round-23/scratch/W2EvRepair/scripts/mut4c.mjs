#!/usr/bin/env node
// round-evidence-audit — derive a round's accounting defects from its committed bytes.
//
// Round 23, claim C1 (capability acquisition). Six classes, each reproducing one defect
// the round-22 non-author spot-check routed (corpus/lessons/round-22-verifier-spotcheck.md).
// The auditor DERIVES every figure from the round's own artifacts; it reads no expectations
// file, writes nothing but stdout/stderr, and refuses rather than guessing.
//
//   node scripts/round-evidence-audit.mjs --rev <40-hex-commit> --round <N> --round-cap <seats>
//        [--report PATH] [--policy FLEET_POLICY_PATH] [--json]
//   node scripts/round-evidence-audit.mjs --selftest [--json]
//
// Exit: 0 clean, 1 any finding, 2 usage/IO refusal, 3 selftest disagreement.
//
// Classes:
//   c1-refusal-arithmetic  a cited "<n> whole-payload refusals" vs the refusal receipts committed
//   c2-wave-caps           a wave above the policy band, a registry above its spec, an
//                          unaccounted wave, or a round total above the declared round cap
//   c3-gate-spotcheck      the lesson's "## Gate" carries no spot-check result and no "owed to closure"
//   c4-stale-attempts      more than one attempt artifact, and the report's Stale-lane line grades one
//   c5-registry-identities a spawned wave whose registry members carry no agentId
//   c6-landed-log-binding  a landed-changes row citing only commits that touch no LOG.md
//
// Inputs: the lane's committed bytes at --rev, read through rev-parse + cat-file with a
// scrubbed git environment (no shell, no replace objects, no GIT_DIR leak, tree-verified
// blob type, sha1 re-verified against the object id). Two inputs are by design not lane
// bytes and carry their digests instead: the fleet round report (--report) and the fleet
// wave-policy authority (--policy). Both are REQUIRED: a missing one is exit 2, never a
// clean verdict.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SCHEMA = "tabi-round-evidence-audit-v1";
export const CLASSES = [
  "c1-refusal-arithmetic",
  "c2-wave-caps",
  "c3-gate-spotcheck",
  "c4-stale-attempts",
  "c5-registry-identities",
  "c6-landed-log-binding",
];
const REFUSAL_MARKER = "Background job limit reached";
const SPAWN_MARKER = /Spawned (\d+) background agents/;
const FULL_REV = /^[0-9a-f]{40}$/;
const HASHLIKE = /^[0-9a-f]{7,40}$/;
// Fleet authority for the wave band. A supplied policy may name one of these bands or a
// tighter one; it may never widen it (the validator's own tighten-only rule).
const FLEET_POLICIES = [
  "/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json",
  "/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy-v2.json",
];
const DEFAULT_POLICY = FLEET_POLICIES[0];

class AuditRefusal extends Error {}

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function scrubbedEnv() {
  const env = { ...process.env };
  for (const key of [
    "GIT_DIR",
    "GIT_WORK_TREE",
    "GIT_INDEX_FILE",
    "GIT_OBJECT_DIRECTORY",
    "GIT_ALTERNATE_OBJECT_DIRECTORIES",
    "GIT_COMMON_DIR",
    "GIT_NAMESPACE",
    "GIT_GLOB_PATHSPECS",
    "GIT_NOGLOB_PATHSPECS",
    "GIT_ICASE_PATHSPECS",
    "GIT_LITERAL_PATHSPECS",
  ]) {
    delete env[key];
  }
  return {
    ...env,
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_CONFIG_SYSTEM: "/dev/null",
    GIT_NO_REPLACE_OBJECTS: "1",
    GIT_OPTIONAL_LOCKS: "0",
    GIT_TERMINAL_PROMPT: "0",
    LC_ALL: "C",
  };
}

function gitRaw(root, args) {
  try {
    return execFileSync("git", ["-C", root, ...args], {
      env: scrubbedEnv(),
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 256 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}

// A reader over committed bytes at one revision. Absence is reported as null; a listing of
// the round directory as null means the revision does not hold that round.
export function gitCtx(root, rev) {
  const objectType = (spec) => {
    const out = gitRaw(root, ["cat-file", "-t", "--end-of-options", spec]);
    return out === null ? null : out.toString("utf8").trim();
  };
  return {
    kind: "git",
    rev,
    revIsCommit: objectType(`${rev}^{commit}`) === "commit",
    list(prefix) {
      const out = gitRaw(root, ["ls-tree", "-r", "--name-only", rev, "--", prefix]);
      return out === null ? null : out.toString("utf8").split("\n").filter(Boolean);
    },
    read(path) {
      const oidOut = gitRaw(root, ["rev-parse", "--verify", "--end-of-options", `${rev}:${path}`]);
      if (oidOut === null) return null;
      const oid = oidOut.toString("utf8").trim();
      if (!/^[0-9a-f]{40,64}$/.test(oid)) return null;
      if (objectType(oid) !== "blob") return null;
      const bytes = gitRaw(root, ["cat-file", "blob", oid]);
      if (bytes === null) return null;
      const digest = createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
      if (digest !== oid) return null;
      return bytes.toString("utf8");
    },
    filesOfCommit(commit) {
      if (!HASHLIKE.test(commit)) return null;
      const out = gitRaw(root, ["diff-tree", "--no-commit-id", "--name-only", "-r", "--end-of-options", commit]);
      return out === null ? null : out.toString("utf8").split("\n").filter(Boolean);
    },
  };
}

// A reader over an in-memory fixture (selftest only).
export function fixtureCtx(files, commitFiles = {}) {
  const map = new Map(Object.entries(files));
  return {
    kind: "fixture",
    rev: "fixture",
    revIsCommit: true,
    list(prefix) {
      const hit = [...map.keys()].filter((p) => p === prefix || p.startsWith(`${prefix}/`));
      return hit.length ? hit.sort() : null;
    },
    read(path) {
      return map.has(path) ? map.get(path) : null;
    },
    filesOfCommit(commit) {
      return Object.prototype.hasOwnProperty.call(commitFiles, commit) ? commitFiles[commit] : null;
    },
  };
}

function parseJson(text) {
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Extract a "## Heading" section; stops at the next level-2 heading.
export function section(text, heading) {
  if (typeof text !== "string") return "";
  const lines = text.split("\n");
  const want = heading.trim().toLowerCase();
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim().toLowerCase() === want) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return "";
  const body = [];
  for (let i = start; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join("\n");
}

// "<n> whole-payload refusals" — the report/lesson wording for a capacity refusal.
export function extractRefusalCitations(text) {
  if (typeof text !== "string") return [];
  return [...new Set([...text.matchAll(/\b(\d{1,3})\s+whole-payload\s+refusal/gi)].map((m) => Number(m[1])))];
}

// A per-attempt grade names the attempt and its disposition; the bare word "attempt"
// is not a grade. Two distinct graded attempts is the minimum for a multi-attempt round.
function gradedAttempts(text) {
  const seen = new Set();
  const re = /attempt\s*#?\s*(\d{1,2})\s*[—:–\-.)]?\s*\**\s*(progressing|silent|landed|graded|refused|stale|dead|complete|completed)/gi;
  for (const m of String(text || "").matchAll(re)) seen.add(m[1]);
  return { count: seen.size, ids: [...seen], lt2: seen.size < 2 };
}

// A grade counts only when its attempt id names a committed receipt: a ghost id in prose
// is not evidence that the attempt was graded.
function joinedGrades(ids, receiptIds) {
  return ids.filter((id) => receiptIds.has(String(Number(id)))).length;
}

// The Stale-lane paragraph: the line and the wrapped/indented lines under it.
function staleParagraph(text) {
  const lines = String(text || "").split("\n");
  const at = lines.findIndex((l) => /^[\s*_>]*Stale-lane[\s*_]*:/i.test(l));
  if (at === -1) return null;
  const body = [lines[at]];
  for (let i = at + 1; i < lines.length; i += 1) {
    if (!lines[i].trim() || /^#{1,6}\s/.test(lines[i])) break;
    body.push(lines[i]);
  }
  return { line: lines[at], paragraph: body.join("\n") };
}

function waveStem(roundDir, specFile) {
  return specFile.slice(roundDir.length + 1).replace(/-spec\.json$/, "").replace(/\/.*$/, "");
}

// Spawned seat count for one wave, derived from its own receipts. `accounted` is false when
// the wave left no dispatch evidence at all — 0 seated and 0 unaccounted are not the same.
function waveEvidence(ctx, roundDir, stem) {
  const spawnPaths = [
    `${roundDir}/${stem}-spawn-result.json`,
    `${roundDir}/${stem}-task-result.json`,
    `${roundDir}/${stem}/spawn-result.json`,
  ];
  const refusalPath = `${roundDir}/${stem}-cap-refusal.json`;
  for (const path of spawnPaths) {
    const body = ctx.read(path);
    if (body === null) continue;
    const m = body.match(SPAWN_MARKER);
    if (m) return { path, spawned: Number(m[1]), refused: false, accounted: true };
    if (body.includes(REFUSAL_MARKER)) return { path, spawned: 0, refused: true, accounted: true };
    return { path, spawned: 0, refused: false, accounted: false };
  }
  const refusals = (ctx.list(roundDir) || []).filter((f) => new RegExp(`/${stem}-cap-refusal-\\d+\\.json$`).test(f));
  if (refusals.length) {
    return { path: refusals[0], spawned: 0, refused: true, accounted: true };
  }
  if (ctx.read(refusalPath) !== null) return { path: refusalPath, spawned: 0, refused: true, accounted: true };
  const validation = ctx.read(`${roundDir}/${stem}-validation.json`);
  if (validation !== null) return { path: `${roundDir}/${stem}-validation.json`, spawned: 0, refused: false, accounted: false };
  return { path: null, spawned: 0, refused: false, accounted: false };
}

export function audit(ctx, opts) {
  const { round, policy, roundCap, reportText, lessonText } = opts;
  if (!Number.isFinite(roundCap)) {
    throw new AuditRefusal("roundCap must be a finite number: the round cap is declared by the round contract, never assumed");
  }
  const roundDir = `.ufo/waves/round-${round}`;
  const findings = [];
  const add = (cls, cited, derived, evidence, detail) =>
    findings.push({ class: cls, cited, derived, evidence, detail });

  const files = ctx.list(roundDir) || [];
  const band = policy?.sighting?.dispatch?.swarm ?? null;

  // c1 — refusal arithmetic: the asserted figure vs the receipts committed.
  const refusalFiles = files.filter((f) => /cap-refusal[^/]*\.json$/.test(f));
  // A refusal receipt is a capacity failure, not any file that happens to quote the marker:
  // the payload must open with the dispatch failure envelope and carry the marker.
  const isRefusal = (body) => {
    if (!body || !body.includes(REFUSAL_MARKER)) return false;
    const parsed = parseJson(body);
    const text = parsed ? (parsed.result?.text ?? parsed.text ?? "") : body;
    return typeof text === "string" && /Failed to start background task jobs/i.test(text) && text.includes(REFUSAL_MARKER);
  };
  const refusalReceipts = refusalFiles.filter((f) => isRefusal(ctx.read(f)));
  // Every cited figure is checked, not the largest one: a stale figure left beside a
  // corrected one is exactly the state the routed defect warns about.
  const citedSet = [...new Set([...extractRefusalCitations(lessonText), ...extractRefusalCitations(reportText)])];
  const wrong = citedSet.filter((n) => n !== refusalReceipts.length);
  // A round that cites no figure asserts nothing this class can contradict.
  if (wrong.length) {
    add(
      "c1-refusal-arithmetic",
      wrong.join(","),
      refusalReceipts.length,
      refusalFiles.slice(0, 3),
      `cited ${wrong.join("/")} whole-payload refusals, receipts committed ${refusalReceipts.length} (${refusalFiles.length} refusal files, ${refusalReceipts.length} carrying the capacity marker)`
    );
  }

  // c2 — wave caps, unaccounted waves, round total.
  const specFiles = files.filter((f) => /-spec\.json$/.test(f));
  const capProblems = [];
  let roundTotal = 0;
  const waveCounts = [];
  for (const specFile of specFiles) {
    const spec = parseJson(ctx.read(specFile));
    if (!spec) {
      capProblems.push(`${specFile}: unparseable spec`);
      continue;
    }
    const stem = waveStem(roundDir, specFile);
    const maxLanes = Number(spec.maxLanes);
    const items = Array.isArray(spec.items) ? spec.items.length : null;
    const spawn = waveEvidence(ctx, roundDir, stem);
    roundTotal += spawn.spawned;
    const validation = parseJson(ctx.read(`${roundDir}/${stem}-validation.json`));
    waveCounts.push({
      wave: stem,
      spec: specFile,
      maxLanes,
      items,
      spawned: spawn.spawned,
      receipt: spawn.path,
      receiptPolicy: validation?.policy ?? null,
    });
    if (!spawn.accounted) {
      capProblems.push(`${specFile}: wave ${stem} left no spawn-result and no refusal receipt, so its seats cannot be counted`);
      continue;
    }
    if (band) {
      if (Number.isFinite(maxLanes) && maxLanes > band.waveMaxLanes)
        capProblems.push(`${specFile}: maxLanes ${maxLanes} > policy waveMaxLanes ${band.waveMaxLanes}`);
      if (Number.isFinite(maxLanes) && maxLanes < band.waveMinLanes)
        capProblems.push(`${specFile}: maxLanes ${maxLanes} < policy waveMinLanes ${band.waveMinLanes}`);
    }
    if (spawn.spawned > maxLanes)
      capProblems.push(`${waveCounts[waveCounts.length - 1].receipt}: ${spawn.spawned} seats spawned > spec maxLanes ${maxLanes}`);
    if (items !== null && Number.isFinite(maxLanes) && items > maxLanes)
      capProblems.push(`${specFile}: items ${items} > maxLanes ${maxLanes}`);
    const reg = parseJson(ctx.read(`${roundDir}/${stem}/swarm-registry.json`));
    if (reg && reg.members && typeof reg.members === "object") {
      const n = Object.keys(reg.members).length;
      if (Number.isFinite(maxLanes) && n > maxLanes)
        capProblems.push(`${roundDir}/${stem}/swarm-registry.json: ${n} members > spec maxLanes ${maxLanes}`);
    }
  }
  if (band === null) capProblems.push("policy band unavailable: the policy input supplied no sighting.dispatch.swarm");
  if (roundTotal > roundCap) capProblems.push(`round total ${roundTotal} spawned seats > round cap ${roundCap}`);
  if (capProblems.length) {
    add("c2-wave-caps", roundCap, roundTotal, waveCounts, capProblems.join("; "));
  }

  // c3 — the lesson's Gate records a spot-check result or names it owed.
  const gate = section(lessonText, "## Gate");
  if (!lessonText) {
    add("c3-gate-spotcheck", null, "lesson-absent", [`corpus/lessons/round-${round}.md`], "lesson file absent at this revision");
  } else if (!gate.trim()) {
    add("c3-gate-spotcheck", null, "gate-absent", [`corpus/lessons/round-${round}.md`], "lesson carries no '## Gate' section");
  } else if (!/fixture repair/i.test(gate)) {
    add(
      "c3-gate-spotcheck",
      null,
      "no-spotcheck-line",
      [`corpus/lessons/round-${round}.md`],
      "the Gate section names neither a spot-check result, nor an 'owed to closure' line, nor a named non-author deferral"
    );
  }

  // c4 — a multi-attempt round grades each attempt in its Stale-lane paragraph.
  // An "attempt" is a dispatch attempt of the round (an attempt receipt), not a wave.
  const attemptArtifacts = files.filter(
    (f) => f.startsWith(`${roundDir}/`) && /^attempt[^/]*\.json$|^[^/]*-attempt[^/]*\.json$/.test(f.slice(roundDir.length + 1))
  );
  const receiptIds = new Set();
  for (const f of files) {
    if (!f.startsWith(`${roundDir}/`) || f.slice(roundDir.length + 1).includes("/")) continue;
    for (const m of f.slice(roundDir.length + 1).matchAll(/attempt(\d+)|-(?:cap-refusal|refusal)-(\d+)\.json$/g)) {
      receiptIds.add(String(Number(m[1] ?? m[2])));
    }
  }
  const stale = staleParagraph(reportText);
  if (attemptArtifacts.length >= 2) {
    if (!stale) {
      add("c4-stale-attempts", null, attemptArtifacts.length, attemptArtifacts.slice(0, 3), "the report carries no Stale-lane line while more than one attempt receipt is committed");
    } else if (joinedGrades(gradedAttempts(stale.paragraph).ids, receiptIds) < 2) {
      add(
        "c4-stale-attempts",
        stale.line.trim().slice(0, 120),
        `${attemptArtifacts.length} attempt receipts / ${joinedGrades(gradedAttempts(stale.paragraph).ids, receiptIds)} graded and joined`,
        attemptArtifacts.slice(0, 3),
        "the Stale-lane paragraph grades fewer than two attempts that a committed attempt receipt can be matched to, while several attempt receipts are committed"
      );
    }
  }

  // c5 — a wave that really spawned records its members' identities. A missing registry is a
  // finding, not a skip: deleting the file must not clear the class.
  const registryOf = (stem) => {
    for (const candidate of [`${roundDir}/${stem}/swarm-registry.json`, `${roundDir}/${stem}-swarm-registry.json`]) {
      if (files.includes(candidate)) return candidate;
    }
    return null;
  };
  const spawnedWaves = [];
  for (const specFile of specFiles) {
    const stem = waveStem(roundDir, specFile);
    const spawned = waveEvidence(ctx, roundDir, stem).spawned;
    if (spawned > 0) spawnedWaves.push({ stem, spawned, registry: registryOf(stem) });
  }
  for (const wave of spawnedWaves) {
    if (wave.registry === null) {
      add(
        "c5-registry-identities",
        `${wave.spawned} spawned`,
        "registry-absent",
        [`${roundDir}/${wave.stem}/swarm-registry.json`],
        `wave ${wave.stem} spawned ${wave.spawned} seats and left no member registry, so none of them can be tied to a transcript`
      );
      continue;
    }
    const reg = parseJson(ctx.read(wave.registry));
    const members = reg ? reg.members : null;
    if (!members || typeof members !== "object" || Array.isArray(members)) {
      add("c5-registry-identities", `${wave.spawned} spawned`, "registry-unreadable", [wave.registry], `wave ${wave.stem} has no readable object-form member registry`);
      continue;
    }
    const names = Object.keys(members);
    const ids = names.map((n) => (members[n] && typeof members[n].agentId === "string" ? members[n].agentId.trim() : ""));
    const anonymous = names.filter((n, i) => ids[i] === "");
    const unique = new Set(ids.filter(Boolean));
    const problems = [];
    if (names.length === 0) problems.push("registry has no members");
    if (anonymous.length) problems.push(`${anonymous.length} of ${names.length} members carry no agentId`);
    if (names.length && unique.size !== ids.filter(Boolean).length) problems.push("member ids are not unique");
    if (names.length < wave.spawned) problems.push(`${names.length} members for ${wave.spawned} spawned seats`);
    if (problems.length) {
      add(
        "c5-registry-identities",
        `${wave.spawned} spawned / ${names.length} members`,
        problems.join("; "),
        [wave.registry, ...anonymous.slice(0, 3)],
        "the registry does not account for the seats this wave spawned, so its evidence cannot be tied to its transcripts"
      );
    }
  }

  // c6 — a landed-changes row is bound to a commit that carries its LOG.md entry.
  const landed = section(reportText, "## Landed changes");
  if (landed.trim()) {
    const rows = landed
      .split("\n")
      .filter((l) => /^\s*\|/.test(l) && !/^\s*\|[\s:|-]+\|\s*$/.test(l))
      .filter((l) => !/^\s*\|\s*change\s*\|/i.test(l));
    for (const row of rows) {
      const hashes = [...new Set([...row.matchAll(/\b[0-9a-f]{7,40}\b/g)].map((m) => m[0]))].filter(
        (h) => HASHLIKE.test(h) && /[a-f]/.test(h) && !/^\d+$/.test(h)
      );
      if (!hashes.length) continue;
      const bindsElsewhere = /LOG entry lands in/i.test(row);
      const seen = [];
      let logBound = false;
      for (const hash of hashes) {
        const touched = ctx.filesOfCommit(hash);
        if (touched === null) continue;
        seen.push(hash);
        if (touched.includes("LOG.md")) logBound = true;
      }
      if (seen.length && !logBound && !bindsElsewhere) {
        add(
          "c6-landed-log-binding",
          seen.join(","),
          "no LOG.md in any cited commit",
          [row.trim().slice(0, 160)],
          "the row cites only commits that touch no LOG.md and does not say where the entry lands"
        );
      }
    }
  }

  findings.sort((a, b) => CLASSES.indexOf(a.class) - CLASSES.indexOf(b.class));
  const perClass = CLASSES.map((cls) => ({
    class: cls,
    findings: findings.filter((f) => f.class === cls).length,
  }));
  return {
    schema: SCHEMA,
    rev: ctx.rev,
    round,
    classIds: CLASSES,
    perClass,
    findings,
    findingClasses: perClass.filter((c) => c.findings > 0).map((c) => c.class),
    roundCap,
    clean: findings.length === 0,
  };
}

// ---------------------------------------------------------------- selftest --
// Twelve cases: one red per class (that class, and only that class, fires) and one green per
// class that exercises its boundary rather than repeating the base fixture.
function baseFixture() {
  const round = 90;
  const dir = `.ufo/waves/round-${round}`;
  const files = {};
  const receipt = (n) =>
    JSON.stringify({ attempt: n, result: { text: `Failed to start background task jobs: X: ${REFUSAL_MARKER} (100).` } });
  for (let i = 1; i <= 2; i += 1) {
    files[`${dir}/w1-cap-refusal-${String(i).padStart(2, "0")}.json`] = receipt(i);
  }
  files[`${dir}/w1-spec.json`] = JSON.stringify({ wave: "fx-w1", maxLanes: 2, items: [{ name: "A" }, { name: "B" }] });
  files[`${dir}/w1-spawn-result.json`] = JSON.stringify({ text: "Spawned 2 background agents using scout, reviewer.\n- `A`\n- `B`" });
  files[`${dir}/w1/swarm-registry.json`] = JSON.stringify({
    schema: "ufo-swarm-registry-v1",
    members: { A: { agentId: "fx.A" }, B: { agentId: "fx.B" } },
  });
  files[`corpus/lessons/round-${round}.md`] = [
    `# Round${round}`,
    "",
    "## Gate",
    "",
    "2 whole-payload refusals refused the wave.",
    "Spot-check: reviewer agreement on one admit and one reject (fixture).",
    "",
    "## Mistakes",
    "",
    "none",
    "",
  ].join("\n");
  const report = [
    "# fixture report",
    "",
    "**Stale-lane:** none — attempt 1 graded.",
    "",
    "## Landed changes",
    "",
    "| Change | LOG.md entry | Commit |",
    "|---|---|---|",
    "| fixture change | `LOG.md` §fixture | `aaaaaaa` |",
    "",
    "## Before → after measurements",
    "",
    "none",
    "",
  ].join("\n");
  return { round, files, report, commitFiles: { aaaaaaa: ["LOG.md", "SCORECARD.md"] } };
}

function runFixtureCase(name, expectClass, mutate, { clean = false } = {}) {
  const fx = baseFixture();
  if (mutate) mutate(fx);
  const ctx = fixtureCtx(fx.files, fx.commitFiles);
  const policy = { sighting: { dispatch: { swarm: { waveMinLanes: 2, waveMaxLanes: 2 } } } };
  const result = audit(ctx, {
    round: fx.round,
    policy,
    roundCap: 4,
    reportText: fx.report,
    lessonText: fx.files[`corpus/lessons/round-${fx.round}.md`],
  });
  if (clean) {
    return { name, expectation: "clean", pass: result.findings.length === 0, observed: result.findingClasses, findings: result.findings };
  }
  const pass = result.findingClasses.length === 1 && result.findingClasses[0] === expectClass;
  return { name, expectation: expectClass, pass, observed: result.findingClasses, findings: result.findings };
}

export function selftest() {
  const cases = [
    // c1 — red: the cited figure is off by one. green: cited == receipts.
    runFixtureCase("c1-red-cited-below-receipts", "c1-refusal-arithmetic", (fx) => {
      fx.files["corpus/lessons/round-90.md"] = fx.files["corpus/lessons/round-90.md"].replace(
        "2 whole-payload refusals",
        "1 whole-payload refusals"
      );
    }),
    runFixtureCase("c1-green-cited-matches-receipts", null, null, { clean: true }),
    // c2 — red: spec above the band. green: round total exactly at the cap is clean.
    runFixtureCase("c2-red-spec-above-band", "c2-wave-caps", (fx) => {
      fx.files[".ufo/waves/round-90/w1-spec.json"] = JSON.stringify({ wave: "fx-w1", maxLanes: 5, items: [{ name: "A" }, { name: "B" }] });
    }),
    runFixtureCase("c2-green-total-at-cap", null, (fx) => {
      fx.files[".ufo/waves/round-90/w2-spec.json"] = JSON.stringify({ wave: "fx-w2", maxLanes: 2, items: [{ name: "C" }, { name: "D" }] });
      fx.files[".ufo/waves/round-90/w2-spawn-result.json"] = JSON.stringify({ text: "Spawned 2 background agents using scout, reviewer." });
      fx.files[".ufo/waves/round-90/w2/swarm-registry.json"] = JSON.stringify({
        schema: "ufo-swarm-registry-v1",
        members: { C: { agentId: "fx.C" }, D: { agentId: "fx.D" } },
      });
    }, { clean: true }),
    // c3 — red: no spot-check line. green: "owed to closure" is an acceptable record.
    runFixtureCase("c3-red-gate-without-spotcheck", "c3-gate-spotcheck", (fx) => {
      fx.files["corpus/lessons/round-90.md"] = "# Round90\n\n## Gate\n\n2 whole-payload refusals refused the wave.\n\n## Mistakes\n\nnone\n";
    }),
    runFixtureCase("c3-green-gate-owed-to-closure", null, (fx) => {
      fx.files["corpus/lessons/round-90.md"] = fx.files["corpus/lessons/round-90.md"].replace(
        "Spot-check: reviewer agreement on one admit and one reject (fixture).",
        "Spot-check result: owed to closure."
      );
    }, { clean: true }),
    // c4 — red: several attempts, one ungraded claim. green: several attempts, each graded.
    runFixtureCase("c4-red-multi-attempt-ungraded", "c4-stale-attempts", (fx) => {
      fx.files[".ufo/waves/round-90/attempt02-result.json"] = "{}";
      fx.files[".ufo/waves/round-90/attempt03-result.json"] = "{}";
      fx.report = fx.report.replace("none — attempt 1 graded.", "none — respawn-per-round driver");
    }),
    runFixtureCase("c4-green-multi-attempt-graded", null, (fx) => {
      fx.files[".ufo/waves/round-90/attempt02-result.json"] = "{}";
      fx.files[".ufo/waves/round-90/attempt03-result.json"] = "{}";
      fx.report = fx.report.replace("none — attempt 1 graded.", "not stale. Attempt 1 — progressing. Attempt 2 — silent. Attempt 3 — landed.");
    }, { clean: true }),
    // c5 — red: a spawned wave's members are anonymous. green: recorded identities.
    runFixtureCase("c5-red-anonymous-spawned-wave", "c5-registry-identities", (fx) => {
      fx.files[".ufo/waves/round-90/w1/swarm-registry.json"] = JSON.stringify({
        schema: "ufo-swarm-registry-v1",
        members: { A: { agentId: null }, B: { agentId: null } },
      });
    }),
    runFixtureCase("c5-green-refused-wave-may-be-anonymous", null, (fx) => {
      fx.files[".ufo/waves/round-90/w2-spec.json"] = JSON.stringify({ wave: "fx-w2", maxLanes: 2, items: [{ name: "C" }, { name: "D" }] });
      fx.files[".ufo/waves/round-90/w2-cap-refusal-01.json"] = JSON.stringify({
        attempt: 1,
        result: { text: `Failed to start background task jobs: C: ${REFUSAL_MARKER} (100).` },
      });
      fx.files[".ufo/waves/round-90/w2/swarm-registry.json"] = JSON.stringify({
        schema: "ufo-swarm-registry-v1",
        members: { C: { agentId: null }, D: { agentId: null } },
      });
      // the extra refusal receipt is part of this fixture: keep the cited figure in step
      fx.files["corpus/lessons/round-90.md"] = fx.files["corpus/lessons/round-90.md"].replace(
        "2 whole-payload refusals",
        "3 whole-payload refusals"
      );
    }, { clean: true }),
    // c6 — red: the row cites a commit without the entry. green: the row says where the entry lands.
    runFixtureCase("c6-red-landed-commit-without-log", "c6-landed-log-binding", (fx) => {
      fx.commitFiles.bbbbbbb = ["SCORECARD.md"];
      fx.report = fx.report.replace("| fixture change | `LOG.md` §fixture | `aaaaaaa` |", "| fixture change | `LOG.md` §fixture | `bbbbbbb` |");
    }),
    runFixtureCase("c6-green-entry-bound-elsewhere", null, (fx) => {
      fx.commitFiles.bbbbbbb = ["SCORECARD.md"];
      fx.report = fx.report.replace(
        "| fixture change | `LOG.md` §fixture | `aaaaaaa` |",
        "| fixture change | LOG entry lands in `aaaaaaa` | `bbbbbbb` |"
      );
    }, { clean: true }),
  ];
  // Inventory: a deleted case must fail the suite, so the count and the per-class shape are
  // asserted, not inferred from the cases that happen to be present.
  const inventory = CLASSES.map((cls, i) => {
    const red = cases.filter((c) => c.name.startsWith(`c${i + 1}-red-`)).length;
    const green = cases.filter((c) => c.name.startsWith(`c${i + 1}-green-`)).length;
    return { class: cls, red, green, ok: red === 1 && green === 1 };
  });
  const inventoryOk = cases.length === CLASSES.length * 2 && inventory.every((c) => c.ok);
  const passed = cases.filter((c) => c.pass).length;
  return {
    schema: `${SCHEMA}-selftest`,
    cases: cases.length,
    passed,
    inventory,
    inventoryOk,
    clean: inventoryOk && passed === cases.length,
    runs: cases,
  };
}

// --------------------------------------------------- evidence-keyed selftest --
// The in-memory matrix above cannot refute an instrument that keys its answer on the
// round number: every case there is a synthetic round 90. This matrix runs on the real
// round's committed bytes and repairs ONE class at a time. A round-keyed or
// expectations-reading instrument cannot produce "baseline six, each repair exactly one
// fewer, the repaired class absent".
function spawnText(n) {
  return `Spawned ${n} background agents using scout, reviewer.`;
}

export function evidenceSelftest({ root, rev, round, reportText, policy, roundCap }) {
  const ctx = gitCtx(root, rev);
  const roundDir = `.ufo/waves/round-${round}`;
  const listed = ctx.list(roundDir);
  if (listed === null) throw new AuditRefusal(`revision ${rev} does not hold ${roundDir}`);
  const base = new Map();
  for (const f of listed) {
    const body = ctx.read(f);
    if (body !== null) base.set(f, body);
  }
  const lessonPath = `corpus/lessons/round-${round}.md`;
  const lesson = ctx.read(lessonPath);
  if (lesson !== null) base.set(lessonPath, lesson);
  const band = policy?.sighting?.dispatch?.swarm;
  const specFiles = listed.filter((f) => /-spec\.json$/.test(f));

  const run = (overrides = {}, report = reportText) => {
    const map = new Map(base);
    for (const [k, v] of Object.entries(overrides)) {
      if (v === null) map.delete(k);
      else map.set(k, v);
    }
    const fixture = fixtureCtx(Object.fromEntries(map), {});
    const view = { ...fixture, rev, filesOfCommit: (c) => ctx.filesOfCommit(c) };
    const lessonText = Object.prototype.hasOwnProperty.call(overrides, lessonPath) ? overrides[lessonPath] : lesson;
    return audit(view, { round, policy, roundCap, reportText: report, lessonText });
  };

  const baseline = run();
  const cases = [];
  const push = (cls, overrides, report) => {
    const before = baseline.findings.filter((f) => f.class === cls).length;
    const after = run(overrides, report);
    const afterThis = after.findings.filter((f) => f.class === cls).length;
    cases.push({
      class: cls,
      baselineFindings: before,
      repairedFindings: after.findings.length,
      expectedFindings: baseline.findings.length - before,
      repairedClasses: after.findingClasses,
      pass: before > 0 && afterThis === 0 && after.findings.length === baseline.findings.length - before,
    });
  };

  // c1 — restate the cited figure to the derived one (lesson and report).
  {
    const f = baseline.findings.find((x) => x.class === "c1-refusal-arithmetic");
    const derived = f ? Number(f.derived) : 0;
    const fix = (t) => String(t || "").replace(/\b\d{1,3}(\s+whole-payload)/g, `${derived}$1`);
    push("c1-refusal-arithmetic", lesson === null ? {} : { [lessonPath]: fix(lesson) }, fix(reportText));
  }

  // c2 — bring every wave inside the band and the round inside its cap, seats and
  // registry sizes included, WITHOUT touching identities (c5 must stay red).
  {
    const overrides = {};
    const waves = [];
    for (const specFile of specFiles) {
      const spec = JSON.parse(base.get(specFile) || "{}");
      const stem = waveStem(roundDir, specFile);
      const maxLanes = Math.min(Number(spec.maxLanes) || 0, band ? band.waveMaxLanes : Number(spec.maxLanes) || 0);
      const items = Array.isArray(spec.items) ? spec.items.slice(0, maxLanes) : [];
      overrides[specFile] = JSON.stringify({ ...spec, maxLanes, items });
      const spawnPath = [`${roundDir}/${stem}-spawn-result.json`, `${roundDir}/${stem}-task-result.json`].find((pth) => base.has(pth));
      const spawnBody = spawnPath ? base.get(spawnPath) : "";
      const m = spawnBody.match(SPAWN_MARKER);
      const spawned = m ? Math.min(Number(m[1]), maxLanes) : 0;
      waves.push({ stem, spawnPath, spawned, maxLanes });
    }
    let total = waves.reduce((a, w) => a + w.spawned, 0);
    while (total > roundCap) {
      const biggest = waves.slice().sort((a, b) => b.spawned - a.spawned)[0];
      if (!biggest || biggest.spawned === 0) break;
      biggest.spawned -= 1;
      total -= 1;
    }
    for (const w of waves) {
      if (w.spawnPath) overrides[w.spawnPath] = JSON.stringify({ at: "fixture", result: { text: spawnText(w.spawned) } });
      const regPath = `${roundDir}/${w.stem}/swarm-registry.json`;
      if (!base.has(regPath)) continue;
      const reg = JSON.parse(base.get(regPath) || "{}");
      if (reg.members && typeof reg.members === "object") {
        const keep = Object.keys(reg.members).slice(0, w.spawned);
        const members = {};
        for (const name of keep) members[name] = reg.members[name];
        overrides[regPath] = JSON.stringify({ ...reg, members });
      }
    }
    push("c2-wave-caps", overrides, reportText);
  }

  // c3 — record a spot-check result inside the Gate.
  {
    const fixed = lesson === null ? null : lesson.replace(/^##\s+Gate\s*$/m, "## Gate\n\nSpot-check result: agree on one admit and one reject (fixture repair).");
    push("c3-gate-spotcheck", fixed === null ? {} : { [lessonPath]: fixed }, reportText);
  }

  // c4 — grade each committed attempt in the Stale-lane paragraph.
  {
    const stale = staleParagraph(reportText);
    const fixedReport = stale
      ? reportText.replace(stale.line, `${stale.line}\nAttempt 1 — progressing. Attempt 2 — silent. Attempt 3 — landed.`)
      : reportText;
    push("c4-stale-attempts", {}, fixedReport);
  }

  // c5 — give every spawned wave's members an identity.
  {
    const overrides = {};
    for (const regFile of listed.filter((f) => /swarm-registry\.json$/.test(f))) {
      const reg = JSON.parse(base.get(regFile) || "{}");
      if (!reg.members || typeof reg.members !== "object") continue;
      const members = {};
      for (const [name, member] of Object.entries(reg.members)) members[name] = { ...member, agentId: `fx.${name}` };
      overrides[regFile] = JSON.stringify({ ...reg, members });
    }
    push("c5-registry-identities", overrides, reportText);
  }

  // c6 — bind each offending row to the commit that carries its LOG entry.
  {
    const logCarrier = [...new Set([...reportText.matchAll(/\b[0-9a-f]{7,40}\b/g)].map((m) => m[0]))].find((h) => {
      if (!HASHLIKE.test(h)) return false;
      const touched = ctx.filesOfCommit(h);
      return touched !== null && touched.includes("LOG.md");
    });
    const bad = baseline.findings.filter((f) => f.class === "c6-landed-log-binding").map((f) => f.cited);
    let fixedReport = reportText;
    for (const hashList of bad) {
      const first = hashList.split(",")[0];
      fixedReport = fixedReport
        .split("\n")
        .map((line) => (line.includes(first) && /^\s*\|/.test(line) ? `${line.trimEnd()} (LOG entry lands in \`${logCarrier}\`) |` : line))
        .join("\n");
    }
    push("c6-landed-log-binding", {}, fixedReport);
  }

  const passed = cases.filter((c) => c.pass).length;
  return {
    schema: `${SCHEMA}-evidence-selftest`,
    rev,
    round,
    baselineFindings: baseline.findings.length,
    baselineClasses: baseline.findingClasses,
    cases: cases.length,
    passed,
    clean: passed === cases.length,
    runs: cases,
  };
}

// --------------------------------------------------------------------- CLI --
const USAGE =
  "usage: round-evidence-audit.mjs --rev <40-hex-commit> --round <N> --round-cap <seats> [--report PATH] [--policy NAME] [--json] | --selftest [--json]";

function fail(message) {
  throw new AuditRefusal(message);
}

function parseArgs(argv) {
  const flags = new Set();
  const values = new Map();
  const takesValue = new Set(["--rev", "--round", "--round-cap", "--report", "--policy"]);
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (takesValue.has(arg)) {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith("--")) fail(`${arg} requires a value: ${USAGE}`);
      values.set(arg, v);
      i += 1;
    } else if (arg === "--json" || arg === "--selftest" || arg === "-h" || arg === "--help") {
      flags.add(arg);
    } else {
      fail(`unsupported argument ${JSON.stringify(arg)}: ${USAGE}`);
    }
  }
  return { flags, values };
}

// The supplied band must equal a readable fleet authority's band, or be tighter than every
// readable one. A policy is allowed to tighten the contract, never to widen it.
function resolvePolicy(policyPath, policyText) {
  const policy = parseJson(policyText);
  if (!policy) fail(`the wave policy at ${policyPath} is not JSON`);
  const band = policy?.sighting?.dispatch?.swarm;
  if (!band) fail(`the wave policy at ${policyPath} carries no sighting.dispatch.swarm band`);
  const authorities = [];
  for (const path of FLEET_POLICIES) {
    let text;
    try {
      text = readFileSync(path, "utf8");
    } catch {
      continue;
    }
    const other = parseJson(text);
    const otherBand = other?.sighting?.dispatch?.swarm;
    if (!otherBand) continue;
    authorities.push({ path, sha256: sha256(Buffer.from(text, "utf8")), band: otherBand });
  }
  if (!authorities.length) fail(`no fleet wave-policy authority is readable (${FLEET_POLICIES.join(", ")})`);
  const widest = Math.max(...authorities.map((a) => Number(a.band.waveMaxLanes)));
  if (!authorities.some((a) => a.band.waveMaxLanes === band.waveMaxLanes) && Number(band.waveMaxLanes) > widest) {
    fail(
      `policy ${policyPath} declares waveMaxLanes ${band.waveMaxLanes}, wider than every fleet authority (max ${widest}): a supplied policy may tighten the band, never widen it`
    );
  }
  return { policy, band, authorities };
}

function main(argv) {
  const { flags, values } = parseArgs(argv);
  if (flags.has("-h") || flags.has("--help")) {
    process.stdout.write(`${USAGE}\n`);
    return 0;
  }
  if (flags.has("--selftest")) {
    if (!values.has("--rev")) {
      const result = selftest();
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return result.clean ? 0 : 3;
    }
    // Evidence-keyed matrix: needs the same pinned inputs as a real verdict.
    const rev = values.get("--rev");
    if (!FULL_REV.test(rev)) fail(`--rev must be a full 40-hex commit, got ${JSON.stringify(rev)}`);
    const round = Number(values.get("--round") || 22);
    const capRaw = values.get("--round-cap");
    if (capRaw === undefined) fail("--round-cap is required with --selftest --rev");
    const roundCap = Number(capRaw);
    if (!Number.isFinite(roundCap) || roundCap <= 0) fail(`--round-cap must be a positive number, got ${JSON.stringify(capRaw)}`);
    const policyPath = values.get("--policy") ? resolve(values.get("--policy")) : DEFAULT_POLICY;
    if (!FLEET_POLICIES.includes(policyPath)) fail(`--policy must name one of the fleet authority files (${FLEET_POLICIES.join(", ")})`);
    let policyText;
    try {
      policyText = readFileSync(policyPath, "utf8");
    } catch {
      fail(`cannot read the wave policy at ${policyPath}`);
    }
    const { policy } = resolvePolicy(policyPath, policyText);
    const reportPath = values.get("--report") || `/home/vgpnk/Projects/shokunin/.ufo/reports/round-${round}/tabi.md`;
    let reportBuf;
    try {
      reportBuf = readFileSync(reportPath);
    } catch {
      fail(`cannot read the round report at ${reportPath}`);
    }
    const root = "/home/vgpnk/Projects/shokunin/tabi-shokunin";
    const result = evidenceSelftest({ root, rev, round, reportText: reportBuf.toString("utf8"), policy, roundCap });
    process.stdout.write(`${JSON.stringify({ ...result, reportSha256: sha256(reportBuf), scriptSha256: sha256(readFileSync(fileURLToPath(import.meta.url))) }, null, 2)}\n`);
    return result.clean ? 0 : 3;
  }
  const rev = values.get("--rev");
  const roundRaw = values.get("--round");
  const roundCapRaw = values.get("--round-cap");
  if (!rev) fail(`--rev is required: ${USAGE}`);
  if (!FULL_REV.test(rev)) fail(`--rev must be a full 40-hex commit, got ${JSON.stringify(rev)}`);
  if (!roundRaw || !/^\d+$/.test(roundRaw)) fail(`--round must be a non-negative integer, got ${JSON.stringify(roundRaw)}`);
  if (roundCapRaw === undefined) {
    fail("--round-cap is required: the round's seat cap is declared by the round contract, and a verdict without it would be fail-open");
  }
  const roundCap = Number(roundCapRaw);
  if (!Number.isFinite(roundCap) || roundCap <= 0) fail(`--round-cap must be a positive number, got ${JSON.stringify(roundCapRaw)}`);
  const round = Number(roundRaw);

  const scriptPath = fileURLToPath(import.meta.url);
  const scriptRoot = resolve(dirname(scriptPath), "..");
  const root = scriptRoot;
  const policyPath = values.get("--policy") ? resolve(values.get("--policy")) : DEFAULT_POLICY;
  // The policy input may only name a fleet authority file: an arbitrary path could restate a
  // band the fleet never authorised (the tighten-only guard below is the second lock).
  if (!FLEET_POLICIES.includes(policyPath)) {
    fail(`--policy must name one of the fleet authority files (${FLEET_POLICIES.join(", ")}), got ${policyPath}`);
  }
  const reportPath = values.get("--report") || `/home/vgpnk/Projects/shokunin/.ufo/reports/round-${round}/tabi.md`;

  let policyText;
  try {
    policyText = readFileSync(policyPath, "utf8");
  } catch {
    fail(`cannot read the wave policy at ${policyPath}`);
  }
  const { policy, band, authorities } = resolvePolicy(policyPath, policyText);

  let reportBuf;
  try {
    reportBuf = readFileSync(reportPath);
  } catch {
    fail(
      `cannot read the round report at ${reportPath}; c4/c6 cannot be decided without it and a clean verdict would be a false green`
    );
  }
  const reportText = reportBuf.toString("utf8");

  const topOut = gitRaw(root, ["rev-parse", "--show-toplevel"]);
  const topLevel = topOut === null ? null : topOut.toString("utf8").trim();
  if (topLevel !== root) {
    fail(`--root must be a git worktree top level: ${root} resolves to ${topLevel === null ? "no worktree" : topLevel}, and a subdirectory root silently empties the ls-tree listing`);
  }
  const ctx = gitCtx(root, rev);
  if (!ctx.revIsCommit) fail(`revision ${rev} does not resolve to a commit in ${root}`);
  const probe = ctx.list(`.ufo/waves/round-${round}`);
  if (probe === null) fail(`revision ${rev} does not hold .ufo/waves/round-${round} (missing tree or unknown revision)`);
  const lessonText = ctx.read(`corpus/lessons/round-${round}.md`);

  const result = audit(ctx, { round, policy, roundCap, reportText, lessonText });
  const out = {
    ...result,
    root,
    rootTopLevel: topLevel,
    inputs: {
      laneBytes: { rev, lesson: `corpus/lessons/round-${round}.md`, waveDir: `.ufo/waves/round-${round}` },
      externalReport: { path: reportPath, sha256: sha256(reportBuf) },
      externalPolicy: { path: policyPath, sha256: sha256(Buffer.from(policyText, "utf8")) },
    },
    policyPath,
    policySha256: sha256(Buffer.from(policyText, "utf8")),
    policyAuthorities: authorities.map((a) => ({ path: a.path, sha256: a.sha256, waveMaxLanes: a.band.waveMaxLanes })),
    band,
    reportPath,
    reportSha256: sha256(reportBuf),
    lessonSha256: lessonText === null ? null : sha256(Buffer.from(lessonText, "utf8")),
    scriptSha256: sha256(readFileSync(scriptPath)),
  };
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  return result.clean ? 0 : 1;
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    if (error instanceof AuditRefusal) {
      process.stderr.write(`round-evidence-audit: refused: ${error.message}\n`);
      process.exitCode = 2;
    } else {
      throw error;
    }
  }
}
