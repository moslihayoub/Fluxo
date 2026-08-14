import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Month, Operation } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── ID generation ────────────────────────────────────────────
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Firebase helper ───────────────────────────────────────────
export const cleanForFirebase = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
};

// ── Financial conversion ─────────────────────────────────────
export function toCents(value: string | number): number {
  return Math.round(parseFloat(String(value)) * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

// ── Currency & Number formatting ──────────────────────────────
export function formatAmount(amount: number): string {
  const safe = isNaN(amount) ? 0 : amount;
  const hasDecimals = Math.abs(safe % 1) > 0.001;
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(safe).replace(/[\u202f\u00a0]/g, ' ');
}

export function formatCurrency(amount: number, signed = false, currency = 'MAD'): string {
  const safe = isNaN(amount) ? 0 : amount;
  const absFormatted = formatAmount(Math.abs(safe));
  const sign = safe < 0 ? '-' : signed ? '+' : '';
  return `${sign}${absFormatted} ${currency}`.trim();
}

// ── Month name helpers ────────────────────────────────────────
export const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export function formatMonth(month: number, year: number, language: string = 'fr'): string {
  const date = new Date(year, month - 1, 1);
  const lang = language === 'en' ? 'en-US' : 'fr-FR';
  const monthName = new Intl.DateTimeFormat(lang, { month: 'long' }).format(date);
  // Capitalize first letter of month
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  return `${capitalizedMonth} ${year}`;
}

export function getMonthLabel(m: Month, language: string = 'fr'): string {
  return formatMonth(m.month, m.year, language);
}

// ── CSV Export ────────────────────────────────────────────────
export function generateClipboardText(
  operations: Operation[],
  months: any[]
): string {
  if (!operations || operations.length === 0) return '';
  const header = `Date\tLibellé\tType\tMontant\n`;
  const rows = operations
    .map((op) => {
      const monthObj = months.find((m) => m.id === op.monthId);
      const dateStr = monthObj ? `${monthObj.month}/${monthObj.year}` : '';
      const amount = (fromCents(op.amount_cents) || 0).toString().replace('.', ',');
      return `${dateStr}\t${op.label}\t${op.operationTypeLabel}\t${amount}`;
    })
    .join('\n');
  return header + rows;
}

export function exportCSV(
  operations: Operation[],
  months: Month[],
  filename: string
): void {
  const monthMap = new Map(months.map((m) => [m.id, m]));

  const headers = ['mois', 'annee', 'label', 'operationTypeLabel', 'kind', 'amount_cents', 'createdAt'];
  const rows = operations.map((op) => {
    const m = monthMap.get(op.monthId);
    return [
      m ? MONTH_NAMES[m.month - 1] : op.monthId,
      m ? m.year : '',
      `"${op.label.replace(/"/g, '""')}"`,
      `"${op.operationTypeLabel.replace(/"/g, '""')}"`,
      op.kind,
      op.amount_cents,
      op.createdAt,
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Extractor helper ──────────────────────────────────────────
export interface ParsedCSVRow {
  label: string;
  amount_cents: number;
}

export function parseCSV(text: string): ParsedCSVRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return [];

  // Try to detect header row
  const firstLine = lines[0].toLowerCase();
  const hasHeader =
    firstLine.includes('label') ||
    firstLine.includes('libelle') ||
    firstLine.includes('montant') ||
    firstLine.includes('amount') ||
    firstLine.includes('description');

  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .map((line) => {
      // Handle quoted fields
      const cols = parseCSVLine(line);
      if (cols.length < 2) return null;

      // Try to find label (first text-like col) and amount (first numeric col)
      let label = '';
      let amount_cents: number | null = null;

      for (const col of cols) {
        const trimmed = col.trim().replace(/^"|"$/g, '');
        const num = Math.round(parseFloat(trimmed.replace(',', '.').replace(/\s/g, '')) * 100);
        if (!isNaN(num) && amount_cents === null) {
          amount_cents = num;
        } else if (label === '' && trimmed !== '' && isNaN(num)) {
          label = trimmed;
        }
      }

      if (label === '' && cols[0]) label = cols[0].trim().replace(/^"|"$/g, '');
      if (amount_cents === null) return null;

      return { label: label || 'Import', amount_cents };
    })
    .filter((r): r is ParsedCSVRow => r !== null);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if ((ch === ',' || ch === ';') && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ── Metrics computation ───────────────────────────────────────
export function generateCSVContent(
  operations: Operation[],
  months: any[]
): string {
  if (!operations || operations.length === 0) return '';
  const header = `"Date","Libellé","Type","Montant"\n`;
  const rows = operations
    .map((op) => {
      const monthObj = months.find((m) => m.id === op.monthId);
      const dateStr = monthObj
        ? `${String(monthObj.month).padStart(2, '0')}/${monthObj.year}`
        : '';
      const isDecaissement = op.kind === 'decaissement' || (op.kind as string) === 'décaissement';
      const amount = (isDecaissement ? -op.amount_cents : op.amount_cents) / 100;
      return `"${dateStr}","${op.label}","${op.operationTypeLabel}","${amount}"`;
    })
    .join('\n');
  return header + rows;
}

export function computeMonthTotals(operations: Operation[], monthId: string) {
  const ops = operations.filter((op) => op.monthId === monthId);
  const totalEncaissement = ops
    .filter((op) => op.kind === 'encaissement')
    .reduce((sum, op) => sum + op.amount_cents, 0);
  const totalDecaissement = ops
    .filter((op) => op.kind === 'decaissement' || (op.kind as string) === 'décaissement')
    .reduce((sum, op) => sum + op.amount_cents, 0);
  return {
    totalEncaissement,
    totalDecaissement,
    solde: totalEncaissement - totalDecaissement,
    count: ops.length,
  };
}
