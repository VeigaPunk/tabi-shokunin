// RevC1Battery v2: env-gate surface audit against the REAL frozen wrapper.
// Sections:
//  A probe   : --battery-probe per vector (gate decision)
//  B refused : wrapper --out/--scratch per vector, stopped safely at stage-2
//              mkdir (out dirname is a regular file -> ENOTDIR) so no witness
//              or driver/browser is ever spawned
//  C path    : PATH-resolved getconf in wrapper + driver (import-time)
//  D bash    : BASH_ENV/ENV on --battery (bash children)
//  E preload : LD_PRELOAD constructor log (execution vs refusal)
//  F v8cov   : NODE_V8_COVERAGE propagation into scrubbed children
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const S = '/fast/scratch/hyaku/tabi-r42/RevC1Battery';
const REPO = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const NODE = '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node';
const SELF = path.join(REPO, 'scripts/measure-c1-round41.mjs');
const DRIVER = path.join(REPO, 'scripts/playwright-firefox-egress-round41.mjs');
const SHIMLOG = path.join(S, 'shim-log.txt');
const PRELOADLOG = path.join(S, 'preload-log.txt');
// Two-mode safe stop on the measure path:
//  - out dir is a fresh scratch dir (refusal path can mkdir it and print its JSON)
//  - scratch path is a REGULAR FILE, so both the refusal path (after refuse() has
//    printed) and the proceed path stop at the stage-2 scratch mkdir, before
//    spawnWitness / the driver / any browser launch.
const OUTDIR = path.join(S, 'run');
const SCRFILE = path.join(S, 'scratchstop');
fs.rmSync(OUTDIR, { recursive: true, force: true });
fs.writeFileSync(SCRFILE, 'stop\n');
fs.mkdirSync(path.join(S, 'tmp'), { recursive: true });

const BASE = { PATH: '/usr/local/bin:/usr/bin:/bin', HOME: '/home/vgpnk', LANG: 'C', TMPDIR: path.join(S, 'tmp') };
const ALLOW = ['PATH','HOME','LANG','TZ','TMPDIR','XDG_RUNTIME_DIR','DBUS_SESSION_BUS_ADDRESS','HYAKU_SCRATCH','TABI_RUN_NONCE','USER','LOGNAME','SHELL','DISPLAY','WAYLAND_DISPLAY','XAUTHORITY','FONTCONFIG_PATH','FONTCONFIG_FILE','LC_ALL','LC_CTYPE','XDG_DATA_DIRS','XDG_CONFIG_DIRS','XDG_CACHE_HOME','XDG_CONFIG_HOME','XDG_STATE_HOME','SSH_AUTH_SOCK'];

const VECTORS = [
  ['ctl NODE_OPTIONS --require (lane fixture)', 'NODE_OPTIONS', '--require ' + REPO + '/.ufo/waves/round-41/fixtures/forger-round39.cjs'],
  ['ctl NODE_OPTIONS --experimental-loader (lane fixture)', 'NODE_OPTIONS', '--experimental-loader ' + REPO + '/.ufo/waves/round-41/fixtures/loader.mjs'],
  ['ctl NODE_OPTIONS empty value', 'NODE_OPTIONS', ''],
  ['ctl NODE_PATH', 'NODE_PATH', '/tmp/np'],
  ['ctl NODE_EXTRA_CA_CERTS', 'NODE_EXTRA_CA_CERTS', '/tmp/ca.pem'],
  ['ctl NODE_PENDING_DEPRECATION', 'NODE_PENDING_DEPRECATION', '1'],
  ['ctl LD_PRELOAD', 'LD_PRELOAD', S + '/logenv.so'],
  ['ctl LD_LIBRARY_PATH', 'LD_LIBRARY_PATH', '/tmp'],
  ['ctl LD_AUDIT', 'LD_AUDIT', S + '/audit.so'],
  ['ctl DYLD_INSERT_LIBRARIES', 'DYLD_INSERT_LIBRARIES', S + '/x.dylib'],
  ['ctl BUN_INSPECT', 'BUN_INSPECT', '1'],
  ['ctl PYTHONPATH', 'PYTHONPATH', '/tmp'],
  ['ctl PYTHONHOME', 'PYTHONHOME', '/tmp'],
  ['ctl PYTHONSTARTUP', 'PYTHONSTARTUP', S + '/site.py'],
  ['ctl RUBYOPT', 'RUBYOPT', '-r/tmp/x'],
  ['ctl RUBYLIB', 'RUBYLIB', '/tmp'],
  ['ctl PERL5OPT', 'PERL5OPT', '-Mlib'],
  ['ctl PERL5LIB', 'PERL5LIB', '/tmp'],
  ['ctl JAVA_TOOL_OPTIONS', 'JAVA_TOOL_OPTIONS', '-javaagent:/tmp/x.jar'],
  ['ctl _JAVA_OPTIONS', '_JAVA_OPTIONS', '-Xmx1m'],
  ['ctl JDK_JAVA_OPTIONS', 'JDK_JAVA_OPTIONS', '-Xmx1m'],

  ['cand BASH_ENV', 'BASH_ENV', S + '/bash-env.sh'],
  ['cand ENV', 'ENV', S + '/bash-env.sh'],
  ['cand SHELLOPTS', 'SHELLOPTS', 'xtrace'],
  ['cand BASHOPTS', 'BASHOPTS', 'extdebug'],
  ['cand GEM_HOME', 'GEM_HOME', '/tmp/gem'],
  ['cand GEM_PATH', 'GEM_PATH', '/tmp/gem'],
  ['cand BUNDLE_BIN', 'BUNDLE_BIN', '/tmp/bundle'],
  ['cand BUNDLE_GEMFILE', 'BUNDLE_GEMFILE', '/tmp/Gemfile'],
  ['cand NODE_COMPILE_CACHE', 'NODE_COMPILE_CACHE', S + '/ncc3'],
  ['cand NODE_V8_COVERAGE', 'NODE_V8_COVERAGE', S + '/nvc3'],
  ['cand PYTHONINSPECT', 'PYTHONINSPECT', '1'],
  ['cand PYTHONWARNINGS', 'PYTHONWARNINGS', 'ignore'],
  ['cand LC_ALL overload', 'LC_ALL', 'xx_YY.BOGUS@modifier'],
  ['cand LOCPATH', 'LOCPATH', '/tmp/loc'],
  ['cand NLSPATH', 'NLSPATH', '/tmp/nls/%N'],
  ['cand OPENSSL_CONF', 'OPENSSL_CONF', S + '/ossl-conf.cnf'],
  ['cand OPENSSL_MODULES', 'OPENSSL_MODULES', S + '/providers'],
  ['cand OPENSSL_ENGINES', 'OPENSSL_ENGINES', S + '/engines'],
  ['cand GLIBC_TUNABLES', 'GLIBC_TUNABLES', 'glibc.malloc.nonexistent=999'],
  ['cand NODE_TLS_REJECT_UNAUTHORIZED', 'NODE_TLS_REJECT_UNAUTHORIZED', '0'],
  ['cand NODE_DEBUG', 'NODE_DEBUG', 'http,tls'],
  ['cand NODE_NO_WARNINGS', 'NODE_NO_WARNINGS', '1'],
  ['cand MOZ_LOG', 'MOZ_LOG', 'all:5'],
  ['cand MOZ_LOG_FILE', 'MOZ_LOG_FILE', S + '/moz.log'],
  ['cand MOZ_DISABLE_CONTENT_SANDBOX', 'MOZ_DISABLE_CONTENT_SANDBOX', '1'],
  ['cand MOZ_CRASHREPORTER', 'MOZ_CRASHREPORTER', '1'],
  ['cand HTTP_PROXY', 'HTTP_PROXY', 'http://127.0.0.1:9'],
  ['cand HTTPS_PROXY', 'HTTPS_PROXY', 'http://127.0.0.1:9'],
  ['cand DEBUG (playwright)', 'DEBUG', 'pw:api'],
  ['cand PLAYWRIGHT_BROWSERS_PATH', 'PLAYWRIGHT_BROWSERS_PATH', '/tmp/pw'],
  ['cand SSH_AUTH_SOCK', 'SSH_AUTH_SOCK', '/tmp/agent.sock'],
  ['cand DBUS_SESSION_BUS_ADDRESS', 'DBUS_SESSION_BUS_ADDRESS', 'unix:path=/tmp/bus'],
  ['cand FONTCONFIG_FILE', 'FONTCONFIG_FILE', S + '/fonts.conf'],
  ['cand FONTCONFIG_PATH', 'FONTCONFIG_PATH', S + '/fcdir'],
  ['cand XDG_CONFIG_HOME', 'XDG_CONFIG_HOME', S + '/xdgcfg'],
  ['cand TMPDIR', 'TMPDIR', S + '/tmp2'],
  ['cand DISPLAY', 'DISPLAY', ':0'],
  ['cand WAYLAND_DISPLAY', 'WAYLAND_DISPLAY', 'wayland-0'],
  ['cand XAUTHORITY', 'XAUTHORITY', S + '/Xauthority'],
  ['cand TABI_RUN_NONCE', 'TABI_RUN_NONCE', 'a'.repeat(64)],
  ['cand HYAKU_SCRATCH', 'HYAKU_SCRATCH', S + '/hs'],
  ['cand SHELL', 'SHELL', '/bin/sh'],
];

function parseJson(txt) {
  for (const chunk of String(txt || '').split('\n')) {
    const t = chunk.trim();
    if (!t.startsWith('{')) continue;
    try { return JSON.parse(t); } catch { }
  }
  return null;
}
function probe(env) {
  const r = spawnSync(NODE, [SELF, '--battery-probe'], { env, encoding: 'utf8', maxBuffer: 8 << 20, timeout: 30000 });
  return { exit: r.status, json: parseJson(r.stdout) };
}
function stopped(env) {
  fs.rmSync(OUTDIR, { recursive: true, force: true });
  const r = spawnSync(NODE, [SELF, '--out', path.join(OUTDIR, 'receipt.json'), '--scratch', SCRFILE], { env, encoding: 'utf8', maxBuffer: 8 << 20, timeout: 60000 });
  const j = parseJson(r.stdout) || parseJson(r.stderr);
  return { exit: r.status, json: j, finding: j ? j.finding : null, message: j && j.message ? j.message : null };
}
function shimLog() { try { return fs.readFileSync(SHIMLOG, 'utf8').trim().split('\n').filter(Boolean); } catch { return []; } }
function clearShim() { try { fs.unlinkSync(SHIMLOG); } catch { } }

const out = { schema: 'revc1-env-surface-audit', wrapper: SELF, driver: DRIVER, node: NODE, allowList: ALLOW, probes: [], stopped: [], extras: {} };

// baseline: clean env, same two entry points
out.baseline = { probe: probe(BASE), stopped: stopped(BASE) };

for (const [id, key, value] of VECTORS) {
  const env = { ...BASE, [key]: value };
  const p = probe(env);
  const w = stopped(env);
  const row = {
    id, key, value: value.length > 90 ? value.slice(0, 87) + '...' : value,
    allowlisted: ALLOW.includes(key),
    probeExit: p.exit,
    probeContaminated: p.json ? p.json.contaminated : null,
    selfForbidden: p.json ? p.json.self.forbiddenNames : null,
    gateChildSelfForbidden: p.json && p.json.child ? p.json.child.self.forbidden : null,
    gateChildParentForbidden: p.json && p.json.child ? p.json.child.parent.forbidden : null,
    wrapperExit: w.exit,
    wrapperFinding: w.finding,
    wrapperMessage: w.message ? String(w.message).slice(0, 120) : null,
    wrapperGateSelfForbidden: w.json && w.json.gate ? w.json.gate.self.forbiddenNames : null,
  };
  out.probes.push(row);
  console.log('row', id);
}

// C: PATH shim reach (wrapper + driver import-time)
clearShim();
const sp = probe({ ...BASE, PATH: path.join(S, 'shim') + ':' + BASE.PATH });
out.extras.pathShimProbe = { exit: sp.exit, contaminated: sp.json ? sp.json.contaminated : null, shimLog: shimLog() };
clearShim();
const dr = spawnSync(NODE, [DRIVER], { env: { ...BASE, PATH: path.join(S, 'shim') + ':' + BASE.PATH }, encoding: 'utf8', timeout: 60000 });
out.extras.pathShimDriver = { exit: dr.status, stdout: (dr.stdout || '').slice(0, 300), stderr: (dr.stderr || '').slice(0, 300), shimLog: shimLog() };

// D: BASH_ENV / ENV against --battery (its bash children) and against the wrapper
{
  const marker = path.join(S, 'bash-env-marker.txt');
  try { fs.unlinkSync(marker); } catch { }
  const env = { ...BASE, BASH_ENV: path.join(S, 'bash-env.sh'), ENV: path.join(S, 'bash-env.sh') };
  const b = spawnSync(NODE, [SELF, '--battery'], { env, encoding: 'utf8', maxBuffer: 8 << 20, timeout: 120000 });
  let bj = parseJson(b.stdout);
  out.extras.bashEnvBattery = { exit: b.status, allPass: bj ? bj.allPass : null, markerExists: fs.existsSync(marker), marker: fs.existsSync(marker) ? fs.readFileSync(marker, 'utf8').trim() : null };
  const pb = probe(env);
  out.extras.bashEnvProbe = { exit: pb.exit, contaminated: pb.json ? pb.json.contaminated : null };
}

// E: LD_PRELOAD execution-vs-refusal (constructor writes its own env view)
{
  try { fs.unlinkSync(PRELOADLOG); } catch { }
  const env = { ...BASE, LD_PRELOAD: path.join(S, 'logenv.so'), SHIM_LOG: PRELOADLOG };
  const p = probe(env);
  const lines = fs.existsSync(PRELOADLOG) ? fs.readFileSync(PRELOADLOG, 'utf8').trim().split('\n') : [];
  out.extras.preloadProbe = { exit: p.exit, finding: p.json ? p.json.finding : null, constructorRan: lines.length, lines };
}

// F: NODE_V8_COVERAGE propagation into scrubbed children
{
  const dir = path.join(S, 'nvc-probe');
  spawnSync('rm', ['-rf', dir]);
  const p = probe({ ...BASE, NODE_V8_COVERAGE: dir });
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const urls = files.map((f) => {
    try { return { f, urls: [...new Set(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).result.map((r) => r.url).filter((u) => u && !u.startsWith('node:')))].slice(0, 3) }; } catch { return { f, urls: null }; }
  });
  const empty = path.join(S, 'nvc-empty');
  spawnSync('rm', ['-rf', empty]);
  const p2 = probe({ ...BASE, NODE_V8_COVERAGE: '' });
  const emptyDirAfter = fs.existsSync(empty);
  out.extras.v8Coverage = { probeExit: p.exit, files, urls, suppressionWithEmptyString: { exit: p2.exit } };
  void emptyDirAfter;
}

// G: clean --battery full run (6 cases, no browser)
{
  const b = spawnSync(NODE, [SELF, '--battery'], { env: BASE, encoding: 'utf8', maxBuffer: 8 << 20, timeout: 120000 });
  const bj = parseJson(b.stdout);
  out.extras.cleanBattery = { exit: b.status, allPass: bj ? bj.allPass : null, cases: bj ? bj.cases.map((c) => ({ c: c.case, exit: c.exit, pass: c.pass })) : null };
}

fs.writeFileSync(path.join(S, 'results.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({ wrote: 'results.json', rows: out.probes.length, extras: Object.keys(out.extras) }));
