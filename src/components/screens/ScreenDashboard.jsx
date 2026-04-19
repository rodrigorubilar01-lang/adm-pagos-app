// ScreenDashboard.jsx — home con total del mes + desglose + próximos + últimos
import { useState, useMemo } from 'react';
import { useGastos } from '../../hooks/useGastos';
import { fmtCL, breakdownByKind, totalsByCat } from '../../lib/helpers';
import TopBar from '../ui/TopBar';
import Card from '../ui/Card';
import Icon from '../ui/Icon';

export default function ScreenDashboard({ mesFact, mesSiguiente, usuario, onOpenMes, onOpenNext, onOpenExpense }) {
  const { gastos, loading } = useGastos(mesFact);
  const [expanded, setExpanded] = useState(false);

  const total = useMemo(() => gastos.reduce((a, g) => a + g.monto, 0), [gastos]);
  const breakdown = useMemo(() => breakdownByKind(gastos), [gastos]);
  const byCat     = useMemo(() => totalsByCat(gastos), [gastos]);

  // Top subcategorías (agrupadas)
  const topSubs = useMemo(() => {
    const map = new Map();
    gastos.forEach(g => {
      const key = g.subcategoria;
      map.set(key, (map.get(key) || 0) + g.monto);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [gastos]);

  const ultimos = useMemo(() => {
    return [...gastos].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).slice(0, 5);
  }, [gastos]);

  const tieneNegocio = usuario === 'rodrigo';

  return (
    <div className="app-scroll" style={{ paddingBottom: 120 }}>
      <TopBar title="TOTAL DEL MES" mesFact={mesFact} onOpenMes={onOpenMes} />

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* HERO TOTAL */}
        <Card onClick={() => setExpanded(e => !e)} style={{ padding: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--fg-3)' }}>
            TOTAL
          </div>
          <div
            className="num"
            style={{
              fontSize: 44,
              fontWeight: 700,
              marginTop: 4,
              letterSpacing: -1,
            }}
          >
            {loading ? '—' : fmtCL(total)}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--fg-3)' }}>
            <span>{gastos.length} mov.</span>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              {expanded ? 'Menos' : 'Ver desglose'}
              <Icon name={expanded ? 'chevronUp' : 'chevronDown'} size={14} />
            </span>
          </div>

          {expanded && (
            <div className="fade-up" style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Row label="ÚNICOS"    value={breakdown.unicos.total}    count={breakdown.unicos.count} />
              <Row label="CUOTAS"    value={breakdown.cuotas.total}    count={breakdown.cuotas.count} />
              <Row label="MENSUALES" value={breakdown.mensuales.total} count={breakdown.mensuales.count} />
            </div>
          )}
        </Card>

        {/* MES SIGUIENTE */}
        <Card onClick={onOpenNext} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="calendar" size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--fg-3)' }}>
              MES SIGUIENTE
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{mesSiguiente}</div>
          </div>
          <Icon name="chevronRight" size={18} color="var(--fg-3)" />
        </Card>

        {/* CATEGORÍAS */}
        <div>
          <SectionLabel>CATEGORÍAS</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: tieneNegocio ? '1fr 1fr 1fr' : '1fr 1fr', gap: 10 }}>
            <CatBox label="Personal" value={byCat.PERSONAL} color="var(--cat-personal)" />
            {tieneNegocio && <CatBox label="Negocio"  value={byCat.NEGOCIO}  color="var(--cat-negocio)"  />}
            <CatBox label="Ahorro"   value={byCat.AHORRO}   color="var(--cat-ahorro)"   />
          </div>
        </div>

        {/* TOP SUBCATEGORÍAS */}
        {topSubs.length > 0 && (
          <div>
            <SectionLabel>TOP SUBCATEGORÍAS</SectionLabel>
            <Card padding={0}>
              {topSubs.map(([sub, val], i) => (
                <div
                  key={sub}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '14px 16px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{sub}</div>
                  <div className="num" style={{ fontSize: 13, fontWeight: 600 }}>{fmtCL(val)}</div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ÚLTIMOS MOVIMIENTOS */}
        {ultimos.length > 0 && (
          <div>
            <SectionLabel>ÚLTIMOS MOVIMIENTOS</SectionLabel>
            <Card padding={0}>
              {ultimos.map((g, i) => (
                <GastoRow
                  key={g.id}
                  gasto={g}
                  onClick={() => onOpenExpense?.(g)}
                  first={i === 0}
                />
              ))}
            </Card>
          </div>
        )}

        {!loading && gastos.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--fg-3)', fontSize: 13 }}>
            No hay gastos registrados este mes.<br/>
            Toca el micrófono para empezar.
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: 0.5 }}>
        {label} · {count}
      </div>
      <div className="num" style={{ fontSize: 14, fontWeight: 600 }}>{fmtCL(value)}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--fg-3)', margin: '4px 4px 10px' }}>
      {children}
    </div>
  );
}

function CatBox({ label, value, color }) {
  return (
    <div
      style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 14,
      }}
    >
      <div style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
      <div style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 600, marginTop: 8, letterSpacing: 0.4 }}>
        {label}
      </div>
      <div className="num" style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{fmtCL(value || 0)}</div>
    </div>
  );
}

export function GastoRow({ gasto, onClick, first }) {
  const catColor =
    gasto.categoria === 'NEGOCIO' ? 'var(--cat-negocio)' :
    gasto.categoria === 'AHORRO'  ? 'var(--cat-ahorro)' :
    'var(--cat-personal)';

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '14px 16px',
        textAlign: 'left',
        borderTop: first ? 'none' : '1px solid var(--border)',
        color: 'var(--fg)',
      }}
    >
      <div
        style={{
          width: 4,
          alignSelf: 'stretch',
          background: catColor,
          borderRadius: 2,
          marginRight: 12,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {gasto.descripcion}
        </div>
        <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>
          {gasto.subcategoria}
          {gasto.tipo_cobro === 'CUOTAS' && ` · ${gasto.cuota_actual}/${gasto.cuotas_totales}`}
          {gasto.tipo_cobro === 'MENSUAL' && ' · Mensual'}
        </div>
      </div>
      <div className="num" style={{ fontSize: 14, fontWeight: 600 }}>{fmtCL(gasto.monto)}</div>
    </button>
  );
}
