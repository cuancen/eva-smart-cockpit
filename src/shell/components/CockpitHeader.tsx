import type { CockpitState } from '../../core';
import type { DemoStep, DemoTransportState } from '../autoDemo';
import type { DemoCue } from '../autoDemo';
import EvaAvatar from '../../shared/EvaAvatar';
import type { EvaExpression } from '../../shared/evaExpression';
import CinemaIcon from './CinemaIcon';
import type { ExperienceId } from './CinemaControls';
import type { UiLanguage } from '../locale';

const TRANSPORT_LABEL: Record<DemoTransportState, string> = {
  ready: 'READY',
  running: 'DEMO RUNNING',
  paused: 'SCENE FROZEN',
  completed: 'DEMO COMPLETE',
};

const TITLE_ZH: Partial<Record<DemoCue, string>> = {
  commute: '日常通勤', 'commute-personalized': '个性化座舱',
  'fatigue-monitoring': '疲劳守护 · 状态监测', 'fatigue-evidence': '疲劳守护 · 本地证据',
  'fatigue-care': '疲劳守护 · 温和关怀', 'fatigue-urgent': '疲劳守护 · 安全提醒', 'fatigue-rest': '疲劳守护 · 休息引导',
  'complex-roads': '复杂路况 · 天气感知', 'complex-braking': '复杂路况 · 协同减速', 'conditions-ease': '复杂路况 · 状态恢复',
  'cabin-memory': '座舱记忆', 'cabin-memory-assist': '座舱记忆 · 辅助查找', 'cabin-memory-verify': '座舱记忆 · 安全确认',
  'oms-cruise': 'OMS MomentTrace · 准备', 'oms-candidate': 'OMS MomentTrace · 事件识别', 'oms-prompt': 'OMS MomentTrace · 驾驶员提示',
  'oms-correlate': 'OMS MomentTrace · DMS 关联', 'oms-decide': 'OMS MomentTrace · 规则判断', 'oms-urgent': 'OMS MomentTrace · L2 组合辅助',
  'oms-clear': 'OMS MomentTrace · 乘员恢复', 'oms-verify': 'OMS MomentTrace · 安全确认', 'moment-trace': 'MomentTrace · 处理记录', completed: '体验已完成',
};

const PHASE_BY_CUE: Record<DemoCue, number> = {
  'oms-cruise': 0,
  'oms-candidate': 0,
  'oms-prompt': 0,
  'oms-correlate': 1,
  'oms-decide': 2,
  'oms-urgent': 3,
  'oms-clear': 3,
  'oms-verify': 4,
  'moment-trace': 4,
  commute: 0,
  'commute-personalized': 0,
  'fatigue-monitoring': 1,
  'fatigue-evidence': 1,
  'fatigue-care': 1,
  'fatigue-urgent': 1,
  'fatigue-rest': 1,
  'complex-roads': 2,
  'complex-braking': 2,
  'conditions-ease': 2,
  'voice-command': 2,
  'cabin-memory': 2,
  'cabin-memory-assist': 3,
  'cabin-memory-verify': 3,
  completed: 4,
};

export function progressPhaseOf(experience: ExperienceId, step: DemoStep | null, cue: DemoCue | null): number {
  if (experience === 'full-demo' && step) {
    if (step.i <= 2) return 0;
    if (step.i <= 7) return 1;
    if (step.i <= 10) return 2;
    if (step.i <= 13) return 3;
    return 4;
  }
  return cue ? PHASE_BY_CUE[cue] : -1;
}

export default function CockpitHeader({
  snap,
  step,
  cue,
  expression,
  transport,
  experience,
  language,
  onLanguageChange,
  onOpenEvidence,
}: {
  snap: CockpitState;
  step: DemoStep | null;
  cue: DemoCue | null;
  expression: EvaExpression;
  transport: DemoTransportState;
  experience: ExperienceId;
  language: UiLanguage;
  onLanguageChange: (language: UiLanguage) => void;
  onOpenEvidence: () => void;
}) {
  const currentPhase = progressPhaseOf(experience, step, cue);
  const isZh = language === 'zh';
  const statusLabel = isZh
    ? ({ ready: '准备就绪', running: '演示进行中', paused: '场景已暂停', completed: '演示已完成' } as const)[transport]
    : TRANSPORT_LABEL[transport];
  return (
    <header className="cinema-header">
      <a className="cinema-brand" href="#/landing" aria-label={isZh ? '返回 EVA 介绍页' : 'Return to the EVA landing page'}>
        <EvaAvatar expression={expression} size={44} />
        <span><b>EVA</b><small>{isZh ? '智能座舱' : 'DIGITAL TWIN'}</small></span>
      </a>

      <div className="cinema-chapter" aria-live="polite">
        <small>{step ? `${String(step.i).padStart(2, '0')} / ${String(step.total).padStart(2, '0')}` : statusLabel}</small>
        <strong>{step ? (isZh ? TITLE_ZH[step.cue] ?? step.title : step.title) : (isZh ? 'EVA 座舱体验' : 'EVA experience ready')}</strong>
        <div className="cinema-act-progress" aria-label="Experience progress">
          {[0, 1, 2, 3, 4].map((phase) => {
            return <i key={phase} data-state={phase < currentPhase ? 'done' : phase === currentPhase ? 'active' : 'idle'} />;
          })}
        </div>
      </div>

      <div className="cinema-vehicle-state" aria-label={isZh ? '车辆状态' : 'Vehicle status'}>
        <span className="cinema-speed"><b>{Math.round(snap.drive.speed)}</b><small>km/h</small></span>
        <span className={`cinema-l2${snap.drive.l2Degraded ? ' danger' : snap.drive.auto ? ' on' : ''}`}>
          L2 {snap.drive.l2Degraded ? (isZh ? '已降级' : 'DEGRADED') : snap.drive.auto ? (isZh ? '辅助中' : 'ACTIVE') : (isZh ? '待命' : 'STANDBY')}
        </span>
      </div>

      <div className="cinema-language" role="group" aria-label={isZh ? '选择语言' : 'Choose language'}>
        <button type="button" aria-pressed={isZh} onClick={() => onLanguageChange('zh')}>中</button>
        <span aria-hidden="true">/</span>
        <button type="button" aria-pressed={!isZh} onClick={() => onLanguageChange('en')}>EN</button>
      </div>
      <button type="button" className="cinema-icon-button evidence-trigger" aria-label={isZh ? '打开证据工作台' : 'Open technical evidence'} onClick={onOpenEvidence}>
        <CinemaIcon name="evidence" />
        <span>{isZh ? '证据' : 'EVIDENCE'}</span>
      </button>
    </header>
  );
}
