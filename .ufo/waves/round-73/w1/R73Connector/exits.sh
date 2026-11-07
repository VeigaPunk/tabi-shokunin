#!/usr/bin/env bash
# R73Connector — exit-code receipts for every "zero hits" claim in report.md.
# Read-only over the 20 sibling lanes; prints `rc<TAB>pattern<TAB>lanes` lines.
set -u
ROOT=/home/vgpnk/Projects/shokunin
LANES=(audio chousa game-dev-2d game-dev-3d kagi kaidoku kake kama kasegi kengaku
       kotoba kotodama kumitate lore mado mori revenger souji tameshi tsukuroi)
P=(  web_mouse_wheel_event.cc
     web_input_event_conversion.cc
     local_frame_view.cc
     wheel_event.cc
     InputEventsScaleFactor
     DeltaYInRootFrame
     synthesizePinchGesture
     touchpad_pinch_event_queue )

for pat in "${P[@]}"; do
  dirs=()
  for l in "${LANES[@]}"; do dirs+=("$ROOT/$l-shokunin"); done
  # grep exits 0 when it matched, 1 when it did not, 2 on error.
  grep -rl --binary-files=without-match --exclude-dir=node_modules -- "$pat" "${dirs[@]}" >/dev/null 2>&1
  rc=$?
  printf '%s\t%s\t%s\n' "$rc" "$pat" "${#LANES[@]}"
done

# S180-S183 URL multiplicity inside tabi's own registry (1 = unique).
for u in web_mouse_wheel_event.cc wheel_event.cc web_input_event_conversion.cc local_frame_view.cc; do
  n=$(grep -c "refs/tags/155.0.8059.84/.*$u" "$ROOT/tabi-shokunin/corpus/SOURCES.md")
  printf 'tabi-registry-rows\t%s\t%s\n' "$n" "$u"
done

# rows whose id is S180..S183 in sibling registries (id reuse, not URL duplication)
grep -c '^| S18[0-3] ' "$ROOT"/*-shokunin/corpus/SOURCES.md 2>/dev/null | cut -c1-120
