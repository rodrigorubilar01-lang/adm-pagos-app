// useVoice.js — MediaRecorder + Whisper (OpenAI) + Claude
import { useState, useRef, useEffect } from 'react';

export function useVoice({ usuario, diaCorte, mesFact }) {
  const [listening, setListening]   = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsing, setParsing]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);
  const recorderRef = useRef(null);
  const chunksRef   = useRef([]);
  const streamRef   = useRef(null);

  useEffect(() => { return () => _release(); }, []);

  function _release() {
    try { if (recorderRef.current?.state !== 'inactive') recorderRef.current?.stop(); } catch (_) {}
    streamRef.current?.getTracks().forEach(t => t.stop());
    recorderRef.current = null;
    streamRef.current   = null;
    setListening(false);
  }

  async function startListening() {
    _release();
    setTranscript(''); setResult(null); setError(null); setParsing(false);

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('Tu navegador no soporta grabación. Usa el modo texto.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = ['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg']
        .find(t => MediaRecorder.isTypeSupported(t)) || '';

      const recorder = new MediaRecorder(stream, {
  ...(mimeType ? { mimeType } : {}),
  audioBitsPerSecond: 32000,
});

// Auto-stop a los 20 segundos
setTimeout(() => {
  if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
}, 20000);
      recorderRef.current = recorder;
      chunksRef.current   = [];

      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };

      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setListening(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        await sendAudio(blob, recorder.mimeType);
      };

      recorder.start();
      setListening(true);
    } catch (err) {
      _release();
      if (err.name === 'NotAllowedError') {
        setError('Permiso de micrófono denegado. Actívalo en Ajustes del teléfono.');
      } else {
        setError(`No se pudo acceder al micrófono: ${err.message}`);
      }
    }
  }

  function stopListening() {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    else _release();
  }

  async function sendAudio(blob, mimeType) {
    if (blob.size < 1000) {
      setError('Audio muy corto. Habla por al menos 1 segundo e intenta de nuevo.');
      return;
    }
    setParsing(true);
    try {
      const buf   = await blob.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary  = '';
      for (let i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      }
      const base64 = btoa(binary);

      const res = await fetch('/parse-audio', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ audio: base64, mimeType, usuario, dia_corte: diaCorte, mes_actual: mesFact }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.detalle || e.error || `Error ${res.status}`);
      }
      const data = await res.json();
      const { transcript: tx, ...gasto } = data;
      setTranscript(tx || '');
      setResult(gasto);
    } catch (err) {
      setError(`No pude procesar el audio: ${err.message}. Toca "Reintentar".`);
    } finally {
      setParsing(false);
    }
  }

  async function parseWithClaude(texto) {
    setParsing(true);
    try {
      const res = await fetch('/parse', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ texto, usuario, dia_corte: diaCorte, mes_actual: mesFact }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.detalle || `Error ${res.status}`);
      }
      const gasto = await res.json();
      setResult(gasto);
    } catch (err) {
      setError(`No pude procesar: ${err.message}. Toca "Reintentar".`);
    } finally {
      setParsing(false);
    }
  }

  function reset() {
    _release();
    setTranscript(''); setResult(null); setError(null); setParsing(false);
  }

  function procesarTexto(texto) {
    setTranscript(texto);
    parseWithClaude(texto);
  }

  return { listening, transcript, parsing, result, error, startListening, stopListening, reset, procesarTexto };
}
