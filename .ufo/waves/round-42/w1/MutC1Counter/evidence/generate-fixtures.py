#!/usr/bin/env python3
"""Rebuild the negative fixtures used by the C1 counter-v4 mutation probe.

Inputs (copied into the scratch dir first, never edited in place):
  receipt.json    corpus/evidence/round42/playwright-egress/receipt.json
  witness.json    corpus/evidence/round42/playwright-egress/receipt.witness.json
Each fixture violates exactly one clause of the frozen predicate sentence.
Run from inside the scratch dir:  python3 generate-fixtures.py
"""
import copy
import json
import shutil

base = json.load(open("receipt.json"))

# f_base: byte-identical control (a positive-path replay of the real receipt).
shutil.copyfile("receipt.json", "f_base.json")


def emit(name, mutate):
    doc = copy.deepcopy(base)
    mutate(doc)
    json.dump(doc, open(name, "w"), separators=(",", ","))
    return name


def f_span(d):  # F-sentence: "first-to-last observed timestamp span is >=1000ms"
    for r in d["runs"]:
        t0 = r["samples"][0]["t"]
        for j, x in enumerate(r["samples"]):
            x["t"] = t0 + j  # strictly increasing, span = n-1 ms < 1000


def f_ticks(d):  # "positive ticks on every sample and final sweep" (ss surface)
    for r in d["runs"]:
        for x in r["samples"]:
            x["ss"]["ticks"] = 0
        r["finalSweep"]["ss"]["ticks"] = 0


def f_egress(d):  # "all observed nonLoopback counts are zero"
    r = d["runs"][0]
    r["samples"][5]["ss"]["nonLoopback"] = 1
    r["sockets"]["ss"]["nonLoopback"] = 1  # keep summaries consistent
    r["egressNonLoopback"] = 1
    d["egressNonLoopback"] = 1


def f_exe_roots(d):  # "firefox-binary root executables"
    for r in d["runs"]:
        r["owned"]["roots"][0]["exe"] = "/usr/bin/true"


def f_tree_exe(d):  # "every sample carries ... firefox-binary ... executables"
    for r in d["runs"]:
        for x in r["samples"]:
            for p in x["treePids"]:
                p["exe"] = "/usr/bin/true"


def f_nonce(d):  # "the fresh 64-hex nonce is carried by the receipt and both runs"
    d["runNonce"] = "f" * 64
    for r in d["runs"]:
        r["runNonce"] = "f" * 64


for name, fn in [
    ("f_span.json", f_span),
    ("f_ticks.json", f_ticks),
    ("f_egress.json", f_egress),
    ("f_exe_roots.json", f_exe_roots),
    ("f_tree_exe.json", f_tree_exe),
    ("f_nonce.json", f_nonce),
]:
    emit(name, fn)

# Witness-side fixtures: one unusable witness document, plus the no-witness case
# (run without --witness, no file needed).
w = json.load(open("witness.json"))
w["schema"] = "bogus-witness"
json.dump(w, open("w_bogus.json", "w"), separators=(",", ","))
