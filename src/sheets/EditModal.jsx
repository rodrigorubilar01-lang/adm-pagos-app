// EditModal.jsx — edición en 2 pasos: descripción/monto/tipo → cat/subcat/cobro
import { useState } from 'react';
import { useGastos } from '../hooks/useGastos';
import Sheet from '../components/ui/Sheet';
import Btn from '../components/ui/Btn';
import Chip from '../components/ui/Chip';
import { fmtCL } from '../lib/helpers';

const SUBCATS = {
  PERSONAL_R: ['SUPERMERCADO','TRANSPORTE','COMBUSTIBLE','SERVICIOS BÁSICOS','SUSCRIPCIONES DIGITALES','ALIMENTACIÓN FUERA','SALUD','GIMNASIO/DEPORTE','GASTOS PERSONALES','ENTRETENIMIENTO/OCIO','EDUCACIÓN','GASTOS DE BOLSILLO'],
  NEGOCIO:    ['SOFTWARE Y SUSCRIPCIONES','MARKETING','EQUIPAMIENTO','FINANZAS/CONTADOR'],
  AHORRO:     ['TRANSFERENCIA A AHORRO'],
  PERSONAL_M: ['SUPERMERCADO','FARMACIA','TRANSPORTE','SALUD','SALIDAS','GASTOS PERSONALES','SERVICIOS BÁSICOS','OTROS','POLLA','FERIA','CUOTA TRABAJO','SUSCRIPCIONES DIGITALES'],
};

const TIPOS  = ['CRÉDITO','DÉBITO','TRANSFERENCIA','EFECTIVO','GIRO CAJERO'];
const COBROS = ['UNICO','CUOTAS','MENSUAL'];

export default function EditModal({ gasto, onCancel, onConfirm }) {
  const { editarGasto } = useGastos(gasto.mes_fact);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState({ ...gasto });
  const [scope, setScope] = useState('one');
  const [saving, setSaving] = useState(false);

  const isSerie = !!gasto.serie_id && (gasto.tipo_cobro === 'CUOTAS' || gasto.tipo_cobro === 'MENSUAL');

  // subcategorías para la categoría seleccionada
  const subcats = getSubcats(draft.categoria);

  async function handleSave() {
    setSaving(true);
    try {
      const cambios = {
        descripcion:  draft.descripcion,
        monto:        parseInt(draft.monto) || 0,
        tipo:         draft.tipo,
        categoria:    draft.categoria,
        subcategoria: draft.subcategoria,
      };
      await editarGasto(gasto, cambios, scope);
      onConfirm?.();
    } catch (err) {
      alert('Error al editar: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  return (
    <Sheet
      title={step === 1 ? 'Editar gasto' : 'Clasificar gasto'}
      onClose={onCancel}
      footer={
        <div style={{ display: 'flex', gap: 10 }}>
          {step === 1 ? (
            <>
              <Btn variant="ghost" onClick={onCancel} full>Cancelar</Btn>
              <Btn variant="primary" onClick={() => setStep(2)} full>Siguiente</Btn>
            </>
          ) : (
            <>
              <Btn variant="ghost" onClick={() => setStep(1)} full>Atrás</Btn>
              <Btn variant="primary" onClick={handleSave} disabled={saving} full>
                {saving ? 'Guardando…' : 'Guardar'}
              </Btn>
            </>
          )}
        </div>
      }
    >
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <F label="Descripción">
            <input
              value={draft.descripcion || ''}
              onChange={(e) => set('descripcion', e.target.value.toUpperCase())}
              style={{ fontSize: 15, fontWeight: 600 }}
            />
          </F>

          <F label="Monto">
            <input
              type="number"
              inputMode="numeric"
              value={draft.monto || ''}
              onChange={(e) => set('monto', e.target.value)}
              className="num"
              style={{ fontSize: 18, fontWeight: 700 }}
            />
            <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{fmtCL(parseInt(draft.monto) || 0)}</div>
          </F>

          <F label="Tipo">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {TIPOS.map(t => (
                <Chip key={t} active={draft.tipo === t} onClick={() => set('tipo', t)}>{t}</Chip>
              ))}
            </div>
          </F>

          {isSerie && (
            <F label="Aplicar a">
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <Chip active={scope === 'one'} onClick={() => setScope('one')}>SOLO ESTE</Chip>
                <Chip active={scope === 'all'} onClick={() => setScope('all')}>TODA LA SERIE</Chip>
              </div>
            </F>
          )}
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <F label="Categoría">
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              {['PERSONAL','NEGOCIO','AHORRO'].map(c => (
                <Chip
                  key={c}
                  active={draft.categoria === c}
                  onClick={() => set('categoria', c)}
                  tone={c.toLowerCase()}
                >
                  {c}
                </Chip>
              ))}
            </div>
          </F>

          <F label="Subcategoría">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {subcats.map(s => (
                <Chip key={s} active={draft.subcategoria === s} onClick={() => set('subcategoria', s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </F>

          <F label="Tipo de cobro">
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              {COBROS.map(c => (
                <Chip key={c} active={draft.tipo_cobro === c}>{c}</Chip>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--fg-4)', marginTop: 4 }}>
              Tipo de cobro no se puede cambiar en edición.
            </div>
          </F>
        </div>
      )}
    </Sheet>
  );
}

function getSubcats(categoria) {
  if (categoria === 'NEGOCIO') return SUBCATS.NEGOCIO;
  if (categoria === 'AHORRO')  return SUBCATS.AHORRO;
  // combinar personal rodrigo y mariaelena para cubrir ambos casos
  return Array.from(new Set([...SUBCATS.PERSONAL_R, ...SUBCATS.PERSONAL_M]));
}

function F({ label, children }) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: 10,
        background: 'var(--bg-2)',
        borderRadius: 10,
        border: '1px solid var(--border)',
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'var(--fg-3)' }}>
        {label}
      </span>
      {children}
    </label>
  );
}
