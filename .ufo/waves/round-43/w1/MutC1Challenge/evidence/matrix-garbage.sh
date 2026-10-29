#!/usr/bin/env bash
source /fast/scratch/hyaku/tabi-r43/MutC1Challenge/run-arms.sh
S=/fast/scratch/hyaku/tabi-r43/MutC1Challenge
IN=$S/in
run_arm_garbage A14-pristine-synth-garbage $S/shadow-pristine $IN/synth-receipt.json $IN/synth-measure-pristine.json
run_arm_garbage A15-mutant-synth-garbage   $S/shadow-mutant   $IN/synth-receipt.json $IN/synth-measure-mutant.json
run_arm_garbage A16-pristine-genuine-garbage $S/shadow-pristine $IN/r43-receipt.json $IN/r43-measure.json
run_arm_garbage A17-mutant-genuine-garbage   $S/shadow-mutant   $IN/r43-receipt.json $IN/r43-measure.json
