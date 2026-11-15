import type { DemoStep, DemoTransportState } from './autoDemo';

type DemoExperience = 'full-demo' | 'oms-trace' | string;

/**
 * EVA 角色中文稿集中在 shell 层：领域内核与 Evidence 仍保留英文事实记录，
 * 只有面向乘员的字幕和语音在这里本地化。
 */
const DEMO_COPY_ZH: Readonly<Record<string, string>> = {
  fd01_commute_welcome: '欢迎回来。常用路线和座舱都准备好了，我们出发吧。',
  fd02_commute_personalized: '温度、灯光和音乐都按您的习惯调好了。我会陪着您。',
  fd03_fatigue_monitor: '上高速了。我会陪您一起留意状态，有变化就及时提醒您。',
  fd04_fatigue_evidence: '状态正在车内确认。画面和数据只留在本地，请您放心。',
  fd05_fatigue_care: '您有些累了。我把风调大、温度调低。别硬撑，前面休息一下吧。',
  fd06_fatigue_urgent: '您真的需要休息了。继续驾驶并不安全，请握稳方向盘。',
  fd07_fatigue_rest: '车辆已经停稳。您先放松一会儿，准备好后我们再出发。',
  fd08_complex_detect: '休息好了吗？我们慢慢重新出发。前方是雨夜路段，我陪您一起看好道路。',
  fd09_complex_brake: '前车突然制动。我正在协助平稳减速并拉开距离，请您握稳方向盘。',
  fd10_complex_clear: '雨势在减弱，视野也慢慢清晰了。我会平稳恢复车速。',
  fd11_memory_remember: '是在找停车卡吗？我记得它在您左手边的车门储物格。',
  fd12_memory_explain: '您在向左下方寻找。我记起了它最后出现的位置，也为您开了灯。',
  fd13_memory_verify: '找到了。您的视线也回到前方，我关好阅读灯，继续陪您看路。',
  fd14_oms_intro: '接下来，我会同时照看您和乘员。您看好前方，右后方交给我。',
  fd15_oms_detect: '右后座乘员靠近车窗。我先确认动作是否持续，请您看前方。',
  fd16_oms_correlate: '您刚才向右后方看了一眼。我知道您是在照看乘员，并不是走神。',
  fd17_oms_decide: '疲劳状态正常。您是在回应右后座的风险。',
  fd18_oms_urgent: '右后座乘员，请立刻回到车内。驾驶员请看好前方，我正在平稳减速。',
  fd19_oms_clear: '乘员已回到车内。现在我陪您确认，视线是否也回到前方。',
  fd20_oms_verify: '很好，乘员和您的视线都恢复了。请您确认安全，我再解除保护。',
  fd21_trace_artifact: '五项体验完成。刚才为什么这样处理，每一步都已留下，需要时可以回看。',

  oms01_ready: '准备好了。这次我会同时照看您和右后座。请您专心驾驶，其他变化我会及时告诉您。',
  oms02_detect: '右后座有人正靠近车窗，我先看着。',
  oms03_prompt: '请确认一下右后座，同时继续看好前方。',
  oms04_correlate: '您也朝右后方看了一眼。我知道您不是走神，而是在回应后排的情况。',
  oms06_urgent: '右后座乘员，请您马上回到车内。驾驶员请看好前方，我正在协助平稳降速。',
  oms07_clear: '乘员已经回到车内了。现在我再确认一下，您的视线是不是也回到了前方。',
  oms08_verify: '很好，您已经重新看向前方。确认车内和道路安全后，我们再解除保护。',
  oms09_artifact: '刚才发生了什么、为什么这样处理，我都记好了。之后每一步都可以回看。',
  oms10_complete: '好了，这次风险已经安全结束。',

  'full-demo:oms-decide': '您不是疲劳或走神，而是在回应右后座的风险。',
  'oms-trace:oms-decide': '您不是因为疲劳转头，而是在回应右后座的情况。',
};

const RUNTIME_COPY_ZH: Readonly<Record<string, string>> = {
  'The driver is responding to a rear-right occupant risk, not fatigue or unexplained distraction.': '驾驶员正在响应右后座乘员风险，并非疲劳或无法解释的分心。',
  'Rear-right occupant risk · urgent response': '右后座乘员风险 · 紧急响应',
  'Rear-right occupant event · duration check': '右后座乘员事件 · 持续时间核验',
  'Urgent fatigue intervention': '疲劳风险 · 紧急干预',
  'Gentle fatigue care': '疲劳风险 · 温和关怀',
  'Coordinated cautious mode': '复杂路况 · 协同谨慎模式',
  'Monitoring within normal range': '状态正常 · 持续监测',
  'Rear-right occupant outside the window — protective L2 speed and headway strategy active.': '右后座乘员靠近车窗，L2 组合辅助正在降低车速并加大跟车距离。',
  'Rear-right occupant outside the window — driver action required.': '右后座乘员靠近车窗，需要驾驶员采取行动。',
  'Possible rear-right occupant window risk — monitoring duration before escalation.': '发现右后座乘员靠近车窗，正在核对持续时间。',
  'OMS confirms the rear-right occupant is fully inside the cabin.': 'OMS 模拟事件显示，右后座乘员已回到车内。',
  'Driver confirmed safe — protective strategy released.': '驾驶员已确认安全，临时保护策略已解除。',
  'Rear-right movement detected.': '右后座有人正在靠近车窗。',
  'Rear-right passenger, please move fully inside. I am reducing speed and extending the following distance while the driver keeps supervising the road.': '右后座乘员，请马上回到车内。驾驶员请别慌，我会平稳降速、拉开距离。请继续看好前方。',
  'Rear-right passenger, please move fully inside. Driver, reduce speed when safe and keep full control of the vehicle.': '右后座，请马上回到车内。驾驶员请在安全时减速，始终握住车辆控制。',
  'I have detected movement toward the rear-right window. Please check that area while continuing to supervise the road.': '右后座有人正靠近车窗。请看一下那里，也别忘了前方。',
  'The rear-right passenger is back inside. I am checking that your attention is forward before releasing the protective strategy.': '乘员已经回到车内了。我再陪您确认，您的视线是不是也回到了前方。',
  'Safety confirmed. Both OMS and DMS show recovery, so the temporary protection is now released.': '很好，乘员已经回到车内，您也看回了前方。临时保护已经解除。',
  'Good morning. Welcome back. Traffic is clear and your usual route is ready.': '早上好，欢迎回来。今天路况不错，还是走我们熟悉的路线。',
  'Your cabin is set: 22.5 degrees, teal light, and soft music.': '温度刚好，灯光也柔和些。放上您常听的歌，我们出发吧。',
  'Highway monitoring is active. I am watching blink rate, PERCLOS, and head pose while you remain in control.': '上高速了，路会有点长。我会陪着您，也会悄悄留意您的状态。',
  'Rain detected. Wipers are on, and the target speed is easing down.': '下雨了，我已经打开雨刷，也会把速度慢慢降下来。您安心看路。',
  'OMS MomentTrace is ready. DMS stays local, OMS events are simulated, and the driver remains responsible.': '准备好了。这次我会同时照看您和右后座。您专心驾驶，其他变化我会及时告诉您。',
  'Got it — boosting ventilation, lowering the temperature and switching to upbeat music to keep you fresh. If you still feel drowsy, I suggest a rest at the next service area; I can plan it for you.': '好，我把风调大、温度调低，再换首精神一点的歌。要是还困，我们就去前面的服务区歇一会儿。',
  'Music off.': '音乐已关闭。',
  'We are close to the destination.': '已经接近目的地。',
  'Sure — found a service area 8 km ahead and entering rest mode for you.': '好的。前方八公里有服务区，我现在为您启动休息模式。',
  "Sorry, I'm still learning. I can currently help with: temperature, music, seat massage, navigation, rest guidance and the L2 assist toggle.": '这个我还没学会。不过温度、音乐、按摩、导航、休息建议和辅助驾驶，都可以交给我。',
  'L2 assisted driving on: adaptive cruise + lane centering. Please keep supervising the road at all times, keep your hands available, and take over anytime.': 'L2 辅助驾驶已开启。我会帮您稳住车速和车道，但您仍要看好道路，随时准备接管。',
  'Heads-up: fatigue signs already detected. Use assisted driving with care, or take a rest at a service area if needed.': '您已经有些疲倦了。辅助驾驶不能替您休息，觉得撑不住时，我们就去服务区停一停。',
  'Switched to manual driving. Eva moves to co-pilot guard mode and keeps warning you about the road.': '已经切回人工驾驶。我会留在副驾，继续和您一起看好这段路。',
  'Locking in the service area 8 km ahead — entering rest mode now: seat reclined, warm ambient light, music off.': '前方八公里有服务区，我已经选好了。灯光和座椅也会慢慢放松下来。',
  'Your eyes are back on the road. I have verified the risk is cleared and turned off the reading light. Keep supervising while L2 assistance is active.': '您已经看回前方，我也把阅读灯关好了。辅助驾驶还在工作，请继续看好道路。',
  'Exit check complete. No important item needs a reminder.': '检查好了，没有重要物品落在车里。',
  'Your eyes have been off the road for over 4 seconds — I have reduced speed and extended the following distance. Please look back at the road now.': '您已经有四秒没有看前方了。请马上看回道路，我正在帮您减速并拉开跟车距离。',
  'You look a little down. I have warmed the ambient light and put on soft music — I am here anytime you want to talk.': '您看起来有些低落。我已调暖氛围灯并播放轻音乐。想聊一聊的时候，我一直都在。',
  'You seem to be in a really good mood — did something nice happen? I would love to hear about it.': '您今天心情似乎很好，是不是遇到了什么开心的事？我很愿意听您分享。',
  'Heavy traffic can be really frustrating. L2 is holding the following distance for you — take a slow deep breath; I have switched to calmer music.': '拥堵确实容易让人烦躁。L2 正在维持安全跟车距离，您可以慢慢深呼吸，我也换成了更舒缓的音乐。',
  'I sense some tension. Warm light and calmer music are on — safety first, we will get through this together.': '我感觉到您有些紧张。暖色灯光和舒缓音乐已经开启，先保证安全，我们一起慢慢来。',
  'Your eyes look drowsy — consider a short break at the next service area; I can plan one for you.': '您看起来有些困倦。建议在下一个服务区短暂休息，我可以为您规划路线。',
  'Everything alright? I am keeping an eye on the road together with you.': '还好吗？我会和您一起留意前方道路。',
  'You are severely fatigued (PERCLOS markedly elevated) — continuing to drive is high risk.': '您现在真的很疲倦，继续开下去不安全。我们尽快找地方休息，好吗？',
  'Your condition has clearly recovered — ready to continue the trip whenever you are.': '您的状态好多了。别着急，等您觉得准备好了，我们再继续出发。',
  'Rainy night in congestion — complex conditions: entertainment blocked, safety announcements prioritized, cautious mode on.': '外面又下雨又堵，路不好走。我先把娱乐信息收起来，我们专心一点。',
  'Road conditions have eased — entertainment and regular cabin services restored.': '路况正在好转。音乐和座舱服务会慢慢恢复，不会突然打扰您。',
  'Sensing low mood: ambient light warmed up, soothing music on, gentle massage started — hope it helps you relax.': '您好像有点低落。我把灯光调暖，也放上轻音乐。想聊的时候，我一直都在。',
  'You seem excited: switched to calmer tracks and fine-tuned ventilation to keep driving steady.': '您好像有点兴奋。我换了首平静些的歌，也调好了风，我们把节奏慢下来。',
  'Severe fatigue: entering a service area to rest is strongly advised.': '重度疲劳：强烈建议进入服务区休息。',
  'L2 reminder: please keep watching the road while assisted driving is active.': 'L2 提醒：辅助驾驶已开启，请持续关注路面。',
  'Shall I plan a service area ahead and enter rest mode for you now?': '要我现在为您规划前方服务区并进入休息模式吗？',
  'Rest now': '立即休息',
  'Keep driving': '再坚持一会儿',
};

const MUSIC_ZH: Readonly<Record<string, string>> = {
  Soft: '轻音乐',
  Upbeat: '活力音乐',
  News: '新闻',
  Off: '关闭',
};

const ITEM_ZH: Readonly<Record<string, string>> = {
  'parking card': '停车卡',
  'laptop bag': '电脑包',
  phone: '手机',
  'water bottle': '水杯',
};

const LOCATION_ZH: Readonly<Record<string, string>> = {
  'driver-side door pocket': '主驾车门储物格',
  'wireless charging pad': '无线充电板',
  'rear seat': '后排座椅',
  'cup holder': '杯架',
};

const translateItem = (value: string) => ITEM_ZH[value.toLowerCase()] ?? value;
const translateLocation = (value: string) => LOCATION_ZH[value.toLowerCase()] ?? value;

export function localizeEvaText(text: string): string {
  const source = text.trim();
  const exact = RUNTIME_COPY_ZH[source];
  if (exact) return exact;

  let match = source.match(/^Your usual route is planned\. It will take about (\d+) minutes to arrive\.$/);
  if (match) return `路线已经规划好了，按当前速度预计约 ${match[1]} 分钟到达。`;

  match = source.match(/^Sure — temperature (lowered|raised) to ([\d.]+)°C\.$/);
  if (match) return `好的，温度已调${match[1] === 'lowered' ? '低' : '高'}至 ${match[2]}°C。`;

  match = source.match(/^Switched to (.+)\.$/);
  if (match) return `好，换成${MUSIC_ZH[match[1]] ?? match[1]}。`;

  match = source.match(/^Seat massage (on|off)\.$/);
  if (match) return `好，座椅按摩${match[1] === 'on' ? '打开了' : '关好了'}。`;

  match = source.match(/^([\d.]+) km remaining — about (\d+) minutes to arrive at current speed\.$/);
  if (match) return `剩余 ${match[1]} 公里，按当前速度预计约 ${match[2]} 分钟到达。`;

  match = source.match(/^Understood\. If severe fatigue is still detected in (\d+) minutes, I will remind you again\. Please keep the windows ventilated\.$/);
  if (match) return `明白。${match[1]} 分钟后如果您还是很累，我会再提醒您。先让车里透透气。`;

  match = source.match(/^I can see you are looking for the (.+)\. It was last seen (.+)\. I have opened the driver-side reading light — keep supervising the road and be ready to take over\.$/);
  if (match) return `在找${translateItem(match[1])}吗？我记得它在${translateLocation(match[2])}。我帮您开灯，请继续看好前方。`;

  match = source.match(/^Before you leave: (.+)\. Ordinary items stay silent; only what matters triggers a reminder\.$/);
  if (match) {
    const items = match[1]
      .split('; ')
      .map((entry) => {
        const item = entry.match(/^(.+) remains (.+)$/);
        return item ? `${translateItem(item[1])}还在${translateLocation(item[2])}` : entry;
      })
      .join('；');
    return `离车前提醒您一下：${items}。其他东西都带好了。`;
  }

  match = source.match(/^Noticing more frequent blinks and drooping eyelids(?: \(PERCLOS (\d+)%\))? — ventilation boosted and temperature lowered(?:, soft music on)?\. Consider opening a window or resting at a service area\.$/);
  if (match) {
    const evidence = match[1] ? `，眼睑闭合比例为 ${match[1]}%` : '';
    return `您眨眼变多了，眼睛也有些睁不开${evidence}。我把风调大、温度调低。别硬撑，前面歇一歇吧。`;
  }

  return source;
}

export function resolveDemoEvaText(
  step: Pick<DemoStep, 'cue' | 'note' | 'voiceId'>,
  experience: DemoExperience,
): string {
  const key = step.voiceId ?? `${experience}:${step.cue}`;
  return DEMO_COPY_ZH[key] ?? localizeEvaText(step.note);
}

export function resolveEvaFallbackText(
  transport: DemoTransportState,
  experience: DemoExperience,
): string {
  if (transport === 'paused') return '我们先停在这里。准备好后，我会从这一刻继续。';
  if (transport === 'completed') return experience === 'full-demo'
    ? '五个场景结束了。想再看哪一段，我都可以陪您重来。'
    : '好了，这次风险已经安全结束。刚才每一步，也都已经记好了。';
  const readyCopy: Readonly<Record<string, string>> = {
    'full-demo': '准备好了。接下来五段路，我会一直陪着您。我们出发吧。',
    'oms-trace': '准备好了。这次我会同时照看您和右后座，陪您把这次风险处理好。',
    commute: '日常通勤已经准备好。今天还是走熟悉的路线，我们出发吧。',
    fatigue: '疲劳守护已经开启。我会陪您一起留意状态，有变化就及时提醒您。',
    complex: '复杂路况体验已经开启。我会收起无关信息，陪您把注意力留在路上。',
    'cabin-memory': '舱内记忆已经准备好。需要找东西时，我会结合您的视线帮您回忆。',
  };
  return readyCopy[experience] ?? '准备好了。我会陪您一起完成这次体验。';
}
