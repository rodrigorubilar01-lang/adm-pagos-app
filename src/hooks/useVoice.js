// useVoice.js v4.1 — FormData + cleanup robusto del micrófono
// Arregla: mic colgado después de soltar, race conditions al doble-tap,
// stream sin liberar si onstop de MediaRecorder falla (bug WebKit/iOS).

import { useState, useRef, useEffect } from 'react';

const PROXY_URL = import.meta.env.VITE_PROXY_URL || '';

export function useVoice({ usuario, diaCorte, mesFact }) {
  const [state, setState]           = useState('idle'); // idle | recording | transcribing | done | error
  const [transcript, setTranscript] = useState('');
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef        = useRef(null);
  const chunksRef        = useRef([]);
  const mimeTypeRef      = useRef('audio/webm');
  const cancelledRef     = useRef(false); // true si el usuario soltó antes de arrancar

  // ─── Liberación CENTRALIZADA del micrófono ──────────────────
  // Se puede llamar desde cualquier lado (onstop, onerror, unmount, cancel).
  // Idempotente: llamarla dos veces no hace daño.
  function _release() {
    // 1. Detener recorder si sigue activo
    const rec = mediaRecorderRef.current;
    if (rec) {
      try {
        if (rec.state !== 'inactive') rec.stop();
      } catch (_) { /* ignore */ }
      mediaRecorderRef.current = null;
    }
    // 2. Detener TODOS los tracks del stream → apaga el indicador naranja de iOS
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach(t => {
        try { t.stop(); } catch (_) {}
      });
      streamRef.current = null;
    }
  }

  // ─── Cleanup al desmontar el componente ─────────────────────
  // Si el usuario navega a otra pantalla mientras graba → libera el mic.
  useEffect(() => {
    return () => _release();
  }, []);

  // ─── START ──────────────────────────────────────────────────
  async function startRecording() {
    // Guard: no arrancar si ya estamos grabando o procesando (evita doble-tap)
    if (state === 'recording' || state === 'transcribing') return;

    setError(null);
    setTranscript('');
    setResult(null);
    chunksRef.current  = [];
    cancelledRef.current = false;

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('Tu navegador no soporta grabación. Usa el modo texto.');
      setState('error');
      return;
    }

    try {
      // getUserMedia puede tardar si es la primera vez (iOS muestra prompt de permiso)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Si el usuario soltó el botón ANTES de que iOS respondiera al permiso,
      // ya marcamos cancelledRef = true en stopRecording → abortar aquí mismo.
      if (cancelledRef.current) {
        stream.getTracks().forEach(t => t.stop());
        setState('idle');
        return;
      }

      streamRef.current = stream;

      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
        .find(t => MediaRecorder.isTypeSupported(t)) || '';
      mimeTypeRef.current = mimeType || 'audio/webm';

      const recorder = new MediaRecorder(stream, mimeType ? {
        mimeType,
        audioBitsPerSecond: 16000,
      } : {});

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // SIEMPRE liberar micrófono primero, antes de cualquier await
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => {
            try { t.stop(); } catch (_) {}
          });
          streamRef.current = null;
        }
        mediaRecorderRef.current = null;

        // Si fue cancelado, no procesar
        if (cancelledRef.current) {
          setState('idle');
          return;
        }

        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        console.log(`[useVoice] Audio listo: ${blob.size} bytes, type: ${blob.type}`);

        // Audio muy corto → probablemente fue un toque accidental
        if (blob.size < 1500) {
          setError('Audio muy corto. Mantén presionado el botón al menos 1 segundo.');
          setState('error');
          return;
        }

        await sendToProxy(blob, mimeTypeRef.current);
      };

      recorder.onerror = (e) => {
        console.error('[useVoice] MediaRecorder error:', e);
        _release();
        setError('Error al grabar audio. Intenta de nuevo.');
        setState('error');
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState('recording');

    } catch (err) {
      console.error('[useVoice] Error al acceder al micrófono:', err);
      _release();
      if (err.name === 'NotAllowedError') {
        setError('Permiso de micrófono denegado. Actívalo en Ajustes del teléfono.');
      } else {
        setError(`No se pudo acceder al micrófono: ${err.message}`);
      }
      setState('error');
    }
  }

  // ─── STOP ───────────────────────────────────────────────────
  function stopRecording() {
    const rec = mediaRecorderRef.current;

    // Caso 1: recorder está grabando → detener normalmente (onstop se encarga del cleanup)
    if (rec && rec.state === 'recording') {
      setState('transcribing');
      try {
        rec.stop();
      } catch (err) {
        console.error('[useVoice] Error al detener recorder:', err);
        _release();
        setState('idle');
      }
      return;
    }

    // Caso 2: recorder aún no arrancó (usuario soltó muy rápido mientras
    // getUserMedia pedía permiso) → marcar cancelledRef y liberar lo que haya
    cancelledRef.current = true;
    _release();
    setState('idle');
  }

  // ─── CANCEL (equivalente a reset durante grabación) ─────────
  function cancelRecording() {
    cancelledRef.current = true;
    _release();
    setState('idle');
    setError(null);
  }

  // ─── Enviar audio al proxy /parse-audio ─────────────────────
  async function sendToProxy(blob, mimeType) {
    try {
      const formData = new FormData();
      formData.append('file', blob, `audio.${mimeType.includes('mp4') ? 'm4a' : 'webm'}`);
      formData.append('usuario', usuario || 'rodrigo');
      formData.append('dia_corte', String(diaCorte || 22));
      formData.append('mes_actual', mesFact || 'ABRIL 2026');

      const res = await fetch(`${PROXY_URL}/parse-audio`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error del servidor' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const gasto = await res.json();
      setTranscript(gasto.transcripcion || '');
      setResult(gasto);
      setState('done');

    } catch (err) {
      console.error('[useVoice] Error enviando audio:', err);
      setError(`Error al procesar el audio: ${err.message}`);
      setState('error');
    } finally {
      // Safety net: si algo salió mal, asegurar que no queda nada del mic vivo
      _release();
    }
  }

  // ─── Entrada de texto manual → proxy /parse ─────────────────
  async function parseTexto(texto) {
    setState('transcribing');
    setError(null);
    try {
      const res = await fetch(`${PROXY_URL}/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto,
          usuario: usuario || 'rodrigo',
          dia_corte: diaCorte || 22,
          mes_actual: mesFact || 'ABRIL 2026',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const gasto = await res.json();
      setTranscript(texto);
      setResult(gasto);
      setState('done');
    } catch (err) {
      setError(`Error: ${err.message}`);
      setState('error');
    }
  }

  // ─── Reset total ────────────────────────────────────────────
  function reset() {
    _release();
    cancelledRef.current = false;
    setState('idle');
    setTranscript('');
    setResult(null);
    setError(null);
  }

  // ─── Compatibilidad con API antigua (listening/parsing) ─────
  // Permite que ScreenVoice siga usando voice.listening sin refactorizar todo.
  const listening = state === 'recording';
  const parsing   = state === 'transcribing';

  return {
    // API v4 (nueva)
    state,
    startRecording,
    stopRecording,
    cancelRecording,
    parseTexto,
    // API v3 (compat, por si el componente aún usa estos nombres)
    listening,
    parsing,
    startListening: startRecording,
    stopListening:  stopRecording,
    procesarTexto:  parseTexto,
    // Comunes
    transcript,
    result,
    error,
    reset,
  };
}
