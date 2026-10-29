#!/usr/bin/env bash
source /fast/scratch/hyaku/tabi-r43/MutC1Challenge/run-arms.sh
S=/fast/scratch/hyaku/tabi-r43/MutC1Challenge
IN=$S/in
run_arm A1-pristine-synth-nofd        $S/shadow-pristine      $IN/synth-receipt.json $IN/synth-measure-pristine.json nofd
run_arm A2-mutant-synth-nofd          $S/shadow-mutant        $IN/synth-receipt.json $IN/synth-measure-mutant.json nofd
run_arm A3-mutant-frozenclaims-nofd   $S/shadow-mutant-frozen $IN/synth-receipt.json $IN/synth-measure-mutant.json nofd
run_arm A4-pristine-synth-answered     $S/shadow-pristine      $IN/synth-receipt.json $IN/synth-measure-pristine.json answered
run_arm A5-mutant-synth-answered       $S/shadow-mutant        $IN/synth-receipt.json $IN/synth-measure-mutant.json answered
run_arm A6-pristine-tampered-nofd      $S/shadow-pristine      $IN/synth-receipt.json $IN/synth-measure-tampered-pristine.json nofd
run_arm A7-mutant-tampered-nofd        $S/shadow-mutant        $IN/synth-receipt.json $IN/synth-measure-tampered-mutant.json nofd
run_arm A8-pristine-replay-r42-nofd    $S/shadow-pristine      $IN/r42-receipt.json $IN/r41-measure.json nofd
run_arm A9-mutant-replay-r42-nofd      $S/shadow-mutant        $IN/r42-receipt.json $IN/r41-measure.json nofd
run_arm A10-mutant-pristinemeasure-nofd $S/shadow-mutant       $IN/synth-receipt.json $IN/synth-measure-pristine.json nofd
run_arm A11-pristine-genuine-r43-nofd  $S/shadow-pristine      $IN/r43-receipt.json $IN/r43-measure.json nofd
run_arm A12-mutant-genuine-r43-nofd    $S/shadow-mutant        $IN/r43-receipt.json $IN/r43-measure.json nofd
run_arm_garbage A14-pristine-synth-garbage $S/shadow-pristine $IN/synth-receipt.json $IN/synth-measure-pristine.json
run_arm_garbage A15-mutant-synth-garbage   $S/shadow-mutant   $IN/synth-receipt.json $IN/synth-measure-mutant.json
summarize
