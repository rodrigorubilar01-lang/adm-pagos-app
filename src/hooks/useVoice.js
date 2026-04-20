// useVoice.js — MediaRecorder + Whisper binario (sin base64)
import { useState, useRef } from 'react';

export function useVoice({ usuario, diaCorte, mesFact }) {
  const [listening, setListening]   = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsing, setParsing]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);
  const recorderRef = useRef(null);
  const chunksRef   = useRef([]);
  const streamRef   = useRef(null);
  const autoStopRef = useRef(null);

  function _release() {
    clearTimeout(autoStopRef.current);
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
      recorderRef.current = recorder;
      chunksRef.current   = [];

      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };

      recorder.onstop = async () => {
        clearTimeout(autoStopRef.current);
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setListening(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || 'audio/webm' });
        await sendAudio(blob, recorder.mimeType || mimeType || 'audio/webm');
      };

      recorder.start();
      setListening(true);

      // Auto-stop a los 20 segundos
      autoStopRef.current = setTimeout(() => {
        if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      }, 20000);

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
    if (blob.size < 500) {
      setError('Audio muy corto. Habla por al menos 1 segundo e intenta de nuevo.');
      return;
    }
    setParsing(true);
    try {
      // Enviamos el audio como binario puro — sin base64, sin JSON
      const qs = new URLSearchParams({
        usuario:    usuario    || 'rodrigo',
        dia_corte:  String(diaCorte),
        mes_actual: mesFact    || '',
      }).toString();

      const res = await fetch(`/parse-audio?${qs}`, {
        method:  'POST',
        headers: { 'Content-Type': mimeType || 'audio/webm' },
        body:    blob,
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
