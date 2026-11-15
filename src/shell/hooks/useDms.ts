import { useCallback, useEffect, useRef, useState } from 'react';
import type { CockpitActions, CockpitState, VisionSample } from '../../core';
import { createDmsEngine, preloadDmsModel } from '../../vision/dms';
import type { DmsStatus } from '../../vision/dms';
import type { DmsMediaInput } from '../../vision/dms';
import { startSimVision } from '../../vision/simVision';
import type { SimVisionHandle } from '../../vision/simVision';
import { createObjectUrlLease, validateLocalDmsVideo } from '../localVideo';

export type DmsMode = 'off' | 'model' | 'authorized-video' | 'video' | 'sim' | 'replay';
export type DmsLandmark = { x: number; y: number };

export const AUTHORIZED_DMS_VIDEO_URL = `${import.meta.env.BASE_URL}dms/d_360.mp4`;

export interface LocalDmsVideo {
  name: string;
  size: number;
  type: string;
}

/**
 * 机器视觉（DMS）生命周期管理：
 * model = 摄像头 + MediaPipe 真实推理；video = 本地视频 + 同一 MediaPipe 推理；
 * sim = 模拟信号（链路与真实管线一致）；off = 不注入视觉。
 * 所有失败路径都安全降级，绝不影响座舱内核运行。
 */
export function useDms(act: CockpitActions, liveState: () => CockpitState) {
  const [mode, setMode] = useState<DmsMode>('off');
  const [status, setStatus] = useState<DmsStatus>({ kind: 'idle' });
  const [sample, setSample] = useState<VisionSample | null>(null);
  const [landmarks, setLandmarks] = useState<DmsLandmark[] | null>(null);
  const [localVideo, setLocalVideo] = useState<LocalDmsVideo | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Awaited<ReturnType<typeof createDmsEngine>> | null>(null);
  const simRef = useRef<SimVisionHandle | null>(null);
  const modeRef = useRef<DmsMode>('off');
  const sampleRef = useRef<VisionSample | null>(null);
  const generationRef = useRef(0);
  const rafRef = useRef(0);
  const objectUrlRef = useRef<ReturnType<typeof createObjectUrlLease> | null>(null);

  const stopAll = useCallback(() => {
    generationRef.current += 1;
    simRef.current?.stop();
    simRef.current = null;
    engineRef.current?.stop();
    engineRef.current = null;
    cancelAnimationFrame(rafRef.current);
    objectUrlRef.current?.release();
    objectUrlRef.current = null;
    modeRef.current = 'off';
    setMode('off');
    setStatus({ kind: 'idle' });
    setSample(null);
    setLandmarks(null);
    setLocalVideo(null);
    setInputError(null);
    sampleRef.current = null;
    act.setVision(null);
  }, [act]);

  const startInference = useCallback(async (
    nextMode: 'model' | 'video' | 'authorized-video',
    makeInput: () => DmsMediaInput,
    fileMeta: LocalDmsVideo | null = null,
    preserveVideoOnInferenceFailure = false,
  ): Promise<boolean> => {
    stopAll();
    if (!videoRef.current) return false;
    const generation = ++generationRef.current;
    const input = makeInput();
    modeRef.current = nextMode;
    setMode(nextMode);
    setLocalVideo(fileMeta);
    setInputError(null);
    try {
      const engine = await createDmsEngine({
        onStatus: setStatus,
        onSample: (s) => {
          if (generationRef.current !== generation) return;
          sampleRef.current = s;
          setSample(s);
          act.setVision(s);
        },
        onLandmarks: (pts) => {
          if (generationRef.current !== generation) return;
          setLandmarks(pts);
          // 叠加层绘制：稀疏关键点 + 眼部轮廓（canvas 与 video 同被 CSS 镜像）
          const cv = canvasRef.current;
          if (!cv) return;
          const ctx = cv.getContext('2d');
          if (!ctx) return;
          if (cv.width !== cv.clientWidth || cv.height !== cv.clientHeight) {
            cv.width = cv.clientWidth;
            cv.height = cv.clientHeight;
          }
          ctx.clearRect(0, 0, cv.width, cv.height);
          if (!pts) return;
          // video 用 object-fit: contain 显示，关键点需映射到实际画面矩形，
          // 否则 9:16 授权视频在 16:10 容器里会整体偏移。
          const video = videoRef.current;
          const vw = video?.videoWidth ?? 0;
          const vh = video?.videoHeight ?? 0;
          const fit = vw > 0 && vh > 0
            ? Math.min(cv.width / vw, cv.height / vh)
            : 0;
          const drawW = fit > 0 ? vw * fit : cv.width;
          const drawH = fit > 0 ? vh * fit : cv.height;
          const offX = (cv.width - drawW) / 2;
          const offY = (cv.height - drawH) / 2;
          ctx.fillStyle = 'rgba(45, 212, 191, 0.85)';
          for (let i = 0; i < pts.length; i += 7) {
            const p = pts[i];
            ctx.fillRect(offX + p.x * drawW - 0.5, offY + p.y * drawH - 0.5, 1.6, 1.6);
          }
          // 眼部重点标记
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.95)';
          ctx.lineWidth = 1.6;
          for (const idx of [33, 133, 159, 145, 362, 263, 386, 374]) {
            const p = pts[idx];
            if (!p) continue;
            ctx.beginPath();
            ctx.arc(offX + p.x * drawW, offY + p.y * drawH, 4, 0, Math.PI * 2);
            ctx.stroke();
          }
        },
      });
      engineRef.current = engine;
      await engine.start(videoRef.current, input);
      if (generationRef.current !== generation) {
        engine.stop();
        return false;
      }
      return true;
    } catch (e) {
      if (generationRef.current !== generation) return false;
      engineRef.current?.stop();
      engineRef.current = null;
      setStatus({ kind: 'error', detail: e instanceof Error ? e.message : String(e) });
      setSample(null);
      setLandmarks(null);
      sampleRef.current = null;
      act.setVision(null);
      if (preserveVideoOnInferenceFailure && videoRef.current && input.kind === 'video') {
        modeRef.current = nextMode;
        setMode(nextMode);
        videoRef.current.srcObject = null;
        videoRef.current.src = input.url;
        videoRef.current.loop = true;
        videoRef.current.controls = false;
        void videoRef.current.play().catch(() => undefined);
        return false;
      }
      modeRef.current = 'off';
      objectUrlRef.current?.release();
      objectUrlRef.current = null;
      setLocalVideo(null);
      setMode('off');
      return false;
    }
  }, [act, stopAll]);

  const startModel = useCallback(
    () => startInference('model', () => ({ kind: 'camera' })),
    [startInference],
  );

  const startVideo = useCallback((file: File): Promise<boolean> => {
    const validationError = validateLocalDmsVideo(file);
    if (validationError) {
      setInputError(validationError);
      return Promise.resolve(false);
    }
    return startInference('video', () => {
      const lease = createObjectUrlLease(file);
      objectUrlRef.current = lease;
      return { kind: 'video', url: lease.url };
    }, { name: file.name, size: file.size, type: file.type });
  }, [startInference]);

  const startAuthorizedVideo = useCallback(
    () => startInference(
      'authorized-video',
      () => ({ kind: 'video', url: AUTHORIZED_DMS_VIDEO_URL }),
      { name: 'd_360.mp4', size: 1_868_010, type: 'video/mp4' },
      true,
    ),
    [startInference],
  );

  const startSignal = useCallback((nextMode: 'sim' | 'replay') => {
    if (modeRef.current !== 'off') stopAll();
    modeRef.current = nextMode;
    setMode(nextMode);
    setStatus({ kind: 'running' });
    simRef.current = startSimVision(liveState, (s) => {
      sampleRef.current = s;
      setSample(s);
      act.setVision(s);
    });
  }, [act, liveState, stopAll]);

  const startSim = useCallback(() => startSignal('sim'), [startSignal]);
  const startReplay = useCallback(() => startSignal('replay'), [startSignal]);

  useEffect(() => stopAll, [stopAll]);

  // 后台预加载 DMS 模型；演示切到疲劳段时不再同步初始化。
  useEffect(() => {
    const id = window.setTimeout(() => { void preloadDmsModel(); }, 2500);
    return () => window.clearTimeout(id);
  }, []);

  const getMode = useCallback(() => modeRef.current, []);
  const getSample = useCallback(() => sampleRef.current, []);
  const pauseMedia = useCallback(() => videoRef.current?.pause(), []);
  const resumeMedia = useCallback(() => {
    if (!['model', 'video', 'authorized-video'].includes(modeRef.current)) return;
    void videoRef.current?.play().catch(() => undefined);
  }, []);

  return {
    mode,
    status,
    sample,
    landmarks,
    localVideo,
    inputError,
    videoRef,
    canvasRef,
    startModel,
    startVideo,
    startAuthorizedVideo,
    startSim,
    startReplay,
    stopAll,
    getMode,
    getSample,
    pauseMedia,
    resumeMedia,
  };
}
