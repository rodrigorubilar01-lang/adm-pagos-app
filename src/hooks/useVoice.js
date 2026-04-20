// useVoice.js v4 — MediaRecorder + FormData → /parse-audio
// API: state machine (idle | recording | transcribing | done | error)

import { useState, useRef } from 'react';

export function useVoice({ usuario, diaCorte, mesFact }) {
  const [state, setState]           = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const streamRef        = useRef(null);

  async function startRecording() {
    setError(null);
    setTranscript('');
    setResult(null);
    chunksRef.current = [];

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('Tu navegador no soporta grabación. Usa el modo texto.');
      setState('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : 'audio/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 16000,
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await sendToProxy(blob, mimeType);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setState('recording');

    } catch (err) {
      console.error('[useVoice] Error al acceder al micrófono:', err);
      if (err.name === 'NotAllowedError') {
        setError('Permiso de micrófono denegado. Actívalo en Ajustes del teléfono.');
      } else {
        setError(`No se pudo acceder al micrófono: ${err.message}`);
      }
      setState('error');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setState('transcribing');
      mediaRecorderRef.current.stop();
    }
  }

  async function sendToProxy(blob, mimeType) {
    if (blob.size < 500) {
      setError('Audio muy corto. Habla por al menos 1 segundo e intenta de nuevo.');
      setState('error');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', blob, `audio.${mimeType.includes('mp4') ? 'm4a' : 'webm'}`);
      formData.append('usuario', usuario || 'rodrigo');
      formData.append('dia_corte', String(diaCorte || 22));
      formData.append('mes_actual', mesFact || 'ABRIL 2026');

      const res = await fetch('/parse-audio', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error del servidor' }));
        throw new Error(err.detalle || err.error || `HTTP ${res.status}`);
      }

      const gasto = await res.json();
      setTranscript(gasto.transcripcion || '');
      setResult(gasto);
      setState('done');

    } catch (err) {
      console.error('[useVoice] Error enviando audio:', err);
      setError(`Error al procesar el audio: ${err.message}`);
      setState('error');
    }
  }

  async function parseTexto(texto) {
    setState('transcribing');
    setError(null);
    setTranscript(texto);
    try {
      const res = await fetch('/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto,
          usuario: usuario || 'rodrigo',
          dia_corte: diaCorte || 22,
          mes_actual: mesFact || 'ABRIL 2026',
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error del servidor' }));
        throw new Error(err.detalle || err.error || `HTTP ${res.status}`);
      }
      const gasto = await res.json();
      setResult(gasto);
      setState('done');
    } catch (err) {
      setError(`Error: ${err.message}`);
      setState('error');
    }
  }

  function reset() {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch (_) {}
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setState('idle');
    setTranscript('');
    setResult(null);
    setError(null);
  }

  return {
    state,
    transcript,
    result,
    error,
    startRecording,
    stopRecording,
    parseTexto,
    reset,
  };
}
