import hashlib, re, pathlib
SRC = pathlib.Path('/home/vgpnk/Projects/shokunin/kama-shokunin/tools/kama-llamacpp-live.py')
raw = SRC.read_text()
print('source_sha256', hashlib.sha256(raw.encode()).hexdigest())
m = re.search(r'def _tcp6_is_loopback\(addr_hex\):.*?\n\n\n', raw, re.S)
ns = {}
exec(m.group(0), ns)
f = ns['_tcp6_is_loopback']
vec = [
 ('127.0.0.1 (v4 LE word, last byte 7F)', '0100007F', True),
 ('192.168.1.1 (v4 LE word)', '0101A8C0', False),
 ('::1', '00000000000000000000000001000000', True),
 ('::ffff:127.0.0.1', '0000000000000000FFFF00000100007F', True),
 (':: (wildcard)', '00000000000000000000000000000000', False),
 ('2001:db8::1', 'B80D0120000000000000000001000000', False),
 ('fe80::1', '000080FE000000000000000001000000', False),
]
for label, hx, expect in vec:
    if len(hx) == 8:
        got = hx[-2:].upper() == '7F'   # kama's v4 branch, verbatim rule
    else:
        got = f(hx.upper())
    print(f'{label:38} is_loopback={got} expected={expect} agree={got == expect}')
