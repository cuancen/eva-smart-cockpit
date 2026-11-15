import type { CabinMemoryItem, ContextPhase } from '../../core';
import type { CSSProperties } from 'react';
import type { UiLanguage } from '../locale';

const ITEM_ZH: Record<string, string> = {
  'parking card': '停车卡',
  'laptop bag': '电脑包',
  phone: '手机',
  'water bottle': '水杯',
};

const LOCATION_ZH: Record<string, string> = {
  'driver-side door pocket': '主驾车门储物格',
  'wireless charging pad': '无线充电板',
  'rear seat': '后排座椅',
  'cup holder': '杯架',
};

const OWNER_ZH: Record<string, string> = {
  driver: '驾驶员',
  passenger: '乘员',
};

function ageLabel(now: number, lastSeenAt: number, isZh: boolean): string {
  const age = Math.max(0, now - lastSeenAt);
  if (isZh) return age < 0.1 ? '刚刚' : `${age.toFixed(1)} 分钟前`;
  return age < 0.1 ? 'JUST NOW' : `${age.toFixed(1)} MIN AGO`;
}

export default function CabinMemoryLens({
  visible,
  phase,
  now,
  item,
  language,
}: {
  visible: boolean;
  phase: ContextPhase;
  now: number;
  item: CabinMemoryItem | null;
  language: UiLanguage;
}) {
  const isZh = language === 'zh';
  if (!item) return null;
  const itemLabel = isZh ? ITEM_ZH[item.label] ?? item.label : item.label;
  const locationLabel = isZh ? LOCATION_ZH[item.location] ?? item.location : item.location;
  const ownerLabel = isZh ? OWNER_ZH[item.owner] ?? item.owner : item.owner.toUpperCase();
  return (
    <aside
      className="cabin-memory-lens"
      data-phase={phase}
      data-visible={visible}
      aria-hidden={!visible}
      aria-label={isZh ? '座舱记忆语义证据' : 'Cabin Memory semantic evidence'}
    >
      <header>
        <span>{isZh ? '座舱记忆 / 01' : 'MEMORY / 01'}</span>
        <b>{phase === 'verified' ? (isZh ? '位置已确认' : 'LOCATION VERIFIED') : (isZh ? '语义匹配' : 'SEMANTIC MATCH')}</b>
      </header>
      <div className="memory-object-row">
        <div className="memory-object-glyph" aria-hidden="true"><i /></div>
        <div>
          <small>{isZh ? '物品' : 'OBJECT'}</small>
          <strong>{itemLabel}</strong>
          <p>{locationLabel}</p>
        </div>
        <div className="memory-confidence">
          <small>{isZh ? '置信度' : 'CONFIDENCE'}</small>
          <output>{Math.round(item.confidence * 100)}%</output>
        </div>
      </div>
      <div className="memory-confidence-track" aria-label={isZh ? `语义匹配置信度 ${Math.round(item.confidence * 100)}%` : `Semantic match confidence ${Math.round(item.confidence * 100)} percent`}>
        <i style={{ '--memory-confidence': `${Math.round(item.confidence * 100)}%` } as CSSProperties} />
      </div>
      <div className="memory-data-flow" aria-label={isZh ? '视线、物品、位置之间的关系' : 'Gaze to object to location relationship'}>
        <span>{isZh ? '视线' : 'GAZE'}</span><i /><span>{isZh ? '物品' : 'OBJECT'}</span><i /><span>{isZh ? '位置' : 'LOCATION'}</span>
      </div>
      <dl>
        <div><dt>{isZh ? '最后看到' : 'LAST SEEN'}</dt><dd>{ageLabel(now, item.lastSeenAt, isZh)}</dd></div>
        <div><dt>{isZh ? '所属' : 'OWNER'}</dt><dd>{ownerLabel}</dd></div>
        <div><dt>{isZh ? '重要度' : 'IMPORTANCE'}</dt><dd>{isZh ? (item.importance === 'important' ? '重要' : '普通') : item.importance.toUpperCase()}</dd></div>
        <div><dt>{isZh ? '来源' : 'SOURCE'}</dt><dd>{isZh ? '模拟事件' : 'SIMULATED EVENT'}</dd></div>
      </dl>
      <footer><i aria-hidden="true" /> {isZh ? '视觉 · 位置 · 时间 · 语义' : 'VISUAL · POSITION · TIME · SEMANTICS'}</footer>
    </aside>
  );
}
