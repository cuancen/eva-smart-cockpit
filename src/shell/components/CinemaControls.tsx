import type { DemoTransportState } from '../autoDemo';
import CinemaIcon from './CinemaIcon';
import type { UiLanguage } from '../locale';

export type ExperienceId = 'full-demo' | 'oms-trace' | 'commute' | 'fatigue' | 'complex' | 'cabin-memory';

const SCENARIO_OPTIONS: Array<{ id: ExperienceId; label: string }> = [
  { id: 'full-demo', label: 'Full Demo · 5 Experiences' },
  { id: 'oms-trace', label: 'OMS Risk · MomentTrace' },
  { id: 'commute', label: 'Daily Commute' },
  { id: 'fatigue', label: 'Fatigue Guard' },
  { id: 'complex', label: 'Complex Roads' },
  { id: 'cabin-memory', label: 'Cabin Memory Trace' },
];

const PRIMARY_LABEL: Record<DemoTransportState, string> = {
  ready: 'Start Experience',
  running: 'Pause',
  paused: 'Continue',
  completed: 'Replay MomentTrace',
};

export default function CinemaControls({
  transport,
  experience,
  preparing,
  canConfirm,
  onPrimary,
  onRestart,
  onExperience,
  language,
}: {
  transport: DemoTransportState;
  experience: ExperienceId;
  preparing?: boolean;
  canConfirm?: boolean;
  onPrimary: () => void;
  onRestart: () => void;
  onExperience: (id: ExperienceId) => void;
  language: UiLanguage;
}) {
  const primaryIcon = canConfirm ? 'check' : transport === 'running' ? 'pause' : transport === 'completed' ? 'replay' : 'play';
  const primaryLabel = preparing
    ? language === 'zh' ? '正在准备体验' : 'Preparing experience'
    : canConfirm
      ? language === 'zh' ? '确认安全' : 'Confirm safe'
      : transport === 'completed' && experience === 'full-demo'
        ? language === 'zh' ? '重播完整演示' : 'Replay Full Demo'
        : language === 'zh'
          ? ({ ready: '开始体验', running: '暂停', paused: '继续', completed: '重播 MomentTrace' } as const)[transport]
          : PRIMARY_LABEL[transport];
  const options = language === 'zh'
    ? ['完整演示 · 5 段体验', 'OMS 风险 · MomentTrace', '日常通勤', '疲劳守护', '复杂路况', '座舱记忆']
    : SCENARIO_OPTIONS.map((option) => option.label);

  return (
    <div className="cinema-controls" aria-label={language === 'zh' ? 'EVA 体验控制' : 'EVA experience controls'}>
      <button type="button" className="cinema-primary" onClick={onPrimary} disabled={preparing}>
        <CinemaIcon name={primaryIcon} />
        <span>{primaryLabel}</span>
      </button>
      <button type="button" className="cinema-icon-button" onClick={onRestart} disabled={preparing} aria-label={language === 'zh' ? '从头重播' : 'Replay from the beginning'}>
        <CinemaIcon name="replay" />
      </button>
      <label className="scenario-select">
        <span>{language === 'zh' ? '体验场景' : 'EXPERIENCE'}</span>
        <select value={experience} disabled={preparing} onChange={(event) => onExperience(event.target.value as ExperienceId)}>
          {SCENARIO_OPTIONS.map((option, index) => <option key={option.id} value={option.id}>{options[index]}</option>)}
        </select>
      </label>
    </div>
  );
}
