import type { MomentTraceRecord } from '../../core';
import type { UiLanguage } from '../locale';
import { localizeEvaText } from '../evaCopyZh';

function statusLabel(value: boolean, yes: string, no: string) {
  return <span data-state={value ? 'ok' : 'waiting'}>{value ? yes : no}</span>;
}

export default function MomentTraceArtifact({ record, language }: { record: MomentTraceRecord; language: UiLanguage }) {
  const isZh = language === 'zh';
  const dms = record.input.dms;
  const oms = record.input.oms;
  return (
    <section className="moment-trace-artifact" aria-labelledby="moment-trace-title">
      <header>
        <div>
          <span>{isZh ? 'OMS 风险 / 01' : 'OMS RISK / 01'}</span>
          <h2 id="moment-trace-title">MomentTrace</h2>
        </div>
        <strong>{isZh ? '闭环记录' : 'CLOSED LOOP'}</strong>
      </header>

      <div className="moment-trace-grid">
        <article>
          <i>01</i><h3>{isZh ? '输入' : 'Input'}</h3>
          <p><b>OMS</b>{oms ? `${isZh ? '右后座' : 'Rear-right'} · ${isZh ? oms.behavior.replaceAll('-', ' ') : oms.behavior.replaceAll('-', ' ')} · ${oms.durationSec.toFixed(1)} s` : isZh ? '当前无事件' : 'No active event'}</p>
          <p><b>DMS</b>{dms ? `${isZh ? '偏航' : 'Yaw'} ${dms.yaw.toFixed(0)}° · ${isZh ? '视线离路' : 'eyes off'} ${dms.lookAwaySec.toFixed(1)} s · PERCLOS ${(dms.perclos * 100).toFixed(0)}%` : isZh ? '无样本' : 'No sample'}</p>
        </article>
        <article>
          <i>02</i><h3>{isZh ? '判断' : 'Decision'}</h3>
          <p>{record.decision ? (isZh ? localizeEvaText(record.decision) : record.decision) : isZh ? '等待关联证据。' : 'Awaiting correlated evidence.'}</p>
        </article>
        <article>
          <i>03</i><h3>{isZh ? '行动' : 'Action'}</h3>
          <ul>{record.actions.length ? record.actions.map((action) => <li key={action}>{isZh ? localizeEvaText(action) : action}</li>) : <li>{isZh ? '未执行车辆动作' : 'No vehicle action executed'}</li>}</ul>
        </article>
        <article>
          <i>04</i><h3>{isZh ? '核验' : 'Verification'}</h3>
          <p>{statusLabel(record.verification.omsClear, isZh ? 'OMS 乘员已恢复' : 'OMS occupant clear', isZh ? 'OMS 等待乘员恢复' : 'OMS awaiting clear')}</p>
          <p>{statusLabel(record.verification.dmsForward, isZh ? 'DMS 视线朝前' : 'DMS gaze forward', isZh ? 'DMS 等待视线朝前' : 'DMS awaiting forward gaze')}</p>
          <p>{statusLabel(record.verification.driverConfirmed, isZh ? '驾驶员已确认' : 'Driver confirmed', isZh ? '需要驾驶员确认' : 'Driver confirmation required')}</p>
        </article>
      </div>

      <footer>
        <span>DMS · {record.sources.dms === 'live-local' ? (isZh ? '本地实时' : 'LIVE LOCAL') : record.sources.dms === 'local-video' ? (isZh ? '本地视频' : 'LOCAL VIDEO') : (isZh ? '回放数据' : 'REPLAY FALLBACK')}</span>
        <span>{isZh ? 'OMS · 模拟语义事件' : 'OMS · SIMULATED SEMANTIC EVENT'}</span>
        <span>{isZh ? '不存储原始舱内视频' : 'NO RAW CABIN VIDEO STORED'}</span>
      </footer>
    </section>
  );
}
