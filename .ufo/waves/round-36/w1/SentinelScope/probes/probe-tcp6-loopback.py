#!/usr/bin/env python3
"""probe-tcp6-loopback.py — shows how /proc/net/tcp6 renders ::1 and applies the frozen C2 v2
counter's own loopback rule to it. Read-only; no network beyond a loopback listener."""
import os
import re
import socket

srv = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
srv.bind(("::1", 0))
srv.listen(1)
port = srv.getsockname()[1]
cli = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
cli.connect(("::1", port))
acc, _ = srv.accept()

inodes = set()
for fd in os.listdir(f"/proc/{os.getpid()}/fd"):
    try:
        link = os.readlink(f"/proc/{os.getpid()}/fd/{fd}")
    except OSError:
        continue
    m = re.fullmatch(r"socket:\[(\d+)\]", link)
    if m:
        inodes.add(m.group(1))

COUNTER_CONSTANTS = ("0000000000000000", "0000000000000001", "0100000000000000")


def counter_says_non_loopback(addr):
    return addr not in COUNTER_CONSTANTS


for row in open("/proc/net/tcp6").read().split("\n")[1:]:
    f = row.split()
    if len(f) > 9 and f[9] in inodes and f[3] == "01":
        addr = f[2].split(":")[0]
        print(f"ESTABLISHED /proc/net/tcp6 row remote={f[2]} inode={f[9]}")
        print(f"  ::1 rendered as {addr!r}")
        print(f"  counter rule counts it as non-loopback: {counter_says_non_loopback(addr)}")
cli.close()
acc.close()
srv.close()
