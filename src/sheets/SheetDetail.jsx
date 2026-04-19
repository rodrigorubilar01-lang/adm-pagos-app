// SheetDetail.jsx — detalle de un gasto con timeline para cuotas / info mensual
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { fmtCL } from '../lib/helpers';
import Sheet from '../components/ui/Sheet';
import Btn from '../components/ui/Btn';

export default function SheetDetail({ gasto, onClose, onEdit, onDelete }) {
  const [serie, setSerie] = useState([]);

  useEffect(() => {
    if (!gasto?.serie_id) return;
    supabase
      .from('gastos')
      .select('*')
      .eq('serie_id', gasto.serie_id)
      .order('mes_fact', { ascending: true })
      .then(({ data }) => setSerie(data || []));
  }, [gasto?.serie_id]);

  if (!gasto) return null;

  const catColor =
    gasto.categoria === 'NEGOCIO' ? 'var(--cat-negocio)' :
    gasto.categoria === 'AHORRO'  ? 'var(--cat-ahorro)' :
    'var(--cat-personal)';

  return (
    <Sheet
      title={gasto.descripcion}
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" icon="edit" onClick={onEdit} full>Editar</Btn>
          <Btn variant="dangerGhost" icon="trash" onClick={onDelete} full>Eliminar</Btn>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Monto grande */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--fg-3)' }}>
            MONTO
          </div>
          <div className="num" style={{ fontSize: 40, fontWeight: 700, marginTop: 4, letterSpacing: -1 }}>
            {fmtCL(gasto.monto)}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            padding: 14,
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 14,
          }}
        >
          <Info label="CATEGORÍA" value={<span style={{ color: catColor }}>{gasto.categoria}</span>} />
          <Info label="SUBCATEGORÍA" value={gasto.subcategoria} />
          <Info label="TIPO" value={gasto.tipo} />
          <Info label="COBRO" value={gasto.tipo_cobro} />
          <Info label="FECHA" value={gasto.fecha} />
          <Info label="MES FACT." value={gasto.mes_fact} />
        </div>

        {/* Timeline cuotas */}
        {gasto.tipo_cobro === 'CUOTAS' && gasto.serie_id && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--fg-3)', marginBottom: 8 }}>
              CUOTAS · {gasto.cuota_actual}/{gasto.cuotas_totales}
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              {serie.map((s, i) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                    background: s.id === gasto.id ? 'var(--bg-2)' : 'transparent',
                  }}
                >
                  <div style={{ flex: 1, fontSize: 12 }}>
                    <span style={{ fontWeight: 600 }}>{s.cuota_actual}/{s.cuotas_totales}</span>
                    <span style={{ color: 'var(--fg-3)', marginLeft: 8 }}>{s.mes_fact}</span>
                  </div>
                  <div className="num" style={{ fontSize: 12, fontWeight: 600 }}>{fmtCL(s.monto)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensual info */}
        {gasto.tipo_cobro === 'MENSUAL' && (
          <div
            style={{
              padding: 14,
              background: 'var(--bg-2)',
              borderRadius: 14,
              border: '1px solid var(--border)',
              fontSize: 12,
              color: 'var(--fg-2)',
              lineHeight: 1.5,
            }}
          >
            Gasto recurrente. Aparece cada mes en tu facturación.
          </div>
        )}
      </div>
    </Sheet>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'var(--fg-3)' }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  );
}
