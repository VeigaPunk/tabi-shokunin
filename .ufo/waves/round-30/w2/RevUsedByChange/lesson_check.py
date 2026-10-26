import re

def parse(path):
    rows = {}
    with open(path, encoding='utf-8') as f:
        for line in f:
            m = re.match(r'^\| (S\d+) \|', line.rstrip('\n'))
            if m:
                rows[m.group(1)] = [c.strip() for c in line.split('|')[1:-1]]
    return rows

new = parse('/fast/scratch/hyaku/tabi-r30/RevUsedByChange/SOURCES.new.md')
old = parse('/fast/scratch/hyaku/tabi-r30/RevUsedByChange/SOURCES.old.md')

# 1. lesson used-by table parse
lesson = {}
lesson_order = []
in_tbl = 'no'
for line in open('/fast/scratch/hyaku/tabi-r30/RevUsedByChange/round-30.new.md', encoding='utf-8'):
    s = line.rstrip('\n')
    if s.startswith('### `used-by` changes'):
        in_tbl = 'pending'
        continue
    if in_tbl == 'pending' and s.startswith('| id | used-by old | used-by new |'):
        in_tbl = 'tbl'
        continue
    if in_tbl == 'tbl':
        m = re.match(r'^\| (S\d+) \| (.*) \| (.*) \|$', s)
        if m:
            lesson[m.group(1)] = (m.group(2).strip(), m.group(3).strip())
            lesson_order.append(m.group(1))
        elif not s.startswith('|') and lesson:
            break
print("lesson rows:", len(lesson_order), lesson_order)

actual = {}
for rid, o in old.items():
    if rid in new and o != new[rid]:
        actual[rid] = (o[10], new[rid][10])

print("actual changed:", len(actual))
print("set equal (lesson vs actual):", set(lesson_order) == set(actual.keys()))
mismatch = []
for rid in sorted(set(lesson_order) | set(actual.keys())):
    lo = lesson.get(rid); ac = actual.get(rid)
    if lo != ac:
        mismatch.append((rid, lo, ac))
print("value mismatches:", mismatch if mismatch else "NONE (byte-exact)")

# 2. status/used-by consistency scan on NEW file
print("\n--- status vs used-by consistency (new file) ---")
q_with_paths = [(rid, v[10]) for rid, v in new.items() if v[7] == 'queued' and v[10] not in ('—', '')]
m_with_dash  = [rid for rid, v in new.items() if v[7] == 'mined' and v[10] in ('—', '')]
r_with_paths = [rid for rid, v in new.items() if v[7] == 'rejected' and v[10] not in ('—', '')]
print("queued with non-dash used-by:", q_with_paths if q_with_paths else "none")
print("mined with dash used-by:", m_with_dash if m_with_dash else "none")
print("rejected with paths:", r_with_paths if r_with_paths else "none")

q_old = [(rid, v[10]) for rid, v in old.items() if v[7] == 'queued' and v[10] not in ('—', '')]
m_old = [rid for rid, v in old.items() if v[7] == 'mined' and v[10] in ('—', '')]
print("\nOLD file: queued with paths:", q_old if q_old else "none", "| mined with dash:", m_old if m_old else "none")

# 3. citing entry: which rows does chromium-156-release-pin-recheck.md:3 cite
entry = open('/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/chromium-156-release-pin-recheck.md', encoding='utf-8').read()
line3 = entry.splitlines()[2]
cited = set(re.findall(r'S\d{3}', line3))
changed_set = set(actual.keys())
print("\nentry line3 cites:", len(cited), "rows")
print("cited == changed-set:", cited == changed_set)
print("cited-not-changed:", sorted(cited - changed_set))
print("changed-not-cited:", sorted(changed_set - cited))
print("\nline3 raw:", line3[:400], "...")
