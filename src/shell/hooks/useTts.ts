import { useCallback, useEffect, useRef, useState } from 'react';

const TTS_KINDS = new Set(['care', 'warn', 'urg', 'sys']);
export const EVA_SPEECH_LANG = 'en-US';

interface SpeechItem {
  id: number;
  text: string;
  kind: string;
  audioUrl?: string;
  started: boolean;
  onStart?: () => void;
  onComplete?: () => void;
  onError?: () => void;
}

export interface SpeechOptions {
  audioUrl?: string;
  onStart?: () => void;
  onComplete?: () => void;
  onError?: () => void;
  /** Manual safety experiences may interrupt; Full Demo always passes false. */
  interrupt?: boolean;
}

export type SpeechTerminalResult = 'end' | 'error' | 'exception';

const AUDIO_START_TIMEOUT_MS = 3_000;

/** Resolve the codec hint before attempting playback on a presentation machine. */
export function audioMimeForUrl(url: string): string | null {
  const path = url.split(/[?#]/u, 1)[0].toLowerCase();
  if (path.endsWith('.mp3')) return 'audio/mpeg';
  if (path.endsWith('.wav')) return 'audio/wav';
  if (path.endsWith('.ogg') || path.endsWith('.oga')) return 'audio/ogg';
  if (path.endsWith('.m4a') || path.endsWith('.mp4')) return 'audio/mp4';
  if (path.endsWith('.aac')) return 'audio/aac';
  if (path.endsWith('.webm')) return 'audio/webm';
  return null;
}

/** Unknown extensions are still attempted; known unsupported codecs fall back immediately. */
export function canPlayAudioAsset(
  media: Pick<HTMLMediaElement, 'canPlayType'>,
  url: string,
): boolean {
  const mime = audioMimeForUrl(url);
  if (!mime) return true;
  try {
    return media.canPlayType(mime) !== '';
  } catch {
    return false;
  }
}

/** Only an actual playback end closes an audio-led narration beat. */
export function speechResultCompletesNarration(result: SpeechTerminalResult): boolean {
  return result === 'end';
}

/** Naturalizes technical abbreviations only for the browser-voice fallback. */
export function normalizeSpeechText(text: string): string {
  return text
    .replace(/\bDMS\b/g, 'driver monitoring')
    .replace(/\bOMS\b/g, 'occupant monitoring')
    .replace(/\bPERCLOS\b/g, 'eyelid closure ratio')
    .replace(/\bL2\b/g, 'Level Two')
    .replace(/\bMomentTrace\b/g, 'Moment Trace')
    .replace(/[×]/g, ' and ')
    .replace(/[—–]/g, ', ')
    .replace(/\s*·\s*/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

function voiceScore(voice: SpeechSynthesisVoice, language: string): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  const requested = language.toLowerCase();
  let score = lang === requested ? 60 : lang.startsWith(requested.split('-')[0]) ? 35 : -100;
  if (/natural|neural|aria|jenny|sonia|guy|ava|multilingual|xiaoxiao/.test(name)) score += 60;
  if (/google.*(us|english|mandarin|chinese)/.test(name)) score += 30;
  if (voice.localService) score += 8;
  if (/desktop/.test(name)) score -= 8;
  return score;
}

export function selectEvaVoice(voices: SpeechSynthesisVoice[], language = EVA_SPEECH_LANG): SpeechSynthesisVoice | undefined {
  return voices
    .filter((voice) => voice.lang.toLowerCase().startsWith(language.split('-')[0].toLowerCase()))
    .sort((a, b) => voiceScore(b, language) - voiceScore(a, language))[0];
}

/**
 * One narration channel. Approved MP3 assets are always attempted first;
 * browser speech is used only when an asset cannot be played.
 */
export function useTts(enabled: boolean, language = EVA_SPEECH_LANG) {
  const [speaking, setSpeaking] = useState(false);
  const supportsSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const supportsAudio = typeof Audio !== 'undefined';
  const queueRef = useRef<SpeechItem[]>([]);
  const currentRef = useRef<SpeechItem | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const failAudioRef = useRef<() => void>(() => undefined);
  const audioStartTimerRef = useRef<number | null>(null);
  const sequenceRef = useRef(0);
  const pumpRef = useRef<() => void>(() => undefined);

  const clearAudioStartTimer = useCallback(() => {
    if (audioStartTimerRef.current === null) return;
    window.clearTimeout(audioStartTimerRef.current);
    audioStartTimerRef.current = null;
  }, []);

  const stopActiveMedia = useCallback(() => {
    clearAudioStartTimer();
    const audio = audioRef.current;
    audioRef.current = null;
    failAudioRef.current = () => undefined;
    if (audio) {
      audio.onplaying = null;
      audio.onended = null;
      audio.onerror = null;
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute('src');
        audio.load();
      } catch { /* media already released */ }
    }
    if (supportsSynthesis) {
      try { window.speechSynthesis.cancel(); } catch { /* service already released */ }
    }
  }, [clearAudioStartTimer, supportsSynthesis]);

  const cancel = useCallback(() => {
    queueRef.current = [];
    currentRef.current = null;
    sequenceRef.current += 1;
    stopActiveMedia();
    setSpeaking(false);
  }, [stopActiveMedia]);

  pumpRef.current = () => {
    if (!enabled || currentRef.current || queueRef.current.length === 0) return;
    const item = queueRef.current.shift();
    if (!item) return;
    currentRef.current = item;

    const notifyStart = () => {
      if (currentRef.current?.id !== item.id) return;
      setSpeaking(true);
      if (!item.started) {
        item.started = true;
        item.onStart?.();
      }
    };

    const finish = (result: SpeechTerminalResult) => {
      if (currentRef.current?.id !== item.id) return;
      clearAudioStartTimer();
      const audio = audioRef.current;
      audioRef.current = null;
      failAudioRef.current = () => undefined;
      if (audio) {
        audio.onplaying = null;
        audio.onended = null;
        audio.onerror = null;
      }
      currentRef.current = null;
      setSpeaking(false);
      if (speechResultCompletesNarration(result)) item.onComplete?.();
      else item.onError?.();
      window.setTimeout(() => pumpRef.current(), 90);
    };

    const startSynthesis = () => {
      if (!supportsSynthesis) {
        finish('error');
        return;
      }
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(normalizeSpeechText(item.text));
      utterance.lang = language;
      utterance.voice = selectEvaVoice(synth.getVoices(), language) ?? null;
      utterance.rate = item.kind === 'urg' ? 1.08 : item.kind === 'warn' ? 1.03 : 1;
      utterance.pitch = item.kind === 'urg' ? 0.98 : item.kind === 'care' ? 1.03 : 1;
      utterance.volume = item.kind === 'urg' ? 0.98 : 0.94;
      utterance.onstart = notifyStart;
      utterance.onend = () => finish('end');
      utterance.onerror = () => finish('error');
      try { synth.speak(utterance); } catch { finish('exception'); }
    };

    if (item.audioUrl && supportsAudio) {
      const audio = new Audio(item.audioUrl);
      let failed = false;
      const fallBack = () => {
        if (failed || currentRef.current?.id !== item.id) return;
        failed = true;
        clearAudioStartTimer();
        audio.onplaying = null;
        audio.onended = null;
        audio.onerror = null;
        try { audio.pause(); } catch { /* failed media has no active stream */ }
        if (audioRef.current === audio) audioRef.current = null;
        startSynthesis();
      };
      audio.preload = 'auto';
      audioRef.current = audio;
      failAudioRef.current = fallBack;
      audio.onplaying = () => {
        clearAudioStartTimer();
        notifyStart();
      };
      audio.onended = () => finish('end');
      audio.onerror = fallBack;
      if (!canPlayAudioAsset(audio, item.audioUrl)) {
        fallBack();
        return;
      }
      try {
        audioStartTimerRef.current = window.setTimeout(fallBack, AUDIO_START_TIMEOUT_MS);
        const playResult = audio.play();
        playResult?.catch(fallBack);
      } catch {
        fallBack();
      }
      return;
    }

    startSynthesis();
  };

  const speak = useCallback((text: string, kind: string, options: SpeechOptions = {}): boolean => {
    const clean = text.trim();
    if (!enabled || !TTS_KINDS.has(kind) || !clean) return false;
    if (!options.audioUrl && !supportsSynthesis) return false;
    const duplicate = currentRef.current?.text === clean || queueRef.current.some((item) => item.text === clean);
    if (duplicate) return false;

    if (kind === 'urg' && options.interrupt !== false) {
      queueRef.current = [];
      currentRef.current = null;
      sequenceRef.current += 1;
      stopActiveMedia();
      setSpeaking(false);
    } else if (queueRef.current.length >= 4) {
      queueRef.current.pop();
    }

    queueRef.current.push({
      id: ++sequenceRef.current,
      text: clean,
      kind,
      audioUrl: options.audioUrl,
      started: false,
      onStart: options.onStart,
      onComplete: options.onComplete,
      onError: options.onError,
    });
    pumpRef.current();
    return true;
  }, [enabled, stopActiveMedia, supportsSynthesis]);

  const pauseSpeech = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      clearAudioStartTimer();
      try { audio.pause(); } catch { /* media service does not support pause */ }
      setSpeaking(false);
      return;
    }
    if (!supportsSynthesis || !window.speechSynthesis.speaking) return;
    try { window.speechSynthesis.pause(); } catch { /* service does not support pause */ }
    setSpeaking(false);
  }, [clearAudioStartTimer, supportsSynthesis]);

  const resumeSpeech = useCallback(() => {
    const audio = audioRef.current;
    if (audio?.paused) {
      clearAudioStartTimer();
      audioStartTimerRef.current = window.setTimeout(() => failAudioRef.current(), AUDIO_START_TIMEOUT_MS);
      try { audio.play().catch(() => failAudioRef.current()); } catch { failAudioRef.current(); }
      return;
    }
    if (!supportsSynthesis || !window.speechSynthesis.paused) return;
    try {
      window.speechSynthesis.resume();
      setSpeaking(true);
    } catch { /* service does not support resume */ }
  }, [clearAudioStartTimer, supportsSynthesis]);

  useEffect(() => {
    if (!enabled) cancel();
  }, [cancel, enabled]);

  useEffect(() => () => {
    queueRef.current = [];
    currentRef.current = null;
    sequenceRef.current += 1;
    stopActiveMedia();
  }, [stopActiveMedia]);

  return { speak, speaking: speaking && enabled, pauseSpeech, resumeSpeech, cancelSpeech: cancel };
}
