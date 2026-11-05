#!/usr/bin/env python3
"""Independent reconstruction of the round-64 wheel/scroll pixel evidence.

Independence statement
----------------------
This file imports ONLY the Python standard library (hashlib, json, struct, sys,
time, zlib).  It does not import, execute, copy or transpile any lane module:
the PNG decoder below is written from the PNG specification (RFC 2083) filter
definitions, and the constants it checks against (band table, grid geometry,
witness strip, leg table) were transcribed by hand from the fixture HTML that
sits inside the pinned driver and from the frozen counter's header, then
re-derived a second time from the committed PNG bytes themselves.  Where the
two derivations could disagree (scroll position), the pixel-only derivation is
reported separately from the receipt's claim.

What it proves, and what it does not
------------------------------------
The pixel evidence pins, per shot: dimensions, a 256-cell grid equal to the
sha256(nonce) bit string, band colours consistent with one global scroll
offset, and the per-leg witness colour.  The scroll offset is recoverable from
pixels only modulo 720 px (the band palette has period 6 * 120 px); see the
`scroll_modulus` field.  Absolute scroll is NOT a pixel-only fact.

Usage
-----
  python3 verify_pixels.py --receipt <receipt.json> --shots <dir> \
      --driver <pinned driver.mjs> [--r63-receipt F --r63-shots D [--r63-driver P]] \
      [--predict] [--forge-dir D] [--json-out F]
"""

import hashlib
import json
import os
import struct
import sys
import time
import zlib

# ---------------------------------------------------------------- constants --
VIEWPORT = (1280, 900)
BAND_HEIGHT = 120
BAND_COUNT = 25
BAND_COLORS = [(255, 0, 0), (0, 128, 0), (0, 0, 255),
               (255, 255, 0), (255, 0, 255), (0, 255, 255)]
GRID_LEFT, GRID_TOP, GRID_CELL, GRID_COLS, GRID_ROWS = 8, 8, 4, 32, 8
WITNESS_BOX = (900, 600, 200, 50)          # fixed div: left, top, width, height
WITNESS_POINT = (1000, 625)                # the counter's single sample point
BAND_SAMPLE_X = 1000
BAND_SAMPLE_Y = [60, 180, 300, 420]
DOC_HEIGHT = 3000                          # #tall height in the fixture
LEG_NAMES = ['start', 'down1', 'down2', 'up1', 'swallowed', 'released']
LEG_WITNESS = {'start': (10, 20, 30), 'down1': (40, 50, 60), 'down2': (70, 80, 90),
               'up1': (100, 110, 120), 'swallowed': (130, 140, 150),
               'released': (160, 170, 180)}
# A column with no fixed overlay on it (grid ends at x=135, witness starts at 900).
CLEAN_COLUMN_X = 700

PNG_SIG = b'\x89PNG\r\n\x1a\n'


# ------------------------------------------------------------- PNG decoding --
def _paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


def decode_png(path):
    """Decode an 8-bit non-interlaced gray/RGB/RGBA PNG. Returns (w, h, rgba)."""
    with open(path, 'rb') as fh:
        data = fh.read()
    if data[:8] != PNG_SIG:
        raise ValueError('not a png: %s' % path)
    off = 8
    width = height = bit_depth = color_type = interlace = None
    idat = bytearray()
    chunk_types = []
    while off + 8 <= len(data):
        (length,) = struct.unpack('>I', data[off:off + 4])
        ctype = data[off + 4:off + 8]
        body = data[off + 8:off + 8 + length]
        (crc,) = struct.unpack('>I', data[off + 8 + length:off + 12 + length])
        if (zlib.crc32(ctype + body) & 0xffffffff) != crc:
            raise ValueError('bad crc in %s chunk of %s' % (ctype, path))
        chunk_types.append(ctype.decode('ascii'))
        if ctype == b'IHDR':
            width, height, bit_depth, color_type, _comp, _filt, interlace = \
                struct.unpack('>IIBBBBB', body)
        elif ctype == b'IDAT':
            idat += body
        elif ctype == b'IEND':
            break
        off += 12 + length
    if bit_depth != 8:
        raise ValueError('unsupported bit depth %r' % bit_depth)
    if interlace != 0:
        raise ValueError('interlaced png unsupported')
    channels = {0: 1, 2: 3, 6: 4}.get(color_type)
    if channels is None:
        raise ValueError('unsupported color type %r' % color_type)
    raw = zlib.decompress(bytes(idat))
    stride = width * channels
    if len(raw) != height * (stride + 1):
        raise ValueError('idat size mismatch in %s' % path)

    out = bytearray(width * height * 4)
    prev = bytearray(stride)
    pos = 0
    for y in range(height):
        ftype = raw[pos]
        pos += 1
        line = bytearray(raw[pos:pos + stride])
        pos += stride
        if ftype == 1:                                  # Sub
            for i in range(channels, stride):
                line[i] = (line[i] + line[i - channels]) & 0xff
        elif ftype == 2:                                # Up
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xff
        elif ftype == 3:                                # Average
            for i in range(stride):
                a = line[i - channels] if i >= channels else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 0xff
        elif ftype == 4:                                # Paeth
            for i in range(stride):
                a = line[i - channels] if i >= channels else 0
                c = prev[i - channels] if i >= channels else 0
                line[i] = (line[i] + _paeth(a, prev[i], c)) & 0xff
        elif ftype != 0:
            raise ValueError('unknown filter type %r' % ftype)
        base = y * width * 4
        if channels == 4:
            out[base:base + width * 4] = line
        elif channels == 3:
            for x in range(width):
                out[base + x * 4:base + x * 4 + 3] = line[x * 3:x * 3 + 3]
                out[base + x * 4 + 3] = 0xff
        else:
            for x in range(width):
                v = line[x]
                out[base + x * 4] = v
                out[base + x * 4 + 1] = v
                out[base + x * 4 + 2] = v
                out[base + x * 4 + 3] = 0xff
        prev = line
    return width, height, out, chunk_types


class Shot:
    def __init__(self, path):
        self.path = path
        self.sha256 = hashlib.sha256(open(path, 'rb').read()).hexdigest()
        self.bytes = os.path.getsize(path)
        self.width, self.height, self.rgba, self.chunks = decode_png(path)

    def pixel(self, x, y):
        if not (0 <= x < self.width and 0 <= y < self.height):
            return None
        i = (y * self.width + x) * 4
        return (self.rgba[i], self.rgba[i + 1], self.rgba[i + 2], self.rgba[i + 3])


# ------------------------------------------------------------ PNG encoding --
def encode_png(width, height, rgba):
    stride = width * 4
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        raw += rgba[y * stride:(y + 1) * stride]

    def chunk(tag, payload):
        return (struct.pack('>I', len(payload)) + tag + payload +
                struct.pack('>I', zlib.crc32(tag + payload) & 0xffffffff))

    return (PNG_SIG +
            chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)) +
            chunk(b'IDAT', zlib.compress(bytes(raw), 6)) +
            chunk(b'IEND', b''))


# ------------------------------------------------------------- derivations --
def nonce_bits(nonce):
    """sha256(nonce) -> first 32 bytes -> 256 bits, MSB first per byte."""
    digest = hashlib.sha256(nonce.encode('utf-8')).digest()[:32]
    return [(byte >> (7 - k)) & 1 for byte in digest for k in range(8)]


def expected_band_color(scroll_y, k):
    doc_y = scroll_y + BAND_SAMPLE_Y[k]
    return BAND_COLORS[(doc_y // BAND_HEIGHT) % len(BAND_COLORS)]


def render_fixture(driver_source, nonce):
    """Re-render the fixture bytes from the pinned driver source (string ops only)."""
    begin = driver_source.index('/*WHEEL-FIXTURE-BEGIN*/')
    marker = 'const WHEEL_TEMPLATE = `'
    start = driver_source.index(marker, begin) + len(marker)
    end = driver_source.index('`;', start)
    template = driver_source[start:end]
    bands = ''.join(
        '<div class="band" style="top:%dpx;background:rgb(%d,%d,%d)"></div>'
        % (i * BAND_HEIGHT, *BAND_COLORS[i % len(BAND_COLORS)])
        for i in range(BAND_COUNT))
    rendered = template.replace('__NONCE__', nonce).replace('__BANDS__', bands)
    rendered = rendered.replace(
        'const digest = window.__nonceBits;',
        'const digest = ' + json.dumps(nonce_bits(nonce), separators=(',', ':')) + ';',
        1)
    return rendered.encode('utf-8')


# ------------------------------------------------------------ pixel checks --
def check_grid(shot, bits):
    """256 cells against sha256(nonce) bits, plus full-area strictness."""
    cell_errors = []
    for row in range(GRID_ROWS):
        for col in range(GRID_COLS):
            want = 255 if bits[row * GRID_COLS + col] else 0
            px = shot.pixel(GRID_LEFT + col * GRID_CELL + 2, GRID_TOP + row * GRID_CELL + 2)
            if px != (want, want, want, 255):
                cell_errors.append({'row': row, 'col': col, 'want': want, 'got': px})
    # stronger than the counter: every pixel of the 128x32 grid box must be
    # black, or white inside a lit cell.
    area_errors = 0
    for y in range(GRID_TOP, GRID_TOP + GRID_ROWS * GRID_CELL):
        for x in range(GRID_LEFT, GRID_LEFT + GRID_COLS * GRID_CELL):
            col = (x - GRID_LEFT) // GRID_CELL
            row = (y - GRID_TOP) // GRID_CELL
            want = 255 if bits[row * GRID_COLS + col] else 0
            px = shot.pixel(x, y)
            if px is None or px[0] != want or px[1] != want or px[2] != want:
                area_errors += 1
    return {'cells_checked': GRID_ROWS * GRID_COLS,
            'cell_errors': cell_errors[:8],
            'cell_error_count': len(cell_errors),
            'area_pixels_checked': GRID_ROWS * GRID_CELL * GRID_COLS * GRID_CELL,
            'area_error_count': area_errors,
            'ok': not cell_errors and area_errors == 0}


def check_witness(shot, want):
    point = shot.pixel(*WITNESS_POINT)
    left, top, w, h = WITNESS_BOX
    mismatched = 0
    for y in range(top, top + h):
        for x in range(left, left + w):
            px = shot.pixel(x, y)
            if px is None or (px[0], px[1], px[2]) != want:
                mismatched += 1
    # the strip must end exactly at its declared box
    outside = [shot.pixel(left - 1, top + 5), shot.pixel(left + w, top + 5)]
    return {'point': WITNESS_POINT, 'want': list(want), 'got': list(point[:3]) if point else None,
            'strip_pixels': w * h, 'strip_mismatch': mismatched,
            'just_outside_left': list(outside[0][:3]) if outside[0] else None,
            'just_outside_right': list(outside[1][:3]) if outside[1] else None,
            'ok': point is not None and tuple(point[:3]) == tuple(want) and mismatched == 0}


def check_bands(shot, scroll_y):
    samples = []
    ok = True
    for k, y in enumerate(BAND_SAMPLE_Y):
        want = expected_band_color(scroll_y, k)
        got = shot.pixel(BAND_SAMPLE_X, y)
        got3 = tuple(got[:3]) if got else None
        samples.append({'y': y, 'want': list(want), 'got': list(got3) if got3 else None,
                        'ok': got3 == want})
        ok = ok and got3 == want
    # full-column agreement with ONE global scroll offset (clean column, no overlays)
    palette = set(BAND_COLORS)
    column_mismatch = 0
    overlay_rows = []
    for y in range(shot.height):
        want = BAND_COLORS[((scroll_y + y) // BAND_HEIGHT) % len(BAND_COLORS)]
        px = shot.pixel(CLEAN_COLUMN_X, y)
        if px is None:
            column_mismatch += 1               # outside the image: not band evidence
            continue
        got = (px[0], px[1], px[2])
        if got == want:
            continue
        if got in palette:
            column_mismatch += 1                 # band-coloured, but the wrong band
        else:
            overlay_rows.append(y)               # not band evidence (scrollbar/overlay)
    return {'samples': samples, 'column_x': CLEAN_COLUMN_X,
            'column_rows_checked': shot.height, 'column_mismatch': column_mismatch,
            'overlay_rows': len(overlay_rows),
            'overlay_row_range': [min(overlay_rows), max(overlay_rows)] if overlay_rows else None,
            'ok': ok and column_mismatch == 0}


def derive_scroll(shot):
    """Scroll offset from pixels only.

    A band colour at viewport row y fixes floor((scrollY + y) / 120) mod 6.  One
    row gives an interval of width 120 for scrollY, not a point, so the whole
    offset is recovered by intersecting the four sample rows over the period
    (6 bands = 720 px) and keeping every offset that reproduces all four
    observations.  Nothing from the receipt is used here.
    """
    colours = {c: i for i, c in enumerate(BAND_COLORS)}
    period = BAND_HEIGHT * len(BAND_COLORS)          # 720 px
    observed = []
    detail = []
    for y in BAND_SAMPLE_Y:
        px = shot.pixel(CLEAN_COLUMN_X, y)
        idx = None if px is None else colours.get((px[0], px[1], px[2]))
        detail.append({'y': y, 'rgb': list(px[:3]) if px else None, 'band_index_mod6': idx})
        if idx is None:
            return {'ok': False, 'reason': 'band colour at y=%d is not in the palette' % y,
                    'detail': detail}
        observed.append(idx)
    residues = [r for r in range(period)
                if all(((r + y) // BAND_HEIGHT) % len(BAND_COLORS) == idx
                       for y, idx in zip(BAND_SAMPLE_Y, observed))]
    # geometric half: colour changes in a clean column fall on band boundaries,
    # except where the browser paints the horizontal scrollbar.
    boundaries = [y for y in range(1, shot.height)
                  if (shot.pixel(CLEAN_COLUMN_X, y) or ())[:3]
                  != (shot.pixel(CLEAN_COLUMN_X, y - 1) or ())[:3]]
    palette_rows = [y for y in range(shot.height)
                    if (shot.pixel(CLEAN_COLUMN_X, y) or ())[:3] in colours]
    band_boundaries = [b for b in boundaries if b in palette_rows]
    non_palette_rows = shot.height - len(palette_rows)
    boundary_phase = sorted({b % BAND_HEIGHT for b in band_boundaries})
    # One sample row fixes a 120 px window for scrollY; the boundaries fix its
    # phase mod 120.  Intersecting both over the 720 px palette period leaves a
    # single residue.
    colour_window = [r for r in range(period)
                     if all(((r + y) // BAND_HEIGHT) % len(BAND_COLORS) == idx
                            for y, idx in zip(BAND_SAMPLE_Y, observed))]
    if len(boundary_phase) == 1:
        residues = [r for r in colour_window if r % BAND_HEIGHT == boundary_phase[0]]
    else:
        residues = []
    visible_height = shot.height - non_palette_rows
    max_scroll = DOC_HEIGHT - visible_height
    candidates = sorted({r + m * period for r in residues
                         for m in range(0, max_scroll // period + 1) if r + m * period <= max_scroll})
    return {'ok': bool(residues) and len(boundary_phase) == 1,
            'observed_band_index_mod6': observed,
            'colour_window_size': len(colour_window),
            'colour_window_range': [min(colour_window), max(colour_window)] if colour_window else None,
            'residues_mod_720': residues,
            'residue': residues[0] if len(residues) == 1 else None,
            'unique_in_period': len(residues) == 1,
            'candidates_in_doc_range': candidates,
            'band_boundary_rows': band_boundaries,
            'boundary_phase_mod_120': boundary_phase,
            'non_palette_rows': non_palette_rows,
            'visible_height_from_pixels': visible_height,
            'non_palette_row_range': ([min(y for y in range(shot.height) if y not in palette_rows),
                                       max(y for y in range(shot.height) if y not in palette_rows)]
                                      if non_palette_rows else None),
            'detail': detail,
            'note': ('pixels determine scrollY mod %d only; %s are pixel-identical'
                     % (period, candidates))}


# --------------------------------------------- independent re-derivation of --
# The 29 checks below are re-implemented from the counter's documented intent,
# in Python, without reading the counter at run time.  The point is to be able
# to say "the receipt fails exactly these checks" from first principles and
# then compare that list with the Node counter's own output.
EXPECTED_SCROLL = {'start': 0, 'down1': 120, 'down2': 240, 'up1': 120,
                   'swallowed': 120, 'released': 240}
EXPECTED_LEN = {'start': 0, 'down1': 1, 'down2': 2, 'up1': 3, 'swallowed': 4, 'released': 5}
EXPECTED_DELTA_Y = [120, 120, -120, 120, 120]
EXPECTED_AT_DISPATCH = [0, 120, 240, 120, 120]
REQUIRED_ARGV = ['--headless=new', '--disable-extensions',
                 '--remote-debugging-address=127.0.0.1', '--disable-smooth-scrolling',
                 '--force-device-scale-factor=1']


def _px3(shot, x, y):
    if shot is None:
        return None
    px = shot.pixel(x, y)
    return None if px is None else (px[0], px[1], px[2])


def _is_hex64(v):
    return isinstance(v, str) and len(v) == 64 and all(c in '0123456789abcdef' for c in v)


def predict_findings(receipt, shots_dir, driver_path):
    findings = []
    driver_source = open(driver_path, encoding='utf-8').read()
    driver_sha = hashlib.sha256(driver_source.encode('utf-8')).hexdigest()
    try:
        fixture_sha = hashlib.sha256(render_fixture(driver_source, receipt.get('nonce') or '')).hexdigest()
    except Exception:                                  # noqa: BLE001
        fixture_sha = None
    legs = receipt.get('legs') if isinstance(receipt.get('legs'), list) else []
    leg_map = {leg.get('name'): leg for leg in legs if isinstance(leg, dict)}
    wl = receipt.get('wheellog') if isinstance(receipt.get('wheellog'), list) else []
    shots = {}
    for leg in legs:
        try:
            shots[leg.get('name')] = Shot(os.path.join(shots_dir, str(leg.get('shot'))))
        except Exception:                              # noqa: BLE001
            shots[leg.get('name')] = None
    bits = nonce_bits(receipt.get('nonce') or '')

    def check(ok, cid):
        if not ok:
            findings.append(cid)

    check(receipt.get('schema') == 'tabi-chrome-cdp-r64', 'schema')
    nonce = receipt.get('nonce') or ''
    check(nonce.startswith('tabi-r64-') and len(nonce) > 9
          and all(c in 'abcdefghijklmnopqrstuvwxyz0123456789-' for c in nonce[9:])
          and receipt.get('nonceOnPage') == receipt.get('nonce'), 'nonce-binding')
    check(_is_hex64(receipt.get('driverSha256')) and receipt.get('driverSha256') == driver_sha, 'driver-binding')
    check(_is_hex64((receipt.get('fixture') or {}).get('sha256'))
          and (receipt.get('fixture') or {}).get('sha256') == fixture_sha, 'fixture-binding')
    fx = receipt.get('fixture') or {}
    check(isinstance(fx.get('origin'), str) and fx.get('origin').startswith('http://127.0.0.1:')
          and fx.get('origin')[len('http://127.0.0.1:'):].isdigit()
          and fx.get('target') == 'tall'
          and (fx.get('viewport') or {}).get('width') == VIEWPORT[0]
          and (fx.get('viewport') or {}).get('height') == VIEWPORT[1]
          and fx.get('deviceScaleFactor') == 1 and fx.get('bandHeight') == BAND_HEIGHT, 'loopback-origin')
    argv = (receipt.get('host') or {}).get('argv')
    check(isinstance(argv, list) and all(a in argv for a in REQUIRED_ARGV), 'launch-guards')
    check(len(legs) == 6 and all(legs[i].get('name') == LEG_NAMES[i] for i in range(6)), 'legs-shape')
    check(all(leg_map.get(k, {}).get('scrollY') == EXPECTED_SCROLL[k] for k in LEG_NAMES), 'scroll-arithmetic')
    check(all(leg_map.get(k, {}).get('wheellogLen') == EXPECTED_LEN[k] for k in LEG_NAMES), 'wheellog-count')
    check(len(wl) == 5 and all(e.get('seq') == i + 1 for i, e in enumerate(wl))
          and len({e.get('seq') for e in wl}) == 5, 'wheellog-sequence')
    check(len(wl) == 5 and all(e.get('deltaY') == EXPECTED_DELTA_Y[i] for i, e in enumerate(wl)),
          'delta-y-passthrough')
    check(len(wl) == 5 and all(e.get('deltaX') == 0 and e.get('deltaZ') == 0
                               and e.get('deltaMode') == 0 for e in wl), 'delta-mode-pixels')
    check(len(wl) == 5 and all(e.get('type') == 'wheel' and e.get('isTrusted') is True
                               and isinstance(e.get('ts'), (int, float)) and e.get('ts') >= 0
                               and e.get('cancelable') is True and e.get('ctrlKey') is False
                               and e.get('shiftKey') is False and e.get('altKey') is False
                               and e.get('metaKey') is False for e in wl), 'trusted-fields')
    check(len(wl) == 5 and all(e.get('defaultPrevented') == (i == 3) for i, e in enumerate(wl)),
          'cancelation')
    check(len(wl) == 5 and all(e.get('targetId') == 'tall'
                               and e.get('scrollYAtDispatch') == EXPECTED_AT_DISPATCH[i]
                               for i, e in enumerate(wl)), 'target-binding')
    page = receipt.get('pageState') or {}
    check(len(wl) == 5 and page.get('scrollEvents') == len([e for e in wl if not e.get('defaultPrevented')]),
          'scroll-event-witness')
    check(len(legs) == 6 and all(leg.get('shot') == leg.get('name') + '.png'
                                 and _is_hex64(leg.get('shotSha256'))
                                 and isinstance(leg.get('shotBytes'), int) and leg.get('shotBytes') > 0
                                 for leg in legs), 'shot-records')
    check(len(legs) == 6 and all(shots.get(leg.get('name')) is not None
                                 and shots[leg.get('name')].width == VIEWPORT[0]
                                 and shots[leg.get('name')].height == VIEWPORT[1]
                                 and shots[leg.get('name')].sha256 == leg.get('shotSha256')
                                 and shots[leg.get('name')].bytes == leg.get('shotBytes')
                                 for leg in legs), 'shot-bytes')
    check(len(legs) == 6 and all(shots.get(leg.get('name')) is not None
                                 and check_grid(shots[leg.get('name')], bits)['ok']
                                 for leg in legs), 'nonce-pixels')
    check(len(legs) == 6 and all(shots.get(leg.get('name')) is not None
                                 and check_bands(shots[leg.get('name')], leg.get('scrollY'))['ok']
                                 for leg in legs), 'scroll-pixels')
    check(len(legs) == 6 and all(shots.get(leg.get('name')) is not None
                                 and tuple(leg.get('witnessRgb') or ()) == LEG_WITNESS.get(leg.get('name'))
                                 and leg.get('witness') == leg.get('name')
                                 and _px3(shots.get(leg.get('name')), *WITNESS_POINT)
                                 == LEG_WITNESS.get(leg.get('name'))
                                 for leg in legs), 'leg-witness')
    slog = receipt.get('serverLog')
    check(isinstance(slog, list)
          and any(e.get('path') == '/' and e.get('status') == 200 and e.get('run') == receipt.get('nonce')
                  for e in slog)
          and all(e.get('path') in ('/', '/favicon.ico') for e in slog), 'server-witness')
    host = receipt.get('host') or {}
    cdp, chromium = host.get('cdpProduct') or '', host.get('chromium') or ''
    check(cdp.startswith('Chrome/1') and chromium.startswith('Chromium 1')
          and cdp.split('/')[1].split('.')[0] == chromium.split(' ')[1].split('.')[0]
          if (len(cdp.split('/')) > 1 and len(chromium.split(' ')) > 1) else False, 'host-identity')
    td = receipt.get('teardown') or {}
    # JS semantics: the key must be PRESENT and exactly null, not merely absent.
    check(td.get('postKillSweepCount') == 0 and td.get('survivors') == []
          and 'sweepError' in td and td['sweepError'] is None, 'survivors')
    check((td.get('portProbes') or {}).get('fixture') == 'closed'
          and (td.get('portProbes') or {}).get('devtools') == 'closed'
          and (td.get('postKillCurl') or {}).get('fixture') == 7
          and (td.get('postKillCurl') or {}).get('devtools') == 7, 'closed-ports')
    sw = receipt.get('sweeps') or {}
    check(sw.get('preLaunch') == 0 and (sw.get('midRun') or 0) > 0 and sw.get('postKill') == 0,
          'launch-witness')
    check(receipt.get('failures') == [], 'failures')
    check(receipt.get('predicate') is True and receipt.get('wheelHypothesis') == 'CONFIRMED',
          'producer-verdict')
    check(page.get('scrollY') == 240 and page.get('wheellogLen') == 5, 'page-final-state')
    return findings


# --------------------------------------------------------------- the phases --
def phase_pixels(receipt, shots_dir, driver_path):
    nonce = receipt['nonce']
    bits = nonce_bits(nonce)
    legs = receipt['legs']
    report = {'nonce': nonce, 'nonce_sha256': hashlib.sha256(nonce.encode()).hexdigest(),
              'nonce_bit_string': ''.join(str(b) for b in bits), 'legs': [], 'ok': True}
    driver_source = open(driver_path, encoding='utf-8').read()
    driver_sha = hashlib.sha256(driver_source.encode('utf-8')).hexdigest()
    fixture_sha = hashlib.sha256(render_fixture(driver_source, nonce)).hexdigest()
    report['driver'] = {
        'path': driver_path,
        'sha256': driver_sha,
        'receipt_driverSha256': receipt.get('driverSha256'),
        'matches_receipt': driver_sha == receipt.get('driverSha256'),
    }
    report['fixture'] = {
        'rerendered_sha256': fixture_sha,
        'receipt_sha256': receipt.get('fixture', {}).get('sha256'),
        'matches_receipt': fixture_sha == receipt.get('fixture', {}).get('sha256'),
    }
    for leg in legs:
        path = os.path.join(shots_dir, str(leg.get('shot')))
        entry = {'name': leg.get('name'), 'shot': leg.get('shot'), 'path': path,
                 'receipt_scrollY': leg.get('scrollY')}
        try:
            shot = Shot(path)
        except Exception as exc:                     # noqa: BLE001 - reported, not raised
            entry['error'] = repr(exc)
            entry['ok'] = False
            report['legs'].append(entry)
            report['ok'] = False
            continue
        entry['dimensions'] = [shot.width, shot.height]
        entry['dimensions_ok'] = (shot.width, shot.height) == VIEWPORT
        entry['bytes'] = shot.bytes
        entry['sha256'] = shot.sha256
        entry['receipt_sha256'] = leg.get('shotSha256')
        entry['sha_ok'] = shot.sha256 == leg.get('shotSha256')
        entry['bytes_ok'] = shot.bytes == leg.get('shotBytes')
        entry['png_chunks'] = shot.chunks
        entry['grid'] = check_grid(shot, bits)
        entry['bands'] = check_bands(shot, leg.get('scrollY') or 0)
        entry['witness'] = check_witness(shot, LEG_WITNESS.get(leg.get('name'), (0, 0, 0)))
        entry['witness_receipt_matches_table'] = tuple(leg.get('witnessRgb') or ()) == LEG_WITNESS.get(leg.get('name'))
        derived = derive_scroll(shot)
        entry['scroll_derived'] = derived
        entry['scroll_derived_equals_receipt'] = derived.get('residue') == leg.get('scrollY')
        entry['ok'] = all([entry['dimensions_ok'], entry['sha_ok'], entry['bytes_ok'],
                           entry['grid']['ok'], entry['bands']['ok'], entry['witness']['ok'],
                           entry['scroll_derived_equals_receipt'],
                           entry['witness_receipt_matches_table']])
        report['ok'] = report['ok'] and entry['ok']
        report['legs'].append(entry)
    # cross-leg: two legs with different scroll must not share bytes
    digests = {}
    for leg in report['legs']:
        digests.setdefault(leg.get('sha256'), []).append(leg['name'])
    report['distinct_shot_digests'] = len(digests)
    report['shared_digests'] = {k: v for k, v in digests.items() if len(v) > 1}
    report['ok'] = report['ok'] and not report['shared_digests']
    return report


def phase_r63(receipt_path, shots_dir, driver_path):
    """What the r63 generation committed, read with the r64 pixel vocabulary."""
    receipt = json.load(open(receipt_path, encoding='utf-8'))
    out = {'receipt': receipt_path, 'schema': receipt.get('schema'),
           'nonce': receipt.get('nonce'), 'steps': [], 'leg_fields': {}}
    legs = receipt.get('legs') or []
    out['leg_fields'] = sorted({k for leg in legs for k in leg})
    out['leg_has_shot_field'] = any('shot' in leg for leg in legs)
    out['leg_has_witness_field'] = any('witnessRgb' in leg for leg in legs)
    out['step_count'] = len(receipt.get('steps') or [])
    out['distinct_step_digests'] = len({s.get('sha256') for s in receipt.get('steps') or []})
    bits = nonce_bits(receipt['nonce'])
    for step in receipt.get('steps') or []:
        path = os.path.join(shots_dir, step['png'])
        entry = {'name': step['name'], 'png': step['png']}
        try:
            shot = Shot(path)
        except Exception as exc:                     # noqa: BLE001
            entry['error'] = repr(exc)
            out['steps'].append(entry)
            continue
        entry['dimensions'] = [shot.width, shot.height]
        entry['sha256'] = shot.sha256
        entry['receipt_sha256'] = step['sha256']
        entry['sha_ok'] = shot.sha256 == step['sha256']
        entry['grid'] = check_grid(shot, bits)
        # what the r64 checks would demand of this shot for each candidate leg
        entry['band_rows'] = [{'y': y, 'rgb': list(shot.pixel(BAND_SAMPLE_X, y)[:3])}
                              for y in BAND_SAMPLE_Y]
        entry['witness_point'] = list(shot.pixel(*WITNESS_POINT)[:3])
        entry['derive'] = derive_scroll(shot)
        out['steps'].append(entry)
    # what the r63 fixture actually renders: no grid, no bands, no witness strip
    try:
        src = open(driver_path, encoding='utf-8').read()
        block = src[src.index('/*WHEEL-FIXTURE-BEGIN*/'):src.index('/*WHEEL-FIXTURE-END*/')]
        out['r63_fixture_has_noncegrid'] = 'noncegrid' in block
        out['r63_fixture_has_band'] = 'class="band"' in block
        out['r63_fixture_has_witness'] = 'id="witness"' in block
        out['r63_fixture_has_digest_hook'] = '__nonceBits' in block
        out['r63_fixture_sha256'] = hashlib.sha256(block.encode('utf-8')).hexdigest()
    except Exception as exc:                          # noqa: BLE001
        out['fixture_error'] = repr(exc)
    out['receipt_fixture_sha256'] = (receipt.get('fixture') or {}).get('sha256')
    out['server_log_entries'] = receipt.get('serverLog')
    out['host_keys'] = sorted((receipt.get('host') or {}).keys())
    return out


def phase_forge(receipt, out_dir):
    """Cost of satisfying the pixel checks without rendering anything."""
    t0 = time.time()
    bits = nonce_bits(receipt['nonce'])
    os.makedirs(out_dir, exist_ok=True)
    written = []
    for leg in receipt['legs']:
        rgba = bytearray(VIEWPORT[0] * VIEWPORT[1] * 4)
        for y in range(VIEWPORT[1]):
            colour = BAND_COLORS[((leg['scrollY'] + y) // BAND_HEIGHT) % len(BAND_COLORS)]
            row = bytes(colour) + b'\xff'
            rgba[y * VIEWPORT[0] * 4:(y + 1) * VIEWPORT[0] * 4] = row * VIEWPORT[0]
        for row in range(GRID_ROWS):
            for col in range(GRID_COLS):
                # the fixture paints the whole grid box #000000 first
                for dy in range(GRID_CELL):
                    for dx in range(GRID_CELL):
                        x = GRID_LEFT + col * GRID_CELL + dx
                        y = GRID_TOP + row * GRID_CELL + dy
                        i = (y * VIEWPORT[0] + x) * 4
                        rgba[i:i + 4] = (b'\xff\xff\xff\xff' if bits[row * GRID_COLS + col]
                                         else b'\x00\x00\x00\xff')
        left, top, w, h = WITNESS_BOX
        colour = bytes(LEG_WITNESS[leg['name']]) + b'\xff'
        for y in range(top, top + h):
            rgba[(y * VIEWPORT[0] + left) * 4:(y * VIEWPORT[0] + left + w) * 4] = colour * w
        path = os.path.join(out_dir, leg['shot'])
        with open(path, 'wb') as fh:
            fh.write(encode_png(VIEWPORT[0], VIEWPORT[1], rgba))
        written.append(path)
    elapsed = time.time() - t0
    results = []
    for leg, path in zip(receipt['legs'], written):
        shot = Shot(path)
        results.append({'name': leg['name'], 'dimensions_ok': (shot.width, shot.height) == VIEWPORT,
                        'grid': check_grid(shot, bits)['ok'],
                        'bands': check_bands(shot, leg['scrollY'])['ok'],
                        'witness': check_witness(shot, LEG_WITNESS[leg['name']])['ok'],
                        'sha256': shot.sha256, 'bytes': shot.bytes})
    return {'out_dir': out_dir, 'seconds': round(elapsed, 3),
            'all_pixel_checks_pass': all(r['grid'] and r['bands'] and r['witness'] and r['dimensions_ok']
                                         for r in results),
            'shots': results}


def main(argv):
    opts = {}
    i = 0
    while i < len(argv):
        if argv[i].startswith('--'):
            if i + 1 < len(argv) and not argv[i + 1].startswith('--'):
                opts[argv[i][2:]] = argv[i + 1]
                i += 2
            else:
                opts[argv[i][2:]] = True
                i += 1
        else:
            i += 1
    receipt_path = opts.get('receipt')
    shots_dir = opts.get('shots')
    driver_path = opts.get('driver')
    if not (receipt_path and shots_dir and driver_path):
        print(__doc__)
        return 2
    t0 = time.time()
    receipt = json.load(open(receipt_path, encoding='utf-8'))
    report = {'schema': 'tabi-r64-revenger-python-verifier',
              'receipt': receipt_path, 'shots': shots_dir, 'driver': driver_path}
    report['pixels'] = phase_pixels(receipt, shots_dir, driver_path)
    if opts.get('r63-receipt'):
        report['r63'] = phase_r63(opts['r63-receipt'], opts.get('r63-shots'),
                                  opts.get('r63-driver') or driver_path)
    if opts.get('predict'):
        # The r63 receipt is predicted against the SAME (r64) driver the counter
        # was invoked with, because that is what the red-before control does.
        report['predicted'] = {'main': predict_findings(receipt, shots_dir, driver_path)}
        if opts.get('r63-receipt'):
            report['predicted']['r63'] = predict_findings(
                json.load(open(opts['r63-receipt'], encoding='utf-8')),
                opts.get('r63-shots'), driver_path)
    if opts.get('forge-dir'):
        report['forge'] = phase_forge(receipt, opts['forge-dir'])
    report['elapsed_seconds'] = round(time.time() - t0, 3)
    report['verdict'] = 'pass' if report['pixels']['ok'] else 'fail'
    text = json.dumps(report, indent=1, sort_keys=False)
    if opts.get('json-out'):
        with open(opts['json-out'], 'w', encoding='utf-8') as fh:
            fh.write(text + '\n')
    print(text)
    return 0 if report['verdict'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
