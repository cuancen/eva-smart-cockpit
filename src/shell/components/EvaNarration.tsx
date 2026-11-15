import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMsg } from '../../core';
import type { DemoStep, DemoTransportState } from '../autoDemo';
import type { EvaMood } from '../evaFace';
import { canPlayAudioAsset, useTts } from '../hooks/useTts';
import EvaAvatar from '../../shared/EvaAvatar';
import type { EvaExpression } from '../../shared/evaExpression';
import type { ExperienceId } from './CinemaControls';
import type { UiLanguage } from '../locale';
import { resolveDemoEvaText as resolveDemoEvaTextZh, resolveEvaFallbackText as resolveEvaFallbackTextZh, localizeEvaText } from '../evaCopyZh';
import {
  getEvaVoiceAsset,
  getEvaVoiceWindow,
  resolveDemoEvaText,
  resolveEvaFallbackText,
  resolveEvaRuntimeAsset,
  resolveEvaRuntimeText,
} from '../evaVoiceEn';

export default function EvaNarration({
  message,
  step,
  transport,
  mood,
  expression,
  voiceOn,
  experience,
  language,
  onNarrationStart,
  onNarrationComplete,
  onNarrationError,
}: {
  message: ChatMsg | null;
  step: DemoStep | null;
  transport: DemoTransportState;
  mood: EvaMood;
  expression: EvaExpression;
  voiceOn: boolean;
  experience: ExperienceId;
  language: UiLanguage;
  onNarrationStart?: (voiceId?: string) => void;
  onNarrationComplete?: (voiceId?: string) => void;
  onNarrationError?: (voiceId?: string) => void;
}) {
  const speechLanguage = language === 'zh' ? 'zh-CN' : 'en-US';
  const { speak, speaking, pauseSpeech, resumeSpeech, cancelSpeech } = useTts(voiceOn, speechLanguage);
  const lastSpokenKeyRef = useRef<string | null>(null);
  const stepText = step ? (language === 'zh' ? resolveDemoEvaTextZh(step, experience) : resolveDemoEvaText(step, experience)) : null;
  const englishMessageText = message ? resolveEvaRuntimeText(message.text) : null;
  const messageText = message ? (language === 'zh' ? localizeEvaText(message.text) : englishMessageText) : null;
  const voiceAsset = language === 'en' && step
    ? getEvaVoiceAsset(step.voiceId)
    : language === 'en' && message
      ? resolveEvaRuntimeAsset(message.text)
      : undefined;
  const text = stepText ?? messageText ?? (language === 'zh' ? resolveEvaFallbackTextZh(transport, experience) : resolveEvaFallbackText(transport, experience));
  const [visibleText, setVisibleText] = useState(text);
  const transportRef = useRef(transport);
  transportRef.current = transport;
  const reducedMotion = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    [],
  );

  useEffect(() => {
    cancelSpeech();
    lastSpokenKeyRef.current = null;
  }, [cancelSpeech, language]);

  useEffect(() => {
    if (language !== 'en' || !step?.voiceId || typeof Audio === 'undefined') return;
    const warmers = getEvaVoiceWindow(step.voiceId, 3).map((asset) => {
      const audio = new Audio(asset.url);
      if (!canPlayAudioAsset(audio, asset.url)) return null;
      audio.preload = 'auto';
      audio.load();
      return audio;
    }).filter((audio): audio is HTMLAudioElement => audio !== null);
    return () => warmers.forEach((audio) => {
      try { audio.pause(); } catch { /* preload already released */ }
      audio.removeAttribute('src');
    });
  }, [language, step?.voiceId]);

  useEffect(() => {
    const spokenKey = step ? `step:${step.voiceId}:${language}` : message ? `message:${message.id}:${language}` : null;
    if (step && lastSpokenKeyRef.current !== spokenKey) {
      lastSpokenKeyRef.current = spokenKey;
      if (step.voice === false) return;
      const accepted = speak(
        stepText ?? step.note,
        ['fatigue-urgent', 'oms-urgent'].includes(step.cue) ? 'urg' : ['fatigue-care', 'complex-roads', 'oms-candidate', 'oms-prompt'].includes(step.cue) ? 'warn' : 'care',
        {
          audioUrl: voiceAsset?.url,
          interrupt: experience !== 'full-demo',
          onStart: () => onNarrationStart?.(step.voiceId),
          onComplete: () => {
            setVisibleText(stepText ?? step.note);
            onNarrationComplete?.(step.voiceId);
          },
          onError: () => onNarrationError?.(step.voiceId),
        },
      );
      if (!accepted) onNarrationError?.(step.voiceId);
      return;
    }
    if (!step && message && lastSpokenKeyRef.current !== spokenKey) {
      lastSpokenKeyRef.current = spokenKey;
      speak(messageText ?? message.text, message.kind, { audioUrl: voiceAsset?.url });
    }
  }, [experience, language, message, messageText, onNarrationComplete, onNarrationError, onNarrationStart, speak, step, stepText, voiceAsset?.url]);

  useEffect(() => {
    if (reducedMotion || !step || transport === 'ready') {
      setVisibleText(text);
      return;
    }
    const duration = Math.max(
      900,
      (voiceAsset?.durationMs ?? step.fallbackDurationMs ?? Math.max(2400, text.length * 78)) * 0.84,
    );
    const weights = Array.from(text, (char) => /[。！？!?]/u.test(char) ? 4.5 : /[，、；：,;:]/u.test(char) ? 2.2 : 1);
    const totalWeight = weights.reduce((sum, value) => sum + value, 0);
    const thresholds: number[] = [];
    let weight = 0;
    weights.forEach((value) => {
      weight += value;
      thresholds.push((weight / totalWeight) * duration);
    });
    let elapsed = 0;
    let last = performance.now();
    let frameId = 0;
    setVisibleText('');
    const tick = (at: number) => {
      if (transportRef.current === 'running') elapsed += Math.max(0, Math.min(80, at - last));
      last = at;
      let count = 0;
      while (count < thresholds.length && thresholds[count] <= elapsed) count += 1;
      setVisibleText(text.slice(0, count));
      if (count < text.length) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [reducedMotion, step, text, voiceAsset?.durationMs]);

  useEffect(() => {
    if (transport === 'paused') pauseSpeech();
    else if (transport === 'running') resumeSpeech();
  }, [pauseSpeech, resumeSpeech, transport]);

  return (
    <section className="eva-narration" data-mood={mood} aria-live="polite" aria-atomic="true">
      <EvaAvatar expression={expression} speaking={speaking} size={58} label={language === 'zh' ? 'EVA 数字人状态' : `EVA is ${expression}`} />
      <div>
        <span>EVA</span>
        <p data-typing={visibleText.length < text.length ? 'true' : 'false'}>{visibleText}</p>
      </div>
    </section>
  );
}
