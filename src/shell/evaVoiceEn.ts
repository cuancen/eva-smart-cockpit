import fullDemoManifest from '../../voice/en-US/eva_full_demo_voice_en-US.csv?raw';
import omsManifest from '../../voice/en-US/eva_oms_standalone_voice_en-US.csv?raw';
import qaManifest from '../../voice/en-US/EVA_VOICE_QA_en-US.csv?raw';
import runtimeManifest from '../../voice/en-US/eva_runtime_voice_en-US.csv?raw';
import type { DemoStep, DemoTransportState } from './autoDemo';

type DemoExperience = 'full-demo' | 'oms-trace' | string;

interface CsvRecord {
  [key: string]: string;
}

export interface EvaVoiceAsset {
  voiceId: string;
  scene: string;
  text: string;
  audience: string;
  tone: string;
  durationMs: number;
  fileName: string;
  url: string;
}

/** Small RFC-4180 reader so the approved CSV remains the single copy/audio source. */
export function parseVoiceCsv(source: string): CsvRecord[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/u, ''));
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell.replace(/\r$/u, ''));
    rows.push(row);
  }
  const [header, ...body] = rows;
  if (!header) return [];
  const normalizedHeader = header.map((key) => key.replace(/^\uFEFF/u, '').trim());
  return body.map((values) => Object.fromEntries(normalizedHeader.map((key, index) => [key, values[index] ?? ''])));
}

const qaDurationById = new Map(
  parseVoiceCsv(qaManifest).map((row) => [row.voice_id, Number(row.duration_sec) * 1000]),
);
const fullDemoRows = parseVoiceCsv(fullDemoManifest);
const omsRows = parseVoiceCsv(omsManifest);
const runtimeRows = parseVoiceCsv(runtimeManifest);

const voiceAssets = new Map<string, EvaVoiceAsset>();
const assetsByApprovedText = new Map<string, EvaVoiceAsset>();

for (const row of [...fullDemoRows, ...omsRows, ...runtimeRows]) {
  if (!row.voice_id || !row.file_name || row.status === 'template') continue;
  const asset: EvaVoiceAsset = {
    voiceId: row.voice_id,
    scene: row.scene,
    text: row.spoken_text,
    audience: row.audience,
    tone: row.tone,
    durationMs: Math.round(qaDurationById.get(row.voice_id) ?? Number(row.target_duration_sec) * 1000),
    fileName: row.file_name,
    url: `${import.meta.env.BASE_URL}audio/eva/en-US/${row.file_name}`,
  };
  voiceAssets.set(asset.voiceId, asset);
  assetsByApprovedText.set(asset.text, asset);
}

export const FULL_DEMO_VOICE_IDS = fullDemoRows.map((row) => row.voice_id);
export const OMS_VOICE_IDS = omsRows.map((row) => row.voice_id);

export function getEvaVoiceAsset(voiceId?: string): EvaVoiceAsset | undefined {
  return voiceId ? voiceAssets.get(voiceId) : undefined;
}

export function getEvaVoiceWindow(voiceId?: string, count = 3): EvaVoiceAsset[] {
  if (!voiceId) return [];
  const sequence = FULL_DEMO_VOICE_IDS.includes(voiceId) ? FULL_DEMO_VOICE_IDS : OMS_VOICE_IDS;
  const start = sequence.indexOf(voiceId);
  if (start < 0) {
    const current = getEvaVoiceAsset(voiceId);
    return current ? [current] : [];
  }
  return sequence.slice(start, start + count)
    .map((id) => getEvaVoiceAsset(id))
    .filter((asset): asset is EvaVoiceAsset => !!asset);
}

/** Current domain messages are stable facts; map them to the approved, shorter performance copy. */
const SOURCE_TO_VOICE_ID: Readonly<Record<string, string>> = {
  'Rear-right passenger, please move fully inside. I am reducing speed and extending the following distance while the driver keeps supervising the road.': 'rt01_oms_l2_response',
  'Rear-right passenger, please move fully inside. Driver, reduce speed when safe and keep full control of the vehicle.': 'rt02_oms_manual_response',
  'I have detected movement toward the rear-right window. Please check that area while continuing to supervise the road.': 'rt03_oms_candidate',
  'The rear-right passenger is back inside. I am checking that your attention is forward before releasing the protective strategy.': 'rt04_oms_recovery_check',
  'Safety confirmed. Both OMS and DMS show recovery, so the temporary protection is now released.': 'rt05_oms_confirmed',
  'Good morning. Welcome back. Traffic is clear and your usual route is ready.': 'rt06_commute_welcome',
  'Your cabin is set: 22.5 degrees, teal light, and soft music.': 'rt07_commute_cabin',
  'Highway monitoring is active. I am watching blink rate, PERCLOS, and head pose while you remain in control.': 'rt09_fatigue_monitor',
  'Rain detected. Wipers are on, and the target speed is easing down.': 'rt10_complex_rain',
  'OMS MomentTrace is ready. DMS stays local, OMS events are simulated, and the driver remains responsible.': 'rt11_oms_ready',
  'Got it — boosting ventilation, lowering the temperature and switching to upbeat music to keep you fresh. If you still feel drowsy, I suggest a rest at the next service area; I can plan it for you.': 'rt12_command_drowsy',
  'Music off.': 'rt15_music_off',
  'We are close to the destination.': 'rt19_navigation_arrived',
  'Sure — found a service area 8 km ahead and entering rest mode for you.': 'rt20_rest_command',
  "Sorry, I'm still learning. I can currently help with: temperature, music, seat massage, navigation, rest guidance and the L2 assist toggle.": 'rt21_unknown_command',
  'L2 assisted driving on: adaptive cruise + lane centering. Please keep supervising the road at all times, keep your hands available, and take over anytime.': 'rt22_l2_on',
  'Heads-up: fatigue signs already detected. Use assisted driving with care, or take a rest at a service area if needed.': 'rt23_l2_fatigue_warning',
  'Switched to manual driving. Eva moves to co-pilot guard mode and keeps warning you about the road.': 'rt24_l2_off',
  'Locking in the service area 8 km ahead — entering rest mode now: seat reclined, warm ambient light, music off.': 'rt25_rest_accept',
  'Your eyes are back on the road. I have verified the risk is cleared and turned off the reading light. Keep supervising while L2 assistance is active.': 'rt28_memory_verified',
  'Exit check complete. No important item needs a reminder.': 'rt30_exit_clear',
  'Your eyes have been off the road for over 4 seconds — I have reduced speed and extended the following distance. Please look back at the road now.': 'rt31_distraction_urgent',
  'You look a little down. I have warmed the ambient light and put on soft music — I am here anytime you want to talk.': 'rt32_emotion_sad',
  'You seem to be in a really good mood — did something nice happen? I would love to hear about it.': 'rt33_emotion_happy',
  'Heavy traffic can be really frustrating. L2 is holding the following distance for you — take a slow deep breath; I have switched to calmer music.': 'rt34_emotion_angry_traffic',
  'I sense some tension. Warm light and calmer music are on — safety first, we will get through this together.': 'rt35_emotion_angry',
  'Your eyes look drowsy — consider a short break at the next service area; I can plan one for you.': 'rt36_emotion_drowsy',
  'Everything alright? I am keeping an eye on the road together with you.': 'rt37_emotion_surprised',
  'You are severely fatigued (PERCLOS markedly elevated) — continuing to drive is high risk.': 'rt38_fatigue_urgent',
  'Your condition has clearly recovered — ready to continue the trip whenever you are.': 'rt40_fatigue_recovered',
  'Rainy night in congestion — complex conditions: entertainment blocked, safety announcements prioritized, cautious mode on.': 'rt41_complex_active',
  'Road conditions have eased — entertainment and regular cabin services restored.': 'rt42_complex_clear',
  'Sensing low mood: ambient light warmed up, soothing music on, gentle massage started — hope it helps you relax.': 'rt43_mood_low',
  'You seem excited: switched to calmer tracks and fine-tuned ventilation to keep driving steady.': 'rt44_mood_high',
};

function fixedRuntimeAsset(source: string): EvaVoiceAsset | undefined {
  return getEvaVoiceAsset(SOURCE_TO_VOICE_ID[source]) ?? assetsByApprovedText.get(source);
}

export function resolveEvaRuntimeAsset(source: string): EvaVoiceAsset | undefined {
  return fixedRuntimeAsset(source.trim());
}

export function resolveEvaRuntimeText(text: string): string {
  const source = text.trim();
  const fixed = fixedRuntimeAsset(source);
  if (fixed) return fixed.text;

  let match = source.match(/^Your usual route is planned\. It will take about (\d+) minutes to arrive\.$/);
  if (match) return `Your route is ready. At our current speed, we'll arrive in about ${match[1]} minutes.`;

  match = source.match(/^Sure — temperature (lowered|raised) to ([\d.]+)°C\.$/);
  if (match) return `Okay, I've ${match[1]} the temperature to ${match[2]} degrees Celsius.`;

  match = source.match(/^Switched to (.+)\.$/);
  if (match) return `Okay, switching to ${match[1].toLowerCase()}.`;

  match = source.match(/^Seat massage (on|off)\.$/);
  if (match) return `Okay, seat massage is ${match[1]}.`;

  match = source.match(/^([\d.]+) km remaining — about (\d+) minutes to arrive at current speed\.$/);
  if (match) return `${match[1]} kilometers remaining. At our current speed, we'll arrive in about ${match[2]} minutes.`;

  match = source.match(/^Understood\. If severe fatigue is still detected in (\d+) minutes, I will remind you again\. Please keep the windows ventilated\.$/);
  if (match) return `Understood. If you're still tired in ${match[1]} minutes, I'll remind you again. For now, let's get some fresh air in.`;

  match = source.match(/^I can see you are looking for the (.+)\. It was last seen (.+)\. I have opened the driver-side reading light — keep supervising the road and be ready to take over\.$/);
  if (match) return `Looking for ${match[1]}? I remember it's in ${match[2]}. I'll turn on the light; please keep your eyes ahead.`;

  match = source.match(/^Before you leave: (.+)\. Ordinary items stay silent; only what matters triggers a reminder\.$/);
  if (match) return `Before you leave, a reminder: ${match[1]}. I won't bother you about ordinary items.`;

  match = source.match(/^Noticing more frequent blinks and drooping eyelids(?: \(PERCLOS (\d+)%\))? — ventilation boosted and temperature lowered(?:, soft music on)?\. Consider opening a window or resting at a service area\.$/);
  if (match) {
    const evidence = match[1] ? `PERCLOS is ${match[1]} percent` : 'your eyes are struggling to stay open';
    return `You're blinking more, and ${evidence}. I'll raise the airflow and lower the temperature. Don't push yourself; let's rest ahead.`;
  }

  return source;
}

export function resolveDemoEvaText(
  step: Pick<DemoStep, 'note' | 'voiceId'>,
  _experience: DemoExperience,
): string {
  return getEvaVoiceAsset(step.voiceId)?.text ?? resolveEvaRuntimeText(step.note);
}

export function resolveEvaFallbackText(
  transport: DemoTransportState,
  experience: DemoExperience,
): string {
  if (transport === 'paused') return getEvaVoiceAsset('ui01_paused')?.text ?? "Let's pause here.";
  if (transport === 'completed') return getEvaVoiceAsset(experience === 'full-demo' ? 'ui03_full_complete' : 'ui05_oms_complete')?.text
    ?? 'The experience is complete.';
  if (experience === 'full-demo') return getEvaVoiceAsset('ui02_full_ready')?.text ?? 'The full demo is ready.';
  if (experience === 'oms-trace') return getEvaVoiceAsset('ui04_oms_ready')?.text ?? 'The OMS experience is ready.';
  const readyCopy: Readonly<Record<string, string>> = {
    commute: "Daily Commute is ready. We'll take the familiar route.",
    fatigue: "Fatigue Guard is ready. I'll stay attentive with you.",
    complex: "Complex Roads is ready. I'll keep nonessential information out of the way.",
    'cabin-memory': "Cabin Memory is ready. I'll connect your gaze with the last known location.",
  };
  return readyCopy[experience] ?? 'The experience is ready.';
}
