import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { VisionSample } from '../../core';
import type { DmsStatus } from '../../vision/dms';
import type { DmsLandmark, DmsMode } from '../hooks/useDms';
import type { UiLanguage } from '../locale';

const EMOTION_ZH: Record<string, string> = {
  neutral: '平静',
  happy: '积极',
  sad: '低落',
  angry: '紧张',
  surprised: '惊讶',
  drowsy: '困倦',
};

function metric(value: number | undefined, suffix = '', digits = 0): string {
  return value === undefined ? '—' : `${value.toFixed(digits)}${suffix}`;
}

export default function DmsEvidenceLens({
  visible,
  running,
  mode,
  status,
  sample,
  landmarks,
  sourceVideo,
  language,
}: {
  visible: boolean;
  running: boolean;
  mode: DmsMode;
  status: DmsStatus;
  sample: VisionSample | null;
  landmarks: DmsLandmark[] | null;
  sourceVideo: RefObject<HTMLVideoElement>;
  language: UiLanguage;
}) {
  const isZh = language === 'zh';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latestLandmarks = useRef(landmarks);
  latestLandmarks.current = landmarks;

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    const video = sourceVideo.current;
    if (!canvas || !video) return;
    let frame = 0;
    let disposed = false;
    let lastDraw = 0;

    const draw = (at: number) => {
      if (disposed) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      if (at - lastDraw >= 1000 / 30 || !running) {
        lastDraw = at;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#070a10';
        ctx.fillRect(0, 0, width, height);
        if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          const scale = Math.min(width / video.videoWidth, height / video.videoHeight);
          const drawWidth = video.videoWidth * scale;
          const drawHeight = video.videoHeight * scale;
          const x = (width - drawWidth) / 2;
          const y = (height - drawHeight) / 2;
          ctx.drawImage(video, x, y, drawWidth, drawHeight);
          const points = latestLandmarks.current;
          if (points) {
            ctx.fillStyle = 'rgba(94, 234, 212, .82)';
            for (let index = 0; index < points.length; index += 6) {
              const point = points[index];
              ctx.fillRect(x + point.x * drawWidth - 1, y + point.y * drawHeight - 1, 2, 2);
            }
            ctx.strokeStyle = 'rgba(255, 176, 92, .96)';
            ctx.lineWidth = Math.max(1.2, width / 420);
            for (const index of [33, 133, 159, 145, 362, 263, 386, 374]) {
              const point = points[index];
              if (!point) continue;
              ctx.beginPath();
              ctx.arc(x + point.x * drawWidth, y + point.y * drawHeight, 4, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        }
      }
      if (running) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { disposed = true; cancelAnimationFrame(frame); };
  }, [running, sourceVideo, visible]);

  const unavailable = status.kind === 'error';
  const source = mode === 'authorized-video'
    ? isZh ? '授权视频 · 本地推理' : 'AUTHORIZED VIDEO · LOCAL INFERENCE'
    : mode === 'video'
      ? isZh ? '上传视频 · 本地推理' : 'UPLOADED VIDEO · LOCAL INFERENCE'
      : mode === 'model'
        ? isZh ? '实时摄像头 · 本地推理' : 'LIVE CAMERA · LOCAL INFERENCE'
        : isZh ? '回放兜底' : 'REPLAY FALLBACK';
  const faceState = unavailable
    ? isZh ? '推理不可用' : 'INFERENCE UNAVAILABLE'
    : sample?.present
      ? isZh ? '已跟踪人脸' : 'FACE TRACKED'
      : status.kind === 'loading'
        ? isZh ? '模型加载中' : 'MODEL LOADING'
        : isZh ? '正在寻找人脸' : 'SEARCHING FACE';

  return (
    <aside
      className="dms-evidence-lens"
      data-status={status.kind}
      data-visible={visible}
      aria-hidden={!visible}
      aria-label={isZh ? '驾驶员监测证据预览' : 'Driver Monitoring evidence preview'}
    >
      <div className="dms-lens-heading">
        <div>
          <span>{isZh ? 'DMS / 本地证据' : 'DMS / LOCAL EVIDENCE'}</span>
          <b>{faceState}</b>
        </div>
        <output>{sample?.present && !unavailable ? (isZh ? '流已激活' : 'STREAM ACTIVE') : isZh ? '流待命' : 'STREAM STANDBY'}</output>
      </div>
      <div className="dms-lens-body">
        <div className="dms-lens-data">
          <div className="dms-signal-flow" aria-label={isZh ? '本地驾驶员监测数据流' : 'Local driver monitoring data flow'}>
            <span>{isZh ? '画面' : 'FRAME'}</span><i /><span>{isZh ? '关键点' : 'LANDMARKS'}</span><i /><span>{isZh ? '指标' : 'METRICS'}</span>
          </div>
          <dl>
            <div><dt>EAR</dt><dd>{unavailable ? '—' : metric(sample?.ear, '', 2)}</dd></div>
            <div><dt>PERCLOS</dt><dd>{unavailable || !sample ? '—' : metric(sample.perclos * 100, '%')}</dd></div>
            <div><dt>{isZh ? '眨眼频率' : 'BLINK RATE'}</dt><dd>{unavailable ? '—' : metric(sample?.blinkPm, isZh ? ' 次/分' : ' / min')}</dd></div>
            <div><dt>{isZh ? '视线离路' : 'EYES OFF ROAD'}</dt><dd>{unavailable ? '—' : metric(sample?.lookAwaySec, isZh ? ' 秒' : ' s', 1)}</dd></div>
            <div><dt>{isZh ? '偏航 / 俯仰' : 'YAW / PITCH'}</dt><dd>{unavailable || !sample ? '—' : `${sample.yaw.toFixed(0)}° / ${sample.pitch.toFixed(0)}°`}</dd></div>
            <div><dt>{isZh ? '面部状态' : 'FACE STATE'}</dt><dd>{unavailable || !sample ? '—' : isZh ? EMOTION_ZH[sample.emotion] : sample.emotion.toUpperCase()}</dd></div>
            <div><dt>{isZh ? '关键点' : 'LANDMARKS'}</dt><dd>{unavailable || !landmarks ? '—' : landmarks.length}</dd></div>
            <div><dt>{isZh ? '处理' : 'PROCESSING'}</dt><dd>{unavailable ? '—' : isZh ? '本机' : 'ON DEVICE'}</dd></div>
          </dl>
        </div>
        <div className="dms-lens-visual">
          <canvas ref={canvasRef} aria-label={isZh ? '授权竖屏驾驶员监测视频与本地人脸关键点' : 'Authorized vertical driver monitoring video with local face landmarks'} />
          <div className="dms-lens-scan" aria-hidden="true" />
          <div className="dms-lens-axis" aria-hidden="true"><i /><i /><i /></div>
          <span className="dms-lens-corner top" aria-hidden="true" />
          <span className="dms-lens-corner bottom" aria-hidden="true" />
          <small>{isZh ? '9:16 / 本地画面' : '9:16 / LOCAL FRAME'}</small>
        </div>
      </div>
      <div className="dms-lens-source"><i aria-hidden="true" />{source}</div>
    </aside>
  );
}
