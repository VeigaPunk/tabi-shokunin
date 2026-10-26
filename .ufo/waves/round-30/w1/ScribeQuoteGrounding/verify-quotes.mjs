// Quote grounding check for routed defect 2 (S110/S114/S115 Gate quotes).
// Uses the lane counter's own normalise() so the check matches g5/g6 mechanics.
import fs from "node:fs";
import crypto from "node:crypto";
// normalise() is lifted verbatim from the frozen lane counter (scripts/check-frontier-admission.mjs:138-151),
// sliced out of the committed file so it cannot drift; the CLI entry of that module is never executed.
const COUNTER_SRC = "/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-frontier-admission.mjs";
const _src = fs.readFileSync(COUNTER_SRC, "utf8");
const _start = _src.indexOf("const ENTITIES = {");
const _endMarker = 'return t.replace(/\\s+/g, " ").trim();\n}';
const _end = _src.indexOf(_endMarker, _start) + _endMarker.length;
if (_start < 0 || _end < _endMarker.length) throw new Error("could not slice normalise()");
const normalise = new Function(_src.slice(_start, _end).replace("export function normalise", "function normalise") + "; return normalise;")();

const S = "/fast/scratch/hyaku/tabi-r30/ScribeQuoteGrounding";
const COMMITTED = "/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-29/release-pins/bytes/156.0.8078.47";
const sha256 = (b) => crypto.createHash("sha256").update(b).digest("hex");

const cases = [
  {
    id: "S110",
    file: "third_party/blink/renderer/core/html/forms/form_mcp_schema.cc",
    lines: "215-217",
    quote: "if (it == name_to_controls_.end()) { return ScriptToolError( ScriptToolErrorCode::kInvalidInputArguments,",
    expectSha: "904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f",
  },
  {
    id: "S114",
    file: "third_party/blink/renderer/core/html/forms/html_form_element.cc",
    lines: "867",
    quote: "executing_tool->CallDoneCallback(base::ok(String()));",
    expectSha: "2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102",
  },
  {
    id: "S115",
    file: "third_party/blink/renderer/core/html/forms/html_form_element.cc",
    lines: "203-206",
    quote: "if (!form_->GetDocument().IsActive()) { return std::move(done_callback) .Run(base::unexpected( ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed,",
    expectSha: "2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102",
  },
];

const words = (s) => s.replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
let fail = 0;
for (const c of cases) {
  const cb = fs.readFileSync(`${COMMITTED}/${c.file}`);
  const lb = fs.readFileSync(`${S}/live/${c.file.split("/").pop()}`);
  const cn = normalise(cb), ln = normalise(lb);
  const q = c.quote.replace(/\s+/g, " ").trim();
  const shaC = sha256(cb), shaL = sha256(lb);
  const inC = cn.includes(q), inL = ln.includes(q);
  const occ = cn.split(q).length - 1;
  const ok = inC && inL && occ === 1 && shaC === c.expectSha && shaL === c.expectSha && words(q) <= 25 && words(q) >= 1;
  if (!ok) fail++;
  console.log(JSON.stringify({
    id: c.id, file: c.file, lines: c.lines, words: words(q),
    sha_committed: shaC, sha_live: shaL, sha_matches_receipt: shaC === c.expectSha && shaL === c.expectSha,
    quote_in_committed: inC, quote_in_live: inL, occurrences_committed: occ,
    committed_equals_live: cn === ln, verdict: ok ? "PASS" : "FAIL",
  }));
}

// The two-literal span: prove the defect claim mechanically.
const html = fs.readFileSync(`${COMMITTED}/third_party/blink/renderer/core/html/forms/html_form_element.cc`, "utf8");
const lines207 = html.split("\n").slice(206, 208);
const joined = "The document was detached while filling out the form";
console.log(JSON.stringify({
  raw_line_207: lines207[0],
  raw_line_208: lines207[1],
  whole_message_in_source_bytes: html.includes(joined),
  whole_message_in_normalised_committed: normalise(html).includes(joined),
  first_literal_in_normalised: normalise(html).includes("The document was detached while filling out "),
  second_literal_in_normalised: normalise(html).includes("the form\")"),
}));
process.exit(fail === 0 ? 0 : 1);
