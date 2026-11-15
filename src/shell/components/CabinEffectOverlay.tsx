import type { CabinState } from '../../core';
import type { UiLanguage } from '../locale';

export default function CabinEffectOverlay({
  visible,
  cabin,
  language,
}: {
  visible: boolean;
  cabin: CabinState;
  language: UiLanguage;
}) {
  const isZh = language === 'zh';
  return (
    <aside
      className="cabin-effect-overlay"
      data-visible={visible}
      aria-hidden={!visible}
      aria-label={isZh ? '座舱空调响应' : 'Cabin climate response'}
    >
      <header>
        <span>{isZh ? '座舱响应' : 'CABIN RESPONSE'}</span>
        <b>{isZh ? '本地执行' : 'LOCAL ACTUATION'}</b>
      </header>
      <div className="cabin-effect-route" aria-hidden="true">
        <i /><i /><i /><i />
      </div>
      <div className="cabin-effect-values">
        <div>
          <small>{isZh ? '风量' : 'AIRFLOW'}</small>
          <strong>{isZh ? '1 档' : 'LEVEL 1'} <em>→</em> {cabin.fan}{isZh ? ' 档' : ''}</strong>
        </div>
        <div>
          <small>{isZh ? '温度设定' : 'THERMAL SETPOINT'}</small>
          <strong>22.5 <em>→</em> {cabin.temp.toFixed(1)}°C</strong>
        </div>
      </div>
      <footer><i aria-hidden="true" /> {isZh ? '舒适响应已执行' : 'COMFORT RESPONSE APPLIED'}</footer>
    </aside>
  );
}
