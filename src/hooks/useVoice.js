// useVoice.js — grabación de audio + parseo via proxy Claude
import { useState, useRef, useEffect } from 'react';

const PROXY_URL = import.meta.env.VITE_PROXY_URL;

export function useVoice({ usuario, diaCorte, mesFact }) {
  const [listening, setListening]   = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsing, setParsing]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => { recognitionRef.current?.abort(); };
  }, []);

  function stopAndRelease() {
    try { recognitionRef.current?.abort(); } catch (_) {}
    recognitionRef.current = null;
    setListening(false);
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Tu navegador no soporta reconocimiento de voz. Usa Safari o Chrome.');
      return;
    }

    stopAndRelease();

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CL';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      stopAndRelease();
      parseWithClaude(text);
    };

    recognition.onerror = (event) => {
      stopAndRelease();
      if (event.error === 'not-allowed') {
        setError('Permiso de micrófono denegado. Actívalo en Ajustes del teléfono.');
      } else if (event.error === 'audio-capture') {
        setError('No se pudo acceder al micrófono. Cierra otras apps que lo usen e intenta de nuevo.');
      } else if (event.error === 'no-speech') {
        setError('No se detectó voz. Habla más cerca del micrófono.');
      } else {
        setError(`Error de micrófono: ${event.error}. Toca "Reintentar".`);
      }
    };

    recognition.onend = () => stopAndRelease();

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      setTranscript('');
      setResult(null);
      setError(null);
    } catch (err) {
      setError('No se pudo iniciar el micrófono. Intenta de nuevo.');
      stopAndRelease();
    }
  }

  function stopListening() {
    stopAndRelease();
  }

  async function parseWithClaude(texto) {
    setParsing(true);
    try {
      const res = await fetch(`${PROXY_URL}/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto,
          usuario,
          dia_corte: diaCorte,
          mes_actual: mesFact,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detalle || `Error ${res.status}`);
      }
      const gasto = await res.json();
      setResult(gasto);
    } catch (err) {
      setError(`No pude procesar el audio: ${err.message}. Toca "Reintentar".`);
    } finally {
      setParsing(false);
    }
  }

  function reset() {
    stopAndRelease();
    setTranscript('');
    setResult(null);
    setError(null);
    setParsing(false);
  }

  return { listening, transcript, parsing, result, error, startListening, stopListening, reset };
}
