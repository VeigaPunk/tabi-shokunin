#!/usr/bin/env python3
"""Locate the S126 quotes inside the saved W3C WebDriver classic bytes.

Tag-stripped extraction over fixed HTML line ranges of wd2-dated.html
(sha256 929f2f0be15b73b0b3e33052f115a47fc1561ec42f0a8992d532780591ae919e)
and, for the cross-reference only, bidi.html
(sha256 dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4).
Usage: extract-quotes.py <raw-dir>
"""
import html
import re
import sys
from pathlib import Path

RAW = Path(sys.argv[1] if len(sys.argv) > 1 else "raw")

TARGETS = [
    ("wd2-dated.html", 11202, 11203, "§16 preamble, unhandled prompt"),
    ("wd2-dated.html", 11247, 11249, "§16.1 heading + first sentence"),
    ("wd2-dated.html", 11306, 11307, '§16.1 known handler "ignore"'),
    ("wd2-dated.html", 1976, 1980, "§7 capabilities table, unhandledPromptBehavior row"),
    ("wd2-dated.html", 1798, 1801, "§7 additional WebDriver capabilities slot"),
    ("bidi.html", 2216, 2217, "§4.1 webSocketUrl opt-in (S124 scope, cross-reference)"),
]


def strip(lines):
    s = " ".join(lines)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


for name, a, b, label in TARGETS:
    lines = (RAW / name).read_text(encoding="utf-8").split("\n")
    print(f"{name}:{a}-{b}  {label}")
    print(f"  {strip(lines[a - 1:b])}")
    print()

for name, needle in [
    ("wd2-dated.html", "websocket"),
    ("wd-ed.html", "websocketurl"),
]:
    text = (RAW / name).read_text(encoding="utf-8").lower()
    print(f"{name}: case-insensitive occurrences of {needle!r} = {text.count(needle)}")
