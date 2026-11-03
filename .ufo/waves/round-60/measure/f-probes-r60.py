#!/usr/bin/env python3
# f-probes-r60.py -- tabi round 60, claim C2: the forged probe set F = {A, B, D, E}
# and its byte provenance manifest.
#
# Authority: .ufo/waves/round-60/claims.json C2 (frozen before any seat ran).
# This generator never edits the frozen claims and never touches the live
# receipt: corpus/evidence/round59/chromium-capslock-boundary/receipt.json is
# opened read-only.
#
# Probe provenance (claims.json C2 statement, "before" block and the C2
# do-nothing control):
#   A  byte copy of the round-59 probe
#      .ufo/waves/round-59/measure/f6-probe/A-cancelable-false.receipt.json
#      (first CapsLock keydownEntry cancelable:false; r59 counter: exit 0).
#   B  byte copy of the round-59 probe
#      .ufo/waves/round-59/measure/f6-probe/B-cancelable-missing.receipt.json
#      (that key deleted; r59 counter: exit 0).
#   D  the live receipt with the first entry of the CapsLock trace
#      (journey.form.capsLockLeg.trace[0], phase press1, type keyDown,
#      key CapsLock) carrying cancelable set to the OPPOSITE of the page
#      keylog entry it cites (the entry at cap.keylogWindow.start; the trace's
#      keyDown entries map positionally onto that keylog window, the r59 D1
#      positional rule). The trace entry does not carry cancelable in the live
#      receipt, so the field is added with the disagreed value.
#   E  the live receipt with the type key deleted from that same first
#      CapsLock trace entry.
#
# Serialization: the live receipt round-trips byte-identically under
# json.dumps(indent=1, ensure_ascii=False) (asserted below before any probe is
# written), so D and E keep the live file's indent and key order and differ
# from it only at the one named path.
#
# Determinism: unless --emit-only is given, the generator re-invokes itself
# twice into two temp dirs under TMPDIR (--emit-only writes probes and no
# manifest) and requires the four probe files to be byte-identical to each
# other and to the files written into the final out dir. The result is
# recorded in manifest.json.
#
# Usage:
#   python3 f-probes-r60.py [--out-dir DIR] [--lane-root DIR] [--emit-only]

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile

SCHEMA = "tabi-r60-c2-f-probes"
PROBE_NAMES = ["probe-A.receipt.json", "probe-B.receipt.json",
               "probe-D.receipt.json", "probe-E.receipt.json"]

R59_A = ".ufo/waves/round-59/measure/f6-probe/A-cancelable-false.receipt.json"
R59_B = ".ufo/waves/round-59/measure/f6-probe/B-cancelable-missing.receipt.json"
LIVE = "corpus/evidence/round59/chromium-capslock-boundary/receipt.json"
GEN_REL = ".ufo/waves/round-60/measure/f-probes-r60.py"

# The live receipt's own sha256, pinned here so a foreign receipt cannot be
# silently substituted. A moved head with different bytes must fail loudly
# rather than mint probes over unknown input.
LIVE_SHA256 = "72514ff700cab2211b6507f8e423716ffe60e02affd5161f7d704486b483a083"


def fail(msg):
    sys.stderr.write("f-probes-r60: FAIL: " + msg + "\n")
    raise SystemExit(1)


def sha256_bytes(b):
    return hashlib.sha256(b).hexdigest()


def read_bytes(path):
    with open(path, "rb") as fh:
        return fh.read()


def lane_root_from_script():
    here = os.path.dirname(os.path.abspath(__file__))
    root = here
    for _ in range(8):
        if os.path.isdir(os.path.join(root, ".ufo")) and os.path.isdir(os.path.join(root, "corpus")):
            return root
        root = os.path.dirname(root)
    fail("cannot locate the lane root above " + here)


def get_path(obj, parts):
    cur = obj
    for p in parts:
        if isinstance(cur, dict):
            if p not in cur:
                return False, None
            cur = cur[p]
        elif isinstance(cur, list):
            if not isinstance(p, int) or p < 0 or p >= len(cur):
                return False, None
            cur = cur[p]
        else:
            return False, None
    return True, cur


def set_path(obj, parts, value):
    cur = obj
    for p in parts[:-1]:
        cur = cur[p]
    cur[parts[-1]] = value


def del_path(obj, parts):
    cur = obj
    for p in parts[:-1]:
        cur = cur[p]
    del cur[parts[-1]]


def render(obj):
    return json.dumps(obj, indent=1, ensure_ascii=False).encode("utf-8")


def flat(obj, prefix="", out=None):
    """Leaf paths of a JSON document, as r59-style slash paths."""
    if out is None:
        out = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            flat(v, prefix + "/" + k, out)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            flat(v, prefix + "/" + str(i), out)
    else:
        out[prefix] = obj
    return out


def diff_paths(left, right):
    """Every leaf path whose value differs, plus added/removed paths."""
    a = flat(left)
    b = flat(right)
    changed = []
    for k in a:
        if k not in b:
            changed.append({"path": k, "from": a[k], "to": None, "op": "deleted"})
        elif a[k] != b[k]:
            changed.append({"path": k, "from": a[k], "to": b[k], "op": "changed"})
    for k in b:
        if k not in a:
            changed.append({"path": k, "from": None, "to": b[k], "op": "added"})
    return sorted(changed, key=lambda d: d["path"])


def build_probes(lane):
    live_path = os.path.join(lane, LIVE)
    live_bytes = read_bytes(live_path)
    live_sha = sha256_bytes(live_bytes)
    if live_sha != LIVE_SHA256:
        fail("live receipt sha256 " + live_sha + " != the pinned " + LIVE_SHA256
             + " (the live receipt moved; refusing to mint probes over unknown bytes)")

    try:
        live = json.loads(live_bytes.decode("utf-8"))
    except Exception as exc:  # noqa: BLE001 - report the parse failure verbatim
        fail("live receipt does not parse as JSON: " + str(exc))

    # The live file must round-trip byte-identically, or "all other bytes
    # identical" cannot be honoured by a re-serialization.
    if render(live) != live_bytes:
        fail("the live receipt does not round-trip under json.dumps(indent=1, ensure_ascii=False): "
             "re-serialization would change bytes the probes must preserve")

    # -- A and B: byte copies of the frozen round-59 probes -------------------
    probes = {}
    for key, rel in (("A", R59_A), ("B", R59_B)):
        src_path = os.path.join(lane, rel)
        src = read_bytes(src_path)
        src_sha = sha256_bytes(src)
        probes[key] = {
            "bytes": src,
            "source": {"path": rel, "sha256": src_sha},
            "derivation": "byte copy of " + rel,
        }

    # Structural provenance: A must be the live receipt with exactly the first
    # CapsLock keydownEntry cancelable flipped to false; B the same key deleted.
    a_obj = json.loads(probes["A"]["bytes"].decode("utf-8"))
    b_obj = json.loads(probes["B"]["bytes"].decode("utf-8"))
    a_diff = diff_paths(live, a_obj)
    b_diff = diff_paths(live, b_obj)
    want_a = [{"path": "/capslockTrace/press1/keydownEntry/cancelable",
               "from": True, "to": False, "op": "changed"}]
    want_b = [{"path": "/capslockTrace/press1/keydownEntry/cancelable",
               "from": True, "to": None, "op": "deleted"}]
    if a_diff != want_a:
        fail("probe A is not the expected one-path mutation of the live receipt: "
             + json.dumps(a_diff))
    if b_diff != want_b:
        fail("probe B is not the expected one-path mutation of the live receipt: "
             + json.dumps(b_diff))
    probes["A"]["diff"] = a_diff
    probes["B"]["diff"] = b_diff

    cap_parts = ["journey", "form", "capsLockLeg"]
    ok, cap = get_path(live, cap_parts)
    if not ok or not isinstance(cap, dict):
        fail("live receipt carries no journey.form.capsLockLeg object")
    ok, trace = get_path(live, cap_parts + ["trace"])
    if not ok or not isinstance(trace, list) or not trace:
        fail("live receipt carries no non-empty journey.form.capsLockLeg.trace")
    ok, first = get_path(live, cap_parts + ["trace", 0])
    if not ok or not isinstance(first, dict):
        fail("first CapsLock trace entry is not an object")
    if first.get("phase") != "press1" or first.get("type") != "keyDown" or first.get("key") != "CapsLock":
        fail("first CapsLock trace entry is not the press1 keyDown CapsLock event: "
             + json.dumps(first))

    # The keylog entry the first trace entry cites: the page keylog entry at
    # the leg's keylogWindow.start. Assert the positional identity (the r59 D1
    # rule): the trace's keyDown-only sequence maps onto the window's keydowns.
    ok, window = get_path(live, cap_parts + ["keylogWindow"])
    if not ok or not isinstance(window, dict):
        fail("live receipt carries no cap.keylogWindow")
    start = window.get("start")
    end = window.get("end")
    page_entries = None
    ok, page_entries = get_path(live, ["journey", "form", "pageKeylog"])
    if not ok or not isinstance(page_entries, list):
        fail("live receipt carries no journey.form.pageKeylog array")
    if not isinstance(start, int) or not isinstance(end, int) or not (0 <= start < end <= len(page_entries)):
        fail("cap.keylogWindow is not a valid index window into journey.form.pageKeylog: "
             + json.dumps(window))
    cited = page_entries[start]
    if not isinstance(cited, dict):
        fail("the cited keylog entry at index " + str(start) + " is not an object")
    for field in ("type", "key", "code", "keyCode"):
        if cited.get(field) != first.get(field):
            fail("first trace entry " + field + "=" + json.dumps(first.get(field))
                 + " does not match the page keylog entry at keylogWindow.start="
                 + str(start) + " (" + json.dumps(cited.get(field)) + ")")
    if not isinstance(cited.get("cancelable"), bool):
        fail("the cited keylog entry carries no boolean cancelable: " + json.dumps(cited))
    trace_kd = [e for e in trace if isinstance(e, dict) and e.get("type") == "keyDown"]
    page_kd_window = [e for e in page_entries[start:end] if isinstance(e, dict) and e.get("type") == "keyDown"]
    if len(trace_kd) != len(page_kd_window):
        fail("trace keyDown count " + str(len(trace_kd)) + " != keylog window keyDown count "
             + str(len(page_kd_window)) + " (the positional citation does not hold)")
    for i, (t, p) in enumerate(zip(trace_kd, page_kd_window)):
        for field in ("key", "code", "keyCode"):
            if t.get(field) != p.get(field):
                fail("trace keyDown i=" + str(i) + " " + field + "=" + json.dumps(t.get(field))
                     + " != page keylog keyDown i=" + str(i) + " " + json.dumps(p.get(field)))

    # -- D: cancelable disagrees with the cited keylog entry -----------------
    d_obj = json.loads(live_bytes.decode("utf-8"))
    opposite = not cited["cancelable"]
    set_path(d_obj, cap_parts + ["trace", 0, "cancelable"], opposite)
    d_diff = diff_paths(live, d_obj)
    want_d = [{"path": "/journey/form/capsLockLeg/trace/0/cancelable",
               "from": None, "to": opposite, "op": "added"}]
    if d_diff != want_d:
        fail("probe D is not the expected one-path mutation of the live receipt: "
             + json.dumps(d_diff))
    probes["D"] = {
        "bytes": render(d_obj),
        "derivation": ("live receipt with journey.form.capsLockLeg.trace[0].cancelable set to "
                       + json.dumps(opposite) + ", the opposite of the page keylog entry it cites "
                       "(journey.form.pageKeylog[" + str(start) + "].cancelable="
                       + json.dumps(cited["cancelable"]) + "); json.dumps(indent=1, ensure_ascii=False)"),
        "citedKeylogIndex": start,
        "citedKeylogCancelable": cited["cancelable"],
        "diff": d_diff,
    }

    # -- E: the type key deleted from the same first CapsLock trace entry ----
    e_obj = json.loads(live_bytes.decode("utf-8"))
    del_path(e_obj, cap_parts + ["trace", 0, "type"])
    e_diff = diff_paths(live, e_obj)
    want_e = [{"path": "/journey/form/capsLockLeg/trace/0/type",
               "from": "keyDown", "to": None, "op": "deleted"}]
    if e_diff != want_e:
        fail("probe E is not the expected one-path mutation of the live receipt: "
             + json.dumps(e_diff))
    probes["E"] = {
        "bytes": render(e_obj),
        "derivation": ("live receipt with journey.form.capsLockLeg.trace[0].type deleted; "
                       "json.dumps(indent=1, ensure_ascii=False)"),
        "diff": e_diff,
    }

    return live_bytes, live_sha, probes


def emit(out_dir, probes):
    os.makedirs(out_dir, exist_ok=True)
    by_name = {}
    for key, name in zip(["A", "B", "D", "E"], PROBE_NAMES):
        path = os.path.join(out_dir, name)
        with open(path, "wb") as fh:
            fh.write(probes[key]["bytes"])
        got = read_bytes(path)
        if got != probes[key]["bytes"]:
            fail("written probe " + name + " does not read back as its in-memory bytes")
        by_name[key] = {"name": name, "sha256": sha256_bytes(got), "bytes": len(got)}
    return by_name


def run_determinism(lane, out_dir, written):
    tmp_base = os.environ.get("TMPDIR")
    if not tmp_base:
        fail("TMPDIR is not set: the determinism pass must write under the seat scratch root")
    if not os.path.isdir(tmp_base):
        fail("TMPDIR " + tmp_base + " is not a directory")
    dirs = []
    try:
        for _ in range(2):
            dirs.append(tempfile.mkdtemp(prefix="f-probes-det-", dir=tmp_base))
        for d in dirs:
            cmd = [sys.executable, os.path.abspath(__file__),
                   "--lane-root", lane, "--out-dir", d, "--emit-only"]
            env = dict(os.environ)
            env["TMPDIR"] = tmp_base
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
            if res.returncode != 0:
                fail("determinism pass exited " + str(res.returncode) + ": "
                     + res.stderr.decode("utf-8", "replace").strip())
        det = {}
        identical = True
        for key, name in zip(["A", "B", "D", "E"], PROBE_NAMES):
            blobs = [read_bytes(os.path.join(d, name)) for d in dirs]
            shas = [sha256_bytes(b) for b in blobs]
            equal = blobs[0] == blobs[1]
            against_final = sha256_bytes(read_bytes(os.path.join(out_dir, name))) == shas[0]
            det[key] = {"run1Sha256": shas[0], "run2Sha256": shas[1],
                        "byteIdentical": equal, "equalsFinalOutDir": against_final}
            if not equal or not against_final or written[key]["sha256"] != shas[0]:
                identical = False
        return {"runs": 2, "tmpdirBase": tmp_base, "allProbesByteIdentical": identical,
                "perProbe": det}
    finally:
        for d in dirs:
            shutil.rmtree(d, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser(description="tabi r60 C2 forged probes A, B, D, E")
    ap.add_argument("--out-dir", default=None)
    ap.add_argument("--lane-root", default=None)
    ap.add_argument("--emit-only", action="store_true",
                    help="write probes only (no manifest, no determinism pass)")
    args = ap.parse_args()

    lane = os.path.abspath(args.lane_root) if args.lane_root else lane_root_from_script()
    out_dir = os.path.abspath(args.out_dir) if args.out_dir else os.path.join(lane, ".ufo/waves/round-60/measure/f-probes")

    live_bytes, live_sha, probes = build_probes(lane)
    written = emit(out_dir, probes)
    if args.emit_only:
        print(json.dumps({"schema": SCHEMA, "mode": "emit-only", "outDir": out_dir,
                          "probes": {k: v["sha256"] for k, v in written.items()}}, indent=1))
        return 0

    det = run_determinism(lane, out_dir, written)
    gen_path = os.path.abspath(__file__)
    manifest = {
        "schema": SCHEMA,
        "claim": "C2 forged probe set F = {A, B, D, E}; frozen at .ufo/waves/round-60/claims.json",
        "generator": {
            "path": GEN_REL,
            "sha256": sha256_bytes(read_bytes(gen_path)),
            "bytes": os.path.getsize(gen_path),
        },
        "liveReceipt": {"path": LIVE, "sha256": live_sha, "bytes": len(live_bytes),
                        "mutated": False},
        "serialization": {
            "form": "json.dumps(indent=1, ensure_ascii=False)",
            "liveReceiptRoundTripByteIdentical": True,
            "note": "D and E differ from the live receipt only at the single path named in diff",
        },
        "probes": {},
        "determinism": det,
    }
    order = ["A", "B", "D", "E"]
    for key in order:
        p = probes[key]
        manifest["probes"][key] = {
            "path": ".ufo/waves/round-60/measure/f-probes/" + written[key]["name"],
            "sha256": written[key]["sha256"],
            "bytes": written[key]["bytes"],
            "derivation": p["derivation"],
            "diff": p["diff"],
        }
        if "source" in p:
            manifest["probes"][key]["source"] = p["source"]
        if key == "D":
            manifest["probes"][key]["citedKeylogIndex"] = p["citedKeylogIndex"]
            manifest["probes"][key]["citedKeylogCancelable"] = p["citedKeylogCancelable"]
    man_bytes = (json.dumps(manifest, indent=1, ensure_ascii=False) + "\n").encode("utf-8")
    man_path = os.path.join(out_dir, "manifest.json")
    with open(man_path, "wb") as fh:
        fh.write(man_bytes)
    # The live receipt was only ever read; re-assert it is untouched.
    if sha256_bytes(read_bytes(os.path.join(lane, LIVE))) != live_sha:
        fail("the live receipt changed during generation")
    print(json.dumps({
        "schema": SCHEMA,
        "manifest": man_path,
        "manifestSha256": sha256_bytes(man_bytes),
        "generatorSha256": manifest["generator"]["sha256"],
        "liveReceiptSha256": live_sha,
        "probes": {k: manifest["probes"][k]["sha256"] for k in order},
        "determinism": {"allProbesByteIdentical": det["allProbesByteIdentical"], "runs": det["runs"]},
    }, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
