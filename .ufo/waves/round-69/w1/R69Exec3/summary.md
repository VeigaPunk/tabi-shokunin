# R69Exec3 summary — Input.synthesizeScrollGesture parameter edges (Chromium 155.0.8059.84, headless)

Fixture: 2280x6800 CSS content in a 1280x900 device viewport (scrollport 1265x885 after 15 px classic scrollbars); max scroll (1015, 5915). All legs below ran in the passes named in the last column; no leg errored unexpectedly.

| # | leg | params (x,y + deltas/speed/source) | dScrollX | dScrollY | wheelSumX | wheelSumY | latency ms | CDP error | pass |
|---|---|---|---|---|---|---|---|---|---|
| 1 | a1_xDistance_minus300 | x=400 y=400 xDist=-300 src=mouse | 300 | 0 | 300 | 0 | 450.3 | — | pass1 |
| 2 | a2_xDistance_plus300 | x=400 y=400 xDist=300 src=mouse | 0 | 0 | -300 | 0 | 410.6 | — | pass1 |
| 3 | b_speed400_run1 | x=400 y=400 yDist=-600 speed=400 src=mouse | 0 | 600 | 0 | 600 | 1547.9 | — | pass1 |
| 4 | b_speed1600_run1 | x=400 y=400 yDist=-600 speed=1600 src=mouse | 0 | 600 | 0 | 600 | 430.7 | — | pass1 |
| 5 | b_speed400_run2 | x=400 y=400 yDist=-600 speed=400 src=mouse | 0 | 600 | 0 | 600 | 1548.4 | — | pass1 |
| 6 | b_speed1600_run2 | x=400 y=400 yDist=-600 speed=1600 src=mouse | 0 | 600 | 0 | 600 | 432.7 | — | pass1 |
| 7 | b_speed400_run3 | x=400 y=400 yDist=-600 speed=400 src=mouse | 0 | 600 | 0 | 600 | 1549.1 | — | pass1 |
| 8 | b_speed1600_run3 | x=400 y=400 yDist=-600 speed=1600 src=mouse | 0 | 600 | 0 | 600 | 433.4 | — | pass1 |
| 9 | b_speed_default | x=400 y=400 yDist=-600 src=mouse | 0 | 600 | 0 | 600 | 799.1 | — | pass1 |
| 10 | c_source_default_explicit | x=400 y=400 yDist=-300 src=default | 0 | 300 | 0 | 300 | 434 | — | pass1 |
| 11 | c_source_absent | x=400 y=400 yDist=-300 src=(absent) | 0 | 300 | 0 | 300 | 432.9 | — | pass1 |
| 12 | c_source_touch_contrast | x=400 y=400 yDist=-300 src=touch | 0 | 0 | 0 | 0 | 531.8 | — | pass1 |
| 13 | d_x_out_of_bounds_5000 | x=5000 y=400 yDist=-100 src=mouse | 0 | 0 | 0 | 0 | 0.5 | Position out of bounds | pass1 |
| 14 | d_x_negative | x=-1 y=400 yDist=-100 src=mouse | 0 | 0 | 0 | 0 | 0.5 | Position out of bounds | pass1 |
| 15 | d_y_out_of_bounds_5000 | x=400 y=5000 yDist=-100 src=mouse | 0 | 0 | 0 | 0 | 0.4 | Position out of bounds | pass1 |
| 16 | d_x_inside_wide_content_1200 | x=1200 y=400 yDist=-100 src=mouse | 0 | 100 | 0 | 100 | 177.5 | — | pass1 |
| 17 | e_source_pen | x=400 y=400 yDist=-100 src=pen | 0 | 0 | 0 | 0 | 0.5 | Unknown gestureSourceType | pass1 |
| 18 | e_source_bogus | x=400 y=400 yDist=-100 src=bogus | 0 | 0 | 0 | 0 | 0.3 | Unknown gestureSourceType | pass1 |
| 19 | f1_bottom_yOverscroll100 | x=400 y=400 yOversc=100 src=mouse | 0 | 0 | 0 | 100 | 157.2 | — | pass1 |
| 20 | f2_mid_yDistance_minus300_yOverscroll100 | x=400 y=400 yDist=-300 yOversc=100 src=mouse | 0 | 400 | 0 | 400 | 547.4 | — | pass1 |
| 21 | f3_top_yOverscroll_minus100 | x=400 y=400 yOversc=-100 src=mouse | 0 | 0 | 0 | -100 | 155.4 | — | pass1 |
| 22 | g1_xDistance_minus5000_clamp | x=400 y=400 xDist=-5000 src=mouse | 1015 | 0 | 5000 | 0 | 6305.5 | — | pass2 |
| 23 | g2_x_1279_9 | x=1279.9 y=400 yDist=-60 src=mouse | 0 | 60 | 0 | 60 | 139.3 | — | pass2 |
| 24 | g3_x_1280 | x=1280 y=400 yDist=-60 src=mouse | 0 | 0 | 0 | 0 | 0.4 | Position out of bounds | pass2 |
| 25 | g4_y_899_9 | x=400 y=899.9 yDist=-60 src=mouse | 0 | 60 | 0 | 60 | 128.8 | — | pass2 |
| 26 | g5_y_900 | x=400 y=900 yDist=-60 src=mouse | 0 | 0 | 0 | 0 | 0.3 | Position out of bounds | pass2 |
| 27 | g6_source_Mouse_uppercase | x=400 y=400 yDist=-60 src=Mouse | 0 | 0 | 0 | 0 | 0.3 | Unknown gestureSourceType | pass2 |
| 28 | g7_source_mouse_explicit | x=400 y=400 yDist=-300 src=mouse | 0 | 300 | 0 | 300 | 427 | — | pass2 |
| 29 | h1_speed200_y600 | x=400 y=400 yDist=-600 speed=200 src=mouse | 0 | 600 | 0 | 600 | 3064.3 | — | pass2 |
| 30 | h2_speed3200_y600 | x=400 y=400 yDist=-600 speed=3200 src=mouse | 0 | 600 | 0 | 600 | 243.2 | — | pass2 |
| 31 | h3_speed800_y1200 | x=400 y=400 yDist=-1200 speed=800 src=mouse | 0 | 1200 | 0 | 1200 | 1562.7 | — | pass2 |
| 32 | h4_speed400_y1200 | x=400 y=400 yDist=-1200 speed=400 src=mouse | 0 | 1200 | 0 | 1200 | 3063.1 | — | pass2 |
| 33 | i1_right_xOverscroll100 | x=400 y=400 xOversc=100 src=mouse | 0 | 0 | 100 | 0 | 163.6 | — | pass2 |
| 34 | i2_mid_xDistance_minus200_xOverscroll100 | x=400 y=400 xDist=-200 xOversc=100 src=mouse | 300 | 0 | 300 | 0 | 427.9 | — | pass2 |
| 35 | f4_bottom_yOverscroll500 | x=400 y=400 yOversc=500 src=mouse | 0 | 0 | 0 | 500 | 666 | — | pass2 |
| 36 | j1_x_minus300_only | x=400 y=400 xDist=-300 src=mouse | 300 | 0 | 300 | 0 | 442 | — | pass3 |
| 37 | j2_diagonal_minus300_minus300 | x=400 y=400 xDist=-300 yDist=-300 src=mouse | 300 | 300 | 300 | 300 | 586.6 | — | pass3 |
| 38 | j3_clamp_exact_5000 | x=400 y=400 xDist=-5000 src=mouse | 1015 | 0 | 5000 | 0 | 6302.9 | — | pass3 |
| 39 | j4_clamp_already_at_right | x=400 y=400 xDist=-5000 src=mouse | 0 | 0 | 5000 | 0 | 6303.1 | — | pass3 |

