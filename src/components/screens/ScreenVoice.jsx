// ScreenVoice.jsx — entrada de gasto por voz o texto
import { useState, useEffect } from 'react';
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

  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [textoManual, setTextoManual] = useState('');
  const [modoTexto, setModoTexto] = useState(false);

  useEffect(() => {
    if (voice.result) {
      const hoy = new Date().toISOString().slice(0, 10);
      const mes_fact = voice.result.mes_fact || calcMesFact(hoy, diaCorte);
      setDraft({ ...voice.result, fecha: hoy, mes_fact });
    }
  }, [voice.result, diaCorte]);

  function handleClose() {
    voice.reset();
    onClose();
  }

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

  const mostrarInicio = !voice.transcript && !voice.listening && !voice.parsing && !draft && !voice.error && !modoTexto;

  return (
    <div className="fade-in" style={{
      position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 120,
      display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto',
    }}>
      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

        {mostrarInicio && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>Dicta tu gasto o escríbelo</div>
            <button
              onClick={voice.startListening}
              style={{
                width: 120, height: 120, borderRadius: '50%',
                background: 'var(--accent)', color: 'var(--accent-fg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(34,197,94,0.3)',
              }}
            >
              <Icon name="mic" size={48} stroke={2} />
            </button>
            <button onClick={() => setModoTexto(true)} style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
              Escribir en cambio →
            </button>
          </div>
        )}

        {modoTexto && !draft && !voice.parsing && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center' }}>
              Escribe (o dicta con el teclado) tu gasto
            </div>
            <textarea
              value={textoManual}
              onChange={e => setTextoManual(e.target.value)}
              placeholder='"gasté 20 lucas en uber con crédito"'
              autoFocus
              rows={4}
              style={{
                width: '100%', padding: 14, borderRadius: 12, fontSize: 15,
                border: '1px solid var(--border)', background: 'var(--bg-2)',
                color: 'var(--fg)', resize: 'none', lineHeight: 1.5,
                boxSizing: 'border-box',
              }}
            />
            <Btn variant="primary" full onClick={() => voice.procesarTexto(textoManual.trim())} disabled={!textoManual.trim()}>
              Procesar con IA
            </Btn>
            <button onClick={() => setModoTexto(false)} style={{ fontSize: 12, color: 'var(--fg-3)' }}>
              ← Usar micrófono
            </button>
          </div>
        )}

        {voice.listening && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%', background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 1.6s infinite',
            }}>
              <Icon name="mic" size={48} color="var(--accent-fg)" stroke={2} />
            </div>
            <div style={{ marginTop: 20, fontSize: 14, color: 'var(--fg-2)' }}>Escuchando…</div>
            <button onClick={voice.stopListening} style={{ marginTop: 24, fontSize: 13, color: 'var(--fg-3)', padding: '8px 20px', border: '1px solid var(--border)', borderRadius: 8 }}>
              Detener
            </button>
            <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.06);opacity:.85}}`}</style>
          </div>
        )}

        {voice.transcript && !voice.parsing && !draft && (
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--fg-3)' }}>TRANSCRIPCIÓN</div>
            <div style={{ fontSize: 15, marginTop: 6, lineHeight: 1.4 }}>"{voice.transcript}"</div>
          </div>
        )}

        {voice.parsing && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>Procesando con IA…</div>
          </div>
        )}

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

        {draft && <DraftCard draft={draft} onChange={setDraft} usuario={usuario} />}
      </div>

      {/* Footer siempre visible */}
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

const TIPOS  = ['CRÉDITO','DÉBITO','TRANSFERENCIA','EFECTIVO','GIRO CAJERO'];
const COBROS = ['UNICO','CUOTAS','MENSUAL'];

function DraftCard({ draft, onChange, usuario }) {
  const subcats = SUBCATS[usuario] || SUBCATS.rodrigo;
  const cats = Object.keys(subcats);
  const set = (k, v) => onChange({ ...draft, [k]: v });

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
