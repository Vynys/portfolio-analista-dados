import {
  Chart, BarController, LineController, DoughnutController,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement,
  Tooltip, Legend, Filler
} from 'chart.js';
import '@fontsource-variable/inter';
import './styles.css';
import { loadData } from './data.js';
import {
  ENVIRONMENTS, addDays, availableWeeks, backlogSnapshot, environmentStats, formatDate,
  formatDurationHMS, formatWeek, groupCount, isoDate, overview, parseIsoLocal,
  loggedHours, periodRows, periodRowsAll, serviceMetrics
} from './metrics.js';

Chart.register(
  BarController, LineController, DoughnutController,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement,
  Tooltip, Legend, Filler
);

const BASE = import.meta.env.BASE_URL;

Chart.defaults.font.family = '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
Chart.defaults.font.size = 12;
Chart.defaults.font.weight = '500';
Chart.defaults.color = '#bcd4d5';

const DEVICE_MEMORY_GB = Number(navigator.deviceMemory) || 8;
const MAX_CANVAS_DPR = DEVICE_MEMORY_GB <= 4 ? 1.25 : 1.5;
const CHART_ROOT_MARGIN = '240px 0px';
const CHART_UNLOAD_DELAY = 900;

const ICON_PATHS = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5"/><path d="M8.5 9h7"/><path d="M8.5 13h7"/><path d="M8.5 17h4"/>',
  archive: '<path d="M4 7h16v13H4z"/><path d="M3 4h18v3H3z"/><path d="M9 11h6"/>',
  boxes: '<path d="m12 2 4 2.3v4.4L12 11 8 8.7V4.3L12 2Z"/><path d="m6 12 4 2.3v4.4L6 21l-4-2.3v-4.4L6 12Z"/><path d="m18 12 4 2.3v4.4L18 21l-4-2.3v-4.4l4-2.3Z"/>',
  checkSquare: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m7.5 12 3 3 6-7"/>',
  ticket: '<path d="M3 8a2 2 0 0 0 0 4v5h18v-5a2 2 0 0 0 0-4V3H3v5Z"/><path d="M13 6h4"/><path d="M13 10h4"/><path d="M13 14h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  gauge: '<path d="M4.6 19a9 9 0 1 1 14.8 0"/><path d="m12 13 4-4"/><path d="M12 13h.01"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5"/><path d="M9 2h6"/><path d="M12 2v3"/>',
  shield: '<path d="M12 3 19 6v5c0 4.8-2.8 8-7 10-4.2-2-7-5.2-7-10V6l7-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
  alert: '<path d="M10.3 3.8 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
  activity: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  pie: '<path d="M11 3a9 9 0 1 0 9 9h-9V3Z"/><path d="M14 3.5A7.5 7.5 0 0 1 20.5 10H14V3.5Z"/>',
  compare: '<path d="M7 7h12l-3-3"/><path d="m19 7-3 3"/><path d="M17 17H5l3 3"/><path d="m5 17 3-3"/>',
  priority: '<path d="M6 5h15"/><path d="M6 12h10"/><path d="M6 19h5"/><circle cx="3" cy="5" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="19" r="1"/>',
  barChart: '<path d="M4 20V10h4v10"/><path d="M10 20V4h4v16"/><path d="M16 20v-7h4v7"/>',
  calendarClock: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M3 10h18"/><circle cx="15.5" cy="15.5" r="3"/><path d="M15.5 14v1.7l1.2.8"/>',
  inbox: '<path d="M4 4h16l2 11v5H2v-5L4 4Z"/><path d="M2 15h5l2 2h6l2-2h5"/>',
  hourglass: '<path d="M6 3h12"/><path d="M6 21h12"/><path d="M7 3c0 4 1.5 6.5 5 9-3.5 2.5-5 5-5 9"/><path d="M17 3c0 4-1.5 6.5-5 9 3.5 2.5 5 5 5 9"/>',
  server: '<rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01"/><path d="M7 17h.01"/><path d="M11 7h6"/><path d="M11 17h6"/>',
  flask: '<path d="M9 3h6"/><path d="M10 3v5.5l-5.5 9a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3l-5.5-9V3"/><path d="M8 14h8"/>',
  workflow: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h4a3 3 0 0 1 3 3v6"/><path d="m13 12 3 3 3-3"/>',
  sparkles: '<path d="m12 3 1.1 3.3L16.5 7.5l-3.4 1.2L12 12l-1.1-3.3-3.4-1.2 3.4-1.2L12 3Z"/><path d="m18.5 13 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/><path d="m5.5 13 .7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M3 10h18"/>',
  arrowUpRight: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  close: '<path d="m6 6 12 12"/><path d="m18 6-12 12"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7h.01"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/>',
  circleCheck: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M3 15h18"/><path d="M9 4v16"/><path d="M15 4v16"/>'
};

function icon(name, className = 'ui-icon') {
  const paths = ICON_PATHS[name] || ICON_PATHS.activity;
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

const state = {
  page: 'overview',
  week: null,
  env: 'Todos',
  demandTab: 'Incidente',
  demandFilterWeek: null,
  demandFilterDay: null,
  demandPriority: null,
  overviewFilterWeek: null,
  overviewType: null,
  backlogAgeBucket: null,
  backlogStatus: null,
  environmentFilterWeek: null,
  environmentSelected: null,
  improvementMonth: null,
  improvementStatus: null,
  weekRefreshToken: 0,
  data: null,
  charts: new Map(),
  chartObserver: null,
  pendingCharts: new Map(),
  chartUnloadTimers: new Map(),
  chartTransitionSnapshots: new Map(),
  modalChart: null,
  metricDetails: new Map(),
  cache: {
    period: new Map(),
    periodAll: new Map(),
    weekly: new Map()
  }
};

const app = document.querySelector('#app');

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function destroyCharts() {
  state.chartObserver?.disconnect();
  state.chartObserver = null;
  state.chartUnloadTimers.forEach((timer) => clearTimeout(timer));
  state.chartUnloadTimers.clear();
  state.pendingCharts.clear();
  state.charts.forEach((chart) => chart.destroy());
  state.charts.clear();
  if (state.modalChart) {
    state.modalChart.destroy();
    state.modalChart = null;
  }
}

function navItem(page, iconName, label) {
  return `<button class="nav-item ${state.page === page ? 'active' : ''}" data-section="${page}" aria-label="Ir para ${label}">
    <span class="nav-icon">${icon(iconName, 'nav-icon-svg')}</span><span>${label}</span>
  </button>`;
}

function slicerMarkup({ id, iconName, label, value, options, optionAttr, compact = false }) {
  const items = options.map((option) => `
    <button type="button" class="slicer-option ${option.selected ? 'selected' : ''}" ${optionAttr}="${esc(option.value)}" role="option" aria-selected="${option.selected ? 'true' : 'false'}">
      <span>${esc(option.label)}</span><span class="slicer-check-wrap">${icon('circleCheck','slicer-check')}</span>
    </button>`).join('');
  return `<details class="data-slicer ${compact ? 'compact' : ''}" id="${id}">
    <summary aria-label="${esc(label)}: ${esc(value)}">
      <span class="slicer-icon">${icon(iconName,'slicer-icon-svg')}</span>
      <span class="slicer-copy"><small>${esc(label)}</small><strong data-slicer-value>${esc(value)}</strong></span>
      <span class="slicer-chevron" aria-hidden="true">⌄</span>
    </summary>
    <div class="slicer-menu" role="listbox" aria-label="${esc(label)}">${items}</div>
  </details>`;
}

function weekSelectMarkup() {
  const weeks = availableWeeks(state.data.main);
  return slicerMarkup({
    id:'weekSlicer', iconName:'calendar', label:'Período', value:`Semana de ${formatWeek(state.week)}`, optionAttr:'data-week-option',
    options:weeks.map((d)=>({ value:isoDate(d), label:`Semana de ${formatWeek(d)}`, selected:isoDate(d)===isoDate(state.week) }))
  });
}

function environmentSelectMarkup() {
  return slicerMarkup({
    id:'envSlicer', iconName:'server', label:'Plataforma', value:state.env==='Todos'?'Todas as plataformas':state.env, optionAttr:'data-env-option', compact:true,
    options:['Todos',...ENVIRONMENTS].map((env)=>({ value:env, label:env==='Todos'?'Todas as plataformas':env, selected:env===state.env }))
  });
}

function shell(content) {
  return `
  <div class="app-shell one-page-shell">
    <aside class="sidebar">
      <div class="brand brand-side"><span class="brand-mark" aria-hidden="true">SO</span><div><b>SERVICEOPS</b><small>ANALYTICS</small></div></div>
      <nav aria-label="Seções do dashboard">
        ${navItem('overview','home','Visão geral')}
        ${navItem('demands','clipboard','Demandas')}
        ${navItem('backlog','archive','Backlog')}
        ${navItem('environments','boxes','Ambientes')}
        ${navItem('improvements','checkSquare','Melhorias')}
      </nav>
      <div class="sidebar-progress" aria-hidden="true"><span id="sidebarProgressBar"></span></div>
      <div class="sidebar-foot"><span class="portfolio-label">PORTFOLIO PROJECT</span></div>
    </aside>
    <main class="main-area">
      <header class="topbar sticky-topbar">
        <div class="brand brand-top"><span class="brand-mark" aria-hidden="true">SO</span><div><b>SERVICEOPS</b><small>ANALYTICS</small></div><div class="brand-divider"></div><div class="tagline">MONITORA<br>ANALISA<br>EVOLUI</div></div>
        <div class="topbar-context"><span class="context-dot"></span><span id="currentSectionLabel">Visão geral</span></div>
        <div class="top-controls">${weekSelectMarkup()}</div>
        <div class="portfolio-badge">DEMO DATA</div>
      </header>
      <div class="one-page-content">${content}</div>
      <footer><span class="footer-note">Projeto pessoal • dados 100% sintéticos</span></footer>
    </main>
  </div>`;
}

function sectionBlock(id, title, subtitle, content, { controls = '', eyebrow = '' } = {}) {
  return `<section id="section-${id}" class="dashboard-section" data-dashboard-section="${id}">
    <header class="section-head">
      <div class="section-title-wrap">
        ${eyebrow ? `<span class="section-eyebrow">${eyebrow}</span>` : ''}
        <h2>${title}</h2>
        <p>${subtitle} <span>| ServiceOps Analytics</span></p>
      </div>
      ${controls ? `<div class="section-controls">${controls}</div>` : ''}
    </header>
    <div class="section-body">${content}</div>
  </section>`;
}

function percentChange(current, previous, { minimumBaseline = 0 } = {}) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  if (Math.abs(previous) <= minimumBaseline) return current === previous ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function signed(value, digits = 1) {
  if (!Number.isFinite(value)) return '—';
  const formatted = Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  if (value > 0) return `+${formatted}%`;
  if (value < 0) return `-${formatted}%`;
  return `${formatted}%`;
}

function signedPoints(value, digits = 2) {
  if (!Number.isFinite(value)) return '—';
  const formatted = Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  if (value > 0) return `+${formatted} p.p.`;
  if (value < 0) return `-${formatted} p.p.`;
  return `${formatted} p.p.`;
}

/**
 * Comparação segura entre duas semanas.
 * - SLA é comparado em pontos percentuais, não por variação relativa.
 * - Horas com base anterior < 1 h não exibem percentuais inflados (ex.: +62.480%).
 * - Métricas sem amostra ficam como "sem base" em vez de zero artificial.
 */
function comparisonFromSeries(series, direction = 'neutral', kind = 'percent') {
  const current = series.at(-1)?.value;
  const previous = series.at(-2)?.value;

  let delta = null;
  let text = 'sem base';
  if (kind === 'points') {
    if (Number.isFinite(current) && Number.isFinite(previous)) {
      delta = current - previous;
      text = signedPoints(delta);
    }
  } else {
    const minimumBaseline = kind === 'hours' ? 1 : 0;
    delta = percentChange(current, previous, { minimumBaseline });
    text = delta == null ? 'sem base' : signed(delta);
  }

  let tone = 'neutral';
  if (delta != null && delta !== 0 && direction !== 'neutral') {
    const improved = direction === 'higher' ? delta > 0 : delta < 0;
    tone = improved ? 'better' : 'worse';
  }
  return {
    delta,
    tone,
    arrow: delta == null || delta === 0 ? '→' : delta > 0 ? '↑' : '↓',
    text,
    kind
  };
}

function kpiIcon(label = '') {
  const text = label.toLowerCase();
  if (text.includes('chamado')) return 'ticket';
  if (text.includes('incidente')) return 'alert';
  if (text.includes('requisi')) return 'clipboard';
  if (text.includes('horas')) return 'clock';
  if (text.includes('tma')) return 'gauge';
  if (text.includes('tmr')) return 'timer';
  if (text.includes('sla')) return 'shield';
  if (text.includes('maior idade')) return 'hourglass';
  if (text.includes('idade média')) return 'clock';
  if (text.includes('7 dias')) return 'calendarClock';
  if (text.includes('aberto')) return 'inbox';
  if (text.includes('andamento')) return 'workflow';
  if (text.includes('aguard')) return 'hourglass';
  if (text.includes('to do') || text.includes('a fazer')) return 'calendar';
  if (text.includes('conclu')) return 'circleCheck';
  if (text.includes('planejad')) return 'calendar';
  if (text.includes('produtividade')) return 'trend';
  return 'activity';
}

function kpi(label, value, { sub = '', accent = '', detailKey = '', comparison = null } = {}) {
  const tag = detailKey ? 'button' : 'article';
  const detailAttrs = detailKey ? ` type="button" data-detail-key="${esc(detailKey)}" aria-label="Abrir detalhamento de ${esc(label)}" title="Abrir detalhamento"` : '';
  return `<${tag} class="kpi ${accent} ${detailKey ? 'kpi-clickable' : ''}"${detailAttrs}>
    <div class="kpi-top">
      <div class="kpi-main">
        <span class="kpi-icon-box">${icon(kpiIcon(label), 'kpi-icon-svg')}</span>
        <div class="kpi-copy"><div class="kpi-value ${/(^|\s)(TMA|TMR)(\s|$)/i.test(label) ? 'kpi-value-time' : ''}">${value}</div><div class="kpi-label">${label}</div></div>
      </div>
      ${detailKey ? `<span class="kpi-open">${icon('arrowUpRight','open-icon')}</span>` : ''}
    </div>
    ${(comparison || sub) ? `<div class="kpi-meta">${comparison ? `<span class="kpi-delta ${comparison.tone}">${comparison.arrow} ${comparison.text}</span><span class="kpi-compare-label">vs semana anterior</span>` : ''}${sub ? `<span class="kpi-sub">${sub}</span>` : ''}</div>` : ''}
  </${tag}>`;
}

function chartIcon(title = '') {
  const text = title.toLowerCase();
  if (text.includes('evolução')) return 'trend';
  if (text.includes('distribuição')) return 'pie';
  if (text.includes('prioridade')) return 'priority';
  if (text.includes('tempo')) return 'clock';
  if (text.includes('sla')) return 'shield';
  if (text.includes('status')) return 'list';
  if (text.includes('comparativo')) return 'compare';
  if (text.includes('produção')) return 'barChart';
  return 'barChart';
}

function panelHeading(title, iconName = null, meta = '') {
  const resolvedIcon = iconName || chartIcon(title);
  return `<div class="panel-heading">
    <span class="panel-icon">${icon(resolvedIcon,'panel-icon-svg')}</span>
    <h3>${title}</h3>
    ${meta ? `<span class="panel-meta">${meta}</span>` : ''}
  </div>`;
}

function chartCard(title, id, extraClass = '') {
  return `<article class="panel ${extraClass}">${panelHeading(title)}<div class="chart-box"><canvas id="${id}"></canvas></div></article>`;
}

function shortDayLabel(date) {
  const names = ['dom','seg','ter','qua','qui','sex','sáb'];
  return `${names[date.getDay()]} ${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}`;
}

function shortWeekLabel(start) {
  const end = addDays(start, 6);
  const fmt = (d) => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
  return `${fmt(start)}–${fmt(end)}`;
}

function roundedRectPath(ctx, x, y, width, height, radius = 4) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const valueLabelsPlugin = {
  id: 'valueLabels',
  afterDatasetsDraw(chart, _args, options) {
    if (!options || options.display === false) return;
    const { ctx, chartArea } = chart;
    const fontSize = Math.round(options.fontSize ?? 12);
    const fontWeight = options.fontWeight ?? 800;
    const formatter = options.formatter ?? ((value) => formatInteger(value));
    const type = chart.config.type;
    const padX = Math.round(options.paddingX ?? 8);
    const padY = Math.round(options.paddingY ?? 4);

    const resolveStyle = (setting, context, fallback) => {
      if (typeof setting === 'function') return setting(context);
      if (Array.isArray(setting)) return setting[context.dataIndex] ?? fallback;
      return setting ?? fallback;
    };

    const datasetColor = (dataset, dataIndex) => {
      const pick = (value) => Array.isArray(value) ? value[dataIndex] : value;
      const border = pick(dataset.borderColor);
      const background = pick(dataset.backgroundColor);
      // Doughnut/pie charts normally use a dark separator border. Using that border
      // as the label accent made the colored stripe disappear. Prefer the slice
      // color so every value badge keeps the same visual identity as its segment.
      if ((type === 'doughnut' || type === 'pie') && typeof background === 'string') return background;
      if (typeof border === 'string' && !border.startsWith('rgba(0, 0, 0, 0')) return border;
      if (typeof background === 'string') return background;
      return '#42f2c0';
    };

    ctx.save();
    ctx.font = `${fontWeight} ${fontSize}px "Inter Variable", "Inter", sans-serif`;
    ctx.textBaseline = 'middle';

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (meta.hidden) return;

      meta.data.forEach((element, dataIndex) => {
        const raw = dataset.data?.[dataIndex];
        const value = typeof raw === 'object' && raw !== null
          ? (Number.isFinite(raw.y) ? raw.y : raw.x)
          : raw;
        if (!Number.isFinite(value)) return;

        const context = { chart, dataset, datasetIndex, dataIndex, value };
        const text = formatter(value, context);
        if (text == null || text === '') return;

        const accent = datasetColor(dataset, dataIndex);
        const textColor = resolveStyle(options.color, context, accent);
        const bgColor = resolveStyle(options.backgroundColor, context, 'rgba(4, 42, 45, .98)');
        const borderColor = resolveStyle(options.borderColor, context, accent);

        let x;
        let y;
        let align = 'center';

        if (type === 'doughnut' || type === 'pie') {
          const props = element.getProps(['x', 'y', 'startAngle', 'endAngle', 'innerRadius', 'outerRadius'], true);
          const arc = props.endAngle - props.startAngle;
          if (arc < (options.minArc ?? 0.12)) return;
          const angle = (props.startAngle + props.endAngle) / 2;
          const radius = props.innerRadius + (props.outerRadius - props.innerRadius) * 0.58;
          x = props.x + Math.cos(angle) * radius;
          y = props.y + Math.sin(angle) * radius;
        } else if (type === 'bar' && chart.options.indexAxis === 'y') {
          const props = element.getProps(['x','y','base'], true);
          const positive = props.x >= props.base;
          x = props.x + (positive ? 11 : -11);
          y = props.y;
          align = positive ? 'left' : 'right';
        } else if (type === 'bar' && options.position === 'center') {
          const pos = element.getCenterPoint();
          x = pos.x;
          y = pos.y;
        } else if (type === 'bar') {
          const props = element.getProps(['x','y','base'], true);
          x = props.x;
          y = Math.min(props.y, props.base) - (options.offset ?? 13);
        } else {
          const pos = element.tooltipPosition();
          x = pos.x;
          y = pos.y - (options.offset ?? 14);
        }

        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        // Labels are snapped to whole CSS pixels before Chart.js applies the DPR transform.
        // This avoids the half-pixel rasterization that made the text look doubled/soft.
        x = Math.round(x);
        y = Math.round(y);
        const metrics = ctx.measureText(String(text));
        const accentBar = options.accentBar === false ? 0 : 3;
        const accentGap = accentBar ? 5 : 0;
        const width = Math.ceil(metrics.width) + padX * 2 + accentBar + accentGap;
        const height = Math.ceil(fontSize * 1.28) + padY * 2;
        let left = align === 'left' ? x : align === 'right' ? x - width : x - width / 2;
        let top = y - height / 2;
        if (chartArea) {
          left = Math.max(chartArea.left + 1, Math.min(left, chartArea.right - width - 1));
          top = Math.max(chartArea.top + 1, Math.min(top, chartArea.bottom - height - 1));
        }
        left = Math.round(left);
        top = Math.round(top);

        ctx.save();
        // No glow/shadow: colored canvas shadows were the main cause of the 'tremido' look.
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        roundedRectPath(ctx, left, top, width, height, 6);
        ctx.fillStyle = bgColor;
        ctx.fill();
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = options.borderWidth ?? 1;
        ctx.stroke();

        if (accentBar) {
          const barX = left + padX;
          const barY = top + Math.round((height - Math.max(9, fontSize)) / 2);
          roundedRectPath(ctx, barX, barY, accentBar, Math.max(9, fontSize), 2);
          ctx.fillStyle = accent;
          ctx.fill();
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = resolveStyle(options.textColor, context, '#f4ffff');
        const textAreaLeft = left + padX + accentBar + accentGap;
        const textAreaWidth = width - (padX * 2 + accentBar + accentGap);
        ctx.fillText(String(text), Math.round(textAreaLeft + textAreaWidth / 2), Math.round(top + height / 2));
        ctx.restore();
      });
    });
    ctx.restore();
  }
};


Chart.register(valueLabelsPlugin);

function gradientFill(top, bottom) {
  return (context) => {
    const { chart } = context;
    const area = chart.chartArea;
    if (!area) return top;
    chart.$serviceOpsGradients ??= new Map();
    const key = `${top}|${bottom}|${Math.round(area.top)}|${Math.round(area.bottom)}`;
    if (!chart.$serviceOpsGradients.has(key)) {
      const gradient = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
      gradient.addColorStop(0, top);
      gradient.addColorStop(1, bottom);
      chart.$serviceOpsGradients.set(key, gradient);
    }
    return chart.$serviceOpsGradients.get(key);
  };
}

const legendGlowCache = new Map();

function legendGlowMarker(color = '#25e4ad') {
  const safeColor = typeof color === 'string' && color ? color : '#25e4ad';
  if (legendGlowCache.has(safeColor)) return legendGlowCache.get(safeColor);

  const marker = document.createElement('canvas');
  marker.width = 16;
  marker.height = 16;
  const ctx = marker.getContext('2d');
  if (!ctx) return 'circle';

  ctx.save();
  ctx.shadowColor = safeColor;
  ctx.shadowBlur = 6;
  ctx.fillStyle = safeColor;
  ctx.beginPath();
  ctx.arc(8, 8, 4.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Bright solid core keeps the marker crisp while the outer pixels create the glow.
  ctx.fillStyle = safeColor;
  ctx.beginPath();
  ctx.arc(8, 8, 3.7, 0, Math.PI * 2);
  ctx.fill();

  legendGlowCache.set(safeColor, marker);
  return marker;
}

function glowLegendGenerateLabels(chart) {
  const defaultGenerate = Chart.defaults.plugins.legend.labels.generateLabels;
  return defaultGenerate(chart).map((item) => {
    const color = typeof item.strokeStyle === 'string'
      ? item.strokeStyle
      : (typeof item.fillStyle === 'string' ? item.fillStyle : '#25e4ad');
    return { ...item, pointStyle: legendGlowMarker(color) };
  });
}

function baseChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 150,
    // Keep native monitor density for crisp canvas text; cap only extreme DPR values.
    devicePixelRatio: Math.min(Math.max(window.devicePixelRatio || 1, 1), MAX_CANVAS_DPR),
    animation: false,
    normalized: true,
    events: ['mousemove','mouseout','click','touchstart'],
    interaction: { mode: 'index', intersect: false },
    elements: {
      line: { borderWidth: 2.4 },
      point: { radius: 3.5, hoverRadius: 5.5, borderWidth: 2 }
    },
    plugins: {
      legend: {
        labels: {
          color: '#d6ecec',
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          pointStyleWidth: 12,
          generateLabels: glowLegendGenerateLabels,
          padding: 16,
          font: { size: 12, weight: '650' }
        }
      },
      valueLabels: {
        display: true,
        backgroundColor: 'rgba(4, 42, 45, .98)',
        textColor: '#f4ffff',
        fontSize: 12,
        fontWeight: 800,
        borderWidth: 1,
        accentBar: true,
        formatter: (value) => formatInteger(value)
      },
      tooltip: {
        backgroundColor: 'rgba(2, 23, 26, .98)',
        titleColor: '#ffffff',
        bodyColor: '#def7f5',
        borderColor: 'rgba(60, 240, 193, .38)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        titleFont: { size: 13, weight: '750' },
        bodyFont: { size: 12, weight: '550' }
      }
    },
    scales: {
      x: {
        border: { display: false },
        ticks: { color: '#aec9cb', font: { size: 11, weight: '600' } },
        grid: { color: 'rgba(125, 185, 187, .055)', drawTicks: false }
      },
      y: {
        border: { display: false },
        ticks: { color: '#9fbabc', font: { size: 11, weight: '600' } },
        grid: { color: 'rgba(125, 185, 187, .065)', drawTicks: false },
        beginAtZero: true
      }
    }
  };
}

function chartOptions(overrides = {}) {
  const base = baseChartOptions();
  return {
    ...base,
    ...overrides,
    plugins: {
      ...base.plugins,
      ...(overrides.plugins || {}),
      legend: {
        ...base.plugins.legend,
        ...(overrides.plugins?.legend || {}),
        labels: {
          ...base.plugins.legend.labels,
          ...(overrides.plugins?.legend?.labels || {})
        }
      }
    },
    scales: overrides.scales === false ? undefined : { ...base.scales, ...(overrides.scales || {}) }
  };
}

function legendWithValues(chart) {
  const labels = Array.isArray(chart.data.labels) ? chart.data.labels : [];
  const dataset = chart.data.datasets?.[0] || {};
  const values = Array.isArray(dataset.data) ? dataset.data : [];
  const colors = Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor : [];
  const borders = Array.isArray(dataset.borderColor) ? dataset.borderColor : [];
  const total = values.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);

  return labels.map((label, index) => {
    const value = values[index];
    const pct = total > 0 && Number.isFinite(value) ? (value / total) * 100 : null;
    return {
      text: `${String(label)} · ${formatInteger(value)}${Number.isFinite(pct) ? ` (${pct.toLocaleString('pt-BR',{maximumFractionDigits:1})}%)` : ''}`,
      fillStyle: colors[index] ?? '#25e4ad',
      strokeStyle: borders[index] ?? colors[index] ?? '#25e4ad',
      lineWidth: 1,
      hidden: !chart.getDataVisibility(index),
      index,
      pointStyle: legendGlowMarker(
        typeof (borders[index] ?? colors[index]) === 'string'
          ? (borders[index] ?? colors[index])
          : '#25e4ad'
      ),
      fontColor: '#d9eeee'
    };
  });
}

function integerGridAxis({ min, max, beginAtZero = true } = {}) {
  return {
    ...baseChartOptions().scales.y,
    beginAtZero,
    ...(Number.isFinite(min) ? { min } : {}),
    ...(Number.isFinite(max) ? { max } : {}),
    ticks: {
      ...baseChartOptions().scales.y.ticks,
      stepSize: 1,
      callback: (value) => Number.isInteger(Number(value)) ? Number(value).toLocaleString('pt-BR') : ''
    },
    grid: { color: 'rgba(138, 191, 193, .045)', drawTicks: false }
  };
}

function cloneChartValue(value) {
  if (Array.isArray(value)) return value.map(cloneChartValue);
  if (value && typeof value === 'object') return { ...value };
  return value;
}

function captureChartSnapshots(root) {
  if (!root) return;
  root.querySelectorAll('canvas[id]').forEach((canvas) => {
    const chart = state.charts.get(canvas.id);
    if (!chart) return;
    state.chartTransitionSnapshots.set(canvas.id, {
      labels: Array.isArray(chart.data.labels) ? [...chart.data.labels] : [],
      datasets: chart.data.datasets.map((dataset) => ({
        data: Array.isArray(dataset.data) ? dataset.data.map(cloneChartValue) : []
      })),
      capturedAt: performance.now()
    });
  });
}

function mapPreviousValues(snapshot, targetLabels, datasetIndex, targetData) {
  const previous = snapshot?.datasets?.[datasetIndex]?.data;
  if (!Array.isArray(previous) || !Array.isArray(targetData)) return null;
  const previousLabels = Array.isArray(snapshot.labels) ? snapshot.labels : [];
  const indexByLabel = new Map(previousLabels.map((label, index) => [String(label), index]));
  return targetData.map((targetValue, targetIndex) => {
    const label = String(targetLabels?.[targetIndex] ?? targetIndex);
    const previousIndex = indexByLabel.has(label) ? indexByLabel.get(label) : targetIndex;
    const previousValue = previous[previousIndex];
    if (typeof targetValue === 'number') return Number.isFinite(previousValue) ? previousValue : 0;
    if (targetValue && typeof targetValue === 'object') {
      const fallback = Number.isFinite(previousValue?.y) ? previousValue.y : Number.isFinite(previousValue?.x) ? previousValue.x : 0;
      return { ...targetValue, ...(Number.isFinite(targetValue.y) ? { y: fallback } : {}), ...(Number.isFinite(targetValue.x) ? { x: fallback } : {}) };
    }
    return targetValue;
  });
}

function instantiateChartWithTransition(id, canvas, config, snapshot) {
  const targetLabels = Array.isArray(config.data?.labels) ? [...config.data.labels] : [];
  const targetDatasets = (config.data?.datasets || []).map((dataset) => ({
    ...dataset,
    data: Array.isArray(dataset.data) ? dataset.data.map(cloneChartValue) : dataset.data
  }));

  const initialDatasets = targetDatasets.map((dataset, datasetIndex) => {
    const mapped = mapPreviousValues(snapshot, targetLabels, datasetIndex, dataset.data);
    return mapped ? { ...dataset, data: mapped } : dataset;
  });

  const initialConfig = {
    ...config,
    data: { ...config.data, labels: targetLabels, datasets: initialDatasets },
    options: { ...config.options, animation: false }
  };
  const chart = new Chart(canvas, initialConfig);
  state.charts.set(id, chart);

  requestAnimationFrame(() => {
    if (!chart.canvas?.isConnected || state.charts.get(id) !== chart) return;
    chart.data.labels = targetLabels;
    chart.data.datasets.forEach((dataset, index) => {
      const target = targetDatasets[index];
      if (!target) return;
      dataset.data = Array.isArray(target.data) ? target.data.map(cloneChartValue) : target.data;
      for (const [key, value] of Object.entries(target)) {
        if (key === 'data') continue;
        dataset[key] = value;
      }
    });
    chart.options.animation = { duration: 460, easing: 'easeOutQuart' };
    chart.update();
    window.setTimeout(() => {
      if (state.charts.get(id) === chart) chart.options.animation = false;
    }, 520);
  });
  return chart;
}

function destroyVirtualChart(id) {
  const chart = state.charts.get(id);
  if (!chart) return;
  chart.destroy();
  state.charts.delete(id);
  const canvas = document.getElementById(id);
  if (canvas) canvas.dataset.chartReady = '0';
}

function instantiateChart(id, config = state.pendingCharts.get(id)) {
  const canvas = document.getElementById(id);
  if (!canvas || !canvas.isConnected || state.charts.has(id) || !config) return;
  canvas.dataset.chartReady = '1';
  const snapshot = state.chartTransitionSnapshots.get(id);
  state.chartTransitionSnapshots.delete(id);
  if (snapshot && performance.now() - snapshot.capturedAt < 1800) {
    instantiateChartWithTransition(id, canvas, config, snapshot);
    return;
  }
  const chart = new Chart(canvas, config);
  state.charts.set(id, chart);
}

function ensureChartObserver() {
  if (state.chartObserver || !('IntersectionObserver' in window)) return;
  state.chartObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const canvas = entry.target;
      const id = canvas.id;
      canvas.dataset.chartVisible = entry.isIntersecting ? '1' : '0';

      const previousTimer = state.chartUnloadTimers.get(id);
      if (previousTimer) {
        clearTimeout(previousTimer);
        state.chartUnloadTimers.delete(id);
      }

      if (entry.isIntersecting) {
        const config = state.pendingCharts.get(id);
        if (!config || state.charts.has(id)) continue;
        requestAnimationFrame(() => {
          if (canvas.isConnected && canvas.dataset.chartVisible === '1') instantiateChart(id, config);
        });
        continue;
      }

      if (state.charts.has(id)) {
        const timer = setTimeout(() => {
          state.chartUnloadTimers.delete(id);
          const currentCanvas = document.getElementById(id);
          if (!currentCanvas || currentCanvas.dataset.chartVisible !== '1') destroyVirtualChart(id);
        }, CHART_UNLOAD_DELAY);
        state.chartUnloadTimers.set(id, timer);
      }
    }
  }, { rootMargin: CHART_ROOT_MARGIN, threshold: 0 });
}

function createChart(id, config) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  state.pendingCharts.set(id, config);

  if (!('IntersectionObserver' in window)) {
    instantiateChart(id, config);
    return;
  }

  ensureChartObserver();
  state.chartObserver.observe(canvas);
}

function formatInteger(value) {
  return Number.isFinite(value) ? Math.round(value).toLocaleString('pt-BR') : '—';
}
function formatHours(value) {
  return Number.isFinite(value) ? `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} h` : '—';
}
function formatHMS(value) {
  return formatDurationHMS(value);
}
function formatPercent(value) {
  return Number.isFinite(value) ? `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` : '—';
}

function formatLoggedTime(row) {
  let seconds = null;
  if (Number.isFinite(row?.timeSpentSeconds)) seconds = row.timeSpentSeconds;
  else if (Number.isFinite(row?.correctedDays)) seconds = row.correctedDays * 86400;
  if (!Number.isFinite(seconds)) return '—';
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function formatRowDuration(days) {
  return Number.isFinite(days) ? formatDurationHMS(days * 1440) : '—';
}

function formatSlaFlag(flag) {
  if (flag === 'Não') return 'Dentro do SLA';
  if (flag === 'Sim') return 'Rompido';
  return '—';
}

function detailTableColumns(kind = 'demand') {
  if (kind === 'improvements') {
    return [
      ['#', (_row,index)=>index + 1],
      ['ID', (row)=>row.key || '—'],
      ['Resumo', (row)=>row.summary || '—'],
      ['Status', (row)=>row.status || '—'],
      ['Responsável', (row)=>row.owner || '—'],
      ['Criado', (row)=>formatDate(row.created)],
      ['Previsão', (row)=>formatDate(row.dueDate)],
      ['Situação atual', (row)=>row.currentSituation || '—']
    ];
  }

  const columns = [
    ['#', (_row,index)=>index + 1],
    ['Chamado', (row)=>row.key || '—'],
    ['Tipo', (row)=>row.type || '—'],
    ['Prioridade', (row)=>row.priority || '—'],
    ['Status', (row)=>row.status || '—'],
    ['Plataforma', (row)=>row.platform || row.environment || '—'],
    ['Resumo', (row)=>row.summary || '—'],
    ['Responsável', (row)=>row.owner || '—'],
    ['Criado', (row)=>formatDate(row.created)],
    ['Resolvido', (row)=>formatDate(row.resolved)],
    ['Tempo gasto', (row)=>formatLoggedTime(row)],
    ['TMA', (row)=>formatRowDuration(row.firstResponseDays)],
    ['TMR', (row)=>formatRowDuration(row.resolutionDays)],
    ['SLA 1º atendimento', (row)=>formatSlaFlag(row.tmaBroken)],
    ['SLA resolução', (row)=>formatSlaFlag(row.tmrBroken)]
  ];

  if (kind === 'backlog') {
    columns.splice(7, 0, ['Idade', (row)=>Number.isFinite(row.ageDays) ? `${row.ageDays} dias` : '—']);
  }
  return columns;
}

function openDetailTable(spec) {
  const table = spec?.table;
  const rows = Array.isArray(table?.rows) ? table.rows : [];
  const kind = table?.kind || 'demand';
  const columns = detailTableColumns(kind);
  const title = table?.title || spec?.title || 'Detalhamento';

  const newTab = window.open('', '_blank');
  if (!newTab) {
    window.alert('O navegador bloqueou a nova aba. Permita pop-ups para este endereço e tente novamente.');
    return;
  }

  const headers = columns.map(([label])=>`<th>${esc(label)}</th>`).join('');
  const filterHeaders = columns.map(([label],index)=>`<th><div class="column-filter-slot" data-filter-col="${index}" data-filter-label="${esc(label)}"></div></th>`).join('');
  const body = rows.map((row,index)=>`<tr>${columns.map(([,getter])=>`<td>${esc(getter(row,index))}</td>`).join('')}</tr>`).join('');
  const generatedAt = new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'medium'}).format(new Date());

  newTab.document.open();
  newTab.document.write(`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} — Tabela</title>
<style>
:root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#031c1f;color:#f4ffff}
*{box-sizing:border-box}
html,body{margin:0;min-width:0;max-width:100%;overflow-x:hidden;background:#031c1f}
body{padding:22px 22px 58px;background:radial-gradient(circle at 82% 5%,rgba(37,228,173,.10),transparent 28%),#031c1f}
header{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:18px}
.eyebrow{display:block;color:#25e4ad;font-size:10px;font-weight:800;letter-spacing:1.2px;margin-bottom:5px}
h1{margin:0;font-size:27px;letter-spacing:-.5px}
.meta{margin:5px 0 0;color:#9ec1c3;font-size:12px}
.actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
input,select{font:inherit}
#tableSearch{width:min(360px,70vw);min-height:40px;border:1px solid rgba(43,151,158,.72);border-radius:9px;background:#052c30;color:#efffff;padding:9px 12px;outline:none}
#tableSearch:focus{border-color:#25e4ad;box-shadow:0 0 0 2px rgba(37,228,173,.12)}
button{min-height:40px;border:1px solid rgba(37,228,173,.35);border-radius:9px;background:#07383b;color:#eaffff;padding:8px 12px;font-weight:750;cursor:pointer}
button:hover{border-color:#25e4ad}
.card{border:1px solid rgba(43,151,158,.60);border-radius:12px;background:linear-gradient(180deg,rgba(8,58,63,.98),rgba(4,39,43,.98));overflow:hidden}
.table-scroll{width:100%;max-width:100%;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;overscroll-behavior-y:auto;scrollbar-gutter:stable}
table{width:max-content;min-width:100%;border-collapse:collapse;font-size:11px}
thead{position:sticky;top:0;z-index:5;background:#073b3f}
th{padding:10px 9px;text-align:left;white-space:nowrap;color:#dffff8;border-bottom:1px solid rgba(37,228,173,.38);font-size:10px;letter-spacing:.15px}
thead tr.filter-row th{padding:6px 7px 8px;background:#062f33;border-bottom:1px solid rgba(37,228,173,.24)}
.column-filter-slot{min-width:72px}
.column-filter,.column-filter-select{width:100%;min-width:72px;height:30px;border:1px solid rgba(55,151,157,.5);border-radius:7px;background:#041f22;color:#ddf7f5;padding:5px 7px;outline:none;font-size:10px;font-weight:600}
.column-filter::placeholder{color:#6f9ea0;font-weight:500}
.column-filter:focus,.column-filter-select:focus{border-color:#25e4ad;box-shadow:0 0 0 2px rgba(37,228,173,.10)}
.column-filter-select{cursor:pointer}
.column-filter-select option{background:#05282c;color:#efffff}
td{padding:9px;border-bottom:1px solid rgba(68,139,144,.22);vertical-align:top;white-space:nowrap;color:#e6f5f5;max-width:520px}
td:nth-child(7),td:nth-child(8){white-space:normal;min-width:260px}
tbody tr:hover{background:rgba(37,228,173,.055)}
.floating-scroll{position:fixed;left:0;right:0;bottom:0;z-index:50;height:22px;overflow-x:auto;overflow-y:hidden;background:#041f22;border-top:1px solid rgba(37,228,173,.32);scrollbar-color:#28cda4 #062b2f;box-shadow:0 -5px 16px rgba(0,0,0,.18)}
.floating-scroll-inner{height:1px}
.floating-scroll[hidden]{display:none}
.empty{padding:28px;text-align:center;color:#9ec1c3}
.counter{font-weight:800;color:#25e4ad}
@media print{body{padding:0;background:#fff;color:#000}.actions,.floating-scroll,.filter-row{display:none!important}.card{border:0}table{min-width:0;font-size:8px}th,td{color:#000;border-color:#bbb}thead{background:#eee}}
</style>
</head>
<body>
<header>
  <div><span class="eyebrow">DETALHAMENTO EM TABELA</span><h1>${esc(title)}</h1><p class="meta"><span class="counter" id="count">${rows.length.toLocaleString('pt-BR')}</span> registros · gerado em ${esc(generatedAt)}</p></div>
  <div class="actions"><input id="tableSearch" type="search" placeholder="Pesquisar em toda a tabela…" autocomplete="off"><button type="button" id="clearColumnFilters">Limpar filtros</button><button type="button" onclick="window.print()">Imprimir</button></div>
</header>
<div class="card"><div class="table-scroll">
<table id="detailTable"><thead><tr>${headers}</tr><tr class="filter-row">${filterHeaders}</tr></thead><tbody>${body || `<tr><td class="empty" colspan="${columns.length}">Nenhum registro para este KPI e filtro.</td></tr>`}</tbody></table>
</div></div>
<div class="floating-scroll" id="floatingScroll" aria-label="Barra horizontal da tabela"><div class="floating-scroll-inner" id="floatingScrollInner"></div></div>
<script>
const input=document.getElementById('tableSearch');
const tbody=document.querySelector('#detailTable tbody');
const original=[...tbody.rows];
const counter=document.getElementById('count');
const tableScroll=document.querySelector('.table-scroll');
const floatingScroll=document.getElementById('floatingScroll');
const floatingScrollInner=document.getElementById('floatingScrollInner');
const clearColumnFilters=document.getElementById('clearColumnFilters');
const filterSlots=[...document.querySelectorAll('[data-filter-col]')];
const columnFilters=new Map();
let syncingScroll=false;

function normalizeFilterValue(value){
  return String(value??'').trim().toLocaleLowerCase('pt-BR');
}

function buildColumnFilters(){
  filterSlots.forEach(slot=>{
    const col=Number(slot.dataset.filterCol);
    const label=slot.dataset.filterLabel||'';
    if(!Number.isInteger(col)||label==='#') return;

    const values=[...new Set(original.map(row=>row.cells[col]?.innerText.trim()||'—'))]
      .sort((a,b)=>a.localeCompare(b,'pt-BR',{numeric:true,sensitivity:'base'}));
    const selectLabels=new Set(['Tipo','Prioridade','Status','Plataforma','SLA 1º atendimento','SLA resolução']);
    const useSelect=selectLabels.has(label)||(values.length>0&&values.length<=12&&label!=='Resumo'&&label!=='Responsável'&&label!=='Chamado');
    let control;

    if(useSelect){
      control=document.createElement('select');
      control.className='column-filter-select';
      control.setAttribute('aria-label','Filtrar '+label);
      const all=document.createElement('option');
      all.value='';
      all.textContent='Todos';
      control.appendChild(all);
      values.forEach(value=>{
        const option=document.createElement('option');
        option.value=value;
        option.textContent=value;
        control.appendChild(option);
      });
    }else{
      control=document.createElement('input');
      control.type='search';
      control.className='column-filter';
      control.placeholder='Filtrar…';
      control.autocomplete='off';
      control.setAttribute('aria-label','Filtrar '+label);
    }

    control.dataset.col=String(col);
    control.addEventListener('input',applyAllFilters);
    control.addEventListener('change',applyAllFilters);
    columnFilters.set(col,control);
    slot.appendChild(control);
  });
}

function applyAllFilters(){
  const q=normalizeFilterValue(input?.value);
  let visible=0;

  original.forEach(row=>{
    const globalMatch=!q||normalizeFilterValue(row.innerText).includes(q);
    let columnsMatch=true;

    if(globalMatch){
      for(const [col,control] of columnFilters){
        const filterValue=normalizeFilterValue(control.value);
        if(!filterValue) continue;
        const cellValue=normalizeFilterValue(row.cells[col]?.innerText);
        const exact=control.tagName==='SELECT';
        if(exact ? cellValue!==filterValue : !cellValue.includes(filterValue)){
          columnsMatch=false;
          break;
        }
      }
    }

    const show=globalMatch&&columnsMatch;
    row.hidden=!show;
    if(show) visible++;
  });

  counter.textContent=visible.toLocaleString('pt-BR');
  requestAnimationFrame(syncFloatingScrollbar);
}

function syncFloatingScrollbar(){
  if(!tableScroll||!floatingScroll||!floatingScrollInner) return;
  const width=Math.max(tableScroll.scrollWidth,tableScroll.clientWidth);
  floatingScrollInner.style.width=width+'px';
  floatingScroll.hidden=tableScroll.scrollWidth<=tableScroll.clientWidth+2;
  if(!syncingScroll) floatingScroll.scrollLeft=tableScroll.scrollLeft;
}

tableScroll?.addEventListener('scroll',()=>{
  if(syncingScroll) return;
  syncingScroll=true;
  floatingScroll.scrollLeft=tableScroll.scrollLeft;
  requestAnimationFrame(()=>{syncingScroll=false;});
},{passive:true});

floatingScroll?.addEventListener('scroll',()=>{
  if(syncingScroll) return;
  syncingScroll=true;
  tableScroll.scrollLeft=floatingScroll.scrollLeft;
  requestAnimationFrame(()=>{syncingScroll=false;});
},{passive:true});

// A tabela possui rolagem horizontal própria, mas a rolagem vertical deve
// continuar pertencendo à página. Alguns navegadores prendem a roda do mouse
// no elemento com overflow-x:auto; encaminhamos explicitamente o delta Y para
// a janela e reservamos Shift+roda/trackpad horizontal para a tabela.
tableScroll?.addEventListener('wheel',(event)=>{
  const horizontalIntent=event.shiftKey || Math.abs(event.deltaX)>Math.abs(event.deltaY);
  if(horizontalIntent){
    const delta=event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
    if(delta){
      tableScroll.scrollLeft+=delta;
      event.preventDefault();
    }
    return;
  }

  if(event.deltaY){
    window.scrollBy({top:event.deltaY,left:0,behavior:'auto'});
    event.preventDefault();
  }
},{passive:false});

if('ResizeObserver' in window) new ResizeObserver(syncFloatingScrollbar).observe(tableScroll);
window.addEventListener('resize',syncFloatingScrollbar,{passive:true});
requestAnimationFrame(syncFloatingScrollbar);

buildColumnFilters();
input?.addEventListener('input',applyAllFilters);
clearColumnFilters?.addEventListener('click',()=>{
  if(input) input.value='';
  columnFilters.forEach(control=>{control.value='';});
  applyAllFilters();
});
</script>
</body>
</html>`);
  newTab.document.close();
}

function registerDetail(key, spec) {
  state.metricDetails.set(key, spec);
}

function setBoundedCache(map, key, value, maxEntries) {
  if (map.has(key)) map.delete(key);
  map.set(key, value);
  while (map.size > maxEntries) map.delete(map.keys().next().value);
  return value;
}

function cachedPeriodRows(start, env = 'Todos') {
  const key = `${isoDate(start)}|${env}`;
  if (!state.cache.period.has(key)) {
    setBoundedCache(state.cache.period, key, periodRows(state.data.main, start, env), 36);
  }
  return state.cache.period.get(key);
}

function cachedPeriodRowsAll(start, env = 'Todos') {
  const key = `${isoDate(start)}|${env}`;
  if (!state.cache.periodAll.has(key)) {
    setBoundedCache(state.cache.periodAll, key, periodRowsAll(state.data.main, start, env), 36);
  }
  return state.cache.periodAll.get(key);
}

function cachedWeeklySeries(selectedStart, numberOfWeeks = 4) {
  const key = `${isoDate(selectedStart)}|${numberOfWeeks}`;
  if (!state.cache.weekly.has(key)) {
    const starts = [];
    for (let i = numberOfWeeks - 1; i >= 0; i--) starts.push(addDays(selectedStart, -7 * i));
    const result = starts.map((start) => {
      const rows = cachedPeriodRows(start);
      const incidents = rows.filter((r) => r.type === 'Incidente');
      const m = serviceMetrics(incidents);
      return {
        start, total: rows.length, incidents: incidents.length,
        requests: rows.filter((r) => r.type === 'Requisição').length,
        others: rows.filter((r) => r.type !== 'Incidente' && r.type !== 'Requisição').length,
        hours: m.hours, tma: m.tmaMinutes, tmr: m.tmrMinutes,
        slaFirst: m.slaFirst, slaResolution: m.slaResolution, sla: m.slaResolution
      };
    });
    setBoundedCache(state.cache.weekly, key, result, 12);
  }
  return state.cache.weekly.get(key);
}

const OVERVIEW_TYPE_OPTIONS = [
  { key:'Incidentes', label:'Incidentes', color:'#2ce6b4', border:'#6dffd5', match:(r)=>r.type==='Incidente' },
  { key:'Requisições', label:'Requisições', color:'#38bdf8', border:'#7ddcff', match:(r)=>r.type==='Requisição' },
  { key:'Outras demandas', label:'Outras demandas', color:'#ffd04d', border:'#ffe58b', match:(r)=>r.type!=='Incidente'&&r.type!=='Requisição' }
];

function filterOverviewType(rows) {
  const option=OVERVIEW_TYPE_OPTIONS.find((item)=>item.key===state.overviewType);
  return option ? rows.filter(option.match) : rows;
}

function overviewRowsAt(start, { ignoreType = false } = {}) {
  const rows=cachedPeriodRows(start);
  return ignoreType ? rows : filterOverviewType(rows);
}

function overviewMetricsFor(rows, start = null) {
  const metricRows=state.overviewType ? rows : rows.filter((r)=>r.type==='Incidente');
  const service=serviceMetrics(metricRows);

  // Regra operacional: itens do tipo "Registro" nunca entram em volume, TMA, TMR,
  // SLA ou distribuição. Eles contribuem exclusivamente para Horas dedicadas.
  if (!state.overviewType && start) {
    const hourRows = cachedPeriodRowsAll(start).filter((r)=>r.type==='Incidente' || r.type==='Registro');
    const hourMetric = loggedHours(hourRows);
    service.hours = hourMetric.hours;
    service.hoursSamples = hourMetric.samples;
  }

  return { total:rows.length, ...service };
}

function overviewWeeklyFiltered() {
  const starts=[];
  for(let i=3;i>=0;i--) starts.push(addDays(state.week,-7*i));
  return starts.map((start)=>{
    const raw=overviewRowsAt(start,{ignoreType:true});
    const filtered=filterOverviewType(raw);
    const m=overviewMetricsFor(filtered,start);
    return {
      start,
      total:filtered.length,
      incidents:raw.filter((r)=>r.type==='Incidente').length,
      requests:raw.filter((r)=>r.type==='Requisição').length,
      others:raw.filter((r)=>r.type!=='Incidente'&&r.type!=='Requisição').length,
      hours:m.hours,
      tma:m.tmaMinutes,
      tmr:m.tmrMinutes,
      slaFirst:m.slaFirst,
      slaResolution:m.slaResolution,
      sla:m.slaResolution
    };
  });
}

function overviewComparisonPair(start) {
  return [addDays(start,-7),start].map((weekStart)=>{
    const rows=overviewRowsAt(weekStart);
    const m=overviewMetricsFor(rows,weekStart);
    return {start:weekStart,total:rows.length,hours:m.hours,tma:m.tmaMinutes,tmr:m.tmrMinutes,slaFirst:m.slaFirst,slaResolution:m.slaResolution};
  });
}

function typeDistribution(rows) {
  return OVERVIEW_TYPE_OPTIONS.map((item)=>({
    ...item,
    value:rows.filter(item.match).length
  }));
}

function typeDonutMarkup(items) {
  const total=items.reduce((sum,item)=>sum+item.value,0);
  let offset=0;
  const segments=items.map((item)=>{
    const pct=total>0?(item.value/total)*100:0;
    const currentOffset=offset;
    offset+=pct;
    if(pct<=0) return '';
    return `<circle class="type-donut-segment ${state.overviewType===item.key?'selected':''}" data-overview-type="${esc(item.key)}" role="button" tabindex="0" aria-label="Filtrar por ${esc(item.label)}: ${formatInteger(item.value)}" cx="60" cy="60" r="42" pathLength="100" fill="none" stroke="${item.color}" stroke-width="18" stroke-linecap="butt" stroke-dasharray="${pct.toFixed(4)} ${(100-pct).toFixed(4)}" stroke-dashoffset="${(-currentOffset).toFixed(4)}" transform="rotate(-90 60 60)"/>`;
  }).join('');
  const active=state.overviewType || 'Todos os tipos';
  const legend=items.map((item)=>{
    const pct=total>0?(item.value/total)*100:0;
    return `<button type="button" class="type-legend-item ${state.overviewType===item.key?'active':''}" data-overview-type="${esc(item.key)}"><span class="type-legend-dot" style="--dot:${item.color}"></span><span>${esc(item.label)}</span><b>${formatInteger(item.value)}</b><small>${pct.toLocaleString('pt-BR',{maximumFractionDigits:1})}%</small></button>`;
  }).join('');
  return `<div class="type-donut-viz">
    <svg class="type-donut-svg" viewBox="0 0 120 120" aria-label="Distribuição por tipo">
      <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(140,207,205,.10)" stroke-width="18"/>
      ${segments}
      <text x="60" y="57" text-anchor="middle" class="type-donut-total">${formatInteger(total)}</text>
      <text x="60" y="69" text-anchor="middle" class="type-donut-caption">chamados</text>
    </svg>
    <div class="type-donut-active">Filtro: <b>${esc(active)}</b></div>
    <div class="type-donut-legend">${legend}</div>
  </div>`;
}

function overviewCrossfilterBar(analysisStart) {
  const hasFilter=Boolean(state.overviewFilterWeek||state.overviewType);
  return `<div class="section-crossfilter ${hasFilter?'active':''}">
    <div class="section-crossfilter-copy">${icon('compare','crossfilter-icon')}<span><b>Filtro interativo</b> · Semana: <strong>${shortWeekLabel(analysisStart)}</strong> · Tipo: <strong>${esc(state.overviewType||'Todos')}</strong></span></div>
    ${hasFilter?'<button type="button" class="clear-crossfilter" data-clear-overview-filter>Limpar filtros</button>':'<span class="crossfilter-hint">Clique em uma barra ou no gráfico de tipos para cruzar a seção</span>'}
  </div>`;
}

function registerOverviewDetails(weeks, currentRows) {
  const metricRows=state.overviewType?currentRows:currentRows.filter((r)=>r.type==='Incidente');
  const byEnv=ENVIRONMENTS.map((env)=>({env,...serviceMetrics(metricRows.filter((r)=>r.platform===env))}));
  const currentAll=overviewRowsAt(state.overviewFilterWeek?parseIsoLocal(state.overviewFilterWeek):state.week,{ignoreType:true});
  const typeCounts=typeDistribution(currentAll).map((item)=>({label:item.label,value:item.value}));

  const currentStart=state.overviewFilterWeek?parseIsoLocal(state.overviewFilterWeek):state.week;
  const loggedMetricRows=state.overviewType
    ? metricRows
    : cachedPeriodRowsAll(currentStart).filter((r)=>r.type==='Incidente'||r.type==='Registro');
  const loggedRows=loggedMetricRows.filter((r)=>Number.isFinite(r.timeSpentSeconds)||Number.isFinite(r.correctedDays));
  const recordHourRows=state.overviewType?[]:cachedPeriodRowsAll(currentStart).filter((r)=>r.type==='Registro');
  const recordHourMetric=loggedHours(recordHourRows);
  const hoursBreakdown=byEnv.map((s)=>({label:s.env,value:formatHours(s.hours)}));
  if(recordHourMetric.samples) hoursBreakdown.push({label:'Registros (sem ambiente)',value:formatHours(recordHourMetric.hours)});
  const tmaRows=metricRows.filter((r)=>Number.isFinite(r.firstResponseDays));
  const tmrRows=metricRows.filter((r)=>Number.isFinite(r.resolutionDays));
  const slaFirstRows=metricRows.filter((r)=>r.tmaBroken==='Não'||r.tmaBroken==='Sim');
  const slaResolutionRows=metricRows.filter((r)=>r.tmrBroken==='Não'||r.tmrBroken==='Sim');

  const definitions=[
    ['overview-total',state.overviewType||'Total de chamados',weeks.map((w)=>({start:w.start,value:w.total})),formatInteger,'neutral','percent','Distribuição atual por tipo',typeCounts,currentRows],
    ['overview-hours','Horas dedicadas',weeks.map((w)=>({start:w.start,value:w.hours})),formatHours,'neutral','hours','Composição das horas',hoursBreakdown,loggedRows],
    ['overview-tma','TMA médio',weeks.map((w)=>({start:w.start,value:w.tma})),formatHMS,'lower','percent','TMA por ambiente',byEnv.map((s)=>({label:s.env,value:formatHMS(s.tmaMinutes)})),tmaRows],
    ['overview-tmr','TMR médio',weeks.map((w)=>({start:w.start,value:w.tmr})),formatHMS,'lower','percent','TMR por ambiente',byEnv.map((s)=>({label:s.env,value:formatHMS(s.tmrMinutes)})),tmrRows],
    ['overview-sla-first','SLA 1º atendimento',weeks.map((w)=>({start:w.start,value:w.slaFirst})),formatPercent,'higher','points','SLA 1º atendimento por ambiente',byEnv.map((s)=>({label:s.env,value:formatPercent(s.slaFirst)})),slaFirstRows],
    ['overview-sla','SLA de resolução',weeks.map((w)=>({start:w.start,value:w.slaResolution})),formatPercent,'higher','points','SLA de resolução por ambiente',byEnv.map((s)=>({label:s.env,value:formatPercent(s.slaResolution)})),slaResolutionRows]
  ];
  definitions.forEach(([key,title,series,formatter,direction,comparisonKind,breakdownTitle,breakdown,tableRows])=>{
    const spec={
      title,series,formatter,direction,comparisonKind,breakdownTitle,breakdown,
      table:{rows:tableRows,kind:'demand',title:`${title} — registros relacionados`}
    };
    if(key==='overview-sla-first'){
      spec.slaBreaches={kind:'first',rows:metricRows.filter((r)=>r.tmaBroken==='Sim')};
    }
    if(key==='overview-sla'){
      spec.slaBreaches={kind:'resolution',rows:metricRows.filter((r)=>r.tmrBroken==='Sim')};
    }
    registerDetail(key,spec);
  });
}

function comparisonTableOverview(weeks) {
  return `<article class="panel comparison-panel">
    ${panelHeading('Comparativo das últimas 4 semanas','compare','4 semanas')}
    <div class="table-wrap"><table class="comparison-table"><thead><tr><th>Semana</th><th>Chamados</th><th>Δ chamados</th><th>Horas</th><th>TMA</th><th>TMR</th><th>SLA 1º atd.</th><th>SLA resolução</th></tr></thead><tbody>
      ${weeks.map((w,i)=>`<tr><td>${shortWeekLabel(w.start)}</td><td>${formatInteger(w.total)}</td><td>${i===0?'—':signed(percentChange(w.total,weeks[i-1].total))}</td><td>${formatHours(w.hours)}</td><td>${formatHMS(w.tma)}</td><td>${formatHMS(w.tmr)}</td><td>${formatPercent(w.slaFirst)}</td><td>${formatPercent(w.slaResolution)}</td></tr>`).join('')}
    </tbody></table></div>
  </article>`;
}

function buildOverviewSection() {
  const analysisStart=state.overviewFilterWeek?parseIsoLocal(state.overviewFilterWeek):state.week;
  const currentRows=overviewRowsAt(analysisStart);
  const currentAll=overviewRowsAt(analysisStart,{ignoreType:true});
  const m=overviewMetricsFor(currentRows,analysisStart);
  const weeks=overviewWeeklyFiltered();
  const pair=overviewComparisonPair(analysisStart);
  const dist=typeDistribution(currentAll);
  registerOverviewDetails(weeks,currentRows);
  const currentLabel=state.overviewType||'Total de chamados';
  const content=`
    ${overviewCrossfilterBar(analysisStart)}
    <div class="kpi-grid six">
      ${kpi(currentLabel,formatInteger(currentRows.length),{accent:'pink',detailKey:'overview-total',comparison:comparisonFromSeries(pair.map((w)=>({value:w.total})))})}
      ${kpi('Horas dedicadas',formatHours(m.hours),{detailKey:'overview-hours',comparison:comparisonFromSeries(pair.map((w)=>({value:w.hours})),'neutral','hours')})}
      ${kpi('TMA médio',formatHMS(m.tmaMinutes),{detailKey:'overview-tma',comparison:comparisonFromSeries(pair.map((w)=>({value:w.tma})),'lower')})}
      ${kpi('TMR médio',formatHMS(m.tmrMinutes),{detailKey:'overview-tmr',comparison:comparisonFromSeries(pair.map((w)=>({value:w.tmr})),'lower')})}
      ${kpi('SLA 1º atendimento',formatPercent(m.slaFirst),{accent:'cyan',detailKey:'overview-sla-first',comparison:comparisonFromSeries(pair.map((w)=>({value:w.slaFirst})),'higher','points')})}
      ${kpi('SLA de resolução',formatPercent(m.slaResolution),{accent:'green',detailKey:'overview-sla',comparison:comparisonFromSeries(pair.map((w)=>({value:w.slaResolution})),'higher','points')})}
    </div>
    <div class="grid-2 overview-charts">
      ${chartCard('Evolução de chamados (últimas 4 semanas)','overviewWeekly','interactive-panel')}
      <article class="panel interactive-panel overview-type-panel">${panelHeading('Distribuição por tipo (semana analisada)','pie')}<div class="chart-box type-donut-host">${typeDonutMarkup(dist)}</div></article>
    </div>
    ${comparisonTableOverview(weeks)}`;

  return {
    html:sectionBlock('overview','Visão geral','Panorama da operação',content,{eyebrow:'01 • RESUMO EXECUTIVO'}),
    init(){
      const labels=weeks.map((w)=>shortWeekLabel(w.start));
      const selectedWeek=state.overviewFilterWeek;
      createChart('overviewWeekly',{
        type:'bar',
        data:{labels,datasets:[
          {label:'Incidentes',data:weeks.map((w)=>w.incidents),backgroundColor:gradientFill('#31e8b4','#0d9272'),borderColor:'#68ffd2',borderWidth:1.2,borderRadius:7},
          {label:'Requisições',data:weeks.map((w)=>w.requests),backgroundColor:gradientFill('#38c8f4','#147ea7'),borderColor:'#7bddff',borderWidth:1.2,borderRadius:7},
          {label:'Outras demandas',data:weeks.map((w)=>w.others),backgroundColor:gradientFill('#ffd456','#ba8513'),borderColor:'#ffe58e',borderWidth:1.2,borderRadius:7}
        ]},
        options:chartOptions({
          layout:{padding:{top:16}},
          onClick:(_event,elements)=>{
            if(!elements?.length) return;
            const el=elements[0];
            state.overviewFilterWeek=isoDate(weeks[el.index].start);
            state.overviewType=OVERVIEW_TYPE_OPTIONS[el.datasetIndex]?.key||state.overviewType;
            refreshOverviewSection();
          },
          onHover:(_event,elements,chart)=>{chart.canvas.style.cursor=elements?.length?'pointer':'default';},
          plugins:{
            legend:{position:'top',labels:{color:'#d9eeee',usePointStyle:true,pointStyle:'circle',pointStyleWidth:12,boxWidth:9}},
            valueLabels:{display:true,position:'center',fontSize:12,formatter:(value)=>value?formatInteger(value):''},
            tooltip:{callbacks:{afterBody:()=>['Clique para filtrar esta semana e este tipo']}}
          },
          scales:{x:{...baseChartOptions().scales.x,stacked:true},y:{...integerGridAxis({beginAtZero:true}),stacked:true}}
        })
      });
      const selectedIndex=selectedWeek?weeks.findIndex((w)=>isoDate(w.start)===selectedWeek):-1;
      const chart=state.charts.get('overviewWeekly');
      if(chart&&selectedIndex>=0) chart.setActiveElements([{datasetIndex:0,index:selectedIndex}]);
    }
  };
}

function demandRowsForTab(rows) {
  if (state.demandTab === 'Incidente') return rows.filter((r)=>r.type === 'Incidente');
  if (state.demandTab === 'Requisição') return rows.filter((r)=>r.type === 'Requisição');
  return rows.filter((r)=>r.type !== 'Incidente' && r.type !== 'Requisição');
}

function filterDemandPriority(rows) {
  return state.demandPriority ? rows.filter((r)=>r.priority === state.demandPriority) : rows;
}

function filterDemandDay(rows, dayKey = state.demandFilterDay) {
  if (!dayKey) return rows;
  return rows.filter((row)=>row.created && isoDate(row.created) === dayKey);
}

function demandRowsAt(start, allRows = state.data.main) {
  const byEnvironment = allRows === state.data.main ? cachedPeriodRows(start, state.env) : periodRows(allRows, start, state.env);
  return filterDemandPriority(demandRowsForTab(byEnvironment));
}

function demandRowsAtWithoutPriority(start, allRows = state.data.main) {
  return demandRowsForTab(allRows === state.data.main ? cachedPeriodRows(start, state.env) : periodRows(allRows, start, state.env));
}

function demandWeeklySeries(endStart = state.week) {
  const starts = [];
  for (let i = 3; i >= 0; i--) starts.push(addDays(endStart, -7 * i));
  return starts.map((start)=>{
    const wr = demandRowsAt(start);
    const m = serviceMetrics(wr);
    return {
      start,
      count:m.count,
      hours:m.hours,
      tma:m.tmaMinutes,
      tmr:m.tmrMinutes,
      slaFirst:m.slaFirst,
      slaResolution:m.slaResolution,
      sla:m.slaResolution
    };
  });
}

function demandComparisonPair(analysisStart) {
  return [addDays(analysisStart,-7), analysisStart].map((start)=>{
    const m = serviceMetrics(demandRowsAt(start));
    return {
      start,
      count:m.count,
      hours:m.hours,
      tma:m.tmaMinutes,
      tmr:m.tmrMinutes,
      slaFirst:m.slaFirst,
      slaResolution:m.slaResolution,
      sla:m.slaResolution
    };
  });
}

function demandDailySeries(weekStart = state.week) {
  const baseRows = filterDemandPriority(demandRowsAtWithoutPriority(weekStart));
  return Array.from({length:7}, (_,index)=>{
    const date = addDays(weekStart,index);
    const rows = baseRows.filter((row)=>row.created && isoDate(row.created)===isoDate(date));
    const m = serviceMetrics(rows);
    return {
      start:date,
      count:m.count,
      hours:m.hours,
      tma:m.tmaMinutes,
      tmr:m.tmrMinutes,
      slaFirst:m.slaFirst,
      slaResolution:m.slaResolution,
      sla:m.slaResolution
    };
  });
}

function demandSelectionComparisonPair() {
  if (!state.demandFilterDay) return demandComparisonPair(state.week);
  const selectedDate = parseIsoLocal(state.demandFilterDay);
  const previousDate = addDays(selectedDate,-7);
  return [previousDate,selectedDate].map((date)=>{
    const weekStart = addDays(state.week, date === selectedDate ? 0 : -7);
    const source = demandRowsAtWithoutPriority(weekStart)
      .filter((row)=>row.created && isoDate(row.created)===isoDate(date));
    const m = serviceMetrics(filterDemandPriority(source));
    return {
      start:date,
      count:m.count,
      hours:m.hours,
      tma:m.tmaMinutes,
      tmr:m.tmrMinutes,
      slaFirst:m.slaFirst,
      slaResolution:m.slaResolution,
      sla:m.slaResolution
    };
  });
}

function toggleDemandDay(date) {
  const key = isoDate(date);
  state.demandFilterDay = state.demandFilterDay === key ? null : key;
  refreshDemandsSection();
}

function toggleDemandPriority(priority) {
  state.demandPriority = state.demandPriority === priority ? null : priority;
  refreshDemandsSection();
}

function registerDemandDetails(weeks, selectedRows, label) {
  const detailWeeks = weeks;
  const priorityBase = filterDemandDay(demandRowsAtWithoutPriority(state.week));
  const priorities = ['P1','P2','P3','P4'].map((priority)=>({label:priority,value:priorityBase.filter((r)=>r.priority===priority).length}));
  const currentByEnv = ENVIRONMENTS.map((env)=>{
    const m = serviceMetrics(selectedRows.filter((r)=>r.platform===env));
    return { env, ...m };
  });

  const loggedRows=selectedRows.filter((r)=>Number.isFinite(r.timeSpentSeconds)||Number.isFinite(r.correctedDays));
  const tmaRows=selectedRows.filter((r)=>Number.isFinite(r.firstResponseDays));
  const tmrRows=selectedRows.filter((r)=>Number.isFinite(r.resolutionDays));
  const slaFirstRows=selectedRows.filter((r)=>r.tmaBroken==='Não'||r.tmaBroken==='Sim');
  const slaResolutionRows=selectedRows.filter((r)=>r.tmrBroken==='Não'||r.tmrBroken==='Sim');

  [
    ['demand-count',label,detailWeeks.map((w)=>({start:w.start,value:w.count})),formatInteger,'neutral','percent','Distribuição por prioridade',priorities,selectedRows],
    ['demand-hours','Horas dedicadas',detailWeeks.map((w)=>({start:w.start,value:w.hours})),formatHours,'neutral','hours','Horas por ambiente',currentByEnv.map((x)=>({label:x.env,value:formatHours(x.hours)})),loggedRows],
    ['demand-tma','TMA médio',detailWeeks.map((w)=>({start:w.start,value:w.tma})),formatHMS,'lower','percent','TMA por ambiente',currentByEnv.map((x)=>({label:x.env,value:formatHMS(x.tmaMinutes)})),tmaRows],
    ['demand-tmr','TMR médio',detailWeeks.map((w)=>({start:w.start,value:w.tmr})),formatHMS,'lower','percent','TMR por ambiente',currentByEnv.map((x)=>({label:x.env,value:formatHMS(x.tmrMinutes)})),tmrRows],
    ['demand-sla-first','SLA 1º atendimento',detailWeeks.map((w)=>({start:w.start,value:w.slaFirst})),formatPercent,'higher','points','SLA 1º atendimento por ambiente',currentByEnv.map((x)=>({label:x.env,value:formatPercent(x.slaFirst)})),slaFirstRows],
    ['demand-sla','SLA de resolução',detailWeeks.map((w)=>({start:w.start,value:w.slaResolution})),formatPercent,'higher','points','SLA de resolução por ambiente',currentByEnv.map((x)=>({label:x.env,value:formatPercent(x.slaResolution)})),slaResolutionRows]
  ].forEach(([key,title,series,formatter,direction,comparisonKind,breakdownTitle,breakdown,tableRows])=>{
    const spec={
      title,series,formatter,direction,comparisonKind,breakdownTitle,breakdown,
      table:{rows:tableRows,kind:'demand',title:`${title} — registros relacionados`}
    };
    if(key==='demand-sla-first'){
      spec.slaBreaches={kind:'first',rows:selectedRows.filter((r)=>r.tmaBroken==='Sim')};
    }
    if(key==='demand-sla'){
      spec.slaBreaches={kind:'resolution',rows:selectedRows.filter((r)=>r.tmrBroken==='Sim')};
    }
    registerDetail(key,spec);
  });
}

function demandComparisonTable(weeks) {
  return `<article class="panel comparison-panel">${panelHeading('Comparativo semanal','compare')}<div class="table-wrap"><table class="comparison-table"><thead><tr><th>Semana</th><th>Volume</th><th>Δ volume</th><th>Horas</th><th>TMA</th><th>TMR</th><th>SLA 1º atd.</th><th>SLA resolução</th></tr></thead><tbody>
    ${weeks.map((w,i)=>`<tr><td>${shortWeekLabel(w.start)}</td><td>${formatInteger(w.count)}</td><td>${i===0?'—':signed(percentChange(w.count,weeks[i-1].count))}</td><td>${formatHours(w.hours)}</td><td>${formatHMS(w.tma)}</td><td>${formatHMS(w.tmr)}</td><td>${formatPercent(w.slaFirst)}</td><td>${formatPercent(w.slaResolution)}</td></tr>`).join('')}
  </tbody></table></div></article>`;
}

function demandFilterBar(analysisStart) {
  const hasFilter = Boolean(state.demandFilterDay || state.demandPriority);
  const selectedDay = state.demandFilterDay ? shortDayLabel(parseIsoLocal(state.demandFilterDay)) : 'Todos';
  return `<div class="demand-crossfilter ${hasFilter ? 'active' : ''}">
    <div class="demand-crossfilter-copy">
      ${icon('compare','crossfilter-icon')}
      <span><b>Filtro interativo</b> · Semana: <strong>${shortWeekLabel(analysisStart)}</strong> · Dia: <strong>${selectedDay}</strong> · Prioridade: <strong>${state.demandPriority || 'Todas'}</strong></span>
    </div>
    ${hasFilter ? `<button type="button" class="clear-crossfilter" data-clear-demand-filter>Limpar filtros</button>` : `<span class="crossfilter-hint">Clique em um dia ou prioridade para cruzar os gráficos</span>`}
  </div>`;
}

function buildDemandsSection() {
  const analysisStart = state.week;
  const weekPrioritySourceRows = demandRowsAtWithoutPriority(analysisStart);
  const prioritySourceRows = filterDemandDay(weekPrioritySourceRows);
  const selectedRows = filterDemandPriority(prioritySourceRows);
  const m = serviceMetrics(selectedRows);
  const weeks = demandWeeklySeries();
  const days = demandDailySeries(analysisStart);
  const pair = demandSelectionComparisonPair();
  const p = groupCount(prioritySourceRows, (r)=>r.priority);
  const label = state.demandTab === 'Incidente' ? 'Incidentes' : state.demandTab === 'Requisição' ? 'Requisições' : 'Outras demandas';
  registerDemandDetails(weeks, selectedRows, label);
  const tabs = ['Incidente','Requisição','Outras demandas'].map((name)=>`<button class="tab ${state.demandTab===name?'active':''}" data-demand-tab="${name}">${name === 'Incidente' ? 'Incidentes' : name === 'Requisição' ? 'Requisições' : name}</button>`).join('');
  const content = `
    <div class="section-toolbar"><div class="tabs">${tabs}</div><div class="inline-filter"><span>Ambiente</span>${environmentSelectMarkup()}</div></div>
    ${demandFilterBar(analysisStart)}
    <div class="kpi-grid six">
      ${kpi(label, m.count, {detailKey:'demand-count',comparison:comparisonFromSeries(pair.map((w)=>({value:w.count})))})}
      ${kpi('Horas dedicadas', formatHours(m.hours), {detailKey:'demand-hours',comparison:comparisonFromSeries(pair.map((w)=>({value:w.hours})),'neutral','hours')})}
      ${kpi('TMA médio', formatHMS(m.tmaMinutes), {detailKey:'demand-tma',comparison:comparisonFromSeries(pair.map((w)=>({value:w.tma})),'lower')})}
      ${kpi('TMR médio', formatHMS(m.tmrMinutes), {detailKey:'demand-tmr',comparison:comparisonFromSeries(pair.map((w)=>({value:w.tmr})),'lower')})}
      ${kpi('SLA 1º atendimento', formatPercent(m.slaFirst), {detailKey:'demand-sla-first',comparison:comparisonFromSeries(pair.map((w)=>({value:w.slaFirst})),'higher','points'),accent:'cyan'})}
      ${kpi('SLA de resolução', formatPercent(m.slaResolution), {detailKey:'demand-sla',comparison:comparisonFromSeries(pair.map((w)=>({value:w.slaResolution})),'higher','points'),accent:'green'})}
    </div>
    <div class="grid-2">
      ${chartCard(`Evolução diária de ${label.toLowerCase()}`, 'demandEvolution', 'interactive-panel')}
      ${chartCard('Distribuição por prioridade', 'demandPriority', 'interactive-panel')}
      ${chartCard('TMA × TMR por dia (HH:MM:SS)', 'demandTimes', 'interactive-panel')}
      ${chartCard('SLA diário: primeiro atendimento × resolução', 'demandSla', 'interactive-panel')}
    </div>
    ${demandComparisonTable(weeks)}`;

  return {
    html: sectionBlock('demands', 'Demandas', 'Análise detalhada por tipo', content, { eyebrow: '02 • OPERAÇÃO' }),
    init() {
      const dayLabels = days.map((day)=>shortDayLabel(day.start));
      const selectedDayKey = state.demandFilterDay;

      createChart('demandEvolution',{
        type:'line',
        data:{labels:dayLabels,datasets:[{
          label,
          data:days.map((day)=>day.count),
          borderColor:'#2ce0b0',
          backgroundColor:gradientFill('rgba(44,224,176,.42)','rgba(44,224,176,.025)'),
          fill:true,
          tension:.3,
          pointRadius:days.map((day)=>isoDate(day.start)===selectedDayKey?6:4),
          pointHoverRadius:7,
          pointBackgroundColor:days.map((day)=>isoDate(day.start)===selectedDayKey?'#ecfff9':'#06292b'),
          pointBorderColor:'#2ce0b0',
          pointBorderWidth:2.2
        }]},
        options:chartOptions({
          layout:{padding:{top:18}},
          onClick:(_event,elements)=>{ if(elements?.length) toggleDemandDay(days[elements[0].index].start); },
          onHover:(_event,elements,chart)=>{ chart.canvas.style.cursor=elements?.length?'pointer':'default'; },
          plugins:{
            legend:{display:false},
            valueLabels:{formatter:(value)=>formatInteger(value)},
            tooltip:{callbacks:{afterBody:()=>['Clique para filtrar toda a seção por este dia']}}
          },
          scales:{y:integerGridAxis({beginAtZero:true})}
        })
      });

      const priorities=['P1','P2','P3','P4'];
      const priorityColors={P1:'#ff5c78',P2:'#ffd34f',P3:'#37d7f4',P4:'#318cf5'};
      createChart('demandPriority',{
        type:'bar',
        data:{labels:priorities,datasets:[{
          label:'Prioridade',
          data:priorities.map((x)=>p.get(x)||0),
          backgroundColor:priorities.map((x)=>state.demandPriority && state.demandPriority!==x ? 'rgba(93,132,136,.24)' : priorityColors[x]),
          borderColor:priorities.map((x)=>state.demandPriority===x ? '#effffa' : priorityColors[x]),
          borderWidth:state.demandPriority ? priorities.map((x)=>state.demandPriority===x?2:1) : 1,
          borderRadius:6
        }]},
        options:chartOptions({
          indexAxis:'y',
          layout:{padding:{right:56}},
          onClick:(_event,elements)=>{ if(elements?.length) toggleDemandPriority(priorities[elements[0].index]); },
          onHover:(_event,elements,chart)=>{ chart.canvas.style.cursor=elements?.length?'pointer':'default'; },
          plugins:{
            legend:{display:false},
            valueLabels:{formatter:(value)=>formatInteger(value)},
            tooltip:{callbacks:{afterBody:()=>['Clique para cruzar os demais gráficos por prioridade']}}
          },
          scales:{x:integerGridAxis({beginAtZero:true}),y:baseChartOptions().scales.x}
        })
      });

      createChart('demandTimes',{
        type:'line',
        data:{labels:dayLabels,datasets:[
          {label:'TMA',data:days.map((day)=>day.tma),borderColor:'#2ce0b0',backgroundColor:'rgba(44,224,176,.13)',tension:.28,pointRadius:days.map((day)=>isoDate(day.start)===selectedDayKey?6:4.5),pointBackgroundColor:'#eafff7',pointBorderColor:'#2ce0b0'},
          {label:'TMR',data:days.map((day)=>day.tmr),borderColor:'#ffd34f',backgroundColor:'rgba(255,211,79,.10)',tension:.28,pointRadius:days.map((day)=>isoDate(day.start)===selectedDayKey?6:4.5),pointBackgroundColor:'#fff8d2',pointBorderColor:'#ffd34f'}
        ]},
        options:chartOptions({
          layout:{padding:{top:18}},
          onClick:(_event,elements)=>{ if(elements?.length) toggleDemandDay(days[elements[0].index].start); },
          onHover:(_event,elements,chart)=>{ chart.canvas.style.cursor=elements?.length?'pointer':'default'; },
          plugins:{
            valueLabels:{fontSize:11,formatter:(value)=>formatHMS(value)},
            tooltip:{callbacks:{
              label:(context)=>`${context.dataset.label}: ${formatHMS(context.parsed.y)}`,
              afterBody:()=>['Clique para filtrar toda a seção por este dia']
            }}
          },
          scales:{
            x:baseChartOptions().scales.x,
            y:{...baseChartOptions().scales.y,beginAtZero:true,ticks:{...baseChartOptions().scales.y.ticks,callback:(value)=>formatHMS(Number(value))},grid:{color:'rgba(138,191,193,.045)',drawTicks:false}}
          }
        })
      });

      const slaValues=[...days.flatMap((day)=>[day.slaFirst,day.slaResolution])].filter(Number.isFinite);
      const slaFloor=slaValues.length && slaValues.some((value)=>value<95) ? 0 : 95;
      createChart('demandSla',{
        type:'bar',
        data:{labels:dayLabels,datasets:[
          {
            label:'SLA 1º atendimento',
            data:days.map((day)=>day.slaFirst),
            backgroundColor:'rgba(55,215,244,.82)',
            borderColor:'#65e8ff',borderWidth:1.2,borderRadius:6,maxBarThickness:70,categoryPercentage:.72,barPercentage:.78
          },
          {
            label:'SLA de resolução',
            data:days.map((day)=>day.slaResolution),
            backgroundColor:'rgba(44,224,176,.82)',
            borderColor:'#6af2ce',borderWidth:1.2,borderRadius:6,maxBarThickness:70,categoryPercentage:.72,barPercentage:.78
          }
        ]},
        options:chartOptions({
          layout:{padding:{top:18}},
          onClick:(_event,elements)=>{ if(elements?.length) toggleDemandDay(days[elements[0].index].start); },
          onHover:(_event,elements,chart)=>{ chart.canvas.style.cursor=elements?.length?'pointer':'default'; },
          plugins:{
            legend:{position:'top',labels:{color:'#d8eeee',usePointStyle:true,pointStyle:'circle',pointStyleWidth:12,boxWidth:9,padding:15}},
            valueLabels:{fontSize:11,formatter:(value)=>formatPercent(value)},
            tooltip:{callbacks:{
              label:(context)=>`${context.dataset.label}: ${formatPercent(context.parsed.y)}`,
              afterBody:()=>['Clique para filtrar toda a seção por este dia']
            }}
          },
          scales:{x:baseChartOptions().scales.x,y:integerGridAxis({min:slaFloor,max:100,beginAtZero:slaFloor===0})}
        })
      });
    }
  };
}

function statusTone(status) {
  const s=(status||'').toLowerCase();
  if (s.includes('andamento')) return 'blue';
  if (s.includes('concl')||s.includes('resolv')||s.includes('fechado')) return 'green';
  if (s.includes('waiting')||s.includes('aguard')) return 'yellow';
  return 'muted';
}

const BACKLOG_BUCKETS = [
  {key:'0–7 dias',label:'0–7 dias',test:(x)=>x<=7},
  {key:'8–14 dias',label:'8–14 dias',test:(x)=>x>=8&&x<=14},
  {key:'15–30 dias',label:'15–30 dias',test:(x)=>x>=15&&x<=30},
  {key:'> 30 dias',label:'> 30 dias',test:(x)=>x>30}
];

function filterBacklogRows(rows,{ignoreAge=false,ignoreStatus=false}={}) {
  return rows.filter((row)=>{
    const ageOk=ignoreAge||!state.backlogAgeBucket||BACKLOG_BUCKETS.find((b)=>b.key===state.backlogAgeBucket)?.test(row.ageDays);
    const statusOk=ignoreStatus||!state.backlogStatus||(row.status||'Não informado')===state.backlogStatus;
    return ageOk&&statusOk;
  });
}

function backlogMetrics(rows) {
  const ages=rows.map((r)=>r.ageDays).filter(Number.isFinite);
  return {
    openCount:rows.length,
    over7:rows.filter((r)=>r.ageDays>7).length,
    oldest:ages.length?Math.max(...ages):null,
    average:ages.length?ages.reduce((a,b)=>a+b,0)/ages.length:null
  };
}

function backlogWeeklySeries() {
  const starts=[];
  for(let i=3;i>=0;i--) starts.push(addDays(state.week,-7*i));
  return starts.map((start)=>{
    const snap=backlogSnapshot(state.data.backlog,addDays(start,6));
    return {start,...backlogMetrics(filterBacklogRows(snap.rows))};
  });
}

function backlogCrossfilterBar() {
  const hasFilter=Boolean(state.backlogAgeBucket||state.backlogStatus);
  return `<div class="section-crossfilter ${hasFilter?'active':''}">
    <div class="section-crossfilter-copy">${icon('compare','crossfilter-icon')}<span><b>Filtro interativo</b> · Idade: <strong>${esc(state.backlogAgeBucket||'Todas')}</strong> · Status: <strong>${esc(state.backlogStatus||'Todos')}</strong></span></div>
    ${hasFilter?'<button type="button" class="clear-crossfilter" data-clear-backlog-filter>Limpar filtros</button>':'<span class="crossfilter-hint">Clique em uma faixa de idade ou status para cruzar toda a seção</span>'}
  </div>`;
}

function buildBacklogSection() {
  const asOf=addDays(state.week,6);
  const rawSnap=backlogSnapshot(state.data.backlog,asOf);
  const filteredRows=filterBacklogRows(rawSnap.rows);
  const snap={rows:filteredRows,...backlogMetrics(filteredRows)};
  const weeks=backlogWeeklySeries();

  const ageSource=filterBacklogRows(rawSnap.rows,{ignoreAge:true});
  const statusSource=filterBacklogRows(rawSnap.rows,{ignoreStatus:true});
  const bucketBreakdown=BACKLOG_BUCKETS.map((b)=>({label:b.label,value:ageSource.filter((r)=>b.test(r.ageDays)).length}));
  const status=groupCount(statusSource,(r)=>r.status||'Não informado');

  const backlogDetailRows={
    'backlog-open':filteredRows,
    'backlog-over7':filteredRows.filter((r)=>r.ageDays>7),
    'backlog-oldest':Number.isFinite(snap.oldest)?filteredRows.filter((r)=>r.ageDays===snap.oldest):[],
    'backlog-average':filteredRows
  };
  [
    ['backlog-open','Chamados em aberto',weeks.map((w)=>({start:w.start,value:w.openCount})),formatInteger,'neutral'],
    ['backlog-over7','Chamados acima de 7 dias',weeks.map((w)=>({start:w.start,value:w.over7})),formatInteger,'lower'],
    ['backlog-oldest','Maior idade',weeks.map((w)=>({start:w.start,value:w.oldest})),(v)=>Number.isFinite(v)?`${formatInteger(v)} dias`:'—','lower'],
    ['backlog-average','Idade média',weeks.map((w)=>({start:w.start,value:w.average})),(v)=>Number.isFinite(v)?`${v.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})} dias`:'—','lower']
  ].forEach(([key,title,series,formatter,direction])=>registerDetail(key,{
    title,series,formatter,direction,breakdownTitle:'Faixas de envelhecimento',breakdown:bucketBreakdown,
    table:{rows:backlogDetailRows[key]||[],kind:'backlog',title:`${title} — registros relacionados`}
  }));

  const tableSource=(state.backlogAgeBucket||state.backlogStatus)?filteredRows:filteredRows.filter((r)=>r.ageDays>7);
  const tableRows=tableSource.slice(0,16).map((r)=>`<tr><td>${esc(r.key)}</td><td>${esc(r.platform||'—')}</td><td><span class="age-pill">${r.ageDays} dias</span></td><td>${esc(r.type||'—')}</td><td class="truncate">${esc(r.summary)}</td><td>${esc(r.owner||'—')}</td><td><span class="status ${statusTone(r.status)}">${esc(r.status||'—')}</span></td></tr>`).join('');
  const content=`
    ${backlogCrossfilterBar()}
    <div class="kpi-grid four">
      ${kpi('Chamados em aberto',snap.openCount,{accent:'pink',detailKey:'backlog-open',comparison:comparisonFromSeries(weeks.map((w)=>({value:w.openCount})))})}
      ${kpi('> 7 dias',snap.over7,{detailKey:'backlog-over7',comparison:comparisonFromSeries(weeks.map((w)=>({value:w.over7})),'lower')})}
      ${kpi('Maior idade',Number.isFinite(snap.oldest)?`${snap.oldest} dias`:'—',{detailKey:'backlog-oldest',comparison:comparisonFromSeries(weeks.map((w)=>({value:w.oldest})),'lower')})}
      ${kpi('Idade média',Number.isFinite(snap.average)?`${snap.average.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})} dias`:'—',{detailKey:'backlog-average',comparison:comparisonFromSeries(weeks.map((w)=>({value:w.average})),'lower')})}
    </div>
    <div class="grid-2 backlog-charts">
      ${chartCard('Tempo de abertura (em aberto)','backlogAge','interactive-panel')}
      ${chartCard('Status dos chamados','backlogStatus','interactive-panel')}
    </div>
    <article class="panel table-panel">${panelHeading(state.backlogAgeBucket||state.backlogStatus?'Chamados filtrados':'Chamados em aberto há mais de 7 dias','archive',`${tableSource.length} registros`)}
      <div class="table-wrap"><table><thead><tr><th>Chamado</th><th>Ambiente</th><th>Idade</th><th>Tipo</th><th>Resumo</th><th>Responsável</th><th>Status</th></tr></thead><tbody>${tableRows||'<tr><td colspan="7">Nenhum chamado para o filtro selecionado.</td></tr>'}</tbody></table></div>
    </article>`;

  return {
    html:sectionBlock('backlog','Backlog','Chamados em aberto e envelhecimento',content,{eyebrow:'03 • FILA E ENVELHECIMENTO'}),
    init(){
      const bucketValues=BACKLOG_BUCKETS.map((b)=>ageSource.filter((r)=>b.test(r.ageDays)).length);
      const bucketColors=['#318fff','#2be1a9','#ffd34e','#ff647f'];
      createChart('backlogAge',{
        type:'bar',
        data:{labels:BACKLOG_BUCKETS.map((b)=>b.label),datasets:[{
          label:'Chamados',data:bucketValues,
          backgroundColor:BACKLOG_BUCKETS.map((b,i)=>state.backlogAgeBucket&&state.backlogAgeBucket!==b.key?'rgba(91,126,130,.28)':bucketColors[i]),
          borderColor:BACKLOG_BUCKETS.map((b,i)=>state.backlogAgeBucket===b.key?'#f4ffff':bucketColors[i]),
          borderWidth:BACKLOG_BUCKETS.map((b)=>state.backlogAgeBucket===b.key?2:1),borderRadius:6
        }]},
        options:chartOptions({
          layout:{padding:{top:18}},
          onClick:(_event,elements)=>{if(elements?.length){const key=BACKLOG_BUCKETS[elements[0].index].key;state.backlogAgeBucket=state.backlogAgeBucket===key?null:key;refreshBacklogSection();}},
          onHover:(_event,elements,chart)=>{chart.canvas.style.cursor=elements?.length?'pointer':'default';},
          plugins:{legend:{display:false},valueLabels:{formatter:(value)=>formatInteger(value)},tooltip:{callbacks:{afterBody:()=>['Clique para filtrar toda a seção por esta faixa']}}},
          scales:{y:integerGridAxis({beginAtZero:true})}
        })
      });
      const statusLabels=[...status.keys()];
      const statusValues=[...status.values()];
      const statusColors=['#318fff','#2be1a9','#ffd34e','#ff9f50','#9678ff','#67ddeb','#ff647f','#58d5a8'];
      createChart('backlogStatus',{
        type:'doughnut',
        data:{labels:statusLabels,datasets:[{data:statusValues,backgroundColor:statusLabels.map((label,i)=>state.backlogStatus&&state.backlogStatus!==label?'rgba(91,126,130,.25)':statusColors[i%statusColors.length]),borderColor:statusLabels.map((label,i)=>state.backlogStatus===label?'#f4ffff':statusColors[i%statusColors.length]),borderWidth:statusLabels.map((label)=>state.backlogStatus===label?2:1.5),hoverOffset:5}]},
        options:chartOptions({
          scales:false,cutout:'66%',
          onClick:(_event,elements)=>{if(elements?.length){const key=statusLabels[elements[0].index];state.backlogStatus=state.backlogStatus===key?null:key;refreshBacklogSection();}},
          onHover:(_event,elements,chart)=>{chart.canvas.style.cursor=elements?.length?'pointer':'default';},
          plugins:{legend:{position:'right',labels:{color:'#d6ecec',usePointStyle:true,pointStyle:'circle',pointStyleWidth:12,boxWidth:8,padding:12,generateLabels:legendWithValues}},valueLabels:{display:true,fontSize:12,formatter:(value)=>value?formatInteger(value):''},tooltip:{callbacks:{afterBody:()=>['Clique para filtrar toda a seção por este status']}}}
        })
      });
    }
  };
}

function envIconName(env) {
  if (env === 'CORE') return 'workflow';
  if (env === 'INTEGRATION') return 'layers';
  if (env === 'CONTAINERS') return 'boxes';
  if (env === 'API-GW') return 'server';
  if (env === 'HML') return 'flask';
  return 'server';
}

function envColor(env) {
  return ({ CORE:'#ff647f', INTEGRATION:'#ffd34e', CONTAINERS:'#43d9ff', 'API-GW':'#318fff', HML:'#b78cff' })[env] || '#36efb8';
}

function sparklineArea(series, env) {
  const values = series.map((item)=>Number.isFinite(item.value) ? item.value : 0);
  const width = 320;
  const height = 108;
  const left = 18;
  const right = 302;
  const top = 25;
  const bottom = 85;
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? (right-left)/(values.length-1) : 0;
  const points = values.map((value,index)=>({
    value,
    x:left+(step*index),
    y:bottom-((value/max)*(bottom-top))
  }));
  const line = points.map((p)=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `M ${left} ${bottom} L ${points.map((p)=>`${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')} L ${right} ${bottom} Z`;
  const color = envColor(env);
  const gradientId = `spark-${env.toLowerCase().replace(/[^a-z0-9]/g,'')}`;
  return `<div class="env-spark-wrap" aria-label="Evolução de incidentes nas últimas 4 semanas">
    <div class="env-spark-title"><span>Evolução • 4 semanas</span><b>${values.join(' · ')}</b></div>
    <svg class="env-spark" viewBox="0 0 ${width} ${height}" role="img" aria-hidden="true">
      <defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity=".34"/><stop offset="100%" stop-color="${color}" stop-opacity=".025"/></linearGradient></defs>
      <path d="${area}" fill="url(#${gradientId})"/>
      <polyline points="${line}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      ${points.map((p)=>{const labelY=Math.max(13,p.y-14);return `<g><circle cx="${p.x}" cy="${p.y}" r="4" fill="#05272b" stroke="${color}" stroke-width="2.2"/><rect x="${p.x-18}" y="${labelY-9}" width="36" height="18" rx="6" fill="#04272b" stroke="${color}" stroke-width="1.2"/><text x="${p.x}" y="${labelY+.7}" text-anchor="middle" fill="${color}">${p.value}</text></g>`;}).join('')}
    </svg>
  </div>`;
}

function environmentCrossfilterBar(analysisStart) {
  const hasFilter=Boolean(state.environmentFilterWeek||state.environmentSelected);
  return `<div class="section-crossfilter ${hasFilter?'active':''}">
    <div class="section-crossfilter-copy">${icon('compare','crossfilter-icon')}<span><b>Filtro interativo</b> · Semana: <strong>${shortWeekLabel(analysisStart)}</strong> · Plataforma: <strong>${esc(state.environmentSelected||'Todos')}</strong></span></div>
    ${hasFilter?'<button type="button" class="clear-crossfilter" data-clear-environment-filter>Limpar filtros</button>':'<span class="crossfilter-hint">Clique em um card ou ponto do gráfico para cruzar a seção</span>'}
  </div>`;
}

function envSlaBlock(stat) {
  const first=Number.isFinite(stat.slaFirst)?stat.slaFirst:null;
  const resolution=Number.isFinite(stat.slaResolution)?stat.slaResolution:stat.sla;
  const firstWidth=Number.isFinite(first)?Math.max(0,Math.min(100,first)):0;
  const resolutionWidth=Number.isFinite(resolution)?Math.max(0,Math.min(100,resolution)):0;
  return `<div class="env-sla-block" aria-label="SLAs de ${esc(stat.env)}">
    <div class="env-sla-metric first">
      <div class="env-sla-copy"><span>SLA 1º atendimento</span><strong>${formatPercent(first)}</strong></div>
      <div class="env-sla-track"><i style="width:${firstWidth}%"></i></div>
    </div>
    <div class="env-sla-metric resolution">
      <div class="env-sla-copy"><span>SLA resolução</span><strong>${formatPercent(resolution)}</strong></div>
      <div class="env-sla-track"><i style="width:${resolutionWidth}%"></i></div>
    </div>
  </div>`;
}

function envCard(stat, previous, series) {
  const seriesKey=`env-${stat.env}`;
  const comparison=comparisonFromSeries([{value:previous?.incidents??null},{value:stat.incidents}]);
  const selected=state.environmentSelected===stat.env;
  const dimmed=Boolean(state.environmentSelected&&!selected);
  return `<article class="env-card env-card-clickable ${selected?'selected':''} ${dimmed?'dimmed':''}" data-env-filter="${esc(stat.env)}" tabindex="0" role="button" aria-pressed="${selected?'true':'false'}" aria-label="Filtrar ambientes por ${esc(stat.env)}">
    <div class="env-head"><span class="env-icon-box">${icon(envIconName(stat.env),'env-icon-svg')}</span><b>${stat.env}</b><button type="button" class="env-detail-button" data-detail-key="${seriesKey}" aria-label="Abrir detalhamento de ${esc(stat.env)}" title="Abrir detalhamento">${icon('arrowUpRight','open-icon')}</button></div>
    <div class="env-main"><div><strong>${formatInteger(stat.incidents)}</strong><small>Incidentes</small></div>${envSlaBlock(stat)}</div>
    <div class="env-variation"><span class="kpi-delta ${comparison.tone}">${comparison.arrow} ${comparison.text}</span><span>vs semana anterior</span></div>
    <div class="env-hours">${icon('clock','env-clock-icon')}<span>${formatHours(stat.hours)}<small>Horas registradas</small></span></div>
    <div class="env-bottom"><span>TMA <b>${formatHMS(stat.tma)}</b></span><span>TMR <b>${formatHMS(stat.tmr)}</b></span></div>
    ${sparklineArea(series,stat.env)}
  </article>`;
}

function buildEnvironmentsSection() {
  const analysisStart=state.environmentFilterWeek?parseIsoLocal(state.environmentFilterWeek):state.week;
  const rows=cachedPeriodRows(analysisStart);
  const previousRows=cachedPeriodRows(addDays(analysisStart,-7));
  const stats=environmentStats(rows);
  const previousStats=environmentStats(previousRows);
  const weeks=cachedWeeklySeries(state.week);
  const envSeries=new Map();
  ENVIRONMENTS.forEach((env)=>{
    const series=weeks.map((w)=>{
      const wr=cachedPeriodRows(w.start).filter((r)=>r.platform===env&&r.type==='Incidente');
      return {start:w.start,value:wr.length,metrics:serviceMetrics(wr)};
    });
    const detailStart=analysisStart;
    const detailSeries=[];
    for(let i=3;i>=0;i--){
      const start=addDays(detailStart,-7*i);
      const wr=cachedPeriodRows(start).filter((r)=>r.platform===env&&r.type==='Incidente');
      detailSeries.push({start,value:wr.length,metrics:serviceMetrics(wr)});
    }
    const current=serviceMetrics(cachedPeriodRows(analysisStart).filter((r)=>r.platform===env&&r.type==='Incidente'));
    registerDetail(`env-${env}`,{
      title:`${env} — Incidentes`,series:detailSeries.map((x)=>({start:x.start,value:x.value})),formatter:formatInteger,direction:'neutral',
      breakdownTitle:'Indicadores da semana analisada',breakdown:[
        {label:'Horas',value:formatHours(current.hours)},{label:'TMA',value:formatHMS(current.tmaMinutes)},
        {label:'TMR',value:formatHMS(current.tmrMinutes)},{label:'SLA 1º atendimento',value:formatPercent(current.slaFirst)},
        {label:'SLA resolução',value:formatPercent(current.slaResolution)}
      ],
      table:{rows:current.rows||[],kind:'demand',title:`${env} — incidentes da semana analisada`}
    });
    envSeries.set(env,series);
  });

  const visibleStats=state.environmentSelected?stats.filter((s)=>s.env===state.environmentSelected):stats;
  const tableRows=visibleStats.map((s)=>{
    const prev=previousStats.find((x)=>x.env===s.env);
    const pct=percentChange(s.incidents,prev?.incidents??null);
    const firstDelta=Number.isFinite(s.slaFirst)&&Number.isFinite(prev?.slaFirst)?s.slaFirst-prev.slaFirst:null;
    const resolutionDelta=Number.isFinite(s.slaResolution)&&Number.isFinite(prev?.slaResolution)?s.slaResolution-prev.slaResolution:null;
    return `<tr><td>${s.env}</td><td>${formatInteger(s.incidents)}</td><td>${signed(pct)}</td><td>${formatHours(s.hours)}</td><td>${formatHMS(s.tma)}</td><td>${formatHMS(s.tmr)}</td><td class="good">${formatPercent(s.slaFirst)}</td><td>${signedPoints(firstDelta)}</td><td class="good">${formatPercent(s.slaResolution)}</td><td>${signedPoints(resolutionDelta)}</td></tr>`;
  }).join('');

  const content=`
    ${environmentCrossfilterBar(analysisStart)}
    <div class="environment-layout">
      <div class="env-cards">${stats.map((s)=>envCard(s,previousStats.find((p)=>p.env===s.env),envSeries.get(s.env))).join('')}</div>
      <article class="panel compare">${panelHeading('Comparativo de plataformas','compare',state.environmentSelected||'Todas as plataformas')}<div class="table-wrap"><table><thead><tr><th>Ambiente</th><th>Incidentes</th><th title="Variação percentual de incidentes">Variação</th><th>Horas</th><th>TMA</th><th>TMR</th><th>SLA 1º atendimento</th><th title="Variação em pontos percentuais do SLA de primeiro atendimento">Δ SLA 1º atd.</th><th>SLA de resolução</th><th title="Variação em pontos percentuais do SLA de resolução">Δ SLA resolução</th></tr></thead><tbody>${tableRows}</tbody></table></div></article>
      ${chartCard('Evolução por ambiente (incidentes)','envEvolution','env-evolution interactive-panel')}
    </div>`;

  return {
    html:sectionBlock('environments','Ambientes','Desempenho por plataforma',content,{eyebrow:'04 • PLATAFORMAS'}),
    init(){
      const labels=weeks.map((w)=>shortWeekLabel(w.start));
      const colors=ENVIRONMENTS.map(envColor);
      createChart('envEvolution',{
        type:'line',
        data:{labels,datasets:ENVIRONMENTS.map((env,i)=>{
          const active=!state.environmentSelected||state.environmentSelected===env;
          return {
            label:env,
            data:envSeries.get(env).map((x)=>x.value),
            borderColor:active?colors[i]:'rgba(106,139,142,.32)',
            backgroundColor:active?colors[i]:'rgba(106,139,142,.18)',
            pointBackgroundColor:'#08272b',
            pointBorderColor:active?colors[i]:'rgba(106,139,142,.42)',
            pointRadius:envSeries.get(env).map((x)=>isoDate(x.start)===state.environmentFilterWeek?6:3.5),
            borderWidth:active?2.6:1.4,
            tension:.32
          };
        })},
        options:chartOptions({
          layout:{padding:{top:20}},
          onClick:(_event,elements)=>{
            if(!elements?.length) return;
            const el=elements[0];
            const env=ENVIRONMENTS[el.datasetIndex];
            state.environmentSelected=env;
            state.environmentFilterWeek=isoDate(weeks[el.index].start);
            refreshEnvironmentsSection();
          },
          onHover:(_event,elements,chart)=>{chart.canvas.style.cursor=elements?.length?'pointer':'default';},
          plugins:{valueLabels:{fontSize:11,formatter:(value,ctx)=>!state.environmentSelected||ctx.dataset.label===state.environmentSelected?formatInteger(value):''},tooltip:{callbacks:{afterBody:()=>['Clique para filtrar por ambiente e semana']}}},
          scales:{y:integerGridAxis({beginAtZero:true})}
        })
      });
    }
  };
}

function improvementMonthKey(date) {
  if(!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
}

function improvementMonthLabel(key) {
  if(!key) return 'Todos';
  const [y,m]=key.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR',{month:'short',year:'2-digit'}).format(new Date(y,m-1,1)).replace('.','');
}

function improvementStatusLabel(row) {
  return row.status || 'Não informado';
}

function filterImprovementList(rows,{ignoreMonth=false,ignoreStatus=false}={}) {
  return rows.filter((r)=>{
    const monthOk=ignoreMonth||!state.improvementMonth||improvementMonthKey(r.created)===state.improvementMonth;
    const statusOk=ignoreStatus||!state.improvementStatus||improvementStatusLabel(r)===state.improvementStatus;
    return monthOk&&statusOk;
  });
}

function improvementFilterKpi(label,value,{statusKey='__all__',accent='',detailKey=''}={}) {
  const isAll=statusKey==='__all__';
  const active=isAll ? !state.improvementStatus : state.improvementStatus===statusKey;
  return `<article class="kpi improvement-filter-kpi ${accent} ${active?'filter-active':''}" data-improvement-status-filter="${esc(statusKey)}" aria-pressed="${active?'true':'false'}" tabindex="0" role="button" title="${isAll?'Mostrar todos os registros':`Filtrar por ${esc(statusKey)}`}">
    <div class="kpi-top">
      <div class="kpi-main">
        <span class="kpi-icon-box">${icon(kpiIcon(label),'kpi-icon-svg')}</span>
        <div class="kpi-copy"><div class="kpi-value">${formatInteger(value)}</div><div class="kpi-label">${esc(label)}</div></div>
      </div>
      <div class="improvement-card-actions">
        <span class="filter-kpi-indicator" aria-hidden="true">${active?icon('circleCheck','open-icon'):icon('compare','open-icon')}</span>
        ${detailKey?`<button type="button" class="improvement-detail-button" data-detail-key="${esc(detailKey)}" aria-label="Abrir detalhamento de ${esc(label)}" title="Abrir detalhamento">${icon('arrowUpRight','open-icon')}</button>`:''}
      </div>
    </div>
  </article>`;
}

function improvementsCrossfilterBar(totalRows) {
  const hasFilter=Boolean(state.improvementMonth||state.improvementStatus);
  return `<div class="section-crossfilter ${hasFilter?'active':''}">
    <div class="section-crossfilter-copy">${icon('compare','crossfilter-icon')}<span><b>Filtro interativo</b> · Mês de criação: <strong>${esc(improvementMonthLabel(state.improvementMonth))}</strong> · Status: <strong>${esc(state.improvementStatus||'Todos')}</strong></span></div>
    ${hasFilter?'<button type="button" class="clear-crossfilter" data-clear-improvement-filter>Limpar filtros</button>':`<span class="crossfilter-hint">${formatInteger(totalRows)} registros · clique nos cards ou gráficos para filtrar</span>`}
  </div>`;
}

function buildImprovementsSection() {
  const allRows=state.data.improvements || [];
  const rows=filterImprovementList(allRows);
  const statusBase=filterImprovementList(allRows,{ignoreStatus:true});
  const statusCountsBase=groupCount(statusBase,improvementStatusLabel);
  const allStatusCounts=groupCount(allRows,improvementStatusLabel);
  const topStatuses=[...allStatusCounts.entries()].sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0]),'pt-BR')).slice(0,3);

  const allMonthKeys=[...new Set(allRows.map((r)=>improvementMonthKey(r.created)).filter(Boolean))].sort();
  const monthStart=(key)=>{const [y,m]=key.split('-').map(Number);return new Date(y,m-1,1);};
  const monthSeriesFor=(sourceRows)=>allMonthKeys.map((key)=>({
    start:monthStart(key),
    value:sourceRows.filter((r)=>improvementMonthKey(r.created)===key).length
  }));

  const totalSeriesRows=filterImprovementList(allRows,{ignoreMonth:true});
  const totalBreakdown=[...groupCount(rows,improvementStatusLabel).entries()].map(([label,value])=>({label,value}));
  registerDetail('improvement-total',{
    title:'Total de melhorias',
    series:monthSeriesFor(totalSeriesRows),
    formatter:formatInteger,
    direction:'neutral',
    breakdownTitle:'Distribuição atual por status',
    breakdown:totalBreakdown,
    periodFormatter:(date)=>improvementMonthLabel(improvementMonthKey(date)),
    eyebrow:'DETALHAMENTO • MELHORIAS',
    currentCaption:'Período mais recente',
    previousCaption:'Período anterior',
    averageCaption:'Média por período',
    rangeCaption:'1º → último período',
    currentPeriodLabel:'Período mais recente',
    table:{rows,kind:'improvements',title:'Total de melhorias — registros relacionados'}
  });

  const statusCards=topStatuses.map(([status])=>{
    const detailKey=`improvement-status-${encodeURIComponent(status)}`;
    const detailRows=statusBase.filter((r)=>improvementStatusLabel(r)===status);
    const seriesRows=allRows.filter((r)=>improvementStatusLabel(r)===status);
    registerDetail(detailKey,{
      title:status,
      series:monthSeriesFor(seriesRows),
      formatter:formatInteger,
      direction:'neutral',
      breakdownTitle:'Responsáveis',
      breakdown:[...groupCount(detailRows,(r)=>r.owner||'Não informado').entries()].map(([label,value])=>({label,value})),
      periodFormatter:(date)=>improvementMonthLabel(improvementMonthKey(date)),
      eyebrow:'DETALHAMENTO • MELHORIAS',
      currentCaption:'Período mais recente',
      previousCaption:'Período anterior',
      averageCaption:'Média por período',
      rangeCaption:'1º → último período',
      currentPeriodLabel:'Período mais recente',
      table:{rows:detailRows,kind:'improvements',title:`${status} — melhorias relacionadas`}
    });
    return improvementFilterKpi(status,statusCountsBase.get(status)||0,{statusKey:status,detailKey});
  }).join('');

  const trs=rows.map((r)=>`<tr>
    <td><strong>${esc(r.key)}</strong></td>
    <td class="truncate wide" title="${esc(r.summary)}">${esc(r.summary)}</td>
    <td><span class="status ${statusTone(r.status)}">${esc(r.status||'—')}</span></td>
    <td>${esc(r.owner||'—')}</td>
    <td>${formatDate(r.created)}</td>
    <td>${formatDate(r.dueDate)}</td>
    <td class="truncate extra-wide" title="${esc(r.currentSituation||'')}">${esc(r.currentSituation||'—')}</td>
  </tr>`).join('');

  const content=`
    ${improvementsCrossfilterBar(allRows.length)}
    <div class="kpi-grid four improvements-kpis">
      ${improvementFilterKpi('Total de melhorias',rows.length,{statusKey:'__all__',accent:'improvement-total',detailKey:'improvement-total'})}
      ${statusCards}
    </div>
    <article class="panel table-panel improvements-table">${panelHeading('Melhorias','sparkles',`${rows.length} de ${allRows.length} registros`)}
      <div class="table-wrap"><table><thead><tr>
        <th>ID</th><th>Resumo</th><th>Status</th><th>Responsável</th><th>Criado</th><th>Previsão</th><th>Situação atual</th>
      </tr></thead><tbody>${trs||'<tr><td colspan="7">Nenhum registro para o filtro selecionado.</td></tr>'}</tbody></table></div>
    </article>
    <div class="grid-2 lower">
      ${chartCard('Melhorias criadas por mês','improvementsMonthly','interactive-panel')}
      ${chartCard('Distribuição por status','improvementsStatus','interactive-panel')}
    </div>`;

  return {
    html:sectionBlock('improvements','Melhorias','Acompanhamento das iniciativas e entregas',content,{eyebrow:'05 • EVOLUÇÃO CONTÍNUA'}),
    init(){
      const monthSource=filterImprovementList(allRows,{ignoreMonth:true});
      const byMonth=new Map();
      monthSource.forEach((r)=>{const key=improvementMonthKey(r.created);if(key)byMonth.set(key,(byMonth.get(key)||0)+1)});
      const monthKeys=[...byMonth.keys()].sort();
      createChart('improvementsMonthly',{
        type:'bar',
        data:{labels:monthKeys.map(improvementMonthLabel),datasets:[{
          label:'Melhorias criadas',data:monthKeys.map((key)=>byMonth.get(key)||0),
          backgroundColor:monthKeys.map((key)=>state.improvementMonth&&state.improvementMonth!==key?'rgba(91,126,130,.24)':'rgba(37,228,173,.82)'),
          borderColor:monthKeys.map((key)=>state.improvementMonth===key?'#f4ffff':'#25e4ad'),
          borderWidth:monthKeys.map((key)=>state.improvementMonth===key?2:1),borderRadius:7,borderSkipped:false
        }]},
        options:chartOptions({
          layout:{padding:{top:20}},
          onClick:(_event,elements)=>{if(elements?.length){const key=monthKeys[elements[0].index];state.improvementMonth=state.improvementMonth===key?null:key;refreshImprovementsSection();}},
          onHover:(_event,elements,chart)=>{chart.canvas.style.cursor=elements?.length?'pointer':'default';},
          plugins:{legend:{display:false},valueLabels:{fontSize:12,formatter:(value)=>formatInteger(value)},tooltip:{callbacks:{afterBody:()=>['Clique para filtrar toda a seção por este mês']}}},
          scales:{y:integerGridAxis({beginAtZero:true})}
        })
      });

      const statusSource=filterImprovementList(allRows,{ignoreStatus:true});
      const statusCounts=groupCount(statusSource,improvementStatusLabel);
      const statusLabels=[...statusCounts.keys()];
      const statusColors=['#25e4ad','#ffd34e','#31d9ff','#ff647f','#9678ff','#67ddeb','#ff9f50'];
      createChart('improvementsStatus',{
        type:'doughnut',
        data:{labels:statusLabels,datasets:[{data:[...statusCounts.values()],backgroundColor:statusLabels.map((label,i)=>state.improvementStatus&&state.improvementStatus!==label?'rgba(91,126,130,.22)':statusColors[i%statusColors.length]),borderColor:statusLabels.map((label,i)=>state.improvementStatus===label?'#f4ffff':statusColors[i%statusColors.length]),borderWidth:statusLabels.map((label)=>state.improvementStatus===label?3:1.5),hoverOffset:6}]},
        options:chartOptions({
          scales:false,cutout:'64%',
          onClick:(_event,elements)=>{if(elements?.length){const key=statusLabels[elements[0].index];state.improvementStatus=state.improvementStatus===key?null:key;refreshImprovementsSection();}},
          onHover:(_event,elements,chart)=>{chart.canvas.style.cursor=elements?.length?'pointer':'default';},
          plugins:{legend:{position:'right',labels:{color:'#d6ecec',usePointStyle:true,pointStyle:'circle',pointStyleWidth:12,boxWidth:9,padding:14,generateLabels:legendWithValues}},valueLabels:{display:true,fontSize:12,formatter:(value)=>value?formatInteger(value):''},tooltip:{callbacks:{afterBody:()=>['Clique para filtrar toda a seção por este status']}}}
        })
      });
    }
  };
}

function changeAgainst(current, reference, kind = 'percent') {
  if (!Number.isFinite(current) || !Number.isFinite(reference)) return null;
  if (kind === 'points') return current - reference;
  return percentChange(current, reference, { minimumBaseline: kind === 'hours' ? 1 : 0 });
}

function formatChange(value, kind = 'percent') {
  if (!Number.isFinite(value)) return '—';
  return kind === 'points' ? signedPoints(value) : signed(value);
}

function modalSummary(spec) {
  const values=spec.series.map((x)=>x.value).filter(Number.isFinite);
  const current=spec.series.at(-1)?.value;
  const previous=spec.series.at(-2)?.value;
  const avg=values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
  const min=values.length?Math.min(...values):null;
  const max=values.length?Math.max(...values):null;
  const first=spec.series.find((x)=>Number.isFinite(x.value))?.value;
  const kind=spec.comparisonKind || 'percent';
  return {
    current,previous,avg,min,max,
    firstToLast:changeAgainst(current,first,kind),
    vsAverage:changeAgainst(current,avg,kind)
  };
}

function detailTableRows(spec) {
  const kind=spec.comparisonKind || 'percent';
  const periodFormatter=spec.periodFormatter || shortWeekLabel;
  return spec.series.map((item,index)=>{
    const prev=index>0?spec.series[index-1].value:null;
    const hasDelta=Number.isFinite(item.value)&&Number.isFinite(prev);
    const delta=hasDelta?item.value-prev:null;
    const variation=hasDelta?changeAgainst(item.value,prev,kind):null;
    const deltaText = delta == null
      ? '—'
      : kind === 'points'
        ? signedPoints(delta)
        : `${delta>0?'+':delta<0?'-':''}${spec.formatter(Math.abs(delta))}`;
    return `<tr>
      <td>${periodFormatter(item.start)}</td>
      <td><b>${spec.formatter(item.value)}</b></td>
      <td>${deltaText}</td>
      <td>${formatChange(variation,kind)}</td>
    </tr>`;
  }).join('');
}

function slaBreachPanel(spec) {
  const breach=spec?.slaBreaches;
  if(!breach) return '';

  const rows=Array.isArray(breach.rows)?breach.rows:[];
  const isFirst=breach.kind==='first';
  const durationLabel=isFirst?'Tempo até 1º atendimento':'Tempo até resolução';
  const durationValue=(row)=>formatRowDuration(isFirst?row.firstResponseDays:row.resolutionDays);
  const slaName=isFirst?'SLA de 1º atendimento':'SLA de resolução';

  if(!rows.length){
    return `<article class="modal-panel sla-breach-panel sla-breach-empty">
      <div class="sla-breach-head">
        <div class="sla-breach-title">${icon('shield','sla-breach-title-icon')}<div><span>CHAMADOS ROMPIDOS</span><h3>${esc(slaName)}</h3></div></div>
        <span class="sla-breach-count ok">0 rompidos</span>
      </div>
      <div class="sla-breach-empty-state">${icon('circleCheck','sla-breach-empty-icon')}<div><b>Nenhum chamado rompeu este SLA no período analisado.</b><span>Os registros considerados no KPI permaneceram dentro do limite de atendimento.</span></div></div>
    </article>`;
  }

  const items=rows.map((row,index)=>`<div class="sla-breach-row">
    <div class="sla-breach-index">${index+1}</div>
    <div class="sla-breach-call">
      <strong>${esc(row.key||'—')}</strong>
      <span>${esc(row.summary||'Sem resumo')}</span>
    </div>
    <div class="sla-breach-meta"><span>Prioridade</span><b>${esc(row.priority||'—')}</b></div>
    <div class="sla-breach-meta"><span>Ambiente</span><b>${esc(row.platform||row.environment||'—')}</b></div>
    <div class="sla-breach-meta elapsed"><span>${esc(durationLabel)}</span><b>${esc(durationValue(row))}</b></div>
  </div>`).join('');

  return `<article class="modal-panel sla-breach-panel">
    <div class="sla-breach-head">
      <div class="sla-breach-title">${icon('alert','sla-breach-title-icon')}<div><span>CHAMADOS ROMPIDOS</span><h3>${esc(slaName)}</h3></div></div>
      <span class="sla-breach-count">${formatInteger(rows.length)} ${rows.length===1?'rompido':'rompidos'}</span>
    </div>
    <div class="sla-breach-list">${items}</div>
  </article>`;
}

function closeMetricModal() {
  if (state.modalChart) {
    state.modalChart.destroy();
    state.modalChart=null;
  }
  document.querySelector('.metric-modal-backdrop')?.remove();
}

function openMetricModal(key) {
  const spec=state.metricDetails.get(key);
  if(!spec) return;
  closeMetricModal();

  const s=modalSummary(spec);
  const compare=comparisonFromSeries(spec.series,spec.direction,spec.comparisonKind||'percent');
  const breakdown=(spec.breakdown||[]).map((item)=>`<div class="breakdown-item"><span>${esc(item.label)}</span><b>${typeof item.value==='number'?formatInteger(item.value):esc(item.value)}</b></div>`).join('');
  const periodFormatter=spec.periodFormatter || shortWeekLabel;
  const eyebrow=spec.eyebrow || 'DETALHAMENTO • 4 SEMANAS';
  const currentCaption=spec.currentCaption || 'Semana atual';
  const previousCaption=spec.previousCaption || 'Semana anterior';
  const averageCaption=spec.averageCaption || 'Média 4 semanas';
  const rangeCaption=spec.rangeCaption || '1ª → 4ª semana';
  const currentPeriodLabel=spec.currentPeriodLabel || 'Semana atual';

  const overlay=document.createElement('div');
  overlay.className='metric-modal-backdrop';
  overlay.innerHTML=`
    <section class="metric-modal" role="dialog" aria-modal="true" aria-labelledby="metricModalTitle">
      <header class="metric-modal-head">
        <div class="metric-modal-title-wrap">
          <span class="metric-modal-icon">${icon(kpiIcon(spec.title),'metric-modal-icon-svg')}</span>
          <div class="metric-modal-copy">
            <span class="modal-eyebrow">${esc(eyebrow)}</span>
            <div class="metric-modal-title-line">
              <h2 id="metricModalTitle">${esc(spec.title)}</h2>
              ${spec.table?`<button type="button" class="modal-table-button" aria-label="Abrir tabela de ${esc(spec.title)}">${icon('table','modal-table-button-icon')}<span>Tabela</span></button>`:''}
            </div>
            <p>${esc(currentPeriodLabel)}: ${esc(periodFormatter(spec.series.at(-1).start))}${spec.table?` · ${formatInteger(spec.table.rows?.length||0)} registros relacionados`:''}</p>
          </div>
        </div>
        <button type="button" class="modal-close" aria-label="Fechar">${icon('close','modal-close-icon')}</button>
      </header>
      <div class="modal-kpi-grid">
        <div class="modal-stat primary"><span>${esc(currentCaption)}</span><b>${spec.formatter(s.current)}</b></div>
        <div class="modal-stat"><span>${esc(previousCaption)}</span><b>${spec.formatter(s.previous)}</b></div>
        <div class="modal-stat"><span>Variação</span><b class="${compare.tone}">${compare.arrow} ${compare.text}</b></div>
        <div class="modal-stat"><span>${esc(averageCaption)}</span><b>${spec.formatter(s.avg)}</b></div>
        <div class="modal-stat"><span>Atual vs média</span><b>${formatChange(s.vsAverage,spec.comparisonKind||'percent')}</b></div>
        <div class="modal-stat"><span>Menor valor</span><b>${spec.formatter(s.min)}</b></div>
        <div class="modal-stat"><span>Maior valor</span><b>${spec.formatter(s.max)}</b></div>
        <div class="modal-stat"><span>${esc(rangeCaption)}</span><b>${formatChange(s.firstToLast,spec.comparisonKind||'percent')}</b></div>
      </div>
      ${slaBreachPanel(spec)}
      <div class="modal-main-grid">
        <article class="modal-panel">${panelHeading('Evolução','trend')}<div class="modal-chart-box"><canvas id="metricDetailChart"></canvas></div></article>
        ${breakdown?`<article class="modal-panel">${panelHeading(esc(spec.breakdownTitle||'Detalhamento atual'),'list')}<div class="breakdown-grid">${breakdown}</div></article>`:''}
      </div>
      <article class="modal-panel modal-table-panel">${panelHeading('Comparativo por período','compare')}<div class="table-wrap"><table class="comparison-table"><thead><tr><th>Período</th><th>Valor</th><th>Diferença</th><th>Variação</th></tr></thead><tbody>${detailTableRows(spec)}</tbody></table></div></article>
    </section>`;

  document.body.appendChild(overlay);
  overlay.querySelector('.modal-close').addEventListener('click',closeMetricModal);
  overlay.querySelector('.modal-table-button')?.addEventListener('click',()=>openDetailTable(spec));
  overlay.addEventListener('click',(event)=>{if(event.target===overlay) closeMetricModal();});
  overlay.querySelector('.modal-close').focus();

  const ctx=document.getElementById('metricDetailChart');
  const modalValues=spec.series.map((x)=>x.value).filter(Number.isFinite);
  const isSla=spec.comparisonKind==='points';
  const modalFloor=isSla && modalValues.length && modalValues.every((value)=>value>=95) ? 95 : 0;
  state.modalChart=new Chart(ctx,{
    type:'line',
    data:{labels:spec.series.map((x)=>periodFormatter(x.start)),datasets:[{
      label:spec.title,
      data:spec.series.map((x)=>x.value),
      borderColor:'#3cf0b9',
      backgroundColor:gradientFill('rgba(60,240,185,.34)','rgba(60,240,185,.015)'),
      fill:true,
      tension:.34,
      pointRadius:4,
      pointBackgroundColor:'#06262a',
      pointBorderColor:'#3cf0b9'
    }]},
    options:chartOptions({
      layout:{padding:{top:24}},
      plugins:{
        legend:{display:false},
        valueLabels:{fontSize:12,formatter:(value)=>spec.formatter(value)},
        tooltip:{callbacks:{label:(context)=>spec.formatter(context.parsed.y)}}
      },
      scales:isSla?{y:integerGridAxis({min:modalFloor,max:100,beginAtZero:modalFloor===0})}:{}
    })
  });
}

let detachScrollSpy = null;

function sectionLabel(page) {
  return ({ overview:'Visão geral', demands:'Demandas', backlog:'Backlog', environments:'Ambientes', improvements:'Melhorias' })[page] || 'Visão geral';
}

function setActiveSection(page, { updateHash = true } = {}) {
  if (!page) return;
  state.page = page;
  document.querySelectorAll('[data-section]').forEach((button)=>{
    const active = button.dataset.section === page;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current','true');
    else button.removeAttribute('aria-current');
  });
  const label = document.getElementById('currentSectionLabel');
  if (label) label.textContent = sectionLabel(page);
  if (updateHash && history.replaceState) history.replaceState(null, '', `#${page}`);
}

function initScrollSpy() {
  detachScrollSpy?.();
  const sections = [...document.querySelectorAll('[data-dashboard-section]')];
  const progress = document.getElementById('sidebarProgressBar');
  let raf = 0;

  const update = () => {
    raf = 0;
    const marker = window.scrollY + 170;
    let active = sections[0]?.dataset.dashboardSection || 'overview';
    for (const section of sections) {
      if (section.offsetTop <= marker) active = section.dataset.dashboardSection;
      else break;
    }
    setActiveSection(active);

    if (progress) {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress.style.height = `${Math.min(100, Math.max(0, (window.scrollY / max) * 100))}%`;
    }
  };

  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(update);
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll, { passive:true });
  update();
  detachScrollSpy = () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    if (raf) cancelAnimationFrame(raf);
  };
}

function destroyChartsInside(root) {
  if (!root) return;
  root.querySelectorAll('canvas[id]').forEach((canvas)=>{
    const id = canvas.id;
    state.chartObserver?.unobserve(canvas);
    const timer = state.chartUnloadTimers.get(id);
    if (timer) clearTimeout(timer);
    state.chartUnloadTimers.delete(id);
    state.pendingCharts.delete(id);
    const chart = state.charts.get(id);
    if (chart) chart.destroy();
    state.charts.delete(id);
    canvas.dataset.chartReady = '0';
  });
}

function bindDetailButtons(root = document) {
  root.querySelectorAll('[data-detail-key]').forEach((button)=>{
    button.addEventListener('click',()=>openMetricModal(button.dataset.detailKey));
  });
}

function bindOverviewEvents(root = document) {
  root.querySelectorAll('[data-overview-type]').forEach((control)=>{
    const activate=()=>{
      const key=control.dataset.overviewType;
      state.overviewType=state.overviewType===key?null:key;
      refreshOverviewSection();
    };
    control.addEventListener('click',activate);
    if(control.tagName.toLowerCase()!=='button') control.addEventListener('keydown',(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate();}});
  });
  root.querySelector('[data-clear-overview-filter]')?.addEventListener('click',()=>{
    state.overviewFilterWeek=null;
    state.overviewType=null;
    refreshOverviewSection();
  });
}

function bindBacklogEvents(root = document) {
  root.querySelector('[data-clear-backlog-filter]')?.addEventListener('click',()=>{
    state.backlogAgeBucket=null;
    state.backlogStatus=null;
    refreshBacklogSection();
  });
}

function bindEnvironmentEvents(root = document) {
  root.querySelectorAll('[data-env-filter]').forEach((card)=>{
    const activate=()=>{
      const env=card.dataset.envFilter;
      state.environmentSelected=state.environmentSelected===env?null:env;
      refreshEnvironmentsSection();
    };
    card.addEventListener('click',(event)=>{if(event.target.closest('[data-detail-key]'))return;activate();});
    card.addEventListener('keydown',(event)=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('[data-detail-key]')){event.preventDefault();activate();}});
  });
  root.querySelectorAll('.env-detail-button').forEach((button)=>button.addEventListener('click',(event)=>event.stopPropagation()));
  root.querySelector('[data-clear-environment-filter]')?.addEventListener('click',()=>{
    state.environmentFilterWeek=null;
    state.environmentSelected=null;
    refreshEnvironmentsSection();
  });
}

function bindImprovementEvents(root = document) {
  root.querySelectorAll('[data-improvement-status-filter]').forEach((card)=>{
    const activate=()=>{
      const status=card.dataset.improvementStatusFilter;
      state.improvementStatus=status==='__all__'?null:(state.improvementStatus===status?null:status);
      refreshImprovementsSection();
    };
    card.addEventListener('click',(event)=>{
      if(event.target.closest('[data-detail-key]')) return;
      activate();
    });
    card.addEventListener('keydown',(event)=>{
      if((event.key==='Enter'||event.key===' ')&&!event.target.closest('[data-detail-key]')){
        event.preventDefault();
        activate();
      }
    });
  });
  root.querySelectorAll('.improvement-detail-button').forEach((button)=>button.addEventListener('click',(event)=>event.stopPropagation()));
  root.querySelector('[data-clear-improvement-filter]')?.addEventListener('click',()=>{
    state.improvementMonth=null;
    state.improvementStatus=null;
    refreshImprovementsSection();
  });
}

function bindDemandEvents(root = document) {
  root.querySelectorAll('[data-demand-tab]').forEach((button)=>button.addEventListener('click',()=>{
    state.demandTab=button.dataset.demandTab;
    state.demandFilterWeek=null;
    state.demandFilterDay=null;
    state.demandPriority=null;
    state.page='demands';
    refreshDemandsSection();
  }));

  root.querySelector('[data-clear-demand-filter]')?.addEventListener('click',()=>{
    state.demandFilterWeek=null;
    state.demandFilterDay=null;
    state.demandPriority=null;
    refreshDemandsSection();
  });

  root.querySelectorAll('[data-env-option]').forEach((button)=>button.addEventListener('click',()=>{
    const nextEnv=button.dataset.envOption;
    if(!nextEnv || nextEnv===state.env){
      button.closest('details')?.removeAttribute('open');
      return;
    }
    state.env=nextEnv;
    state.demandFilterWeek=null;
    state.demandFilterDay=null;
    state.demandPriority=null;
    state.page='demands';
    button.closest('details')?.removeAttribute('open');
    refreshDemandsSection();
  }));
}

function replaceSection(sectionId, builder, binder) {
  const oldSection=document.getElementById(`section-${sectionId}`);
  if(!oldSection) return false;
  captureChartSnapshots(oldSection);
  destroyChartsInside(oldSection);
  const section=builder();
  oldSection.outerHTML=section.html;
  const root=document.getElementById(`section-${sectionId}`);
  root?.classList.add('section-filter-transition');
  section.init();
  binder?.(root);
  bindDetailButtons(root);
  if (root) window.setTimeout(() => root.classList.remove('section-filter-transition'), 280);
  return true;
}

const sectionRefreshRafs = new Map();

function refreshSectionNow(sectionId, builder, binder) {
  const scrollY = window.scrollY;
  document.documentElement.classList.add('filter-refreshing');
  if (!replaceSection(sectionId, builder, binder)) {
    render({ focusSection: sectionId });
    document.documentElement.classList.remove('filter-refreshing');
    return;
  }
  // Restore in the same task so the browser never paints an intermediate jump.
  window.scrollTo(0, scrollY);
  initScrollSpy();
  setActiveSection(sectionId, { updateHash:false });
  requestAnimationFrame(() => document.documentElement.classList.remove('filter-refreshing'));
}

function scheduleSectionRefresh(sectionId, builder, binder) {
  const pending = sectionRefreshRafs.get(sectionId);
  if (pending) cancelAnimationFrame(pending);
  const raf = requestAnimationFrame(() => {
    sectionRefreshRafs.delete(sectionId);
    refreshSectionNow(sectionId, builder, binder);
  });
  sectionRefreshRafs.set(sectionId, raf);
}

function refreshDemandsSection(){scheduleSectionRefresh('demands',buildDemandsSection,bindDemandEvents);}
function refreshOverviewSection(){scheduleSectionRefresh('overview',buildOverviewSection,bindOverviewEvents);}
function refreshBacklogSection(){scheduleSectionRefresh('backlog',buildBacklogSection,bindBacklogEvents);}
function refreshEnvironmentsSection(){scheduleSectionRefresh('environments',buildEnvironmentsSection,bindEnvironmentEvents);}
function refreshImprovementsSection(){scheduleSectionRefresh('improvements',buildImprovementsSection,bindImprovementEvents);}

function resetWeekScopedFilters(){
  state.demandFilterWeek=null;
  state.demandFilterDay=null;
  state.demandPriority=null;
  state.overviewFilterWeek=null;
  state.overviewType=null;
  state.backlogAgeBucket=null;
  state.backlogStatus=null;
  state.environmentFilterWeek=null;
  state.environmentSelected=null;
}

function scheduleIdleTask(callback) {
  if ('requestIdleCallback' in window) return window.requestIdleCallback(callback, { timeout:220 });
  return window.setTimeout(() => callback({ didTimeout:true, timeRemaining:() => 0 }), 0);
}

function refreshWeekDependentSections(){
  const token = ++state.weekRefreshToken;
  const scrollY = window.scrollY;
  const active = state.page;
  const activeBefore = document.getElementById(`section-${active}`)?.getBoundingClientRect().top ?? null;
  closeMetricModal();
  document.documentElement.classList.add('dashboard-updating');
  detachScrollSpy?.();

  const jobs = [
    ['overview',buildOverviewSection,bindOverviewEvents],
    ['demands',buildDemandsSection,bindDemandEvents],
    ['backlog',buildBacklogSection,bindBacklogEvents],
    ['environments',buildEnvironmentsSection,bindEnvironmentEvents]
  ];

  // A seção visível é atualizada primeiro; as demais são distribuídas entre frames ociosos.
  const activeIndex = jobs.findIndex(([id]) => id === active);
  if (activeIndex >= 0) {
    const [id,builder,binder] = jobs.splice(activeIndex,1)[0];
    replaceSection(id,builder,binder);
  }

  const finalize = () => {
    if (token !== state.weekRefreshToken) return;
    initScrollSpy();
    setActiveSection(active,{updateHash:false});
    const activeAfter = document.getElementById(`section-${active}`)?.getBoundingClientRect().top ?? null;
    if (Number.isFinite(activeBefore) && Number.isFinite(activeAfter)) {
      window.scrollBy(0, activeAfter - activeBefore);
    } else {
      window.scrollTo(0, scrollY);
    }
    requestAnimationFrame(()=>document.documentElement.classList.remove('dashboard-updating'));
  };

  const runNext = () => {
    if (token !== state.weekRefreshToken) return;
    const job = jobs.shift();
    if (!job) { finalize(); return; }
    scheduleIdleTask(() => {
      if (token !== state.weekRefreshToken) return;
      replaceSection(job[0],job[1],job[2]);
      runNext();
    });
  };

  runNext();
}

function render({ restoreScroll = null, focusSection = null } = {}) {
  closeMetricModal();
  destroyCharts();
  state.metricDetails = new Map();

  const sections = [
    buildOverviewSection(),
    buildDemandsSection(),
    buildBacklogSection(),
    buildEnvironmentsSection(),
    buildImprovementsSection()
  ];

  app.innerHTML = shell(sections.map((section)=>section.html).join(''));
  sections.forEach((section)=>section.init());
  bindEvents();
  initScrollSpy();

  requestAnimationFrame(()=>{
    if (focusSection) {
      document.getElementById(`section-${focusSection}`)?.scrollIntoView({ behavior:'auto', block:'start' });
      setActiveSection(focusSection);
    } else if (Number.isFinite(restoreScroll)) {
      window.scrollTo({ top:restoreScroll, behavior:'auto' });
    } else {
      setActiveSection(state.page, { updateHash:false });
    }
  });
}

function bindEvents() {
  document.querySelectorAll('[data-section]').forEach((button)=>button.addEventListener('click',()=>{
    const page=button.dataset.section;
    setActiveSection(page);
    document.getElementById(`section-${page}`)?.scrollIntoView({behavior:'smooth',block:'start'});
  }));

  bindOverviewEvents(document);
  bindDemandEvents(document);
  bindBacklogEvents(document);
  bindEnvironmentEvents(document);
  bindImprovementEvents(document);
  bindDetailButtons(document);

  document.querySelectorAll('[data-week-option]').forEach((button)=>button.addEventListener('click',()=>{
    const value=button.dataset.weekOption;
    if(!value || isoDate(state.week)===value){
      button.closest('details')?.removeAttribute('open');
      return;
    }
    state.week=parseIsoLocal(value);
    resetWeekScopedFilters();
    button.closest('details')?.removeAttribute('open');

    // Atualiza o slicer imediatamente antes de recalcular os painéis.
    const summaryValue=document.querySelector('#weekSlicer [data-slicer-value]');
    if(summaryValue) summaryValue.textContent=`Semana de ${formatWeek(state.week)}`;
    document.querySelectorAll('[data-week-option]').forEach((option)=>{
      const selected=option.dataset.weekOption===value;
      option.classList.toggle('selected',selected);
      option.setAttribute('aria-selected',selected?'true':'false');
    });

    requestAnimationFrame(refreshWeekDependentSections);
  }));
}

function restoreNearbyCharts() {
  ensureChartObserver();
  const margin = 320;
  for (const [id, config] of state.pendingCharts) {
    const canvas = document.getElementById(id);
    if (!canvas || !canvas.isConnected) continue;
    state.chartObserver?.observe(canvas);
    const rect = canvas.getBoundingClientRect();
    if (rect.bottom >= -margin && rect.top <= window.innerHeight + margin) instantiateChart(id, config);
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    for (const id of [...state.charts.keys()]) destroyVirtualChart(id);
  } else {
    requestAnimationFrame(restoreNearbyCharts);
  }
});

document.addEventListener('keydown'  ,(event)=>{if(event.key==='Escape') closeMetricModal();});

document.addEventListener('click',(event)=>{
  document.querySelectorAll('details.data-slicer[open]').forEach((details)=>{
    if(!details.contains(event.target)) details.removeAttribute('open');
  });
},{passive:true});

async function boot() {
  app.innerHTML='<div class="loading">Carregando dashboard e planilhas…</div>';
  try {
    state.data=await loadData();
    const weeks=availableWeeks(state.data.main);
    // Sempre inicia pelo período mais recente disponível nos dados demo.
    // `availableWeeks` já retorna as semanas em ordem decrescente.
    state.week=weeks[0] || null;
    const hashPage=location.hash.replace('#','');
    const validPages=new Set(['overview','demands','backlog','environments','improvements']);
    if(validPages.has(hashPage)) state.page=hashPage;
    render({focusSection:state.page==='overview'?null:state.page});
  } catch (error) {
    console.error(error);
    app.innerHTML=`<div class="error-box"><h2>Não foi possível carregar os dados.</h2><p>${esc(error.message)}</p><p>Confirme se <code>ATUALIZAR_PLANILHAS/</code> contém um <code>Report Geral*.csv</code>, um <code>Report Backlog*.csv</code> e <code>MELHORIAS.xlsx</code>, depois execute <code>npm run dev</code>.</p></div>`;
  }
}

boot();
