# Stationary curb support — strengthen the acceptance condition

Baseline: 766db78735b69fa36abe586d3aa23963b2969adf, PR #712 / #725. The rendered route/grip/touch gate passed, but startup and restart evidence exposed an additional defect: left shoe ~6mm above support, right shoe ~188mm above its own ground, speed zero / Idle_Loop. A minimum-clearance PASS was not sufficient.

The spawn straddles sidewalk-cross-0 and ground. Evaluating the pinned native Idle clip independently showed both original shoe minima essentially equal, so the unsupported foot came from whole-body terrain lift, not a deliberate one-foot idle animation.

stationaryStance.ts runs inside the existing single contact controller, after native movement/plant/carry and before the completed rendered pose. At settled idle it checks both actual skinned soles. A bounded visual pelvis lowering and per-leg vertical IK support the lower and higher surfaces without changing canonical actor roots or bone lengths. On failure the previous pose is restored and IDLE_FOOT_UNSUPPORTED is explicit. A swing foot is not pinned while moving; walk-to-idle blending receives a settling interval. Two-hand parcel geometry moves with the same visual root and is checked in the native stance regressions.

The new gate verifies two native families, three curb heights, four headings and eight native idle phases: both shoes must stay between -2mm penetration and +25mm support gap. It also checks unmodified walking swing poses, stopping transitions, infeasible support rejection and actual hand/socket contact during body adjustment. Rendered startup/restart and device appearance remain separate evidence.

This addresses the previously untested positive idle-foot gap; it does not establish photo-realism, arbitrary stair climbing, production asset clearance or Android performance. Preserve the already-verified camera/wear/touch/contact lifecycle fixes and all existing tests. No main merge.
