source: S173 — Chromium 155.0.8059.84 Input.pdl, https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Input.pdl?format=TEXT, decoded lines 286–315; staged .ufo/waves/round-68/sources/Input.pdl
verified-at: 2026-11-05, tag 155.0.8059.84; decoded SHA-256 5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d
recheck: sha256sum .ufo/waves/round-68/sources/Input.pdl; inspect lines 286–315 against the official tag URL; repeat on a different build before applying there

# Scroll-gesture protocol ground — round 68

## Evidence class

Documentation/code-defined ground, **runtime unmeasured** for this command.
The round-68 real-browser trial reran the existing round-67 horizontal wheel
surface; it did NOT execute `Input.synthesizeScrollGesture`. No new runtime
capability is entered on the strength of this note.

The L1 opened the official tag URL on 2026-11-05, base64-decoded the response,
and retained the decoded bytes at `.ufo/waves/round-68/sources/Input.pdl`.
Its digest matches the historical r64 staged copy, but the fetch this round
is new. Matching digests establish byte identity, not publisher authentication.

## Decision table

| Need | Protocol-defined surface at this tag | Boundary |
|---|---|---|
| Discrete wheel deltas | `Input.dispatchMouseEvent`, `type: mouseWheel`, `deltaX`/`deltaY` (lines 165–209, command at 165, mouseWheel at 172, deltaX 201, deltaY 203; units already held under S168) | Does not itself encode a phase stream |
| Synthesize a scroll gesture over time | Experimental `Input.synthesizeScrollGesture` (lines 286–315) | Described as issuing appropriate touch events; actual delivery here remains unmeasured |
| Choose distance direction | `xDistance`: positive scrolls left; `yDistance`: positive scrolls up (lines 293–296) | These signs must not be copied from the existing positive-wheel-delta arithmetic |
| Configure fling | `preventFling`, default true (lines 303–304) | Parameter declaration is not a measured momentum/trackpad-phase trace |
| Configure speed | `speed` in pixels/second, default 800 (lines 305–306) | No latency or smoothness guarantee follows |
| Select event source | `gestureSourceType` (lines 307–309), default queries platform preference | Explicit selection needs its own runtime observation |
| Repeat gesture | `repeatCount`, default 0; `repeatDelayMs`, default 250 (lines 310–313) | Do not interpret zero as one measured repeat |

## Located quotes

- Lines 286–287: “Synthesizes a scroll gesture over a time period by issuing appropriate touch events.” (13 words).
- Line 303: “Prevent fling (default: true).” (4 words).

The first quote supports a protocol operation, not native trackpad support,
scroll completion timing, or a smooth-rendering guarantee.

## Checked negative, finite scope

`grep -ni phase .ufo/waves/round-68/sources/Input.pdl` returned no matches
(exit 1); `grep -ci phase ...` printed 0 (exit 1). This is a finite scan of
this tag's Input PDL. No `phase`/`momentumPhase` parameter is declared there.
It is NOT a claim that Chromium cannot observe phases internally, that another
protocol command cannot cause momentum, or that a later tag lacks such fields.

## Frontier

The formerly unmined `synthesizeScrollGesture` protocol definition is now
source-held. Runtime gesture delivery, fling-versus-no-fling contrasts,
source-type effects, overscroll, repeats, trackpad phases, and smooth-rendering
behaviour remain open. This note does not close those runtime residuals or
re-declare round-67 horizontal-wheel capability.
