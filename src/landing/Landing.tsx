import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import type { UiLanguage } from '../shell/locale';
import CarModel from './CarModel';
import './landing.css';

type LandingProps = {
  language: UiLanguage;
  onLanguageChange: (language: UiLanguage) => void;
};

// GitHub Project Pages 部署在 /<repo>/ 子路径下，静态资源必须跟随 BASE_URL。
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const EVIDENCE = [
  {
    image: asset('landing/evidence-01.jpg'),
    en: ['LOCAL DMS', 'Driver evidence stays on this device', 'Selected camera or local video is processed in this browser. PERCLOS, EAR, gaze duration and head pose come from the local vision pipeline.'],
    zh: ['本地 DMS', '驾驶员证据留在本机', '选择摄像头或本地视频后，画面只在当前浏览器处理。PERCLOS、EAR、视线时长和头部姿态来自本地视觉链路。'],
  },
  {
    image: asset('landing/evidence-02.jpg'),
    en: ['SEMANTIC OMS', 'Occupant risk, with its source named', 'OMS events are simulated and labelled as such. EVA relates the passenger event to local driver evidence without treating every glance as fatigue.'],
    zh: ['语义 OMS', '明确标注乘员风险来源', 'OMS 事件为模拟数据，并始终明确标注。EVA 将乘员事件与驾驶员本地证据关联，不会把每次转头都判作疲劳。'],
  },
  {
    image: asset('landing/evidence-03.jpg'),
    en: ['MOMENTTRACE', 'A response that can be inspected', 'Input, rule-based decision, guarded response and recovery are recorded together. L2 remains supervised, and the driver confirms safety before release.'],
    zh: ['MOMENTTRACE', '每一步处理都可回看', '输入、规则判断、组合辅助响应和恢复记录在同一条链路中。L2 始终需要监督，解除保护前由驾驶员确认安全。'],
  },
] as const;

const EXPERIENCES = [
  { image: asset('landing/demo-01.jpg'), en: ['01', 'Daily Commute', 'Familiar route and cabin settings'], zh: ['01', '日常通勤', '熟悉路线与座舱设置'] },
  { image: asset('landing/demo-02.jpg'), en: ['02', 'Fatigue Guard', 'Local driver monitoring and rest guidance'], zh: ['02', '疲劳守护', '本地驾驶员监测与休息建议'] },
  { image: asset('landing/demo-03.jpg'), en: ['03', 'Complex Roads', 'Weather-aware, supervised L2 assistance'], zh: ['03', '复杂路况', '结合天气情境的 L2 组合辅助'] },
  { image: asset('landing/demo-04.jpg'), en: ['04', 'Cabin Memory', 'A cabin item remembered in context'], zh: ['04', '座舱记忆', '结合座舱情境回忆物品位置'] },
  { image: asset('landing/demo-05.jpg'), en: ['05', 'OMS MomentTrace', 'A simulated occupant event, traced end to end'], zh: ['05', 'OMS MomentTrace', '从头到尾记录模拟乘员事件'] },
] as const;

const STATS = [
  { value: '478', en: 'facial landmarks · on-device', zh: '个人脸关键点 · 本地处理' },
  { value: '0', en: 'frames uploaded', zh: '帧上传至云端' },
  { value: '23', en: 'simulated OMS states', zh: '种模拟 OMS 状态' },
  { value: '35 s', en: 'one risk moment · traced', zh: '单次风险记录时长' },
] as const;

function enterCockpit(autoDemo: boolean) {
  try {
    if (autoDemo) window.sessionStorage.setItem('eva.autodemo', '1');
    else window.sessionStorage.removeItem('eva.autodemo');
  } catch { /* 隐私模式 */ }
  window.location.hash = '#/cockpit';
}

function LanguageSwitch({ language, onChange }: { language: UiLanguage; onChange: (language: UiLanguage) => void }) {
  return (
    <div className="la-language" role="group" aria-label={language === 'zh' ? '选择语言' : 'Choose language'}>
      <button type="button" aria-pressed={language === 'zh'} onClick={() => onChange('zh')}>中</button>
      <span aria-hidden="true">/</span>
      <button type="button" aria-pressed={language === 'en'} onClick={() => onChange('en')}>EN</button>
    </div>
  );
}

export default function Landing({ language, onLanguageChange }: LandingProps) {
  const [evidenceIndex, setEvidenceIndex] = useState(0);
  const [experienceIndex, setExperienceIndex] = useState(0);
  const isZh = language === 'zh';
  const evidence = EVIDENCE[evidenceIndex];
  const experience = EXPERIENCES[experienceIndex];

  useEffect(() => {
    document.body.classList.add('landing-body');
    document.title = isZh ? 'EVA · 智能座舱' : 'EVA · Smart Cockpit — Cabin Perception, Human Protection';
    return () => {
      document.body.classList.remove('landing-body');
      document.title = 'EVA · Smart Cockpit';
    };
  }, [isZh]);

  const scrollTo = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="landing" data-language={language}>
      <nav className="la-nav" aria-label={isZh ? '主导航' : 'Main navigation'}>
        <a className="la-logo" href="#/landing" onClick={(event) => { event.preventDefault(); window.location.hash = '#/landing'; }}>
          <b>EVA</b><span>{isZh ? '智能座舱' : 'SMART COCKPIT'}</span><i aria-hidden="true">01</i>
        </a>
        <div className="la-links">
          <a href="#evidence" onClick={(event) => scrollTo(event, 'evidence')}>{isZh ? '证据' : 'Evidence'}</a>
          <a href="#demo" onClick={(event) => scrollTo(event, 'demo')}>{isZh ? '演示' : 'Demo'}</a>
          <a href="#data" onClick={(event) => scrollTo(event, 'data')}>{isZh ? '数据' : 'Data'}</a>
          <a href="#about" onClick={(event) => scrollTo(event, 'about')}>{isZh ? '关于' : 'About'}</a>
        </div>
        <LanguageSwitch language={language} onChange={onLanguageChange} />
        <button type="button" className="la-btn primary small" onClick={() => enterCockpit(false)}>
          {isZh ? '进入座舱' : 'Open cockpit'} <span aria-hidden="true">↗</span>
        </button>
      </nav>

      <main>
        <header className="la-hero">
          <div className="la-hero-copy">
            <span className="la-kicker">
              <i aria-hidden="true" />
              <span className="la-kicker__event">EVA / INTELLIGENT CABIN</span>
              <span className="la-kicker__sep" aria-hidden="true" />
              <span className="la-kicker__track">FIELD NOTE 01 · 2026</span>
            </span>
            <h1 className="la-title">
              <span>{isZh ? '感知座舱，' : 'Cabin perception,'}</span>
              <br />
              <em>{isZh ? '守护每一程。' : 'human protection.'}</em>
            </h1>
            <span className="la-title-en">LOCAL EVIDENCE / EXPLAINABLE ASSISTANCE / HUMAN IN CONTROL</span>
            <p className="la-slogan">
              {isZh
                ? 'EVA 把本地驾驶员证据与乘员事件连在一起，解释每一次辅助动作。驾驶员始终负责驾驶。'
                : 'EVA connects on-device driver evidence with occupant events and explains every assistance step. The driver stays in control.'}
            </p>
            <div className="la-cta">
              <button type="button" className="la-btn primary" onClick={() => enterCockpit(true)}>{isZh ? '观看完整演示' : 'Run full demo'} <span aria-hidden="true">↗</span></button>
              <button type="button" className="la-btn ghost" onClick={() => enterCockpit(false)}><span className="la-play" aria-hidden="true">▶</span>{isZh ? '进入驾驶舱' : 'Enter cockpit'}</button>
            </div>
            <div className="la-hero-metrics" aria-label={isZh ? '首屏关键数据' : 'Hero metrics'}>
              <div><span>478</span><small>{isZh ? '个人脸关键点' : 'FACIAL LANDMARKS'}</small></div>
              <div><span>0</span><small>{isZh ? '帧上传' : 'FRAMES UPLOADED'}</small></div>
              <div><span>∞</span><small>{isZh ? '驾驶员始终在环' : 'HUMAN IN THE LOOP'}</small></div>
            </div>
          </div>
          <div className="la-hero-visual">
            <div className="la-visual-topline"><span>LIVE DIGITAL TWIN</span><span>LOCAL RENDER / 60 FPS</span></div>
            <CarModel />
            <div className="la-hud la-hud--top"><span className="la-hud-dot" /> <b>{isZh ? '本地证据链' : 'LOCAL EVIDENCE CHAIN'}</b><small>ONLINE / 01</small></div>
            <div className="la-hud la-hud--side"><small>ATTENTION INDEX</small><strong>0.94</strong><span><i /><i /><i /><i /><i /><i /></span></div>
            <p className="la-hero-visual-hint"><span>{isZh ? '拖动旋转' : 'DRAG TO ROTATE'}</span><i aria-hidden="true">·</i><span>{isZh ? '本地渲染' : 'RENDERED LOCALLY'}</span></p>
            <div className="la-visual-caption"><span>EVA / G-SPARK FINALE 2026</span><span>{isZh ? '一刻风险，三层证据' : 'ONE MOMENT / THREE LAYERS'}</span></div>
          </div>
          <a className="la-next" href="#evidence" onClick={(event) => scrollTo(event, 'evidence')}>
            <span>{isZh ? '查看证据链' : 'Explore the evidence chain'}</span><i aria-hidden="true">↓</i>
          </a>
        </header>

        <section className="la-section la-showcase" id="evidence" aria-labelledby="la-evidence-title">
          <div className="la-section-head">
            <div><span className="la-section-index">01 / EVIDENCE</span><h2 id="la-evidence-title">{isZh ? '一刻风险，三层证据。' : 'One moment, three evidence layers.'}</h2></div>
            <p>{isZh ? '从本地感知到规则判断，再到受监督的行动；每项结论都能回到它的来源。' : 'Perception, rule-based reasoning and supervised action. Every conclusion stays tied to its source.'}</p>
          </div>
          <div className="la-editorial-grid">
            <div className="la-evidence-board" aria-label={isZh ? '证据链可视化' : 'Evidence chain visualization'}>
              <div className="la-evidence-visual" aria-hidden="true">
                <img src={asset('landing/demo-02.jpg')} alt="" />
                <span className="la-evidence-scan" />
              </div>
              <div className="la-evidence-board-head"><span>{isZh ? '证据链 / LIVE TRACE' : 'EVIDENCE CHAIN / LIVE TRACE'}</span><b>0{evidenceIndex + 1} / 03</b></div>
              <div className="la-evidence-board-center">
                <span className="la-evidence-orbit la-evidence-orbit--outer" />
                <span className="la-evidence-orbit la-evidence-orbit--inner" />
                <span className="la-evidence-core"><i aria-hidden="true" />{isZh ? '风险已被解释' : 'RISK EXPLAINED'}</span>
                <strong>{isZh ? '从证据，到行动' : 'EVIDENCE TO ACTION'}</strong>
                <p>{evidence[language === 'zh' ? 'zh' : 'en'][1]}</p>
              </div>
              <div className="la-evidence-flow">
                <div><small>01</small><b>{isZh ? '本地输入' : 'LOCAL INPUT'}</b><span>{isZh ? '摄像头 / 回放' : 'CAMERA / REPLAY'}</span></div>
                <i aria-hidden="true">→</i>
                <div><small>02</small><b>{isZh ? '规则判断' : 'RULE TRACE'}</b><span>{isZh ? '来源清晰' : 'SOURCE NAMED'}</span></div>
                <i aria-hidden="true">→</i>
                <div><small>03</small><b>{isZh ? '受监督行动' : 'SAFE OUTCOME'}</b><span>{isZh ? '驾驶员确认' : 'DRIVER CONFIRMS'}</span></div>
              </div>
              <div className="la-evidence-board-foot"><span>{isZh ? '每项结论都能回到它的来源' : 'Every conclusion stays tied to its source'}</span><span>LOCAL / 0 UPLOAD</span></div>
            </div>
            <div className="la-numbered-list" role="list" aria-label={isZh ? '证据层' : 'Evidence layers'}>
              {EVIDENCE.map((item, index) => {
                const copy = item[language === 'zh' ? 'zh' : 'en'];
                return (
                  <button key={item.image} type="button" className="la-list-row" role="listitem" aria-pressed={evidenceIndex === index} onClick={() => setEvidenceIndex(index)}>
                    <span className="la-row-number">0{index + 1}</span>
                    <span className="la-row-copy"><small>{copy[0]}</small><b>{copy[1]}</b><span>{copy[2]}</span></span>
                    <span className="la-row-arrow" aria-hidden="true">↗</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="la-section la-showcase" id="demo" aria-labelledby="la-demo-title">
          <div className="la-section-head">
            <div><span className="la-section-index">02 / DEMONSTRATION</span><h2 id="la-demo-title">{isZh ? '五段体验，一次完整旅程。' : 'Five experiences, one continuous tour.'}</h2></div>
            <p>{isZh ? '从日常出行到乘员安全。可完整观看，也可在座舱中单独选择每段体验。' : 'From daily travel to occupant safety. Watch the full tour or choose any experience in the cockpit.'}</p>
          </div>
          <div className="la-editorial-grid">
            <figure className="la-screen-shot">
              <img key={experience.image} src={experience.image} alt={`${experience[language === 'zh' ? 'zh' : 'en'][1]} · ${isZh ? '座舱运行界面截图' : 'cockpit interface screenshot'}`} />
              <figcaption><span>{experience[language === 'zh' ? 'zh' : 'en'][0]} · {experience[language === 'zh' ? 'zh' : 'en'][1]}</span><span>{isZh ? '座舱运行界面' : 'LIVE COCKPIT UI'}</span></figcaption>
            </figure>
            <div className="la-numbered-list la-demo-list" role="list" aria-label={isZh ? '演示体验' : 'Demo experiences'}>
              {EXPERIENCES.map((item, index) => {
                const copy = item[language === 'zh' ? 'zh' : 'en'];
                return (
                  <button key={item.image} type="button" className="la-list-row" role="listitem" aria-pressed={experienceIndex === index} onClick={() => setExperienceIndex(index)}>
                    <span className="la-row-number">{copy[0]}</span>
                    <span className="la-row-copy"><b>{copy[1]}</b><span>{copy[2]}</span></span>
                    <span className="la-row-arrow" aria-hidden="true">↗</span>
                  </button>
                );
              })}
              <button type="button" className="la-demo-cta" onClick={() => enterCockpit(true)}>{isZh ? '开始完整演示' : 'Start the full demo'} <span aria-hidden="true">→</span></button>
            </div>
          </div>
        </section>

        <section className="la-section la-data" id="data" aria-labelledby="la-data-title">
          <div className="la-section-head">
            <div><span className="la-section-index">03 / DATA</span><h2 id="la-data-title">{isZh ? '数据如实说明。' : 'The numbers, with their boundaries.'}</h2></div>
            <p>{isZh ? '本地 DMS 推理 · 明确的模拟边界 · 无云端依赖' : 'Local DMS inference · explicit simulation boundaries · no cloud dependency'}</p>
          </div>
          <div className="la-stats">
            {STATS.map((stat) => <div key={stat.value + stat.en} className="la-stat"><b>{stat.value}</b><span>{isZh ? stat.zh : stat.en}</span></div>)}
          </div>
        </section>

        <section className="la-section la-about-section" id="about" aria-labelledby="la-about-title">
          <div className="la-section-head">
            <div><span className="la-section-index">04 / RESPONSIBILITY</span><h2 id="la-about-title">{isZh ? '关于 EVA' : 'About EVA'}</h2></div>
            <p>{isZh ? '本地 DMS · 模拟 OMS 事件 · 驾驶员始终负责' : 'Local DMS · simulated OMS events · the driver remains responsible'}</p>
          </div>
          <div className="la-about">
            <p><strong>{isZh ? 'EVA 是用于舱内安全的 L2 组合辅助原型，不是自动驾驶系统。' : 'EVA is an L2 in-cabin safety assistance prototype, not an autonomous driving system.'}</strong> {isZh ? '驾驶员必须持续关注道路并随时准备接管。演示中的车辆动作均为模拟。' : 'The driver must supervise the road continuously and be ready to take over. Vehicle actions in this demo are simulated.'}</p>
            <ol>
              <li>{isZh ? '实时摄像头与用户选取的视频只在本机浏览器处理，不会上传。' : 'Live-camera and selected local-video frames are processed in this browser and are never uploaded.'}</li>
              <li>{isZh ? '默认演示使用明确标记的 DMS 回放；摄像头和本地视频均需驾驶员主动选择。' : 'The Full Demo uses a labelled DMS replay by default; camera and local video require explicit selection.'}</li>
              <li>{isZh ? 'OMS 是用于原型评估的模拟语义事件源，并非真实量产乘员监测模型。' : 'OMS is a simulated semantic event source for prototype evaluation, not a production occupant model.'}</li>
              <li>{isZh ? 'L2 只提供组合辅助，驾驶员始终负责驾驶并可随时接管。' : 'L2 provides combined assistance only; the driver stays responsible and can take over at any time.'}</li>
              <li>{isZh ? '车辆模型由社区作者 crivero 发布，遵循 CC-BY 许可；并非吉利官方资产。' : <>The vehicle model is by community creator crivero under CC-BY; it is not an official Geely asset. See <a href="https://sketchfab.com/3d-models/geelyblackglb-602e7f7cab6d435ab3c022ecaadceb56" target="_blank" rel="noreferrer noopener">the model attribution</a>.</>}</li>
            </ol>
          </div>
        </section>
      </main>

      <footer className="la-footer">
        <span>EVA · {isZh ? '智能座舱' : 'SMART COCKPIT'} · {isZh ? '舱内感知，人本守护' : 'CABIN PERCEPTION, HUMAN PROTECTION'}</span>
        <span>{isZh ? '驾驶员负责驾驶 · L2 组合辅助 · DMS 本地推理 · OMS 模拟事件' : 'DRIVER RESPONSIBLE · L2 COMBINED ASSISTANCE · LOCAL DMS · SIMULATED OMS'}</span>
      </footer>
    </div>
  );
}
