import type { CockpitActions, TraceDmsMode, VisionSample } from '../core';
import type {
  AutoDemoHandle,
  DemoAudience,
  DemoCue,
  DemoStep,
  DemoTone,
  DemoTransportState,
} from './autoDemo';

export type FullDemoAction =
  | 'commute-start'
  | 'commute-route'
  | 'fatigue-monitor'
  | 'fatigue-evidence'
  | 'fatigue-care'
  | 'fatigue-urgent'
  | 'fatigue-rest'
  | 'complex-start'
  | 'complex-brake'
  | 'complex-clear'
  | 'memory-start'
  | 'memory-assist'
  | 'memory-verify'
  | 'oms-start'
  | 'oms-candidate'
  | 'oms-correlate'
  | 'oms-decide'
  | 'oms-urgent'
  | 'oms-clear'
  | 'oms-verify'
  | 'oms-artifact'
  | 'complete';

export type DemoBeatEventType =
  | 'evidence-peek'
  | 'cabin-airflow'
  | 'rest-settled'
  | 'lead-distant'
  | 'lead-closing'
  | 'lead-braking'
  | 'lead-safe-gap'
  | 'weather-clearing'
  | 'memory-trace';

export interface DemoBeatEvent {
  atMs: number;
  type: DemoBeatEventType;
}

export interface FullDemoStepDefinition {
  cue: DemoCue;
  title: string;
  note: string;
  action: FullDemoAction;
  voiceId: string;
  audience: DemoAudience;
  tone: DemoTone;
  settleMs: number;
  afterSpeechMs: number;
  fallbackDurationMs: number;
  voice?: boolean;
  events?: readonly DemoBeatEvent[];
}

const beat = (
  definition: Omit<FullDemoStepDefinition, 'settleMs' | 'afterSpeechMs'>
    & Partial<Pick<FullDemoStepDefinition, 'settleMs' | 'afterSpeechMs'>>,
): FullDemoStepDefinition => ({ settleMs: 500, afterSpeechMs: 420, ...definition });

/**
 * 五场连续体验的 21 个语音拍点。fallbackDurationMs 只在音频不可用时兜底；
 * 正常情况下由 NarrationController 的完成回调推进下一拍。
 */
export const FULL_DEMO_STEPS: readonly FullDemoStepDefinition[] = [
  beat({ cue: 'commute', title: '01 · Daily Commute', note: "Welcome back. Your usual route and cabin settings are ready. Let's go.", action: 'commute-start', voiceId: 'fd01_commute_welcome', audience: 'driver', tone: 'warm', fallbackDurationMs: 5100, settleMs: 700 }),
  beat({ cue: 'commute-personalized', title: 'Daily Commute · Personalized', note: "Temperature, lights, and music are set your way. I'm right here.", action: 'commute-route', voiceId: 'fd02_commute_personalized', audience: 'driver', tone: 'warm', fallbackDurationMs: 4700 }),
  beat({ cue: 'fatigue-monitoring', title: '02 · Fatigue Guard', note: "We're on the highway. I'll keep an eye on you and let you know if anything changes.", action: 'fatigue-monitor', voiceId: 'fd03_fatigue_monitor', audience: 'driver', tone: 'calm', fallbackDurationMs: 5200, settleMs: 750 }),
  beat({ cue: 'fatigue-evidence', title: 'Fatigue Guard · Evidence', note: "I'm checking your condition inside the car. Your images and data stay local, so rest assured.", action: 'fatigue-evidence', voiceId: 'fd04_fatigue_evidence', audience: 'driver', tone: 'caring', fallbackDurationMs: 5200, events: [{ atMs: 1600, type: 'evidence-peek' }] }),
  beat({ cue: 'fatigue-care', title: 'Fatigue Guard · Gentle care', note: "You look tired. More air, lower temperature. Don't push it; rest at the next stop.", action: 'fatigue-care', voiceId: 'fd05_fatigue_care', audience: 'driver', tone: 'caring', fallbackDurationMs: 6100, events: [{ atMs: 700, type: 'cabin-airflow' }] }),
  beat({ cue: 'fatigue-urgent', title: 'Fatigue Guard · Urgent', note: "You need a break. It isn't safe to continue. Hold the steering wheel firmly.", action: 'fatigue-urgent', voiceId: 'fd06_fatigue_urgent', audience: 'driver', tone: 'urgent', fallbackDurationMs: 5300 }),
  beat({ cue: 'fatigue-rest', title: 'Fatigue Guard · Rest', note: "The car is safely stopped. Take a moment to relax, and we'll continue when you're ready.", action: 'fatigue-rest', voiceId: 'fd07_fatigue_rest', audience: 'driver', tone: 'caring', fallbackDurationMs: 5300, settleMs: 750, events: [{ atMs: 1200, type: 'rest-settled' }] }),
  beat({ cue: 'complex-roads', title: '03 · Complex Roads', note: "Feeling rested? We'll start slowly. It's a rainy night; I'll help watch the road.", action: 'complex-start', voiceId: 'fd08_complex_detect', audience: 'driver', tone: 'cautious', fallbackDurationMs: 5700, settleMs: 800 }),
  beat({ cue: 'complex-braking', title: 'Complex Roads · Lead vehicle', note: "The car ahead braked hard. I'm slowing down and opening the gap. Hold the wheel firmly.", action: 'complex-brake', voiceId: 'fd09_complex_brake', audience: 'driver', tone: 'urgent', fallbackDurationMs: 6800, events: [
    { atMs: 0, type: 'lead-distant' },
    { atMs: 650, type: 'lead-closing' },
    { atMs: 1650, type: 'lead-braking' },
    { atMs: 4100, type: 'lead-safe-gap' },
  ] }),
  beat({ cue: 'conditions-ease', title: 'Complex Roads · Clear', note: "The rain is easing and visibility is improving. I'll smoothly bring us back to speed.", action: 'complex-clear', voiceId: 'fd10_complex_clear', audience: 'driver', tone: 'confirming', fallbackDurationMs: 5200, events: [{ atMs: 300, type: 'weather-clearing' }] }),
  beat({ cue: 'cabin-memory', title: '04 · Cabin Memory', note: "Looking for your parking card? I remember. It's in the door pocket to your left.", action: 'memory-start', voiceId: 'fd11_memory_remember', audience: 'driver', tone: 'warm', fallbackDurationMs: 5500, settleMs: 750 }),
  beat({ cue: 'cabin-memory-assist', title: 'Cabin Memory · Cause found', note: 'You looked down to the left. I remembered its last location and turned on the light.', action: 'memory-assist', voiceId: 'fd12_memory_explain', audience: 'driver', tone: 'caring', fallbackDurationMs: 5200, events: [{ atMs: 450, type: 'memory-trace' }] }),
  beat({ cue: 'cabin-memory-verify', title: 'Cabin Memory · Verified', note: "Found it. Eyes forward. The reading light is off; I'll watch the road.", action: 'memory-verify', voiceId: 'fd13_memory_verify', audience: 'driver', tone: 'confirming', fallbackDurationMs: 4800 }),
  beat({ cue: 'oms-cruise', title: '05 · OMS MomentTrace', note: "Next, I'll watch both you and your passenger. Keep your eyes ahead; I've got the rear right.", action: 'oms-start', voiceId: 'fd14_oms_intro', audience: 'cabin', tone: 'calm', fallbackDurationMs: 5300, settleMs: 750 }),
  beat({ cue: 'oms-candidate', title: 'OMS · Rear-right movement', note: "Rear-right passenger by the window. I'm watching; keep your eyes ahead.", action: 'oms-candidate', voiceId: 'fd15_oms_detect', audience: 'driver', tone: 'cautious', fallbackDurationMs: 4800 }),
  beat({ cue: 'oms-correlate', title: 'DMS × OMS · Cause linked', note: 'You glanced rear right. I know you were checking your passenger, not losing focus.', action: 'oms-correlate', voiceId: 'fd16_oms_correlate', audience: 'driver', tone: 'calm', fallbackDurationMs: 5200 }),
  beat({ cue: 'oms-decide', title: 'Decision · Not fatigue', note: 'Tired, but that rear-right glance answered the risk.', action: 'oms-decide', voiceId: 'fd17_oms_decide', audience: 'cabin', tone: 'calm', fallbackDurationMs: 3500 }),
  beat({ cue: 'oms-urgent', title: 'Risk confirmed · 1.2 s', note: 'Passenger on the rear right, inside now; driver, eyes ahead as I slow down.', action: 'oms-urgent', voiceId: 'fd18_oms_urgent', audience: 'rear-right', tone: 'urgent', fallbackDurationMs: 6100 }),
  beat({ cue: 'oms-clear', title: 'OMS · Occupant recovered', note: "The passenger is back inside. Now let's confirm that your eyes are back on the road too.", action: 'oms-clear', voiceId: 'fd19_oms_clear', audience: 'driver', tone: 'caring', fallbackDurationMs: 4900 }),
  beat({ cue: 'oms-verify', title: 'DMS · Eyes forward', note: "Passenger back, eyes forward. Confirm safe; I'll lift protection.", action: 'oms-verify', voiceId: 'fd20_oms_verify', audience: 'driver', tone: 'confirming', fallbackDurationMs: 5000 }),
  beat({ cue: 'moment-trace', title: 'MomentTrace · Five experiences complete', note: 'All five experiences are complete. Every decision and step is recorded for review.', action: 'oms-artifact', voiceId: 'fd21_trace_artifact', audience: 'cabin', tone: 'confirming', fallbackDurationMs: 5700, settleMs: 800, afterSpeechMs: 2200 }),
];

export const FULL_DEMO_DURATION_SEC = Math.round(FULL_DEMO_STEPS.reduce(
  (total, item) => total + item.settleMs + item.fallbackDurationMs + item.afterSpeechMs,
  0,
) / 1000);

const scriptedVision = (lookAwaySec: number, yaw: number): VisionSample => ({
  present: true,
  perclos: 0.08,
  blinkPm: 16,
  lookAwaySec,
  yaw,
  pitch: 2,
  ear: 0.31,
  emotion: 'neutral',
  source: 'sim',
});

export function runFullDemo({
  act,
  traceDmsMode,
  setSpeed,
  setSimulationRunning = () => undefined,
  onFatigueStart = () => undefined,
  onOmsStart = () => undefined,
  onVisualStep,
  onStep,
  onBeatEvent,
  onTransport,
  onComplete,
  now = () => Date.now(),
  intervalMs = 50,
}: {
  act: CockpitActions;
  traceDmsMode: TraceDmsMode;
  setSpeed: (value: number) => void;
  setSimulationRunning?: (running: boolean) => void;
  onFatigueStart?: () => void;
  onOmsStart?: () => void;
  /** Fires as soon as a stage enters, before the settle beat and narration. */
  onVisualStep?: (step: DemoStep) => void;
  onStep?: (step: DemoStep) => void;
  onBeatEvent?: (event: DemoBeatEventType, step: FullDemoStepDefinition) => void;
  onTransport?: (state: DemoTransportState) => void;
  onComplete?: () => void;
  now?: () => number;
  intervalMs?: number;
}): AutoDemoHandle {
  type Phase = 'settle' | 'narrating' | 'tail';
  let timer: ReturnType<typeof globalThis.setInterval> | null = null;
  let transport: DemoTransportState = 'ready';
  let elapsedMs = 0;
  let startedAt = 0;
  let beatIndex = 0;
  let phase: Phase = 'settle';
  let phaseStartedAtMs = 0;
  let narrationResolved = false;
  let narrationSpeechComplete = false;
  let narrationPlaybackActive = false;
  let firedEvents = new Set<number>();

  const publicStep = (definition: FullDemoStepDefinition, index: number): DemoStep => ({
    i: index + 1,
    total: FULL_DEMO_STEPS.length,
    cue: definition.cue,
    title: definition.title,
    note: definition.note,
    voice: definition.voice,
    voiceId: definition.voiceId,
    audience: definition.audience,
    tone: definition.tone,
    settleMs: definition.settleMs,
    afterSpeechMs: definition.afterSpeechMs,
    fallbackDurationMs: definition.fallbackDurationMs,
  });

  const clearTimer = () => {
    if (timer === null) return;
    globalThis.clearInterval(timer);
    timer = null;
  };
  const currentElapsedMs = () => elapsedMs + (transport === 'running' ? now() - startedAt : 0);
  const setTransport = (next: DemoTransportState) => {
    transport = next;
    setSimulationRunning(next === 'running');
    onTransport?.(next);
  };

  const applyAction = (action: FullDemoAction) => {
    if (action === 'commute-start') {
      act.scenario('commute', { announce: false });
      act.setDemoTargetSpeed(55);
    } else if (action === 'commute-route') {
      act.setDemoTargetSpeed(72);
      act.command('navigation');
    } else if (action === 'fatigue-monitor') {
      act.scenario('fatigue', { announce: false });
      act.setDemoTargetSpeed(84);
      act.setSimFatigue(48);
      onFatigueStart();
    } else if (action === 'fatigue-evidence') {
      act.setSimFatigue(54);
    } else if (action === 'fatigue-care') {
      act.setSimFatigue(62);
      // Keep the cinematic overlay and the domain state in lockstep. The
      // in-beat event still controls when the overlay is revealed.
      act.setDemoCabin({ fan: 2, temp: 21 });
    } else if (action === 'fatigue-urgent') {
      act.setSimFatigue(88);
      act.setDemoTargetSpeed(21);
    } else if (action === 'fatigue-rest') {
      // Settle clearly within the review beat without snapping through the
      // final few km/h. The visible target remains 0 km/h.
      setSpeed(0.36);
      act.setDemoTargetSpeed(0);
      act.command('rest');
    } else if (action === 'complex-start') {
      setSpeed(0.18);
      act.scenario('complex', { announce: false });
      act.setRain(true);
      act.setNight(true);
      act.setDemoTargetSpeed(82);
    } else if (action === 'complex-clear') {
      act.setRain(false);
      act.setNight(false);
      act.setDemoTargetSpeed(68);
    } else if (action === 'memory-start') {
      act.scenario('commute', { announce: false });
      act.setDemoTargetSpeed(13);
      act.observeCabinObject({ id: 'parking-card', label: 'Parking card', location: 'driver-side door pocket', owner: 'driver', importance: 'important', confidence: 0.94 });
      act.beginObjectSearch('parking-card');
    } else if (action === 'memory-assist') {
      act.setVision(scriptedVision(2.4, -28));
    } else if (action === 'memory-verify') {
      act.setVision(scriptedVision(0, 0));
    } else if (action === 'oms-start') {
      act.scenario('cabin-safety', { announce: false });
      act.setDemoTargetSpeed(72);
      act.beginMomentTrace(traceDmsMode);
      onOmsStart();
    } else if (action === 'oms-candidate') {
      act.observeOms({ behavior: 'head-outside-window', seat: 'rear-right', confidence: 0.78, durationSec: 0.4, source: 'simulated-oms', observedAt: 0 });
    } else if (action === 'oms-correlate') {
      act.setVision(scriptedVision(1.4, -28));
      act.setMomentTracePhase('correlate');
    } else if (action === 'oms-decide') {
      act.setMomentTracePhase('decide');
    } else if (action === 'oms-urgent') {
      act.observeOms({ behavior: 'body-outside-window', seat: 'rear-right', confidence: 0.96, durationSec: 1.2, source: 'simulated-oms', observedAt: 0 });
      act.setDemoTargetSpeed(52);
      act.setMomentTracePhase('act');
    } else if (action === 'oms-clear') {
      act.clearOms();
    } else if (action === 'oms-verify') {
      act.setVision(scriptedVision(0, 0));
      act.setMomentTracePhase('verify');
    } else if (action === 'oms-artifact') {
      act.confirmOmsClear();
      act.setDemoTargetSpeed(72);
      act.setMomentTracePhase('artifact');
    } else if (action === 'complete') {
      act.setMomentTracePhase('completed');
    }
  };

  const applyEvent = (event: DemoBeatEvent) => {
    if (event.type === 'cabin-airflow') act.setDemoCabin({ fan: 2, temp: 21 });
    if (event.type === 'lead-distant' || event.type === 'lead-closing') {
      // The approaching vehicle is visual evidence, not yet a braking command.
      // Keep the authored cruise speed until the brake lamps actually turn on.
      act.clearLeadBrake();
      act.setDemoTargetSpeed(82);
    }
    if (event.type === 'lead-braking') {
      act.injectLeadBrake();
      act.setDemoTargetSpeed(52);
    }
    if (event.type === 'lead-safe-gap') {
      act.clearLeadBrake();
      act.setDemoTargetSpeed(52);
    }
    onBeatEvent?.(event.type, FULL_DEMO_STEPS[beatIndex]);
  };

  const complete = () => {
    clearTimer();
    act.setMomentTracePhase('completed');
    setSpeed(1);
    setTransport('completed');
    onComplete?.();
  };

  const enterBeat = (index: number, atMs: number) => {
    beatIndex = index;
    const definition = FULL_DEMO_STEPS[beatIndex];
    if (!definition) { complete(); return; }
    phase = 'settle';
    phaseStartedAtMs = atMs;
    narrationResolved = false;
    narrationSpeechComplete = false;
    narrationPlaybackActive = false;
    firedEvents = new Set<number>();
    applyAction(definition.action);
    onVisualStep?.(publicStep(definition, beatIndex));
  };

  const startNarration = (definition: FullDemoStepDefinition, atMs: number) => {
    phase = 'narrating';
    phaseStartedAtMs = atMs;
    onStep?.(publicStep(definition, beatIndex));
  };

  const resolveNarration = (atMs: number) => {
    if (phase !== 'narrating' || narrationResolved) return;
    narrationResolved = true;
    phase = 'tail';
    phaseStartedAtMs = atMs;
  };

  const pump = () => {
    if (transport !== 'running') return;
    const atMs = currentElapsedMs();
    const definition = FULL_DEMO_STEPS[beatIndex];
    if (!definition) { complete(); return; }
    if (phase === 'settle' && atMs - phaseStartedAtMs >= definition.settleMs) {
      startNarration(definition, atMs);
      return;
    }
    if (phase === 'narrating') {
      definition.events?.forEach((event, index) => {
        if (!firedEvents.has(index) && atMs - phaseStartedAtMs >= event.atMs) {
          firedEvents.add(index);
          applyEvent(event);
        }
      });
      if (definition.voice === false || (!narrationPlaybackActive && atMs - phaseStartedAtMs >= definition.fallbackDurationMs)) narrationSpeechComplete = true;
      const lastEventAtMs = definition.events?.reduce((latest, event) => Math.max(latest, event.atMs), 0) ?? 0;
      if (narrationSpeechComplete && atMs - phaseStartedAtMs >= lastEventAtMs) resolveNarration(atMs);
      return;
    }
    if (phase === 'tail' && atMs - phaseStartedAtMs >= definition.afterSpeechMs) {
      const nextIndex = beatIndex + 1;
      if (nextIndex >= FULL_DEMO_STEPS.length) complete();
      else enterBeat(nextIndex, atMs);
    }
  };

  const beginInterval = () => {
    clearTimer();
    timer = globalThis.setInterval(pump, intervalMs);
  };

  const restart = () => {
    clearTimer();
    elapsedMs = 0;
    act.reset();
    setSpeed(0.18);
    startedAt = now();
    setTransport('running');
    enterBeat(0, 0);
    beginInterval();
    pump();
  };

  const handle: AutoDemoHandle = {
    pause() {
      if (transport !== 'running') return;
      elapsedMs = currentElapsedMs();
      clearTimer();
      setTransport('paused');
    },
    resume() {
      if (transport !== 'paused') return;
      startedAt = now();
      setTransport('running');
      beginInterval();
      pump();
    },
    restart,
    stop() {
      clearTimer();
      act.setDemoTargetSpeed(null);
      setSpeed(1);
      setTransport('ready');
    },
    confirmSafety() {
      // Full Demo 在恢复拍点自动确认，保持无人值守连续播放。
    },
    narrationComplete(voiceId) {
      const definition = FULL_DEMO_STEPS[beatIndex];
      if (phase !== 'narrating' || !definition || (voiceId && voiceId !== definition.voiceId)) return;
      narrationPlaybackActive = false;
      narrationSpeechComplete = true;
      pump();
    },
    narrationStarted(voiceId) {
      const definition = FULL_DEMO_STEPS[beatIndex];
      if (phase !== 'narrating' || !definition || (voiceId && voiceId !== definition.voiceId)) return;
      narrationPlaybackActive = true;
    },
    narrationFailed(voiceId) {
      const definition = FULL_DEMO_STEPS[beatIndex];
      if (phase !== 'narrating' || !definition || (voiceId && voiceId !== definition.voiceId)) return;
      narrationPlaybackActive = false;
      pump();
    },
    getState: () => transport,
    getTraceDmsMode: () => traceDmsMode,
  };

  restart();
  return handle;
}
