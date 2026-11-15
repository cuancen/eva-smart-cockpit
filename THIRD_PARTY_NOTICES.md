# Third-Party Notices

This file records the third-party libraries, model files, and visual references used by the EVA Smart Cockpit prototype. Versions reflect `package-lock.json` at the verified checkpoint.

## Runtime libraries

| Item | Version | License | Source | Use and modification |
|---|---:|---|---|---|
| React | 18.3.1 | MIT | https://github.com/facebook/react | Application component runtime; unmodified dependency |
| React DOM | 18.3.1 | MIT | https://github.com/facebook/react | Browser renderer; unmodified dependency |
| Three.js | 0.185.1 | MIT | https://github.com/mrdoob/three.js | Landing vehicle and event-driven digital-twin rendering; unmodified dependency |
| MediaPipe Tasks Vision | 0.10.35 | Apache-2.0 | https://github.com/google-ai-edge/mediapipe | Browser-local Face Landmarker inference; WASM copied locally by `scripts/copy-wasm.mjs` |

## Development tools

| Item | Version | License | Source | Use |
|---|---:|---|---|---|
| Vite | 8.2.2 | MIT | https://github.com/vitejs/vite | Development server and production build |
| Vite React plugin | 6.1.0 | MIT | https://github.com/vitejs/vite-plugin-react | React transform and Fast Refresh integration |
| Vitest | 4.1.11 | MIT | https://github.com/vitest-dev/vitest | Automated regression tests |
| TypeScript | 5.9.3 | Apache-2.0 | https://github.com/microsoft/TypeScript | Static type checking |

Transitive package versions and license metadata are locked in `package-lock.json`.

## MediaPipe Face Landmarker model

- File: `public/models/face_landmarker.task`
- Upstream source: https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
- Project and license reference: https://github.com/google-ai-edge/mediapipe (Apache-2.0)
- Purpose: 478-point face landmarks and blendshape output for local DMS metrics.
- Modification: none. The file is self-hosted to improve demo reliability; camera frames remain in the browser.

## Geely community vehicle model

- File: `public/models/geely.glb`
- Asset title: `geelyblack.glb`
- Author: **crivero**
- Source: https://sketchfab.com/3d-models/geelyblackglb-602e7f7cab6d435ab3c022ecaadceb56
- License: Creative Commons Attribution (CC BY)
- Purpose: landing-page vehicle and cockpit digital twin.
- Modifications: re-encoded with glTF Transform and Meshopt compression (approximately 24 MB to 5 MB) without geometry changes; the application overrides selected body materials at runtime.
- Disclosure: this is a community-made model, not an official Geely factory asset. The required author attribution is also shown in the application footer.

## EVA character image

- Files: `public/eva/eva-reference.png`, `public/eva/eva-shell.png`
- Source: team-provided EVA reference image, explicitly approved by the user for local project use and derivative generation.
- Modification: OpenAI image generation removed the fixed eyes and produced an eye-free transparent shell; code overlays original SVG expressions at runtime.
- Purpose: brand, narration, loading, and offline feedback.
- Rights status: treated as a team-authorized project asset; the submitting team remains responsible for confirming final competition-use rights.

## Authorized fatigue demonstration video

- File: `public/dms/d_360.mp4`
- Duration and size: 10.0 seconds; 1,868,010 bytes.
- SHA-256: `111AF65F0AC81106C574CAA59A66297017050DC25D5059EBC1C094E8F5A32CFA`
- Source: user-provided prerecorded fatigue demonstration footage.
- Authorization status: the user confirmed that the team holds written permission for public competition display, repository redistribution, and the necessary local-processing derivatives. The submitting team remains responsible for retaining that written permission and confirming that any visible persons are covered by it.
- Purpose: default Fatigue Guard evidence in the formal Full Demo.
- Processing: frames remain in the browser and are analyzed by the self-hosted MediaPipe Face Landmarker. No frame is uploaded by this application. If inference is unavailable, the video may remain visible but the application must not invent detection metrics.
- Disclosure: this is authorized prerecorded footage, not a live camera feed. The UI labels it `DMS · AUTHORIZED VIDEO · LOCAL INFERENCE`.

## EVA English digital-human voice pack

- Files: `public/audio/eva/en-US/*.mp3` (69 fixed assets), with manifests and QA records in `voice/en-US/`.
- Source: team-provided final EVA digital-human delivery for this prototype.
- Audio format: MP3, 48 kHz, mono, approximately 128 kbps; normalized near -18 LUFS with no bundled music or ambience.
- Purpose: the 21-beat formal Full Demo, the independently selectable OMS trace, fixed runtime responses, and UI states.
- Processing: assets are served locally by the application. No voice-generation service is contacted at runtime.
- Rights status: treated as a team-authorized project asset. The submitting team remains responsible for retaining the generation agreement, voice-consent basis, and final competition-use rights.
- Compatibility: the app checks browser codec support and playback start. Unsupported, blocked, or missing assets fall back to browser speech and then to a bounded timing path so the visual demo cannot deadlock.

## Visual inspiration and fonts

- The dark minimal visual direction references HackHarvard 2024 project **Garuda** as inspiration only. No Garuda source code, CSS, components, animations, models, or images are included.
- The UI uses system fonts (`Segoe UI`, `PingFang SC`, `Microsoft YaHei`, Bahnschrift/DIN-style fallbacks). No font files are bundled.

Product and vehicle names may be trademarks of their respective owners. This prototype does not claim official authorization or production readiness.
