# R59 f6 probe (lesson Mistakes 1): flip / drop `cancelable` on the first CapsLock
# keydownEntry of the COMMITTED live receipt and run the CANONICAL frozen counter.
# Reproduce: python3 .ufo/waves/round-59/measure/f6-probe.py  (from the lane root)
import copy, json, os, subprocess
L = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
E = os.path.join(L, 'corpus/evidence/round59/chromium-capslock-boundary')
OUT = os.path.join(L, '.ufo/waves/round-59/measure/f6-probe')
os.makedirs(OUT, exist_ok=True)
base = json.load(open(os.path.join(E, 'receipt.json')))
path = ['capslockTrace', 'press1', 'keydownEntry']
def at(d):
    x = d
    for k in path:
        x = x[k]
    return x
variants = {}
a = copy.deepcopy(base); at(a)['cancelable'] = False; variants['A-cancelable-false'] = a
b = copy.deepcopy(base); del at(b)['cancelable']; variants['B-cancelable-missing'] = b
DRIVER_SHA = 'b16ddb443d5bd1b101cfcdb55cbf2d5ffcb3f39d38064a661ab82bb9a152ff86'
for name, rec in variants.items():
    rp = os.path.join(OUT, name + '.receipt.json')
    json.dump(rec, open(rp, 'w'), indent=1)
    r = subprocess.run(['node', '.ufo/waves/round-59/counters/chromium-receipt-r59.mjs', rp,
                        '--driver', 'scripts/chrome-cdp-loopback-round59.mjs',
                        '--expect-driver-sha256', DRIVER_SHA, '--shot', E, '--json'],
                       cwd=L, capture_output=True, text=True)
    open(os.path.join(OUT, name + '.counter.out.json'), 'w').write(r.stdout)
    findings = [f.get('id') for f in json.loads(r.stdout or '{}').get('findings', [])]
    print(name, 'exit=%d' % r.returncode, 'findings=%s' % findings)
