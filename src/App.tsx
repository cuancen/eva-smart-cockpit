import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMsg, CockpitState, ScenarioId, TraceDmsMode } from './core';
import Landing from './landing/Landing';
import { routeFromHash } from './routing';
import { ambientLevelOf } from './shell/ambient';
import { runAutoDemo } from './shell/autoDemo';
import type { AutoDemoHandle, DemoCue, DemoStep, DemoTransportState } from './shell/autoDemo';
import CinemaControls from './shell/components/CinemaControls';
import type { ExperienceId } from './shell/components/CinemaControls';
import CockpitHeader from './shell/components/CockpitHeader';
import EntryTransition from './shell/components/EntryTransition';
import EvaNarration from './shell/components/EvaNarration';
import EvidenceDrawer from './shell/components/EvidenceDrawer';
import MomentTraceArtifact from './shell/components/MomentTraceArtifact';
import { deriveEvaExpression, deriveMood } from './shell/evaFace';
import { createEvidencePlaybackGate } from './shell/evidencePlayback';
import { runFullDemo } from './shell/fullDemo';
import type { DemoBeatEventType } from './shell/fullDemo';
import { useCockpit } from './shell/hooks/useCockpit';
import { useDms } from './shell/hooks/useDms';
import { useUiPrefs } from './shell/hooks/useUiPrefs';
import DmsEvidenceLens from './shell/components/DmsEvidenceLens';
import CabinEffectOverlay from './shell/components/CabinEffectOverlay';
import CabinMemoryLens from './shell/components/CabinMemoryLens';
import TwinStage from './shell/twin/TwinStage';
import { deriveTwinFrame } from './shell/twin/twinState';

type ManualScenarioId = Exclude<ScenarioId, 'cabin-safety'>;

const SCENARIO_KEYS: Record<string, ManualScenarioId> = {
  '1': 'commute',
  '2': 'fatigue',
  '3': 'complex',
};

function cueFromState(state: CockpitState): DemoCue | null {
  if (state.scenario === 'cabin-safety') {
    const cueByPhase: Partial<Record<CockpitState['momentTrace']['phase'], DemoCue>> = {
      perceive: 'oms-cruise',
      correlate: 'oms-correlate',
      decide: 'oms-decide',
      act: 'oms-urgent',
      verify: 'oms-verify',
      artifact: 'moment-trace',
      completed: 'completed',
    };
    return cueByPhase[state.momentTrace.phase] ?? 'oms-cruise';
  }
  if (state.scenario === 'commute') return 'commute';
  if (state.scenario === 'complex') return 'complex-roads';
  if (state.driver.resting) return 'fatigue-rest';
  if (state.driver.fatigue >= 85 || state.pending) return 'fatigue-urgent';
  if (state.driver.fatigue >= 60) return 'fatigue-care';
  return 'fatigue-monitoring';
}

function latestEvaMessage(state: CockpitState): ChatMsg | null {
  for (let index = state.chat.length - 1; index >= 0; index -= 1) {
    if (state.chat[index].role === 'eva') return state.chat[index];
  }
  return null;
}

export default function App() {
  const [route, setRoute] = useState<'landing' | 'cockpit'>(() => routeFromHash(window.location.hash));
  const [autoDemoRequested, setAutoDemoRequested] = useState(false);
  const prefs = useUiPrefs();

  useEffect(() => {
    const onHash = () => {
      const nextRoute = routeFromHash(window.location.hash);
      let shouldStartFullDemo = false;
      if (nextRoute === 'cockpit') {
        try {
          shouldStartFullDemo = window.sessionStorage.getItem('eva.autodemo') === '1';
          window.sessionStorage.removeItem('eva.autodemo');
        } catch { /* 浏览器隐私模式 */ }
      }
      setAutoDemoRequested(shouldStartFullDemo);
      setRoute(nextRoute);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return route === 'landing'
    ? <Landing language={prefs.lang} onLanguageChange={prefs.setLang} />
    : <Cockpit prefs={prefs} autoDemoRequested={autoDemoRequested} />;
}

function Cockpit({ prefs, autoDemoRequested }: { prefs: ReturnType<typeof useUiPrefs>; autoDemoRequested: boolean }) {
  const { snap, act, liveState, setSpeed, running, play, pause, refresh } = useCockpit();
  const dms = useDms(act, liveState);
  const [entryDone, setEntryDone] = useState(false);
  const [twinReady, setTwinReady] = useState(false);
  const [transport, setTransport] = useState<DemoTransportState>('ready');
  const [demoStep, setDemoStep] = useState<DemoStep | null>(null);
  const [demoVisualCue, setDemoVisualCue] = useState<DemoCue | null>(null);
  const [demoVisualEvent, setDemoVisualEvent] = useState<DemoBeatEventType | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceId>('full-demo');
  const [preparing, setPreparing] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [narrationSession, setNarrationSession] = useState(0);
  const demoRef = useRef<AutoDemoHandle | null>(null);
  const dmsRef = useRef(dms);
  const launchIdRef = useRef(0);
  const evidencePlaybackRef = useRef(createEvidencePlaybackGate());
  const visibilityPausedRef = useRef(false);
  const autoDemoStartedRef = useRef(false);
  dmsRef.current = dms;

  const receiveDemoStep = useCallback((step: DemoStep) => {
    setDemoVisualCue(step.cue);
    setDemoStep(step);
  }, []);

  const receiveVisualStep = useCallback((step: DemoStep) => {
    setDemoVisualEvent(null);
    setDemoVisualCue(step.cue);
  }, []);

  const finishNarration = useCallback((voiceId?: string) => {
    demoRef.current?.narrationComplete(voiceId);
  }, []);

  const beginNarration = useCallback((voiceId?: string) => {
    demoRef.current?.narrationStarted(voiceId);
  }, []);

  const failNarration = useCallback((voiceId?: string) => {
    demoRef.current?.narrationFailed(voiceId);
  }, []);

  useEffect(() => {
    document.body.classList.add('cockpit-body');
    return () => {
      launchIdRef.current += 1;
      document.body.classList.remove('cockpit-body');
      demoRef.current?.stop();
      demoRef.current = null;
      dmsRef.current.stopAll();
      evidencePlaybackRef.current.reset();
    };
  }, []);

  useEffect(() => {
    document.title = prefs.lang === 'zh' ? 'EVA · 智能座舱' : 'EVA Digital Twin — Smart Cockpit';
  }, [prefs.lang]);

  const startDemo = useCallback(async () => {
    const launchId = ++launchIdRef.current;
    setNarrationSession((session) => session + 1);
    setSelectedExperience('oms-trace');
    setDemoStep(null);
    setDemoVisualCue(null);
    setDemoVisualEvent(null);
    demoRef.current?.stop();
    demoRef.current = null;
    pause();
    setTransport('ready');
    setPreparing(true);

    let traceDmsMode: TraceDmsMode = 'replay-fallback';
    try {
      const currentMode = dmsRef.current.getMode();
      const currentSample = dmsRef.current.getSample();
      if (currentMode === 'model' && currentSample?.present) traceDmsMode = 'live';
      else if (currentMode === 'video' && currentSample?.present) traceDmsMode = 'local-video';
      else dmsRef.current.startReplay();
      if (launchId !== launchIdRef.current) return;

      demoRef.current = runAutoDemo({
        act,
        traceDmsMode,
        getVision: dmsRef.current.getSample,
        activateReplayDms: dmsRef.current.startReplay,
        setSpeed,
        setSimulationRunning: (shouldRun) => { if (shouldRun) play(); else pause(); },
        onStep: receiveDemoStep,
        onTransport: setTransport,
      });
      refresh();
    } finally {
      if (launchId === launchIdRef.current) setPreparing(false);
    }
  }, [act, pause, play, receiveDemoStep, refresh, setSpeed]);

  const startFullDemo = useCallback(() => {
    const launchId = ++launchIdRef.current;
    setNarrationSession((session) => session + 1);
    setSelectedExperience('full-demo');
    setDemoStep(null);
    setDemoVisualCue(null);
    setDemoVisualEvent(null);
    demoRef.current?.stop();
    demoRef.current = null;
    pause();
    setTransport('ready');
    setPreparing(true);

    // Full Demo deliberately starts without a camera prompt. The fatigue beat opens
    // the licensed local video, while the OMS beat switches to labelled replay data.
    const traceDmsMode: TraceDmsMode = 'replay-fallback';
    if (launchId !== launchIdRef.current) return;
    dmsRef.current.stopAll();

    demoRef.current = runFullDemo({
      act,
      traceDmsMode,
      setSpeed,
      setSimulationRunning: (shouldRun) => { if (shouldRun) play(); else pause(); },
      onFatigueStart: () => { void dmsRef.current.startAuthorizedVideo(); },
      onOmsStart: () => { dmsRef.current.startReplay(); },
      onVisualStep: receiveVisualStep,
      onStep: receiveDemoStep,
      onBeatEvent: (event) => setDemoVisualEvent(event),
      onTransport: setTransport,
    });
    refresh();
    setPreparing(false);
  }, [act, pause, play, receiveDemoStep, receiveVisualStep, refresh, setSpeed]);

  const stopDemoHandle = useCallback(() => {
    launchIdRef.current += 1;
    demoRef.current?.stop();
    demoRef.current = null;
    setDemoStep(null);
    setDemoVisualCue(null);
    setDemoVisualEvent(null);
    setPreparing(false);
  }, []);

  const runScenario = useCallback((id: ManualScenarioId) => {
    setNarrationSession((session) => session + 1);
    setSelectedExperience(id);
    stopDemoHandle();
    pause();
    act.reset();
    act.scenario(id);
    refresh();
    play();
    setTransport('running');
  }, [act, pause, play, refresh, stopDemoHandle]);

  const runCabinMemory = useCallback(() => {
    setNarrationSession((session) => session + 1);
    setSelectedExperience('cabin-memory');
    stopDemoHandle();
    pause();
    act.reset();
    act.scenario('commute', { announce: false });
    act.observeCabinObject({
      id: 'parking-card',
      label: 'Parking card',
      location: 'driver-side door pocket',
      owner: 'driver',
      importance: 'important',
      confidence: 0.94,
    });
    act.beginObjectSearch('parking-card');
    if (dmsRef.current.getMode() === 'off') dmsRef.current.startSim();
    refresh();
    play();
    setTransport('running');
  }, [act, pause, play, refresh, stopDemoHandle]);

  const runExperience = useCallback((id: ExperienceId) => {
    if (id === 'full-demo') { startFullDemo(); return; }
    if (id === 'oms-trace') { void startDemo(); return; }
    if (id === 'cabin-memory') { runCabinMemory(); return; }
    runScenario(id);
  }, [runCabinMemory, runScenario, startDemo, startFullDemo]);

  const confirmSafety = useCallback(() => {
    if (!liveState().oms.awaitingConfirmation) return;
    if (demoRef.current) demoRef.current.confirmSafety();
    else act.confirmOmsClear();
    refresh();
  }, [act, liveState, refresh]);

  const primaryAction = useCallback(() => {
    if (preparing) return;
    const confirmationReady = snap.oms.awaitingConfirmation
      && selectedExperience === 'oms-trace'
      && (demoStep?.cue === 'oms-verify' || demoStep?.cue === 'moment-trace');
    if (confirmationReady && demoRef.current) {
      confirmSafety();
      return;
    }
    if (transport === 'ready') {
      runExperience(selectedExperience);
      return;
    }
    if (transport === 'running') {
      if (demoRef.current) demoRef.current.pause();
      else { pause(); setTransport('paused'); }
      return;
    }
    if (transport === 'paused') {
      if (demoRef.current) demoRef.current.resume();
      else { play(); setTransport('running'); }
      return;
    }
    runExperience(selectedExperience);
  }, [confirmSafety, demoStep?.cue, pause, play, preparing, runExperience, selectedExperience, snap.oms.awaitingConfirmation, transport]);

  const restart = useCallback(() => {
    if (selectedExperience === 'full-demo') startFullDemo();
    else if (selectedExperience === 'oms-trace') void startDemo();
    else if (selectedExperience === 'cabin-memory') runCabinMemory();
    else runScenario(selectedExperience);
  }, [runCabinMemory, runScenario, selectedExperience, startDemo, startFullDemo]);

  const openEvidence = useCallback(() => {
    const shouldPause = evidencePlaybackRef.current.open(transport);
    if (shouldPause) {
      if (demoRef.current) demoRef.current.pause();
      else { pause(); setTransport('paused'); }
    }
    setEvidenceOpen(true);
  }, [pause, transport]);

  const closeEvidence = useCallback(() => {
    setEvidenceOpen(false);
    if (!evidencePlaybackRef.current.close()) return;
    if (demoRef.current) demoRef.current.resume();
    else { play(); setTransport('running'); }
  }, [play]);

  useEffect(() => {
    if (transport === 'running' && !evidenceOpen) dms.resumeMedia();
    else dms.pauseMedia();
  }, [dms.mode, dms.pauseMedia, dms.resumeMedia, evidenceOpen, transport]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (transport !== 'running') return;
        visibilityPausedRef.current = true;
        if (demoRef.current) demoRef.current.pause();
        else { pause(); setTransport('paused'); }
        return;
      }
      if (!visibilityPausedRef.current || evidenceOpen) return;
      visibilityPausedRef.current = false;
      if (demoRef.current) demoRef.current.resume();
      else { play(); setTransport('running'); }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [evidenceOpen, pause, play, transport]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const element = event.target as HTMLElement | null;
      if (element && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(element.tagName)) return;
      if (element?.isContentEditable || event.altKey || event.ctrlKey || event.metaKey) return;
      const scenario = SCENARIO_KEYS[event.key];
      if (scenario) runScenario(scenario);
      else if (event.key === 'd' || event.key === 'D') restart();
      else if (event.key === 'l' || event.key === 'L') { act.setAuto(!liveState().drive.auto); refresh(); }
      else if (event.code === 'Space') { event.preventDefault(); primaryAction(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [act, liveState, primaryAction, refresh, restart, runScenario]);

  useEffect(() => {
    if (!autoDemoRequested || !entryDone || !twinReady || autoDemoStartedRef.current) return;
    autoDemoStartedRef.current = true;
    startFullDemo();
  }, [autoDemoRequested, entryDone, startFullDemo, twinReady]);

  const latestEva = latestEvaMessage(snap);
  const mood = deriveMood(snap.evaMode, latestEva, snap.t, { pending: !!snap.pending });
  const cue = selectedExperience === 'cabin-memory'
    ? 'cabin-memory'
    : demoVisualCue ?? demoStep?.cue ?? (transport === 'ready' ? null : cueFromState(snap));
  const expression = deriveEvaExpression(
    demoStep?.cue ?? null,
    mood,
    dms.sample?.emotion ?? snap.driver.vision?.emotion ?? 'neutral',
    transport,
  );
  const twinFrame = deriveTwinFrame(snap, cue, mood, demoVisualEvent);
  const canConfirmSafety = selectedExperience === 'oms-trace'
    && snap.oms.awaitingConfirmation
    && (demoStep?.cue === 'oms-verify' || demoStep?.cue === 'moment-trace');
  return (
    <div
      className="cinema-cockpit"
      data-ambient={ambientLevelOf(snap)}
      data-transport={transport}
      data-route-km={snap.drive.routeKm.toFixed(3)}
      data-sim-time={snap.t.toFixed(3)}
    >
      <a className="skip-link" href="#main">{prefs.lang === 'zh' ? '跳至数字孪生场景' : 'Skip to the digital twin stage'}</a>
      <main className="cinema-main" id="main">
        <TwinStage liveState={liveState} frame={twinFrame} running={running} onReady={() => setTwinReady(true)} language={prefs.lang} />

        <CockpitHeader snap={snap} step={demoStep} cue={cue} expression={expression} transport={transport} experience={selectedExperience} language={prefs.lang} onLanguageChange={prefs.setLang} onOpenEvidence={openEvidence} />

        <div className="twin-boundary" aria-label={prefs.lang === 'zh' ? '数据来源边界' : 'Data source boundaries'}>
          <span><i aria-hidden="true" />{dms.mode === 'model' ? (prefs.lang === 'zh' ? 'DMS · 实时摄像头 · 本地推理' : 'DMS · LIVE CAMERA · LOCAL INFERENCE') : dms.mode === 'authorized-video' ? (prefs.lang === 'zh' ? 'DMS · 授权视频 · 本地推理' : 'DMS · AUTHORIZED VIDEO · LOCAL INFERENCE') : dms.mode === 'video' ? (prefs.lang === 'zh' ? 'DMS · 用户视频 · 本地推理' : 'DMS · UPLOADED VIDEO · LOCAL INFERENCE') : dms.mode === 'replay' ? (prefs.lang === 'zh' ? 'DMS · 回放数据' : 'DMS · REPLAY FALLBACK') : dms.mode === 'sim' ? (prefs.lang === 'zh' ? 'DMS · 模拟信号' : 'DMS · SIMULATED SIGNAL') : (prefs.lang === 'zh' ? 'DMS · 等待选择输入' : 'DMS · PREFLIGHT READY')}</span>
          <span>{prefs.lang === 'zh' ? 'OMS · 模拟语义事件' : 'OMS · SIMULATED SEMANTIC EVENT'}</span>
        </div>

        {twinFrame.traceArtifact && snap.momentTrace.record && <MomentTraceArtifact record={snap.momentTrace.record} language={prefs.lang} />}

        <DmsEvidenceLens
          visible={selectedExperience === 'full-demo' && twinFrame.evidencePeek}
          running={transport === 'running' && !evidenceOpen}
          mode={dms.mode}
          status={dms.status}
          sample={dms.sample}
          landmarks={dms.landmarks}
          sourceVideo={dms.videoRef}
          language={prefs.lang}
        />

        <CabinEffectOverlay
          visible={selectedExperience === 'full-demo' && twinFrame.cabinEffect === 'airflow'}
          cabin={snap.cabin}
          language={prefs.lang}
        />

        <CabinMemoryLens
          visible={selectedExperience === 'cabin-memory'
            || (selectedExperience === 'full-demo' && twinFrame.memoryEvidence)}
          phase={snap.context.phase}
          now={snap.t}
          item={snap.context.memory.find((item) => item.id === 'parking-card') ?? null}
          language={prefs.lang}
        />

        <div className="cinema-story-layer">
          <EvaNarration
            key={`eva-narration-${narrationSession}`}
            message={latestEva}
            step={demoStep}
            transport={transport}
            mood={mood}
            expression={expression}
            voiceOn={prefs.voice}
            experience={selectedExperience}
            language={prefs.lang}
            onNarrationStart={beginNarration}
            onNarrationComplete={finishNarration}
            onNarrationError={failNarration}
          />
          <CinemaControls
            transport={transport}
            experience={selectedExperience}
            preparing={preparing}
            canConfirm={canConfirmSafety}
            onPrimary={primaryAction}
            onRestart={restart}
            onExperience={runExperience}
            language={prefs.lang}
          />
        </div>
      </main>

      <EvidenceDrawer
        open={evidenceOpen}
        onClose={closeEvidence}
        snap={snap}
        act={act}
        refresh={refresh}
        dms={dms}
        prefs={prefs}
        onConfirmSafety={confirmSafety}
        language={prefs.lang}
      />

      {!entryDone && <EntryTransition language={prefs.lang} onDone={() => setEntryDone(true)} />}
    </div>
  );
}
