#!/usr/bin/env bash
source /fast/scratch/hyaku/tabi-r43/MutC1Challenge/run-arms.sh
S=/fast/scratch/hyaku/tabi-r43/MutC1Challenge
IN=$S/in
run_arm A18-initonly-synth-nofd        $S/shadow-initonly $IN/synth-receipt.json $IN/synth-measure-initonly.json nofd
run_arm_garbage A19-initonly-synth-garbage $S/shadow-initonly $IN/synth-receipt.json $IN/synth-measure-initonly.json
