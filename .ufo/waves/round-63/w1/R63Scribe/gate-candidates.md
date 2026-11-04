# Gate candidates — round 63 wheel/scroll (seat R63Scribe)

Draft Gate for the round-63 lesson / knowledge entry. Two candidates admitted
(scoped), two scoped rejections of what the admitted rows may NOT be used for,
and one rejected candidate with a flip condition. Every quote below is located
in the staged bytes at the freeze commit
`816592612dd2a8073437c595d3fe3c477125cf3c`.

House shape (from `corpus/lessons/round-58.md` and `corpus/lessons/round-62.md`):
`| Candidate | Decision | Located evidence / flip |`.

## Candidate list

```
| Candidate | Decision | Located evidence / flip |
|---|---|---|
| S166 MDN WheelEvent — https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent | Admit scoped delta semantics, tier B/docs | Quote (11 words): "Returns a double representing the vertical scroll amount." Located in the Instance-properties list of `.ufo/waves/round-63/sources/s166b-mdn-wheelevent.html` line 1681 (the `deltaY` entry at line 1679); the `deltaMode` entry at line 1687/1689 supplies the unit wording. Staged sha256 `78bd40dc50dc71b9cb395dd9d7f4f58edb20cf3b77b6e24dd5832b79f476c2d1`. It grounds that an event's own `deltaY` is the vertical scroll amount and that `deltaMode` names the unit of the delta values, so the receipt records the event's own delta fields instead of inferring them. |
| S166 as support for pixel-unit identity, `isTrusted`, `cancelable` or the scroll arithmetic | Reject | The page describes property semantics only: it supplies no cross-build pixel guarantee and no delivery, cancelability or measurement contract. The `deltaMode 0` observed here, the trusted-field flags and the exact ±120 arithmetic are all measured, not sourced. Flip: a normative unit rule that binds `deltaMode 0` to CSS pixels, plus a measured second build, would ground the unit claim; nothing in the current bytes does. |
| S167 CSSOM View — https://drafts.csswg.org/cssom-view/ | Admit scoped scroll-position attribute class, tier A/spec | Quote (14 words): "The scrollTop attribute, on getting, must return the result of running these steps" — §6 "Extensions to the Element Interface", staged `.ufo/waves/round-63/sources/s167-cssom-view.html` line 3357; the IDL types the attribute `unrestricted double scrollTop` at line 2977. Staged sha256 `51a7efdb30a9aa946e50b395dafb417d0305e54bd71e1b23faa6ce0af05abb99`. It grounds the scroll-position witness as a spec-defined attribute class; the accessor actually used here (`window.scrollY`) is measured, not sourced. |
| S167 as a cancelation or smooth-scrolling authority | Reject | The quote is the getter definition only: it defines what `scrollTop` returns, not when a wheel event cancels the default action and not scroll timing. The swallow/release behavior is measured on this build and the smooth-scrolling dependence is an explicit limit of the launch flags. Flip: locate a normative wheel-event default-action or scroll-timing rule and cite that section instead. |
| MDN "Element: wheel event" — https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event | Reject as a registry row this round | Staged at `.ufo/waves/round-63/sources/s166-mdn-wheel.html` (sha256 `6ec7ec375ada09642a7ee76e63bb57eee1cf1e8e86e1b06f401bb8ecbacc7e4c`) but NOT pinned in `claims.json` and not needed by the entry. Its own text at lines 1591-1596 ("A wheel event doesn't necessarily dispatch a scroll event"; "the delta* values in the wheel event don't necessarily reflect the content's scrolling direction"; "In some browsers, only the first wheel event in a sequence is cancelable") is a caveat AGAINST reading delta as a scroll-direction proxy and a cross-browser caveat on cancelability — it would qualify the entry rather than ground it, and this round's measurement is exactly the opposite shape (one trusted, cancelable event per dispatched delta, five of five cancelable on this build). Flip: a later round that measures a trackpad or momentum sequence, where the "only the first wheel event in a sequence is cancelable" caveat becomes load-bearing, should open it as a row and scope it to that sequence. |
```

## Notes for the L1

- The two admitted rows are the same ids the working tree already carries
  (S166, S167); see `sources-rows.md` for the paste-ready text, the cell-by-cell
  breakdown and the one wording divergence (line anchors).
- The rejected candidate is *not* a new registry row: it is a staged source
  that was screened and refused, recorded here so the refusal is auditable.
  No SOURCES row is created for it.
- The four rejected-scope rows above are the standard house "reject the
  over-claim" shape (see `corpus/lessons/round-58.md` §Gate): each names what
  the admitted row may not be used to support, and each carries a flip
  condition.
