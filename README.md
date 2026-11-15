# EVA Smart Cockpit — Cabin Perception, Human Protection

> [English project guide](README_EN.md) · G-SPark Finale 2026 · Track B: Internet Technology & Safety
>
> **Live demo / 在线体验:** [cuancen.github.io/eva-smart-cockpit](https://cuancen.github.io/eva-smart-cockpit/)
>
> 中国大陆访问 GitHub Pages 可能不稳定；离线演示见下方 [Run locally](#run-locally)。

**Previous HHCC 2026 repository:** [cuancen/hhcc2026-proto-intelligent-vision](https://github.com/cuancen/hhcc2026-proto-intelligent-vision)

**Team staging mirror:** [b1207739631-rgb/hhcc-2026-prototype](https://github.com/b1207739631-rgb/hhcc-2026-prototype)

EVA is an explainable in-cabin agent that combines local driver monitoring, semantic occupant monitoring, cabin memory, cabin actuation, and L2 assistance. Its default presentation is one uninterrupted five-experience tour: **Daily Commute → Fatigue Guard → Complex Roads → Cabin Memory → OMS MomentTrace**.

## Safety positioning

This prototype demonstrates **L2 combined driving assistance**: lane-level steering and acceleration support with continuous driver supervision. The driver remains responsible at all times and must be ready to take over. EVA is limited to monitoring, alerts, recommendations, cabin adjustments, and safe assistance degradation; this project does not claim L3/L4 autonomy.

## Current verified checkpoint

- Full-screen Three.js vehicle digital twin with calibrated left-hand-drive occupants, vehicle-anchored road motion, scene-specific cameras, event-driven rendering, and WebGL fallback.
- Browser-local MediaPipe DMS from the authorized built-in fatigue video, an explicitly selected live camera, or a user-uploaded local video: EAR, PERCLOS, head pose, eyes-off-road, presence, and six-state emotion classification.
- Simulated semantic OMS with 23 test states, seat-aware risk rules, a guarded L2 response, dual-sensor recovery, and one explainable MomentTrace artifact.
- Workload and vision fatigue fusion with care and urgent thresholds.
- Audio-led Full Demo with 21 stable beats and about 103 seconds of approved English digital-human recordings; language changes preserve the current beat.
- Human-first Evidence summary by default; its on-demand technical detail view retains the three-column perception, reasoning, and execution workbench.
- Local-video upload replaces the old simulation button. The Full Demo starts its Fatigue Guard segment with the authorized built-in video and local inference; it never requests camera access by itself.
- Chinese-first bilingual landing and cockpit UI, selected from browser language and persisted as `eva.lang`; English remains available from both language switches.
- Landing hero is the rotating 3D vehicle on the brand orange→teal palette: 28-second auto-spin, horizontal drag-to-rotate, reduced-motion still frame, and an EVA status fallback when WebGL or the GLB fails.
- Chinese EVA subtitles use browser `zh-CN` speech synthesis. English mode retains the approved MP3 pack and its original timing; no Chinese cloned voice is generated.
- Keyboard control, high contrast, scalable text, reduced-motion support, explicit sensor fallbacks, and source-labelled DMS/OMS boundaries.
- Graphite/deep-blue environment grading, semantic cutaway material profiles, speed-linked rain and fog, and a larger procedural lead SUV with visible brake lamps keep the vehicle and simulated world visually coherent.
- 111 automated regression tests plus browser compatibility checks for routing, audio codecs, restart cancellation, WebGL/model failure, reduced motion, and desktop/mobile layouts.

## Run locally

Requirements: Node.js 20.19+ (or 22.12+) and a modern browser.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`; `/` and `#/landing` show the introduction page. Choose the full tour there, or open `#/cockpit` for manual control. Unknown hashes return to the introduction page.

```bash
npm test
npm run build
```

`npm install` runs `scripts/copy-wasm.mjs`, copying the MediaPipe WASM runtime into `public/mediapipe-wasm/` for local serving. That generated directory and `dist/` are intentionally not committed.

## Demo controls

- `Space`: start, pause, or continue.
- `D`: replay the selected experience or automatic Full Demo.
- `1`, `2`, `3`: City Commute, Fatigue Guard, or Complex Roads.
- `L`: toggle L2 assistance.
- `Evidence`: inspect DMS/OMS sources, reasoning, actions, and driver responsibility.

The Full Demo does not request camera permission. Its Fatigue Guard segment uses the authorized prerecorded `public/dms/d_360.mp4` and runs MediaPipe locally in the browser; the same real frame and derived metrics appear in the stage preview and Evidence. If local inference fails, the video remains visible while unavailable metrics show `—` rather than fabricated values. `Live DMS` and `Upload Video` remain optional, explicitly selected evidence inputs and are not uploaded. OMS semantic events and the driving environment remain visibly identified simulations.

The five-scene tour is paced by 21 stable EVA `voice_id` values. English mode uses the approved MP3 assets in `public/audio/eva/en-US/`; Chinese mode does not load those recordings and instead uses browser `zh-CN` speech for the Chinese subtitles. Changing language cancels the previous speech source and continues the same beat. If browser speech is unavailable or fails, narration callbacks and the bounded timing fallback keep the demo moving. Replay hard-stops active media before starting again. No Chinese cloned voice is used.

Returning to Landing unmounts the cockpit and stops its demo, DMS inputs, and narration. Starting a tour from Landing again creates a fresh cockpit; changing language keeps the current cockpit mounted.

## Print-only KT board

The KT board stays separate from the application: `#/board` and other retired hashes resolve to Landing. The requested V2 release paths would be `docs/kt-board-v2.html` and `docs/kt-board-v2.pdf`; neither file is included in this repository. The existing 900 × 1200 mm print materials are kept in the team's submission package, not in this code repository, and this UI change does not regenerate or replace them.

## Architecture

```text
src/core/      DOM-free simulation, EVA rules, parameters, and L2 policy
src/vision/    MediaPipe DMS, pure metrics, and simulated fallback
src/landing/   Chinese-first bilingual editorial landing, rotating 3D hero vehicle
src/shell/     Cockpit UI, timeline, EVA avatar, Evidence, and digital twin
tests/         Core, vision, shell, timeline, and twin-state regression tests
public/        Self-hosted face model, vehicle GLB, and approved EVA assets
docs/          Pipeline, decisions, features, and project guidance
```

The simulation clock advances only while the experience is running. Ready, paused, Evidence-open, and completed states freeze simulation. The high-poly vehicle renders at a capped rate only while motion is required. If WebGL or the GLB cannot load, the story, evidence, audio, and controls continue through the EVA fallback state.

## Competition records

- [Decision log](docs/DECISIONS.md)
- [AI usage disclosure](AI_USAGE.md)
- [Third-party notices](THIRD_PARTY_NOTICES.md)
- [Pipeline and parameters](docs/PIPELINE.md)
- [Project guide](PROJECT_GUIDE_EN.md)

The public history preserves the official-period implementation commits instead of flattening them into a single source dump. No credentials, personal data, dependency directories, generated builds, or research-workspace artifacts belong in this repository.
