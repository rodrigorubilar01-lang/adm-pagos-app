// ScreenReports.jsx — resumen mensual + breakdown subcategorías
import { useMemo } from 'react';
import { useGastos } from '../../hooks/useGastos';
import { fmtCL, breakdownByKind, totalsByCat } from '../../lib/helpers';
import TopBar from '../ui/TopBar';
import Card from '../ui/Card';

export default function ScreenReports({ mesFact, usuario, onOpenMes }) {
  const { gastos, loading } = useGastos(mesFact);
  const total = useMemo(() => gastos.reduce((a, g) => a + g.monto, 0), [gastos]);
  const byKind = useMemo(() => breakdownByKind(gastos), [gastos]);
  const byCat  = useMemo(() => totalsByCat(gastos), [gastos]);

  const bySubcat = useMemo(() => {
    const map = new Map();
    gastos.forEach(g => {
      map.set(g.subcategoria, (map.get(g.subcategoria) || 0) + g.monto);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [gastos]);

  const tieneNegocio = usuario === 'rodrigo';

  return (
    <div className="app-scroll" style={{ paddingBottom: 120 }}>
      <TopBar title="REPORTES" mesFact={mesFact} onOpenMes={onOpenMes} />

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--fg-3)' }}>
            TOTAL {mesFact}
          </div>
          <div className="num" style={{ fontSize: 40, fontWeight: 700, marginTop: 6, letterSpacing: -1 }}>
            {loading ? '—' : fmtCL(total)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 4 }}>
            {gastos.length} movimientos
          </div>
        </Card>

        <div>
          <Label>POR TIPO DE COBRO</Label>
          <Card padding={0}>
            <BarRow label="Únicos"    value={byKind.unicos.total}    total={total} color="var(--accent)" />
            <BarRow label="Cuotas"    value={byKind.cuotas.total}    total={total} color="var(--cat-negocio)" />
            <BarRow label="Mensuales" value={byKind.mensuales.total} total={total} color="var(--cat-ahorro)" />
          </Card>
        </div>

        <div>
          <Label>POR CATEGORÍA</Label>
          <Card padding={0}>
            <BarRow label="Personal" value={byCat.PERSONAL || 0} total={total} color="var(--cat-personal)" />
            {tieneNegocio && (
              <BarRow label="Negocio" value={byCat.NEGOCIO || 0} total={total} color="var(--cat-negocio)" />
            )}
            <BarRow label="Ahorro" value={byCat.AHORRO || 0} total={total} color="var(--cat-ahorro)" />
          </Card>
        </div>

        {bySubcat.length > 0 && (
          <div>
            <Label>POR SUBCATEGORÍA</Label>
            <Card padding={0}>
              {bySubcat.map(([sub, val]) => (
                <BarRow key={sub} label={sub} value={val} total={total} color="var(--fg-2)" />
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--fg-3)', margin: '0 4px 10px' }}>
      {children}
    </div>
  );
}

function BarRow({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
          <div className="num" style={{ fontSize: 13, fontWeight: 600 }}>{fmtCL(value)}</div>
          <div style={{ fontSize: 11, color: 'var(--fg-3)', minWidth: 28, textAlign: 'right' }}>{pct}%</div>
        </div>
      </div>
      <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 400ms ease' }} />
      </div>
    </div>
  );
}
