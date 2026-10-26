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

actual = {rid: (o[10], new[rid][10]) for rid, o in old.items() if rid in new and o != new[rid]}

# lesson table again, strip backticks before compare
lesson = {}
in_tbl = 'no'
for line in open('/fast/scratch/hyaku/tabi-r30/RevUsedByChange/round-30.new.md', encoding='utf-8'):
    s = line.rstrip('\n')
    if s.startswith('### `used-by` changes'):
        in_tbl = 'pending'; continue
    if in_tbl == 'pending' and s.startswith('| id | used-by old | used-by new |'):
        in_tbl = 'tbl'; continue
    if in_tbl == 'tbl':
        m = re.match(r'^\| (S\d+) \| (.*) \| (.*) \|$', s)
        if m:
            lesson[m.group(1)] = (m.group(2).strip().strip('`'), m.group(3).strip().strip('`'))
        elif not s.startswith('|') and lesson:
            break

strip_bq = lambda t: t.replace('`', '')
mismatch = [(rid, lesson.get(rid), actual.get(rid)) for rid in sorted(set(lesson)|set(actual))
            if (strip_bq(lesson[rid][0]), strip_bq(lesson[rid][1])) != actual.get(rid, (None,None))] \
           if lesson else []
print("lesson rows:", len(lesson), "| actual:", len(actual))
print("byte-exact (modulo backtick wrapping) mismatches:", mismatch if mismatch else "NONE")

# S094 full row old and new
print("\nS094 old:", old['S094'])
print("S094 new:", new['S094'])

# rejected-with-paths in OLD file
r_old = [rid for rid, v in old.items() if v[7] == 'rejected' and v[10] not in ('—','')]
print("\nOLD rejected with paths:", r_old if r_old else "none")

# S108-S115 used-by in OLD file (already cite the recheck entry?)
print("\n--- S108..S115 used-by in OLD file ---")
for rid in ['S108','S109','S110','S111','S112','S113','S114','S115']:
    v = old.get(rid)
    print(rid, "status:", v[7] if v else None, "| used-by:", (v[10] if v else None)[:160])

# does every changed row's new used-by end with the recheck entry, and is it a pure append?
ENTRY = 'corpus/knowledge/chromium-156-release-pin-recheck.md'
bad_append = []
for rid, (o, n) in actual.items():
    if not n.endswith(ENTRY):
        bad_append.append((rid, 'new does not end with entry'))
    elif o != '—' and n != o + ', ' + ENTRY:
        bad_append.append((rid, 'not a pure comma append'))
    elif o == '—' and n != ENTRY:
        bad_append.append((rid, 'dash row not exactly entry'))
print("\npure-append violations:", bad_append if bad_append else "NONE")

# any row in NEW citing the entry in used-by that was NOT changed (should be S108-S115 only)
already = [rid for rid, v in new.items() if ENTRY in v[10] and rid not in actual]
print("rows with entry in used-by but unchanged:", already)
