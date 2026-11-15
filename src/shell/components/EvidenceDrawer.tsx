import { useEffect, useRef, useState } from 'react';
import type { FormEvent, RefObject } from 'react';
import { complexityOf, OMS_BEHAVIORS, P } from '../../core';
import type { CockpitActions, CockpitState, EmotionId, OmsBehavior, OmsRisk, OmsSeat, VisionSample } from '../../core';
import type { DmsStatus } from '../../vision/dms';
import type { DmsMode } from '../hooks/useDms';
import type { LocalDmsVideo } from '../hooks/useDms';
import { formatLocalVideoSize } from '../localVideo';
import CinemaIcon from './CinemaIcon';
import type { UiLanguage } from '../locale';
import { localizeEvaText } from '../evaCopyZh';

const SOURCE_LABEL: Record<DmsMode, string> = {
  off: 'DMS not active',
  model: 'Live camera · on-device',
  'authorized-video': 'Authorized video · local inference',
  video: 'Uploaded video · local inference',
  sim: 'Simulated DMS signal',
  replay: 'DMS replay fallback',
};
const SOURCE_LABEL_ZH: Record<DmsMode, string> = {
  off: 'DMS 未启用',
  model: '实时摄像头 · 本地推理',
  'authorized-video': '授权视频 · 本地推理',
  video: '用户视频 · 本地推理',
  sim: 'DMS 模拟信号',
  replay: 'DMS 回放数据',
};

const ALERT_LABEL = { info: 'INFO', warn: 'WARNING', urgent: 'URGENT' } as const;
const ALERT_LABEL_ZH = { info: '提示', warn: '警告', urgent: '紧急' } as const;
const EMOTION_LABEL: Record<EmotionId, string> = {
  neutral: 'Neutral',
  happy: 'Positive',
  sad: 'Low',
  angry: 'Tense',
  surprised: 'Surprised',
  drowsy: 'Drowsy',
};
const EMOTION_LABEL_ZH: Record<EmotionId, string> = {
  neutral: '平静', happy: '积极', sad: '低落', angry: '紧张', surprised: '惊讶', drowsy: '困倦',
};
function Metric({ label, value, tone = 'normal' }: { label: string; value: string; tone?: 'normal' | 'warn' | 'danger' }) {
  return <div className="evidence-metric" data-tone={tone}><span>{label}</span><b>{value}</b></div>;
}

const OMS_SEATS: OmsSeat[] = ['driver', 'front-passenger', 'rear-left', 'rear-right'];
const humanize = (value: string) => value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const seatLabel = (seat: OmsSeat, isZh: boolean) => isZh
  ? ({ driver: '驾驶员 · 左侧', 'front-passenger': '前排乘员', 'rear-left': '左后座', 'rear-right': '右后座', unknown: '未知座位' } as const)[seat]
  : seat === 'driver' ? 'DRIVER · LEFT' : humanize(seat);
const OMS_BEHAVIOR_LABEL: Record<OmsBehavior, { zh: string; en: string }> = {
  unknown: { zh: '未知', en: 'Unknown' },
  'standing-on-seat': { zh: '站在座椅上', en: 'Standing on seat' },
  standing: { zh: '站立', en: 'Standing' },
  lying: { zh: '躺卧', en: 'Lying down' },
  sleeping: { zh: '入睡', en: 'Sleeping' },
  tablet: { zh: '使用平板', en: 'Using tablet' },
  laptop: { zh: '使用笔记本电脑', en: 'Using laptop' },
  phone: { zh: '使用手机', en: 'Using phone' },
  calling: { zh: '通话中', en: 'On a call' },
  reading: { zh: '阅读', en: 'Reading' },
  makeup: { zh: '化妆', en: 'Applying makeup' },
  'odorous-food': { zh: '食用异味食物', en: 'Strong-smelling food' },
  eating: { zh: '进食', en: 'Eating' },
  drinking: { zh: '饮水', en: 'Drinking' },
  smoking: { zh: '吸烟', en: 'Smoking' },
  'head-outside-window': { zh: '头部靠近车窗', en: 'Head near window' },
  'body-outside-window': { zh: '身体探出车窗', en: 'Body outside window' },
  'hand-outside-window': { zh: '手伸出车窗', en: 'Hand outside window' },
  'holding-pet': { zh: '抱宠物', en: 'Holding a pet' },
  fighting: { zh: '打闹 / 争执', en: 'Fighting' },
  crying: { zh: '哭闹', en: 'Crying' },
  talking: { zh: '交谈', en: 'Talking' },
  yawning: { zh: '打哈欠', en: 'Yawning' },
};
const behaviorLabel = (behavior: OmsBehavior, isZh: boolean) => OMS_BEHAVIOR_LABEL[behavior][isZh ? 'zh' : 'en'];

export default function EvidenceDrawer({
  open,
  onClose,
  snap,
  act,
  refresh,
  dms,
  prefs,
  onConfirmSafety,
  language,
}: {
  open: boolean;
  onClose: () => void;
  snap: CockpitState;
  act: CockpitActions;
  refresh: () => void;
  dms: {
    mode: DmsMode;
    status: DmsStatus;
    sample: VisionSample | null;
    localVideo: LocalDmsVideo | null;
    inputError: string | null;
    videoRef: RefObject<HTMLVideoElement>;
    canvasRef: RefObject<HTMLCanvasElement>;
    startModel: () => Promise<boolean>;
    startVideo: (file: File) => Promise<boolean>;
    startAuthorizedVideo: () => Promise<boolean>;
    startSim: () => void;
    startReplay: () => void;
    stopAll: () => void;
  };
  prefs: {
    scale: number;
    zoom: (dir: -1 | 0 | 1) => void;
    highContrast: boolean;
    toggleHighContrast: () => void;
    voice: boolean;
    toggleVoice: () => void;
  };
  onConfirmSafety: () => void;
  language: UiLanguage;
}) {
  const [command, setCommand] = useState('');
  const [omsBehavior, setOmsBehavior] = useState<OmsBehavior>('head-outside-window');
  const [omsSeat, setOmsSeat] = useState<OmsSeat>('rear-right');
  const [omsConfidence, setOmsConfidence] = useState(0.9);
  const [omsDuration, setOmsDuration] = useState(1.2);
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const isZh = language === 'zh';
  const sourceLabel = isZh ? SOURCE_LABEL_ZH[dms.mode] : SOURCE_LABEL[dms.mode];

  useEffect(() => {
    if (drawerRef.current) drawerRef.current.inert = !open;
    const main = document.querySelector<HTMLElement>('.cinema-main');
    if (main) main.inert = open;
    if (open && !wasOpenRef.current) {
      setTechnicalOpen(false);
      restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      window.setTimeout(() => closeRef.current?.focus(), 0);
    }
    if (!open && wasOpenRef.current) {
      const restoreTarget = restoreFocusRef.current;
      window.setTimeout(() => restoreTarget?.focus(), 0);
    }
    wasOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setTechnicalOpen(false);
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = [...drawerRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      )].filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !drawerRef.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, open]);

  const sample = dms.sample;
  const perclos = sample ? sample.perclos * 100 : 0;
  const alerts = [...snap.alerts].reverse();
  const recentAlerts = alerts.filter((alert, index, list) => list.findIndex((item) => item.text === alert.text) === index);
  const visionFatigue = sample?.present
    ? Math.min(100, Math.max(P.perclosFatigueK * sample.perclos, Math.min(P.lookAwayFatigueCap, sample.lookAwaySec * 6)))
    : 0;
  const roadComplexity = complexityOf(snap);
  const traceDecision = snap.momentTrace.record?.decision;
  const decisionEn = traceDecision
    || (snap.oms.risk === 'urgent'
      ? 'Rear-right occupant risk · urgent response'
      : snap.oms.risk === 'warning'
        ? 'Rear-right occupant event · duration check'
        : snap.driver.fatigue >= P.fatigueTh.urgent
    ? 'Urgent fatigue intervention'
    : snap.driver.fatigue >= P.fatigueTh.care
      ? 'Gentle fatigue care'
      : roadComplexity >= P.complexityBlock
        ? 'Coordinated cautious mode'
        : 'Monitoring within normal range');
  const decision = isZh ? localizeEvaText(decisionEn) : decisionEn;
  const currentMoment = snap.oms.awaitingConfirmation
    ? isZh ? '等待您确认安全，再解除临时保护。' : 'Waiting for your safety confirmation before temporary protection is released.'
    : snap.oms.risk === 'urgent'
      ? isZh ? 'OMS 模拟事件需要安全响应。驾驶员请继续关注前方。' : 'A simulated OMS event needs a safety response. Keep supervising the road.'
      : snap.oms.risk === 'warning'
        ? isZh ? '正在核对乘员模拟事件与驾驶员状态。' : 'Correlating the simulated occupant event with driver state.'
        : snap.driver.fatigue >= P.fatigueTh.urgent
          ? isZh ? '疲劳状态需要关注，请尽快选择安全地点休息。' : 'Fatigue needs attention. Consider stopping at a safe place to rest.'
          : isZh ? '当前没有需要响应的风险。' : 'No risk requiring a response is active.';
  const tracePhase = snap.momentTrace.phase;
  const fatigueCare = snap.driver.fatigue >= P.fatigueTh.care;
  const fatigueUrgent = snap.driver.fatigue >= P.fatigueTh.urgent || Boolean(snap.pending);
  const fatigueCareSaid = snap.chat.some((msg) => msg.role === 'eva' && msg.kind === 'care' && /Noticing more frequent blinks|You are severely fatigued/.test(msg.text));
  const roadComplex = roadComplexity >= P.complexityBlock;
  const traceStep = tracePhase === 'perceive' ? 0
    : ['correlate', 'decide'].includes(tracePhase) ? 1
      : tracePhase === 'act' ? 2
        : ['verify', 'artifact', 'completed'].includes(tracePhase) ? 3
          : null;
  const summaryStep = traceStep !== null
    ? traceStep
    : snap.oms.awaitingConfirmation || snap.driver.resting ? 3
      : snap.drive.l2Degraded || snap.oms.response.active || fatigueUrgent || (fatigueCare && fatigueCareSaid) || roadComplex ? 2
        : fatigueCare || snap.oms.risk !== 'none' || snap.pending ? 1
          : 0;

  const actionDetail = snap.driver.resting
    ? isZh
      ? `已进入休息模式：座椅放松、音乐关闭、温度 ${snap.cabin.temp.toFixed(1)}°C。`
      : `Rest mode is active: seat relaxed, music off, temperature ${snap.cabin.temp.toFixed(1)}°C.`
    : snap.drive.l2Degraded
      ? isZh ? 'L2 临时降级：目标车速 ×0.85，跟车时距拉大。' : 'L2 temporarily degraded: target speed ×0.85, larger following gap.'
      : snap.oms.response.active
        ? isZh ? '保护响应生效：临时降速并拉大跟车时距。' : 'Protective response active: temporary speed cap and a larger following gap.'
        : fatigueCare && fatigueCareSaid
          ? isZh
            ? `座舱已执行：风量 ${snap.cabin.fan} 档 · 温度 ${snap.cabin.temp.toFixed(1)}°C。`
            : `Cabin action applied: fan level ${snap.cabin.fan} · temperature ${snap.cabin.temp.toFixed(1)}°C.`
          : fatigueCare
            ? isZh ? '温和关怀已触发：正在按规则调整风量与温度。' : 'Gentle care triggered: adjusting airflow and temperature by rule.'
            : snap.drive.auto
              ? isZh ? 'L2 组合辅助输出中；座舱按规则执行。' : 'L2 combined assistance is active; cabin actions follow the rules.'
              : isZh ? 'L2 待命；EVA 只做监测、提醒与座舱建议。' : 'L2 standby; EVA only monitors, advises, and adjusts the cabin.';

  const traceSteps = [
    {
      label: isZh ? '看见' : 'See',
      detail: sample?.present
        ? isZh
          ? `DMS 本地输入 · PERCLOS ${perclos.toFixed(0)}% · 视线离路 ${sample.lookAwaySec.toFixed(1)} s；OMS 为模拟事件。`
          : `Local DMS · PERCLOS ${perclos.toFixed(0)}% · eyes off road ${sample.lookAwaySec.toFixed(1)} s; OMS is simulated.`
        : isZh
          ? '等待 DMS 输入；OMS 为模拟语义事件。'
          : 'Waiting for DMS input; OMS is a simulated semantic event.',
    },
    {
      label: isZh ? '判断' : 'Decide',
      detail: decision,
    },
    {
      label: isZh ? '行动' : 'Act',
      detail: actionDetail,
    },
    {
      label: isZh ? '恢复' : 'Recover',
      detail: snap.driver.resting
        ? isZh ? '已进入休息模式，疲劳恢复后会自动退出。' : 'Rest mode is active; it exits automatically after fatigue recovers.'
        : snap.oms.awaitingConfirmation
          ? isZh ? '等待您确认乘员与道路安全，再解除临时保护。' : 'Waiting for your confirmation that occupant and road are safe before releasing temporary protection.'
          : isZh ? '暂无待解除的保护；保持监测。' : 'No protective action is waiting for release; monitoring continues.',
    },
  ];

  const submitCommand = (event: FormEvent) => {
    event.preventDefault();
    if (!command.trim()) return;
    act.command(command.trim());
    setCommand('');
    refresh();
  };

  const setAuto = () => {
    act.setAuto(!snap.drive.auto);
    refresh();
  };

  const injectOms = () => {
    act.observeOms({
      behavior: omsBehavior,
      seat: omsSeat,
      confidence: omsConfidence,
      durationSec: omsDuration,
      source: 'simulated-oms',
      observedAt: 0,
    });
    refresh();
  };

  const clearOms = () => {
    act.clearOms();
    refresh();
  };

  const chooseVideo = () => fileInputRef.current?.click();

  const loadVideo = (file: File | undefined) => {
    if (!file) return;
    void dms.startVideo(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeDrawer = () => {
    setTechnicalOpen(false);
    onClose();
  };

  return (
    <>
      <button
        type="button"
        className={`evidence-backdrop${open ? ' open' : ''}`}
        aria-label={isZh ? '关闭证据面板' : 'Close technical evidence'}
        tabIndex={-1}
        onClick={closeDrawer}
      />
      <aside
        ref={drawerRef}
        className={`evidence-drawer${open ? ' open' : ''}`}
        style={{ transform: open ? 'none' : undefined }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-labelledby="evidence-title"
      >
        <div className="evidence-head">
          <div>
            <span>{technicalOpen ? (isZh ? '技术证据 / 02' : 'TECHNICAL EVIDENCE / 02') : (isZh ? '驾驶摘要 / 01' : 'DRIVER SUMMARY / 01')}</span>
            <h2 id="evidence-title">{technicalOpen ? (isZh ? '完整证据链' : 'Full evidence chain') : (isZh ? '这一刻' : 'This moment')}</h2>
          </div>
          <button ref={closeRef} type="button" className="cinema-icon-button" onClick={closeDrawer} aria-label={isZh ? '关闭证据面板' : 'Close technical evidence'}>
            <CinemaIcon name="close" />
          </button>
        </div>

        <div className="evidence-tabs" role="tablist" aria-label={isZh ? '证据视图' : 'Evidence view'}>
          <button type="button" role="tab" id="evidence-tab-summary" aria-selected={!technicalOpen} aria-controls="evidence-summary" onClick={() => setTechnicalOpen(false)}>
            {isZh ? '摘要' : 'Summary'}
          </button>
          <button type="button" role="tab" id="evidence-tab-technical" aria-selected={technicalOpen} aria-controls="evidence-technical" onClick={() => setTechnicalOpen(true)}>
            {isZh ? '技术细节' : 'Technical details'}
          </button>
        </div>

        <section className="evidence-human-summary" id="evidence-summary" role="tabpanel" aria-labelledby="evidence-tab-summary" hidden={technicalOpen} aria-label={isZh ? '当前状态摘要' : 'Current state summary'}>
          <div className="evidence-moment-status" data-risk={snap.oms.risk}>
            <span>{isZh ? '当前状态' : 'CURRENT STATUS'}</span>
            <h3>{decision}</h3>
            <p>{currentMoment}</p>
            {snap.oms.awaitingConfirmation && <button type="button" className="evidence-confirm" onClick={onConfirmSafety}>{isZh ? '确认乘员与道路安全' : 'Confirm occupant and road are safe'}</button>}
          </div>
          <ol className="evidence-trace" aria-label={isZh ? '看见、判断、行动、恢复' : 'See, decide, act, recover'}>
            {traceSteps.map((step, index) => {
              const state = index < summaryStep ? 'done' : index === summaryStep ? 'active' : 'idle';
              return (
                <li key={step.label} data-state={state}>
                  <span className="evidence-trace-marker" aria-hidden="true">{state === 'done' ? '✓' : `0${index + 1}`}</span>
                  <div className="evidence-trace-copy">
                    <div className="evidence-trace-head">
                      <b>{step.label}</b>
                      <small>{state === 'done' ? (isZh ? '已完成' : 'DONE') : state === 'active' ? (isZh ? '进行中' : 'ACTIVE') : (isZh ? '待开始' : 'IDLE')}</small>
                    </div>
                    <p>{step.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="evidence-key-numbers">
            <div><span>PERCLOS</span><b>{sample?.present ? `${perclos.toFixed(0)}%` : '—'}</b></div>
            <div><span>{isZh ? '视线离路' : 'EYES OFF ROAD'}</span><b>{sample?.present ? `${sample.lookAwaySec.toFixed(1)} s` : '—'}</b></div>
            <div><span>L2</span><b>{snap.drive.auto ? (isZh ? '辅助中' : 'ACTIVE') : (isZh ? '待命' : 'STANDBY')}</b></div>
          </div>

          <div className="evidence-source-card" aria-label={isZh ? '证据来源' : 'Evidence sources'}>
            <div><span>DMS</span><b>{sourceLabel}</b></div>
            <div><span>OMS</span><b>{isZh ? '模拟语义事件' : 'Simulated semantic event'}</b></div>
            <div><span>L2</span><b>{isZh ? '组合辅助 · 驾驶员负责' : 'Combined assistance · driver responsible'}</b></div>
          </div>

          <p className="evidence-human-boundary">{isZh
            ? 'DMS 在本地处理 · OMS 为模拟事件 · L2 仅提供组合辅助，驾驶员始终负责并可接管。'
            : 'DMS is processed locally · OMS is simulated · L2 provides combined assistance only; the driver remains responsible and can take over.'}</p>

          <div className="evidence-recent" aria-label={isZh ? '最近事件' : 'Recent events'}>
            <div className="evidence-recent-head">
              <span>{isZh ? '最近事件' : 'RECENT EVENTS'}</span>
              <small>{recentAlerts.length ? `${Math.min(recentAlerts.length, 3)} / ${recentAlerts.length}` : (isZh ? '暂无' : 'NONE')}</small>
            </div>
            {recentAlerts.length ? (
              <div className="evidence-recent-list">
                {recentAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} data-level={alert.level}>
                    <span>{isZh ? ALERT_LABEL_ZH[alert.level] : ALERT_LABEL[alert.level]}</span>
                    <p>{isZh ? localizeEvaText(alert.text) : alert.text}</p>
                    <small>{alert.t.toFixed(1)}′</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="evidence-recent-empty">{isZh ? '还没有事件；EVA 正在持续监测。' : 'No events yet; EVA is monitoring.'}</p>
            )}
          </div>

          <button type="button" className="evidence-tech-cta" onClick={() => setTechnicalOpen(true)}>
            <span>{isZh ? '查看原始帧、指标与规则表' : 'Inspect raw frames, metrics and rules'}</span>
            <span aria-hidden="true">→</span>
          </button>
        </section>

        <div className="evidence-technical" id="evidence-technical" role="tabpanel" aria-labelledby="evidence-tab-technical" hidden={!technicalOpen}>
        <div className="evidence-chain" aria-label={isZh ? '感知、推理、执行证据链' : 'Active evidence chain: perception to reasoning to execution'}>
          <div><i>01</i><span>{isZh ? '感知' : 'Perception'}</span><b>{sourceLabel}</b></div>
          <em aria-hidden="true">→</em>
          <div><i>02</i><span>{isZh ? '推理' : 'Reasoning'}</span><b>{decision}</b></div>
          <em aria-hidden="true">→</em>
          <div><i>03</i><span>{isZh ? '执行' : 'Execution'}</span><b>{snap.drive.l2Degraded ? (isZh ? '安全响应' : 'Safety response') : (isZh ? '组合辅助输出' : 'Coordinated output')}</b></div>
        </div>

        <div className="evidence-boundary-card">
          <div><span>{isZh ? 'DMS 来源' : 'DMS SOURCE'}</span><b>{sourceLabel}</b></div>
          <div><span>{isZh ? 'OMS 来源' : 'OMS SOURCE'}</span><b>{isZh ? '模拟语义事件' : 'Simulated semantic event'}</b></div>
          <div><span>{isZh ? '驾驶环境' : 'DRIVING ENVIRONMENT'}</span><b>{isZh ? '模拟车辆状态' : 'Simulated vehicle state'}</b></div>
          <div><span>{isZh ? '车辆配置' : 'VEHICLE CONFIGURATION'}</span><b>{isZh ? '左舵 · 驾驶员位于左前方' : 'Left-hand drive · driver front left'}</b></div>
          <p>{isZh ? '实时摄像头与所选视频帧只在当前浏览器内处理。OMS 和驾驶环境均为模拟数据；不上传或存储原始舱内视频。' : 'Live camera and selected video frames stay inside this browser. OMS and the driving environment are transparently simulated; no raw cabin video is uploaded or stored.'}</p>
        </div>

        <div className="evidence-scroll">
          <div className="evidence-workbench">
          <section className="evidence-column" data-stage="perception" aria-labelledby="evidence-perception-title">
            <header className="evidence-column-title"><span>01 / {isZh ? '输入' : 'INPUT'}</span><h3 id="evidence-perception-title">{isZh ? '感知' : 'Perception'}</h3></header>
            <div className="evidence-section-head">
              <h3>{isZh ? '驾驶员监测' : 'Driver Monitoring'}</h3>
              <span data-state={dms.mode}>{dms.status.kind === 'loading' ? (isZh ? '正在加载模型' : 'Loading model') : sourceLabel}</span>
            </div>
            <div className="evidence-video" data-source={dms.mode}>
              <video
                ref={dms.videoRef}
                playsInline
                muted
                controls={['video', 'authorized-video'].includes(dms.mode)}
                style={{ display: ['model', 'video', 'authorized-video'].includes(dms.mode) ? 'block' : 'none' }}
                aria-label={dms.mode === 'video' ? (isZh ? '所选本地驾驶员视频' : 'Selected local driver video') : (isZh ? '驾驶员摄像头画面' : 'Driver camera feed')}
              />
              <canvas ref={dms.canvasRef} style={{ display: ['model', 'video', 'authorized-video'].includes(dms.mode) ? 'block' : 'none' }} aria-hidden="true" />
              {!['model', 'video', 'authorized-video'].includes(dms.mode) && (
                <div className="evidence-video-empty">
                  <CinemaIcon name={['sim', 'replay'].includes(dms.mode) ? 'simulation' : 'camera'} size={28} />
                  <strong>{dms.mode === 'video' ? (isZh ? '所选视频使用本地 DMS 推理链路' : 'The selected local video uses the on-device DMS pipeline') : dms.mode === 'sim' ? (isZh ? '模拟信号经过相同的指标处理链路' : 'Simulation is running through the real metrics pipeline') : dms.mode === 'replay' ? (isZh ? '回放数据使用相同的 DMS 证据链路' : 'Replay fallback keeps the same DMS evidence path') : (isZh ? '摄像头尚未启用' : 'Camera is not active')}</strong>
                  <span>{isZh ? '眨眼 · PERCLOS · 头部姿态 · 视线离路 · 情绪' : 'Blinks · PERCLOS · Head pose · Eyes off road · Emotion'}</span>
                </div>
              )}
            </div>
            <div className="evidence-actions">
              <button type="button" aria-pressed={dms.mode === 'model'} onClick={() => void dms.startModel()}><CinemaIcon name="camera" />{isZh ? '实时 DMS' : 'Live DMS'}</button>
              <button type="button" aria-pressed={dms.mode === 'video'} onClick={chooseVideo}><CinemaIcon name="upload" />{isZh ? '上传视频' : 'Upload Video'}</button>
              <button type="button" onClick={dms.stopAll} disabled={dms.mode === 'off'}>{isZh ? '停止' : 'Stop'}</button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,.mp4,.m4v,.mov,.webm,.ogv,.ogg"
                hidden
                onChange={(event) => loadVideo(event.currentTarget.files?.[0])}
              />
            </div>
            {['video', 'authorized-video'].includes(dms.mode) && dms.localVideo && (
              <div className="evidence-video-source" role="status">
                <span>{dms.mode === 'authorized-video' ? (isZh ? '授权素材 · 本地推理' : 'AUTHORIZED ASSET · LOCAL INFERENCE') : (isZh ? '本地文件 · 设备内处理' : 'LOCAL FILE · ON-DEVICE')}</span>
                <strong title={dms.localVideo.name}>{dms.localVideo.name}</strong>
                <small>{formatLocalVideoSize(dms.localVideo.size)}</small>
              </div>
            )}
            {dms.status.kind === 'loading' && <p className="evidence-status">{dms.status.detail}</p>}
            {dms.inputError && <p className="evidence-status error" role="alert">{dms.inputError}</p>}
            {dms.status.kind === 'error' && <p className="evidence-status error" role="alert">{isZh ? `DMS 输入不可用：${dms.status.detail}。请选择其他本地输入，或重启完整演示以使用已标记的回放数据。` : `DMS input unavailable: ${dms.status.detail}. Choose another local input, or restart the Full Demo to use its labelled replay fallback.`}</p>}

            <div className="evidence-metrics">
              <Metric label="EAR" value={sample ? sample.ear.toFixed(2) : '—'} />
              <Metric label="PERCLOS" value={sample ? `${perclos.toFixed(0)}%` : '—'} tone={perclos >= 35 ? 'danger' : perclos >= 25 ? 'warn' : 'normal'} />
              <Metric label={isZh ? '眨眼频率' : 'BLINK RATE'} value={sample ? `${sample.blinkPm.toFixed(0)} / min` : '—'} />
              <Metric label={isZh ? '视线离路' : 'EYES OFF ROAD'} value={sample ? `${sample.lookAwaySec.toFixed(1)} s` : '—'} tone={sample && sample.lookAwaySec >= 4 ? 'danger' : sample && sample.lookAwaySec >= 2 ? 'warn' : 'normal'} />
              <Metric label="YAW / PITCH" value={sample ? `${sample.yaw.toFixed(0)}° / ${sample.pitch.toFixed(0)}°` : '—'} />
              <Metric label={isZh ? '面部状态' : 'FACE STATE'} value={sample ? (isZh ? EMOTION_LABEL_ZH[sample.emotion] : EMOTION_LABEL[sample.emotion]) : '—'} tone={sample && ['angry', 'drowsy'].includes(sample.emotion) ? 'warn' : 'normal'} />
              <Metric label={isZh ? '检测到驾驶员' : 'DRIVER PRESENT'} value={sample ? (sample.present ? (isZh ? '是' : 'Yes') : (isZh ? '否' : 'No')) : '—'} tone={sample && !sample.present ? 'danger' : 'normal'} />
            </div>

            <div className="evidence-section-head"><h3>{isZh ? '乘员监测' : 'Occupant Monitoring'}</h3><span>{isZh ? '23 种语义状态 · 模拟' : '23 SEMANTIC STATES · SIMULATED'}</span></div>
            <div className="oms-seat-map" aria-label={isZh ? 'OMS 座位图' : 'OMS seat map'}>
              {OMS_SEATS.map((seat) => (
                <button key={seat} type="button" aria-pressed={omsSeat === seat} data-seat={seat} onClick={() => setOmsSeat(seat)}>
                  <span>{seatLabel(seat, isZh)}</span>
                  <i data-risk={snap.oms.active?.seat === seat ? snap.oms.risk : 'none'} />
                </button>
              ))}
            </div>
            <div className="oms-simulator">
              <label>{isZh ? '行为' : 'Behavior'}<select value={omsBehavior} onChange={(event) => setOmsBehavior(event.target.value as OmsBehavior)}>{OMS_BEHAVIORS.map((behavior) => <option key={behavior} value={behavior}>{behaviorLabel(behavior, isZh)}</option>)}</select></label>
              <label>{isZh ? '模拟事件参数' : 'Simulated event parameter'} <b>{Math.round(omsConfidence * 100)}%</b><input type="range" min="0" max="1" step="0.01" value={omsConfidence} onChange={(event) => setOmsConfidence(Number(event.target.value))} /></label>
              <label>{isZh ? '持续时间' : 'Duration'} <b>{omsDuration.toFixed(1)} s</b><input type="range" min="0" max="8" step="0.1" value={omsDuration} onChange={(event) => setOmsDuration(Number(event.target.value))} /></label>
              <div><button type="button" onClick={injectOms}>{isZh ? '注入模拟事件' : 'Inject event'}</button><button type="button" onClick={clearOms}>{isZh ? '标记已恢复' : 'Mark clear'}</button></div>
            </div>

          </section>

          <section className="evidence-column" data-stage="reasoning" aria-labelledby="evidence-reasoning-title">
            <header className="evidence-column-title"><span>02 / {isZh ? '融合' : 'FUSION'}</span><h3 id="evidence-reasoning-title">{isZh ? '推理' : 'Reasoning'}</h3></header>
            <div className="reasoning-summary">
              <span>{isZh ? '当前判断' : 'CURRENT DECISION'}</span>
              <h3>{decision}</h3>
              <p>{isZh ? 'EVA 将乘员模拟事件与驾驶员本地 DMS 证据关联，再依据明确的安全阈值作出响应，不虚构 AI 置信度。' : 'EVA correlates the occupant event with local DMS evidence, then applies explicit safety thresholds without inventing a decision confidence.'}</p>
            </div>
            <div className="evidence-section-head"><h3>{isZh ? 'OMS × DMS 关联' : 'OMS × DMS Correlation'}</h3><span>{snap.momentTrace.phase.toUpperCase()}</span></div>
            <div className="evidence-metrics">
              <Metric label={isZh ? 'OMS 风险' : 'OMS RISK'} value={snap.oms.stale ? (isZh ? '数据过期 · 未确认恢复' : 'Stale · not clear') : isZh ? ({ none: '无', care: '关注', warning: '警告', urgent: '紧急' } as Record<OmsRisk, string>)[snap.oms.risk] : snap.oms.risk.toUpperCase()} tone={snap.oms.risk === 'urgent' ? 'danger' : snap.oms.risk === 'warning' ? 'warn' : 'normal'} />
              <Metric label={isZh ? '座位 / 行为' : 'SEAT / BEHAVIOR'} value={snap.oms.active ? `${seatLabel(snap.oms.active.seat, isZh)} · ${behaviorLabel(snap.oms.active.behavior, isZh)}` : isZh ? '当前无事件' : 'No active event'} />
              <Metric label={isZh ? '持续时间阈值' : 'DURATION THRESHOLD'} value={`${snap.oms.active?.durationSec.toFixed(1) ?? '—'} / ${P.oms.outsideUrgentSec.toFixed(1)} s`} tone={snap.oms.risk === 'urgent' ? 'danger' : 'normal'} />
              <Metric label={isZh ? '疲劳排除依据' : 'FATIGUE EXCLUSION'} value={sample?.present && perclos < P.perclosTh.warn * 100 ? (isZh ? 'PERCLOS 正常' : 'PERCLOS normal') : (isZh ? '等待证据' : 'Awaiting evidence')} />
            </div>
            <div className="evidence-section-head"><h3>{isZh ? '疲劳融合' : 'Fatigue Fusion'}</h3><span>{isZh ? '取较强信号' : 'TAKE THE STRONGER'}</span></div>
            <div className="evidence-metrics">
              <Metric label={isZh ? '驾驶负荷信号' : 'WORKLOAD CHANNEL'} value={`${Math.round(snap.driver.simFatigue)}%`} tone={snap.driver.simFatigue >= 85 ? 'danger' : snap.driver.simFatigue >= 60 ? 'warn' : 'normal'} />
              <Metric label={isZh ? '视觉信号' : 'VISION CHANNEL'} value={sample?.present ? `${Math.round(visionFatigue)}%` : '—'} tone={visionFatigue >= 85 ? 'danger' : visionFatigue >= 60 ? 'warn' : 'normal'} />
              <Metric label={isZh ? '融合疲劳值' : 'FUSED FATIGUE'} value={`${Math.round(snap.driver.fatigue)}%`} tone={snap.driver.fatigue >= 85 ? 'danger' : snap.driver.fatigue >= 60 ? 'warn' : 'normal'} />
              <Metric label={isZh ? '关怀 / 紧急阈值' : 'CARE / URGENT'} value={`${P.fatigueTh.care} / ${P.fatigueTh.urgent}`} />
            </div>

            <div className="evidence-section-head"><h3>{isZh ? '道路情境' : 'Road Context'}</h3><span>{roadComplexity} / {isZh ? '3 项因素' : '3 FACTORS'}</span></div>
            <div className="evidence-list">
              <div className="evidence-row"><div><b>{isZh ? '降雨' : 'Rain'}</b><span>{isZh ? '影响视野与目标车速' : 'Visibility and target-speed trim'}</span></div><small>{snap.drive.rain ? (isZh ? '生效' : 'ACTIVE') : (isZh ? '无' : 'CLEAR')}</small></div>
              <div className="evidence-row"><div><b>{isZh ? '夜间' : 'Night'}</b><span>{isZh ? '影响照明与谨慎显示' : 'Lighting and cautious display state'}</span></div><small>{snap.drive.night ? (isZh ? '生效' : 'ACTIVE') : (isZh ? '白天' : 'DAY')}</small></div>
              <div className="evidence-row"><div><b>{isZh ? '拥堵' : 'Congestion'}</b><span>{isZh ? '娱乐内容屏蔽阈值' : 'Entertainment block threshold'}</span></div><small>{snap.drive.road === 'congested' ? (isZh ? '生效' : 'ACTIVE') : (isZh ? '无' : 'CLEAR')}</small></div>
              <div className="evidence-row"><div><b>{isZh ? '判断阈值' : 'Decision threshold'}</b><span>{isZh ? `达到 ${P.complexityBlock} 项因素时组合响应` : `Coordinated response at factor ${P.complexityBlock}`}</span></div><small>{roadComplexity >= P.complexityBlock ? (isZh ? '谨慎' : 'CAUTIOUS') : (isZh ? '正常' : 'NORMAL')}</small></div>
            </div>
          </section>

          <section className="evidence-column" data-stage="execution" aria-labelledby="evidence-execution-title">
            <header className="evidence-column-title"><span>03 / {isZh ? '输出' : 'OUTPUT'}</span><h3 id="evidence-execution-title">{isZh ? '执行' : 'Execution'}</h3></header>
            <div className="execution-l2">
              <div><span>{isZh ? 'L2 組合輔助' : 'L2 ASSISTANCE'}</span><b>{snap.drive.l2Degraded ? (isZh ? '安全降級' : 'Safety degraded') : snap.drive.auto ? (isZh ? '組合輔助已啟用' : 'Combined assistance active') : (isZh ? '待命' : 'Standby')}</b></div>
              <button type="button" aria-pressed={snap.drive.auto} onClick={setAuto}>{snap.drive.auto ? (isZh ? '關閉 L2' : 'Disable L2') : (isZh ? '启用 L2' : 'Enable L2')}</button>
              <p>{isZh ? 'L2 仅辅助车道内转向与加速。驾驶员始终负责驾驶，必须持续观察道路并随时准备接管。' : 'L2 only assists with lane-level steering and acceleration. The driver remains responsible, must supervise continuously and be ready to take over.'}</p>
            </div>

            <div className="evidence-section-head"><h3>{isZh ? '保护响应' : 'Protective Response'}</h3><span>{snap.oms.response.active ? (isZh ? '生效' : 'ACTIVE') : snap.oms.awaitingConfirmation ? (isZh ? '核验中' : 'VERIFYING') : (isZh ? '待命' : 'STANDBY')}</span></div>
            <div className="evidence-metrics">
              <Metric label={isZh ? '提醒对象' : 'REMINDER TARGET'} value={snap.oms.risk !== 'none' || snap.oms.awaitingConfirmation ? (isZh ? '右后座乘员' : 'Rear-right passenger') : (isZh ? '无' : 'None')} />
              <Metric label={isZh ? '速度上限' : 'SPEED CAP'} value={snap.oms.response.speedCapKmh === null ? (isZh ? '无临时限速' : 'No temporary cap') : `${snap.oms.response.speedCapKmh} km/h`} tone={snap.oms.response.active ? 'warn' : 'normal'} />
              <Metric label={isZh ? '跟车距离' : 'FOLLOWING GAP'} value={isZh ? snap.oms.response.followingGap === 'extended' ? '已加大' : '标准' : snap.oms.response.followingGap.toUpperCase()} tone={snap.oms.response.followingGap === 'extended' ? 'warn' : 'normal'} />
              <Metric label={isZh ? '驾驶员确认' : 'DRIVER CONFIRMATION'} value={snap.oms.awaitingConfirmation ? (isZh ? '需要确认' : 'Required') : snap.momentTrace.record?.verification.driverConfirmed ? (isZh ? '已确认' : 'Confirmed') : (isZh ? '未请求' : 'Not requested')} tone={snap.oms.awaitingConfirmation ? 'warn' : 'normal'} />
            </div>
            {snap.oms.awaitingConfirmation && <button type="button" className="evidence-confirm" onClick={onConfirmSafety}>{isZh ? '确认乘员与道路安全' : 'Confirm occupant and road are safe'}</button>}

            <div className="evidence-section-head"><h3>{isZh ? '座舱执行器' : 'Cabin Actuators'}</h3><span>{isZh ? '实时状态' : 'LIVE'}</span></div>
            <dl className="actuator-grid">
              <div><dt>{isZh ? '温度' : 'Temperature'}</dt><dd>{snap.cabin.temp.toFixed(1)} ℃</dd></div>
              <div><dt>{isZh ? '风量' : 'Fan'}</dt><dd>{isZh ? '档位' : 'Level'} {snap.cabin.fan}</dd></div>
              <div><dt>{isZh ? '音频' : 'Audio'}</dt><dd>{snap.cabin.entertainmentBlocked ? (isZh ? '已屏蔽' : 'Blocked') : isZh ? ({ Soft: '轻音乐', Upbeat: '活力音乐', News: '新闻', Off: '关闭' } as Record<string, string>)[snap.cabin.music] ?? snap.cabin.music : snap.cabin.music}</dd></div>
              <div><dt>{isZh ? '座椅按摩' : 'Seat massage'}</dt><dd>{snap.cabin.seatMassage ? (isZh ? '开启' : 'On') : (isZh ? '关闭' : 'Off')}</dd></div>
              <div><dt>{isZh ? '氛围灯' : 'Ambient light'}</dt><dd>{isZh ? ({ warm: '暖色', cool: '冷色', teal: '青绿色', off: '关闭' } as Record<string, string>)[snap.cabin.ambient] ?? snap.cabin.ambient : snap.cabin.ambient}</dd></div>
              <div><dt>{isZh ? '阅读灯' : 'Reading light'}</dt><dd>{isZh ? snap.cabin.readingLight ? '开启' : '关闭' : snap.cabin.readingLight ? 'On' : 'Off'}</dd></div>
            </dl>

            <form className="evidence-command" onSubmit={submitCommand}>
              <label htmlFor="eva-command">{isZh ? '对 EVA 说话' : 'Talk to EVA'}</label>
              <div><input id="eva-command" value={command} onChange={(event) => setCommand(event.target.value)} placeholder={isZh ? '试试：我有点冷，打开按摩' : 'Try: I am cold, turn on massage'} /><button type="submit">{isZh ? '发送' : 'Send'}</button></div>
            </form>
            {snap.pending && (
              <div className="evidence-pending">
                <b>{snap.pending.prompt}</b>
                <div>{snap.pending.options.map((option) => (
                  <button key={option.key} type="button" onClick={() => { act.reply(option.key); refresh(); }}>{isZh ? localizeEvaText(option.label) : option.label}</button>
                ))}</div>
              </div>
            )}

            <div className="evidence-section-head"><h3>{isZh ? '告警记录' : 'Alert Log'}</h3><span>{alerts.length} {isZh ? '条告警' : 'ALERTS'}</span></div>
            <div className="alert-trace" role="log">
              {alerts.length ? alerts.map((alert) => (
                <div key={alert.id} data-level={alert.level}><b>{isZh ? ALERT_LABEL_ZH[alert.level] : ALERT_LABEL[alert.level]}</b><p>{isZh ? localizeEvaText(alert.text) : alert.text}</p><small>{alert.t.toFixed(1)}′</small></div>
              )) : <p className="evidence-empty">{isZh ? '暂无告警。' : 'No alerts.'}</p>}
            </div>

            <div className="evidence-section-head"><h3>{isZh ? '显示与语音' : 'Display and Voice'}</h3><span>{isZh ? '无障碍' : 'ACCESSIBILITY'}</span></div>
            <div className="preference-actions">
              <button type="button" aria-pressed={prefs.voice} onClick={prefs.toggleVoice}><CinemaIcon name="voice" />{isZh ? '语音播报' : 'Voice'} {prefs.voice ? (isZh ? '开' : 'On') : (isZh ? '关' : 'Off')}</button>
              <button type="button" aria-pressed={prefs.highContrast} onClick={prefs.toggleHighContrast}><CinemaIcon name="contrast" />{isZh ? '高对比度' : 'High contrast'} {prefs.highContrast ? (isZh ? '开' : 'On') : (isZh ? '关' : 'Off')}</button>
              <button type="button" onClick={() => prefs.zoom(-1)} aria-label={isZh ? '缩小文字' : 'Decrease text size'}>A−</button>
              <button type="button" onClick={() => prefs.zoom(0)} aria-label={isZh ? '重置文字大小' : 'Reset text size'}>A</button>
              <button type="button" onClick={() => prefs.zoom(1)} aria-label={isZh ? '放大文字' : 'Increase text size'}>A+</button>
            </div>
          </section>
          </div>
        </div>
        </div>
      </aside>
    </>
  );
}
