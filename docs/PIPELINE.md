# PIPELINE —— 参数表 / 数据流 / 演示剧本

> 参数唯一出处为 `src/core/params.ts` 与 `src/vision/metrics.ts`。修改任何阈值必须：
> ① `npm test` 回归全绿 ② 同步本表 ③ 手动过一遍五场景 Full Demo 与各独立体验。

## 一、内核参数表（src/core/params.ts）

| 参数 | 值 | 说明 |
|---|---|---|
| roadSpeed | 城市 55 / 高速 105 / 拥堵 24 km/h | 道路基准速度 |
| speedTrim | 雨 0.85 / 夜 0.92 / 弯道 0.94 / L2 降级 0.85 / 低情绪 0.96 | 目标速度修正（连乘） |
| fatigueRate | 基础 0.08 / 拥堵 0.22 / 高速(>85) 0.42 每仿真分钟 | 工况疲劳累积 |
| fatigueScenarioMult | 1.6 | 疲劳场景加速倍率 |
| restDecay | 2.6 / 分钟 | 休息模式恢复速率 |
| fatigueTh | care 60 / urgent 85 | 疲劳双阈值 |
| reEscalateAfter | 6 分钟 | 拒绝休息后的再升级间隔 |
| perclosTh | warn 0.25 / high 0.35 | 视觉闭眼占比分级 |
| perclosFatigueK | 185 | PERCLOS→疲劳度折算（0.35→65 越过 care） |
| lookAwayTh | warn 2s / esc 4s | 视线离开分级；≥4s 触发 L2 降级 |
| lookAwayFatigueCap | 40 | 视线离开折算疲劳上限 |
| complexityBlock | 2 | 雨+夜+拥堵 因子 ≥2 屏蔽娱乐 |
| visionEmotion | stableMin 0.3 / chatCd 5 分钟 | 视觉情绪稳定判定与主动关怀冷却 |
| emotionTh | low 32 / high 68 | 情绪四联动阈值 |
| cd | care 8 / urgent 15 / emotion 10 / look 1.5 / complex 6 / l2Remind 5 分钟 | 规则冷却 |
| speedTau | 0.9 分钟 | 速度一阶惯性时间常数 |
| oms.cruiseSpeedKmh | 72 km/h | OMS 主演示巡航速度 |
| oms.minConfidence | 0.60 | 低于该值只显示不确定性，不执行车辆动作 |
| oms.outsideUrgentSec | 0.8s | 车窗外探达到该持续时间后升级 urgent |
| oms.staleMin | 8s | OMS 超时未更新即 stale，不得当作风险解除 |
| oms.speedReductionKmh | 20 km/h | L2 开启时的临时目标速度降幅，最低不低于 30 km/h |
| oms.historyLimit | 20 | Evidence 中保留的 OMS 历史上限 |

## 二、视觉指标参数（src/vision/metrics.ts）

| 参数 | 值 | 说明 |
|---|---|---|
| EAR_CLOSED | 0.15 | EAR 低于该值判为闭眼帧（典型睁眼 0.25–0.40） |
| PERCLOS 窗口 | 30s 滑动 | 闭眼帧占比；blinkPm 按 60s 窗口外推 |
| LOOK_TH | yaw 22° / pitch 18° | 头部姿态超阈记为视线离开 |
| EAR 六点索引 | 右[33,160,158,133,153,144] 左[362,385,387,263,373,380] | MediaPipe 478 点网格 |
| 情绪分类 | blendshapes 加权启发式（EMOTION_TH 0.25）+ 10 帧多数投票平滑 | 6 态 neutral/happy/sad/angry/surprised/drowsy；复用同一 face_landmarker 模型，零额外开销 |

## 三、数据流

```
用户选择的摄像头 / 本地视频 ──MediaPipe(本地WASM/GPU)──▶ 478 关键点 + 4×4 变换矩阵
                                      │ metrics.ts 纯函数
                                      ▼
                     VisionSample{present,perclos,blinkPm,lookAwaySec,yaw,pitch,ear,emotion}
                                      │ act.setVision() ──(模拟信号走同一管线)──▶
                                      ▼
模拟 OMS 座位语义事件 ────────────────────────────────▶ OmsObservation / source boundary
   工况仿真(sim.ts) ──▶ CockpitState ◀─ 融合: fatigue = max(simFatigue, 185×perclos, lookAway×6)
                                      │ evaRules.ts（冷却闸门 + 场景脚本队列 + 用户分支）
                                      ▼
                     座舱调节 / 分级告警 / L2 降级恢复 / MomentTrace / EVA 单句播报
                                      │ CockpitState + DemoCue + mood
                                      ▼
                     deriveTwinFrame ──▶ 三维镜头/透明度/DMS 光束/雨夜反馈/EVA 姿态
                                      └─▶ 精简主舞台 + 三列技术证据工作台 + aria-live
```

采样节流：摄像头和本地视频使用同一模型与指标管线，每帧推理、≥100ms 向内核发样；回放信号 10Hz。默认 Full Demo 不请求摄像头权限。内核时钟 100ms 一拍，但只在 `running` 时执行 `step(dt=0.2×速率)`；ready / paused / Evidence-open / completed 均冻结时间和路线。

## 四、正式自动演示（src/shell/fullDemo.ts，21 拍语音主导状态机）

| Voice ID | 体验 | 闭环重点 |
|---|---|---|
| fd01–fd02 | Daily Commute | 常用路线与座舱偏好自动就绪 |
| fd03–fd07 | Fatigue Guard | 授权视频本地推理 → 轻度关怀 → 重度风险 → 平缓停稳 |
| fd08–fd10 | Complex Roads | 连续雨雾 → 前车制动 → 谨慎 L2 → 天气与速度平滑恢复 |
| fd11–fd13 | Cabin Memory | 记住停车卡 → 关联向左下视线 → 给出位置 → 回正验证 |
| fd14–fd21 | OMS MomentTrace | 右后乘员风险 → DMS×OMS 关联 → 保护动作 → 双信号恢复 → 工件冻结 |

正式巡演使用 `public/audio/eva/en-US/` 下的 21 段英文数字人 MP3，总语音约 103.36 秒；舞台先落稳 0.4–1.2 秒，播放完成后再保留短尾拍，最终时长由实际音频决定而不是另一条固定秒表。Full Demo 的疲劳证据默认使用 `DMS · AUTHORIZED VIDEO · LOCAL INFERENCE`，不请求摄像头。单独选择 OMS MomentTrace 时仍保留条件闸门和驾驶员确认。

语音 API：`play()` / `pause()` / `resume()` / `stop()`。每次 Replay 都先停止旧 Audio 元素和 browser speech，再创建新会话；MP3 不可解码、被自动播放策略阻止或 3 秒内未开始时，依次降级到英文 browser speech 和有界计时。模型解码、标签页恢复或音频异常不会让多个提示挤在同一帧。

## 五、验证流程（每次改动必做）

```bash
npm test          # 111 项：内核、视觉、OMS、时间轴、音频兼容、交互与三维派生
npm run build     # tsc --noEmit + vite build
npm run dev       # 手动：五场景 Full Demo + 各独立体验 + 摄像头/本地视频/回放 + Evidence + EVA 降级
```

发布前还需强制覆盖：MP3 解码失败、旧音频 Replay 截断、WebGL context 创建失败、GLB 404、1426×1114、1440×1000、390×844、`prefers-reduced-motion`。降级状态允许显示明确错误来源，但不得阻断故事、Evidence 或控制。
