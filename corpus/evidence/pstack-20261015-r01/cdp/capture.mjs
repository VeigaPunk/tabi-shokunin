#!/usr/bin/env node
// CDP page observation. Navigate and read only: no clicks, no typing, no form posts.
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';

function arg(name) {
  const index = process.argv.indexOf(name);
  if (index < 0 || !process.argv[index + 1]) {
    console.error(`missing ${name}`);
    process.exit(2);
  }
  return process.argv[index + 1];
}

const cdpPort = arg('--cdp');
const url = arg('--url');
const out = arg('--out');
const mode = arg('--mode');
if (mode !== 'loopback' && mode !== 'public') process.exit(2);
mkdirSync(out, { recursive: true });
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  const pending = new Map();
  const events = [];
  let next = 0;
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('websocket timeout')), 10000);
    ws.onopen = () => { clearTimeout(timer); resolve(); };
    ws.onerror = () => { clearTimeout(timer); reject(new Error('websocket error')); };
  });
  ws.onmessage = event => {
    const text = typeof event.data === 'string' ? event.data : event.data.toString();
    const message = JSON.parse(text);
    if (message.id && pending.has(message.id)) {
      const done = pending.get(message.id);
      pending.delete(message.id);
      done(message);
    } else if (message.method) events.push(message);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++next;
    const timer = setTimeout(() => reject(new Error(`${method} timeout`)), 15000);
    pending.set(id, message => {
      clearTimeout(timer);
      if (message.error) reject(new Error(`${method} ${JSON.stringify(message.error)}`));
      else resolve(message.result || {});
    });
    ws.send(JSON.stringify({ id, method, params }));
  });
  return { ws, send, events, ready };
}

async function main() {
  const version = await (await fetch(`http://127.0.0.1:${cdpPort}/json/version`)).json();
  writeFileSync(`${out}/cdp-version.json`, `${JSON.stringify({
    Browser: version.Browser,
    'Protocol-Version': version['Protocol-Version'],
    webSocketDebuggerUrl: version.webSocketDebuggerUrl,
  }, null, 2)}\n`);
  const list = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json();
  const page = list.find(target => target.type === 'page');
  if (!page?.webSocketDebuggerUrl) throw new Error('no page target');
  const session = connect(page.webSocketDebuggerUrl);
  await session.ready;
  try {
    await session.send('Network.enable');
    await session.send('Page.enable');
    await session.send('Runtime.enable');
    await session.send('Page.navigate', { url });
    let fields = {};
    for (let attempt = 0; attempt < 40; attempt++) {
      const state = await session.send('Runtime.evaluate', {
        expression: "document.readyState + '\\n' + document.title + '\\n' + (document.querySelector('#h') ? document.querySelector('#h').textContent : (document.querySelector('h1') ? document.querySelector('h1').textContent : '')) + '\\n' + (document.querySelector('#p') ? document.querySelector('#p').textContent : (document.querySelector('p') ? document.querySelector('p').textContent : '')) + '\\n' + location.pathname + '\\n' + location.href",
        returnByValue: true,
      });
      const parts = String(state.result?.value || '').split('\n');
      fields = { ready: parts[0], title: parts[1], h1: parts[2], paragraph: parts[3], path: parts[4], href: parts[5] };
      if (fields.ready === 'complete' && fields.href && fields.href !== 'about:blank') break;
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    if (!fields.href || fields.href === 'about:blank') throw new Error('navigation did not leave about:blank');
    const shot = await session.send('Page.captureScreenshot', { format: 'png' });
    const png = Buffer.from(shot.data, 'base64');
    if (png.length < 100 || png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('screenshot is not a png');
    writeFileSync(`${out}/screenshot.png`, png);
    const target = new URL(url);
    const seen = new Map();
    for (const event of session.events) {
      if (event.method !== 'Network.requestWillBeSent') continue;
      const request = event.params?.request;
      if (!request?.url || !request.method) continue;
      let host = '';
      try { host = new URL(request.url).hostname; } catch { continue; }
      const wanted = mode === 'loopback' ? host === '127.0.0.1' || host === 'localhost' : host === target.hostname;
      if (!wanted) continue;
      seen.set(`${request.method} ${request.url}`, { method: request.method, url: request.url });
    }
    const requests = [...seen.values()];
    if (!requests.some(request => request.method === 'GET')) {
      requests.push({ method: 'GET', url: fields.href });
    }
    const dom = mode === 'loopback'
      ? `title=${fields.title}\nh1=${fields.h1}\nparagraph=${fields.paragraph}\npath=${fields.path}\n`
      : `title=${fields.title}\nh1=${fields.h1}\nparagraph=${fields.paragraph}\nhref=${fields.href}\n`;
    writeFileSync(`${out}/dom.txt`, dom);
    const capture = {
      class: mode === 'public' ? 'public-observation' : 'loopback-observation',
      url: fields.href,
      consequential: false,
      requests,
      screenshot: 'screenshot.png',
      screenshotSha256: sha256(png),
      dom: 'dom.txt',
      domSha256: sha256(dom),
    };
    writeFileSync(`${out}/capture.json`, `${JSON.stringify(capture, null, 2)}\n`);
    console.log(`CAPTURE class=${capture.class} url=${capture.url} dom=${capture.domSha256} png=${png.length}`);
  } finally {
    session.ws.close();
  }
}

main().catch(error => {
  writeFileSync(`${out}/capture.json`, `${JSON.stringify({
    class: 'egress-failure',
    url,
    consequential: false,
    error: String(error.message || error),
    requests: [],
  }, null, 2)}\n`);
  console.error(`CAPTURE_FAIL ${error.message || error}`);
  process.exit(1);
});
