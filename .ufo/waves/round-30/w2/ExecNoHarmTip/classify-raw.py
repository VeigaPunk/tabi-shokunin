#!/usr/bin/env python3
"""classify-raw.py — ExecNoHarmTip, round 30 w2.

Pair every tip raw stdout with its wave-1 baseline counterpart and record whether
the output is identical after normalising only the scratch path and the measured
revision. Writes raw-diffs.tsv. A row whose raw output differs is not a defect by
itself; the report classifies each difference.
"""
import pathlib

ROOT = pathlib.Path('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30')
B = ROOT / 'w1' / 'ExecNoHarmBaseline' / 'raw'
T = ROOT / 'w2' / 'ExecNoHarmTip' / 'raw'
OUT = ROOT / 'w2' / 'ExecNoHarmTip'
REV_B = '061e62024c0523d3c6c7e819506a773ff2cd7d75'
REV_T = '072af95fe2822f0785a6ff88a578e2142dd258e5'
# wave-1 named its supplementary receipts without the numeric tag prefix
ALIAS = {'47': 'census-validate-file.out', '40': '40-census-validate-root.out',
         '39': '39-report-contract-round-29-fleet.out'}


def norm(text: str) -> str:
    text = text.replace('/fast/scratch/hyaku/tabi-r30/ExecNoHarmBaseline', '<S>')
    text = text.replace('/fast/scratch/hyaku/tabi-r30/ExecNoHarmTip', '<S>')
    return text.replace(REV_B, '<REV>').replace(REV_T, '<REV>')


def main() -> int:
    tips = {p.name.split('-', 1)[0]: p for p in T.glob('*.out')}
    bases = {}
    for p in B.glob('*.out'):
        key = p.name.split('-', 1)[0]
        bases[key if key.isdigit() else ''] = p
    lines = ['row\ttip_file\traw_identity\tbytes_base/tip\tstderr_identity']
    for tag in sorted(tips, key=int):
        tp = tips[tag]
        bp = B / ALIAS.get(tag, tp.name) if tag in ALIAS else bases.get(tag)
        if bp is None or not bp.exists():
            lines.append(f'{tag}\t{tp.name}\tNO-BASELINE-RAW\t\t')
            continue
        a, b = norm(bp.read_text()), norm(tp.read_text())
        ident = 'identical' if a == b else 'differs'
        be, te = bp.with_suffix('.err'), tp.with_suffix('.err')
        ea = norm(be.read_text()) if be.exists() else ''
        eb = norm(te.read_text()) if te.exists() else ''
        eident = 'identical' if ea == eb else 'differs'
        lines.append(f'{tag}\t{tp.name}\t{ident}\t{len(a)}/{len(b)}\t{eident}')
    (OUT / 'raw-diffs.tsv').write_text('\n'.join(lines) + '\n')
    print('\n'.join(lines))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
