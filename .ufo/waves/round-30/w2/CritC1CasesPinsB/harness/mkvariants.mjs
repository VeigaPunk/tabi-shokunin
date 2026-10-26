// Make wrong-gate variants from the pristine rev-072af95 gate; each substitution must
// apply exactly once. Catalogue mutants A/B/I/J come from scripts/gate-mutants.json
// (find/replace pairs), the rest are plausible weakened checks of my own.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SRC = "/fast/scratch/hyaku/tabi-r30/CritC1CasesPinsB/clone/scripts/check-release-pins.mjs";
const OUT = "/fast/scratch/hyaku/tabi-r30/CritC1CasesPinsB/variants";
const base = readFileSync(SRC, "utf8");
const cat = JSON.parse(readFileSync("/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/gate-mutants.json", "utf8"));
const byId = Object.fromEntries(cat.mutants.map((m) => [m.id, m]));

const PREFIX = "sup.teaches.startsWith(`supersedes ${row.id} —`)";
const TAGCHK = "sup.source.includes(`refs/tags/${stable}/`)";
const NF = `f.new_status === 404 && nb.toString("utf8").includes("NOT_FOUND")`;

const variants = [
  ["A_catalogue_prefix", "pins-s1-supersession-prefix"],
  ["B_catalogue_tag", "pins-s1-supersession-tag"],
  ["I_catalogue_nf_status", "pins-notfound-status"],
  ["J_catalogue_nf_body", "pins-notfound-body"],
  ["C_any_supersedes_text", [PREFIX, "sup.teaches.includes(\"supersedes\")"]],
  ["D_prefix_any_id", [PREFIX, "sup.teaches.startsWith(\"supersedes \")"]],
  ["E_any_text_with_dash", [PREFIX, "sup.teaches.includes(\" —\")"]],
  ["F_any_tag", [TAGCHK, "sup.source.includes(\"refs/tags/\")"]],
  ["G_tag_ge_old", [TAGCHK, "sup.tags.some((t) => cmpVersion(t, \"154.0.8037.97\") >= 0)"]],
  ["H_superseder_exists_only", [`const ok = sup && ${PREFIX} && ${TAGCHK};`, "const ok = !!sup;"]],
  ["K_notfound_any_nonempty", [NF, "nb.length > 0"]],
  ["L_notfound_weak_marker_404", [NF, `nb.toString("utf8").includes("404")`]],
];

mkdirSync(OUT, { recursive: true });
for (const [name, spec] of variants) {
  let find, replace;
  if (typeof spec === "string") {
    const m = byId[spec];
    if (!m) throw new Error(`catalogue mutant absent: ${spec}`);
    find = m.find; replace = m.replace;
  } else [find, replace] = spec;
  const count = base.split(find).length - 1;
  if (count !== 1) throw new Error(`${name}: find occurs ${count} times`);
  writeFileSync(`${OUT}/${name}.mjs`, base.replace(find, replace));
  console.log(`VARIANT ${name} find_occurrences=1 bytes=${find.length}->${replace.length}`);
}
