# AI 使用声明 / AI Usage Declaration

## 中文版

> **适用范围**：本声明同时适用于 HHCC 2026 原型开发赛道（2026-08-21 20:00 — 2026-08-23 08:00）与 G-Spark 2026 星火杯赛道 B 的答辩材料。
> **依据**：HHCC 2026 规则第 3 节「AI 使用强制规范」；星火杯《行为守则与政策》第 2 条「人工智能工具使用规范」。
> **星火杯提交用版本**：请使用同目录的《AI 使用声明_星火杯.md》；本文件保留为 HHCC 与项目总体声明。
> **提交前提**：第五节团队审核核对清单须由对应队员实际完成后逐项勾选并由负责人签字；未完成前本声明不得随最终材料提交。

### 一、总体原则

- AI 仅作为辅助工具；核心创意、产品定位、安全阈值、场景设计与验收标准由团队自主决定。
- 所有 AI 输出均经团队审查、运行验证与修改后进入项目；不存在「AI 全盘生成、团队无法解释」的代码或材料。
- 项目严格限定为 L2 组合辅助驾驶的座舱安全层，不宣称 L3/L4 自动驾驶，驾驶员始终是责任主体。

### 二、使用的 AI 工具

| 工具 | 使用阶段 | 具体用途 |
|---|---|---|
| ZCode（AI 编程助手，本机会话） | 官方开发期 | 代码生成、仓库与部署管理、功能文档撰写 |
| Claude Code（AI 编程助手，本机会话） | 官方开发期；赛后迭代 | 代码生成与重构、工程约定维护（AGENTS.md / CLAUDE.md）、文档与提交材料核对 |
| OpenAI Codex | 官方开发期；2026-11-13 赛后迭代 | 规则约束核验、仓库初始化与里程碑同步、功能迭代、证据页与文档整理 |
| OpenAI 图像生成（经 Codex 调用） | 官方开发期 | 基于团队授权的 EVA 参考图生成透明外壳素材 `public/eva/eva-shell-v2.png`（当前版本） |
| 团队选定的数字人语音工作流（经 Codex 集成） | 官方开发期 | 英文 EVA 语音包制作、语音清单与 SHA-256 校验、逐条音频 QA |

### 三、AI 参与完成的内容

**官方开发期（2026-08-21 ～ 08-23）**

- 工程脚手架；零 DOM 座舱内核（仿真动力学、EVA 规则引擎、L2 策略）；
- 机器视觉 DMS（MediaPipe 接入、EAR / PERCLOS / 头姿指标管线）；
- 数字孪生与 HUD；五场景正式巡演与可暂停自动演示；无障碍与降级链路；
- 99 项回归测试的辅助编写与维护（官方提交时的规模），以及 MP3/WebGL/模型失败、桌面/移动端、减弱动态的浏览器兼容性检查；
- 技术文档（README、PIPELINE、CHANGELOG、功能说明）的撰写；
- Git 仓库创建、推送、本地部署与环境配置的辅助操作。

**赛后迭代（2026-11-13 起，面向星火杯）**

- 路由与中文化收敛、界面双语持久化、证据页三列展示、Landing 视觉打磨；
- 回归测试增至 111 项（新增路由 11 项与中文运行时文案 1 项），验证本次改动未破坏既有行为；
- 仅涉及展示层与本地化，`src/core/` 的内核行为、安全阈值与规则未改变；
- 该次迭代已如实记录于 `AI_USAGE.md`（2026-11-13 条目）。

### 四、团队完成的内容

- 项目创意与产品定位（机器视觉 × 智能座舱的 L2 辅助驾驶方向）；
- 需求定义、赛道规则研读、评分维度对应策略；
- GitHub 仓库创建与提交管理决策；
- 提供并审核授权疲劳视频、EVA 形象与最终英文数字人语音包；
- 全部设计取舍与路演材料由团队最终确认；AI 工具不作为团队成员或代码所有者。

### 五、团队审核核对清单（提交前必须如实完成）

> 规则要求：团队须掌握核心创意与关键决策，能够解释代码原理。以下每项由对应队员**实际完成后**方可勾选，并填写负责人。

- [ ] 全体队员运行过项目（`npm run dev`）并完整观看五场景 Full Demo 与各独立体验 —— 负责人：____
- [ ] 内核层（src/core：仿真、规则引擎、参数表）有人能解释原理并现场回答追问 —— 负责人：____
- [ ] 视觉层（src/vision：478 关键点、EAR、PERCLOS、头姿解算）有人能解释原理并现场回答追问 —— 负责人：____
- [ ] 界面层（src/shell：组件结构、数据流）有人能解释原理 —— 负责人：____
- [ ] 团队至少亲手修改过一处代码并理解改动效果（例如调整 params.ts 中一个阈值并跑通测试）—— 负责人：____
- [ ] 答辩 PPT 已逐项列明 AI 工具、具体使用场景与团队所做的修改（星火杯守则第 2 条）—— 负责人：____
- [ ] 路演 PPT 中同步附上本声明摘要 —— 负责人：____

### 六、声明

本项目原型于 2026-08-21 20:00 至 2026-08-23 08:00 官方开发期内从零完成；参加 G-Spark 2026 星火杯时，按赛道 B 重新梳理了需求、演示与材料，2026-11-13 起的路由、中文化与展示层调整属于赛后迭代，不改变内核与安全阈值，并已如实记录于 `AI_USAGE.md`。沿用的均为团队自有开发成果，未使用任何第三方赛前成品。除上述 AI 辅助外，未使用其他 AI 工具。团队对全部提交内容负责，并能够向评审解释项目各部分的原理与取舍。

### 七、与 AI_USAGE.md 的对应关系

- 本声明与 `AI_USAGE.md` 逐条对应；若两处表述不一致，以 `AI_USAGE.md` 的详细记录为准，并在提交前同步修订。
- 新增 AI 工具或用途发生实质变化时，两份文件须同步更新。

---

## English Version

> **Scope:** This declaration applies to the HHCC 2026 Prototype Development Track (2026-08-21 20:00 – 2026-08-23 08:00) and to the defense materials for G-Spark 2026, Track B.
> **Basis:** HHCC 2026 Rule Section 3, "Mandatory AI Usage Specification"; the Spark Cup Code of Conduct and Event Policies, Clause 2, "AI Tool Usage Standards".
> **For the G-SPark submission:** use `AI使用声明_星火杯.md` in the same folder; this file remains the overall HHCC and project declaration.
> **Precondition for submission:** The team review checklist in Section 5 must be completed item by item by the responsible members and signed by the person in charge. This declaration must not be included in the final materials until then.

### 1. General Principles

- AI is used only as an assistive tool. Core creativity, product positioning, safety thresholds, scenario design, and acceptance criteria are decided independently by the team.
- Every AI output is reviewed, run, and modified by the team before it enters the project. No code or material is fully AI-generated and left unexplainable by the team.
- The project is strictly positioned as the cabin-safety layer of L2 combined driving assistance. It does not claim L3/L4 autonomous driving, and the driver remains responsible at all times.

### 2. AI Tools Used

| Tool | Phase | Specific use |
|---|---|---|
| ZCode (AI coding assistant, local session) | Official development period | Code generation, repository and deployment management, feature documentation |
| Claude Code (AI coding assistant, local session) | Official development period; post-event iteration | Code generation and refactoring, engineering conventions (AGENTS.md / CLAUDE.md), document and submission review |
| OpenAI Codex | Official development period; 2026-11-13 post-event iteration | Constraint verification, repository bootstrap and milestone synchronization, feature iteration, evidence page and documentation |
| OpenAI image generation (via Codex) | Official development period | Transparent EVA shell asset `public/eva/eva-shell-v2.png` (current version), derived from the team-authorized EVA reference |
| Team-selected digital-human voice workflow (integrated via Codex) | Official development period | English EVA voice pack production, voice manifest and SHA-256 verification, per-file audio QA |

### 3. Work Completed with AI Assistance

**Official development period (2026-08-21 – 08-23)**

- Project scaffolding; a DOM-free cockpit kernel (simulation dynamics, EVA rule engine, L2 policy);
- Machine-vision DMS (MediaPipe integration; EAR / PERCLOS / head-pose metric pipeline);
- Digital twin and HUD; the five-scene formal tour and pausable automatic demo; accessibility and fallback paths;
- Assistance drafting and maintaining 99 regression tests (the scale at official submission), plus browser compatibility checks for MP3/WebGL/model failure, desktop/mobile layouts, and reduced motion;
- Technical documentation (README, PIPELINE, CHANGELOG, feature guide);
- Assisted operations for Git repository creation, pushes, local deployment, and environment setup.

**Post-event iteration (from 2026-11-13, for the Spark Cup)**

- Route and Chinese-localization convergence, persisted bilingual UI, the three-column Evidence view, and Landing visual polish;
- Regression tests increased to 111 (11 routing tests and 1 Chinese runtime-copy test), verifying that the changes did not break existing behavior;
- These changes touch only the presentation layer and localization. Kernel behavior, safety thresholds, and rules in `src/core/` are unchanged;
- This iteration is recorded truthfully in `AI_USAGE.md` (entry dated 2026-11-13).

### 4. Work Completed by the Team

- Project concept and product positioning (machine vision × smart cockpit, L2 assistance);
- Requirement definition, competition-rule study, and scoring-dimension strategy;
- GitHub repository creation and submission-management decisions;
- Provision and authorization review of the fatigue video, the EVA character, and the final English digital-human voice pack;
- All design trade-offs and pitch materials were finalized by the team. AI tools are not listed as team members or code owners.

### 5. Team Review Checklist (must be completed truthfully before submission)

> Rule requirement: The team must own the core concept and key decisions and be able to explain how the code works. Each item below may be checked only after the responsible member has actually completed it, with the owner's name filled in.

- [ ] All team members have run the project (`npm run dev`) and watched the full five-scene demo and each standalone experience — Owner: ____
- [ ] Someone can explain the kernel layer (src/core: simulation, rule engine, parameter table) and answer follow-up questions on site — Owner: ____
- [ ] Someone can explain the vision layer (src/vision: 478 landmarks, EAR, PERCLOS, head-pose solving) and answer follow-up questions on site — Owner: ____
- [ ] Someone can explain the interface layer (src/shell: component structure, data flow) — Owner: ____
- [ ] The team has personally modified at least one piece of code and understands the effect (for example, changing a threshold in params.ts and running the tests) — Owner: ____
- [ ] The defense PPT lists every AI tool, its specific use, and the team's modifications (Spark Cup Code of Conduct, Clause 2) — Owner: ____
- [ ] The pitch PPT includes a summary of this declaration — Owner: ____

### 6. Declaration

The prototype was built from scratch during the official development period, from 2026-08-21 20:00 to 2026-08-23 08:00. For G-Spark 2026, the team reorganized the requirements, demo, and materials for Track B. The route, Chinese-localization, and presentation-layer adjustments made from 2026-11-13 onward are post-event iterations; they do not change the kernel or safety thresholds and are recorded truthfully in `AI_USAGE.md`. All reused work is the team's own development output, and no third-party pre-event completed work was used. Beyond the AI assistance described above, no other AI tools were used. The team is responsible for all submitted content and can explain the principles and trade-offs of every part of the project to the reviewers.

### 7. Relationship to AI_USAGE.md

- This declaration corresponds item by item to `AI_USAGE.md`. If the two ever disagree, the detailed record in `AI_USAGE.md` prevails, and the declaration must be reconciled before submission.
- When an AI tool is added or its use changes materially, both documents must be updated together.
