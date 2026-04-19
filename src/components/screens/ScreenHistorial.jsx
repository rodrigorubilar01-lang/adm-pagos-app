// ScreenHistorial.jsx — lista filtrable por cat/cobro/búsqueda
import { useState, useMemo } from 'react';
import { useGastos } from '../../hooks/useGastos';
import { fmtCL } from '../../lib/helpers';
import TopBar from '../ui/TopBar';
import Chip from '../ui/Chip';
import Card from '../ui/Card';
import Icon from '../ui/Icon';
import { GastoRow } from './ScreenDashboard';

const CATS   = [{ key: 'ALL', label: 'Todos' }, { key: 'PERSONAL', label: 'Personal', tone: 'personal' }, { key: 'NEGOCIO', label: 'Negocio', tone: 'negocio' }, { key: 'AHORRO', label: 'Ahorro', tone: 'ahorro' }];
const COBROS = [{ key: 'ALL', label: 'Todos' }, { key: 'UNICO', label: 'Únicos' }, { key: 'CUOTAS', label: 'Cuotas' }, { key: 'MENSUAL', label: 'Mensuales' }];

export default function ScreenHistorial({ mesFact, usuario, onOpenMes, onOpenExpense }) {
  const { gastos, loading } = useGastos(mesFact);
  const [cat, setCat]       = useState('ALL');
  const [cobro, setCobro]   = useState('ALL');
  const [query, setQuery]   = useState('');

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return gastos.filter(g => {
      if (cat !== 'ALL'   && g.categoria  !== cat)   return false;
      if (cobro !== 'ALL' && g.tipo_cobro !== cobro) return false;
      if (q && !g.descripcion.toLowerCase().includes(q) && !g.subcategoria.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [gastos, cat, cobro, query]);

  const grupos = useMemo(() => {
    const g = {};
    filtrados.forEach(x => { (g[x.fecha] = g[x.fecha] || []).push(x); });
    return Object.entries(g).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtrados]);

  const total = filtrados.reduce((a, g) => a + g.monto, 0);
  const cats  = usuario === 'rodrigo' ? CATS : CATS.filter(c => c.key !== 'NEGOCIO');

  return (
    <div className="app-scroll" style={{ paddingBottom: 120 }}>
      <TopBar title="HISTORIAL" mesFact={mesFact} onOpenMes={onOpenMes} />

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Total filtrado */}
        <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--fg-3)' }}>
              TOTAL FILTRADO
            </div>
            <div className="num" style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{fmtCL(total)}</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{filtrados.length} gastos</div>
        </Card>

        {/* Búsqueda */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 14px',
            height: 44,
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}
        >
          <Icon name="search" size={16} color="var(--fg-3)" />
          <input
            placeholder="Buscar descripción o subcategoría…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ fontSize: 14 }}
          />
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {cats.map(c => (
            <Chip key={c.key} active={cat === c.key} onClick={() => setCat(c.key)} tone={c.tone}>
              {c.label}
            </Chip>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {COBROS.map(c => (
            <Chip key={c.key} active={cobro === c.key} onClick={() => setCobro(c.key)}>
              {c.label}
            </Chip>
          ))}
        </div>

        {/* Lista agrupada por fecha */}
        {grupos.map(([fecha, items]) => (
          <div key={fecha}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                color: 'var(--fg-3)',
                margin: '4px 4px 8px',
              }}
            >
              {fmtFecha(fecha)}
            </div>
            <Card padding={0}>
              {items.map((g, i) => (
                <GastoRow key={g.id} gasto={g} onClick={() => onOpenExpense?.(g)} first={i === 0} />
              ))}
            </Card>
          </div>
        ))}

        {!loading && filtrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--fg-3)', fontSize: 13 }}>
            Sin resultados para los filtros actuales.
          </div>
        )}
      </div>
    </div>
  );
}

function fmtFecha(iso) {
  const [y, m, d] = iso.split('-');
  const MESES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
  return `${parseInt(d)} ${MESES[parseInt(m) - 1]} ${y}`;
}
