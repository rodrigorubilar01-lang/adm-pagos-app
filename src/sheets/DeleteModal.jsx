// DeleteModal.jsx — confirmación de borrado con scope one/all
import { useState } from 'react';
import { useGastos } from '../hooks/useGastos';
import Sheet from '../components/ui/Sheet';
import Btn from '../components/ui/Btn';
import Chip from '../components/ui/Chip';
import { fmtCL } from '../lib/helpers';

export default function DeleteModal({ gasto, onCancel, onConfirm }) {
  const { eliminarGasto } = useGastos(gasto.mes_fact);
  const [scope, setScope] = useState('one');
  const [deleting, setDeleting] = useState(false);

  const isSerie = !!gasto.serie_id && (gasto.tipo_cobro === 'CUOTAS' || gasto.tipo_cobro === 'MENSUAL');

  async function handleDelete() {
    setDeleting(true);
    try {
      await eliminarGasto(gasto, scope);
      onConfirm?.();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Sheet
      title="Eliminar gasto"
      onClose={onCancel}
      footer={
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" onClick={onCancel} full>Cancelar</Btn>
          <Btn variant="danger" onClick={handleDelete} disabled={deleting} full>
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </Btn>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            padding: 14,
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 14,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700 }}>{gasto.descripcion}</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginTop: 4 }}>
            <div className="num" style={{ fontSize: 18, fontWeight: 700 }}>{fmtCL(gasto.monto)}</div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{gasto.mes_fact}</div>
          </div>
        </div>

        {isSerie && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--fg-3)', marginBottom: 8 }}>
              ALCANCE
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Chip active={scope === 'one'} onClick={() => setScope('one')}>SOLO ESTE</Chip>
              <Chip active={scope === 'all'} onClick={() => setScope('all')}>TODA LA SERIE</Chip>
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 8, lineHeight: 1.4 }}>
              {scope === 'one'
                ? 'Se eliminará solo el registro del mes actual.'
                : `Se eliminarán todos los registros de esta ${gasto.tipo_cobro === 'CUOTAS' ? 'compra en cuotas' : 'suscripción mensual'}.`}
            </div>
          </div>
        )}

        <div
          style={{
            padding: 12,
            borderRadius: 10,
            background: 'var(--danger-soft)',
            color: 'var(--danger)',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          Esta acción no se puede deshacer.
        </div>
      </div>
    </Sheet>
  );
}
