export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, withTime = false) {
  const date = toDate(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
  }).format(date);
}

export function formatNumber(value, maximumFractionDigits = 1) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits }).format(Number(value || 0));
}

export function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

export function sortByDateDescending(items, field = 'createdAt') {
  return [...items].sort((a, b) => {
    const left = toDate(a[field])?.getTime() || 0;
    const right = toDate(b[field])?.getTime() || 0;
    return right - left;
  });
}

export function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map((row) => headers.map((header) => escape(row[header])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function initials(name = 'FarmFleet') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
