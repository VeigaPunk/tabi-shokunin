// RevC1Battery: env-gate surface audit harness (round 42, seat RevC1Battery).
// Runs the REAL frozen wrapper for every vector in --battery-probe mode and,
// where no browser can be launched, its refused path.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const S = '/fast/scratch/hyaku/tabi-r42/RevC1Battery';
const REPO = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const NODE = '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node';
const SELF = path.join(REPO, 'scripts/measure-c1-round41.mjs');
const DRIVER = path.join(REPO, 'scripts/playwright-firefox-egress-round41.mjs');
const SCR = path.join(S, 'wscratch');
const OUT = '/proc/revc1-probe/receipt.json'; // mkdir(dirname) throws AFTER gate + digest stages, before any witness/browser spawn

fs.mkdirSync(path.join(S, 'tmp'), { recursive: true });
fs.mkdirSync(path.join(S, 'shim'), { recursive: true });

// Logging shim: records invocation into $SHIM_LOG, then delegates to the real binary.
const realGetconf = '/usr/bin/getconf';
fs.writeFileSync(path.join(S, 'shim/getconf'),
  `#!/bin/sh\necho "getconf $*" >> "${S}/shim-log.txt"\nexec ${realGetconf} "$@"\n`, { mode: 0o755 });

const BASE = {
  PATH: '/usr/local/bin:/usr/bin:/bin',
  HOME: '/home/vgpnk',
  LANG: 'C',
  TMPDIR: path.join(S, 'tmp'),
};

// kind: 'control' = name matches FORBIDDEN_ENV (must be refused);
//       'candidate' = a vector the regex does not name.
const VECTORS = [
  // ---- controls: every alternative in FORBIDDEN_ENV exercised at least once
  ['ctl NODE_OPTIONS --require', 'NODE_OPTIONS', '--require ' + S + '/forger.cjs'],
  ['ctl NODE_OPTIONS --experimental-loader', 'NODE_OPTIONS', '--experimental-loader ' + S + '/loader.mjs'],
  ['ctl NODE_OPTIONS empty value', 'NODE_OPTIONS', ''],
  ['ctl NODE_PATH', 'NODE_PATH', '/tmp/np'],
  ['ctl NODE_EXTRA_CA_CERTS', 'NODE_EXTRA_CA_CERTS', '/tmp/ca.pem'],
  ['ctl NODE_PENDING_DEPRECATION', 'NODE_PENDING_DEPRECATION', '1'],
  ['ctl LD_PRELOAD', 'LD_PRELOAD', S + '/libx.so'],
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

  // ---- candidates named in the seat brief
  ['cand BASH_ENV', 'BASH_ENV', S + '/bash-env.sh'],
  ['cand ENV', 'ENV', S + '/bash-env.sh'],
  ['cand SHELLOPTS', 'SHELLOPTS', 'xtrace'],
  ['cand BASHOPTS', 'BASHOPTS', 'extdebug'],
  ['cand GEM_HOME', 'GEM_HOME', '/tmp/gem'],
  ['cand GEM_PATH', 'GEM_PATH', '/tmp/gem'],
  ['cand BUNDLE_BIN', 'BUNDLE_BIN', '/tmp/bundle'],
  ['cand BUNDLE_GEMFILE', 'BUNDLE_GEMFILE', '/tmp/Gemfile'],
  ['cand NODE_COMPILE_CACHE', 'NODE_COMPILE_CACHE', S + '/ncc'],
  ['cand NODE_V8_COVERAGE', 'NODE_V8_COVERAGE', S + '/nvc'],
  ['cand NODE_EXTRA_CA_CERTS(dup ctl)', 'NODE_EXTRA_CA_CERTS', '/tmp/ca2.pem'],
  ['cand PYTHONINSPECT', 'PYTHONINSPECT', '1'],
  ['cand PYTHONWARNINGS', 'PYTHONWARNINGS', 'ignore'],
  ['cand LC_ALL overload', 'LC_ALL', 'xx_YY.BOGUS@modifier'],
  ['cand LOCPATH', 'LOCPATH', '/tmp/loc'],
  ['cand NLSPATH', 'NLSPATH', '/tmp/nls/%N'],

  // ---- candidates the seat argues for beyond the brief
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
  ['cand DEBUG(playwright)', 'DEBUG', 'pw:api'],
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
  ['cand PATH shim first', 'PATH', S + '/shim:/usr/local/bin:/usr/bin:/bin'],
];

const ALLOW = ['PATH', 'HOME', 'LANG', 'TZ', 'TMPDIR', 'XDG_RUNTIME_DIR', 'DBUS_SESSION_BUS_ADDRESS', 'HYAKU_SCRATCH', 'TABI_RUN_NONCE', 'USER', 'LOGNAME', 'SHELL', 'DISPLAY', 'WAYLAND_DISPLAY', 'XAUTHORITY', 'FONTCONFIG_PATH', 'FONTCONFIG_FILE', 'LC_ALL', 'LC_CTYPE', 'XDG_DATA_DIRS', 'XDG_CONFIG_DIRS', 'XDG_CACHE_HOME', 'XDG_CONFIG_HOME', 'XDG_STATE_HOME', 'SSH_AUTH_SOCK'];

function probe(env) {
  const r = spawnSync(NODE, [SELF, '--battery-probe'], { env, encoding: 'utf8', maxBuffer: 4 << 20, timeout: 30000 });
  let j = null; try { j = JSON.parse((r.stdout || '').trim()); } catch { }
  return { exit: r.status, json: j, stderrTail: (r.stderr || '').slice(-400) };
}
function refusedPath(env) {
  const r = spawnSync(NODE, [SELF, '--out', OUT, '--scratch', SCR], { env, encoding: 'utf8', maxBuffer: 4 << 20, timeout: 60000 });
  let j = null; try { j = JSON.parse((r.stdout || '').trim()); } catch { }
  return { exit: r.status, finding: j ? j.finding : null, gate: j ? (j.gate || null) : null, stderrTail: (r.stderr || '').slice(-300) };
}

const rows = [];
for (const [id, key, value] of VECTORS) {
  const env = { ...BASE, [key]: value };
  const p = probe(env);
  const w = refusedPath(env);
  rows.push({
    id, key, value: value.length > 80 ? value.slice(0, 77) + '...' : value,
    allowlisted: ALLOW.includes(key),
    probeExit: p.exit,
    probeContaminated: p.json ? p.json.contaminated : null,
    selfForbidden: p.json ? p.json.self.forbiddenNames : null,
    childSelfForbidden: p.json && p.json.child ? p.json.child.self.forbidden : null,
    childParentForbidden: p.json && p.json.child ? p.json.child.parent.forbidden : null,
    wrapperExit: w.exit,
    wrapperFinding: w.finding,
    wrapperGateSelfForbidden: w.gate ? w.gate.self.forbiddenNames : null,
    wrapperGateChildOk: w.gate && w.gate.child ? w.gate.child.ok : null,
    wrapperStderrTail: w.exit === 64 ? w.stderrTail : undefined,
  });
  console.log(JSON.stringify({ done: id }));
}

// Baseline: no vector at all through the same refused path.
const base = probe(BASE);
const baseW = refusedPath(BASE);
fs.writeFileSync(path.join(S, 'matrix.json'), JSON.stringify({ schema: 'revc1-env-vector-matrix', wrapper: SELF, wrapperSha256: null, baseline: { probe: base, wrapper: baseW }, rows }, null, 1) + '\n');
console.log(JSON.stringify({ wrote: 'matrix.json', rows: rows.length }));
