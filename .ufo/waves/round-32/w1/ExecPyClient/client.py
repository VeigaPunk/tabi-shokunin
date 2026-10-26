#!/usr/bin/env python3
"""Independent Python 3 WebDriver BiDi client for the tabi round-32 fixture.

Second, non-Node BiDi client: drives the frozen r32 FIXTURE (served by the
counter's own serveFixture() on 127.0.0.1) through chromedriver 154 BiDi and
captures the values the counter's predicates read, plus the first screenshot
sha256 taken before any input action.

Transcript is written in the counter's JSONL format
  {"seq":n,"dir":"http-res","path":"/session","body":<new session response>}
  {"seq":n,"dir":"send","frame":{id,method,params}}
  {"seq":n,"dir":"recv","frame":<response or event>}
so it can be replayed through recordFromTranscript().

Usage: python client.py --base http://127.0.0.1:PORT --out DIR
                      [--chromedriver /usr/bin/chromedriver]
                      [--chromium /usr/bin/chromium]
                      [--tmp TMPDIR] [--profile DIR]
Loopback only: refuses any base that is not 127.0.0.1/localhost.
"""
import argparse
import asyncio
import base64
import hashlib
import json
import os
import re
import signal
import socket
import struct
import subprocess
import sys
import time
import urllib.request

import websockets

VIEWPORT = {"width": 640, "height": 480}
WANT_EVENTS = [
    "browsingContext.load",
    "browsingContext.userPromptOpened",
    "network.beforeRequestSent",
    "network.responseCompleted",
]


def sha256_bytes(b):
    return hashlib.sha256(b).hexdigest()


def free_port():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


def png_size(buf):
    if len(buf) < 24 or buf[:8] != b"\x89PNG\r\n\x1a\n" or buf[12:16] != b"IHDR":
        return None
    w, h = struct.unpack(">II", buf[16:24])
    return {"width": w, "height": h}


def str_val(rv):
    if isinstance(rv, dict) and rv.get("type") == "string":
        return rv.get("value")
    return None


def header_value(headers, name):
    for h in headers or []:
        if isinstance(h, dict) and str(h.get("name", "")).lower() == name:
            v = h.get("value")
            if isinstance(v, dict):
                return str_val(v)
            return v
    return None


def decode_bytes(bv):
    if not isinstance(bv, dict):
        return None
    if bv.get("type") == "string":
        return bv.get("value")
    if bv.get("type") == "base64":
        return base64.b64decode(bv.get("value", "")).decode("utf-8", "replace")
    return None


class BiDi:
    def __init__(self, ws):
        self.ws = ws
        self.next_id = 0
        self.seq = 0
        self.pending = {}
        self.cmds = []
        self.events = []
        self.transcript = []
        self.signal = asyncio.Event()
        self.reader_task = None

    @classmethod
    async def connect(cls, url):
        ws = await websockets.connect(url, max_size=None, open_timeout=20)
        self = cls(ws)
        self.reader_task = asyncio.create_task(self._reader())
        return self

    async def _reader(self):
        try:
            async for msg in self.ws:
                f = json.loads(msg)
                self.seq += 1
                self.transcript.append({"seq": self.seq, "dir": "recv", "frame": f})
                if f.get("id") is not None and f.get("id") in self.pending:
                    fut = self.pending.pop(f["id"])
                    if not fut.done():
                        fut.set_result(f)
                elif f.get("method"):
                    self.events.append({"i": self.seq, "method": f["method"], "params": f.get("params") or {}})
                    self.signal.set()
        except Exception:  # noqa: BLE001 - reader ends when the socket closes
            return

    async def send(self, method, params=None):
        params = params or {}
        self.next_id += 1
        cid = self.next_id
        frame = {"id": cid, "method": method, "params": params}
        self.seq += 1
        send_index = self.seq
        self.transcript.append({"seq": self.seq, "dir": "send", "frame": frame})
        fut = asyncio.get_running_loop().create_future()
        self.pending[cid] = fut
        await self.ws.send(json.dumps(frame))
        resp = await asyncio.wait_for(fut, 30)
        self.cmds.append({"i": send_index, "id": cid, "method": method, "params": params, "response": resp})
        return resp

    async def wait_event(self, pred, timeout=10.0):
        end = time.monotonic() + timeout
        scanned = 0
        while True:
            while scanned < len(self.events):
                e = self.events[scanned]
                if pred(e):
                    return e
                scanned += 1
            remaining = end - time.monotonic()
            if remaining <= 0:
                return None
            self.signal.clear()
            try:
                await asyncio.wait_for(self.signal.wait(), remaining)
            except asyncio.TimeoutError:
                return None


def ok(resp):
    return isinstance(resp, dict) and resp.get("type") == "success"


def result(resp):
    return (resp.get("result") or {}) if isinstance(resp, dict) else {}


def post_json(url, payload, timeout=10):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, headers={"content-type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def delete_json(url, timeout=10):
    req = urllib.request.Request(url, method="DELETE")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            r.read()
            return r.status
    except Exception:  # noqa: BLE001
        return None


async def drive(args):
    assert re.match(r"^http://(127\.0\.0\.1|localhost):\d+$", args.base), "base must be loopback"
    out = {"schema": "tabi-python-bidi-client-v1", "base": args.base, "values": {}}
    port = free_port()
    profile = args.profile
    os.makedirs(profile, exist_ok=True)
    env = dict(os.environ)
    env["TMPDIR"] = args.tmp
    env["TMP"] = args.tmp
    env["TEMP"] = args.tmp
    cd = subprocess.Popen(
        [args.chromedriver, f"--port={port}"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        env=env,
        start_new_session=True,
    )
    ws = None
    body = None
    transcript = []
    values = out["values"]
    try:
        for _ in range(50):
            try:
                body = post_json(
                    f"http://127.0.0.1:{port}/session",
                    {
                        "capabilities": {
                            "alwaysMatch": {
                                "browserName": "chrome",
                                "webSocketUrl": True,
                                "unhandledPromptBehavior": "ignore",
                                "goog:chromeOptions": {
                                    "binary": args.chromium,
                                    "args": [
                                        "--headless=new",
                                        "--no-sandbox",
                                        "--no-first-run",
                                        "--disable-gpu",
                                        f"--user-data-dir={profile}",
                                    ],
                                },
                            }
                        }
                    },
                )
                break
            except Exception:  # noqa: BLE001
                body = None
                await asyncio.sleep(0.2)
        if not body or not (body.get("value") or {}).get("capabilities"):
            raise RuntimeError(f"new session failed: {json.dumps(body)[:300]}")
        session_id = body["value"]["sessionId"]
        caps = body["value"]["capabilities"]
        transcript.append({"seq": 0, "dir": "http-res", "path": "/session", "body": body})
        values.update(
            {
                "browserName": caps.get("browserName"),
                "browserVersion": caps.get("browserVersion"),
                "webSocketUrl": caps.get("webSocketUrl"),
                "chromedriverVersion": (caps.get("chrome") or {}).get("chromedriverVersion"),
            }
        )
        ws = await BiDi.connect(caps["webSocketUrl"])

        await ws.send("session.subscribe", {"events": WANT_EVENTS})
        tree = await ws.send("browsingContext.getTree", {})
        contexts = result(tree).get("contexts") or []
        values["r2_getTree_contexts"] = [
            {"context": c.get("context"), "url": c.get("url"), "children": len(c.get("children") or [])}
            for c in contexts
        ]
        context = contexts[0].get("context") if contexts else None
        if not context:
            raise RuntimeError("no browsing context")

        viewport = {"width": args.viewport_width, "height": args.viewport_height}
        values["viewport"] = viewport
        await ws.send("browsingContext.setViewport", {"context": context, "viewport": viewport, "devicePixelRatio": 1})
        collector = await ws.send(
            "network.addDataCollector", {"dataTypes": ["response"], "maxEncodedDataSize": 65536}
        )
        values["r12_collectorPresent"] = ok(collector)
        url_a = f"{args.base}/a.html"
        nav = await ws.send("browsingContext.navigate", {"context": context, "url": url_a, "wait": "complete"})
        values["r3_navigate_result_url"] = result(nav).get("url")
        load = await ws.wait_event(lambda e: e["method"] == "browsingContext.load" and e["params"].get("url") == url_a)
        values["r3_load_event"] = bool(load)
        ready = await ws.send(
            "script.evaluate",
            {"expression": "window.__ready", "awaitPromise": True, "target": {"context": context}},
        )
        values["r6_ready"] = str_val(result(ready).get("result"))
        iw = await ws.send(
            "script.evaluate",
            {"expression": "window.innerWidth", "awaitPromise": False, "target": {"context": context}},
        )
        values["r7_innerWidth"] = (result(iw).get("result") or {}).get("value")
        shot = await ws.send("browsingContext.captureScreenshot", {"context": context})
        shot_b64 = str(result(shot).get("data") or "")
        shot_bytes = base64.b64decode(shot_b64)
        values["firstScreenshotSha256"] = sha256_bytes(shot_bytes)
        values["firstScreenshotBytes"] = len(shot_bytes)
        values["firstScreenshotPngSize"] = png_size(shot_bytes)
        values["firstScreenshotBase64Sha256"] = sha256_bytes(shot_b64.encode())

        async def loc(sel):
            r = await ws.send(
                "browsingContext.locateNodes", {"context": context, "locator": {"type": "css", "value": sel}}
            )
            nodes = result(r).get("nodes") or []
            node0 = nodes[0] if nodes else {}
            return len(nodes), node0

        n_h, h_node = await loc("#h")
        values["r5_locate_h_count"] = n_h
        values["r5_locate_h_localName"] = (h_node.get("value") or {}).get("localName")
        _, t_node = await loc("#t")
        _, b_node = await loc("#b")
        t_id = t_node.get("sharedId")
        b_id = b_node.get("sharedId")

        def click_actions(shared_id):
            return [
                {
                    "type": "pointer",
                    "id": "mouse",
                    "parameters": {"pointerType": "mouse"},
                    "actions": [
                        {
                            "type": "pointerMove",
                            "x": 0,
                            "y": 0,
                            "origin": {"type": "element", "element": {"sharedId": shared_id}},
                        },
                        {"type": "pointerDown", "button": 0},
                        {"type": "pointerUp", "button": 0},
                    ],
                }
            ]

        await ws.send("input.performActions", {"context": context, "actions": click_actions(t_id)})
        keys = []
        for ch in "tabi":
            keys.append({"type": "keyDown", "value": ch})
            keys.append({"type": "keyUp", "value": ch})
        await ws.send(
            "input.performActions", {"context": context, "actions": [{"type": "key", "id": "kbd", "actions": keys}]}
        )
        tv = await ws.send(
            "script.evaluate",
            {
                "expression": "document.getElementById('t').value",
                "awaitPromise": False,
                "target": {"context": context},
            },
        )
        values["r9_textValue"] = str_val(result(tv).get("result"))
        await ws.send("input.performActions", {"context": context, "actions": click_actions(b_id)})
        ov = await ws.send(
            "script.evaluate",
            {
                "expression": "document.getElementById('out').textContent",
                "awaitPromise": False,
                "target": {"context": context},
            },
        )
        values["r8_outTextContent"] = str_val(result(ov).get("result"))

        await ws.send(
            "script.evaluate",
            {
                "expression": "fetch('/data.txt').then(function(r){return r.text()})",
                "awaitPromise": True,
                "target": {"context": context},
            },
        )
        done = await ws.wait_event(
            lambda e: e["method"] == "network.responseCompleted"
            and re.search(r"/data\.txt$", str((e["params"].get("response") or {}).get("url")))
        )
        if done:
            rid = (done["params"].get("request") or {}).get("request")
            gd = await ws.send("network.getData", {"dataType": "response", "request": rid})
            values["r12_getDataBytes"] = decode_bytes(result(gd).get("bytes"))
            values["r12_getDataType"] = (result(gd).get("bytes") or {}).get("type")
        else:
            values["r12_getDataBytes"] = None

        cookies = await ws.send("storage.getCookies", {})
        ck = [c for c in (result(cookies).get("cookies") or []) if c.get("name") == "tabi_fixture"]
        values["r15_cookie"] = {
            "name": ck[0].get("name") if ck else None,
            "value": str_val(ck[0].get("value")) if ck else None,
            "domain": ck[0].get("domain") if ck else None,
            "cookieCount": len(result(cookies).get("cookies") or []),
        }

        a_done = None
        for e in ws.events:
            if e["method"] == "network.responseCompleted" and (e["params"].get("response") or {}).get("url") == url_a:
                a_done = e
                break
        if a_done:
            resp = a_done["params"].get("response") or {}
            values["r11_status"] = resp.get("status")
            values["r11_statusText"] = resp.get("statusText")
            values["r11_fixtureHeader"] = header_value(resp.get("headers"), "x-tabi-fixture")
            values["r11_headerCount"] = len(resp.get("headers") or [])
            values["r10_beforeRequestSent_a"] = any(
                e["method"] == "network.beforeRequestSent"
                and (e["params"].get("request") or {}).get("url") == url_a
                for e in ws.events
            )
            values["r10_responseCompleted_a"] = True
        else:
            values["r11_status"] = None
            values["r11_fixtureHeader"] = None
            values["r10_responseCompleted_a"] = False

        ic = await ws.send(
            "network.addIntercept",
            {
                "phases": ["beforeRequestSent"],
                "urlPatterns": [{"type": "string", "pattern": f"{args.base}/data.txt?held=1"}],
            },
        )
        ic_id = result(ic).get("intercept")
        values["r13_interceptId"] = ic_id
        await ws.send(
            "script.evaluate",
            {
                "expression": "window.__held=fetch('/data.txt?held=1').then(function(r){return r.text()}),1",
                "awaitPromise": False,
                "target": {"context": context},
            },
        )
        blocked = await ws.wait_event(
            lambda e: e["method"] == "network.beforeRequestSent"
            and e["params"].get("isBlocked") is True
            and ic_id in (e["params"].get("intercepts") or [])
        )
        values["r13_blocked"] = bool(blocked)
        if blocked:
            values["r13_blockedUrl"] = (blocked["params"].get("request") or {}).get("url")
            cont = await ws.send(
                "network.continueRequest", {"request": (blocked["params"].get("request") or {}).get("request")}
            )
            values["r13_continued"] = ok(cont)
            if ok(cont):
                values["r13_continueCommandIndex"] = ws.cmds[-1]["i"]
                values["r13_blockedEventIndex"] = blocked["i"]
            held = await ws.send(
                "script.evaluate",
                {"expression": "window.__held", "awaitPromise": True, "target": {"context": context}},
            )
            values["r13_heldBody"] = str_val(result(held).get("result"))
        else:
            values["r13_continued"] = None

        await ws.send(
            "browsingContext.navigate", {"context": context, "url": f"{args.base}/b.html", "wait": "complete"}
        )
        traverse = await ws.send("browsingContext.traverseHistory", {"context": context, "delta": -1})
        values["r14_traverseHistory"] = ok(traverse)
        paths = []
        for _ in range(20):
            p = await ws.send(
                "script.evaluate",
                {"expression": "location.pathname", "awaitPromise": False, "target": {"context": context}},
            )
            val = str_val(result(p).get("result"))
            paths.append(val)
            if val == "/a.html":
                break
            await asyncio.sleep(0.1)
        values["r14_pathname"] = paths[-1] if paths else None
        values["r14_pathnamePolls"] = len(paths)

        await ws.send(
            "script.evaluate",
            {
                "expression": "setTimeout(function(){alert('tabi-alert')},0),1",
                "awaitPromise": False,
                "target": {"context": context},
            },
        )
        prompt = await ws.wait_event(
            lambda e: e["method"] == "browsingContext.userPromptOpened" and e["params"].get("message") == "tabi-alert"
        )
        values["r17_promptOpened"] = bool(prompt)
        if prompt:
            ho = await ws.send(
                "browsingContext.handleUserPrompt", {"context": prompt["params"].get("context"), "accept": True}
            )
            values["r17_handled"] = ok(ho)

        values["commands"] = len(ws.cmds)
        values["events"] = len(ws.events)
        transcript.extend(ws.transcript)
        values["sessionDeleteStatus"] = delete_json(f"http://127.0.0.1:{port}/session/{session_id}")
    finally:
        try:
            if ws is not None and ws.ws is not None:
                await ws.ws.close()
        except Exception:  # noqa: BLE001
            pass
        try:
            os.killpg(os.getpgid(cd.pid), signal.SIGTERM)
        except Exception:  # noqa: BLE001
            cd.terminate()
        try:
            cd.wait(timeout=10)
        except Exception:  # noqa: BLE001
            try:
                os.killpg(os.getpgid(cd.pid), signal.SIGKILL)
            except Exception:  # noqa: BLE001
                pass
        values["chromedriverExit"] = cd.returncode
        out["transcript"] = transcript
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--chromedriver", default="/usr/bin/chromedriver")
    ap.add_argument("--chromium", default="/usr/bin/chromium")
    ap.add_argument("--tmp", default=os.environ.get("TMPDIR", "/tmp"))
    ap.add_argument("--profile", default=None)
    ap.add_argument("--viewport-width", type=int, default=VIEWPORT["width"])
    ap.add_argument("--viewport-height", type=int, default=VIEWPORT["height"])
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    if args.profile is None:
        args.profile = os.path.join(args.out, "profile")
    if len(args.tmp) > 90:
        print(json.dumps({"schema": "tabi-python-bidi-client-v1", "error": f"TMPDIR too long ({len(args.tmp)})"}))
        return 2
    res = asyncio.run(drive(args))
    transcript = res.pop("transcript", [])
    with open(os.path.join(args.out, "transcript.jsonl"), "w", encoding="utf-8") as fh:
        for line in transcript:
            fh.write(json.dumps(line, separators=(",", ":")) + "\n")
    with open(os.path.join(args.out, "values.json"), "w", encoding="utf-8") as fh:
        json.dump(res, fh, indent=1, sort_keys=True)
        fh.write("\n")
    print(json.dumps(res.get("values", {}), indent=1, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
