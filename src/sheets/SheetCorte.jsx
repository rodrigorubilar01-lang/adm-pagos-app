// SheetCorte.jsx — selector día de corte (20-25)
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Sheet from '../components/ui/Sheet';
import Btn from '../components/ui/Btn';

const OPCIONES = [20, 21, 22, 23, 24, 25];

export default function SheetCorte({ dia, onPick, onClose }) {
  const { updateDiaCorte } = useAuth();
  const [selected, setSelected] = useState(dia || 22);
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    setSaving(true);
    try {
      await updateDiaCorte(selected);
      onPick?.(selected);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet
      title="Día de corte TC"
      onClose={onClose}
      footer={
        <Btn variant="primary" size="lg" full onClick={handleConfirm} disabled={saving}>
          {saving ? 'Guardando…' : 'Confirmar'}
        </Btn>
      }
    >
      <div style={{ fontSize: 13, color: 'var(--fg-2)', marginBottom: 16 }}>
        Si un gasto cae después del día de corte, se factura en el mes siguiente.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {OPCIONES.map(d => (
          <button
            key={d}
            onClick={() => setSelected(d)}
            style={{
              height: 56,
              borderRadius: 12,
              fontSize: 17,
              fontWeight: 700,
              background: selected === d ? 'var(--accent)' : 'var(--bg-2)',
              color: selected === d ? 'var(--accent-fg)' : 'var(--fg)',
              border: '1px solid',
              borderColor: selected === d ? 'var(--accent)' : 'var(--border)',
            }}
          >
            {d}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
