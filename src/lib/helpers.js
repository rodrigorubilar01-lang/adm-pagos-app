// helpers.js — formato CLP, cálculo de mes_fact, generación de series

const MESES_LABEL = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
                     'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];

// ── Formato numérico ──────────────────────────
export function fmt(n) {
  return Math.round(n).toLocaleString('es-CL').replace(/,/g, '.');
}
export function fmtCL(n) {
  return '$' + fmt(n);
}

// ── Mes actual / siguiente como string ────────
export function getMesActual() {
  const d = new Date();
  return `${MESES_LABEL[d.getMonth()]} ${d.getFullYear()}`;
}
export function getMesSiguiente() {
  const d = new Date();
  const nextMonth = (d.getMonth() + 1) % 12;
  const nextYear = d.getMonth() === 11 ? d.getFullYear() + 1 : d.getFullYear();
  return `${MESES_LABEL[nextMonth]} ${nextYear}`;
}

// ── Calcular mes_fact según día de corte ──────
// Si fecha > diaCorte → siguiente mes
export function calcMesFact(fecha, diaCorte) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  const day = d.getDate();
  if (day > diaCorte) {
    const nextMonth = (d.getMonth() + 1) % 12;
    const nextYear = d.getMonth() === 11 ? d.getFullYear() + 1 : d.getFullYear();
    return `${MESES_LABEL[nextMonth]} ${nextYear}`;
  }
  return `${MESES_LABEL[d.getMonth()]} ${d.getFullYear()}`;
}

// ── Generar registros de cuotas ───────────────
// Devuelve array de objetos para insertar en gastos[]
export function generarCuotas({ base, cuotas_totales, mes_fact_inicio }) {
  const [mesStr, yearStr] = mes_fact_inicio.split(' ');
  const mesIdx = MESES_LABEL.indexOf(mesStr);
  const year = parseInt(yearStr);
  const result = [];
  const serieId = crypto.randomUUID();

  for (let i = 0; i < cuotas_totales; i++) {
    const m = (mesIdx + i) % 12;
    const y = year + Math.floor((mesIdx + i) / 12);
    result.push({
      ...base,
      cuota_actual: i + 1,
      cuotas_totales,
      serie_id: serieId,
      mes_fact: `${MESES_LABEL[m]} ${y}`,
      tipo_cobro: 'CUOTAS',
    });
  }
  return result;
}

// ── Desglose por kind (UNICO / CUOTAS / MENSUAL) ──
export function breakdownByKind(gastos) {
  const acc = { UNICO: [], CUOTAS: [], MENSUAL: [] };
  gastos.forEach(g => { (acc[g.tipo_cobro] || acc.UNICO).push(g); });
  const sum = arr => arr.reduce((a, g) => a + g.monto, 0);
  return {
    unicos:    { items: acc.UNICO,   total: sum(acc.UNICO),   count: acc.UNICO.length },
    cuotas:    { items: acc.CUOTAS,  total: sum(acc.CUOTAS),  count: acc.CUOTAS.length },
    mensuales: { items: acc.MENSUAL, total: sum(acc.MENSUAL), count: acc.MENSUAL.length },
  };
}

// ── Totales por categoría ──────────────────────
export function totalsByCat(gastos) {
  const acc = { PERSONAL: 0, NEGOCIO: 0, AHORRO: 0 };
  gastos.forEach(g => { acc[g.categoria] = (acc[g.categoria] || 0) + g.monto; });
  return acc;
}
