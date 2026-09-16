'use client';

import { useCallback, useRef, useState } from 'react';
import { voiceApi } from '@/lib/api';

export type VoiceCaptureState = 'idle' | 'recording' | 'transcribing' | 'error';

/** Records a short clip via the browser MediaRecorder API and posts it to
 * POST /v1/university/voice/transcribe. Native (Capacitor) builds will need
 * a different capture path — see plan phase 6 (mobile). */
export function useVoiceCapture(locale?: string) {
  const [state, setState] = useState<VoiceCaptureState>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const start = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      setState('error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setState('recording');
    } catch {
      setState('error');
    }
  }, []);

  const stopAndTranscribe = useCallback(async (): Promise<string | null> => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return null;

    return new Promise((resolve) => {
      recorder.onstop = async () => {
        recorder.stream.getTracks().forEach((t) => t.stop());
        setState('transcribing');
        try {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const { text } = await voiceApi.transcribe(blob, locale);
          setState('idle');
          resolve(text);
        } catch {
          setState('error');
          resolve(null);
        }
      };
      recorder.stop();
    });
  }, [locale]);

  return { state, start, stopAndTranscribe };
}
