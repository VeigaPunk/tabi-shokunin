#!/usr/bin/env python3
"""R75Scribe: check every quoted line/line-number in the r75 note and lesson Gate against
the staged sources; word counts for the <=25-word rule."""
import hashlib, json, os, re

SRC = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-75/sources'

def load(f):
    with open(os.path.join(SRC, f), encoding='utf-8') as fh:
        return fh.read().split('\n')

def norm(s):
    return re.sub(r'\s+', ' ', s).strip()

def wordcount(s):
    return len([w for w in re.split(r'\s+', norm(s)) if w])

def strip_comments(block):
    return '\n'.join(re.sub(r'^\s*#\s?', '', ln) for ln in block.split('\n'))

def check(label, f, a, b, quote, limit=None):
    lines = load(f)
    block = '\n'.join(lines[a-1:b])
    if isinstance(quote, list):
        missing = [t for t in quote if t not in block]
        ok = not missing
        stripped = False
        wc = sum(wordcount(t) for t in quote)
        if not ok:
            print(f'FAIL {label} {f}:{a}-{b} missing tokens {missing}')
            return False
        print(f'PASS {label} {f}:{a}-{b} tokens={len(quote)}')
        return True
    ok = norm(quote) in norm(block)
    stripped = False
    if not ok and norm(quote) in norm(strip_comments(block)):
        ok, stripped = True, True
    wc = wordcount(quote)
    lim = '' if limit is None else ('OK' if wc <= 25 else 'OVER-25')
    print(f"{'PASS' if ok else 'FAIL'}{' (comment-stripped)' if stripped else ''} {label} {f}:{a}-{b} words={wc} {lim}")
    if not ok:
        print('   quote:', norm(quote)[:160])
        print('   block:', norm(block)[:200])
    return ok

NOTE = [
    ('note S196 setInterceptDrags', 'Input.pdl', 265, 268,
     'Prevents default drag and drop behavior and instead emits `Input.dragIntercepted` events', True),
    ('note S196 dragIntercepted', 'Input.pdl', 332, 336,
     'Use this data with `Input.dispatchDragEvent` to restore normal drag and drop behavior', True),
    ('note S196 mask comment', 'Input.pdl', 74, 74,
     'Copy = 1, Link = 2, Move = 16', True),
    ('note S196 enum', 'Input.pdl', 81, 85,
     'enum type dragEnter dragOver drop dragCancel', True),
    ('note S197 mask setter', 'input_handler.cc', 1616, 1616,
     '.SetDragOperationsMask(drag_operations_mask)', True),
    ('note S197 unexpected type', 'input_handler.cc', 1548, 1549,
     "Unexpected event type '%s'", True),
    ('note S197 drop branch TOKENS', 'input_handler.cc', 1507, 1537,
     ['DragTargetDragOver(', 'DragTargetDrop(', 'DragSourceSystemDragEnded();', 'DragSourceEndedAt('], True),
    ('note S197 cancel branch TOKENS', 'input_handler.cc', 1538, 1546,
     ['DragSourceSystemDragEnded();', 'DragSourceEndedAt(', 'ui::mojom::DragOperation::kNone'], True),
    ('note S198 race comment', 'web_frame_widget_impl.cc', 734, 738,
     'IPC RACE CONDITION: do not allow this drop. DragTargetDragLeave(point_in_viewport, screen_point);', True),
    ('note S198 no-data return', 'web_frame_widget_impl.cc', 718, 720,
     'if (ShouldIgnoreInputEvents() || !current_drag_data_) { return; }', True),
    ('note S198 cancel clears data', 'web_frame_widget_impl.cc', 1472, 1475,
     'current_drag_data_ = nullptr;', True),
    ('note S198 enterorover early', 'web_frame_widget_impl.cc', 1500, 1508,
     'if (ShouldIgnoreInputEvents() || !current_drag_data_) { CancelDrag(); return; }', True),
    ('note S199 trydhtml policy', 'drag_controller.cc', 845, 880,
     'DataTransferAccessPolicy policy = DataTransferAccessPolicy::kTypesReadable;', True),
    ('note S199 dragexited policy', 'drag_controller.cc', 254, 272,
     'DataTransferAccessPolicy::kTypesReadable', True),
    ('note S199 performdrop readable', 'drag_controller.cc', 274, 300,
     'DataTransferAccessPolicy::kReadable', True),
    ('note S200 getData', 'data_transfer.cc', 352, 354,
     'String DataTransfer::getData(const String& type) const { if (!CanReadData()) return String();', True),
    ('note S200 CanReadData', 'data_transfer.cc', 606, 615,
     'bool DataTransfer::CanReadData() const { return policy_ == DataTransferAccessPolicy::kReadable ||', True),
    ('note S197 allow_file_access_', 'input_handler.cc', 1444, 1444,
     'allow_file_access_', True),
]

LESSON = [
    ('lesson S196 quote', 'Input.pdl', 265, 265,
     'Prevents default drag and drop behavior and instead emits `Input.dragIntercepted` events'),
    ('lesson S197 quote A', 'input_handler.cc', 1582, 1582,
     '// Only allow when Input.setInterceptDrags is disabled.'),
    ('lesson S197 quote B', 'input_handler.cc', 1539, 1539,
     'widget_host->DragSourceSystemDragEnded();'),
    ('lesson S198 quote A', 'web_frame_widget_impl.cc', 736, 737,
     '// IPC RACE CONDITION: do not allow this drop. DragTargetDragLeave(point_in_viewport, screen_point);'),
    ('lesson S198 quote B', 'web_frame_widget_impl.cc', 1474, 1474,
     'current_drag_data_ = nullptr;'),
    ('lesson S199 quote A', 'drag_controller.cc', 853, 853,
     'DataTransferAccessPolicy policy = DataTransferAccessPolicy::kTypesReadable;'),
    ('lesson S199 quote B', 'drag_controller.cc', 291, 292,
     'CreateDraggingDataTransfer( DataTransferAccessPolicy::kReadable, drag_data);'),
    ('lesson S200 quote', 'data_transfer.cc', 352, 354,
     'String DataTransfer::getData(const String& type) const { if (!CanReadData()) return String();'),
]

def main():
    print('=== note quotes')
    a = [check(*c) for c in NOTE]
    print('=== lesson quotes (<=25 words)')
    b = [check(*c, limit=True) for c in LESSON]
    print('=== file identity')
    want = {
        'Input.pdl': ('336', '5bbc6e23'),
        'input_handler.cc': ('2343', '72cf0d1d'),
        'web_frame_widget_impl.cc': ('6210', '5178b1e9'),
        'drag_controller.cc': ('1535', '4f181d76'),
        'data_transfer.cc': ('706', 'e5a7f7a1'),
    }
    for f, (n, pre) in want.items():
        raw = open(os.path.join(SRC, f), 'rb').read()
        got_n = str(raw.count(b'\n') + (0 if raw.endswith(b'\n') else 1))
        got = hashlib.sha256(raw).hexdigest()
        print(f"{f}: lines={got_n} (want {n}) sha256={got[:8]} (want {pre}) "
              f"{'PASS' if got_n == n and got.startswith(pre) else 'FAIL'}")
    print('VERDICT:', 'all quotes locate at the stated lines'
          if all(a) and all(b) else f'QUOTE MISMATCH (note {sum(a)}/{len(a)}, lesson {sum(b)}/{len(b)})')

if __name__ == '__main__':
    main()
