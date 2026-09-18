# DROPi Tycoon — Character Factory Higgsfield Candidate v1

Status: **CANDIDATE / VISUAL REVIEW PENDING / NOT RUNTIME INTEGRATED / NOT RELEASE CLEARED**

Coordinates: #755 #725 #758 #757

## Purpose

This candidate batch starts the replacement path for the owner-rejected one-off MakeHuman milestone in PR #757.

Target family:
- one reusable human-family production pipeline;
- visibly distinct recurring identities;
- later common skeleton compatibility;
- reusable idle / walk / run / jump / carry / handoff / phone / vehicle animation contracts;
- mobile-ready LOD derivatives;
- no runtime integration until visual and device acceptance.

## Owner rejection inherited from #757

PR #757 remains DRAFT/evaluation-only. The owner rejected that milestone because of:
- stiff/splayed posture and non-fluid gait;
- insufficient face/hair quality;
- lower-fidelity surrounding pedestrians;
- missing run/sprint and jump;
- disappearing parcel carry regression (#758);
- recorded frame-budget overload.

This batch MUST NOT be used to reinterpret #757 as accepted.

## Higgsfield project

- project: `DROPi Character Factory Pilot`
- 3D Jutsu project ID: `18502cee-a5fe-4b65-adc4-6aef58e48009`
- project state at start: revision `0`, empty scene
- workspace plan observed: `Plus`
- credits before this turnaround batch: `955`
- credits after this turnaround batch: `935.5`
- batch cost: `19.5` credits

## Locked identity inputs

| Role | Higgsfield element | Element ID | Source image job |
|---|---|---|---|
| Male recovery hero | `dropi-hero-male-recovery` | `fd9cf0ec-e103-46b5-a263-13b461bdf1d3` | `ab000048-cff7-4147-a248-b2efada0a345` |
| Female recovery hero | `dropi-hero-female-recovery` | `3a2ebb82-3c27-4269-942d-3b43f30c6d5a` | `6b597391-09cc-4790-bc4d-bad9aa14684f` |
| Maria Ionescu | `dropi-maria-ionescu` | `a47c0a75-adde-4e8e-8d64-c212f9463568` | `8c2773be-1f26-427f-9045-5431048f005b` |

## Turnaround generation

Requested generation interface:
- provider surface: Higgsfield MCP
- requested model ID: `gpt_image_2`
- provider/model name: OpenAI GPT Image 2
- backend metadata returned by completed jobs: `videotape-alpha`
- resolution: `2048×1360` / requested `2k`
- quality: `high`
- aspect ratio: `3:2`
- purpose: rig-friendly multi-view A-pose reference production

All three generations explicitly requested:
- one consistent identity across front / front-three-quarter / left-profile / back;
- head-to-toe visibility;
- neutral A-pose;
- natural hands/feet;
- hair clear of face/eyes;
- no phone / parcel / handheld prop;
- neutral studio lighting/background;
- no Roblox/Minecraft/chibi/exaggerated anatomy.

## Outputs

| Role | Generation job | Result URL | Current review |
|---|---|---|---|
| Male recovery hero | `9600ebb1-c68e-420d-baa0-334e5acfaa41` | `https://d8j0ntlcm91z4.cloudfront.net/user_3JCeOwtDa203yO6LGJxCX8lkQgM/hf_20260918_141043_9600ebb1-c68e-420d-baa0-334e5acfaa41.png` | `VISUAL_REVIEW_PENDING` |
| Female recovery hero | `86fc23f8-bb5a-40d4-a663-ccd47ef76606` | `https://d8j0ntlcm91z4.cloudfront.net/user_3JCeOwtDa203yO6LGJxCX8lkQgM/hf_20260918_141043_86fc23f8-bb5a-40d4-a663-ccd47ef76606.png` | `VISUAL_REVIEW_PENDING` |
| Maria Ionescu | `5cb887e3-1473-4920-9ff0-a60ea56370a9` | `https://d8j0ntlcm91z4.cloudfront.net/user_3JCeOwtDa203yO6LGJxCX8lkQgM/hf_20260918_141043_5cb887e3-1473-4920-9ff0-a60ea56370a9.png` | `VISUAL_REVIEW_PENDING` |

The current agent environment cannot ingest the Higgsfield CDN pixels for independent visual inspection. Generation completion therefore does **not** equal visual PASS.

## 3D pipeline discovery

The connected Higgsfield catalog currently advertises, among others:
- `meshy_v7_image_to_3d` — Meshy 7 Image to 3D;
- `multi_image_to_3d` / Meshy Multi-Image to 3D;
- `3d_rigging`;
- `sam_3_3d_body`;
- `tripo_h3_1_image_to_3d`;
- `tripo_h3_1_multiview_to_3d`;
- `hunyuan3d_v3_image_to_3d`.

For Meshy 7, relevant available parameters include A/T pose, rigging, PBR, topology, target polycount and optional animation.

**Current MCP limitation:** this ChatGPT connector exposes the 3D model catalog but no direct 3D-generation submit action. Therefore no Meshy/Tripo/Hunyuan GLB is claimed by this batch.

## Required next gates

1. Human visual inspection of the three turnaround sheets.
2. Reject/regenerate any sheet with anatomy, hand/foot, hair, face or multi-view consistency defects.
3. Submit accepted views to a real 3D generator when the submit path is available.
4. Prove common skeleton compatibility instead of three unrelated rigs.
5. Prove `idle / walk / run / jump` before runtime integration.
6. Prove parcel carry/handoff socket behavior continuously (#758).
7. Produce mobile LOD/triangle/material budgets and Android evidence.
8. DT-13 provenance/legal qualification before any commercial release claim.

## Authority / legal boundary

This record is production lineage only.

- DT-19 owns inventory/production lineage.
- DT-13 owns legal/licence/provenance qualification.
- A visually approved candidate is not automatically commercial-cleared.
- Unknown hashes/terms/evidence remain unknown.
- No file in this batch is activated in runtime.


## Dedicated Maria single-view reconstruction reference

A separate Maria reference was generated after the four-view sheet to provide a cleaner single-image input for image-to-3D systems that perform better with one unobstructed frontal subject.

- identity element: `dropi-maria-ionescu`
- element ID: `a47c0a75-adde-4e8e-8d64-c212f9463568`
- generation job: `1c7f0c3e-e89d-4979-96f8-269ff4020f93`
- requested model: `gpt_image_2`
- returned backend metadata: `videotape-alpha`
- output dimensions: `1744×2336`
- requested quality: `2K / high`
- composition: single full-body orthographic front A-pose
- result URL: `https://d8j0ntlcm91z4.cloudfront.net/user_3JCeOwtDa203yO6LGJxCX8lkQgM/hf_20260918_145708_1c7f0c3e-e89d-4979-96f8-269ff4020f93.png`
- status: `VISUAL_REVIEW_PENDING`
- runtime integration: `FALSE`
- release clearance: `FALSE`

This image is an input candidate only. Completion of the generation job does not establish anatomy quality, rig suitability, commercial clearance or production acceptance.
