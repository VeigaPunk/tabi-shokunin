import { audit } from "/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/round-evidence-audit.mjs";
const round = 90, dir = `.ufo/waves/round-${round}`;
const files = {
  [`${dir}/w1-spec.json`]: JSON.stringify({ wave: "w", maxLanes: 2, items: [{}, {}] }),
  [`${dir}/w1-spawn-result.json`]: JSON.stringify({ text: "Spawned 2 background agents using scout, reviewer." }),
  [`${dir}/w1/swarm-registry.json`]: JSON.stringify({ members: { A: { agentId: "a" }, B: { agentId: "b" } } }),
  [`corpus/lessons/round-${round}.md`]: "# R\n\n## Gate\n\nSpot-check: agree.\n\n## X\n",
};
const report = [
  "# r", "", "**Stale-lane:** none.", "", "## Landed changes", "",
  "| Change | LOG.md entry | Commit |", "|---|---|---|",
  "| a | `LOG.md` S1 | `deadbeefdeadbeefdeadbeefdeadbeefdeadbeef` |",
  "| b | `LOG.md` S2 | `1234567` |",
  "| c | `LOG.md` S3 | `feedface` |",
  "", "## End", "",
].join("\n");
const ctx = { kind: "fixture", rev: "x", revIsCommit: true,
  list: (p) => Object.keys(files).filter((f) => f === p || f.startsWith(p + "/")),
  read: (p) => files[p] ?? null,
  filesOfCommit: () => null };
const r = audit(ctx, { round, policy: { sighting: { dispatch: { swarm: { waveMinLanes: 2, waveMaxLanes: 2 } } } }, roundCap: 4, reportText: report, lessonText: files[`corpus/lessons/round-${round}.md`] });
console.log(JSON.stringify({ clean: r.clean, classes: r.findingClasses, c6: r.findings.filter((f) => f.class === "c6-landed-log-binding").length }));
