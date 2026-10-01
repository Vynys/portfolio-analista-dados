const DAY = 86_400_000;
const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR');
const MONTH_SHORT_FORMATTER = new Intl.DateTimeFormat('pt-BR', { month: 'short' });

export const ENVIRONMENTS = ['CORE', 'INTEGRATION', 'CONTAINERS', 'API-GW', 'HML'];
export const CLOSED = new Set(['Resolvido', 'Concluido', 'Concluído', 'Fechado', 'Cancelado']);

export function mondayOf(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIsoLocal(value) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(date) {
  return date ? DATE_FORMATTER.format(date) : '—';
}


export function formatWeek(start) {
  const end = addDays(start, 6);
  const a = String(start.getDate()).padStart(2, '0');
  const b = String(end.getDate()).padStart(2, '0');
  const month = MONTH_SHORT_FORMATTER.format(end).replace('.', '');
  return `${a} a ${b} de ${month}. de ${end.getFullYear()}`;
}

export function availableWeeks(rows) {
  const set = new Map();
  rows.forEach((r) => {
    if (!r.created) return;
    const m = mondayOf(r.created);
    set.set(isoDate(m), m);
  });
  return [...set.values()].sort((a, b) => b - a);
}

export function inWeek(row, start) {
  if (!row.created) return false;
  const end = addDays(start, 7);
  return row.created >= start && row.created < end;
}

export function validDemand(row) {
  return Boolean(row.key) && Boolean(row.type) && row.type !== 'Registro';
}

export function periodRowsAll(rows, start, env = 'Todos') {
  return rows.filter((r) => inWeek(r, start) && Boolean(r.key) && (env === 'Todos' || r.platform === env));
}

export function periodRows(rows, start, env = 'Todos') {
  return periodRowsAll(rows, start, env).filter(validDemand);
}

function finite(values) {
  return values.filter(Number.isFinite);
}

function sum(values) {
  return finite(values).reduce((a, b) => a + b, 0);
}

function avg(values) {
  const clean = finite(values);
  return clean.length ? sum(clean) / clean.length : null;
}

export function loggedHours(rows) {
  let hours = 0;
  let samples = 0;
  for (const row of rows) {
    if (Number.isFinite(row.timeSpentSeconds)) {
      hours += row.timeSpentSeconds / 3600;
      samples++;
    } else if (Number.isFinite(row.correctedDays)) {
      hours += row.correctedDays * 24;
      samples++;
    }
  }
  return { hours, samples };
}

export function formatMinutes(minutes) {
  if (!Number.isFinite(minutes)) return '—';
  const total = Math.round(minutes);
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${String(m).padStart(2, '0')} min`;
}

export function formatDurationHMS(minutes) {
  if (!Number.isFinite(minutes)) return '—';
  const totalSeconds = Math.max(0, Math.round(minutes * 60));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function slaFromFlag(rows, key) {
  const samples = rows.filter((r) => r[key] === 'Não' || r[key] === 'Sim');
  const ok = samples.filter((r) => r[key] === 'Não').length;
  return {
    value: samples.length ? (ok / samples.length) * 100 : null,
    samples: samples.length,
    ok
  };
}

/**
 * Fonte dos indicadores (direto da planilha):
 * - Horas registradas: soma de `Tempo gasto` (segundos) / 3600.
 *   `Tempo Corrigido` só é usado como fallback quando `Tempo gasto` estiver vazio.
 * - TMA: média aritmética dos valores numéricos de `Tempo de Primeiro Atendimento`.
 * - TMR: média aritmética dos valores numéricos de `Tempo de Resolução`.
 * - SLA 1º atendimento: `TMA Rompido = Não` / (`Não` + `Sim`).
 * - SLA resolução: `TMR Rompido = Não` / (`Não` + `Sim`).
 *
 * Zeros numéricos são valores válidos e permanecem na média. Células vazias não entram na média.
 */
export function serviceMetrics(metricRows) {
  let hours = 0;
  let hoursSamples = 0;
  let tmaSum = 0;
  let tmaSamples = 0;
  let tmrSum = 0;
  let tmrSamples = 0;
  let slaFirstSamples = 0;
  let slaFirstOk = 0;
  let slaResolutionSamples = 0;
  let slaResolutionOk = 0;

  for (const row of metricRows) {
    if (Number.isFinite(row.timeSpentSeconds)) {
      hours += row.timeSpentSeconds / 3600;
      hoursSamples++;
    } else if (Number.isFinite(row.correctedDays)) {
      hours += row.correctedDays * 24;
      hoursSamples++;
    }

    if (Number.isFinite(row.firstResponseDays)) {
      tmaSum += row.firstResponseDays * 1440;
      tmaSamples++;
    }
    if (Number.isFinite(row.resolutionDays)) {
      tmrSum += row.resolutionDays * 1440;
      tmrSamples++;
    }

    if (row.tmaBroken === 'Não' || row.tmaBroken === 'Sim') {
      slaFirstSamples++;
      if (row.tmaBroken === 'Não') slaFirstOk++;
    }
    if (row.tmrBroken === 'Não' || row.tmrBroken === 'Sim') {
      slaResolutionSamples++;
      if (row.tmrBroken === 'Não') slaResolutionOk++;
    }
  }

  const slaFirst = slaFirstSamples ? (slaFirstOk / slaFirstSamples) * 100 : null;
  const slaResolution = slaResolutionSamples ? (slaResolutionOk / slaResolutionSamples) * 100 : null;

  return {
    rows: metricRows,
    count: metricRows.length,
    hours,
    hoursSamples,
    tmaMinutes: tmaSamples ? tmaSum / tmaSamples : null,
    tmaSamples,
    tmrMinutes: tmrSamples ? tmrSum / tmrSamples : null,
    tmrSamples,
    slaFirst,
    slaFirstSamples,
    slaFirstOk,
    slaResolution,
    slaResolutionSamples,
    slaResolutionOk,
    sla: slaResolution,
    slaSamples: slaResolutionSamples,
    slaOk: slaResolutionOk
  };
}

export function incidentMetrics(rows) {
  const incidents = [];
  for (const row of rows) if (row.type === 'Incidente') incidents.push(row);
  return { incidents, ...serviceMetrics(incidents) };
}

export function overview(rows, hoursOnlyRows = []) {
  const incidents = [];
  let requests = 0;
  let others = 0;
  for (const row of rows) {
    if (row.type === 'Incidente') incidents.push(row);
    else if (row.type === 'Requisição') requests++;
    else others++;
  }

  const service = serviceMetrics(incidents);
  const recordsForHours = hoursOnlyRows.filter((row) => row.type === 'Registro');
  if (recordsForHours.length) {
    const hourMetric = loggedHours([...incidents, ...recordsForHours]);
    service.hours = hourMetric.hours;
    service.hoursSamples = hourMetric.samples;
  }

  return {
    total: rows.length,
    requests,
    others,
    incidents,
    ...service
  };
}

export function groupCount(rows, getter) {
  const out = new Map();
  rows.forEach((r) => {
    const key = getter(r) ?? 'Não informado';
    out.set(key, (out.get(key) ?? 0) + 1);
  });
  return out;
}

export function weeklySeries(allRows, selectedStart, numberOfWeeks = 4) {
  const starts = [];
  for (let i = numberOfWeeks - 1; i >= 0; i--) starts.push(addDays(selectedStart, -7 * i));
  return starts.map((start) => {
    const allWeekRows = periodRowsAll(allRows, start);
    const rows = allWeekRows.filter(validDemand);
    const inc = incidentMetrics(rows);
    const recordHours = allWeekRows.filter((r) => r.type === 'Registro');
    const hourMetric = loggedHours([...inc.incidents, ...recordHours]);
    return {
      start,
      total: rows.length,
      incidents: inc.count,
      requests: rows.filter((r) => r.type === 'Requisição').length,
      others: rows.filter((r) => r.type !== 'Incidente' && r.type !== 'Requisição').length,
      hours: hourMetric.hours,
      hoursSamples: inc.hoursSamples,
      tma: inc.tmaMinutes,
      tmaSamples: inc.tmaSamples,
      tmr: inc.tmrMinutes,
      tmrSamples: inc.tmrSamples,
      slaFirst: inc.slaFirst,
      slaFirstSamples: inc.slaFirstSamples,
      slaResolution: inc.slaResolution,
      slaResolutionSamples: inc.slaResolutionSamples,
      sla: inc.slaResolution,
      slaSamples: inc.slaResolutionSamples
    };
  });
}

export function environmentStats(rows) {
  const buckets = new Map(ENVIRONMENTS.map((env) => [env, []]));
  for (const row of rows) {
    if (row.type === 'Incidente' && buckets.has(row.platform)) buckets.get(row.platform).push(row);
  }
  return ENVIRONMENTS.map((env) => {
    const incidents = buckets.get(env);
    const inc = serviceMetrics(incidents);
    return {
      env, incidents: inc.count, hours: inc.hours, hoursSamples: inc.hoursSamples,
      tma: inc.tmaMinutes, tmaSamples: inc.tmaSamples,
      tmr: inc.tmrMinutes, tmrSamples: inc.tmrSamples,
      slaFirst: inc.slaFirst, slaFirstSamples: inc.slaFirstSamples,
      slaResolution: inc.slaResolution, slaResolutionSamples: inc.slaResolutionSamples,
      sla: inc.slaResolution, slaSamples: inc.slaResolutionSamples
    };
  });
}

export function backlogSnapshot(rows, asOf = new Date()) {
  const endOfDay = new Date(asOf);
  endOfDay.setHours(23, 59, 59, 999);
  const open = rows.filter((r) => {
    if (!r.created || r.created > endOfDay) return false;
    if (r.resolved && r.resolved <= endOfDay) return false;
    if (!r.resolved && CLOSED.has(r.status)) return false;
    return true;
  });
  const enriched = open.map((r) => ({ ...r, ageDays: Math.max(0, Math.floor((endOfDay - r.created) / DAY)) }));
  const ages = enriched.map((r) => r.ageDays);
  return {
    rows: enriched.sort((a, b) => b.ageDays - a.ageDays),
    openCount: enriched.length,
    over7: enriched.filter((r) => r.ageDays > 7).length,
    oldest: ages.length ? Math.max(...ages) : null,
    average: ages.length ? ages.reduce((a, b) => a + b, 0) / ages.length : null
  };
}

