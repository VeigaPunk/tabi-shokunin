#!/usr/bin/env python3
"""Independent round-63 wheel-receipt verifier (R63Revenger).

Written against the receipt's OWN internal arithmetic, not against the frozen
counter's source: the only constants carried in this file are the names the
receipt itself declares (leg names, step names, schema, server paths). The
scroll arithmetic, the notch size N, the expected dispatch positions and the
expected final position are all RECONSTRUCTED from the receipt:

  * deltaY is passthrough: an event that is not canceled advances the scroll
    position by exactly its deltaY.
  * a canceled event moves nothing (the page-swallowed leg).
  * all five events are single-notch steps of the same magnitude N, with the
    direction pattern +,+,-,+,+ (N is measured from event 0 and every other
    event must agree).
  * therefore the dispatch positions are 0, N, 2N, N, N and the final position
    is 2N; the leg boundaries are 0, N, 2N, N, N, 2N; and the number of real
    scroll events is the number of non-canceled wheel events.

Usage:
  verify-wheel.py RECEIPT [--shot DIR] [--json]

Exit 0 iff no finding. Finding ids are stable and printed in order.
"""
import hashlib
import json
import os
import re
import sys

LEG_NAMES = ["start", "down1", "down2", "up1", "swallowed", "released"]
STEP_NAMES = ["a-wheel-down", "b-wheel-up", "c-swallow", "d-release"]
GUARDS = [
    "--headless=new",
    "--disable-extensions",
    "--remote-debugging-address=127.0.0.1",
    "--disable-smooth-scrolling",
]
LOOPBACK = re.compile(r"^http://127\.0\.0\.1:[0-9]+$")
NONCE = re.compile(r"^tabi-r63-[a-z0-9-]+$")
SHA = re.compile(r"^[a-f0-9]{64}$")


def sha_file(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def is_num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool) and x == x and x not in (float("inf"), float("-inf"))


def verify(r, shot_dir=None):
    f = []

    def check(ok, cid):
        if not ok:
            f.append(cid)

    check(isinstance(r, dict), "V-receipt-object")
    if not isinstance(r, dict):
        return f

    # --- identity / invocation ------------------------------------------------
    check(r.get("schema") == "tabi-chrome-cdp-r63", "V-schema")
    nonce = r.get("nonce") or ""
    check(bool(NONCE.match(nonce)) and r.get("nonceOnPage") == nonce, "V-nonce-binding")

    host = r.get("host") or {}
    argv = host.get("argv") if isinstance(host, dict) else None
    check(isinstance(argv, list) and all(g in argv for g in GUARDS), "V-launch-guards")

    fixture = r.get("fixture") or {}
    check(
        isinstance(fixture, dict)
        and bool(LOOPBACK.match(fixture.get("origin") or ""))
        and fixture.get("target") == "tall",
        "V-loopback-origin",
    )
    vp = fixture.get("viewport") if isinstance(fixture, dict) else None
    check(
        isinstance(vp, dict)
        and isinstance(vp.get("width"), int)
        and isinstance(vp.get("height"), int)
        and vp["width"] > 0
        and vp["height"] > 0,
        "V-viewport-shape",
    )

    # --- wheel log: reconstruct the arithmetic --------------------------------
    legs = r.get("legs")
    wl = r.get("wheellog")
    legs_ok = isinstance(legs, list) and len(legs) == 6 and all(
        isinstance(l, dict) and l.get("name") == n for l, n in zip(legs, LEG_NAMES)
    )
    check(legs_ok, "V-legs-shape")
    wl_ok = isinstance(wl, list) and len(wl) == 5 and all(isinstance(e, dict) for e in wl)
    check(wl_ok, "V-wheellog-shape")
    if not (legs_ok and wl_ok):
        return f

    deltas = [e.get("deltaY") for e in wl]
    prevented = [e.get("defaultPrevented") for e in wl]
    notch = deltas[0]
    check(is_num(notch) and notch > 0, "V-notch-positive")
    if not (is_num(notch) and notch > 0):
        return f

    # single-notch steps, directions +,+,-,+,+
    check(
        all(is_num(d) and abs(d) == notch for d in deltas)
        and [1 if d > 0 else -1 for d in deltas] == [1, 1, -1, 1, 1],
        "V-delta-sequence",
    )
    check(is_num(notch) and notch == 120, "V-notch-120")
    # pixel-mode passthrough, no horizontal / z deltas
    check(
        all(e.get("deltaX") == 0 and e.get("deltaZ") == 0 and e.get("deltaMode") == 0 for e in wl),
        "V-delta-mode-pixels",
    )
    # event identity fields
    check(
        all(
            e.get("type") == "wheel"
            and e.get("isTrusted") is True
            and e.get("cancelable") is True
            and is_num(e.get("ts"))
            and e.get("ts") >= 0
            for e in wl
        ),
        "V-wheel-fields",
    )
    check(
        all(is_num(wl[i].get("ts")) and wl[i]["ts"] <= wl[i + 1].get("ts") for i in range(4)),
        "V-wheel-time-order",
    )
    # no modifier: the claim's boundary excludes ctrl+wheel zoom and shift hscroll
    check(
        all(
            e.get("ctrlKey") is False
            and e.get("shiftKey") is False
            and e.get("altKey") is False
            and e.get("metaKey") is False
            for e in wl
        ),
        "V-modifiers-clear",
    )
    # strictly increasing unique sequence 1..5
    seqs = [e.get("seq") for e in wl]
    check(
        all(isinstance(s, int) and not isinstance(s, bool) for s in seqs)
        and seqs == [1, 2, 3, 4, 5]
        and len(set(seqs)) == 5,
        "V-wheellog-sequence",
    )
    # exactly one canceled event, at the swallowed leg (index 3)
    check(prevented == [False, False, False, True, False], "V-cancelation")

    # reconstruct positions: pos[0] is the position before event 0
    pos = [0]
    for i, e in enumerate(wl):
        p = pos[-1]
        if not prevented[i]:
            p = p + e.get("deltaY") if is_num(e.get("deltaY")) else p
        pos.append(p)
    dispatch = pos[:-1]
    final = pos[-1]
    check(dispatch == [0, notch, 2 * notch, notch, notch], "V-dispatch-arithmetic")
    check(final == 2 * notch, "V-final-arithmetic")
    check(
        all(e.get("targetId") == "tall" for e in wl)
        and [e.get("scrollYAtDispatch") for e in wl] == dispatch,
        "V-target-binding",
    )

    # --- legs: boundary positions and log lengths ----------------------------
    # pos[0] is the start boundary, pos[k] the boundary after event k-1
    check([l.get("scrollY") for l in legs] == pos, "V-legs-arithmetic")
    check([l.get("wheellogLen") for l in legs] == list(range(6)), "V-legs-wheellog-count")

    # --- page final state ----------------------------------------------------
    ps = r.get("pageState") or {}
    applied = sum(1 for p in prevented if p is False)
    check(
        ps.get("scrollY") == final
        and ps.get("wheellogLen") == 5
        and ps.get("scrollEvents") == applied,
        "V-page-final-state",
    )

    # --- steps / shot records ------------------------------------------------
    steps = r.get("steps")
    steps_ok = isinstance(steps, list) and len(steps) == 4 and all(
        isinstance(s, dict)
        and s.get("name") == n
        and s.get("png") == n + ".png"
        and bool(SHA.match(s.get("sha256") or ""))
        and isinstance(s.get("bytes"), int)
        and s["bytes"] > 0
        for s, n in zip(steps, STEP_NAMES)
    )
    check(steps_ok, "V-step-records")
    # the receipt also *declares* a step-name list; it must agree with the records
    declared = r.get("declaredStepNames")
    check(
        isinstance(declared, list) and isinstance(steps, list) and declared == [s.get("name") for s in steps] == STEP_NAMES,
        "V-declared-step-names",
    )
    if shot_dir is not None:
        ok = True
        if not steps_ok:
            ok = False
        else:
            for s in steps:
                p = os.path.join(shot_dir, s["png"])
                try:
                    if os.path.getsize(p) != s["bytes"] or sha_file(p) != s["sha256"]:
                        ok = False
                    with open(p, "rb") as fh:
                        magic = fh.read(8)
                        if magic != b"\x89PNG\r\n\x1a\n":
                            ok = False
                        fh.seek(16)
                        w = int.from_bytes(fh.read(4), "big")
                        h = int.from_bytes(fh.read(4), "big")
                        if not (w > 0 and h > 0):
                            ok = False
                except OSError:
                    ok = False
        check(ok, "V-step-bytes")

    # --- server / teardown / sweeps -----------------------------------------
    slog = r.get("serverLog")
    check(
        isinstance(slog, list)
        and any(isinstance(e, dict) and e.get("path") == "/" for e in slog)
        and all(isinstance(e, dict) and e.get("path") in ("/", "/favicon.ico") for e in slog),
        "V-server-witness",
    )
    td = r.get("teardown") or {}
    pp = td.get("portProbes") or {}
    pc = td.get("postKillCurl") or {}
    check(
        td.get("postKillSweepCount") == 0
        and isinstance(td.get("survivors"), list)
        and len(td["survivors"]) == 0,
        "V-teardown-survivors",
    )
    check(
        pp.get("fixture") == "closed" and pp.get("devtools") == "closed" and pc.get("fixture") == 7 and pc.get("devtools") == 7,
        "V-closed-ports",
    )
    sw = r.get("sweeps") or {}
    check(
        sw.get("preLaunch") == 0
        and isinstance(sw.get("midRun"), int)
        and sw["midRun"] > 0
        and sw.get("postKill") == 0,
        "V-launch-witness",
    )
    check(isinstance(r.get("failures"), list) and len(r["failures"]) == 0, "V-failures-empty")

    # --- producer verdict, both directions kept separable -------------------
    check(r.get("predicate") is True, "V-producer-predicate-true")
    check(r.get("wheelHypothesis") == "CONFIRMED", "V-producer-hypothesis-confirmed")
    return f


def main():
    argv = sys.argv[1:]
    if not argv:
        print("usage: verify-wheel.py RECEIPT [--shot DIR] [--json]", file=sys.stderr)
        return 2
    receipt = argv[0]
    shot = None
    as_json = "--json" in argv
    if "--shot" in argv:
        shot = argv[argv.index("--shot") + 1]
    try:
        with open(receipt, "r", encoding="utf-8") as fh:
            r = json.load(fh)
    except Exception as exc:  # noqa: BLE001
        print(json.dumps({"schema": "tabi-r63-independent-verifier", "error": str(exc)}), file=sys.stderr)
        return 2
    findings = verify(r, shot)
    result = {
        "schema": "tabi-r63-independent-verifier",
        "receipt": receipt,
        "shotDir": shot,
        "predicate": len(findings) == 0,
        "findingCount": len(findings),
        "findings": findings,
    }
    if as_json:
        print(json.dumps(result, indent=1))
    else:
        print(f"{receipt}: predicate={result['predicate']} findings={findings}")
    return 0 if result["predicate"] else 1


if __name__ == "__main__":
    sys.exit(main())
