// SheetNext.jsx — proyección del mes siguiente
import { useGastos } from '../hooks/useGastos';
import { fmtCL, breakdownByKind } from '../lib/helpers';
import Sheet from '../components/ui/Sheet';

export default function SheetNext({ mesSiguiente, onClose }) {
  const { gastos, loading } = useGastos(mesSiguiente);
  const total = gastos.reduce((a, g) => a + g.monto, 0);
  const byKind = breakdownByKind(gastos);

  return (
    <Sheet title={`Proyección ${mesSiguiente}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--fg-3)' }}>
            TOTAL PROYECTADO
          </div>
          <div className="num" style={{ fontSize: 36, fontWeight: 700, marginTop: 4, letterSpacing: -1 }}>
            {loading ? '—' : fmtCL(total)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>
            Incluye cuotas y mensuales ya programados
          </div>
        </div>

        <div
          style={{
            padding: 14,
            background: 'var(--bg-2)',
            borderRadius: 14,
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <Row label="Cuotas"    total={byKind.cuotas.total}    count={byKind.cuotas.count} />
          <Row label="Mensuales" total={byKind.mensuales.total} count={byKind.mensuales.count} />
          <Row label="Únicos"    total={byKind.unicos.total}    count={byKind.unicos.count} />
        </div>

        {gastos.length === 0 && !loading && (
          <div style={{ textAlign: 'center', color: 'var(--fg-3)', fontSize: 13, padding: 20 }}>
            Sin gastos programados para este mes.
          </div>
        )}
      </div>
    </Sheet>
  );
}

function Row({ label, total, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: 0.4 }}>
        {label.toUpperCase()} · {count}
      </div>
      <div className="num" style={{ fontSize: 14, fontWeight: 600 }}>{fmtCL(total)}</div>
    </div>
  );
}
