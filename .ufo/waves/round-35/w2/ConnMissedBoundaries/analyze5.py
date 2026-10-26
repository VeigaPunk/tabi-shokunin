import subprocess, collections
REV='083c5c643be7aa5965a5de3458a32ed0d289ead3'
LANE='/fast/scratch/hyaku/tabi-r35/ConnMissedBoundaries/clone'
def git(*a): return subprocess.run(['git','-C',LANE,*a],capture_output=True,text=True).stdout
screens_raw = git('show', f'{REV}:corpus/adjacency-screen-browser.tsv')
rows=collections.defaultdict(collections.Counter)
for l in screens_raw.splitlines()[1:]:
    if not l.strip(): continue
    f=l.split('\t'); lane=f[0].split('@')[0].rsplit('-shokunin',1)[0]
    rows[lane][f[1]]+=1
tot=collections.Counter()
print(f"{'sibling':10s} {'same-surface':>11s} {'not-browser':>11s} {'third-lane':>10s} {'no-claim':>9s} {'total':>6s}")
for lane in sorted(rows):
    c=rows[lane]; tot.update(c)
    print(f"{lane:10s} {c['same-surface']:11d} {c['not-browser-sense']:11d} {c['third-lane-report']:10d} {c['no-claim-declared']:9d} {sum(c.values()):6d}")
print(f"{'TOTAL':10s} {tot['same-surface']:11d} {tot['not-browser-sense']:11d} {tot['third-lane-report']:10d} {tot['no-claim-declared']:9d} {sum(tot.values()):6d}")
