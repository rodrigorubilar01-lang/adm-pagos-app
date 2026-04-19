// SheetMes.jsx — selector de mes
import Sheet from '../components/ui/Sheet';

const MESES = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];

export default function SheetMes({ mesActual, onPick, onClose }) {
  const d = new Date();
  const nowMes = d.getMonth();
  const nowYear = d.getFullYear();

  // 6 meses hacia atrás, actual y 6 hacia adelante
  const opciones = [];
  for (let i = -6; i <= 6; i++) {
    const m = ((nowMes + i) % 12 + 12) % 12;
    const y = nowYear + Math.floor((nowMes + i) / 12);
    opciones.push({ label: `${MESES[m]} ${y}`, mes: m, anio: y });
  }

  return (
    <Sheet title="Seleccionar mes" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {opciones.map(o => (
          <button
            key={o.label}
            onClick={() => onPick(o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: o.label === mesActual ? 'var(--accent-soft)' : 'var(--bg-2)',
              color: o.label === mesActual ? 'var(--accent)' : 'var(--fg)',
              border: '1px solid',
              borderColor: o.label === mesActual ? 'var(--accent)' : 'var(--border)',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'left',
            }}
          >
            {o.label}
            {o.label === mesActual && <span style={{ fontSize: 11 }}>ACTUAL</span>}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
