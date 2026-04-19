// useGastos.js — fetch y mutaciones de gastos desde Supabase
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { generarCuotas } from '../lib/helpers';

export function useGastos(mesFact) {
  const [gastos, setGastos]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    if (!mesFact) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .eq('mes_fact', mesFact)
      .order('fecha', { ascending: false });
    setGastos(data || []);
    setError(error);
    setLoading(false);
  }, [mesFact]);

  useEffect(() => { fetch(); }, [fetch]);

  // Crear un gasto único o mensual
  async function crearGasto(gasto) {
    if (gasto.tipo_cobro === 'CUOTAS') {
      return crearCuotas(gasto);
    }
    const { error } = await supabase.from('gastos').insert([gasto]);
    if (error) throw error;
    await fetch();
  }

  // Crear serie de cuotas (N registros)
  async function crearCuotas(gasto) {
    const registros = generarCuotas({
      base: {
        user_id:      gasto.user_id,
        descripcion:  gasto.descripcion,
        categoria:    gasto.categoria,
        subcategoria: gasto.subcategoria,
        tipo:         gasto.tipo,
        monto:        gasto.monto,
        fecha:        gasto.fecha,
      },
      cuotas_totales: gasto.cuotas_totales,
      mes_fact_inicio: gasto.mes_fact,
    });
    const { error } = await supabase.from('gastos').insert(registros);
    if (error) throw error;
    await fetch();
  }

  // Eliminar un registro o toda la serie
  async function eliminarGasto(gasto, scope = 'one') {
    if (scope === 'all' && gasto.serie_id) {
      await supabase.from('gastos').delete().eq('serie_id', gasto.serie_id);
    } else {
      await supabase.from('gastos').delete().eq('id', gasto.id);
    }
    await fetch();
  }

  // Editar (delete + re-insert)
  async function editarGasto(gastoOriginal, cambios, scope = 'one') {
    if (scope === 'all' && gastoOriginal.serie_id) {
      // Actualizar todos los registros de la serie (solo descripcion/tipo/monto)
      await supabase.from('gastos')
        .update({ descripcion: cambios.descripcion, tipo: cambios.tipo, monto: cambios.monto })
        .eq('serie_id', gastoOriginal.serie_id);
    } else {
      await supabase.from('gastos')
        .update(cambios)
        .eq('id', gastoOriginal.id);
    }
    await fetch();
  }

  return { gastos, loading, error, refetch: fetch, crearGasto, eliminarGasto, editarGasto };
}
