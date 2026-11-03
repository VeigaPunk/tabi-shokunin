#!/usr/bin/env python3
"""Generate frozen r61 f1-f4 and the C5' nonce-tamper control f5.

Usage: python3 f-probes-r61.py RECEIPT [--out-dir DIR]
The default output is f-probes/ beside this script. No browser is run.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('receipt', type=Path)
    parser.add_argument('--out-dir', type=Path, default=Path(__file__).resolve().parent / 'f-probes')
    args = parser.parse_args()
    source = args.receipt.read_bytes()
    receipt = json.loads(source)
    log = receipt['ptrlog']
    down = next(i for i, event in enumerate(log) if event['type'] == 'pointerdown')
    move = next(i for i, event in enumerate(log) if event['type'] == 'pointermove')
    # Resolve all mutation prerequisites before writing any output.
    log[down]['pointerId']
    log[move]['isTrusted']
    receipt['plainTrace']['entries'][-1]['valueAfter']
    args.out_dir.mkdir(parents=True, exist_ok=True)
    manifest = {'schema': 'tabi-r61-f-probes', 'source': str(args.receipt.resolve()),
                'sourceSha256': hashlib.sha256(source).hexdigest(), 'probes': []}
    for number in range(1, 6):
        forged = copy.deepcopy(receipt)
        if number == 1:
            for event in forged['ptrlog']:
                event['pointerType'] = 'touch'
        elif number == 2:
            del forged['ptrlog'][down]
        elif number == 3:
            del forged['ptrlog'][down]['pointerId']
        elif number == 4:
            del forged['ptrlog'][move]['isTrusted']
        else:
            forged['plainTrace']['entries'][-1]['valueAfter'] += '!'
        target = args.out_dir / f'probe-f{number}.receipt.json'
        data = (json.dumps(forged, indent=1) + '\n').encode()
        target.write_bytes(data)
        manifest['probes'].append({'id': f'f{number}', 'file': target.name,
                                   'sha256': hashlib.sha256(data).hexdigest(),
                                   'frozenSetF': number <= 4})
    (args.out_dir / 'manifest.json').write_text(json.dumps(manifest, indent=1) + '\n')
    print(json.dumps(manifest, indent=1))


if __name__ == '__main__':
    main()
