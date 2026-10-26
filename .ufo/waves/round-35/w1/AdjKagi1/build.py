import io, os, subprocess, sys, json
S = '/fast/scratch/hyaku/tabi-r35/AdjKagi1'
CL = S + '/clone'
PIN = '69b61db46be4ed955994f6f1d1cba522bc5f4e97'
cands = {}
for line in io.open(S + '/cands.tsv', encoding='utf-8'):
    line = line.rstrip('\n')
    if not line: continue
    k, t = line.split('\t', 1)
    cands[k] = t
mine = [l.rstrip('\n') for l in io.open('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1-chunks/AdjKagi1.tsv', encoding='utf-8') if l.strip()]
assert len(mine) == 14, len(mine)
for l in mine:
    assert l.split('\t', 1)[1] == cands[l.split('\t', 1)[0]], l[:80]
mine = [l.split('\t', 1)[0] for l in mine]
def words(s): return [w for w in s.split() if w]
def good(q):
    return 4 <= len(words(q)) <= 25 and len(''.join(q.split())) >= 20
SURF = 'musketeer-cdp-9222-profile-lease'
spec = {}
for k in mine:
    ref = k.split('\t')[0]
    spec[ref] = None
# reasons per candidate
plan = {
 'SKILL.md:11':  ('same-surface', SURF),
 'SKILL.md:110': ('not-browser-sense', '-'),
 'SKILL.md:164': ('same-surface', SURF),
 'SKILL.md:172': ('same-surface', SURF),
 'SKILL.md:438': ('not-browser-sense', '-'),
 'SKILL.md:564': ('not-browser-sense', '-'),
 'SKILL.md:676': ('no-claim-declared', '-'),
 'corpus/knowledge/adjacency-breadth.md:23': ('same-surface', SURF),
 'corpus/knowledge/adjacency-breadth.md:75': ('same-surface', SURF),
 'corpus/knowledge/adjacency-breadth.md:76': ('same-surface', SURF),
 'corpus/knowledge/adjacency-scope.md:9': ('same-surface', SURF),
 'corpus/knowledge/adjacency-scope.md:28': ('same-surface', SURF),
 'corpus/knowledge/adjacency-scope.md:31': ('same-surface', SURF),
}
notes = {
 'SKILL.md:11': "The `cdp-bridge` this domain clause lists is the-janitor's native-messaging bridge into the musketeer Chrome profile on CDP port 9222 (`corpus/knowledge/cdp-bridge-1password.md:20,24,27`), the surface the map already dispositions for kagi as contested-open.",
 'SKILL.md:110': "The sentence's subject is which handler verbs take `client.lock`; `cdp-bridge` appears only as a verb name in a flock-topology line, not as a browser, driver, protocol or capture statement.",
 'SKILL.md:164': "The default probe set runs `cdp-bridge ensure` against a scratch `MUSKETEER_CHROME_PROFILE` (line 165), i.e. the same musketeer Chrome profile the map's contested-open row already covers.",
 'SKILL.md:172': "A finding that `cdp-bridge ensure` writes the `NativeMessagingHosts` directory inside that profile even when the guard refuses — the mapped profile surface, with no side beyond it.",
 'SKILL.md:438': "An output-quoting rule for the lane's own receipts; `cdp-bridge status` is cited as one metadata-only command name, and the line states nothing about a browser, driver, protocol or capture.",
 'SKILL.md:564': "A falsification list of `the-janitor` verbs that reproduce claimed surfaces; `cdp-bridge status` is one entry, not a browser-side statement.",
 'SKILL.md:676': "kagi draws a boundary rather than a claim: browser/CDP recipes are not to be executed unattended (line 677), so the line asserts nothing on tabi's browser-driving surface.",
 'corpus/knowledge/adjacency-breadth.md:23': "A count-only breadth row for `the-musketeer/chrome-profile` — the same directory whose CDP 9222 lease the map already dispositions contested for kagi.",
 'corpus/knowledge/adjacency-breadth.md:75': "The aggregate-ancestor exemption naming `the-musketeer` as a no-enumerate child of `$HOME/.local/share`, i.e. the parent of that same mapped profile surface.",
 'corpus/knowledge/adjacency-breadth.md:76': "Names `chrome-profile` as the no-enumerate child of `the-musketeer` — the mapped musketeer Chrome profile itself.",
 'corpus/knowledge/adjacency-scope.md:9': "kagi's own history of the CDP refusal and the one unchecked census row for that profile — the surface the map's contested-open row already answers.",
 'corpus/knowledge/adjacency-scope.md:28': "Literally names `PROVINCE.md:34`'s CDP surface as contested with kake, the same contested-open surface the map carries for kagi.",
 'corpus/knowledge/adjacency-scope.md:31': "The single `mode = -` census row is the musketeer profile directory — the mapped surface's own presence-only declaration.",
}
screen_rows = []
for k in mine:
    ref = k.split('\t')[0]
    rel = ref.split('@', 1)[1].split(':', 1)[1]
    path, ln = rel.rsplit(':', 1)
    if path == 'SKILL.md' and ln == '40':
        continue
    reason, surf = plan[path + ':' + ln]
    text = cands[k]
    q = text.strip()
    assert q in text, ref
    if reason == 'same-surface':
        assert surf != '-'
    else:
        assert surf == '-'
    if not good(q):
        assert q == text.strip() and len(words(q)) <= 25, (ref, len(words(q)))
    screen_rows.append('\t'.join([k, reason, surf, q, notes[path + ':' + ln]]))
screen_rows.sort(key=lambda r: r.split('\t', 1)[0])
# map row: line 40
k40 = [k for k in mine if k.endswith('SKILL.md:40')][0]
assert k40 == 'kagi-shokunin@' + PIN + ':SKILL.md:40', k40
line40 = cands[k40].strip()
sq = line40
if len(words(sq)) > 25:
    sq = "`cdp-bridge ensure` then `status` | `open-popup` (hard refusal, exit 2); scraping vault DOM"
assert sq in line40, sq
BG = r'\b(?:playwright|puppeteer|chromedriver|geckodriver|webdriver|selenium|chromium|headless[ -](?:chrome|chromium|browser|firefox)|devtools protocol|chrome devtools|chrome-devtools|cdp|remote-debugging|browser automation|webbridge|burner[- ]?chrome|musketeer)\b'
SIDE = r'\b(?:own|owns|owned|owner|ownership|refuse|refuses|refused|refusal|deny|denies|denied|never|route|routes|routed|belongs?|report|reports|reported|lease|leases|leased|shared?|contested|stays?|handled?|handles|out of scope|not (?:this|our))\b'
import re
assert re.search(BG, sq, re.I) and re.search(SIDE, sq, re.I), sq
print('sibling_quote words', len(words(sq)), 'chars', len(''.join(sq.split())))
# append SKILL.md
decl = ("The 1Password native-messaging bridge is kagi's custody surface: the `open-popup` refusal kagi states at `kagi-shokunin/SKILL.md:40`, and the ban on scraping vault DOM, stay kagi's; tabi's CDP session discipline (PROVINCE.md:9) drives browsers and captures DOM/screenshot evidence without reading a vault DOM or a session value.")
tabi_quote = "the `open-popup` refusal kagi states at `kagi-shokunin/SKILL.md:40`"
ruling_quote = "tabi's CDP session discipline (PROVINCE.md:9) drives browsers and captures DOM/screenshot evidence"
assert tabi_quote in decl and ruling_quote in decl
assert good(tabi_quote) and good(ruling_quote), (words(tabi_quote), words(ruling_quote))
with io.open(CL + '/SKILL.md', 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')
assert lines[-1] == ''
lines = lines[:-1]
lines += ['', '## Round 35 — scratch declarations', '', decl, '']
text = '\n'.join(lines)
with io.open(CL + '/SKILL.md', 'w', encoding='utf-8') as f:
    f.write(text)
line_no = text.split('\n').index(decl) + 1
print('DECL1 at SKILL.md:' + str(line_no))
row = ['cdp-bridge-vault-dom-refusal', 'kagi', 'kagi-shokunin@' + PIN + ':SKILL.md:40', sq, 'SKILL.md:' + str(line_no), tabi_quote, 'split-declared', '-', ruling_quote]
assert len(row) == 9
with io.open(CL + '/corpus/adjacency.tsv', 'a', encoding='utf-8') as f:
    f.write('\t'.join(row) + '\n')
with io.open(CL + '/corpus/adjacency-screen-browser.tsv', 'w', encoding='utf-8') as f:
    f.write('sibling_ref\treason\tsurface\tquote\tnote\n')
    for r in screen_rows:
        f.write(r + '\n')
with io.open(S + '/rows.tsv', 'w', encoding='utf-8') as f:
    f.write('\t'.join(row) + '\n')
with io.open(S + '/rows-decl.tsv', 'w', encoding='utf-8') as f:
    f.write('\t'.join([row[0], row[1], row[2], row[3], 'SKILL.md:DECL1', row[5], row[6], row[7], row[8]]) + '\n')
with io.open(S + '/screen.tsv', 'w', encoding='utf-8') as f:
    for r in screen_rows:
        f.write(r + '\n')
with io.open(S + '/decl.md', 'w', encoding='utf-8') as f:
    f.write('DECL1 (applied at SKILL.md:%d in the validation clone; merged heading `## Round 35 — scratch declarations`)\n\n%s\n' % (line_no, decl))
print('screens', len(screen_rows), 'map row written')
