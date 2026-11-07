#!/usr/bin/env python3
"""R73Scribe — independent re-derivation of the r73 knowledge note's numbers.

Reads only committed receipts and committed source bytes. Writes rederive.json
next to itself. No network, no git mutation.

usage: python3 rederive.py [--json PATH]
"""
import json, math, statistics, sys

LANE = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
CTRL = f"{LANE}/.ufo/waves/round-73/controls/c1"
A = f"{LANE}/corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json"
SRC = f"{LANE}/.ufo/waves/round-73/sources"
FACTOR = {'in': 2.0, 'out': 0.5, 'clamp': 0.5, 'default': 1.5}   # the CDP command's scaleFactor
LEGS = ['in', 'out', 'clamp', 'default']

RUNS = [(f"smoke{i}", f"{CTRL}/smoke{i}.receipt.json") for i in range(1, 10)] + [("A", A)]


def wheels(receipt, leg):
    return [e for e in receipt['events'] if e['type'] == 'wheel' and e['leg'] == leg]


rows = []
for tag, path in RUNS:
    r = json.load(open(path))
    legs = {l['name']: l for l in r['legs']}
    plan = {p['name']: p for p in r['plan']}
    for L in LEGS:
        ev = wheels(r, L)
        s0 = legs[L]['scaleBefore']['page']
        s1 = legs[L]['scaleAfter']['page']
        target = -100.0 * math.log(FACTOR[L])
        w = sum(e['deltaY'] * e['scale'] for e in ev)
        prev = [s0] + [e['scale'] for e in ev[:-1]]
        rows.append({
            "run": tag, "leg": L,
            "n": len(ev),
            "raw": sum(e['deltaY'] for e in ev),
            "weighted": w,
            "target_commanded": target,
            "dev": w - target,
            "rel_dev": (w - target) / target,
            "div_prev_event": sum(e['deltaY'] * p for e, p in zip(ev, prev)),
            "div_leg_end": sum(e['deltaY'] * s1 for e in ev),
            "scale_before": s0, "scale_after": s1,
            "observable_target": (-100.0 * math.log(s1 / s0)) if s0 else None,
            "first_scale": ev[0]['scale'] if ev else None,
            "first_clientX": ev[0]['clientX'] if ev else None,
            "plan_scaleFactor": plan[L]['params']['scaleFactor'],
        })

smokes = [r for r in rows if r['run'] != 'A']
out = {
    "schema": "tabi-r73-scribe-rederive-v1",
    "receipts": [p for _, p in RUNS],
    "rows": rows,
    "summary": {
        "leg_sums_9_smokes": len(smokes),
        "leg_sums_all": len(rows),
        "max_abs_dev_9_smokes": max(abs(r['dev']) for r in smokes),
        "argmax_9_smokes": [max(smokes, key=lambda r: abs(r['dev']))['run'],
                            max(smokes, key=lambda r: abs(r['dev']))['leg']],
        "max_abs_dev_all": max(abs(r['dev']) for r in rows),
        "argmax_all": [max(rows, key=lambda r: abs(r['dev']))['run'],
                       max(rows, key=lambda r: abs(r['dev']))['leg']],
        "per_leg": {
            L: {
                "n_min": min(r['n'] for r in rows if r['leg'] == L),
                "n_max": max(r['n'] for r in rows if r['leg'] == L),
                "weighted_min": min(r['weighted'] for r in rows if r['leg'] == L),
                "weighted_max": max(r['weighted'] for r in rows if r['leg'] == L),
                "raw_min": min(r['raw'] for r in rows if r['leg'] == L),
                "raw_max": max(r['raw'] for r in rows if r['leg'] == L),
                "rel_dev_mean": statistics.mean([r['rel_dev'] for r in rows if r['leg'] == L]),
                "rel_dev_sd": statistics.pstdev([r['rel_dev'] for r in rows if r['leg'] == L]),
                "rel_dev_sterr": statistics.pstdev([r['rel_dev'] for r in rows if r['leg'] == L]) / math.sqrt(len([r for r in rows if r['leg'] == L])),
                "signs_differ": len({r['rel_dev'] > 0 for r in rows if r['leg'] == L}) == 2,
                "div_prev_event_mean": statistics.mean([r['div_prev_event'] for r in rows if r['leg'] == L]),
                "div_leg_end_mean": statistics.mean([r['div_leg_end'] for r in rows if r['leg'] == L]),
            } for L in LEGS
        },
        "first_wheel_clientX": {
            leg: sorted(
                [(tag, [r for r in rows if r['run'] == tag and r['leg'] == leg][0]['first_clientX']) for tag, _ in RUNS]
            ) for leg in ('in', 'default')
        },
        "first_wheel_clientX_counts_9_smokes": {
            leg: {str(x): sum(1 for r in rows if r['run'] != 'A' and r['leg'] == leg and r['first_clientX'] == x)
                  for x in sorted({r['first_clientX'] for r in smokes if r['leg'] == leg})}
            for leg in ('in', 'default')
        },
        "all_wheel_clientX_counts_9_smokes": {
            leg: {} for leg in ('in', 'default')
        },
    },
}

# all-wheel clientX distributions over the nine smokes
for leg in ('in', 'default'):
    counts = {}
    for i in range(1, 10):
        r = json.load(open(f"{CTRL}/smoke{i}.receipt.json"))
        for e in wheels(r, leg):
            counts[str(e['clientX'])] = counts.get(str(e['clientX']), 0) + 1
    out['summary']['all_wheel_clientX_counts_9_smokes'][leg] = dict(sorted(counts.items()))

# source citation check: sha256 + exact line text for every quoted span
import hashlib
CITES = {
    "S180": ("web_mouse_wheel_event.cc", 104, "return delta_y / frame_scale_;"),
    "S180_span": ("web_mouse_wheel_event.cc", 103, "float WebMouseWheelEvent::DeltaYInRootFrame() const {"),
    "S181": ("wheel_event.cc", 111, "delta_y_(-event.DeltaYInRootFrame() / window.devicePixelRatio()),"),
    "S182_quote": ("web_input_event_conversion.cc", 62, "scale = root_view->InputEventsScaleFactor();"),
    "S182_stamp": ("web_input_event_conversion.cc", 132, "result.SetFrameScale(FrameScale(frame_view));"),
    "S183_page_scale": ("local_frame_view.cc", 1995, "float page_scale = frame_->GetPage()->GetVisualViewport().Scale();"),
    "S183_sig": ("local_frame_view.cc", 1994, "float LocalFrameView::InputEventsScaleFactor() const {"),
    "S182_framesig": ("web_input_event_conversion.cc", 57, "float FrameScale(const LocalFrameView* frame_view) {"),
    "S182_line56": ("web_input_event_conversion.cc", 56, "namespace {"),
    "S182_line127": ("web_input_event_conversion.cc", 127, ""),
    "S182_line135": ("web_input_event_conversion.cc", 135, "}"),
}
src = {}
for f in ("web_mouse_wheel_event.cc", "wheel_event.cc", "web_input_event_conversion.cc", "local_frame_view.cc"):
    b = open(f"{SRC}/{f}", "rb").read()
    src[f] = {"sha256": hashlib.sha256(b).hexdigest(), "lines": b.count(b"\n")}
cites = {}
for k, (f, ln, want) in CITES.items():
    lines = open(f"{SRC}/{f}", encoding="utf-8", errors="replace").read().split("\n")
    got = lines[ln - 1] if ln - 1 < len(lines) else None
    cites[k] = {"file": f, "line": ln, "expected": want, "actual": got,
                "stripped_equal": (got or "").strip() == want.strip(),
                "words_in_fragment": len(want.split())}
out["sources"] = src
out["citations"] = cites

path = sys.argv[sys.argv.index("--json") + 1] if "--json" in sys.argv else "rederive.json"
json.dump(out, open(path, "w"), indent=1)

s = out['summary']
print("leg sums: %d smokes, %d with A" % (s['leg_sums_9_smokes'], s['leg_sums_all']))
print("max|dev| 9 smokes %.6e at %s" % (s['max_abs_dev_9_smokes'], "/".join(s['argmax_9_smokes'])))
print("max|dev| incl A  %.6e at %s" % (s['max_abs_dev_all'], "/".join(s['argmax_all'])))
for L in LEGS:
    p = s['per_leg'][L]
    print("%-8s n=%d..%d wtd[%.10f,%.10f] raw[%.6f,%.6f] relmean=%+.2e sterr=%.1e signsplit=%s"
          % (L, p['n_min'], p['n_max'], p['weighted_min'], p['weighted_max'], p['raw_min'], p['raw_max'],
             p['rel_dev_mean'], p['rel_dev_sterr'], p['signs_differ']))
print("first in clientX counts:", s['first_wheel_clientX_counts_9_smokes']['in'])
print("first default clientX counts:", s['first_wheel_clientX_counts_9_smokes']['default'])
print("all in clientX:", s['all_wheel_clientX_counts_9_smokes']['in'])
print("all default clientX:", s['all_wheel_clientX_counts_9_smokes']['default'])
print("citations ok:", all(v['stripped_equal'] for k, v in cites.items() if k != 'S182_line127'), "| line127 blank:", cites['S182_line127']['actual'] == '')
print("source sha256:", {k: v['sha256'][:12] for k, v in src.items()})
