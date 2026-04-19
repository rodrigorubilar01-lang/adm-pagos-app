// useVoice.js — grabación de audio + parseo via proxy Claude
import { useState, useRef } from 'react';

const PROXY_URL = import.meta.env.VITE_PROXY_URL;

export function useVoice({ usuario, diaCorte, mesFact }) {
  const [listening, setListening]   = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsing, setParsing]       = useState(false);
  const [result, setResult]         = useState(null);   // gasto parseado por Claude
  const [error, setError]           = useState(null);
  const recognitionRef = useRef(null);

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CL';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      parseWithClaude(text);
    };

    recognition.onerror = (event) => {
      setError(`Error de micrófono: ${event.error}`);
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    setTranscript('');
    setResult(null);
    setError(null);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
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
      if (!res.ok) throw new Error('Error en el proxy');
      const gasto = await res.json();
      setResult(gasto);
    } catch (err) {
      setError('No pude procesar el audio. Intenta de nuevo.');
    } finally {
      setParsing(false);
    }
  }

  function reset() {
    setTranscript('');
    setResult(null);
    setError(null);
    setParsing(false);
  }

  return { listening, transcript, parsing, result, error, startListening, stopListening, reset };
}
