const BASE = import.meta.env.BASE_URL;

const DATE_FIELDS = ['created', 'resolved', 'updated', 'dueDate'];

async function readJson(url) {
  const response = await fetch(url, { cache: import.meta.env.DEV ? 'no-store' : 'default' });
  if (!response.ok) throw new Error(`Falha ao carregar ${url}: HTTP ${response.status}`);
  return response.json();
}

function parseLocalDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return new Date(value);
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return null;
  return new Date(
    Number(match[1]), Number(match[2]) - 1, Number(match[3]),
    Number(match[4]), Number(match[5]), Number(match[6])
  );
}

function hydrateDates(rows) {
  for (const row of rows) {
    for (const key of DATE_FIELDS) row[key] = parseLocalDate(row[key]);
  }
  return rows;
}

export async function loadData() {
  const [main, backlog, improvements] = await Promise.all([
    readJson(`${BASE}data-cache/main.json`),
    readJson(`${BASE}data-cache/backlog.json`),
    readJson(`${BASE}data-cache/improvements.json`)
  ]);

  return {
    main: hydrateDates(main),
    backlog: hydrateDates(backlog),
    improvements: hydrateDates(improvements)
  };
}
