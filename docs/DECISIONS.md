# Decision Log

## D-001 - Use a separate submission repository

- **Date:** 2026-08-22
- **Status:** Accepted
- **Decision:** Keep the competition code in `hhcc-2026-prototype`, separate from the existing research workspace.
- **Reason:** The research workspace contains source material, archived explorations, temporary output, and local agent state that do not belong in a public, reviewable code submission.

## D-002 - Start with a minimal, honest bootstrap

- **Date:** 2026-08-22
- **Status:** Accepted
- **Decision:** The first repository state contains only project boundaries, compliance records, and ignore rules. It makes no product or implementation claims.
- **Reason:** The Prototype Development Track requires the submitted project to be built during the official hacking period, and reviewers must be able to distinguish completed work from plans.

## D-003 - Use `main` as the default branch

- **Date:** 2026-08-22
- **Status:** Accepted
- **Decision:** Initialize the repository on `main` and keep commits small enough to show the development timeline.

## D-004 - Publish a public remote repository

- **Date:** 2026-08-22
- **Status:** Superseded by D-011
- **Decision:** Initially use `https://github.com/b1207739631-rgb/hhcc-2026-prototype` as the milestone remote, with `main` as the default branch.
- **Reason:** This created a reviewable official-period development record before the designated competition repository became writable.

## D-005 - Synchronize verified milestones, not every save

- **Date:** 2026-08-22
- **Status:** Accepted
- **Decision:** Commit and push each coherent, verified change that affects a deliverable, and always synchronize before handoff, context switch, demonstration, or final submission.
- **Reason:** The official handbook requires a public repository and documentation of official-period work, but does not require real-time push-on-save. Milestone synchronization preserves evidence without publishing secrets, broken states, or noisy micro-commits.

## D-006 - Build an explainable EVA smart-cockpit prototype

- **Date:** 2026-08-22
- **Status:** Accepted
- **Decision:** Build EVA as an in-cabin perception and action agent combining browser-local DMS, workload fatigue, cabin controls, and L2 assistance. Demonstrate the product through City Commute, Fatigue Guard, and Complex Roads.
- **Reason:** The team selected a human-protection theme that goes beyond a single fatigue detector while remaining demonstrable, explainable, and aligned with the prototype track.

## D-007 - Use a DOM-free kernel and browser-local perception

- **Date:** 2026-08-22
- **Status:** Accepted
- **Decision:** Keep simulation and safety rules independent of React and the DOM; process live camera input locally with MediaPipe and provide an explicit simulated fallback through the same metrics pipeline.
- **Reason:** This supports deterministic tests, privacy, graceful degradation, and a clear boundary between real DMS evidence and simulated driving conditions.

## D-008 - Preserve official-period implementation history

- **Date:** 2026-08-22
- **Status:** Accepted
- **Decision:** Merge the verified implementation history created on 2026-08-22 into this public competition repository rather than flattening the source into a single bulk commit.
- **Reason:** The source commits were produced during the official development period. Preserving them provides an honest progression from scaffold, kernel, DMS, and accessibility through the landing experience and digital-twin checkpoint. Pre-event research archives and generated local output remain excluded.

## D-009 - Present the three scenarios through one digital-twin stage

- **Date:** 2026-08-22
- **Status:** Superseded by D-014
- **Decision:** Retain one full-screen vehicle digital-twin interface with a pausable three-act tour and a separate technical Evidence surface. All public UI copy is English, and all assistance remains explicitly L2.
- **Reason:** The team rejected the earlier monitoring-wall layout and the object-memory story because they diluted the three-scenario product narrative. A single stage communicates the experience while Evidence preserves inspectability.

## D-010 - Upgrade the public-repository development toolchain

- **Date:** 2026-08-22
- **Status:** Accepted
- **Decision:** Upgrade Vite to 8.2.2, the React plugin to 6.1.0, and Vitest to 4.1.11 before publishing the runnable checkpoint; require Node.js 20.19+ or 22.12+.
- **Reason:** The imported lockfile reported five known development-server and test-runner vulnerabilities, including one critical advisory. The upgraded toolchain removes the audit findings while keeping the application and regression suite unchanged.

## D-011 - Designate the official public competition repository

- **Date:** 2026-08-22
- **Status:** Accepted
- **Decision:** Use `https://github.com/cuancen/hhcc2026-proto-intelligent-vision` as the official public competition repository. Retain `https://github.com/b1207739631-rgb/hhcc-2026-prototype` as the team staging mirror and synchronize only verified milestones to both `main` branches.
- **Reason:** The team confirmed that the `cuancen` repository is the public submission target. Keeping the staging mirror preserves the verified handoff while the public repository remains the authoritative URL for judges.

## D-012 - Use one shared EVA avatar and a single evidence workbench

- **Date:** 2026-08-22
- **Status:** Accepted
- **Decision:** Use the team-approved purple-blue EVA shell with seven SVG-driven functional expressions across brand, narration, loading, and offline states. Hide the earlier box-shaped 3D EVA. Replace edge telemetry and tabbed evidence with one wide Perception / Reasoning / Execution workbench that pauses the experience while open.
- **Reason:** A consistent character makes EVA legible without adding another 3D asset, while the consolidated workbench keeps the demonstration cinematic and preserves full technical inspectability.

## D-013 - Anchor the procedural driving world to the vehicle rig

- **Date:** 2026-08-22
- **Status:** Accepted
- **Decision:** Parent the procedural road, lane lines, city volumes, depth gates, and simulated lead vehicle to the same stage as the GLB vehicle. Align that world to the measured vehicle longitudinal axis, derive road height from the fitted model floor, use distinct commute/fatigue/complex camera families, and omit wheel animation.
- **Reason:** A shared rig prevents the road and vehicle from drifting into different perspective lines. Model-derived ground clearance avoids tyre intersections, while scene-specific cameras communicate the three scenarios more clearly without modifying the high-poly GLB wheel geometry.

## D-014 - Make the five-experience tour the formal demo

- **Date:** 2026-08-22
- **Status:** Accepted; default DMS input amended by D-017
- **Decision:** Use one automatic tour in the order Daily Commute, Fatigue Guard, Complex Roads, Cabin Memory, and OMS MomentTrace. Keep every experience independently selectable. Default DMS input is a clearly labelled replay; live camera and local-video analysis run only after explicit user selection and stay on-device.
- **Reason:** A deterministic formal run lets judges see the full product without permission dialogs or manual scene switching. Ending on OMS MomentTrace elevates EVA from a fatigue detector to an explainable cabin-safety agent while preserving honest source boundaries.

## D-015 - Use a calibrated semantic cutaway for OMS

- **Date:** 2026-08-22
- **Status:** Accepted
- **Decision:** Calibrate the vehicle as left-hand drive, place the driver front-left and the risk occupant rear-right, and use articulated semantic figures plus short in-cabin links over the original GLB interior. The main OMS event is simulated; DMS provides local or replay evidence, and EVA records the resulting MomentTrace.
- **Reason:** Sparse semantic geometry keeps the causal relationship legible without pretending that a low-detail procedural interior is production CAD. Vehicle-local coordinates and seat-specific camera targets prevent left/right ambiguity and visual drift.

## D-016 - Pace the formal tour with EVA narration

- **Date:** 2026-08-23
- **Status:** Accepted for pacing; language choice superseded by D-018
- **Decision:** Drive the approximately 140-second Full Demo through 21 stable EVA voice beats in the order Daily Commute, Fatigue Guard, Complex Roads, Cabin Memory, and OMS MomentTrace. Each beat settles the stage before speech, waits for speech completion, holds a short tail, and only then advances. EVA speaks warm Chinese passenger copy with the respectful “您”; technical UI and source boundaries remain English.
- **Reason:** Fixed timers cut off speech and made scene changes feel disconnected. Stable voice IDs let the team generate production digital-human audio without coupling recordings to visible technical text, while speech-led pacing keeps picture, subtitle, and action synchronized.

## D-017 - Use authorized prerecorded DMS evidence by default

- **Date:** 2026-08-23
- **Status:** Accepted
- **Decision:** The Full Demo does not request camera access. Fatigue Guard automatically plays the authorized prerecorded `public/dms/d_360.mp4` and derives face landmarks and DMS metrics locally with MediaPipe. Live camera and uploaded video remain explicit manual choices. OMS semantic events and the driving environment remain simulated and labelled as such.
- **Reason:** A deterministic authorized clip makes the formal presentation repeatable while still showing real local inference. Keeping live camera opt-in avoids permission friction. Model failure leaves the video visible and renders metrics unavailable instead of fabricating evidence.

## D-018 - Make the final English digital-human pack the timing authority

- **Date:** 2026-08-23
- **Status:** Accepted; supersedes the language choice in D-016
- **Decision:** Use the team's final English MP3 pack for EVA subtitles and speech. A beat may enter and settle before speech, but the next camera/scene cannot advance until the active recording completes. Replay cancels every current media and browser-speech path before starting over. Codec rejection, blocked playback, missing media, and speech-synthesis absence degrade in layers rather than stopping the demo.
- **Reason:** Fixed timers and overlapping browser voices cut off lines and disconnected picture from speech. The final recordings are faster than the Chinese audition copy, so completion-driven timing preserves natural pacing without hard-coding a second timeline.

## D-019 - Grade the vehicle and simulated world as one cinematic system

- **Date:** 2026-08-23
- **Status:** Accepted
- **Decision:** Grade full-car scenes with graphite body materials and deep-blue environment light, while semantic cutaways use separate shell, glass, interior and occupant opacity profiles instead of one global transparency value. Complex Roads uses continuous rain/fog/weather mixing and a larger procedural lead SUV with visible brake lamps. Rendering remains capped during motion and freezes for pause, Evidence, hidden pages and reduced motion.
- **Reason:** A single transparency value stacked dozens of meshes into a black curtain, while brighter generic lighting overexposed the car against the road. Material roles and continuous weather parameters keep the car, occupants, evidence and environment legible without pretending the procedural elements are production CAD.

## D-020 - Converge application entry points on Landing

- **Date:** 2026-11-13
- **Status:** Accepted
- **Decision:** `/`, `#/landing`, and every unrecognized hash resolve to the introduction page; only hashes beginning with `#/cockpit` open the cockpit. The EVA brand link returns to `#/landing`, and the interactive board remains outside the app routes.
- **Reason:** Keep one stable public entry point and prevent section anchors or retired route names from opening unrelated experiences. The print-ready KT board stays a separate document.

## D-021 - Make the interface Chinese-first and bilingual

- **Date:** 2026-11-13
- **Status:** Accepted
- **Decision:** Choose the initial language from `eva.lang` or the browser locale, persist explicit changes, and offer a Chinese/English switch in Landing and the cockpit. Chinese narration uses Chinese subtitles and browser `zh-CN` speech synthesis; English keeps the existing approved MP3 pack and timing.
- **Reason:** Match the primary audience while retaining the reviewed English presentation. No Chinese cloned voice or unapproved Chinese recording is introduced, and language changes do not restart the demo.

## D-022 - Show a human-first Evidence summary by default

- **Date:** 2026-11-13
- **Status:** Accepted
- **Decision:** Open Evidence on a concise current-state summary, four-step See / Decide / Act / Recover chain, and PERCLOS / eyes-off-road / L2 values. Keep the existing three-column workbench collapsed until the user requests technical details.
- **Reason:** Present the decision and driver action before dense engineering measurements, while preserving all existing DMS, simulated OMS, L2, alert, voice, and accessibility controls.

## D-023 - Restore the brand palette and give Landing a rotating 3D hero

- **Date:** 2026-11-13
- **Status:** Accepted
- **Decision:** Return the Landing page to the approved brand language — near-black base with orange/teal radial glows, and orange→teal gradients on the wordmark, hero title, primary button, and data figures. Replace the hero screenshot with the self-hosted three.js vehicle: 28-second auto-spin with a soft grounding shadow, horizontal pointer drag to rotate, and a still frame under reduced motion. The car scene frames the model from its real bounding box rather than its bounding sphere, and WebGL or GLB failure keeps the EVA status view.
- **Reason:** The 3D vehicle reads as the product at a booth and on the printed board, and drag-to-rotate lets a visitor inspect the car without any controls. The screenshot hero duplicated the MomentTrace image already used in the demonstration section, and the flat single-accent palette lost the brand contrast the team had already approved. Drag rotation stays opt-in motion so the default page still respects reduced-motion preferences.

## D-024 - Structure Landing as a staged product page with restrained motion

- **Date:** 2026-11-13
- **Status:** Superseded by D-026
- **Decision:** Present Landing as five numbered sections — safety loop, evidence, demonstration, data, responsibility boundaries — with one shared shell width, and add three layers of motion: staggered entrance on the hero, IntersectionObserver reveal on section blocks, and a pointer-magnetic primary action that disables itself for coarse pointers and reduced motion.
- **Reason:** The previous page read as a documentation dump with every block at equal weight. Rejected after review: five sections plus staged motion carried more information and more choreography than the page needs, and the reviewer preferred the shorter four-section layout with only the competition identity corrected.

## D-025 - Keep superseded landing versions outside the repository

- **Date:** 2026-11-13
- **Status:** Accepted
- **Decision:** Archive each replaced Landing version to a local `landing-archive/<date>_<label>/` folder outside the repository, with the four landing source files, the built CSS bundle for fingerprint comparison, and a `NOTE.md` describing what the version looked like and what it got wrong. The repository itself keeps only the current version.
- **Reason:** The landing page is being iterated quickly against visual feedback, and an in-repository archive would bloat the submitted tree and blur what is actually submitted. Keeping the files beside the repository preserves an exact rollback target without changing the submission boundary.

## D-026 - Name the competition inside the existing hero, and enlarge the 3D car

- **Date:** 2026-11-13
- **Status:** Accepted; supersedes D-024
- **Decision:** Keep the four-section editorial Landing (Evidence, Demonstration, Data, Responsibility) and change only the hero identity: the single badge becomes one pill holding the event name `G-SPARK FINALE 2026`, a hairline, and the track `赛道 B · 互联网科技与安全`, with the separator and track size stepping down on narrow screens instead of truncating. Raise the hero vehicle to fill more of its column by widening the canvas aspect and tightening the framing margin from 1.08 to 1.05; drag-to-rotate and the reduced-motion still frame stay unchanged.
- **Reason:** The full `G-SPARK FINALE 2026 · 赛道 B · 互联网科技与安全` string fits in one pill at desktop sizes and only needs the separator dropped below 768 px, so no new layout layer is warranted. The earlier badge named the wrong track entirely. Enlarging the car keeps the strongest asset on the page at booth distance while the 1.05 margin still leaves the rotated model inside the canvas at every drag angle.

## D-027 - Raise Landing's production value without adding content

- **Date:** 2026-11-14
- **Status:** Accepted
- **Decision:** Keep the four sections, their copy and their order exactly as they are, and lift the page purely through presentation: a masked line grid behind the hero, a dashed orbit ring behind the vehicle, a larger hero title with tighter tracking, a gradient hairline before every section index, hover accents and a left colour bar on list rows, corner ticks and a soft shadow on the screenshots, gradient hairlines on the data figures, staggered entrance on the hero copy, and scroll-driven reveals plus a scroll progress line implemented with CSS `animation-timeline` rather than JavaScript. Every animation is disabled under `prefers-reduced-motion`.
- **Reason:** The earlier proposal to add a fifth section and a component-level motion layer was rejected as too much information. Visual polish is separable from information architecture: the same copy reads as a finished product once the page has depth, hover feedback and considered type scale. Using CSS scroll-driven animations keeps the win without adding a component, a dependency, or a bundle cost, and browsers without `animation-timeline` simply render the static final state.



## D-028 - Publish the KT board and make the repository homepage bilingual

- **Date:** 2026-11-15
- **Status:** Accepted
- **Decision:** Add the finalized 900 × 1200 mm KT board to the public repository under `docs/kt-board/` — Chinese and English editions, each as a print PDF, a 4252 × 5670 PNG and a web-sized PNG preview. Feature the native-language board at the top of both READMEs, make `README.md` the Chinese-first homepage, and mirror it in English in `README_EN.md` with a language switch on both. The board's repository QR code targets `#run-locally`, which both READMEs expose as an explicit anchor. Application routes are unchanged: `#/board` and other retired hashes still resolve to Landing.
- **Reason:** The board is finished, public-facing artwork, and showing it on the repository homepage makes the submission legible without opening the separate submission package. Keeping the print sources in `docs/kt-board/` also gives reviewers the exact artwork that goes to the printer. Competition-only materials, team operations and temporary files stay outside the tracked tree.

## D-029 - Treat phones as a first-class demo surface

- **Date:** 2026-11-15
- **Status:** Accepted
- **Decision:** In portrait, widen the digital-twin FOV from the camera aspect ratio so the vehicle stays inside the frame; convert the DMS, cabin-response and cabin-memory overlays into compact scrollable cards below the source labels, stack DMS under a cabin card, use side-by-side cards in short landscape, and hide the floating DMS card below 360 px height while keeping the full evidence in the drawer. Keep the landing evidence board in a positioning context on phones so its screenshot cannot detach from the board and cover the hero.
- **Reason:** The desktop camera and floating overlays assumed a wide stage; on phones they cropped the car and produced overlapping, unreadable evidence layers. The fixes preserve the desktop composition while giving phones a legible stage and a clear evidence path.

## D-030 - Raise Landing's midtones instead of brightening the whole theme

- **Date:** 2026-11-15
- **Status:** Accepted
- **Decision:** Keep the dark brand, but add a warm-centered, cool-edged light pool behind the hero, lift the text tokens and nav surface, increase the car's rim light, and give the evidence, demonstration, data, and responsibility bands distinct tonal washes. Replace the stale `GEELY HACKATHON 2026` caption with `G-SPARK FINALE 2026`.
- **Reason:** The earlier page put the background, car, and body copy at similar luminance, so the hero had no focal center and the lower sections read as one flat black field. A single light center plus tonal bands restores hierarchy without changing the product's dark identity or adding content.
