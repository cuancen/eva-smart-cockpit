import type { CockpitState } from '../../core';
import type { DemoCue } from '../autoDemo';
import type { DemoBeatEventType } from '../fullDemo';
import type { EvaMood } from '../evaFace';

export type TwinCameraPreset = 'rearChase' | 'rearRightChase' | 'rearRightReveal' | 'rainChase' | 'rearWide' | 'leftFrontHigh' | 'rearRightFocus' | 'cabin' | 'console' | 'driver' | 'gaze' | 'cause' | 'assist' | 'verify';
export type TwinAccent = 'neutral' | 'cause' | 'verify' | 'danger';
export type TwinGaze = 'off' | 'monitor' | 'warning' | 'urgent';
export type TwinEffect = 'commute' | 'monitoring' | 'care' | 'urgent' | 'rest' | 'weather' | 'recovery' | 'voice' | 'memory' | 'oms-perceive' | 'oms-correlate' | 'oms-verify' | 'moment-trace' | 'complete';
export type TwinEnvironment = 'city' | 'highway' | 'rain-night' | 'cabin';
export type TwinOmsMarker = 'off' | 'care' | 'urgent' | 'clear';
export type TwinLeadVehiclePhase = 'hidden' | 'distant' | 'closing' | 'braking' | 'safe-gap' | 'clearing';
export type TwinCabinEffect = 'none' | 'airflow' | 'rest' | 'memory';

export interface TwinFrame {
  camera: TwinCameraPreset;
  bodyOpacity: number;
  accent: TwinAccent;
  gaze: TwinGaze;
  effect: TwinEffect;
  environment: TwinEnvironment;
  motionIntensity: number;
  weatherMix: number;
  /** Metres per second with cinematic gain already applied exactly once. */
  roadTravelRate: number;
  leadVehiclePhase: TwinLeadVehiclePhase;
  leadDistanceM: number;
  cabinEffect: TwinCabinEffect;
  evidencePeek: boolean;
  memoryEvidence: boolean;
  braking: boolean;
  omsMarker: TwinOmsMarker;
  correlation: boolean;
  traceArtifact: boolean;
}

export function cameraCutKey(frame: TwinFrame): TwinCameraPreset { return frame.camera; }

export interface ModelFit {
  scale: number;
  position: readonly [number, number, number];
  groundY: number;
}

export function isTwinMotionActive(frame: TwinFrame, running: boolean, reducedMotion: boolean, pageVisible = true): boolean {
  return running && pageVisible && !reducedMotion && frame.roadTravelRate > 0;
}

export function fitModelBounds(
  size: readonly [number, number, number],
  center: readonly [number, number, number],
  targetLength = 5.4,
): ModelFit {
  const scale = targetLength / Math.max(size[0], size[2], 0.001);
  return { scale, position: [-center[0] * scale, -center[1] * scale, -center[2] * scale], groundY: -(size[1] * scale) / 2 };
}

const CAMERA_BY_CUE: Record<DemoCue, TwinCameraPreset> = {
  'oms-cruise': 'rearChase', 'oms-candidate': 'rearRightReveal', 'oms-prompt': 'rearRightChase',
  'oms-correlate': 'leftFrontHigh', 'oms-decide': 'leftFrontHigh', 'oms-urgent': 'rearRightFocus',
  'oms-clear': 'rearRightFocus', 'oms-verify': 'rearWide', 'moment-trace': 'rearWide',
  commute: 'rearChase', 'commute-personalized': 'rearChase', 'fatigue-monitoring': 'driver',
  'fatigue-evidence': 'driver', 'fatigue-care': 'gaze', 'fatigue-urgent': 'cause',
  'fatigue-rest': 'cabin', 'complex-roads': 'rainChase', 'complex-braking': 'rainChase',
  'conditions-ease': 'rearWide', 'voice-command': 'console', 'cabin-memory': 'cabin',
  'cabin-memory-assist': 'cabin', 'cabin-memory-verify': 'verify', completed: 'rearWide',
};

const OPACITY_BY_CUE: Record<DemoCue, number> = {
  'oms-cruise': 1, 'oms-candidate': 0.56, 'oms-prompt': 1, 'oms-correlate': 0.24,
  'oms-decide': 0.24, 'oms-urgent': 0.42, 'oms-clear': 0.48, 'oms-verify': 1,
  'moment-trace': 1, commute: 1, 'commute-personalized': 1,
  'fatigue-monitoring': 0.64, 'fatigue-evidence': 0.64, 'fatigue-care': 0.6,
  'fatigue-urgent': 0.56, 'fatigue-rest': 0.6, 'complex-roads': 1,
  'complex-braking': 1, 'conditions-ease': 1, 'voice-command': 0.34,
  'cabin-memory': 0.6, 'cabin-memory-assist': 0.56, 'cabin-memory-verify': 0.62, completed: 1,
};

const EFFECT_BY_CUE: Record<DemoCue, TwinEffect> = {
  'oms-cruise': 'oms-perceive', 'oms-candidate': 'oms-perceive', 'oms-prompt': 'oms-perceive',
  'oms-correlate': 'oms-correlate', 'oms-decide': 'oms-correlate', 'oms-urgent': 'urgent',
  'oms-clear': 'oms-verify', 'oms-verify': 'oms-verify', 'moment-trace': 'moment-trace',
  commute: 'commute', 'commute-personalized': 'commute', 'fatigue-monitoring': 'monitoring',
  'fatigue-evidence': 'monitoring', 'fatigue-care': 'care', 'fatigue-urgent': 'urgent',
  'fatigue-rest': 'rest', 'complex-roads': 'weather', 'complex-braking': 'weather',
  'conditions-ease': 'recovery', 'voice-command': 'voice', 'cabin-memory': 'memory',
  'cabin-memory-assist': 'memory', 'cabin-memory-verify': 'memory', completed: 'complete',
};

const ENVIRONMENT_BY_CUE: Record<DemoCue, TwinEnvironment> = {
  'oms-cruise': 'highway', 'oms-candidate': 'highway', 'oms-prompt': 'highway',
  'oms-correlate': 'cabin', 'oms-decide': 'cabin', 'oms-urgent': 'highway',
  'oms-clear': 'highway', 'oms-verify': 'highway', 'moment-trace': 'highway',
  commute: 'city', 'commute-personalized': 'city', 'fatigue-monitoring': 'highway',
  'fatigue-evidence': 'highway', 'fatigue-care': 'highway', 'fatigue-urgent': 'highway',
  'fatigue-rest': 'cabin', 'complex-roads': 'rain-night', 'complex-braking': 'rain-night',
  'conditions-ease': 'highway', 'voice-command': 'cabin', 'cabin-memory': 'cabin',
  'cabin-memory-assist': 'cabin', 'cabin-memory-verify': 'cabin', completed: 'highway',
};

const MOTION_GAIN_BY_CUE: Record<DemoCue, number> = {
  'oms-cruise': 1.15, 'oms-candidate': 1, 'oms-prompt': 1.05, 'oms-correlate': 0.24,
  'oms-decide': 0.2, 'oms-urgent': 0.75, 'oms-clear': 0.9, 'oms-verify': 1,
  'moment-trace': 0, commute: 1.32, 'commute-personalized': 1.38,
  'fatigue-monitoring': 1.42, 'fatigue-evidence': 1.42, 'fatigue-care': 1.25,
  'fatigue-urgent': 0.95, 'fatigue-rest': 0, 'complex-roads': 1.5,
  'complex-braking': 1.5, 'conditions-ease': 1.28, 'voice-command': 0.2,
  'cabin-memory': 0.2, 'cabin-memory-assist': 0.12, 'cabin-memory-verify': 0.12, completed: 0,
};

function leadPhaseOf(cue: DemoCue, event: DemoBeatEventType | null): TwinLeadVehiclePhase {
  if (cue === 'conditions-ease') return 'clearing';
  if (cue !== 'complex-braking') return 'hidden';
  if (event === 'lead-distant') return 'distant';
  if (event === 'lead-closing') return 'closing';
  if (event === 'lead-braking') return 'braking';
  if (event === 'lead-safe-gap') return 'safe-gap';
  return 'hidden';
}

const LEAD_DISTANCE: Record<TwinLeadVehiclePhase, number> = {
  hidden: 80, distant: 28, closing: 15, braking: 7, 'safe-gap': 13, clearing: 36,
};

export function deriveTwinFrame(
  state: CockpitState,
  cue: DemoCue | null,
  mood: EvaMood,
  event: DemoBeatEventType | null = null,
): TwinFrame {
  const effectiveCue: DemoCue = cue ?? (state.scenario === 'cabin-safety'
    ? 'oms-cruise' : state.scenario === 'complex' ? 'complex-roads' : state.scenario === 'fatigue' ? 'fatigue-monitoring' : 'commute');
  const accent: TwinAccent = ['fatigue-urgent', 'oms-urgent'].includes(effectiveCue)
    ? 'danger'
    : ['complex-roads', 'complex-braking'].includes(effectiveCue)
      ? (event === 'lead-safe-gap'
          ? 'verify'
          : event === 'lead-braking' || (event === null && state.drive.leadBrake) ? 'danger' : 'cause')
      : ['fatigue-care', 'oms-candidate', 'oms-prompt', 'oms-correlate', 'oms-decide', 'cabin-memory-assist'].includes(effectiveCue)
        ? 'cause'
        : ['commute', 'commute-personalized', 'fatigue-rest', 'conditions-ease', 'cabin-memory-verify', 'oms-clear', 'oms-verify', 'moment-trace', 'completed'].includes(effectiveCue)
          ? 'verify' : mood === 'urgent' ? 'danger' : 'neutral';
  const gaze: TwinGaze = ['fatigue-monitoring', 'fatigue-evidence'].includes(effectiveCue)
    ? 'monitor'
    : ['fatigue-care', 'oms-correlate', 'oms-decide', 'cabin-memory-assist'].includes(effectiveCue)
      ? 'warning' : ['fatigue-urgent', 'oms-urgent'].includes(effectiveCue) ? 'urgent' : 'off';
  const restSettled = effectiveCue === 'fatigue-rest'
    && event === 'rest-settled'
    && state.drive.speed <= 2;
  const speedFactor = Math.min(1, Math.max(0, state.drive.speed / 105));
  const gain = effectiveCue === 'fatigue-rest' && !restSettled ? 1.1 : MOTION_GAIN_BY_CUE[effectiveCue];
  const leadVehiclePhase = leadPhaseOf(effectiveCue, event);
  const camera = effectiveCue === 'fatigue-rest' && !restSettled ? 'cause' : CAMERA_BY_CUE[effectiveCue];
  const environment = effectiveCue === 'fatigue-rest' && !restSettled ? 'highway' : ENVIRONMENT_BY_CUE[effectiveCue];

  return {
    camera, bodyOpacity: OPACITY_BY_CUE[effectiveCue], accent, gaze,
    effect: restSettled ? 'rest' : effectiveCue === 'fatigue-rest' ? 'care' : EFFECT_BY_CUE[effectiveCue], environment,
    motionIntensity: Math.round(Math.min(1, speedFactor * gain) * 1000) / 1000,
    weatherMix: ['complex-roads', 'complex-braking'].includes(effectiveCue) ? 1 : 0,
    roadTravelRate: Math.max(0, state.drive.speed / 3.6) * gain,
    leadVehiclePhase, leadDistanceM: LEAD_DISTANCE[leadVehiclePhase],
    cabinEffect: effectiveCue === 'fatigue-rest' ? (restSettled ? 'rest' : 'airflow')
      : ['cabin-memory', 'cabin-memory-assist', 'cabin-memory-verify'].includes(effectiveCue) ? 'memory'
        : event === 'cabin-airflow' || effectiveCue === 'fatigue-urgent' ? 'airflow' : 'none',
    evidencePeek: event === 'evidence-peek' || ['fatigue-care', 'fatigue-urgent'].includes(effectiveCue),
    memoryEvidence: effectiveCue === 'cabin-memory-verify'
      || (effectiveCue === 'cabin-memory-assist' && event === 'memory-trace'),
    braking: leadVehiclePhase === 'braking'
      || (['complex-roads', 'complex-braking'].includes(effectiveCue) && event === null && state.drive.leadBrake)
      || (effectiveCue === 'oms-urgent' && state.oms.response.active),
    omsMarker: ['oms-candidate', 'oms-prompt', 'oms-correlate', 'oms-decide'].includes(effectiveCue)
      ? 'care' : effectiveCue === 'oms-urgent' ? 'urgent' : ['oms-clear', 'oms-verify'].includes(effectiveCue) ? 'clear' : 'off',
    correlation: ['oms-correlate', 'oms-decide', 'oms-urgent'].includes(effectiveCue),
    traceArtifact: effectiveCue === 'moment-trace' || (effectiveCue === 'completed' && state.momentTrace.record !== null),
  };
}
