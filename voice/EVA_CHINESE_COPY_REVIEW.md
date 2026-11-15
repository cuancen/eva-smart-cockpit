# EVA 五场自动演示中文定稿

这份文档是数字人录音与字幕审片的主稿。`spoken_text` 与应用内 `src/shell/evaCopyZh.ts` 保持一致；录音不得自行增删词。技术界面继续使用英文，EVA 面向乘员只说中文。

## 角色与节奏

- EVA 是一位温暖、可靠的副驾，不是功能讲解员。
- 全程使用尊称“您”。紧急时先说对象与动作，风险解除后再放松。
- 技术指标留给 Evidence；EVA 只讲乘员听得懂的事实、关心和下一步。
- 每句必须在 `target_duration_sec` 内完整结束，画面会等语音结束后再进入下一拍。
- L2 仅提供辅助。驾驶员始终负责监督道路并准备接管。

## 21 句主线稿

| 顺序 | voice_id | 场景 | 对象 | 情绪 | 目标时长 | 中文稿 |
|---:|---|---|---|---|---:|---|
| 01 | `fd01_commute_welcome` | Daily Commute | driver | warm | 5.1s | 欢迎回来。常用路线和座舱都准备好了，我们出发吧。 |
| 02 | `fd02_commute_personalized` | Daily Commute | driver | warm | 4.7s | 温度、灯光和音乐都按您的习惯调好了。我会陪着您。 |
| 03 | `fd03_fatigue_monitor` | Fatigue Guard | driver | calm | 5.2s | 上高速了。我会陪您一起留意状态，有变化就及时提醒您。 |
| 04 | `fd04_fatigue_evidence` | Fatigue Guard | driver | caring | 5.2s | 状态正在车内确认。画面和数据只留在本地，请您放心。 |
| 05 | `fd05_fatigue_care` | Fatigue Guard | driver | caring | 6.1s | 您有些累了。我把风调大、温度调低。别硬撑，前面休息一下吧。 |
| 06 | `fd06_fatigue_urgent` | Fatigue Guard | driver | urgent | 5.3s | 您真的需要休息了。继续驾驶并不安全，请握稳方向盘。 |
| 07 | `fd07_fatigue_rest` | Fatigue Guard | driver | caring | 5.3s | 车辆已经停稳。您先放松一会儿，准备好后我们再出发。 |
| 08 | `fd08_complex_detect` | Complex Roads | driver | cautious | 5.7s | 休息好了吗？我们慢慢重新出发。前方是雨夜路段，我陪您一起看好道路。 |
| 09 | `fd09_complex_brake` | Complex Roads | driver | urgent | 6.8s | 前车突然制动。我正在协助平稳减速并拉开距离，请您握稳方向盘。 |
| 10 | `fd10_complex_clear` | Complex Roads | driver | confirming | 5.2s | 雨势在减弱，视野也慢慢清晰了。我会平稳恢复车速。 |
| 11 | `fd11_memory_remember` | Cabin Memory | driver | warm | 5.5s | 是在找停车卡吗？我记得它在您左手边的车门储物格。 |
| 12 | `fd12_memory_explain` | Cabin Memory | driver | caring | 5.2s | 您在向左下方寻找。我记起了它最后出现的位置，也为您开了灯。 |
| 13 | `fd13_memory_verify` | Cabin Memory | driver | confirming | 4.8s | 找到了。您的视线也回到前方，我关好阅读灯，继续陪您看路。 |
| 14 | `fd14_oms_intro` | OMS MomentTrace | cabin | calm | 5.3s | 接下来，我会同时照看您和乘员。您看好前方，右后方交给我。 |
| 15 | `fd15_oms_detect` | OMS MomentTrace | driver | cautious | 4.8s | 右后座乘员靠近车窗。我先确认动作是否持续，请您看前方。 |
| 16 | `fd16_oms_correlate` | OMS MomentTrace | driver | calm | 5.2s | 您刚才向右后方看了一眼。我知道您是在照看乘员，并不是走神。 |
| 17 | `fd17_oms_decide` | OMS MomentTrace | cabin | calm | 3.5s | 疲劳状态正常。您是在回应右后座的风险。 |
| 18 | `fd18_oms_urgent` | OMS MomentTrace | rear-right | urgent | 6.1s | 右后座乘员，请立刻回到车内。驾驶员请看好前方，我正在平稳减速。 |
| 19 | `fd19_oms_clear` | OMS MomentTrace | driver | caring | 4.9s | 乘员已回到车内。现在我陪您确认，视线是否也回到前方。 |
| 20 | `fd20_oms_verify` | OMS MomentTrace | driver | confirming | 5.0s | 很好，乘员和您的视线都恢复了。请您确认安全，我再解除保护。 |
| 21 | `fd21_trace_artifact` | Finale | cabin | confirming | 5.7s | 五项体验完成。刚才为什么这样处理，每一步都已留下，需要时可以回看。 |

## 情绪弧线

1. **通勤**：熟悉、轻松，建立“我认识您”的陪伴关系。
2. **疲劳**：从静静守护转为温柔关心，再到坚定的安全提醒；停车后明显放松。
3. **雨夜**：重新出发时先确认人的状态；前车制动时短而稳，雨势缓解后自然松开。
4. **舱内记忆**：像熟悉乘员习惯的副驾，不把时空关联说成算法。
5. **OMS**：先观察、不抢结论；理解驾驶员转头的原因；风险确认后对象分明地提醒；最后把安全确认权交还驾驶员。

## 数字人交付

- 先生成 `eva_full_demo_voice_zh-CN.csv` 的 21 个 `priority` 文件。
- 文件名必须完全一致，优先 WAV PCM 48 kHz、24-bit、mono。
- 不添加音乐、音效、提示音或第二角色。右后乘员提醒仍由同一个 EVA 声线完成。
- 若某句超时，优先略微加快句内连接，不要吞尾字；仍超时则回报该 `voice_id`，不要自行删词。
