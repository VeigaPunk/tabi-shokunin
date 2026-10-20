#!/usr/bin/env node
// Count round-18 source-recheck receipts using committed inputs only.
import { createHash } from 'node:crypto';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { gzipSync, gunzipSync } from 'node:zlib';

const RECEIPT_DIR = 'corpus/evidence/round-18/source-recheck';
const SOURCES_PATH = 'corpus/SOURCES.md';
const PRODUCER_PATH = '.ufo/waves/round-18/recheck-fetch.mjs';
const SUPERSEDED = new Set(['S004', 'S039', 'S047', 'S049', 'S050', 'S053']);
const C1_BASELINE_REV = '2bff864fdfee684ddbcd066cc8e735adaba2735c';
const BASELINE_ELIGIBLE_ROWS = 51;
const SOURCE_KINDS = new Set(['code', 'community', 'docs', 'own-work', 'paper', 'spec', 'tool']);
const SOURCE_TIERS = new Set(['A', 'B', 'C']);
const SOURCE_STATUSES = new Set(['mined', 'queued', 'rejected']);
const S029_SOURCE_REV = '837b33a3988ebeea7f6b4ef5c04698da88909a73';
const S029_SOURCE_PATH = 'corpus/evidence/round-13/aria/receipt.json';
const S029_SOURCE_REPO = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const S029_SOURCE_SHA256 = 'b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7';
const CURL_USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18';
const MAX_BUFFER = 64 * 1024 * 1024;
const MAX_BODY_BYTES = 16 * 1024 * 1024;
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", rsquo: '\u2019', lsquo: '\u2018', rdquo: '\u201d', ldquo: '\u201c', mdash: '\u2014', ndash: '\u2013', hellip: '\u2026' };
const scriptPath = fileURLToPath(import.meta.url);

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

// These decoder and normalizer implementations match recheck-fetch.mjs.
function decodeBody(bytes, decode) {
  if (decode === 'none') return bytes.toString('utf8');
  if (decode === 'base64') return Buffer.from(bytes.toString('utf8').replace(/\s+/g, ''), 'base64').toString('utf8');
  if (decode === 'html-text') {
    return bytes.toString('utf8')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (m, e) => {
        if (/^#x/i.test(e)) return String.fromCodePoint(parseInt(e.slice(2), 16));
        if (/^#\d/.test(e)) return String.fromCodePoint(Number(e.slice(1)));
        return ENTITIES[e.toLowerCase()] ?? m;
      });
  }
  if (decode === 'pdf-text') {
    const dir = mkdtempSync(join(tmpdir(), 'tabi-r18-pdf-'));
    try {
      writeFileSync(join(dir, 'in.pdf'), bytes);
      const r = spawnSync('pdftotext', ['-layout', join(dir, 'in.pdf'), join(dir, 'out.txt')]);
      if (r.status !== 0) throw new Error('pdftotext failed');
      return readFileSync(join(dir, 'out.txt'), 'utf8');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
  throw new Error(`unknown decode ${decode}`);
}

function normalize(text) {
  return text.normalize('NFC')
    .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-').replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: null,
    maxBuffer: MAX_BUFFER,
    ...options,
  });
  if (result.error) throw new Error(`${command} failed: ${result.error.message}`);
  return result;
}

function minimalGitEnv(repo = null) {
  const env = {
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_OPTIONAL_LOCKS: '0',
    GIT_TERMINAL_PROMPT: '0',
    GIT_NO_REPLACE_OBJECTS: '1',
    GIT_GRAFT_FILE: '/dev/null',
    GIT_NO_LAZY_FETCH: '1',
    GIT_LITERAL_PATHSPECS: '1',
    TZ: 'UTC',
  };
  if (process.env.PATH !== undefined) env.PATH = process.env.PATH.split(':').filter(entry => entry.startsWith('/')).join(':');
  if (process.env.HOME !== undefined) env.HOME = process.env.HOME;
  if (repo) env.GIT_CEILING_DIRECTORIES = resolve(repo, '..');
  return env;
}

function git(lane, args, { allowFailure = false } = {}) {
  const cwd = resolve(lane);
  const result = run('git', args, { cwd, env: minimalGitEnv(cwd) });
  if (result.status !== 0 && !allowFailure) {
    const detail = result.stderr?.toString('utf8').trim();
    throw new Error(`git ${args[0]} failed${detail ? `: ${detail}` : ''}`);
  }
  return result;
}

function resolveLane(laneOption) {
  if (laneOption) return resolve(laneOption);
  const result = run('git', ['rev-parse', '--show-toplevel'], {
    cwd: dirname(scriptPath),
    env: minimalGitEnv(),
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`cannot resolve lane root: ${result.stderr?.toString('utf8').trim() || 'git rev-parse failed'}`);
  }
  return resolve(result.stdout.toString('utf8').trim());
}

function resolveRevision(lane, rev) {
  const result = git(lane, ['rev-parse', '--verify', '--end-of-options', `${rev}^{commit}`], { allowFailure: true });
  if (result.status !== 0) throw new Error(`invalid revision: ${rev}`);
  const canonical = result.stdout.toString('utf8').trim();
  if (!/^[0-9a-f]{40,64}$/i.test(canonical)) throw new Error(`revision did not resolve to a commit: ${rev}`);
  return canonical;
}

function showBlob(lane, rev, path) {
  const result = git(lane, ['show', '--no-ext-diff', '--no-textconv', '--format=', `${rev}:${path}`], { allowFailure: true });
  if (result.status !== 0) return null;
  return result.stdout;
}

function listTree(lane, rev) {
  const result = git(lane, ['ls-tree', '-rz', '--full-tree', '-r', rev, '--', RECEIPT_DIR]);
  const entries = [];
  for (const record of result.stdout.toString('utf8').split('\0')) {
    if (!record) continue;
    const tab = record.indexOf('\t');
    if (tab < 0) throw new Error('malformed git ls-tree output');
    const [mode, type, oid] = record.slice(0, tab).split(' ');
    entries.push({ mode, type, oid, path: record.slice(tab + 1) });
  }
  return entries;
}

function tableCells(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) return null;
  const body = trimmed.slice(1, trimmed.endsWith('|') ? -1 : undefined);
  const cells = [];
  let cell = '';
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '\\' && body[i + 1] === '|') {
      cell += '|';
      i++;
    } else if (ch === '|') {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += ch;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function parseSources(bytes) {
  const rows = new Map();
  const duplicates = new Set();
  for (const line of bytes.toString('utf8').split(/\r?\n/)) {
    const cells = tableCells(line);
    if (!cells || !/^S\d{3,}$/.test(cells[0] ?? '')) continue;
    const id = cells[0];
    const row = {
      id,
      source: cells[1] ?? '',
      kind: cells[2] ?? '',
      tier: cells[3] ?? '',
      anchor: cells[5] ?? '',
      teaches: cells[6] ?? '',
      status: cells[7] ?? '',
      shapeValid: cells.length === 11 && cells.slice(1).every(cell => cell.length > 0),
    };
    if (rows.has(id)) duplicates.add(id);
    else rows.set(id, row);
  }
  return { rows, duplicates };
}

function sourceRowValid(row) {
  return row.shapeValid && SOURCE_KINDS.has(row.kind) && SOURCE_TIERS.has(row.tier) && SOURCE_STATUSES.has(row.status);
}
function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

function parseHttpUrl(value) {
  if (!isHttpUrl(value)) return null;
  try {
    const url = new URL(value);
    if (url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

function normalizeHttpUrl(value) {
  const url = parseHttpUrl(value);
  if (!url) return null;
  url.hash = '';
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return url.href;
}

function sourceHttpUrls(source) {
  return [...source.matchAll(/https?:\/\/[^\s|)>`]+/gi)].map(match => match[0]);
}

function canonicalFetchTarget(row, rowUrl) {
  if (!sourceHttpUrls(row.source).includes(rowUrl)) return null;
  const source = parseHttpUrl(rowUrl);
  const direct = normalizeHttpUrl(rowUrl);
  if (!source || !direct) return null;
  const allowed = new Set([direct]);
  let canonical = direct;

  const githubBlob = source.protocol === 'https:' && source.hostname === 'github.com' && !source.search
    ? source.pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/)
    : null;
  if (githubBlob) {
    const raw = `https://raw.githubusercontent.com/${githubBlob[1]}/${githubBlob[2]}/${githubBlob[3]}/${githubBlob[4]}`;
    const normalizedRaw = normalizeHttpUrl(raw);
    if (normalizedRaw) {
      allowed.add(normalizedRaw);
      canonical = normalizedRaw;
    }
  }

  if (source.protocol === 'https:' && source.hostname.endsWith('googlesource.com')
    && source.pathname.includes('/+/') && !source.search) {
    const gitiles = new URL(source.href);
    gitiles.hash = '';
    gitiles.search = '?format=TEXT';
    const normalizedGitiles = normalizeHttpUrl(gitiles.href);
    if (normalizedGitiles) {
      allowed.add(normalizedGitiles);
      canonical = normalizedGitiles;
    }
  }

  const sourcePath = source.pathname.replace(/\/+$/, '') || '/';
  if (row.id === 'S022' && source.protocol === 'https:' && source.hostname === 'ieeexplore.ieee.org'
    && sourcePath === '/document/10989021' && !source.search) {
    const abstract = normalizeHttpUrl('https://ieeexplore.ieee.org/abstract/document/10989021');
    allowed.add(abstract);
    canonical = abstract;
  }

  if (row.id === 'S026' && source.protocol === 'https:' && source.hostname === 'stackoverflow.com' && !source.search) {
    const question = source.pathname.match(/^\/questions\/(\d+)(?:\/|$)/);
    const answer = row.anchor.match(/\banswer\s+(\d+)\b/i);
    if (question && answer) {
      const api = new URL(`https://api.stackexchange.com/2.3/answers/${answer[1]}`);
      api.searchParams.set('site', 'stackoverflow');
      api.searchParams.set('filter', 'withbody');
      const normalizedApi = normalizeHttpUrl(api.href);
      allowed.add(normalizedApi);
      canonical = normalizedApi;
    }
  }

  return { allowed, canonical };
}

function expectedCurlCommand(url) {
  const argv = ['-sSL', '--compressed', '--max-time', '90', '-A', CURL_USER_AGENT, '-o', '<tmp>/body', '-w', '%{http_code}'];
  return `curl ${argv.join(' ')} '${url}'`;
}

function expectedS029Command() {
  return `git -C ${S029_SOURCE_REPO} show ${S029_SOURCE_REV}:${S029_SOURCE_PATH}`;
}

function sourceExcerpt(bytes, decode, quote) {
  const text = normalize(decodeBody(bytes, decode));
  const normalizedQuote = normalize(quote);
  const offset = text.indexOf(normalizedQuote);
  if (offset < 0) return null;
  const excerpt = text.slice(Math.max(0, offset - 600), offset + normalizedQuote.length + 600);
  return { offset, bytes: Buffer.from(`${excerpt}\n`, 'utf8') };
}

function stackExchangeAnswerMatches(row, rowUrl, bodyBytes, quote) {
  if (row.id !== 'S026') return true;
  const answer = row.anchor.match(/\banswer\s+(\d+)\b/i);
  const question = parseHttpUrl(rowUrl)?.pathname.match(/^\/questions\/(\d+)(?:\/|$)/);
  if (!answer || !question) return false;
  let payload;
  try {
    payload = JSON.parse(bodyBytes.toString('utf8'));
  } catch {
    return false;
  }
  if (!Array.isArray(payload.items) || payload.items.length !== 1) return false;
  const item = payload.items[0];
  if (String(item.answer_id) !== answer[1] || String(item.question_id) !== question[1] || typeof item.body !== 'string') return false;
  return normalize(decodeBody(Buffer.from(item.body, 'utf8'), 'html-text')).includes(normalize(quote));
}

function isPinnedUrl(url) {
  return /(?:^|\/)v?\d+(?:\.\d+){1,}(?:\/|$)/i.test(url)
    || /\/\+\/refs\/tags\/[^/]+(?:\/|$)/i.test(url)
    || /\/(?:blob|tree|commit)\/[0-9a-f]{40,64}(?:\/|$)/i.test(url)
    || /(?:^|\/)20\d{2}-\d{2}-\d{2}(?:\/|$)/.test(url);
}

function urlClass(row) {
  if (row.kind === 'own-work') return 'own_work';
  const urls = [...row.source.matchAll(/https?:\/\/[^\s|)>`]+/gi)].map(match => match[0]);
  if (!urls.length) return 'unclassified';
  const classes = new Set(urls.map(url => isPinnedUrl(url) ? 'immutable_pinned' : 'living_live'));
  return classes.size === 1 ? [...classes][0] : 'mixed';
}

function histogram(values) {
  const counts = new Map();
  for (const value of values) counts.set(value || 'unknown', (counts.get(value || 'unknown') ?? 0) + 1);
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
}

function rowClassSummary(rows) {
  return {
    kind: histogram([...rows.values()].map(row => row.kind)),
    status: histogram([...rows.values()].map(row => row.status)),
    url: histogram([...rows.values()].map(urlClass)),
  };
}

function rowClassBucket(rows, rowCount = rows.size) {
  return {
    row_count: rowCount,
    present_rows: rows.size,
    missing_rows: rowCount - rows.size,
    ...rowClassSummary(rows),
  };
}

function wordCount(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function isIsoDay(value, day) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === day;
}

function isRegularBlob(entry) {
  return entry?.type === 'blob' && (entry.mode === '100644' || entry.mode === '100755');
}

function receiptRows(entries, lane, rev) {
  const jsonEntries = entries
    .filter(entry => dirname(entry.path) === RECEIPT_DIR && entry.path.endsWith('.json'))
    .sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const tree = new Map(entries.map(entry => [entry.path, entry]));
  const parsed = jsonEntries.map(entry => {
    if (!isRegularBlob(entry)) return { entry, error: 'receipt is not a regular blob' };
    const bytes = showBlob(lane, rev, entry.path);
    if (bytes === null) return { entry, error: 'cannot read receipt blob' };
    try {
      return { entry, bytes, value: JSON.parse(bytes.toString('utf8')) };
    } catch {
      return { entry, error: 'invalid JSON' };
    }
  });
  const rowCounts = new Map();
  for (const item of parsed) {
    const row = item.value?.row;
    if (typeof row !== 'string') continue;
    rowCounts.set(row, (rowCounts.get(row) ?? 0) + 1);
  }
  return { parsed, tree, rowCounts };
}

function evaluateReceipt(item, ctx) {
  const file = item.entry.path;
  const reject = reason => ({ accepted: false, rejection: { file, reason } });
  if (item.error) return reject(item.error);
  const r = item.value;
  if (typeof r?.row === 'string' && ctx.rowCounts.get(r.row) > 1) return reject('duplicate row receipt');
  if (r?.schema !== 'tabi-source-recheck-v1') return reject('schema mismatch');
  if (typeof r.row !== 'string' || !/^S\d{3,}$/.test(r.row)) return reject('invalid row id');
  if (basename(file) !== `${r.row}.json`) return reject('receipt filename does not match row');
  if (!ctx.sources.rows.has(r.row)) return reject('unknown row');
  if (ctx.sources.duplicates.has(r.row)) return reject('duplicate source row');
  if (SUPERSEDED.has(r.row)) return reject('superseded row');
  if (!ctx.cohortIds.has(r.row)) return reject('row outside fixed B cohort');

  const row = ctx.sources.rows.get(r.row);
  if (!sourceRowValid(row)) return reject('invalid source row kind/status/tier or shape');
  if (typeof r.rowUrl !== 'string' || !r.rowUrl || !row.source.includes(r.rowUrl)) return reject('rowUrl not in row');
  if (typeof r.sha256 !== 'string' || !/^[0-9a-f]{64}$/i.test(r.sha256)) return reject('sha256 is not 64-hex');
  if (typeof r.quote !== 'string' || !r.quote.trim()) return reject('quote is empty');
  if (typeof r.quoteWords !== 'number' || !Number.isInteger(r.quoteWords)) return reject('quoteWords mismatch');
  if (r.quoteWords > 25) return reject('quoteWords >25');
  if (r.quoteWords !== wordCount(r.quote)) return reject('quoteWords mismatch');
  if (r.quoteFound !== true) return reject('quoteFound is not true');
  if (!isIsoDay(r.fetchedAt, '2026-10-20')) return reject('wrong fetchedAt date');
  if (r.teachesVerdict !== 'held' && r.teachesVerdict !== 'drift') return reject('teachesVerdict is not held or drift');
  if (r.teachesVerdict === 'drift' && ![...ctx.sources.rows.values()].some(candidate => candidate.teaches.startsWith(`supersedes ${r.row} —`))) {
    return reject('drift without superseding row');
  }

  let fetchUrl = null;
  if (r.row === 'S029') {
    if (row.kind !== 'own-work' || r.rowUrl !== S029_SOURCE_PATH || r.url !== S029_SOURCE_PATH || r.httpStatus !== null) {
      return reject('S029 source path mismatch');
    }
    if (typeof r.command !== 'string' || r.command !== expectedS029Command()) {
      return reject('S029 command is not pinned git show');
    }
    if (!ctx.s029Bytes || sha256(ctx.s029Bytes) !== S029_SOURCE_SHA256 || r.sha256 !== S029_SOURCE_SHA256) {
      return reject('S029 sha256 does not match pinned git object');
    }
  } else {
    if (row.kind === 'own-work' || !isHttpUrl(r.rowUrl)) return reject('non-HTTP source only allowed for S029');
    const mapping = canonicalFetchTarget(row, r.rowUrl);
    const normalizedFetchUrl = normalizeHttpUrl(r.url);
    if (!mapping || !normalizedFetchUrl || !mapping.allowed.has(normalizedFetchUrl)) return reject('fetch URL does not match row URL');
    if (typeof r.command !== 'string' || r.command !== expectedCurlCommand(r.url)) return reject('fetch command is not canonical curl');
    if (r.httpStatus !== 200) return reject('httpStatus != 200');
    if (r.row === 'S026' && r.decode !== 'html-text') return reject('S026 API response must use html-text decode');
    fetchUrl = mapping.canonical;
  }
  if (typeof r.producerSha256 !== 'string' || r.producerSha256 !== ctx.producerSha256) return reject('wrong producer sha');

  if (r.bodyPath !== `${r.row}.body.gz`) return reject('retained body path missing or invalid');
  const bodyPath = `${RECEIPT_DIR}/${r.bodyPath}`;
  const bodyEntry = ctx.tree.get(bodyPath);
  if (!isRegularBlob(bodyEntry)) return reject('retained body missing or not regular');
  const compressedBody = showBlob(ctx.lane, ctx.rev, bodyPath);
  if (compressedBody === null) return reject('cannot read retained body');
  if (typeof r.bodyGzipSha256 !== 'string' || !/^[0-9a-f]{64}$/i.test(r.bodyGzipSha256)
    || r.bodyGzipSha256 !== sha256(compressedBody)
    || r.bodyGzipBytes !== compressedBody.length) {
    return reject('retained body gzip digest/length mismatch');
  }
  if (typeof r.bytes !== 'number' || !Number.isInteger(r.bytes) || r.bytes < 0 || r.bytes > MAX_BODY_BYTES) {
    return reject('retained body byte length invalid');
  }
  let bodyBytes;
  try {
    bodyBytes = gunzipSync(compressedBody, { maxOutputLength: MAX_BODY_BYTES });
  } catch {
    return reject('retained body gzip invalid');
  }
  if (bodyBytes.length !== r.bytes || sha256(bodyBytes) !== r.sha256) return reject('retained body sha256/length mismatch');
  if (r.row === 'S029' && !bodyBytes.equals(ctx.s029Bytes)) return reject('retained S029 body differs from pinned git object');
  if (r.row === 'S026' && !stackExchangeAnswerMatches(row, r.rowUrl, bodyBytes, r.quote)) {
    return reject('S026 API answer does not match row anchor');
  }
  let expectedExcerpt;
  try {
    expectedExcerpt = sourceExcerpt(bodyBytes, r.decode, r.quote);
  } catch {
    return reject('retained body decode failed');
  }
  if (!expectedExcerpt) return reject('quote not in retained body');
  if (r.quoteOffset !== expectedExcerpt.offset) return reject('quote offset differs from retained body');

  if (typeof r.excerpt !== 'string' || r.excerpt !== `${r.row}.excerpt.txt`) return reject('excerpt filename mismatch');
  const excerptPath = `${RECEIPT_DIR}/${r.excerpt}`;
  const excerptEntry = ctx.tree.get(excerptPath);
  if (!isRegularBlob(excerptEntry)) return reject('excerpt file missing or not regular');
  const excerpt = showBlob(ctx.lane, ctx.rev, excerptPath);
  if (excerpt === null) return reject('cannot read excerpt blob');
  if (typeof r.excerptSha256 !== 'string' || r.excerptSha256 !== sha256(excerpt)) return reject('excerpt sha mismatch');
  const excerptText = excerpt.toString('utf8');
  if (r.decode === 'html-text' && /<\/?(?:script|style)\b[^>]*>/i.test(excerptText)) return reject('script/style markup in html-text excerpt');
  if (!normalize(excerptText).includes(normalize(r.quote))) return reject('quote not in excerpt');
  if (!excerpt.equals(expectedExcerpt.bytes)) return reject('excerpt differs from retained body window');
  return { accepted: true, receipt: r, file, fetchUrl };
}

function liveCheck(receipts, ctx) {
  const failures = [];
  const notHttp = [];
  let liveHeld = 0;
  for (const item of receipts) {
    const r = item.receipt;
    const file = item.file;
    let bytes;
    let httpStatus = null;
    if (r.row === 'S029') {
      bytes = ctx.s029Bytes;
    } else {
      if (!isHttpUrl(item.fetchUrl)) {
        notHttp.push({ file, reason: 'not_http' });
        continue;
      }
      const dir = mkdtempSync(join(tmpdir(), 'tabi-r18-live-'));
      try {
        const out = join(dir, 'body');
        const argv = ['-sSL', '--compressed', '--max-time', '90', '-A', CURL_USER_AGENT, '-o', out, '-w', '%{http_code}', item.fetchUrl];
        let fetched;
        try {
          fetched = run('curl', argv, { encoding: 'utf8' });
        } catch (error) {
          failures.push({ file, reason: `curl failed: ${error.message}` });
          continue;
        }
        httpStatus = Number(fetched.stdout.toString('utf8').trim()) || null;
        if (fetched.status !== 0 || !existsSync(out)) {
          failures.push({ file, reason: `curl failed (exit ${fetched.status})` });
          continue;
        }
        bytes = readFileSync(out);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
      if (httpStatus !== 200) {
        failures.push({ file, reason: `live httpStatus ${httpStatus ?? 'unknown'}` });
        continue;
      }
    }
    if (r.row === 'S026' && !stackExchangeAnswerMatches(ctx.sources.rows.get(r.row), r.rowUrl, bytes, r.quote)) {
      failures.push({ file, reason: 'live S026 API answer identity mismatch' });
      continue;
    }
    let body;
    try {
      body = decodeBody(bytes, r.decode);
    } catch (error) {
      failures.push({ file, reason: `live decode failed: ${error.message}` });
      continue;
    }
    if (!normalize(body).includes(normalize(r.quote))) {
      failures.push({ file, reason: 'live quote not found' });
      continue;
    }
    liveHeld++;
  }
  return { checked: receipts.length, live_held: liveHeld, failures, not_http: notHttp };
}

function countRevision(laneOption, requestedRev, live) {
  const lane = resolveLane(laneOption);
  const rev = resolveRevision(lane, requestedRev);
  const baselineBytes = showBlob(lane, C1_BASELINE_REV, SOURCES_PATH);
  if (baselineBytes === null) throw new Error(`missing baseline ${SOURCES_PATH} at ${C1_BASELINE_REV}`);
  const baseline = parseSources(baselineBytes);
  if (baseline.duplicates.size) throw new Error('duplicate row ids in baseline SOURCES.md');
  const cohortIds = new Set([...baseline.rows.keys()].filter(row => !SUPERSEDED.has(row)));
  if (cohortIds.size !== BASELINE_ELIGIBLE_ROWS) {
    throw new Error(`baseline eligible cohort changed: expected ${BASELINE_ELIGIBLE_ROWS}, found ${cohortIds.size}`);
  }
  for (const id of cohortIds) {
    if (!sourceRowValid(baseline.rows.get(id))) throw new Error(`invalid baseline source row ${id}`);
  }

  const sourcesBytes = showBlob(lane, rev, SOURCES_PATH);
  if (sourcesBytes === null) throw new Error(`missing ${SOURCES_PATH} at ${rev}`);
  const sources = parseSources(sourcesBytes);
  const entries = listTree(lane, rev);
  const { parsed, tree, rowCounts } = receiptRows(entries, lane, rev);
  let producerSha256 = null;
  if (parsed.length) {
    const producerBytes = showBlob(lane, rev, PRODUCER_PATH);
    if (producerBytes === null) throw new Error(`missing ${PRODUCER_PATH} at ${rev} with receipts to evaluate`);
    producerSha256 = sha256(producerBytes);
  }
  let s029Bytes = null;
  if (parsed.some(item => item.value?.row === 'S029')) {
    s029Bytes = showBlob(lane, S029_SOURCE_REV, S029_SOURCE_PATH);
    if (s029Bytes === null) throw new Error(`missing pinned S029 source ${S029_SOURCE_REV}:${S029_SOURCE_PATH}`);
    if (sha256(s029Bytes) !== S029_SOURCE_SHA256) throw new Error('pinned S029 source digest mismatch');
  }
  const ctx = { lane, rev, sources, tree, rowCounts, cohortIds, producerSha256, s029Bytes };
  const accepted = [];
  const rejected = [];
  for (const item of parsed) {
    const result = evaluateReceipt(item, ctx);
    if (result.accepted) accepted.push(result);
    else rejected.push(result.rejection);
  }
  const cohortRows = new Map([...cohortIds].flatMap(id => sources.rows.has(id) ? [[id, sources.rows.get(id)]] : []));
  const countedRows = new Map(accepted.map(item => [item.receipt.row, sources.rows.get(item.receipt.row)]));
  const ownWorkReceipts = accepted.filter(item => sources.rows.get(item.receipt.row)?.kind === 'own-work').length;
  const held = accepted.filter(item => item.receipt.teachesVerdict === 'held' && sources.rows.get(item.receipt.row)?.kind !== 'own-work').length;
  const driftSuperseded = accepted.filter(item => item.receipt.teachesVerdict === 'drift' && sources.rows.get(item.receipt.row)?.kind !== 'own-work').length;
  return {
    rev,
    freshness_scope: 'round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate',
    c1_rows_rechecked: accepted.length,
    eligible_rows: cohortIds.size,
    held,
    drift_superseded: driftSuperseded,
    own_work: ownWorkReceipts,
    row_classes: {
      all_registry: rowClassBucket(sources.rows),
      eligible_cohort: rowClassBucket(cohortRows, cohortIds.size),
      receipts: rowClassBucket(countedRows, accepted.length),
    },
    rejected,
    live: live ? liveCheck(accepted, ctx) : null,
    counterSha256: sha256(readFileSync(scriptPath)),
  };
}

function parseArgs(argv) {
  const options = { live: false, selfTest: false, lane: null, rev: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--live') options.live = true;
    else if (arg === '--self-test') options.selfTest = true;
    else if (arg === '--lane') {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error('--lane requires a path');
      options.lane = argv[++i];
    } else if (arg.startsWith('--')) throw new Error(`unknown option ${arg}`);
    else if (options.rev === null) options.rev = arg;
    else throw new Error(`unexpected argument ${arg}`);
  }
  if (options.live && options.selfTest) throw new Error('--live cannot be combined with --self-test');
  if (!options.selfTest && !options.rev) throw new Error('REV is required');
  return options;
}

function fixtureSources(marker) {
  const row = (id, url, kind = 'docs', anchor = 'anchor') => `| ${id} | Fixture source — ${url} | ${kind} | A | test | ${anchor} | fixture claim | mined | 2026-10-20 | on-release | — |`;
  return [
    `<!-- ${marker} -->`,
    '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    row('S001', 'https://fixture.invalid/S001'),
    row('S004', 'https://fixture.invalid/S004'),
    row('S016', 'https://playwright.dev/docs/test-assertions'),
    row('S022', 'https://ieeexplore.ieee.org/document/10989021/'),
    row('S026', 'https://stackoverflow.com/questions/74920905/how-to-give-fixed-wait-in-playwright-without-any-condition-like-we-had-in-cypress', 'community', 'answer 74926242, 2022-12-27'),
    row('S029', S029_SOURCE_PATH, 'own-work'),
    row('S030', 'https://github.com/example/repo/blob/main/README.md'),
    row('S033', 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/example.txt'),
    '',
  ].join('\n');
}

function runFixtureCase(repo, counterBytes, caseName, inputReceipts, options = {}) {
  const sourceRoot = join(repo, 'corpus');
  const evidenceRoot = join(sourceRoot, 'evidence', 'round-18', 'source-recheck');
  const waveRoot = join(repo, '.ufo', 'waves', 'round-18');
  rmSync(evidenceRoot, { recursive: true, force: true });
  mkdirp(sourceRoot);
  mkdirp(evidenceRoot);
  mkdirp(waveRoot);
  writeFileSync(join(sourceRoot, 'SOURCES.md'), options.sourcesText ?? fixtureSources(caseName));
  writeFileSync(join(waveRoot, 'recheck-fetch.mjs'), '// self-test fixture producer\n');
  writeFileSync(join(waveRoot, 'measure-c1.mjs'), counterBytes);
  for (const [sourcePath, bytes] of Object.entries(options.sourceFiles ?? {})) {
    const target = join(repo, sourcePath);
    mkdirp(dirname(target));
    writeFileSync(target, bytes);
  }
  for (const item of inputReceipts) {
    const file = join(evidenceRoot, item.file);
    const excerptName = item.receipt.excerpt;
    writeFileSync(file, `${JSON.stringify(item.receipt, null, 2)}\n`);
    if (excerptName && !item.omitExcerpt) writeFileSync(join(evidenceRoot, excerptName), item.excerptBytes);
    if (!item.omitBody) {
      const bodyBytes = item.bodyBytes
        ?? (item.receipt.row === 'S029'
          ? showBlob(repo, S029_SOURCE_REV, S029_SOURCE_PATH)
          : Buffer.from(`Fixture body: ${item.receipt.quote}`, 'utf8'));
      if (!bodyBytes) throw new Error(`${caseName}: fixture body unavailable for ${item.receipt.row}`);
      writeFileSync(join(evidenceRoot, item.receipt.bodyPath), gzipSync(bodyBytes, { mtime: 0 }));
    }
  }
  const add = git(repo, ['add', '--all'], { allowFailure: true });
  if (add.status !== 0) throw new Error(`fixture git add failed: ${add.stderr.toString('utf8').trim()}`);
  const commit = git(repo, ['commit', '--quiet', '-m', `fixture ${caseName}`], { allowFailure: true });
  if (commit.status !== 0) throw new Error(`fixture git commit failed: ${commit.stderr.toString('utf8').trim()}`);
  const revResult = git(repo, ['rev-parse', '--verify', 'HEAD']);
  const rev = revResult.stdout.toString('utf8').trim();
  if (options.replaceBaseline) {
    writeFileSync(join(sourceRoot, 'SOURCES.md'), fixtureSources(`replace-ref poison ${caseName}`));
    const poisonAdd = git(repo, ['add', '--', SOURCES_PATH], { allowFailure: true });
    if (poisonAdd.status !== 0) throw new Error(`replace-ref fixture git add failed: ${poisonAdd.stderr.toString('utf8').trim()}`);
    const poisonCommit = git(repo, ['commit', '--quiet', '-m', `replace-ref poison ${caseName}`], { allowFailure: true });
    if (poisonCommit.status !== 0) throw new Error(`replace-ref fixture commit failed: ${poisonCommit.stderr.toString('utf8').trim()}`);
    const replacement = git(repo, ['rev-parse', '--verify', 'HEAD']).stdout.toString('utf8').trim();
    const replaced = git(repo, ['replace', C1_BASELINE_REV, replacement], { allowFailure: true });
    if (replaced.status !== 0) throw new Error(`replace-ref fixture failed: ${replaced.stderr.toString('utf8').trim()}`);
  }
  const counterPath = join(waveRoot, 'measure-c1.mjs');
  const args = [counterPath, rev, ...(options.live ? ['--live'] : [])];
  const childOptions = options.childEnv ? { env: { ...process.env, ...options.childEnv } } : {};
  const executed = run(process.execPath, args, childOptions);
  if (executed.status !== 0) throw new Error(`${caseName}: counter exit ${executed.status}: ${executed.stderr.toString('utf8').trim()}`);
  const lines = executed.stdout.toString('utf8').trim().split('\n');
  if (lines.length !== 1) throw new Error(`${caseName}: expected one JSON line, got ${lines.length}`);
  return JSON.parse(lines[0]);
}

function mkdirp(path) {
  mkdirSync(path, { recursive: true });
}

function selfTest() {
  const temp = mkdtempSync(join(tmpdir(), 'tabi-r18-c1-self-test-'));
  const counterBytes = readFileSync(scriptPath);
  const producerBytes = Buffer.from('// self-test fixture producer\n');
  const producerSha256 = sha256(producerBytes);
  const quote = 'A precise fixture quote';
  const fixtureBodyBytes = Buffer.from(`Fixture body: ${quote}`, 'utf8');
  const fixtureWindow = sourceExcerpt(fixtureBodyBytes, 'none', quote);
  const excerptBytes = fixtureWindow.bytes;
  const repo = join(temp, 'repo');
  mkdirp(repo);
  const init = git(repo, ['init', '--quiet'], { allowFailure: true });
  if (init.status !== 0) throw new Error(`fixture git init failed: ${init.stderr.toString('utf8').trim()}`);
  for (const [key, value] of [['user.name', 'C1 self-test'], ['user.email', 'c1-self-test@example.invalid']]) {
    const configured = git(repo, ['config', key, value], { allowFailure: true });
    if (configured.status !== 0) throw new Error(`fixture git config failed: ${configured.stderr.toString('utf8').trim()}`);
  }
  const poisonRepo = join(temp, 'poison');
  mkdirp(poisonRepo);
  const poisonInit = git(poisonRepo, ['init', '--quiet'], { allowFailure: true });
  if (poisonInit.status !== 0) throw new Error(`poison fixture git init failed: ${poisonInit.stderr.toString('utf8').trim()}`);
  for (const [key, value] of [['user.name', 'C1 poison fixture'], ['user.email', 'c1-poison@example.invalid']]) {
    const configured = git(poisonRepo, ['config', key, value], { allowFailure: true });
    if (configured.status !== 0) throw new Error(`poison fixture git config failed: ${configured.stderr.toString('utf8').trim()}`);
  }
  mkdirp(join(poisonRepo, dirname(SOURCES_PATH)));
  writeFileSync(join(poisonRepo, SOURCES_PATH), fixtureSources('poison repository'));
  const poisonAdd = git(poisonRepo, ['add', '--all'], { allowFailure: true });
  if (poisonAdd.status !== 0) throw new Error(`poison fixture git add failed: ${poisonAdd.stderr.toString('utf8').trim()}`);
  const poisonCommit = git(poisonRepo, ['commit', '--quiet', '-m', 'poison repository'], { allowFailure: true });
  if (poisonCommit.status !== 0) throw new Error(`poison fixture git commit failed: ${poisonCommit.stderr.toString('utf8').trim()}`);
  const poisonEnv = {
    GIT_DIR: join(poisonRepo, '.git'),
    GIT_WORK_TREE: poisonRepo,
    GIT_INDEX_FILE: join(poisonRepo, '.git', 'index'),
    GIT_COMMON_DIR: join(poisonRepo, '.git'),
    GIT_OBJECT_DIRECTORY: join(poisonRepo, '.git', 'objects'),
    GIT_ALTERNATE_OBJECT_DIRECTORIES: join(poisonRepo, '.git', 'objects'),
    GIT_NAMESPACE: 'poison',
    GIT_NO_REPLACE_OBJECTS: '0',
    GIT_GRAFT_FILE: join(poisonRepo, '.git', 'info', 'grafts'),
    GIT_CONFIG_NOSYSTEM: '0',
    GIT_CONFIG_GLOBAL: join(poisonRepo, 'global.gitconfig'),
  };
  const lane = resolveLane(null);
  const pinFetch = git(repo, ['fetch', '--no-tags', lane, S029_SOURCE_REV], { allowFailure: true });
  if (pinFetch.status !== 0) throw new Error(`fixture could not fetch pinned S029 object: ${pinFetch.stderr.toString('utf8').trim()}`);
  const baselineFetch = git(repo, ['fetch', '--no-tags', lane, C1_BASELINE_REV], { allowFailure: true });
  if (baselineFetch.status !== 0) throw new Error(`fixture could not fetch baseline cohort: ${baselineFetch.stderr.toString('utf8').trim()}`);
  const s029Bytes = showBlob(repo, S029_SOURCE_REV, S029_SOURCE_PATH);
  if (s029Bytes === null || sha256(s029Bytes) !== S029_SOURCE_SHA256) throw new Error('fixture pinned S029 source mismatch');
  const s029Text = s029Bytes.toString('utf8');
  const s029NeedleAt = s029Text.indexOf('"listeningAfter": false');
  if (s029NeedleAt < 0) throw new Error('fixture pinned S029 quote anchor missing');
  const s029Quote = normalize(s029Text.slice(Math.max(0, s029NeedleAt - 60), s029NeedleAt + 50));
  const s029Excerpt = sourceExcerpt(s029Bytes, 'none', s029Quote);
  if (!s029Excerpt) throw new Error('fixture could not derive pinned S029 excerpt');

  function makeReceipt(row = 'S001', overrides = {}) {
    const { bodyBytes: rawBodyOverride, ...fields } = overrides;
    const url = `https://fixture.invalid/${row}`;
    const receiptQuote = fields.quote ?? quote;
    const decode = fields.decode ?? 'none';
    const rawBody = rawBodyOverride ?? Buffer.from(`Fixture body: ${receiptQuote}`, 'utf8');
    const compressedBody = gzipSync(rawBody, { mtime: 0 });
    const window = sourceExcerpt(rawBody, decode, receiptQuote);
    const base = {
      schema: 'tabi-source-recheck-v1',
      row,
      rowUrl: url,
      url,
      command: expectedCurlCommand(url),
      fetchedAt: '2026-10-20T12:00:00.000Z',
      httpStatus: 200,
      bytes: rawBody.length,
      sha256: sha256(rawBody),
      bodyPath: `${row}.body.gz`,
      bodyGzipBytes: compressedBody.length,
      bodyGzipSha256: sha256(compressedBody),
      decode,
      quote: receiptQuote,
      quoteWords: wordCount(receiptQuote),
      quoteFound: Boolean(window),
      quoteOffset: window?.offset ?? -1,
      excerpt: `${row}.excerpt.txt`,
      excerptSha256: window ? sha256(window.bytes) : sha256(Buffer.alloc(0)),
      teachesVerdict: 'held',
      producerSha256,
    };
    return { ...base, ...fields };
  }

  function makeS029Receipt(overrides = {}) {
    return makeReceipt('S029', {
      rowUrl: S029_SOURCE_PATH,
      bodyBytes: s029Bytes,
      url: S029_SOURCE_PATH,
      command: expectedS029Command(),
      httpStatus: null,
      bytes: s029Bytes.length,
      sha256: S029_SOURCE_SHA256,
      decode: 'none',
      quote: s029Quote,
      quoteWords: wordCount(s029Quote),
      quoteOffset: s029Excerpt.offset,
      excerpt: 'S029.excerpt.txt',
      excerptSha256: sha256(s029Excerpt.bytes),
      ...overrides,
    });
  }

  const s016RowUrl = 'https://playwright.dev/docs/test-assertions';
  const s016WrongUrl = 'https://playwright.dev/docs/test-retries';
  const githubRowUrl = 'https://github.com/example/repo/blob/main/README.md';
  const githubFetchUrl = 'https://raw.githubusercontent.com/example/repo/main/README.md';
  const gitilesRowUrl = 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/example.txt';
  const gitilesFetchUrl = `${gitilesRowUrl}?format=TEXT`;
  const ieeeRowUrl = 'https://ieeexplore.ieee.org/document/10989021/';
  const ieeeFetchUrl = 'https://ieeexplore.ieee.org/abstract/document/10989021';
  const stackRowUrl = 'https://stackoverflow.com/questions/74920905/how-to-give-fixed-wait-in-playwright-without-any-condition-like-we-had-in-cypress';
  const stackFetchUrl = 'https://api.stackexchange.com/2.3/answers/74926242?site=stackoverflow&filter=withbody';

  function makeStackReceipt(rowUrl = stackRowUrl, url = stackFetchUrl, answerId = '74926242', questionId = '74920905') {
    const bodyBytes = Buffer.from(JSON.stringify({
      items: [{ answer_id: Number(answerId), question_id: Number(questionId), body: `<p>Fixture body: ${quote}</p>` }],
    }), 'utf8');
    const window = sourceExcerpt(bodyBytes, 'html-text', quote);
    return {
      receipt: makeReceipt('S026', { rowUrl, url, command: expectedCurlCommand(url), decode: 'html-text', bodyBytes }),
      bodyBytes,
      excerptBytes: window.bytes,
    };
  }
  const wrongRevisionBytes = Buffer.from('target revision bytes that are not the pinned S029 source');
  const wrongRevisionQuote = 'target revision bytes that are not the pinned S029 source';
  const wrongRevisionExcerpt = sourceExcerpt(wrongRevisionBytes, 'none', wrongRevisionQuote);
  const baselineSourceBytes = showBlob(lane, C1_BASELINE_REV, SOURCES_PATH);
  if (baselineSourceBytes === null) throw new Error('fixture could not read baseline SOURCES.md');
  const baselineSources = parseSources(baselineSourceBytes);
  const fullEligibleRows = [...baselineSources.rows.keys()].filter(row => !SUPERSEDED.has(row)).length;
  if (fullEligibleRows !== 51) throw new Error(`expected 51 baseline eligible rows, found ${fullEligibleRows}`);
  const fullReceipts = [];
  for (const row of baselineSources.rows.values()) {
    if (SUPERSEDED.has(row.id)) continue;
    if (row.id === 'S029') {
      fullReceipts.push({ file: 'S029.json', receipt: makeS029Receipt(), excerptBytes: s029Excerpt.bytes });
      continue;
    }
    const rowUrl = sourceHttpUrls(row.source)[0];
    const mapping = rowUrl && canonicalFetchTarget(row, rowUrl);
    if (!mapping) throw new Error(`no canonical fixture URL for ${row.id}`);
    if (row.id === 'S026') {
      const questionId = new URL(rowUrl).pathname.match(/^\/questions\/(\d+)(?:\/|$)/)?.[1];
      const answerId = row.anchor.match(/\banswer\s+(\d+)\b/i)?.[1];
      if (!questionId || !answerId) throw new Error('baseline S026 identity fields are missing');
      fullReceipts.push({ file: 'S026.json', ...makeStackReceipt(rowUrl, mapping.canonical, answerId, questionId) });
      continue;
    }
    fullReceipts.push({
      file: `${row.id}.json`,
      receipt: makeReceipt(row.id, { rowUrl, url: mapping.canonical, command: expectedCurlCommand(mapping.canonical) }),
      excerptBytes,
    });
  }
  const growthRows = [];
  const growthReceipts = [];
  for (let number = 58; number <= 64; number++) {
    const id = `S${String(number).padStart(3, '0')}`;
    const url = `https://fixture.invalid/${id}`;
    growthRows.push(`| ${id} | New source — ${url} | docs | A | test | anchor | fixture claim | mined | 2026-10-20 | on-release | — |`);
    growthReceipts.push({
      file: `${id}.json`,
      receipt: makeReceipt(id, { rowUrl: url, url, command: expectedCurlCommand(url) }),
      excerptBytes,
    });
  }
  const expandedSourcesText = `${baselineSourceBytes.toString('utf8').trimEnd()}\n${growthRows.join('\n')}\n`;
  const s016FixtureLine = '| S016 | Fixture source — https://playwright.dev/docs/test-assertions | docs | A | test | anchor | fixture claim | mined | 2026-10-20 | on-release | — |';
  const invalidSourceText = field => fixtureSources(`invalid ${field}`).replace(
    s016FixtureLine,
    s016FixtureLine.replace(` | ${field === 'status' ? 'mined' : field === 'kind' ? 'docs' : 'A'} |`, ` | ${field === 'status' ? 'not-a-status' : field === 'kind' ? 'not-a-kind' : 'Z'} |`),
  );
  const malformedSourceText = fixtureSources('malformed source').replace(
    s016FixtureLine,
    '| S016 | Fixture source — https://playwright.dev/docs/test-assertions | docs | A | test | anchor | fixture claim |',
  );

  function makeS016Receipt(overrides = {}) {
    return makeReceipt('S016', {
      rowUrl: s016RowUrl,
      url: s016RowUrl,
      command: expectedCurlCommand(s016RowUrl),
      ...overrides,
    });
  }

  const cases = [
    {
      name: 'all 51 eligible baseline rows',
      expectedCount: 51,
      expectedOwnWork: 1,
      expectedEligibleRows: 51,
      expectedRowClasses: {
        all_registry: { row_count: 57 },
        eligible_cohort: { row_count: 51, present_rows: 51 },
        receipts: { row_count: 51, present_rows: 51 },
      },
      sourcesText: baselineSourceBytes.toString('utf8'),
      receipts: () => fullReceipts,
    },
    {
      name: 'seven new rows do not grow cohort',
      expectedCount: 51,
      expectedOwnWork: 1,
      expectedEligibleRows: 51,
      expectedRejectedCount: 7,
      expectedRejectedReason: 'row outside fixed B cohort',
      expectedRowClasses: {
        all_registry: { row_count: 64 },
        eligible_cohort: { row_count: 51, present_rows: 51 },
        receipts: { row_count: 51, present_rows: 51 },
      },
      sourcesText: expandedSourcesText,
      receipts: () => [...fullReceipts, ...growthReceipts],
    },
    { name: 'wrong producer sha', expected: 'wrong producer sha', receipts: () => [{ file: 'S001.json', receipt: makeReceipt('S001', { producerSha256: '0'.repeat(64) }), excerptBytes }] },
    { name: 'quote not in excerpt', expected: 'quote not in excerpt', receipts: () => [{ file: 'S001.json', receipt: makeReceipt('S001', { excerptSha256: sha256(Buffer.from('different quote\n')) }), excerptBytes: Buffer.from('different quote\n') }] },
    { name: 'excerpt sha mismatch', expected: 'excerpt sha mismatch', receipts: () => [{ file: 'S001.json', receipt: makeReceipt(), excerptBytes: Buffer.from(`prefix ${quote}\n`) }] },
    { name: 'quoteWords >25', expected: 'quoteWords >25', receipts: () => {
      const longQuote = Array(26).fill('word').join(' ');
      const bytes = Buffer.from(`${longQuote}\n`);
      return [{ file: 'S001.json', receipt: makeReceipt('S001', { quote: longQuote, quoteWords: 26, excerptSha256: sha256(bytes) }), excerptBytes: bytes }];
    } },
    { name: 'quoteWords mismatch', expected: 'quoteWords mismatch', receipts: () => [{ file: 'S001.json', receipt: makeReceipt('S001', { quoteWords: 1 }), excerptBytes }] },
    { name: 'rowUrl not in row', expected: 'rowUrl not in row', receipts: () => [{ file: 'S001.json', receipt: makeReceipt('S001', { rowUrl: 'https://fixture.invalid/other' }), excerptBytes }] },
    { name: 'wrong URL S016 unrelated', expected: 'fetch URL does not match row URL', receipts: () => [{
      file: 'S016.json',
      receipt: makeReceipt('S016', { rowUrl: s016RowUrl, url: s016WrongUrl, command: expectedCurlCommand(s016WrongUrl) }),
      excerptBytes,
    }] },
    { name: 'arbitrary host', expected: 'fetch URL does not match row URL', receipts: () => [{
      file: 'S016.json',
      receipt: makeReceipt('S016', { rowUrl: s016RowUrl, url: 'https://attacker.invalid/test-assertions', command: expectedCurlCommand('https://attacker.invalid/test-assertions') }),
      excerptBytes,
    }] },
    { name: 'body override command', expected: 'fetch command is not canonical curl', receipts: () => [{
      file: 'S001.json',
      receipt: makeReceipt('S001', { command: 'caller-supplied body' }),
      excerptBytes,
    }] },
    { name: 'html-text script wrapper excerpt', expected: 'script/style markup in html-text excerpt', receipts: () => {
      const bytes = Buffer.from(`<script>${quote}</script>\n`);
      return [{
        file: 'S016.json',
        receipt: makeS016Receipt({ decode: 'html-text', excerptSha256: sha256(bytes) }),
        excerptBytes: bytes,
      }];
    } },
    { name: 'zero raw body SHA', expected: 'retained body sha256/length mismatch', receipts: () => [{
      file: 'S001.json',
      receipt: makeReceipt('S001', { sha256: '0'.repeat(64) }),
      excerptBytes,
    }] },
    { name: 'script-only receipt', expected: 'retained body missing or not regular', receipts: () => [{
      file: 'S001.json',
      receipt: makeReceipt('S001'),
      excerptBytes,
      omitBody: true,
    }] },
    { name: 'substituted retained body', expected: 'retained body gzip digest/length mismatch', receipts: () => [{
      file: 'S001.json',
      receipt: makeReceipt('S001'),
      excerptBytes,
      bodyBytes: Buffer.from('substituted body without the source quote'),
    }] },
    { name: 'invalid source status', expected: 'invalid source row kind/status/tier or shape', sourcesText: invalidSourceText('status'), receipts: () => [{ file: 'S016.json', receipt: makeS016Receipt(), excerptBytes }] },
    { name: 'invalid source kind', expected: 'invalid source row kind/status/tier or shape', sourcesText: invalidSourceText('kind'), receipts: () => [{ file: 'S016.json', receipt: makeS016Receipt(), excerptBytes }] },
    { name: 'invalid source tier', expected: 'invalid source row kind/status/tier or shape', sourcesText: invalidSourceText('tier'), receipts: () => [{ file: 'S016.json', receipt: makeS016Receipt(), excerptBytes }] },
    { name: 'malformed source row shape', expected: 'invalid source row kind/status/tier or shape', sourcesText: malformedSourceText, receipts: () => [{ file: 'S016.json', receipt: makeS016Receipt(), excerptBytes }] },
    { name: 'allowed URL transformations', expectedCount: 4, receipts: () => [
      { file: 'S030.json', receipt: makeReceipt('S030', { rowUrl: githubRowUrl, url: githubFetchUrl, command: expectedCurlCommand(githubFetchUrl) }), excerptBytes },
      { file: 'S033.json', receipt: makeReceipt('S033', { rowUrl: gitilesRowUrl, url: gitilesFetchUrl, command: expectedCurlCommand(gitilesFetchUrl) }), excerptBytes },
      { file: 'S022.json', receipt: makeReceipt('S022', { rowUrl: ieeeRowUrl, url: ieeeFetchUrl, command: expectedCurlCommand(ieeeFetchUrl) }), excerptBytes },
      { file: 'S026.json', ...makeStackReceipt(stackRowUrl, stackFetchUrl) },
    ] },
    { name: 'S026 wrong question id', expected: 'S026 API answer does not match row anchor', receipts: () => [{
      file: 'S026.json',
      ...makeStackReceipt(stackRowUrl, stackFetchUrl, '74926242', '99999999'),
    }] },
    { name: 'S026 wrong answer id', expected: 'S026 API answer does not match row anchor', receipts: () => [{
      file: 'S026.json',
      ...makeStackReceipt(stackRowUrl, stackFetchUrl, '99999999', '74920905'),
    }] },
    { name: 'normalized direct URL', expectedCount: 1, receipts: () => [{
      file: 'S001.json',
      receipt: makeReceipt('S001', { url: 'https://fixture.invalid/S001/#section', command: expectedCurlCommand('https://fixture.invalid/S001/#section') }),
      excerptBytes,
    }] },
    { name: 'inherited GIT_DIR redirection ignored', expectedCount: 1, childEnv: poisonEnv, receipts: () => [{ file: 'S001.json', receipt: makeReceipt(), excerptBytes }] },
    { name: 'replace-ref baseline poison ignored', expectedCount: 1, replaceBaseline: true, receipts: () => [{ file: 'S001.json', receipt: makeReceipt(), excerptBytes }] },
    { name: 'superseded row', expected: 'superseded row', receipts: () => [{ file: 'S004.json', receipt: makeReceipt('S004'), excerptBytes }] },
    { name: 'unknown row', expected: 'unknown row', receipts: () => [{ file: 'S099.json', receipt: makeReceipt('S099'), excerptBytes }] },
    { name: 'drift without superseding row', expected: 'drift without superseding row', receipts: () => [{ file: 'S001.json', receipt: makeReceipt('S001', { teachesVerdict: 'drift' }), excerptBytes }] },
    { name: 'duplicate row receipt', expected: 'duplicate row receipt', receipts: () => [
      { file: 'S001.json', receipt: makeReceipt('S001'), excerptBytes },
      { file: 'S001-copy.json', receipt: makeReceipt('S001'), excerptBytes },
    ] },
    { name: 'wrong fetchedAt date', expected: 'wrong fetchedAt date', receipts: () => [{ file: 'S001.json', receipt: makeReceipt('S001', { fetchedAt: '2026-10-19T23:59:59.000Z' }), excerptBytes }] },
    { name: 'non-64-hex sha', expected: 'sha256 is not 64-hex', receipts: () => [{ file: 'S001.json', receipt: makeReceipt('S001', { sha256: '1234' }), excerptBytes }] },
    { name: 'httpStatus != 200', expected: 'httpStatus != 200', receipts: () => [{ file: 'S001.json', receipt: makeReceipt('S001', { httpStatus: 404 }), excerptBytes }] },
    { name: 'honest receipt', expectedCount: 1, receipts: () => [{ file: 'S001.json', receipt: makeReceipt(), excerptBytes }] },
    { name: 'forged S029 sha', expected: 'S029 sha256 does not match pinned git object', receipts: () => [{
      file: 'S029.json',
      receipt: makeS029Receipt({ sha256: '0'.repeat(64) }),
      excerptBytes: s029Excerpt.bytes,
    }] },
    { name: 'wrong git revision/path', expected: 'S029 sha256 does not match pinned git object', receipts: () => [{
      file: 'S029.json',
      receipt: makeS029Receipt({
        bodyBytes: wrongRevisionBytes,
        bytes: wrongRevisionBytes.length,
        sha256: sha256(wrongRevisionBytes),
        quote: wrongRevisionQuote,
        quoteWords: wordCount(wrongRevisionQuote),
        quoteOffset: wrongRevisionExcerpt.offset,
        excerptSha256: sha256(wrongRevisionExcerpt.bytes),
      }),
      excerptBytes: wrongRevisionExcerpt.bytes,
      bodyBytes: wrongRevisionBytes,
    }], sourceFiles: { [S029_SOURCE_PATH]: wrongRevisionBytes } },
    { name: 'wrong S029 source path', expected: 'S029 source path mismatch', receipts: () => [{
      file: 'S029.json',
      receipt: makeS029Receipt({ url: 'corpus/evidence/round-13/aria/other.json' }),
      excerptBytes: s029Excerpt.bytes,
    }] },
    { name: 'S029 fabricated command description', expected: 'S029 command is not pinned git show', receipts: () => [{
      file: 'S029.json',
      receipt: makeS029Receipt({ command: 'Verified by recheck seat against local body' }),
      excerptBytes: s029Excerpt.bytes,
    }] },
    { name: 'valid S029 pinned Git object', expectedCount: 1, expectedOwnWork: 1, live: true, receipts: () => [{
      file: 'S029.json',
      receipt: makeS029Receipt(),
      excerptBytes: s029Excerpt.bytes,
    }] },
  ];

  const results = [];
  try {
    for (const test of cases) {
      const result = runFixtureCase(repo, counterBytes, test.name, test.receipts(), {
        live: test.live,
        sourceFiles: test.sourceFiles,
        sourcesText: test.sourcesText,
      });
      const countOk = result.c1_rows_rechecked === (test.expectedCount ?? 0);
      const eligibleOk = test.expectedEligibleRows === undefined || result.eligible_rows === test.expectedEligibleRows;
      const reasonOk = test.expectedRejectedCount !== undefined
        ? result.rejected.length === test.expectedRejectedCount
          && result.rejected.every(item => item.reason === test.expectedRejectedReason)
        : test.expectedCount !== undefined
          ? result.rejected.length === 0
          : result.rejected.some(item => item.reason === test.expected);
      const ownWorkOk = result.own_work === (test.expectedOwnWork ?? 0);
      const classesOk = test.expectedOwnWork === undefined
        || (result.row_classes.receipts.kind['own-work'] === 1 && result.row_classes.receipts.url.own_work === 1);
      const expectedClassesOk = !test.expectedRowClasses
        || Object.entries(test.expectedRowClasses).every(([bucket, expected]) =>
          Object.entries(expected).every(([key, value]) => result.row_classes[bucket][key] === value));
      const liveOk = !test.live || (result.live?.live_held === 1 && result.live.failures.length === 0 && result.live.not_http.length === 0);
      results.push({
        name: test.name,
        pass: countOk && eligibleOk && reasonOk && ownWorkOk && classesOk && expectedClassesOk && liveOk,
        count: result.c1_rows_rechecked,
        eligibleRows: result.eligible_rows,
        expectedCount: test.expectedCount ?? 0,
        rejectedCount: result.rejected.length,
        own_work: result.own_work,
        row_classes: result.row_classes,
        live: result.live,
        reason: test.expected ?? null,
        observedReasons: result.rejected.map(item => item.reason),
      });
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
  return { selfTest: true, cases: results, allPass: results.length === cases.length && results.every(item => item.pass) };
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
    if (options.selfTest) {
      const result = selfTest();
      process.stdout.write(`${JSON.stringify(result)}\n`);
      if (!result.allPass) process.exitCode = 1;
      return;
    }
    const result = countRevision(options.lane, options.rev, options.live);
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    console.error(`C1 counter: ${error.message}`);
    process.exitCode = 2;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(scriptPath)) main();
