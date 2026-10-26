#!/usr/bin/env python3
"""RevQuoteRegrounding w2: verify the three re-grounded Gate quotes (S110/S114/S115)
against live Gitiles bytes (156.0.8078.47) and the 154.0.8037.97 cross-checks,
plus the two-literal-span note. Normalisation mirrors scripts/check-frontier-admission.mjs:
normalise = re.sub(r'\s+', ' ', t).strip(); words = collapse(q).split(' ') nonempty count.
"""
import re, json, difflib
from pathlib import Path

B = Path('/fast/scratch/hyaku/tabi-r30/RevQuoteRegrounding/bytes')
LANE = Path('/home/vgpnk/Projects/shokunin/tabi-shokunin')

form156 = (B / 'form_mcp_schema.cc.156').read_text()
html156 = (B / 'html_form_element.cc.156').read_text()
form154 = (B / 'form_mcp_schema.cc.154').read_text()
html154 = (B / 'html_form_element.cc.154').read_text()

def norm(t):
    return re.sub(r'\s+', ' ', t).strip()

def words(t):
    return len([w for w in norm(t).split(' ') if w])

def lines_of(t):
    return t.split('\n')

out = {}

# ---- parse the three rows from the lesson table (no hand transcription) ----
lesson = (LANE / 'corpus/lessons/round-30.md').read_text()
sec = lesson.split('### Re-grounded Gate quotes for S110, S114, S115', 1)[1].split('The two-literal span.', 1)[0]
rows = {}
for m in re.finditer(r'^\| (S\d+) \| (\S+) \| (\S+) \| "([^"]*)" \| ([^|]+) \|', sec, re.M):
    rows[m.group(1)] = {'url': m.group(2), 'date': m.group(3), 'quote': m.group(4), 'loc': m.group(5).strip()}
assert set(rows) == {'S110', 'S114', 'S115'}, rows.keys()

def check_span(name, text, quote, start, end):
    """quote must be exactly norm(lines[start..end]) -> contiguous, at stated lines."""
    ls = lines_of(text)
    span = '\n'.join(ls[start - 1:end])
    nspan = norm(span)
    res = {'stated': f'{start}-{end}', 'exact_span_match': nspan == quote,
           'in_full_norm': quote in norm(text), 'words': words(quote)}
    if not res['exact_span_match']:
        res['span_norm'] = nspan[:200]
        res['quote'] = quote[:200]
    return res

# ---- S110: form_mcp_schema.cc:215-217, both tags ----
q110 = rows['S110']['quote']
out['S110'] = {
    'quote': q110,
    '156': check_span('S110', form156, q110, 215, 217),
    '154_215_217': check_span('S110', form154, q110, 215, 217),
    'byte_identical_tags': form156 == form154,
}
# invalid-value branch claim ":221-230 returns the same code"
f156_ls = lines_of(form156)
out['S110']['lines_215_230'] = {i: f156_ls[i - 1] for i in range(215, 231)}

# ---- S114: html_form_element.cc:867 ----
q114 = rows['S114']['quote']
ls156 = lines_of(html156)
ls154 = lines_of(html154)
out['S114'] = {
    'quote': q114,
    '156': check_span('S114', html156, q114, 867, 867),
    'line_867_raw': ls156[866],
    'occurrences_156_raw': html156.count(q114),
    'occurrences_156_norm': norm(html156).count(q114),
    '154_line_numbers': [i + 1 for i, l in enumerate(ls154) if norm(l) == norm(q114)],
    '154_raw_count': html154.count(q114),
}
# why-cell claims: ScheduleFormSubmission at :862; S111 comment at :201-202
out['S114']['line_862'] = ls156[861]
out['S114']['lines_201_202'] = [ls156[200], ls156[201]]

# ---- S115: html_form_element.cc:203-206 ----
q115 = rows['S115']['quote']
out['S115'] = {
    'quote': q115,
    '156': check_span('S115', html156, q115, 203, 206),
    'absent_from_154_norm': q115 not in norm(html154),
    '154_isactive_count': html154.count('!form_->GetDocument().IsActive()'),
    '154_ktoolinvocationfailed_count': html154.count('kToolInvocationFailed'),
    '156_ktoolinvocationfailed_count': html156.count('kToolInvocationFailed'),
}
out['S115']['lines_203_210'] = {i: ls156[i - 1] for i in range(203, 211)}

# ---- two-literal-span note ----
msg = 'The document was detached while filling out the form'
lit1 = 'The document was detached while filling out '
lit2 = 'the form")'
k = html156.find(lit1)
gap = html156[k + len(lit1):k + len(lit1) + 40] if k >= 0 else None
out['two_literal'] = {
    'msg_len': len(msg),
    'msg_raw_count': html156.count(msg),
    'msg_norm_count': norm(html156).count(msg),
    'lit1_raw_count': html156.count(lit1),
    'lit1_norm_count': norm(html156).count(lit1),
    'lit2_raw_count': html156.count(lit2),
    'lit2_norm_count': norm(html156).count(lit2),
    'line_207': ls156[206],
    'line_208': ls156[207],
    'gap_repr': repr(gap),
    'gap_is_quote_nl_28sp_quote': gap is not None and gap.startswith('"' + '\n' + ' ' * 28 + '"'),
    'gap_len_to_second_quote': (gap.find('"', 1) + 1) if gap else None,
}

# ---- 154 -> 156 line-shift structure for html_form_element.cc ----
sm = difflib.SequenceMatcher(None, ls154, ls156, autojunk=False)
ops = sm.get_opcodes()
insertions = [(op, ls154[i1:i2], ls156[j1:j2]) for op, i1, i2, j1, j2 in ops if op in ('insert', 'replace')]
out['diff_insertions'] = [
    {'op': op, 'old': ([i1 + 1, i2] if i2 > i1 else None), 'new': [j1 + 1, j2], 'new_lines': ls156[j1:j2][:2], 'n_new': j2 - j1}
    for op, i1, i2, j1, j2 in ops if op in ('insert', 'replace')
]
def new_line_of_old(old):
    # walk opcodes: equal blocks map 1:1; insert blocks shift subsequent old lines
    delta = 0
    for op, i1, i2, j1, j2 in ops:
        if op == 'equal':
            if i1 < old <= i2:  # old is 1-based inside equal block [i1+1..i2]
                return old + delta
            delta += (j2 - j1) - (i2 - i1)
        elif op in ('insert',):
            if i1 < old:  # insertion after old line i1 (1-based)
                delta += j2 - j1
        elif op == 'replace':
            if i1 < old <= i2:
                return None  # replaced line, no stable mapping
            if i1 < old:
                delta += (j2 - j1) - (i2 - i1)
    return None
anchors = {}
for old in [190, 192, 196, 197, 198, 199, 200, 201, 202, 210, 258, 328, 339]:
    n = new_line_of_old(old)
    if n:
        anchors[str(old)] = {'new': n, 'delta': n - old}
out['shift_anchors'] = anchors

print(json.dumps(out, indent=1))
