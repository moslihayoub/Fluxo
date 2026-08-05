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

// ── Currency formatting ───────────────────────────────────────
export function formatCurrency(amount: number, signed = false): string {
  const formatted = new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  if (signed) {
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  }
  return formatted;
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
export function operationsToCSV(operations: Operation[]): string {
  const headers = ['mois', 'annee', 'label', 'operationTypeLabel', 'kind', 'amount', 'createdAt'];
  const rows = operations.map((op) => {
    // We need month data, so caller passes it or we look up monthId
    return [
      op.monthId, // will be replaced with proper month label by caller
      '',          // year placeholder
      `"${op.label.replace(/"/g, '""')}"`,
      `"${op.operationTypeLabel.replace(/"/g, '""')}"`,
      op.kind,
      op.amount.toFixed(2),
      op.createdAt,
    ].join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

export function exportCSV(
  operations: Operation[],
  months: Month[],
  filename: string
): void {
  const monthMap = new Map(months.map((m) => [m.id, m]));

  const headers = ['mois', 'annee', 'label', 'operationTypeLabel', 'kind', 'amount', 'createdAt'];
  const rows = operations.map((op) => {
    const m = monthMap.get(op.monthId);
    return [
      m ? MONTH_NAMES[m.month - 1] : op.monthId,
      m ? m.year : '',
      `"${op.label.replace(/"/g, '""')}"`,
      `"${op.operationTypeLabel.replace(/"/g, '""')}"`,
      op.kind,
      op.amount.toFixed(2),
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

// ── Simple CSV parser (for import) ───────────────────────────
export interface ParsedCSVRow {
  label: string;
  amount: number;
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
      let amount: number | null = null;

      for (const col of cols) {
        const trimmed = col.trim().replace(/^"|"$/g, '');
        const num = parseFloat(trimmed.replace(',', '.').replace(/\s/g, ''));
        if (!isNaN(num) && amount === null) {
          amount = num;
        } else if (label === '' && trimmed !== '' && isNaN(num)) {
          label = trimmed;
        }
      }

      if (label === '' && cols[0]) label = cols[0].trim().replace(/^"|"$/g, '');
      if (amount === null) return null;

      return { label: label || 'Import', amount };
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
export function computeMonthTotals(operations: Operation[], monthId: string) {
  const ops = operations.filter((op) => op.monthId === monthId);
  const totalEncaissement = ops
    .filter((op) => op.kind === 'encaissement')
    .reduce((sum, op) => sum + op.amount, 0);
  const totalDecaissement = ops
    .filter((op) => op.kind === 'decaissement')
    .reduce((sum, op) => sum + op.amount, 0);
  return {
    totalEncaissement,
    totalDecaissement,
    solde: totalEncaissement - totalDecaissement,
    count: ops.length,
  };
}
