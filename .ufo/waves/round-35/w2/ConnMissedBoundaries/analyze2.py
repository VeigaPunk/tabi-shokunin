import re, collections, subprocess
from collections import defaultdict
REV='083c5c643be7aa5965a5de3458a32ed0d289ead3'
LANE='/fast/scratch/hyaku/tabi-r35/ConnMissedBoundaries/clone'
def git(*a): return subprocess.run(['git','-C',LANE,*a],capture_output=True,text=True).stdout
cands_raw = git('show', f'{REV}:.ufo/waves/round-35/baseline/c1-candidates.tsv')
screens_raw = git('show', f'{REV}:corpus/adjacency-screen-browser.tsv')
map_raw = git('show', f'{REV}:corpus/adjacency.tsv')
cands={}
for l in cands_raw.splitlines():
    if not l: continue
    f=l.split('\t'); cands[f[0]]={'text':f[1] if len(f)>1 else '','lane':f[0].split('@')[0].rsplit('-shokunin',1)[0]}
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
surf_by_sib=defaultdict(set)
for r in rows: surf_by_sib[r['sibling']].add(r['surface'])
notsub=[]
for s in screens:
    t=cands.get(s['ref'],{}).get('text','')
    if s['quote'] not in t: notsub.append((s['ref'],s['quote'][:70],t[:70]))
print('screens whose quote is not a verbatim substring of candidate:', len(notsub))
for x in notsub[:10]: print('  NOTSUB', x[0], '\n    q:', x[1], '\n    t:', x[2])
# quote word-length check per counter (4..25 words, >=20 non-space)
def words(s): return [w for w in re.split(r'\s+', s.strip()) if w]
badwords=[]
for s in screens:
    w=words(s['quote'])
    if not (4<=len(w)<=25 and len(s['quote'].replace(' ',''))>=20): badwords.append((s['ref'],len(w),s['quote'][:60]))
print('screens violating quote word/count constraints:', len(badwords))
for b in badwords[:10]: print('  BADWORDS', b)
# SIDE+BG screened
SIDE=re.compile(r'\b(?:own|owns|owned|owner|ownership|refuse|refuses|refused|refusal|deny|denies|denied|never|route|routes|routed|belongs?|report|reports|reported|lease|leases|leased|shared?|contested|stays?|handled?|handles|out of scope|not (?:this|our))\b', re.I)
BG=re.compile(r'\b(?:playwright|puppeteer|chromedriver|geckodriver|webdriver|selenium|chromium|headless[ -](?:chrome|chromium|browser|firefox)|devtools protocol|chrome devtools|chrome-devtools|cdp|remote-debugging|browser automation|webbridge|burner[- ]?chrome|musketeer)\b', re.I)
side_screens=[]
for s in screens:
    t=cands.get(s['ref'],{}).get('text','')
    if SIDE.search(t) and BG.search(t):
        side_screens.append((s['ref'],s['reason'],s['surface'],t[:150]))
print('\nscreened candidates whose line carries SIDE+BG:', len(side_screens))
for x in side_screens: print('  ', x[0], '|', x[1], '|', x[2], '|', x[3])
# same-surface surface mismatches: line topic keyword vs surface keyword
print('\n--- same-surface screens, surface vs quote topic (manual review list) ---')
for s in screens:
    if s['reason']=='same-surface':
        lane=s['ref'].split('@')[0].rsplit('-shokunin',1)[0]
        print(f"{lane:10s} {s['surface']:40s} {s['ref'].split(':',1)[1][:70]}")
