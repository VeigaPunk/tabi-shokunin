#!/usr/bin/env python3
"""CritC1Equivalence: per-survivor distinguishability harness.

For each of the 14 C1 fault survivors, build a minimal fixture git repo in
scratch and run the *pristine* gate bytes (061e620) and a single-site mutant
copy against it, in production mode (--repo/--rev/--stable). A survivor is
killable (non-equivalent) iff the two runs differ in exit code or reported
fields.
"""
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys

S = "/fast/scratch/hyaku/tabi-r30/CritC1Equivalence"
CLONE = f"{S}/clone"
FXROOT = f"{S}/fixtures"
GATEROOT = f"{S}/mutants"
PRISTINE_S106 = f"{CLONE}/scripts/check-s106-evidence.mjs"
PRISTINE_PINS = f"{CLONE}/scripts/check-release-pins.mjs"
CATALOGUE = f"{CLONE}/scripts/gate-mutants.json"

OLD = "154.0.8037.97"
NEW = "156.0.8078.47"
P = "content/public/common/feature.cc"
OLD_TEXT = "// header\nint a = 1;\n// Enable the thing.\nBASE_FEATURE(kThing, ENABLED);\nint z = 9;\n"
NEW_SAME = "// header v2\nint a = 2;\n\n// Enable the thing.\n  BASE_FEATURE(kThing,   ENABLED);\nint z = 9;\n"
NEW_DRIFT = "// header v2\n// Enable the thing.\nBASE_FEATURE(kThing, DISABLED);\n"
NF = "NOT_FOUND: Requested entity was not found.\n"


def sha(b):
    if isinstance(b, str):
        b = b.encode()
    return hashlib.sha256(b).hexdigest()


def abbr(text):
    h = sha(text)
    return f"{h[:8]}\u2026{h[-4:]}"


def git(root, *args):
    r = subprocess.run(["git", "-C", root, *args], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"git {args}: {r.stderr}")
    return r.stdout


def newrepo(name):
    root = f"{FXROOT}/{name}"
    shutil.rmtree(root, ignore_errors=True)
    os.makedirs(root)
    git(root, "init", "-q")
    git(root, "config", "user.email", "fixture@tabi.local")
    git(root, "config", "user.name", "tabi-fixture")
    return root


def put(root, rel, text):
    abs_p = os.path.join(root, rel)
    os.makedirs(os.path.dirname(abs_p), exist_ok=True)
    with open(abs_p, "wb") as fh:
        fh.write(text.encode() if isinstance(text, str) else text)


def commit(root, msg="fixture"):
    git(root, "add", "-A")
    git(root, "commit", "--allow-empty", "-q", "-m", msg)
    return git(root, "rev-parse", "HEAD").strip()


# ---------------- s106 fixtures ----------------

S106_RECEIPT = "corpus/evidence/round-26/sources/s106.json"
S106_BYTES = "corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc"
S106_LINE = "BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);"
S106_COMMENT = "// Enable using the BackForwardCache."


def s106_bytes(tail="// tail", dup=False):
    lines = ["// content_features.cc fixture"]
    lines += [f"// filler {i + 2}" for i in range(184)]
    lines += [S106_COMMENT, S106_LINE]
    if dup:
        lines.append(S106_LINE)  # duplicate anchor text at line 188 -> occurrences 2
    lines += [tail, ""]
    return "\n".join(lines)


def s106_receipt(measured_rev, decoded_sha, decoded_bytes):
    return {
        "schema": "tabi-s106-evidence-v1",
        "row": "S106",
        "url": "https://example.invalid/fixture?format=TEXT",
        "fetched_at": "2026-10-25",
        "transfer": "base64 (?format=TEXT)",
        "bytes_path": S106_BYTES,
        "decoded_bytes": decoded_bytes,
        "decoded_sha256": decoded_sha,
        "measured_rev": measured_rev,
        "anchor": {
            "line": 187, "text": S106_LINE, "comment_line": 186,
            "comment": S106_COMMENT, "occurrences_in_file": 1,
        },
    }


def fx_s106(name, head_text, receipt_over, base=None, decoded_extra=0):
    """Commit the measured bytes first, then HEAD bytes + receipt."""
    root = newrepo(name)
    base = base if base is not None else s106_bytes()
    put(root, S106_BYTES, base)
    measured = commit(root, "measured")
    rec = s106_receipt(measured, sha(base), len(base.encode()) + decoded_extra)
    rec.update(receipt_over)
    put(root, S106_BYTES, head_text)
    put(root, S106_RECEIPT, json.dumps(rec, indent=2) + "\n")
    commit(root, "head")
    return root, "HEAD", None


def build_s106_sha_drop():
    # same byte length, different content: sha_match false, byte_count_match true
    return fx_s106("s106-sha-drop", s106_bytes(tail="// taiL"), {})


def build_s106_anchor_unique(name, decoded_extra=0):
    dup = s106_bytes(dup=True)
    return fx_s106(name, dup, {}, base=dup, decoded_extra=decoded_extra)


def build_s106_anchor_unique_drop():
    return build_s106_anchor_unique("s106-anchor-unique-drop")


def build_s106_anchor_unique_true():
    return build_s106_anchor_unique("s106-anchor-unique-true")


def build_s106_byte_count(name):
    base = s106_bytes()
    return fx_s106(name, base, {}, base=base, decoded_extra=1)


def build_s106_byte_count_drop():
    return build_s106_byte_count("s106-byte-count-drop")


def build_s106_byte_count_true():
    return build_s106_byte_count("s106-byte-count-true")


# ---------------- release-pins fixtures ----------------

def registry(lines):
    head = ["# SOURCES", "", "## Registry", "",
            "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |",
            "|---|---|---|---|---|---|---|---|---|---|---|"]
    return "\n".join(head + lines + [""]) + "\n"


def reg_line(rid, tag=OLD, path=P, anchor=None, teaches="teaches", recheck="on-release", indent=""):
    a = anchor if anchor is not None else f"tag {tag}; feature.cc:3-4; sha256 {abbr(OLD_TEXT)}"
    return (f"{indent}| {rid} | Fixture \u2014 https://chromium.googlesource.com/chromium/src/+/refs/tags/"
            f"{tag}/{path}?format=TEXT | code | A | scope | {a} | {teaches} | mined | 2026-10-20 | {recheck} | \u2014 |")


def raw_line(rid, source, anchor, teaches, recheck="90d"):
    return f"| {rid} | {source} | code | A | scope | {anchor} | {teaches} | mined | 2026-10-20 | {recheck} | \u2014 |"


BYTES_ROOT = "corpus/evidence/round-29/release-pins/bytes"
REFETCH_ROOT = "corpus/evidence/round-29/release-pins/refetch"
RECEIPT = "corpus/evidence/round-29/release-pins/receipt.json"


def pins_fixture(name, rows, entries, write_old=True, write_new=True,
                 refetch_override=None):
    root = newrepo(name)
    put(root, "corpus/SOURCES.md", registry(rows))
    receipt = {"schema": "tabi-release-pins-v1", "stable": NEW, "rows": []}
    for e in entries:
        eid = e["id"]
        files = []
        for f in e["files"]:
            f = dict(f)
            old_body = f.pop("_old", OLD_TEXT)
            new_body = f.pop("_new", NEW_SAME)
            if write_old:
                put(root, f"{BYTES_ROOT}/{f['old_tag']}/{f['path']}", old_body)
            if write_new:
                put(root, f"{BYTES_ROOT}/{NEW}/{f['path']}", new_body)
            files.append(f)
        entry = {"id": eid, "fetched_by": "W1-fixture", "files": files}
        if "superseded_by" in e:
            entry["superseded_by"] = e["superseded_by"]
        receipt["rows"].append(entry)
        rf = refetch_override or {
            "seat": "W2-fixture",
            "files": [{"path": f["path"], "tag": NEW, "status": f["new_status"], "sha256": f["new_sha256"]}
                      for f in files],
        }
        put(root, f"{REFETCH_ROOT}/{eid}.json",
            json.dumps({"id": eid, "fetched_at": "2026-10-26T00:00:00Z", **rf}, indent=2) + "\n")
    put(root, RECEIPT, json.dumps(receipt, indent=2) + "\n")
    commit(root)
    return root, "HEAD", NEW


def fentry(path=P, ranges=((3, 4),), old_text=OLD_TEXT, new_text=NEW_SAME,
           old_status=200, new_status=200, old_tag=OLD):
    return {
        "path": path, "old_tag": old_tag, "old_status": old_status, "new_status": new_status,
        "old_bytes": f"{BYTES_ROOT}/{old_tag}/{path}", "new_bytes": f"{BYTES_ROOT}/{NEW}/{path}",
        "old_sha256": sha(old_text), "new_sha256": sha(new_text),
        "ranges": [list(r) for r in ranges],
        "_old": old_text,
        "_new": new_text,
    }


def build_f1():
    rows = [reg_line("S001", tag="150.0.0.1")]
    return pins_fixture("pins-f1-old-tag", rows,
                        [{"id": "S001", "files": [fentry(old_tag=OLD)]}])


def build_f2_traversal():
    p2 = "content/feature..cc"
    rows = [reg_line("S001", path=p2)]
    return pins_fixture("pins-f2-path-traversal", rows,
                        [{"id": "S001", "files": [fentry(path=p2)]}])


def build_f3_absent():
    rows = [reg_line("S001")]
    return pins_fixture("pins-f3-bytes-absent", rows,
                        [{"id": "S001", "files": [fentry()]}], write_old=False)


def build_f4_bounds():
    anchor = f"tag {OLD}; feature.cc:0-1; sha256 {abbr(OLD_TEXT)}"
    rows = [reg_line("S001", anchor=anchor)]
    return pins_fixture("pins-f4-range-bounds", rows,
                        [{"id": "S001", "files": [fentry(ranges=((0, 1),))]}])


def build_f4_anchor_token():
    anchor = f"tag {OLD}; feature.cc; sha256 {abbr(OLD_TEXT)}"
    rows = [reg_line("S001", anchor=anchor)]
    return pins_fixture("pins-f4-anchor-token", rows,
                        [{"id": "S001", "files": [fentry(ranges=((3, 4),))]}])


def build_s1_prefix():
    rows = [reg_line("S001"),
            reg_line("S002", tag=NEW, teaches="replaces S001 \u2014 kThing disabled at the new tag")]
    return pins_fixture("pins-s1-supersession-prefix", rows,
                        [{"id": "S001", "superseded_by": "S002",
                          "files": [fentry(new_text=NEW_DRIFT)]}])


def build_s1_tag():
    rows = [reg_line("S001"),
            raw_line("S002", "Fixture without a tag cell",
                     f"feature.cc; sha256 {abbr(OLD_TEXT)}",
                     "supersedes S001 \u2014 kThing disabled at the new tag")]
    return pins_fixture("pins-s1-supersession-tag", rows,
                        [{"id": "S001", "superseded_by": "S002",
                          "files": [fentry(new_text=NEW_DRIFT)]}])


def build_notfound_status():
    anchor = f"HTTP 404; body sha256 {sha(NF)}"
    rows = [reg_line("S001", anchor=anchor)]
    return pins_fixture("pins-notfound-status", rows,
                        [{"id": "S001", "files": [fentry(old_text=NF, new_text="int now_exists;\n// NOT_FOUND marker\n",
                                                         ranges=(), old_status=404, new_status=200)]}])


def build_notfound_body():
    anchor = f"HTTP 404; body sha256 {sha(NF)}"
    rows = [reg_line("S001", anchor=anchor)]
    return pins_fixture("pins-notfound-body", rows,
                        [{"id": "S001", "files": [fentry(old_text=NF, new_text="gone\n",
                                                         ranges=(), old_status=404, new_status=404)]}])


BUILDERS = {
    "s106-sha-drop": build_s106_sha_drop,
    "s106-anchor-unique-drop": build_s106_anchor_unique_drop,
    "s106-anchor-unique-true": build_s106_anchor_unique_true,
    "s106-byte-count-drop": build_s106_byte_count_drop,
    "s106-byte-count-true": build_s106_byte_count_true,
    "pins-f1-old-tag": build_f1,
    "pins-f2-path-traversal": build_f2_traversal,
    "pins-f3-bytes-absent": build_f3_absent,
    "pins-f4-range-bounds": build_f4_bounds,
    "pins-f4-anchor-token": build_f4_anchor_token,
    "pins-s1-supersession-prefix": build_s1_prefix,
    "pins-s1-supersession-tag": build_s1_tag,
    "pins-notfound-status": build_notfound_status,
    "pins-notfound-body": build_notfound_body,
}


def gate_for(script):
    return PRISTINE_S106 if script.endswith("check-s106-evidence.mjs") else PRISTINE_PINS


def run(gate, root, rev, stable):
    cmd = ["node", gate, "--repo", root, "--rev", rev, "--json"]
    if stable:
        cmd += ["--stable", stable]
    r = subprocess.run(cmd, capture_output=True, text=True, env={**os.environ, "TMPDIR": f"{S}/tmp"})
    out = None
    try:
        out = json.loads(r.stdout)
    except Exception:
        out = None
    return {"exit": r.returncode, "json": out,
            "stdout_tail": r.stdout[-300:] if out is None else None,
            "stderr_tail": r.stderr[-400:]}


def main():
    cat = json.load(open(CATALOGUE))
    mutants = {m["id"]: m for m in cat["mutants"]}
    os.makedirs(GATEROOT, exist_ok=True)
    os.makedirs(FXROOT, exist_ok=True)
    results = {}
    for mid, build in BUILDERS.items():
        m = mutants[mid]
        src_path = gate_for(m["script"])
        text = open(src_path, encoding="utf-8").read()
        find, repl = m["find"], m["replace"]
        n = text.count(find)
        assert n == 1, f"{mid}: find count {n}"
        mut_path = f"{GATEROOT}/{mid}.mjs"
        open(mut_path, "w", encoding="utf-8").write(text.replace(find, repl, 1))
        root, rev, stable = build()
        pristine = run(src_path, root, rev, stable)
        mutant = run(mut_path, root, rev, stable)
        keys = ["valid", "sha_match", "anchor_located", "anchor_unique",
                "byte_count_match", "revision_match", "unresolved", "population",
                "resolved", "clean"]
        pj, mj = pristine["json"] or {}, mutant["json"] or {}
        fielddiff = {k: [pj.get(k), mj.get(k)] for k in keys if pj.get(k) != mj.get(k)}
        distinguishable = pristine["exit"] != mutant["exit"] or bool(fielddiff) or (pj == {} and mj == {})
        results[mid] = {
            "script": m["script"], "kind": m["kind"],
            "fixture": root,
            "pristine": pristine, "mutant": mutant,
            "field_diff": fielddiff,
            "exit_diff": [pristine["exit"], mutant["exit"]],
            "distinguishable": distinguishable,
        }
        print(f"{mid}: pristine_exit={pristine['exit']} mutant_exit={mutant['exit']} "
              f"diff={fielddiff} distinguishable={distinguishable}")
        sys.stdout.flush()
    json.dump(results, open(f"{S}/results.json", "w"), indent=2)
    print("\nALL:", all(v["distinguishable"] for v in results.values()))


main()
