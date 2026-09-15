# Combined corrective evaluation batch

Parent issues: #725, #726; existing draft PR #712. Source baseline: 768b4b346730cfd0860616c2121395ecc4c4e2e4.

## Scope

- Two-hand IK reaches parcel-side palm sockets using the actual native arm chains and explicit elbow poles. No synthetic extra hands or replacement character are drawn. Existing mission/parcel enabled state stays authoritative. Parcel remains 0.36x0.24x0.24 metres.
- Native rig Foot.L/R are independent root-level control bones. Use virtual non-deforming lower-leg endpoints for two-link corrections without reparenting original skin bones. Actual skinned shoe vertices are sampled against governed surface heights. Pose restoration precedes the next native animation, preventing cumulative transforms. Plant/release includes turn and relocation guards.
- One active ground/carry pose owner supersedes the competing P0/P5 visible-root writers. Contact mechanics run after animation and movement but before active-mesh evaluation/drawing. Measured clearance and hand gaps remain separate from subjective visual acceptance.
- Render sizing now uses reciprocal CSS pixel density, a 1.05-million-pixel budget and delayed adaptive thresholds. Previous dpr/limit hardware scaling reduced internal resolution on dense Android screens. No promised FPS or native-screen-resolution claim.
- Restore original immutable P3/P4 base-colour atlas references that the mobile derivatives previously deleted. Reuse P2 textures, cap unique textures and 1024px dimensions; record omissions explicitly. Preserve geometry, UV transforms and material identities. Shared analytical sky fill is not a photographic HDR asset.
- Distance-limited facade details and shadow casters reduce render work without removing collision authority. Camera sensitivity, left/right conventions, GPS and world layout remain unchanged.
- Startup loading screen waits for the real hero, eight pedestrians, environment stages, materials and contact controller. Explicit errors and retry replace incomplete visible assembly. Diagnostic details are available behind a toggle; technical/non-gameplay truth remains visible.

## Verification gates

Existing presentation/native-human checks stay enabled. New mechanical tests exercise actual male/female native walking poses, four headings, split-height curb, pickup/drop, palm socket gaps, skin clearance, authoritative-root isolation, reflected-frame IK and resolution budgets. A runner-provided Chromium gate loads the actual Vite bundle, traverses evaluation pickup/handoff/restart, validates complete assemblies and saves rendered screenshots plus JSON under dist/evidence/. Desktop software WebGL captures are not Android hardware acceptance.

## Truth boundary

SOURCE IMPLEMENTED does not mean tested, rendered, APK-ready or device-accepted. All tests must pass on the exact commit before an APK can be offered. The overall Runway realism target, final branded uniform, fine finger grip, final animation art polish and hardware performance remain acceptance questions. Do not close #726, merge main, or declare every problem solved from build success alone. This remains a non-authoritative evaluation, not production gameplay or commercial asset clearance.
