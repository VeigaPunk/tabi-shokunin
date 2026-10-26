import re, json, sys

def parse(path):
    rows = {}
    order = []
    with open(path, encoding='utf-8') as f:
        for ln, line in enumerate(f, 1):
            line = line.rstrip('\n')
            m = re.match(r'^\| (S\d+) \|', line)
            if m:
                cells = [c.strip() for c in line.split('|')[1:-1]]
                rid = m.group(1)
                if rid in rows:
                    print(f"DUP id {rid} at line {ln}")
                rows[rid] = cells
                order.append((rid, ln))
    return rows, order

old, old_order = parse('/fast/scratch/hyaku/tabi-r30/RevUsedByChange/SOURCES.old.md')
new, new_order = parse('/fast/scratch/hyaku/tabi-r30/RevUsedByChange/SOURCES.new.md')

hdr_old = None
for line in open('/fast/scratch/hyaku/tabi-r30/RevUsedByChange/SOURCES.old.md', encoding='utf-8'):
    if line.startswith('| id |'):
        hdr_old = [c.strip() for c in line.split('|')[1:-1]]
        break
print("header:", hdr_old, "ncols:", len(hdr_old))

added = [r for r in new_order if r[0] not in old]
removed = [r for r in old_order if r[0] not in new]
print("added:", [r[0] for r in added])
print("removed:", [r[0] for r in removed])

changed = []
for rid, ln in old_order:
    if rid not in new:
        continue
    o, n = old[rid], new[rid]
    if o != n:
        diffs = [i for i in range(max(len(o), len(n))) if (o[i] if i < len(o) else None) != (n[i] if i < len(n) else None)]
        changed.append((rid, ln, diffs, o, n))

print(f"\nchanged rows: {len(changed)}")
for rid, ln, diffs, o, n in changed:
    names = [hdr_old[i] if i < len(hdr_old) else f"?{i}" for i in diffs]
    print(f"  {rid} (old line {ln}) diff cells {diffs} {names}")

# verify each changed row differs only in used-by (index 10)
bad = [(rid, diffs) for rid, ln, diffs, o, n in changed if diffs != [10]]
print("\nrows differing in cells other than used-by:", bad if bad else "NONE")

# print old->new used-by for each changed row
print("\n--- actual used-by changes ---")
for rid, ln, diffs, o, n in changed:
    print(f"{rid}\t{o[10]}\t->\t{n[10]}")

# status cells for the four dash rows
print("\n--- S080/S081/S093/S098 status (old -> new) ---")
for rid in ["S080","S081","S093","S098"]:
    o = old.get(rid); n = new.get(rid)
    if o and n:
        print(f"{rid}: status {o[7]!r} -> {n[7]!r}; used-by {o[10]!r} -> {n[10]!r}; recheck {o[9]!r} -> {n[9]!r}")
    else:
        print(f"{rid}: missing (old={rid in old}, new={rid in new})")

# pure-addition check for S116/S117/S118: appear only as added lines in diff
import subprocess
d = subprocess.run(['git','--no-pager','diff','061e62024c0523d3c6c7e819506a773ff2cd7d75','072af95fe2822f0785a6ff88a578e2142dd258e5','--','corpus/SOURCES.md'],
                   cwd='/home/vgpnk/Projects/shokunin/tabi-shokunin', capture_output=True, text=True)
lines = d.stdout.splitlines()
for rid in ["S116","S117","S118"]:
    minus = [l for l in lines if l.startswith('-') and re.search(r'\| '+rid+' \|', l)]
    plus  = [l for l in lines if l.startswith('+') and re.search(r'\| '+rid+' \|', l)]
    print(f"{rid}: minus-lines={len(minus)} plus-lines={len(plus)}")
    # also confirm the plus line content equals the new-file row
    newrow = [l.rstrip('\n') for l in open('/fast/scratch/hyaku/tabi-r30/RevUsedByChange/SOURCES.new.md', encoding='utf-8') if re.match(r'^\| '+rid+' \|', l)]
    print(f"   plus==newrow: {plus[0][1:]==newrow[0] if plus and newrow else 'N/A'}")

# order check: new rows appended at end of table in id order?
print("\nnew-order tail:", [r[0] for r in new_order[-6:]])
