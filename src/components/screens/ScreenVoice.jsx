// ScreenVoice.jsx v4.1 — push-to-talk robusto + modo texto
// Arregla: botón que se "queda pegado", doble-tap race, iOS cancela gesto sin soltar mic.
// Cambios clave vs v4.0:
//   - setPointerCapture en onPointerDown → el pointer queda atrapado en el botón
//   - onPointerCancel handler (iOS lo dispara cuando abres Control Center, etc)
//   - pressedRef evita doble-fire de start/stop
//   - disabled mientras state === 'transcribing' (no permite apretar mientras procesa)

import { useState, useEffect, useRef } from 'react';
import { useVoice } from '../../hooks/useVoice';
import { useGastos } from '../../hooks/useGastos';
import { useAuth } from '../../hooks/useAuth';
import { fmtCL, calcMesFact } from '../../lib/helpers';
import Btn from '../ui/Btn';
import Icon from '../ui/Icon';

export default function ScreenVoice({ usuario, diaCorte, mesFact, onClose, onSave }) {
  const { user } = useAuth();
  const { crearGasto } = useGastos(mesFact);
  const voice = useVoice({ usuario, diaCorte, mesFact });

  const [draft, setDraft]             = useState(null);
  const [saving, setSaving]           = useState(false);
  const [textoManual, setTextoManual] = useState('');
  const [modoTexto, setModoTexto]     = useState(false);

  const pressedRef = useRef(false); // guard contra doble-fire de onPointerDown/Up

  useEffect(() => {
    if (voice.result) {
      const hoy = new Date().toISOString().slice(0, 10);
      const mes_fact = voice.result.mes_fact || calcMesFact(hoy, diaCorte);
      setDraft({ ...voice.result, fecha: hoy, mes_fact });
    }
  }, [voice.result, diaCorte]);

  function handleClose() { voice.reset(); onClose(); }

  async function handleSave() {
    if (!draft || !user) return;
    setSaving(true);
    try {
      await crearGasto({
        user_id:        user.id,
        descripcion:    draft.descripcion,
        categoria:      draft.categoria,
        subcategoria:   draft.subcategoria,
        tipo:           draft.tipo,
        tipo_cobro:     draft.tipo_cobro,
        cuota_actual:   draft.tipo_cobro === 'CUOTAS' ? 1 : null,
        cuotas_totales: draft.tipo_cobro === 'CUOTAS' ? draft.cuotas_totales : null,
        monto:          parseInt(draft.monto),
        fecha:          draft.fecha,
        mes_fact:       draft.mes_fact,
      });
      onSave?.();
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Handlers push-to-talk (robustos) ────────────────────────
  function handlePointerDown(e) {
    e.preventDefault();
    if (pressedRef.current) return;               // ya está presionado, ignorar
    if (voice.state === 'transcribing') return;   // no grabar mientras procesa
    pressedRef.current = true;

    // Capturar el pointer en este elemento → onPointerUp/Cancel siempre disparan
    // aunque el dedo se mueva fuera del botón.
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}

    voice.startRecording();
  }

  function handlePointerUp(e) {
    if (!pressedRef.current) return;
    pressedRef.current = false;

    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}

    voice.stopRecording();
  }

  function handlePointerCancel(e) {
    // iOS dispara esto si el gesto se interrumpe (Control Center, notificación push, etc)
    if (!pressedRef.current) return;
    pressedRef.current = false;

    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}

    // Cancelar grabación (libera mic sin enviar a Whisper)
    if (voice.cancelRecording) voice.cancelRecording();
    else voice.stopRecording();
  }

  const isRecording = voice.state === 'recording';
  const isBusy      = voice.state === 'transcribing';

  // Botón mic visible tanto en reposo como grabando
  const mostrarMic = !voice.transcript && !isBusy && !draft && !voice.error && !modoTexto;

  return (
    <div className="fade-in" style={{
      position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 120,
      display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto',
    }}>
      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

        {/* ── Micrófono push-to-talk ── */}
        {mostrarMic && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--fg-3)', minHeight: 20 }}>
              {isRecording ? 'Suelta para procesar' : 'Mantén presionado y habla'}
            </div>

            <button
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onContextMenu={(e) => e.preventDefault()}
              disabled={isBusy}
              style={{
                width: 140, height: 140, borderRadius: '50%',
                background: isRecording ? '#ef4444' : 'var(--accent)',
                color: isRecording ? '#fff' : 'var(--accent-fg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isRecording
                  ? '0 10px 40px rgba(239,68,68,0.45)'
                  : '0 10px 30px rgba(34,197,94,0.3)',
                animation: isRecording ? 'pulse 1s infinite' : 'none',
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
                transition: 'background 0.15s, box-shadow 0.15s',
                opacity: isBusy ? 0.5 : 1,
                cursor: isBusy ? 'not-allowed' : 'pointer',
              }}
            >
              <Icon name="mic" size={52} stroke={2} />
            </button>

            {!isRecording && (
              <button
                onClick={() => setModoTexto(true)}
                style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}
              >
                Escribir en cambio →
              </button>
            )}

            <style>{`
              @keyframes pulse {
                0%,100% { transform: scale(1); opacity: 1; }
                50%      { transform: scale(1.08); opacity: 0.88; }
              }
            `}</style>
          </div>
        )}

        {/* ── Modo texto ── */}
        {modoTexto && !draft && !isBusy && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center' }}>
              Escribe (o dicta con el teclado) tu gasto
            </div>
            <textarea
              value={textoManual}
              onChange={e => setTextoManual(e.target.value)}
              placeholder='Ej: "gasté 20 lucas en uber con crédito"'
              autoFocus
              rows={4}
              style={{
                width: '100%', padding: 14, borderRadius: 12, fontSize: 15,
                border: '1px solid var(--border)', background: 'var(--bg-2)',
                color: 'var(--fg)', resize: 'none', lineHeight: 1.5,
              }}
            />
            <Btn variant="primary" full onClick={() => { if (textoManual.trim()) voice.parseTexto(textoManual.trim()); }} disabled={!textoManual.trim()}>
              Procesar con IA
            </Btn>
            <button onClick={() => setModoTexto(false)} style={{ fontSize: 12, color: 'var(--fg-3)' }}>
              ← Usar micrófono
            </button>
          </div>
        )}

        {/* ── Transcripción ── */}
        {voice.transcript && (
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--fg-3)' }}>TRANSCRIPCIÓN</div>
            <div style={{ fontSize: 15, marginTop: 6, lineHeight: 1.4 }}>"{voice.transcript}"</div>
          </div>
        )}

        {/* ── Procesando ── */}
        {isBusy && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>Procesando con IA…</div>
          </div>
        )}

        {/* ── Error ── */}
        {voice.error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: 14, borderRadius: 12, fontSize: 13 }}>
              {voice.error}
            </div>
            <Btn variant="ghost" full onClick={() => { voice.reset(); setModoTexto(true); }}>
              Escribir en cambio
            </Btn>
            <Btn variant="primary" full onClick={voice.reset}>
              Reintentar micrófono
            </Btn>
          </div>
        )}

        {/* ── Borrador detectado ── */}
        {draft && <DraftCard draft={draft} onChange={setDraft} usuario={usuario} />}
      </div>

      {/* ── Footer ── */}
      <div style={{
        borderTop: '1px solid var(--border)', padding: 16,
        paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
        display: 'flex', gap: 10,
      }}>
        {draft ? (
          <>
            <Btn variant="ghost" onClick={() => { voice.reset(); setDraft(null); setTextoManual(''); }} full>Otra vez</Btn>
            <Btn variant="primary" onClick={handleSave} disabled={saving} full>
              {saving ? 'Guardando…' : 'Guardar'}
            </Btn>
          </>
        ) : (
          <Btn variant="ghost" full onClick={handleClose}>Cancelar</Btn>
        )}
      </div>
    </div>
  );
}

// ── Subcategorías ──────────────────────────────────────────────────────────
const SUBCATS = {
  rodrigo: {
    PERSONAL: ['SUPERMERCADO','TRANSPORTE','COMBUSTIBLE','SERVICIOS BÁSICOS','SUSCRIPCIONES DIGITALES','ALIMENTACIÓN FUERA','SALUD','GIMNASIO/DEPORTE','GASTOS PERSONALES','ENTRETENIMIENTO/OCIO','EDUCACIÓN','GASTOS DE BOLSILLO'],
    NEGOCIO:  ['SOFTWARE Y SUSCRIPCIONES','MARKETING','EQUIPAMIENTO','FINANZAS/CONTADOR'],
    AHORRO:   ['TRANSFERENCIA A AHORRO'],
  },
  mariaelena: {
    PERSONAL: ['SUPERMERCADO','FARMACIA','TRANSPORTE','SALUD','SALIDAS','GASTOS PERSONALES','SERVICIOS BÁSICOS','OTROS','POLLA','FERIA','CUOTA TRABAJO','SUSCRIPCIONES DIGITALES'],
    AHORRO:   ['TRANSFERENCIA A AHORRO'],
  },
};

const TIPOS  = ['CRÉDITO', 'DÉBITO', 'TRANSFERENCIA', 'EFECTIVO', 'GIRO CAJERO'];
const COBROS = ['UNICO', 'CUOTAS', 'MENSUAL'];

function DraftCard({ draft, onChange, usuario }) {
  const subcats = SUBCATS[usuario] || SUBCATS.rodrigo;
  const cats = Object.keys(subcats);
  const set  = (k, v) => onChange({ ...draft, [k]: v });

  return (
    <div className="fade-up" style={{
      background: 'var(--bg-2)', border: '1px solid var(--border-2)',
      borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--accent)' }}>
        GASTO DETECTADO {draft.confianza != null && `· ${Math.round(draft.confianza * 100)}%`}
      </div>
      <F label="Descripción">
        <input value={draft.descripcion || ''} onChange={e => set('descripcion', e.target.value.toUpperCase())} style={{ fontSize: 15, fontWeight: 600 }} />
      </F>
      <F label="Monto">
        <input type="number" inputMode="numeric" value={draft.monto || ''} onChange={e => set('monto', e.target.value)} style={{ fontSize: 18, fontWeight: 700 }} className="num" />
        <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{fmtCL(draft.monto || 0)}</div>
      </F>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <F label="Categoría">
          <Select value={draft.categoria} onChange={v => { const first = subcats[v]?.[0] || draft.subcategoria; onChange({ ...draft, categoria: v, subcategoria: first }); }} options={cats} />
        </F>
        <F label="Subcategoría">
          <Select value={draft.subcategoria} onChange={v => set('subcategoria', v)} options={subcats[draft.categoria] || []} />
        </F>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <F label="Tipo"><Select value={draft.tipo} onChange={v => set('tipo', v)} options={TIPOS} /></F>
        <F label="Cobro"><Select value={draft.tipo_cobro} onChange={v => set('tipo_cobro', v)} options={COBROS} /></F>
      </div>
      {draft.tipo_cobro === 'CUOTAS' && (
        <F label="Cuotas totales">
          <input type="number" inputMode="numeric" value={draft.cuotas_totales || ''} onChange={e => set('cuotas_totales', parseInt(e.target.value) || null)} className="num" style={{ fontSize: 15, fontWeight: 600 }} />
        </F>
      )}
      {draft.necesita_confirmacion && draft.motivo_confirmacion && (
        <div style={{ fontSize: 12, padding: 10, borderRadius: 10, background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.3)' }}>
          ⚠ {draft.motivo_confirmacion}
        </div>
      )}
    </div>
  );
}

function F({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 10, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'var(--fg-3)' }}>{label}</span>
      {children}
    </label>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value)}
      style={{ background: 'none', border: 'none', outline: 'none', fontSize: 14, fontWeight: 600, color: 'var(--fg)', width: '100%', appearance: 'none' }}>
      {options.map(o => <option key={o} value={o} style={{ background: 'var(--bg-2)' }}>{o}</option>)}
    </select>
  );
}
