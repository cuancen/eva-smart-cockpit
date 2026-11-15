# AI 使用声明（G-SPark 2026 星火杯 · 赛道 B）/ AI Usage Declaration — G-SPark 2026, Track B

## 中文版

> **依据**：G-SPark 2026 参赛选手指导手册《行为守则与政策》第 1 条「诚信参赛」、第 2 条「人工智能工具使用规范」。
> **提交前提**：本声明须与答辩 PPT 的 AI 专页内容一致；第四节核对清单完成后，由团队负责人确认。
> **适用范围说明**：本项目为赛前已有的阶段性项目积累，按手册允许的方式报名参赛。本声明不声称项目在星火杯现场开发期内从零完成。

### 一、项目来源与参赛方式

- 项目原型自 2026 年 8 月起由团队持续开发，初始版本形成于 HHCC 2026 开发期；本次以「赛前阶段性项目积累」报名星火杯，赛前完成需求重梳理、中文化、演示与提交材料。
- 核心创意、产品定位、安全边界与关键决策由团队自主完成；未提交他人或其他团队的作品。
- AI 工具不作为团队成员，不拥有代码或作品权利。

### 二、AI 工具与使用场景

| 工具 | 使用阶段 | 使用场景 | 主要产出 | 团队审核方式 |
|---|---|---|---|---|
| ZCode（AI 编程助手，本机会话） | 原型开发期 | 在团队指令下辅助代码生成、仓库与部署管理、功能文档撰写 | 工程脚手架、部署操作、文档草稿 | 团队逐项审阅并运行验证 |
| Claude Code（AI 编程助手，本机会话） | 原型开发期；赛前材料整理；2026-11-15 仓库维护 | 在团队指令下辅助代码生成与重构、工程约定维护、双语文档与提交材料核对、手机端适配与首页打磨 | 工程约定、文档与材料更新、移动端与首页更新 | 团队逐项审阅并运行验证 |
| OpenAI Codex | 原型开发期；赛前迭代 | 在团队指令下辅助规则约束核验、仓库初始化、功能迭代、证据页与文档整理 | 功能实现草稿、证据页、文档 | 团队逐项审阅并运行验证 |
| OpenAI 图像生成（经 Codex 调用） | 原型开发期 | 基于团队提供并授权的 EVA 参考图生成透明外壳素材 | `public/eva/eva-shell-v2.png` | 团队提供源图并确认最终素材 |
| 团队选定的数字人语音工作流（经 Codex 集成） | 原型开发期 | 英文 EVA 语音包制作、语音清单与 SHA-256 校验、逐条音频 QA | 69 段已审核 MP3 与语音清单 | 团队交付最终语音包并逐条复核 |

> 说明：以上工具均由团队下达指令、设定边界并验收产出；AI 不自行决定产品方向、安全阈值或提交内容。

### 三、团队主导与原创性说明

- 不存在「团队仅做拼音输入、纠错修改均由 AI 全盘生成」的情形。所有 AI 产出均经团队审阅、运行验证与实质性修改后进入项目。
- 关键模块的最终版本以团队审阅后的代码为准；团队保留设计取舍、参数取值与验收标准的决定权。
- 团队可现场解释各模块的原理与取舍；具体讲解人与证据见下表。

### 四、团队可现场解释的模块与手改记录

**4.1 模块讲解责任**

| 模块 | 负责队员 | 可解释内容 | 证据 |
|---|---|---|---|
| 内核 / 规则（`src/core`） | （团队填写） | 仿真、规则引擎、参数表与阈值理由 | `docs/PIPELINE.md`、`tests/core.test.ts` |
| 视觉（`src/vision`） | （团队填写） | 478 关键点、EAR、PERCLOS、头姿解算 | `tests/vision.test.ts` |
| 界面 / 交互（`src/shell`） | （团队填写） | 组件结构、数据流、无障碍与降级 | `tests/shell.test.ts` |
| 演示 / 材料 | （团队填写） | 五场景巡演、PPT 与 KT 板叙事 | `docs/功能说明.md`、答辩 PPT |

**4.2 团队手改记录（提交前如实填写，不得虚构）**

| 文件 / 函数 | 团队改动 | 改动原因 | 验证方式 | 负责人 |
|---|---|---|---|---|
| （示例）`src/core/params.ts` | （填写团队实际调整的阈值） | （填写取值理由） | `npm test` | （填写） |
| （填写） | （填写） | （填写） | （填写） | （填写） |

### 五、答辩 PPT 声明要求

- [ ] 答辩 PPT 设有 AI 使用专页，逐项列明工具、场景与团队修改
- [ ] 每个模块有明确的现场讲解人
- [ ] 能现场回答关键参数为什么取这个值
- [ ] PPT 措辞与本声明、`AI_USAGE.md` 保持一致

### 六、数据与隐私

- 摄像头画面与上传视频仅在浏览器本地推理，原始影像不上传。
- 模型、车辆、语音等资源优先从本地自托管路径加载，并配置多源回退；回退仅用于获取运行资源，不构成影像或数据外发路径。
- 第三方素材与授权记录见 `THIRD_PARTY_NOTICES.md`。

### 七、声明

本项目为团队赛前已有阶段性项目，按星火杯规则以既有积累参赛；原型源于团队在 2026 年 8 月的开发成果，本次按赛道 B 重新梳理需求、演示与材料。团队对全部提交内容负责，能够向评审解释项目各部分的原理与取舍，并对 AI 辅助产出的最终版本完成审核与修改。

---

## English Version

> **Basis:** G-SPark 2026 Participant Handbook, Code of Conduct and Event Policies, Clause 1 "Integrity" and Clause 2 "AI Tool Usage Standards".
> **Precondition for submission:** This declaration must match the AI page of the defense PPT. The checklist in Section 4 must be completed and confirmed by the team lead.
> **Scope note:** This is a pre-existing staged project submitted in the manner permitted by the handbook. This declaration does not claim that the project was built from scratch during the G-SPark on-site development period.

### 1. Project Origin and Participation

- The prototype has been developed by the team since August 2026, with its initial version produced during the HHCC 2026 development period. It is submitted to G-SPark as a pre-existing staged project; the pre-event work covered requirements review, Chinese localization, demonstration, and submission materials.
- Core creativity, product positioning, safety boundaries, and key decisions were made by the team. No work by other people or teams is submitted.
- AI tools are not team members and hold no rights to the code or the work.

### 2. AI Tools and Usage Scenarios

| Tool | Phase | Scenario | Main output | Team review |
|---|---|---|---|---|
| ZCode (AI coding assistant, local session) | Prototype development | Assisted code generation, repository and deployment management, feature documentation under team direction | Scaffolding, deployment operations, documentation drafts | Reviewed item by item and verified by running |
| Claude Code (AI coding assistant, local session) | Prototype development; pre-event materials; 2026-11-15 repository maintenance | Assisted code generation and refactoring, engineering conventions, bilingual documentation and submission review, phone adaptation and landing polish under team direction | Convention files, documentation and material updates, mobile and landing updates | Reviewed item by item and verified by running |
| OpenAI Codex | Prototype development; pre-event iteration | Assisted constraint verification, repository bootstrap, feature iteration, evidence page and documentation under team direction | Feature implementation drafts, evidence page, documentation | Reviewed item by item and verified by running |
| OpenAI image generation (via Codex) | Prototype development | Generated the transparent EVA shell from the team-provided, team-authorized reference under team direction | `public/eva/eva-shell-v2.png` | The team supplied the source and approved the final asset |
| Team-selected digital-human voice workflow (integrated via Codex) | Prototype development | English EVA voice pack production, voice manifest and SHA-256 verification, per-file audio QA | 69 reviewed MP3 assets and voice manifests | The team delivered the final pack and reviewed each recording |

> Note: The team directed every tool, set its boundaries, and accepted its output. AI did not decide the product direction, safety thresholds, or submission content.

### 3. Team Leadership and Originality

- There is no case in which the team only entered pinyin while AI generated the full code. Every AI output was reviewed, run, and substantially modified by the team before entering the project.
- The final version of each key module is the team-reviewed code. The team retains all decisions on design trade-offs, parameter values, and acceptance criteria.
- The team can explain every module on site; the assigned speakers and evidence are listed below.

### 4. Modules the Team Can Explain, and Hand-Modification Records

**4.1 Module ownership**

| Module | Owner | What can be explained | Evidence |
|---|---|---|---|
| Kernel / rules (`src/core`) | (team to fill) | Simulation, rule engine, parameter table and threshold rationale | `docs/PIPELINE.md`, `tests/core.test.ts` |
| Vision (`src/vision`) | (team to fill) | 478 landmarks, EAR, PERCLOS, head-pose solving | `tests/vision.test.ts` |
| UI / interaction (`src/shell`) | (team to fill) | Component structure, data flow, accessibility and fallbacks | `tests/shell.test.ts` |
| Demo / materials | (team to fill) | Five-scene tour, PPT and KT board narrative | `docs/功能说明.md`, defense PPT |

**4.2 Team hand-modification record (fill truthfully before submission; do not invent)**

| File / function | Team change | Reason | Verification | Owner |
|---|---|---|---|---|
| (example) `src/core/params.ts` | (the threshold the team actually changed) | (the rationale for the value) | `npm test` | (fill in) |
| (fill in) | (fill in) | (fill in) | (fill in) | (fill in) |

### 5. Defense PPT Declaration Requirements

- [ ] The defense PPT has an AI usage page listing each tool, scenario, and team modification
- [ ] Each module has a named on-site speaker
- [ ] The team can explain why each key parameter takes its value
- [ ] The PPT wording matches this declaration and `AI_USAGE.md`

### 6. Data and Privacy

- Camera frames and uploaded videos are inferred locally in the browser; raw imagery is never uploaded.
- Models, vehicle, and voice assets load from local self-hosted paths first, with multi-source fallback. The fallback only retrieves runtime assets and is not a path for imagery or data to leave the device.
- Third-party assets and authorizations are recorded in `THIRD_PARTY_NOTICES.md`.

### 7. Declaration

This is a pre-existing staged project submitted under the G-SPark rules. The prototype originates from the team's August 2026 development work; for G-SPark, the team reorganized the requirements, demonstration, and materials for Track B. The team is responsible for all submitted content, can explain the principles and trade-offs of every part of the project, and has reviewed and modified the final version of all AI-assisted output.
