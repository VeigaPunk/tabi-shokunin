#!/usr/bin/env node
// ufo-route-preflight — pre-dispatch route reachability for one swarm wave
// (ONESHOT SUB-8 item 1). The duty belongs to the dispatcher before any lane
// spawns. It is not an L2 `route-prober` seat: a lane cannot prevent sibling
// deaths inside its own wave.
//
// A wave's spawn lanes carry taxonomy roles, and OMP resolves each role's route
// from the global config (seat override -> alias -> chain). This module:
//   1. reads ONE fd-bound snapshot of that config (path + sha256);
//   2. groups the wave's lanes into route families, one per distinct resolved
//      primary + ordered chain. That count is the §4 wave-sizing input (a wave
//      whose lanes all sit on one cascade is the 16/36 and 44/48 death shape);
//   3. with a probe, pings each distinct hop at most once, walking each
//      family's chain in order. A family is reachable when any hop answers,
//      because the cascade falls through. A family where no hop answers
//      refuses the wave with typed `route_unreachable` before anything spawns.
//
// The probe is an executable invoked without a shell as
// `<probe> --route <provider/model[:effort]>`: exit 0 means reachable, anything
// else means unreachable. The failure class is read from stdout
// `results[0].failureClass`, else the first stderr line, else the exit status.
// That is the CLI of the in-repo secret-safe probe
// `scripts/probe-ufo-route-health.mjs` (OMP is its credential authority; exit
// 0 healthy, 3 unhealthy), so `--route-probe scripts/probe-ufo-route-health.mjs`
// works as is. Note that it spends one minimal completion per hop rather than
// zero tokens, and it refuses effort-less hops as a usage error (the grammar
// divergence ONESHOT WO-2 names). This module never reads, passes or records a
// credential, and it passes no stdin.
import { spawnSync } from "node:child_process";
import { readGlobalSeatRouting } from "./omp-global-config.mjs";

export const ROUTE_PREFLIGHT_SCHEMA = "ufo-route-preflight-v1";
export const PROBE_TIMEOUT_MS = 60_000;
const MAX_PROBE_OUTPUT = 1024 * 1024;
const MAX_CLASS_CHARS = 120;

export class RoutePreflightError extends Error {
  constructor(code, message, details) {
    super(message);
    this.name = "RoutePreflightError";
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

/**
 * Group lane roles into route families from a readGlobalSeatRouting snapshot.
 * A role with no seat override is `unpinned`: OMP runs it on the session
 * default, which is not a cascade this preflight can attribute, so it is
 * reported and never probed.
 * @param {Map<string, number>} laneCounts role -> spawn-lane count
 * @param {{ seats: Map<string, { route: string, fallbackChain: string[], via: { alias: string | null } }> }} routing
 */
export function routeFamilies(laneCounts, routing) {
  const families = new Map();
  const unpinned = [];
  for (const [role, lanes] of [...laneCounts].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const seat = routing.seats.get(role);
    if (seat === undefined) {
      unpinned.push({ role, lanes });
      continue;
    }
    const hops = [seat.route, ...seat.fallbackChain];
    const key = hops.join(" -> ");
    if (!families.has(key)) families.set(key, { alias: seat.via?.alias ?? null, hops, roles: [], lanes: 0 });
    const family = families.get(key);
    family.roles.push(role);
    family.lanes += lanes;
  }
  return { families: [...families.values()], unpinned };
}

function printable(text) {
  return String(text ?? "").replace(/[^A-Za-z0-9_.:/ -]/gu, "").trim().slice(0, MAX_CLASS_CHARS);
}

/** Bounded, printable failure class from a probe's output. */
function failureClass(stdout, stderr, fallback) {
  try {
    const reported = JSON.parse(stdout)?.results?.[0]?.failureClass;
    if (typeof reported === "string" && printable(reported).length > 0) return printable(reported);
  } catch {
    // not the route-health envelope; fall through to stderr
  }
  const first = printable(String(stderr ?? "").split("\n", 1)[0]);
  return first.length > 0 ? first : fallback;
}

/** Probe adapter over an executable; returns (hop) => { ok, class? }. */
export function commandProbe(executable, { timeoutMs = PROBE_TIMEOUT_MS, env = process.env } = {}) {
  if (typeof executable !== "string" || executable.length === 0) {
    throw new RoutePreflightError("usage", "route probe executable must be a nonempty path");
  }
  return (hop) => {
    const run = spawnSync(executable, ["--route", hop], {
      env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      timeout: timeoutMs,
      killSignal: "SIGKILL",
      maxBuffer: MAX_PROBE_OUTPUT,
      encoding: "utf8",
    });
    if (run.error?.code === "ETIMEDOUT") return { ok: false, class: "probe_timeout" };
    if (run.error) return { ok: false, class: `probe_spawn_error:${run.error.code ?? "unknown"}` };
    if (run.status === 0) return { ok: true };
    return { ok: false, class: failureClass(run.stdout, run.stderr, run.signal ? `signal_${run.signal}` : `exit_${run.status}`) };
  };
}

/**
 * Walk every family's chain in order with `probe`, pinging each distinct hop at
 * most once across the wave. Mutates nothing it was given.
 */
export function probeFamilies(families, probe) {
  const seen = new Map();
  const ping = (hop) => {
    if (!seen.has(hop)) seen.set(hop, probe(hop));
    return seen.get(hop);
  };
  const probed = families.map((family) => {
    const attempts = [];
    for (const hop of family.hops) {
      const result = ping(hop);
      attempts.push(result.ok ? { hop, ok: true } : { hop, ok: false, class: result.class });
      if (result.ok) return { ...family, status: "reachable", reachableHop: hop, attempts };
    }
    return { ...family, status: "unreachable", reachableHop: null, attempts };
  });
  return { families: probed, pings: seen.size };
}

/**
 * The wave preflight. `probe` null records the route families only (the
 * sizing snapshot) and never refuses. Throws RoutePreflightError
 * `route_unreachable` (with the report as details) when any probed family has
 * no reachable hop, and `route_config_unavailable` when no global config
 * snapshot can be read. A wave never falls back to a project-local route.
 * `laneCounts` null attests every seat the config declares, one lane each
 * (the fleet-manifest attestation, SUB-8 item 2).
 * @param {{ laneCounts: Map<string, number> | null, probe?: ((hop: string) => { ok: boolean, class?: string }) | null, routingOptions?: object }} input
 */
export function routePreflight({ laneCounts: requested, probe = null, routingOptions = {} }) {
  let routing;
  try {
    routing = readGlobalSeatRouting(routingOptions);
  } catch (error) {
    throw new RoutePreflightError("route_config_unavailable", `route preflight needs the global OMP config: ${error?.message ?? error}`);
  }
  const laneCounts = requested ?? new Map([...routing.seats.keys()].map((seat) => [seat, 1]));
  const { families, unpinned } = routeFamilies(laneCounts, routing);
  const totalLanes = [...laneCounts.values()].reduce((sum, n) => sum + n, 0);
  const largest = families.reduce((max, family) => Math.max(max, family.lanes), 0);
  const base = {
    schema: ROUTE_PREFLIGHT_SCHEMA,
    config: { path: routing.path, sha256: routing.sha256 },
    concentration: {
      families: families.length,
      largestFamilyLanes: largest,
      pinnedLanes: totalLanes - unpinned.reduce((sum, row) => sum + row.lanes, 0),
      singleFamily: families.length === 1 && largest > 1,
    },
    unpinned,
  };
  if (probe === null) {
    return { ...base, status: "unprobed", pings: 0, families: families.map((family) => ({ ...family, status: "unprobed" })) };
  }
  const probed = probeFamilies(families, probe);
  const dead = probed.families.filter((family) => family.status === "unreachable");
  const report = { ...base, status: dead.length === 0 ? "reachable" : "unreachable", pings: probed.pings, families: probed.families };
  if (dead.length > 0) {
    const names = dead.map((family) => `${family.alias ? `@${family.alias}` : family.hops[0]} (${family.roles.join(", ")})`).join("; ");
    throw new RoutePreflightError("route_unreachable", `no hop answered for ${dead.length} route famil${dead.length === 1 ? "y" : "ies"}: ${names}; no lane was spawned`, report);
  }
  return report;
}
