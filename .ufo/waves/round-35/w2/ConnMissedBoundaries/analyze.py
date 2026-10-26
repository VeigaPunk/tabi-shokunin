import re, sys, collections
REV='083c5c643be7aa5965a5de3458a32ed0d289ead3'
LANE='/fast/scratch/hyaku/tabi-r35/ConnMissedBoundaries/clone'
import subprocess
def git(*a):
    return subprocess.run(['git','-C',LANE,*a],capture_output=True,text=True).stdout
# candidates, screens, map from git at REV
cands_raw = git('show', f'{REV}:.ufo/waves/round-35/baseline/c1-candidates.tsv')
screens_raw = git('show', f'{REV}:corpus/adjacency-screen-browser.tsv')
map_raw = git('show', f'{REV}:corpus/adjacency.tsv')
cands={}
for l in cands_raw.splitlines():
    if not l: continue
    f=l.split('\t'); key=f[0]; text=f[2] if len(f)>2 else ''
    cands[key]={'text':text,'lane':key.split('@')[0].rsplit('-shokunin',1)[0]}
screens=[]
for l in screens_raw.splitlines()[1:]:
    if not l.strip(): continue
    f=l.split('\t')
    screens.append({'ref':f[0],'reason':f[1],'surface':f[2] if len(f)>2 else '','quote':f[3] if len(f)>3 else '','note':f[4] if len(f)>4 else ''})
rows=[]
for l in map_raw.splitlines()[1:]:
    if not l.strip(): continue
    f=l.split('\t')
    rows.append({'surface':f[0],'sibling':f[1],'sibling_ref':f[2],'sibling_quote':f[3],'disposition':f[6]})
# 1. counts
print('screens total', len(screens))
print('reason counts', dict(collections.Counter(s['reason'] for s in screens)))
print('map rows total', len(rows))
print('map dispositions', dict(collections.Counter(r['disposition'] for r in rows)))
from collections import defaultdict
surf_by_sib=defaultdict(set)
for r in rows: surf_by_sib[r['sibling']].add(r['surface'])
# 2. verify refs resolve to candidates and quotes are substrings
missing=[]; notsub=[]
for s in screens:
    if s['ref'] not in cands: missing.append(s['ref']); continue
    t=cands[s['ref']]['text']
    if s['quote'] not in t: notsub.append((s['ref'],s['quote'][:60],t[:60]))
print('screens with ref missing from candidates:', len(missing))
for m in missing[:10]: print('  MISSING', m)
print('screens whose quote is not a verbatim substring:', len(notsub))
for x in notsub[:10]: print('  NOTSUB', x[0], '|', x[1], '|', x[2])
# 3. same-surface anchors exist?
badanchor=[]
sv={s['ref']:s for s in screens}
for s in screens:
    if s['reason']=='same-surface':
        lane=s['ref'].split('@')[0].rsplit('-shokunin',1)[0]
        if s['surface'] not in surf_by_sib[lane]: badanchor.append((s['ref'],s['surface'],lane))
print('same-surface screens whose surface is not a verified row of same sibling:', len(badanchor))
for b in badanchor[:10]: print('  BADANCHOR', b)
# 4. cluster same-surface by (sibling, surface)
cl=defaultdict(int)
for s in screens:
    if s['reason']=='same-surface':
        lane=s['ref'].split('@')[0].rsplit('-shokunin',1)[0]
        cl[(lane,s['surface'])]+=1
print('same-surface clusters:')
for (l,sf),n in sorted(cl.items()): print(f'  {l:10s} {sf:40s} {n}')
# 5. SIDE-bearing screened quotes
SIDE=re.compile(r'\b(?:own|owns|owned|owner|ownership|refuse|refuses|refused|refusal|deny|denies|denied|never|route|routes|routed|belongs?|report|reports|reported|lease|leases|leased|shared?|contested|stays?|handled?|handles|out of scope|not (?:this|our))\b', re.I)
BG=re.compile(r'\b(?:playwright|puppeteer|chromedriver|geckodriver|webdriver|selenium|chromium|headless[ -](?:chrome|chromium|browser|firefox)|devtools protocol|chrome devtools|chrome-devtools|cdp|remote-debugging|browser automation|webbridge|burner[- ]?chrome|musketeer)\b', re.I)
side_screens=[]
for s in screens:
    lane=s['ref'].split('@')[0].rsplit('-shokunin',1)[0]
    t=cands.get(s['ref'],{}).get('text','')
    if SIDE.search(t) and BG.search(t):
        side_screens.append((s['ref'],s['reason'],s['surface'],t[:130]))
print('\nscreened candidates whose full line carries SIDE+BG:', len(side_screens))
for x in side_screens: print('  ', x[0], '|', x[1], '|', x[2], '|', x[3])
