import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEMO_STEPS, runAutoDemo } from '../src/shell/autoDemo';
import { BOOT_SEQUENCE } from '../src/shell/components/BootSplash';
import { ENTRY_MAX_MS } from '../src/shell/components/EntryTransition';
import { deriveEvaExpression, deriveMood, MOOD_FRESH_MIN } from '../src/shell/evaFace';
import { createEvidencePlaybackGate } from '../src/shell/evidencePlayback';
import { ambientLevelOf, URGENT_FRESH_MIN } from '../src/shell/ambient';
import { buildBust, eyeShapeOf, MOOD_COLOR } from '../src/shell/evaAvatar';
import { createState } from '../src/core/sim';
import { createCockpit, SCENARIOS } from '../src/core';
import type { CockpitActions } from '../src/core';
import { createSimulationClock } from '../src/shell/simulationClock';
import { localizeEvaText } from '../src/shell/evaCopyZh';
import { cameraCutKey, deriveTwinFrame, fitModelBounds, isTwinMotionActive } from '../src/shell/twin/twinState';
import { VEHICLE_CALIBRATION } from '../src/shell/twin/twinScene';
import { resolveWithin } from '../src/shell/preflight';
import { FULL_DEMO_DURATION_SEC, FULL_DEMO_STEPS, runFullDemo } from '../src/shell/fullDemo';
import { progressPhaseOf } from '../src/shell/components/CockpitHeader';
import {
  audioMimeForUrl,
  canPlayAudioAsset,
  EVA_SPEECH_LANG,
  normalizeSpeechText,
  selectEvaVoice,
  speechResultCompletesNarration,
} from '../src/shell/hooks/useTts';
import {
  FULL_DEMO_VOICE_IDS,
  getEvaVoiceAsset,
  parseVoiceCsv,
  resolveDemoEvaText,
  resolveEvaFallbackText,
  resolveEvaRuntimeText,
} from '../src/shell/evaVoiceEn';

afterEach(() => {
  vi.useRealTimers();
});

describe('开机自检动画', () => {
  it('自检清单覆盖核心子系统且不重复', () => {
    expect(BOOT_SEQUENCE.length).toBeGreaterThanOrEqual(4);
    expect(new Set(BOOT_SEQUENCE).size).toBe(BOOT_SEQUENCE.length);
    const all = BOOT_SEQUENCE.join('');
    expect(all).toMatch(/视觉|Vision/); // 新旧启动层都必须覆盖视觉能力
    expect(all).toContain('L2');
  });

  it('启动遮罩有硬性退场上限，不阻塞驾驶舱', () => {
    expect(ENTRY_MAX_MS).toBeLessThanOrEqual(1200);
  });
});

describe('Hybrid Live OMS MomentTrace 主演示', () => {
  const replayDeps = (api: ReturnType<typeof createCockpit>) => ({
    act: api.actions,
    traceDmsMode: 'replay-fallback' as const,
    getVision: () => null,
    activateReplayDms: () => undefined,
    setSpeed: () => undefined,
  });

  it('十个提示稳定、唯一，并按 35 秒主线严格递增', () => {
    expect(DEMO_STEPS.map((step) => step.sec)).toEqual([0.5, 4, 6, 10, 13, 15, 23, 29, 32, 35]);
    expect(DEMO_STEPS.map((step) => step.cue)).toEqual([
      'oms-cruise', 'oms-candidate', 'oms-prompt', 'oms-correlate', 'oms-decide',
      'oms-urgent', 'oms-clear', 'oms-verify', 'moment-trace', 'completed',
    ]);
    expect(new Set(DEMO_STEPS.map((step) => step.cue)).size).toBe(10);
    for (const step of DEMO_STEPS) {
      expect(step.title.trim()).not.toBe('');
      expect(step.note.trim().length).toBeGreaterThan(6);
    }
    const voiced = DEMO_STEPS.filter((step) => step.voice !== false);
    expect(voiced.every((step) => !!step.voiceId)).toBe(true);
    expect(new Set(voiced.map((step) => step.voiceId)).size).toBe(voiced.length);
  });

  it('产品场景保留三项备用能力并新增 cabin-safety 内核场景', () => {
    expect(Object.keys(SCENARIOS)).toEqual(['commute', 'fatigue', 'complex', 'cabin-safety']);
    const all = DEMO_STEPS.map((step) => `${step.title} ${step.note}`).join(' ');
    expect(all).toContain('OMS');
    expect(all).toContain('DMS');
    expect(all.toLowerCase()).toContain('keep your eyes on the road');
  });

  it('使用 0.15× 仿真倍率，停止时恢复默认倍率', () => {
    vi.useFakeTimers();
    const api = createCockpit();
    const speeds: number[] = [];
    const demo = runAutoDemo({ ...replayDeps(api), setSpeed: (speed) => speeds.push(speed) });
    expect(speeds.at(-1)).toBe(0.15);
    demo.stop();
    expect(speeds.at(-1)).toBe(1);
  });

  it('暂停不推进、继续不重复，重播完整复位', () => {
    vi.useFakeTimers();
    const api = createCockpit();
    const cues: string[] = [];
    const transport: string[] = [];
    const demo = runAutoDemo({
      ...replayDeps(api),
      onStep: (step) => cues.push(step.cue),
      onTransport: (state) => transport.push(state),
    });
    vi.advanceTimersByTime(4_100);
    expect(cues).toEqual(['oms-cruise', 'oms-candidate']);
    expect(api.state.scenario).toBe('cabin-safety');
    demo.pause();
    vi.advanceTimersByTime(20_000);
    expect(cues).toHaveLength(2);
    demo.resume();
    vi.advanceTimersByTime(2_000);
    expect(cues.at(-1)).toBe('oms-prompt');
    demo.restart();
    expect(api.state.momentTrace.phase).toBe('perceive');
    expect(transport.at(-1)).toBe('running');
    vi.advanceTimersByTime(600);
    expect(cues.at(-1)).toBe('oms-cruise');
    demo.stop();
  });

  it('现场 DMS 条件等待超时后只降级 DMS，流程不中断', () => {
    vi.useFakeTimers();
    const api = createCockpit();
    const fallback = vi.fn();
    const demo = runAutoDemo({
      act: api.actions,
      traceDmsMode: 'live',
      getVision: () => ({ present: true, perclos: 0.03, blinkPm: 7, lookAwaySec: 0, yaw: 0, pitch: 0, ear: 0.3, emotion: 'neutral', source: 'model' }),
      activateReplayDms: fallback,
      setSpeed: () => undefined,
    });
    vi.advanceTimersByTime(16_100);
    expect(fallback).toHaveBeenCalledTimes(1);
    expect(demo.getTraceDmsMode()).toBe('replay-fallback');
    expect(api.state.momentTrace.dmsMode).toBe('replay-fallback');
    expect(api.state.oms.active?.seat).toBe('rear-right');
    demo.stop();
  });

  it('完成 OMS 风险、双传感器恢复与驾驶员确认后冻结', () => {
    vi.useFakeTimers();
    const api = createCockpit();
    let speed = 1;
    let simTimer: ReturnType<typeof setInterval> | null = null;
    const demo = runAutoDemo({
      ...replayDeps(api),
      setSpeed: (next) => { speed = next; },
      setSimulationRunning: (isRunning) => {
        if (simTimer) clearInterval(simTimer);
        simTimer = isRunning ? setInterval(() => api.step(0.2 * speed), 100) : null;
      },
    });
    vi.advanceTimersByTime(15_100);
    expect(api.state.oms.risk).toBe('urgent');
    expect(api.state.oms.response.speedCapKmh).toBe(52);
    vi.advanceTimersByTime(14_000);
    expect(api.state.oms.awaitingConfirmation).toBe(true);
    expect(api.state.momentTrace.record?.verification.omsClear).toBe(true);
    vi.advanceTimersByTime(3_100);
    expect(api.state.momentTrace.phase).toBe('verify');
    demo.confirmSafety();
    expect(api.state.momentTrace.phase).toBe('artifact');
    vi.advanceTimersByTime(3_100);
    expect(demo.getState()).toBe('completed');
    expect(api.state.momentTrace.record?.verification.driverConfirmed).toBe(true);
    expect(api.state.drive.routeKm).toBeGreaterThan(0);
    const frozen = api.state.t;
    vi.advanceTimersByTime(5_000);
    expect(api.state.t).toBe(frozen);
    demo.stop();
    if (simTimer) clearInterval(simTimer);
  });

  it('主线程长任务结束后冻结丢失时间，不把多个镜头挤在同一帧', () => {
    vi.useFakeTimers();
    const api = createCockpit();
    const cues: string[] = [];
    let now = 0;
    const demo = runAutoDemo({
      ...replayDeps(api),
      onStep: (step) => cues.push(step.cue),
      now: () => now,
      intervalMs: 50,
    });
    now = 5_000;
    vi.advanceTimersByTime(50);
    expect(cues).toEqual([]);
    for (let index = 0; index < 10; index += 1) {
      now += 50;
      vi.advanceTimersByTime(50);
    }
    expect(cues).toEqual(['oms-cruise']);
    demo.stop();
  });
});

describe('EVA 中文运行时文案', () => {
  it('把领域消息原文用于中文字幕与语音文案', () => {
    expect(localizeEvaText('Good morning. Welcome back. Traffic is clear and your usual route is ready.')).toBe(
      '早上好，欢迎回来。今天路况不错，还是走我们熟悉的路线。',
    );
    expect(localizeEvaText('Rear-right movement detected.')).toBe('右后座有人正在靠近车窗。');
    expect(localizeEvaText('11.9 km remaining — about 24 minutes to arrive at current speed.')).toBe(
      '剩余 11.9 公里，按当前速度预计约 24 分钟到达。',
    );
  });
});

describe('五场景正式自动巡演', () => {
  it('按通勤、疲劳、复杂路况、舱内记忆、OMS 的顺序完整覆盖，并由语音节拍驱动', () => {
    expect(FULL_DEMO_STEPS).toHaveLength(21);
    expect(FULL_DEMO_STEPS.filter((step) => /^0\d ·/.test(step.title)).map((step) => step.title)).toEqual([
      '01 · Daily Commute',
      '02 · Fatigue Guard',
      '03 · Complex Roads',
      '04 · Cabin Memory',
      '05 · OMS MomentTrace',
    ]);
    const voiced = FULL_DEMO_STEPS.filter((step) => step.voice !== false);
    expect(voiced.every((step) => !!step.voiceId)).toBe(true);
    expect(new Set(voiced.map((step) => step.voiceId)).size).toBe(voiced.length);
    for (const step of voiced) {
      expect(step.settleMs).toBeGreaterThanOrEqual(400);
      expect(step.settleMs).toBeLessThanOrEqual(1200);
      expect(step.afterSpeechMs).toBeGreaterThanOrEqual(300);
      expect(step.fallbackDurationMs).toBeGreaterThanOrEqual(3000);
      expect(step.audience).toBeTruthy();
      expect(step.tone).toBeTruthy();
    }
    expect(FULL_DEMO_DURATION_SEC).toBeGreaterThanOrEqual(130);
    expect(FULL_DEMO_DURATION_SEC).toBeLessThanOrEqual(136);
    expect(FULL_DEMO_STEPS.every((step) => step.note.length <= 130)).toBe(true);
  });

  it('五场景无人值守运行到底，OMS 双传感器恢复后自动确认并冻结', () => {
    vi.useFakeTimers();
    const api = createCockpit();
    const cues: string[] = [];
    const sceneAtCue: string[] = [];
    let simSpeed = 1;
    let simTimer: ReturnType<typeof setInterval> | null = null;
    const demo = runFullDemo({
      act: api.actions,
      traceDmsMode: 'replay-fallback',
      setSpeed: (next) => { simSpeed = next; },
      setSimulationRunning: (isRunning) => {
        if (simTimer) clearInterval(simTimer);
        simTimer = isRunning ? setInterval(() => api.step(0.2 * simSpeed), 100) : null;
      },
      onStep: (step) => {
        cues.push(step.cue);
        sceneAtCue.push(api.state.scenario);
      },
    });

    vi.advanceTimersByTime((FULL_DEMO_DURATION_SEC + 2) * 1000);
    expect(cues).toHaveLength(FULL_DEMO_STEPS.length);
    expect(sceneAtCue[0]).toBe('commute');
    expect(sceneAtCue[2]).toBe('fatigue');
    expect(sceneAtCue[7]).toBe('complex');
    expect(sceneAtCue[10]).toBe('commute');
    expect(sceneAtCue[13]).toBe('cabin-safety');
    expect(api.state.momentTrace.phase).toBe('completed');
    expect(api.state.momentTrace.record?.verification.driverConfirmed).toBe(true);
    expect(api.state.drive.routeKm).toBeGreaterThan(0);
    expect(demo.getState()).toBe('completed');
    const frozen = api.state.t;
    vi.advanceTimersByTime(3_000);
    expect(api.state.t).toBe(frozen);
    demo.stop();
    if (simTimer) clearInterval(simTimer);
  });

  it('语音完整结束且尾拍走完后才进入下一镜头', () => {
    vi.useFakeTimers();
    const api = createCockpit();
    const visualCues: string[] = [];
    const narrationCues: string[] = [];
    const demo = runFullDemo({
      act: api.actions,
      traceDmsMode: 'replay-fallback',
      setSpeed: () => undefined,
      onVisualStep: (step) => visualCues.push(step.cue),
      onStep: (step) => narrationCues.push(step.cue),
    });

    expect(visualCues).toEqual(['commute']);
    vi.advanceTimersByTime(FULL_DEMO_STEPS[0].settleMs);
    expect(narrationCues).toEqual(['commute']);

    demo.narrationComplete(FULL_DEMO_STEPS[0].voiceId);
    vi.advanceTimersByTime(FULL_DEMO_STEPS[0].afterSpeechMs - 50);
    expect(visualCues).toEqual(['commute']);
    vi.advanceTimersByTime(100);
    expect(visualCues).toEqual(['commute', 'commute-personalized']);

    // 旧回调或无 voiceId 的回调不能在新镜头 settle 阶段预先解锁语音。
    demo.narrationComplete(FULL_DEMO_STEPS[0].voiceId);
    demo.narrationComplete();
    vi.advanceTimersByTime(FULL_DEMO_STEPS[1].settleMs);
    expect(narrationCues).toEqual(['commute', 'commute-personalized']);
    vi.advanceTimersByTime(FULL_DEMO_STEPS[1].afterSpeechMs + 100);
    expect(visualCues).toHaveLength(2);
    demo.stop();
  });

  it('21 拍在语音完成回调驱动下只进入一次，句内事件不重复', () => {
    vi.useFakeTimers();
    const api = createCockpit();
    const visualCues: string[] = [];
    const narrationCues: string[] = [];
    const beatEvents: string[] = [];
    const demo = runFullDemo({
      act: api.actions,
      traceDmsMode: 'replay-fallback',
      setSpeed: () => undefined,
      onVisualStep: (step) => visualCues.push(step.cue),
      onStep: (step) => narrationCues.push(step.cue),
      onBeatEvent: (event) => beatEvents.push(event),
    });

    FULL_DEMO_STEPS.forEach((step, index) => {
      expect(visualCues[index]).toBe(step.cue);
      vi.advanceTimersByTime(step.settleMs);
      expect(narrationCues[index]).toBe(step.cue);
      demo.narrationComplete(step.voiceId);
      demo.narrationComplete(step.voiceId);
      const lastEventAtMs = step.events?.reduce((latest, event) => Math.max(latest, event.atMs), 0) ?? 0;
      vi.advanceTimersByTime(lastEventAtMs + step.afterSpeechMs + 50);
    });

    expect(visualCues).toEqual(FULL_DEMO_STEPS.map((step) => step.cue));
    expect(narrationCues).toEqual(FULL_DEMO_STEPS.map((step) => step.cue));
    expect(beatEvents).toEqual(FULL_DEMO_STEPS.flatMap((step) => step.events?.map((event) => event.type) ?? []));
    expect(demo.getState()).toBe('completed');
    demo.stop();
  });

  it('浏览器语音报错不冒充播报完成，导演使用稿件时长兜底且不卡住', () => {
    vi.useFakeTimers();
    expect(speechResultCompletesNarration('end')).toBe(true);
    expect(speechResultCompletesNarration('error')).toBe(false);
    expect(speechResultCompletesNarration('exception')).toBe(false);

    const api = createCockpit();
    const visualCues: string[] = [];
    const narrationCues: string[] = [];
    const demo = runFullDemo({
      act: api.actions,
      traceDmsMode: 'replay-fallback',
      setSpeed: () => undefined,
      onVisualStep: (step) => visualCues.push(step.cue),
      onStep: (step) => narrationCues.push(step.cue),
    });

    vi.advanceTimersByTime(FULL_DEMO_STEPS[0].settleMs);
    expect(narrationCues).toEqual(['commute']);
    vi.advanceTimersByTime(FULL_DEMO_STEPS[0].fallbackDurationMs - 100);
    expect(visualCues).toEqual(['commute']);
    vi.advanceTimersByTime(FULL_DEMO_STEPS[0].afterSpeechMs + 200);
    expect(visualCues).toEqual(['commute', 'commute-personalized']);
    demo.stop();
  });

  it('休息切入复杂路况时清除 resting，并保持 82→52→68 km/h 的连续速度链', () => {
    vi.useFakeTimers();
    const api = createCockpit();
    const targets: Array<number | null> = [];
    const complexSnapshots: Array<{ cue: string; resting: boolean; target: number | null; speed: number }> = [];
    let simSpeed = 1;
    let simTimer: ReturnType<typeof setInterval> | null = null;
    const act: CockpitActions = {
      ...api.actions,
      setDemoTargetSpeed(value) {
        targets.push(value);
        api.actions.setDemoTargetSpeed(value);
      },
    };
    const demo = runFullDemo({
      act,
      traceDmsMode: 'replay-fallback',
      setSpeed: (next) => { simSpeed = next; },
      setSimulationRunning: (running) => {
        if (simTimer) clearInterval(simTimer);
        simTimer = running ? setInterval(() => api.step(0.2 * simSpeed), 100) : null;
      },
      onStep: (step) => {
        if (step.cue === 'complex-roads' || step.cue === 'complex-braking' || step.cue === 'conditions-ease') {
          complexSnapshots.push({
            cue: step.cue,
            resting: api.state.driver.resting,
            target: api.state.drive.demoTargetSpeedKmh,
            speed: api.state.drive.speed,
          });
        }
      },
    });

    vi.advanceTimersByTime(80_000);
    const complexStart = targets.indexOf(82);
    const memoryStart = targets.indexOf(13, complexStart);
    const complexChain = targets.slice(complexStart, memoryStart)
      .filter((value, index, values) => index === 0 || value !== values[index - 1]);
    expect(complexChain).toEqual([82, 52, 68]);
    expect(complexSnapshots.map((snapshot) => snapshot.cue)).toEqual([
      'complex-roads',
      'complex-braking',
      'conditions-ease',
    ]);
    expect(complexSnapshots.every((snapshot) => !snapshot.resting)).toBe(true);
    expect(complexSnapshots.every((snapshot) => snapshot.target !== null && snapshot.target > 0)).toBe(true);
    expect(complexSnapshots.every((snapshot) => snapshot.speed > 0)).toBe(true);
    demo.stop();
    if (simTimer) clearInterval(simTimer);
  });

  it('疲劳休息以可见但不突兀的惯性停稳', () => {
    const api = createCockpit();
    api.actions.scenario('fatigue', { announce: false });
    api.actions.setDemoTargetSpeed(84);
    for (let index = 0; index < 36; index += 1) api.step(0.2);
    api.actions.setDemoTargetSpeed(21);
    for (let index = 0; index < 30; index += 1) api.step(0.2);
    expect(api.state.drive.speed).toBeGreaterThan(20);

    api.actions.setDemoTargetSpeed(0);
    api.actions.command('rest');
    for (let index = 0; index < 10; index += 1) api.step(0.2 * 0.36);
    const afterOneSecond = api.state.drive.speed;
    expect(afterOneSecond).toBeGreaterThan(7);
    expect(afterOneSecond).toBeLessThan(12);

    for (let index = 0; index < 18; index += 1) api.step(0.2 * 0.36);
    expect(api.state.drive.speed).toBeGreaterThan(1);
    expect(api.state.drive.speed).toBeLessThan(3);
  });

  it('默认疲劳拍只启动授权视频，Full Demo 不响应手动确认且最终只自动确认一次', () => {
    vi.useFakeTimers();
    const api = createCockpit();
    const authorizedVideo = vi.fn();
    const omsReplay = vi.fn();
    const confirmOmsClear = vi.fn(() => api.actions.confirmOmsClear());
    const act: CockpitActions = { ...api.actions, confirmOmsClear };
    const demo = runFullDemo({
      act,
      traceDmsMode: 'replay-fallback',
      setSpeed: () => undefined,
      onFatigueStart: authorizedVideo,
      onOmsStart: omsReplay,
    });

    demo.confirmSafety();
    expect(confirmOmsClear).not.toHaveBeenCalled();
    vi.advanceTimersByTime((FULL_DEMO_DURATION_SEC + 2) * 1000);
    expect(authorizedVideo).toHaveBeenCalledTimes(1);
    expect(omsReplay).toHaveBeenCalledTimes(1);
    expect(confirmOmsClear).toHaveBeenCalledTimes(1);
    expect(demo.getState()).toBe('completed');
    demo.confirmSafety();
    expect(confirmOmsClear).toHaveBeenCalledTimes(1);
    demo.stop();
  });

  it('暂停不跨场景推进，继续后从原位置接续', () => {
    vi.useFakeTimers();
    const api = createCockpit();
    const cues: string[] = [];
    const demo = runFullDemo({
      act: api.actions,
      traceDmsMode: 'replay-fallback',
      setSpeed: () => undefined,
      onStep: (step) => cues.push(step.cue),
    });
    vi.advanceTimersByTime(8_000);
    expect(cues).toEqual(['commute', 'commute-personalized']);
    demo.pause();
    vi.advanceTimersByTime(30_000);
    expect(cues).toHaveLength(2);
    demo.resume();
    vi.advanceTimersByTime(6_000);
    expect(cues.at(-1)).toBe('fatigue-monitoring');
    demo.stop();
  });

  it('顶部五段进度在 Full Demo 中只随五个体验前进', () => {
    const step = (i: number) => ({ i, total: 21, cue: FULL_DEMO_STEPS[i - 1].cue, title: '', note: '' });
    expect(progressPhaseOf('full-demo', step(1), 'commute')).toBe(0);
    expect(progressPhaseOf('full-demo', step(3), 'fatigue-monitoring')).toBe(1);
    expect(progressPhaseOf('full-demo', step(8), 'complex-roads')).toBe(2);
    expect(progressPhaseOf('full-demo', step(11), 'cabin-memory')).toBe(3);
    expect(progressPhaseOf('full-demo', step(14), 'oms-cruise')).toBe(4);
  });

  it('浏览器临时语音会把技术缩写转换成自然英文读法', () => {
    expect(EVA_SPEECH_LANG).toBe('en-US');
    expect(normalizeSpeechText('DMS and OMS inspect PERCLOS while L2 remains active.')).toBe(
      'driver monitoring and occupant monitoring inspect eyelid closure ratio while Level Two remains active.',
    );
  });

  it('21 个自动演示节点与正式英文音频清单逐字一致', () => {
    expect(FULL_DEMO_VOICE_IDS).toHaveLength(21);
    for (const step of FULL_DEMO_STEPS) {
      const asset = getEvaVoiceAsset(step.voiceId);
      expect(asset).toBeDefined();
      expect(asset?.url).toMatch(/\.mp3$/u);
      expect(asset?.durationMs).toBeGreaterThan(0);
      expect(step.note).toBe(asset?.text);
      expect(resolveDemoEvaText(step, 'full-demo')).toBe(asset?.text);
    }
    for (const step of DEMO_STEPS) {
      if (step.voice === false) continue;
      expect(resolveDemoEvaText(step, 'oms-trace')).toBe(getEvaVoiceAsset(step.voiceId)?.text);
    }
    expect(FULL_DEMO_STEPS[0].title).toBe('01 · Daily Commute');
  });

  it('运行时固定回应、动态数值与界面兜底文案均使用英文语音包', () => {
    expect(resolveEvaRuntimeText('Good morning. Welcome back. Traffic is clear and your usual route is ready.')).toBe(
      getEvaVoiceAsset('rt06_commute_welcome')?.text,
    );
    expect(resolveEvaRuntimeText('Sure — temperature lowered to 21.0°C.')).toBe(
      "Okay, I've lowered the temperature to 21.0 degrees Celsius.",
    );
    expect(resolveEvaRuntimeText('11.9 km remaining — about 24 minutes to arrive at current speed.')).toBe(
      "11.9 kilometers remaining. At our current speed, we'll arrive in about 24 minutes.",
    );
    expect(resolveEvaFallbackText('paused', 'full-demo')).toContain('pause');
    expect(resolveEvaFallbackText('running', 'fatigue')).toContain('Fatigue');
    expect(resolveEvaFallbackText('running', 'complex')).toContain('Complex Roads');
    expect(resolveEvaFallbackText('running', 'cabin-memory')).toContain('Cabin Memory');
  });

  it('浏览器临时语音优先选择英文自然音色', () => {
    const voices = [
      { name: 'Microsoft Zira Desktop', lang: 'en-US', localService: true },
      { name: 'Microsoft Aria Online Natural', lang: 'en-US', localService: false },
      { name: 'Microsoft Xiaoxiao Online Natural', lang: 'zh-CN', localService: false },
    ] as SpeechSynthesisVoice[];
    expect(selectEvaVoice(voices)?.name).toContain('Aria');
    expect(selectEvaVoice(voices, 'zh-CN')?.name).toContain('Xiaoxiao');
  });

  it('正式音频先按扩展名校验浏览器解码能力，未知扩展仍允许尝试', () => {
    expect(audioMimeForUrl('/audio/eva/line.mp3?v=2')).toBe('audio/mpeg');
    expect(audioMimeForUrl('/audio/eva/line.wav#take')).toBe('audio/wav');
    expect(audioMimeForUrl('/audio/eva/line.bin')).toBeNull();
    const supported = { canPlayType: vi.fn((mime: string) => mime === 'audio/mpeg' ? 'probably' : '') };
    expect(canPlayAudioAsset(supported, '/audio/eva/line.mp3')).toBe(true);
    expect(canPlayAudioAsset(supported, '/audio/eva/line.wav')).toBe(false);
    expect(canPlayAudioAsset(supported, '/audio/eva/line.asset')).toBe(true);
  });

  it('带 UTF-8 BOM 的正式清单仍能解析 voice_id', () => {
    expect(parseVoiceCsv('\uFEFFvoice_id,spoken_text\nfd01,Hello.')).toEqual([
      { voice_id: 'fd01', spoken_text: 'Hello.' },
    ]);
  });
});

describe('仿真播放时钟', () => {
  it('准备与暂停时冻结，播放后才按固定节拍推进', () => {
    vi.useFakeTimers();
    const steps: number[] = [];
    const clock = createSimulationClock((dt) => steps.push(dt), { intervalMs: 100, dt: 0.2 });

    vi.advanceTimersByTime(500);
    expect(steps).toHaveLength(0);
    clock.play();
    vi.advanceTimersByTime(350);
    expect(steps).toHaveLength(3);
    expect(steps.every((dt) => dt === 0.2)).toBe(true);
    clock.pause();
    vi.advanceTimersByTime(500);
    expect(steps).toHaveLength(3);
    clock.dispose();
  });
});

describe('DMS 预检上限', () => {
  it('权限请求悬挂时按上限返回降级值', async () => {
    vi.useFakeTimers();
    const pending = new Promise<boolean>(() => undefined);
    const result = resolveWithin(pending, 4_000, false);
    await vi.advanceTimersByTimeAsync(4_000);
    await expect(result).resolves.toBe(false);
  });
});

describe('数字孪生镜头派生', () => {
  it('车辆校准固定为左舵：驾驶员前排左侧，OMS 风险乘员后排右侧', () => {
    expect(VEHICLE_CALIBRATION.handedness).toBe('left-hand-drive');
    expect(VEHICLE_CALIBRATION.driver[0]).toBeGreaterThan(0);
    expect(VEHICLE_CALIBRATION.driver[2]).toBeGreaterThan(VEHICLE_CALIBRATION.rearRight[2]);
    expect(VEHICLE_CALIBRATION.rearRight[0]).toBeLessThan(0);
    expect(VEHICLE_CALIBRATION.driver[0]).toBeLessThan(0.65);
    expect(VEHICLE_CALIBRATION.rearRight[0]).toBeGreaterThan(-0.65);
    expect(VEHICLE_CALIBRATION.driver[0] - VEHICLE_CALIBRATION.rearRight[0]).toBeGreaterThan(0.9);
    expect(VEHICLE_CALIBRATION.driver[2]).toBeLessThanOrEqual(0.5);
    expect(VEHICLE_CALIBRATION.driver[2] - VEHICLE_CALIBRATION.rearRight[2]).toBeGreaterThan(0.8);
    expect(VEHICLE_CALIBRATION.driver[2] - VEHICLE_CALIBRATION.rearRight[2]).toBeLessThan(1.2);
    expect(VEHICLE_CALIBRATION.rearRightWindow[0]).toBeLessThan(VEHICLE_CALIBRATION.rearRight[0]);
  });

  it('Live 同机位的车速变化不会被误判为新镜头', () => {
    const state = createState('cabin-safety');
    state.drive.speed = 38;
    const accelerating = deriveTwinFrame(state, 'oms-cruise', 'calm');
    state.drive.speed = 72;
    const cruising = deriveTwinFrame(state, 'oms-cruise', 'calm');

    expect(accelerating.motionIntensity).not.toBe(cruising.motionIntensity);
    expect(cameraCutKey(accelerating)).toBe(cameraCutKey(cruising));
    expect(deriveTwinFrame(state, 'oms-candidate', 'care').camera).toBe('rearRightReveal');
    expect(deriveTwinFrame(state, 'oms-prompt', 'care').camera).toBe('rearRightChase');
  });

  it('OMS 主线只在关联、风险和恢复节点切到对应稳定机位', () => {
    const state = createState('cabin-safety');
    state.drive.speed = 72;

    const correlate = deriveTwinFrame(state, 'oms-correlate', 'care');
    expect(correlate.camera).toBe('leftFrontHigh');
    expect(correlate.environment).toBe('cabin');
    expect(correlate.correlation).toBe(true);
    expect(correlate.bodyOpacity).toBeLessThan(0.5);

    state.oms.response.active = true;
    const urgent = deriveTwinFrame(state, 'oms-urgent', 'urgent');
    expect(urgent.camera).toBe('rearRightFocus');
    expect(urgent.accent).toBe('danger');
    expect(urgent.omsMarker).toBe('urgent');
    expect(urgent.braking).toBe(true);

    const recovered = deriveTwinFrame(state, 'oms-verify', 'calm');
    expect(recovered.camera).toBe('rearWide');
    expect(recovered.omsMarker).toBe('clear');

    const artifact = deriveTwinFrame(state, 'moment-trace', 'calm');
    expect(artifact.camera).toBe('rearWide');
    expect(artifact.motionIntensity).toBe(0);
    expect(artifact.traceArtifact).toBe(true);
  });

  it('车型缩放后仍以舞台原点为中心', () => {
    const fit = fitModelBounds([19.59, 8.4, 24.53], [0.62, 4.18, 1.19]);
    const finalCenter = [
      0.62 * fit.scale + fit.position[0],
      4.18 * fit.scale + fit.position[1],
      1.19 * fit.scale + fit.position[2],
    ];
    expect(finalCenter).toEqual([0, 0, 0]);
    expect(fit.groundY).toBeLessThan(-0.9);
  });

  it('三幕映射到不同镜头和青／橙／红语义状态', () => {
    const state = createState('commute');
    state.drive.speed = 80;
    const commute = deriveTwinFrame(state, 'commute', 'calm');
    expect(commute.camera).toBe('rearChase');
    expect(commute.accent).toBe('verify');
    expect(commute.bodyOpacity).toBe(1);
    expect(commute.environment).toBe('city');
    expect(commute.motionIntensity).toBeGreaterThan(0);

    const care = deriveTwinFrame(state, 'fatigue-care', 'warn');
    expect(care.camera).toBe('gaze');
    expect(care.accent).toBe('cause');
    expect(care.gaze).toBe('warning');
    expect(care.effect).toBe('care');
    expect(care.environment).toBe('highway');
    expect(care.cabinEffect).toBe('none');
    expect(deriveTwinFrame(state, 'fatigue-care', 'warn', 'cabin-airflow').cabinEffect).toBe('airflow');

    const fatigue = deriveTwinFrame(state, 'fatigue-monitoring', 'care');
    expect(fatigue.camera).toBe('driver');

    const urgent = deriveTwinFrame(state, 'fatigue-urgent', 'urgent');
    expect(urgent.camera).toBe('cause');
    expect(urgent.accent).toBe('danger');
    expect(urgent.gaze).toBe('urgent');
    expect(urgent.bodyOpacity).toBeGreaterThanOrEqual(0.5);
    expect(urgent.bodyOpacity).toBeLessThan(0.7);

    state.drive.leadBrake = true;
    const complex = deriveTwinFrame(state, 'complex-roads', 'warn');
    expect(complex.camera).toBe('rainChase');
    expect(complex.accent).toBe('danger');
    expect(complex.effect).toBe('weather');
    expect(complex.environment).toBe('rain-night');
    expect(complex.braking).toBe(true);

    expect(deriveTwinFrame(state, 'voice-command', 'care').camera).toBe('console');

    const memoryStart = deriveTwinFrame(state, 'cabin-memory', 'care');
    const memoryLinked = deriveTwinFrame(state, 'cabin-memory-assist', 'care', 'memory-trace');
    expect(memoryStart.memoryEvidence).toBe(false);
    expect(memoryLinked.memoryEvidence).toBe(true);
    expect(deriveTwinFrame(state, 'cabin-memory-verify', 'calm').memoryEvidence).toBe(true);
  });

  it('休息、路况恢复和完成阶段回到青色安全语义', () => {
    const state = createState('fatigue');
    state.drive.speed = 12;
    const decelerating = deriveTwinFrame(state, 'fatigue-rest', 'care', 'rest-settled');
    expect(decelerating.camera).toBe('cause');
    expect(decelerating.environment).toBe('highway');
    expect(decelerating.roadTravelRate).toBeGreaterThan(0);
    state.drive.speed = 0;
    const rest = deriveTwinFrame(state, 'fatigue-rest', 'care', 'rest-settled');
    expect(rest.camera).toBe('cabin');
    expect(rest.accent).toBe('verify');
    expect(rest.effect).toBe('rest');
    expect(rest.cabinEffect).toBe('rest');
    const recovered = deriveTwinFrame(state, 'conditions-ease', 'calm');
    expect(recovered.camera).toBe('rearWide');
    expect(recovered.accent).toBe('verify');
    const completed = deriveTwinFrame(state, 'completed', 'calm');
    expect(completed.effect).toBe('complete');
    expect(completed.motionIntensity).toBe(0);
  });

  it('速度、播放、页面可见性和减弱动效共同控制环境运动', () => {
    const state = createState('commute');
    state.drive.speed = 80;
    const frame = deriveTwinFrame(state, 'commute', 'calm');
    expect(isTwinMotionActive(frame, true, false, true)).toBe(true);
    expect(isTwinMotionActive(frame, false, false, true)).toBe(false);
    expect(isTwinMotionActive(frame, true, true, true)).toBe(false);
    expect(isTwinMotionActive(frame, true, false, false)).toBe(false);
    state.drive.speed = 0;
    const stopped = deriveTwinFrame(state, 'commute', 'calm');
    expect(stopped.motionIntensity).toBe(0);
    expect(isTwinMotionActive(stopped, true, false, true)).toBe(false);
  });

  it('道路位移与实际车速保持线性关系，只应用一次电影增益', () => {
    const state = createState('commute');
    state.drive.speed = 40;
    const slow = deriveTwinFrame(state, 'commute', 'calm');
    state.drive.speed = 80;
    const fast = deriveTwinFrame(state, 'commute', 'calm');
    expect(fast.roadTravelRate / slow.roadTravelRate).toBeCloseTo(2, 6);
  });

  it('雨夜前车按远处、接近、制动、安全间距阶段同步位置与刹车灯', () => {
    const state = createState('complex');
    state.drive.speed = 82;
    const distant = deriveTwinFrame(state, 'complex-braking', 'warn', 'lead-distant');
    const closing = deriveTwinFrame(state, 'complex-braking', 'warn', 'lead-closing');
    const braking = deriveTwinFrame(state, 'complex-braking', 'urgent', 'lead-braking');
    const safe = deriveTwinFrame(state, 'complex-braking', 'care', 'lead-safe-gap');
    expect(distant.leadDistanceM).toBeGreaterThan(closing.leadDistanceM);
    expect(closing.leadDistanceM).toBeGreaterThan(braking.leadDistanceM);
    expect(braking.braking).toBe(true);
    expect(safe.leadDistanceM).toBeGreaterThan(braking.leadDistanceM);
    expect(safe.braking).toBe(false);
    expect(braking.weatherMix).toBe(1);
    expect(deriveTwinFrame(state, 'conditions-ease', 'calm', 'weather-clearing').weatherMix).toBe(0);
  });
});

describe('Eva 表情系统（情绪推导）', () => {
  it('五种模式基调映射四态情绪', () => {
    expect(deriveMood('Observing', null, 0)).toBe('calm');
    expect(deriveMood('Guarding', null, 0)).toBe('care');
    expect(deriveMood('Resting', null, 0)).toBe('care');
    expect(deriveMood('Cautious', null, 0)).toBe('warn');
    expect(deriveMood('Intervening', null, 0)).toBe('urgent');
  });

  it('新鲜消息语气可临时提升情绪，过期回落模式基调', () => {
    expect(deriveMood('Observing', { kind: 'care', t: 10 }, 10.2)).toBe('care');
    expect(deriveMood('Observing', { kind: 'care', t: 10 }, 10 + MOOD_FRESH_MIN + 0.01)).toBe('calm');
    expect(deriveMood('Observing', { kind: 'sys', t: 10 }, 10.1)).toBe('calm');
  });

  it('紧急干预待选择（pending）期间锁定 urgent，表情不回落', () => {
    expect(deriveMood('Resting', { kind: 'care', t: 10 }, 20, { pending: true })).toBe('urgent');
    expect(deriveMood('Observing', null, 0, { pending: true })).toBe('urgent');
  });

  it('情绪只升不降（安全优先：紧急语义不被温柔消息稀释）', () => {
    expect(deriveMood('Observing', { kind: 'urg', t: 5 }, 5.1)).toBe('urgent');
    expect(deriveMood('Cautious', { kind: 'care', t: 5 }, 5.1)).toBe('warn');
    expect(deriveMood('Guarding', { kind: 'warn', t: 5 }, 5.1)).toBe('warn');
  });

  it('七种功能表情均可由稳定剧情提示覆盖', () => {
    const expressions = new Set([
      deriveEvaExpression('commute', 'calm', 'neutral', 'running'),
      deriveEvaExpression('fatigue-monitoring', 'calm', 'neutral', 'running'),
      deriveEvaExpression('fatigue-care', 'calm', 'neutral', 'running'),
      deriveEvaExpression('fatigue-urgent', 'calm', 'neutral', 'running'),
      deriveEvaExpression('complex-roads', 'calm', 'neutral', 'running'),
      deriveEvaExpression('voice-command', 'calm', 'neutral', 'running'),
      deriveEvaExpression('completed', 'calm', 'neutral', 'completed'),
    ]);
    expect(expressions).toEqual(new Set(['calm', 'thinking', 'caring', 'urgent', 'cautious', 'listening', 'confirming']));
  });

  it('六类驾驶员情绪映射到功能表情', () => {
    expect(deriveEvaExpression(null, 'calm', 'neutral', 'running')).toBe('calm');
    expect(deriveEvaExpression(null, 'calm', 'happy', 'running')).toBe('confirming');
    expect(deriveEvaExpression(null, 'calm', 'sad', 'running')).toBe('caring');
    expect(deriveEvaExpression(null, 'calm', 'drowsy', 'running')).toBe('caring');
    expect(deriveEvaExpression(null, 'calm', 'angry', 'running')).toBe('cautious');
    expect(deriveEvaExpression(null, 'calm', 'surprised', 'running')).toBe('listening');
  });

  it('紧急安全状态高于剧情，剧情高于实时驾驶员情绪', () => {
    expect(deriveEvaExpression('voice-command', 'urgent', 'happy', 'running')).toBe('urgent');
    expect(deriveEvaExpression('voice-command', 'calm', 'angry', 'running')).toBe('listening');
    expect(deriveEvaExpression(null, 'calm', 'happy', 'completed')).toBe('confirming');
  });
});

describe('Evidence 播放闸门', () => {
  it('只恢复打开前正在运行的体验，原本暂停时不得误续播', () => {
    const gate = createEvidencePlaybackGate();
    expect(gate.open('running')).toBe(true);
    expect(gate.open('paused')).toBe(true);
    expect(gate.close()).toBe(true);
    expect(gate.close()).toBe(false);
    expect(gate.open('paused')).toBe(false);
    expect(gate.close()).toBe(false);
  });
});

describe('座舱氛围分级', () => {
  const base = () => {
    const s = createState('commute');
    s.alerts = [];
    return s;
  };

  it('无告警时为常态（ok）', () => {
    expect(ambientLevelOf(base())).toBe('ok');
  });

  it('新鲜紧急告警 → danger，过期后回落', () => {
    const s = base();
    s.alerts.push({ id: 1, t: s.t, level: 'urgent', text: '重度疲劳' });
    expect(ambientLevelOf(s)).toBe('danger');
    s.t += URGENT_FRESH_MIN + 0.01;
    expect(ambientLevelOf(s)).toBe('ok');
  });

  it('新鲜预警 / L2 降级 → warn', () => {
    const s1 = base();
    s1.alerts.push({ id: 1, t: s1.t, level: 'warn', text: '视线离开' });
    expect(ambientLevelOf(s1)).toBe('warn');

    const s2 = base();
    s2.drive.l2Degraded = true;
    expect(ambientLevelOf(s2)).toBe('warn');
  });

  it('紧急干预待选择（pending）→ danger，贯穿决策时刻', () => {
    const s = base();
    s.pending = { prompt: '需要休息吗？', options: [{ key: 'rest', label: '立即休息' }] };
    expect(ambientLevelOf(s)).toBe('danger');
  });
});

describe('EVA 数字人几何（纯函数）', () => {
  it('半身像线框结构完整：头/颈环 + 躯干弧 + 五官在前表面', () => {
    const b = buildBust();
    expect(b.loops.length).toBe(9); // 4 头纬环 + 3 经线 + 2 颈环
    expect(b.arcs.length).toBe(3); // 肩/胸/下胸前弧
    expect(b.eyes[0].z).toBeGreaterThan(0.3);
    expect(b.eyes[1].z).toBeGreaterThan(0.3);
    expect(b.mouth.z).toBeGreaterThan(0.3);
    expect(b.core.length).toBeGreaterThan(6);
    expect(b.height).toBeGreaterThan(2);
  });

  it('情绪调色板与眼睛形态四态齐备', () => {
    for (const m of ['calm', 'care', 'warn', 'urgent'] as const) {
      expect(MOOD_COLOR[m]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(eyeShapeOf(m)).toBeTruthy();
    }
    expect(eyeShapeOf('care')).toBe('arc');
    expect(eyeShapeOf('urgent')).toBe('max');
  });
});
