# FamDateTime — round 19 wave 1

**Verdict:** implemented the assigned `date-time` validation fixture and five runtime decision cases in the isolated clone. All expected values below were observed twice on Chromium 154.0.8037.97, Node v24.21.0, Playwright 1.64.0. Each test used a fresh browser context/page, `WebMCP.enable`, a retained `WebMCP.toolsAdded` schema, `WebMCP.invokeTool`, and `WebMCP.toolResponded` within the 8-second window. No status/error/field/submit-count nondeterminism was observed across the two repetitions; frame and invocation IDs differed as expected.

## Retained production evidence

- `corpus/evidence/round-19/validation/fixtures/date-time.html` — four controls (`date`, `time`, `datetime-local`, `month`) in one loopback-only declarative tool form. Submit listener records `{agentInvoked,isTrusted,fields}`, prevents default, then responds with the `FormData` fields.
  - SHA-256: `85f518f6699ffc01ceca85effacd086fb7cb5e5f77429a803ad909ac03eb7683`
- `corpus/evidence/round-19/validation/cases/date-time.json` — five `tabi-webmcp-validation-cases-v1` cases; expectations include status, error substring, submit count, post-invoke field values, and schema formats.
  - SHA-256: `e6df1ee73bd119d829e5d1065d52ba3676da594b903412b9d7b021c46db16209`
- `corpus/evidence/round-19/validation/probes/date-time.json` — complete raw evidence for 10 invocations (five cases × two runs): `toolsAdded` params/input schema, `invokeTool` params/reply, `toolResponded` params, calls, and post-invoke values/validity states.
  - SHA-256: `c8208beef9e9a137603bbdc4e310dcc5a6c6c9c50e3c87c197c8312b692a92ef`
- Runtime identity observed in the retained probe: Chromium `154.0.8037.97` at `/usr/bin/chromium`; Playwright `1.64.0`; Node `v24.21.0`. Effective launch included `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`, WebMCP feature switches merged with Playwright's default feature switch, and the CDP pipe (no TCP DevTools port). The server bound only to `127.0.0.1`; contexts used `acceptDownloads:false` and fresh private HOME/TMPDIR.

## Observed decision rows

All four fields were present in the captured `toolsAdded` schema. Observed formats: `date` → `date`; `time` → `^([01][0-9]|2[0-3]):[0-5][0-9]$`; `datetime-local` → `^[0-9]{4}-(0[1-9]|1[0-2])-[0-9]{2}T([01][0-9]|2[0-3]):[0-5][0-9]$`; `month` → `^[0-9]{4}-(0[1-9]|1[0-2])$`. `required` was `[]`.

1. `decl-date-time-01` — ISO input: `{date:"2026-10-21",time:"13:45",datetime:"2026-10-21T13:45",month:"2026-10"}` → **Completed**, no error text, submit count 1; post-invoke fields retained all four inputs. The call was `{agentInvoked:true,isTrusted:true}`. Source anchor: `html_form_element.cc:174-221`.
2. `decl-date-time-02` — date `10/21/2026` with other fields valid → **Error**, `Invalid value "10/21/2026" for parameter date`; submit count 0; all four values remained empty. Source anchor: `form_mcp_schema.cc:246-318` (date dispatch and `SanitizeValue`) and `208-243` (validate all entries before applying values).
3. `decl-date-time-03` — time `1:45 PM` with other fields valid → **Error**, `Invalid value "1:45 PM" for parameter time`; submit count 0; all four values remained empty. Source anchor: `form_mcp_schema.cc:246-318` and `208-243`.
4. `decl-date-time-04` — datetime-local `10/21/2026 1:45 PM` with other fields valid → **Error**, `Invalid value "10/21/2026 1:45 PM" for parameter datetime`; submit count 0; all four values remained empty. Source anchor: `form_mcp_schema.cc:246-318` and `208-243`.
5. `decl-date-time-05` — syntactically valid but out-of-range ISO input `{date:"2027-01-01",time:"08:00",datetime:"2027-01-01T08:00",month:"2027-01"}` → **Error**, `Form validation failed: date: Value must be 12/31/2026 or earlier.. time: Value must be 9:00 AM or later.. datetime: Value must be 12/31/2026, 5:00 PM or earlier.. month: Value must be December 2026 or earlier.. `; submit count 0; all four out-of-range values remained in their controls. `date`, `datetime`, and `month` had `rangeOverflow:true`; `time` had `rangeUnderflow:true`. Source anchor: `html_form_element.cc:729-759`.

**Sanitization distinction:** invalid locale-formatted inputs did not get filled and then become empty. Chromium rejected them during `FormMCPSchema::FillData` validation; the original empty control values remained unchanged. This distinction is captured by the `fields` expectations and the source order.

## Chromium source citations

Fetched Gitiles `?format=TEXT` at tag `154.0.8037.97`, decoded the bodies, and checked the cited lines. Access date: **2026-10-21**.

- `form_mcp_schema.cc:210`: “If the data isn't valid, form control states remain unchanged.” URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT — decoded-body SHA-256: `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`.
- `form_mcp_schema.cc:582-583`: “Dates MUST be provided in 'YYYY-MM-DD' format.” Same URL and decoded-body SHA-256 above.
- `html_form_element.cc:733`: `error_message.Append("Form validation failed: ");` URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT — decoded-body SHA-256: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.

## Probe and limitations

The first launch attempt used a scratch-root TMPDIR whose full Chromium singleton-socket path exceeded Chromium's path limit; Chromium aborted before any case. I moved only the private browser temp root to a unique short `/tmp/fd-*` directory, reran all cases twice successfully, then checked that no matching Chromium process or `/tmp/fd-*` directory remained. The final retained probe contains only successful runs. No tool was installed or updated. No build, lint, format, test suite, or harness check was run; the requested browser probe was the only execution check.

Five cases cover accepted ISO values for all four controls, bad formats for date/time/datetime-local, and out-of-range values for all four. A malformed `month` string was not a separate case within the five-case cap; its schema and valid/out-of-range values are retained and tested.

## Isolation

- Clone: `/fast/scratch/tabi-r19/FamDateTime`
- Branch: `r19/FamDateTime`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `e903a41a0fbded431db9d15d7d5864e0001f52a3`
- Changed paths:
  - `corpus/evidence/round-19/validation/cases/date-time.json`
  - `corpus/evidence/round-19/validation/fixtures/date-time.html`
  - `corpus/evidence/round-19/validation/probes/date-time.json`
