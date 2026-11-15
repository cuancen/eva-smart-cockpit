# AI 使用日志 / AI Usage Log

## 中文版

本日志记录**团队主导下** AI 工具的辅助用途、产出与团队审核。团队拥有产品创意、关键决策与最终验收权；AI 不作为团队成员，也不拥有代码或作品权利。

> **记录原则**：按「团队下达指令 → AI 辅助产出 → 团队审阅、运行验证、实质修改」记录。不把 AI 描述为独立完成者，也不缩小团队的实际修改。

| 日期 | 工具 | 团队指令下的用途 | 产出 | 团队审核与实质修改 |
|---|---|---|---|---|
| 2026-08-22 | OpenAI Codex | 团队指令下核验赛事约束，辅助创建干净的公开提交仓库 | 仓库边界、忽略规则、决策日志与里程碑 Git 策略 | 团队批准独立官方期仓库与按里程碑同步 |
| 2026-08-22 | 团队指导下的 AI 编程助手 | 团队确定产品方向与架构后，辅助搭建并迭代 Vite/React/TypeScript 原型 | 座舱内核草稿、MediaPipe DMS 管线草稿、L2 规则草稿、无障碍、测试与文档 | 团队选定产品方向、阈值、三场景与 L2 责任边界；逐项审阅、运行验证并修改 AI 产出 |
| 2026-08-22 | OpenAI Codex | 团队主导合并最新座舱内核与电影化车辆数字孪生演示，AI 辅助实现 | 英文 Landing、Three.js 舞台、可暂停三幕巡演、Evidence 视图与降级状态 | 团队否决早期监视墙与物体记忆叙事，恢复 City Commute / Fatigue Guard / Complex Roads，并批准当前视觉方向 |
| 2026-08-22 | 经 Codex 调用的 OpenAI 图像生成 | 基于团队提供并授权的 EVA 参考图，辅助生成透明外壳素材 | EVA 外壳素材（当前版本 `public/eva/eva-shell-v2.png`），用于动态 SVG 表情底层 | 团队提供并授权源图，要求角色更新，批准以动态功能表情替代固定位图眼睛 |
| 2026-08-22 | OpenAI Codex | 团队指令下准备、审计并同步已验证的项目检查点 | 合并官方期提交历史、可运行源码、合规记录、可复现命令，并在团队镜像与官方公开仓库间对齐里程碑历史 | 团队指定公开比赛仓库与团队暂存镜像 |
| 2026-08-22 | OpenAI Codex | 团队指令下校准行驶舞台几何并整合技术证据 | 车辆轴线分析、车锚定的程序化道路与城市场景、由模型推导的轮胎间隙、三场景独立机位、三列 Evidence 工作台 | 团队发现透视漂移与轮胎穿插，要求环境跟随车辆基座，并明确否决轮动与重复场景视角 |
| 2026-08-22 | OpenAI Codex | 团队指令下增加 OMS MomentTrace 并整合正式演示 | 左舵语义乘员骨架、座位感知的模拟 OMS 规则、本地视频 DMS 输入、五体验自动巡演、串行英文旁白、来源标注降级、测试与比赛文档 | 团队选择语义剖切，指定右后乘员风险，要求摄像头输入可选，并批准先跑通五体验自动巡演再制作录音语音 |
| 2026-08-23 | OpenAI Codex | 团队指令下围绕旁白、真实本地 DMS 证据与更温暖的 EVA 角色重剪正式巡演 | 旁白主导的五体验序列、授权视频的 MediaPipe 证据预览、中文乘客文案、稳定 voice ID、数字人生成清单与来源披露更新 | 团队提供并授权疲劳视频，要求默认演示不请求摄像头，审校中文语气，并保留英文技术 UI 与明确的模拟 OMS、驾驶环境标注 |
| 2026-08-23 | 团队选定的数字人语音工作流，经 OpenAI Codex 集成 | 团队选定语音工作流，替换试听语音并让音频成为时序权威 | 69 段已审核 MP3、21 段正式演示录音、固定与运行时清单、SHA-256 校验、逐文件音频 QA、串行播放、硬重启取消，以及编解码/语音/计时分层降级 | 团队交付最终英文语音包，要求更快的音频主导剪辑，并复核语音、字幕、取消与降级行为 |
| 2026-08-23 | OpenAI Codex | 团队指令下完成电影化舞台与发布兼容性收尾 | 环境匹配的石墨材质、可读的语义剖切、随速度联动的雨雾、更大的制动前车、更平顺的疲劳停车、桌面/移动端/减弱动态检查，以及音频/WebGL/模型强制失败测试 | 团队在运行中的浏览器反复审阅截图，指出过曝与图层堆叠，并在最终验证后批准仅按里程碑同步 Git |
| 2026-11-13 | OpenAI Codex | 团队指令下实施路线、中文化与以人为本的证据收敛 | 仅 Landing 的根路由与回退路由、持久化的中文优先双语 UI、中文副标题配浏览器 `zh-CN` 语音、保留英文 MP3 播放、可切换的座舱截图呈现，以及折叠摘要/三列证据视图 | 团队提供的规格禁止生成中文语音；本次改用浏览器语音合成，保留现有英文语音包不动，未新增依赖，`src/core/` 行为不变 |
| 2026-08-21 – 08-23 | ZCode（AI 编程助手，本机会话） | 团队指令下的代码生成、仓库与部署管理、功能文档撰写 | 工程脚手架、仓库与部署操作、功能文档草稿 | 团队主导各次会话、审阅产出，并保留全部产品与提交决策 |
| 2026-08-21 – 08-23；2026-11-15 | Claude Code（AI 编程助手，本机会话） | 团队指令下的代码生成与重构、工程约定维护（AGENTS.md / CLAUDE.md）、双语文档与提交材料核对 | 工程约定文件、文档更新与双语提交材料 | 团队制定工程规则并复核每一项被采纳的改动 |
| 2026-11-15 | Claude Code | 团队指令下按 111 项测试检查点对齐双语的 AI 声明与文档 | 星火杯专用 AI 声明、双语 AI 使用日志、功能说明中的 111 项对齐、新增 1.2.0 更新日志条目；删除本机路径与仓库外链接 | 提交前待团队确认 |

## 团队手改与关键开发记录（提交前如实填写，不得虚构）

> 本节是证明「关键开发由团队自主完成」的直接证据。请填写团队实际修改过的文件或函数、改动原因、验证方式与负责人。

| 文件 / 函数 | 团队改动 | 改动原因 | 验证方式 | 负责人 |
|---|---|---|---|---|
| （示例）`src/core/params.ts` | （填写团队实际调整的阈值） | （填写取值理由） | `npm test` | （填写） |
| （填写） | （填写） | （填写） | （填写） | （填写） |
| （填写） | （填写） | （填写） | （填写） | （填写） |

## 原创性证据索引

| 证据 | 位置 | 用途 |
|---|---|---|
| 团队决策记录 | `docs/DECISIONS.md`（D-001～D-027） | 证明产品方向、架构与取舍由团队决定 |
| 参数表与取值理由 | `docs/PIPELINE.md` §一 | 证明阈值与规则可解释 |
| 自动化回归 | `tests/`（111 项） | 证明改动经过验证 |
| 功能与演示说明 | `docs/功能说明.md` | 证明团队能讲清每项能力 |
| 答辩 AI 专页 | 答辩 PPT | 按手册第 2 条主动声明 AI 工具与场景 |

## 设计灵感披露

深色主题、红橙径向光晕、悬浮车辆主视觉与极简导航参考了 HackHarvard 2024 项目 **Garuda** 的视觉语言。未复制 Garuda 的任何源代码、组件、CSS、动画文件或素材。本仓库的实现与数字孪生行为均由团队主导完成。

## 披露原则

- AI 输出在提交前均经过审查、测试与实质性改写。
- 新增 AI 工具或用途发生实质变化时，必须记录在本日志中。
- 第三方库与媒体单独记录于 `THIRD_PARTY_NOTICES.md`。
- 最终路演措辞必须与本日志一致，不得夸大自动驾驶能力。
- 提交团队负责选定最终数字人语音、审阅每段录音，并对全部公开主张与媒体权利负责。

---

## English Version

This log records the **team-directed** use of AI tools, their outputs, and the team's review. The team owns the product concept, key decisions, and final acceptance. AI tools are not team members and hold no rights to the code or the work.

> **Recording principle:** Each entry follows "team instruction → AI-assisted output → team review, run verification, and substantial modification". AI is not described as an independent author, and the team's actual modifications are not understated.

| Date | Tool | Team-directed use | Output | Team review and substantial modification |
|---|---|---|---|---|
| 2026-08-22 | OpenAI Codex | Verified competition constraints and assisted with a clean public submission repository under team instruction | Repository boundary, ignore rules, decision log, and milestone Git policy | The team approved the separate official-period repository and milestone-based synchronization |
| 2026-08-22 | AI coding assistants under team direction | After the team set the product direction and architecture, assisted scaffolding and iterating the Vite/React/TypeScript prototype | Cockpit kernel drafts, MediaPipe DMS pipeline drafts, L2 rule drafts, accessibility, tests, and documentation | The team selected the product direction, thresholds, three scenarios, and L2 responsibility boundary; reviewed, ran, and modified every AI output |
| 2026-08-22 | OpenAI Codex | Team-led merge of the latest cockpit kernel with the cinematic vehicle digital-twin presentation, with AI assistance | English landing page, Three.js stage, pausable three-act tour, Evidence view, and fallback states | The team rejected the earlier monitor-wall and object-memory story, restored City Commute / Fatigue Guard / Complex Roads, and approved the current visual direction |
| 2026-08-22 | OpenAI image generation through Codex | Generated the transparent EVA shell from the team-provided, team-authorized reference under team direction | EVA shell asset (current version `public/eva/eva-shell-v2.png`), used beneath dynamic SVG expressions | The team supplied and authorized the source image, requested the character update, and approved dynamic functional expressions instead of fixed bitmap eyes |
| 2026-08-22 | OpenAI Codex | Prepared, audited, and synchronized the verified checkpoint under team instruction | Merged official-period commit history, runnable source, compliance records, reproducible commands, and matching milestone history across the team mirror and official public repository | The team designated the official public competition repository and the team staging mirror |
| 2026-08-22 | OpenAI Codex | Calibrated driving-stage geometry and consolidated technical evidence under team instruction | Vehicle-axis analysis, vehicle-anchored procedural road/city scene, model-derived tyre clearance, distinct three-scene cameras, and a three-column Evidence workbench | The team identified perspective drift and tyre intersections, required the environment to follow the vehicle rig, and explicitly rejected wheel animation and identical scene views |
| 2026-08-22 | OpenAI Codex | Added OMS MomentTrace and consolidated the formal demonstration under team instruction | Left-hand-drive semantic occupant rigs, seat-aware simulated OMS rules, local-video DMS input, five-experience automatic tour, serialized English narration, source-labelled fallbacks, tests, and competition documentation | The team chose Semantic Cutaway, specified a rear-right occupant risk, required camera input to be optional, and approved a single automatic run across all five experiences before recorded voice production |
| 2026-08-23 | OpenAI Codex | Recut the formal tour around narration, real local DMS evidence, and a warmer EVA character under team instruction | A narration-led five-experience sequence, authorized-video MediaPipe evidence preview, Chinese passenger copy, stable voice IDs, digital-human generation manifests, and updated source disclosures | The team supplied and authorized the fatigue video, required the default demo to avoid camera permission, reviewed the Chinese tone, and retained English technical UI plus explicit simulated OMS and driving-environment labels |
| 2026-08-23 | Team-selected digital-human voice workflow, integrated with OpenAI Codex | The team selected the voice workflow; AI assistance replaced audition speech and made audio the timing authority | 69 reviewed MP3 assets, 21 formal-demo recordings, fixed/runtime manifests, SHA-256 checksums, per-file audio QA, serialized playback, hard restart cancellation, and layered codec/speech/timing fallbacks | The team returned the final English pack, requested faster audio-led cuts, and reviewed the resulting voice, subtitles, cancellation and fallback behavior |
| 2026-08-23 | OpenAI Codex | Finished the cinematic stage and release compatibility pass under team instruction | Environment-matched graphite materials, legible semantic cutaways, speed-linked rain/fog, a larger braking lead vehicle, smoother fatigue stopping, desktop/mobile/reduced-motion checks, and forced audio/WebGL/model failure tests | The team repeatedly reviewed screenshots in the running browser, identified overexposure and layer stacking, and approved milestone-only Git synchronization after final verification |
| 2026-11-13 | OpenAI Codex | Implemented the requested route, localization, and human-first Evidence convergence under team instruction | Landing-only root and fallback routing, persisted Chinese-first bilingual UI, Chinese subtitles with browser `zh-CN` speech, retained English MP3 playback, switchable cockpit screenshot presentation, and a collapsed-summary/three-column Evidence view | The team-provided specification prohibits generated Chinese voice; this change uses browser speech synthesis, keeps the existing English pack untouched, adds no dependencies, and leaves `src/core/` behavior unchanged |
| 2026-08-21 – 08-23 | ZCode (AI coding assistant, local session) | Team-directed code generation, repository and deployment management, feature documentation | Project scaffolding, repository and deployment operations, and feature documentation drafts | The team directed the sessions, reviewed the outputs, and retained all product and submission decisions |
| 2026-08-21 – 08-23; 2026-11-15 | Claude Code (AI coding assistant, local session) | Team-directed code generation and refactoring, engineering conventions (AGENTS.md / CLAUDE.md), bilingual documentation and submission review | Convention files, documentation updates, and bilingual submission documentation | The team set the engineering rules and reviewed each accepted change |
| 2026-11-15 | Claude Code | Aligned the bilingual AI declaration and documentation to the 111-test checkpoint under team instruction | G-SPark-specific AI declaration, bilingual AI usage log, 111-test alignment in the feature guide, and a new 1.2.0 changelog entry; removed machine-local paths and out-of-repository links | Pending team confirmation before submission |

## Team Hand-Modification and Key-Development Record (fill truthfully before submission; do not invent)

> This section is the direct evidence that key development was completed by the team. Record the files or functions the team actually modified, why, how they were verified, and who owns them.

| File / function | Team change | Reason | Verification | Owner |
|---|---|---|---|---|
| (example) `src/core/params.ts` | (the threshold the team actually changed) | (the rationale for the value) | `npm test` | (fill in) |
| (fill in) | (fill in) | (fill in) | (fill in) | (fill in) |
| (fill in) | (fill in) | (fill in) | (fill in) | (fill in) |

## Originality Evidence Index

| Evidence | Location | Purpose |
|---|---|---|
| Team decision log | `docs/DECISIONS.md` (D-001–D-027) | Shows product direction, architecture, and trade-offs were decided by the team |
| Parameter table and rationale | `docs/PIPELINE.md` §1 | Shows thresholds and rules are explainable |
| Automated regression | `tests/` (111 tests) | Shows changes were verified |
| Feature and demo guide | `docs/功能说明.md` | Shows the team can explain each capability |
| Defense AI page | Defense PPT | Proactively declares AI tools and scenarios per handbook Clause 2 |

## Design inspiration disclosure

The dark theme, red-orange radial glow, floating vehicle hero, and minimal navigation reference the visual language of the HackHarvard 2024 project **Garuda**. No Garuda source code, components, CSS, animation files, or assets are copied. The implementation and digital-twin behavior in this repository were team-led.

## Disclosure principles

- AI output is reviewed, tested, and meaningfully adapted before submission.
- New AI tools or materially different uses must be recorded here.
- Third-party libraries and media are recorded separately in `THIRD_PARTY_NOTICES.md`.
- Final presentation wording must match this log and must not overstate autonomous-driving capability.
- The submitting team selects the final digital-human voice, reviews every recording, and remains responsible for all public claims and media rights.
