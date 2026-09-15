import { MonthSummary, Transaction } from "./types";

const MONTH_NAMES = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

export function monthKey(dateIso: string): string {
  return dateIso.slice(0, 7); // yyyy-mm
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export function monthLabelShort(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH_NAMES[m - 1].slice(0, 3)} '${String(y).slice(2)}`;
}

/** Summaries for every month present in the transactions, sorted most
 * recent first. */
export function summarizeByMonth(transactions: Transaction[]): MonthSummary[] {
  const map = new Map<string, MonthSummary>();
  for (const t of transactions) {
    const key = monthKey(t.date);
    let summary = map.get(key);
    if (!summary) {
      summary = { key, label: monthLabel(key), income: 0, expense: 0, diff: 0, count: 0 };
      map.set(key, summary);
    }
    if (t.amount >= 0) summary.income += t.amount;
    else summary.expense += Math.abs(t.amount);
    summary.diff = summary.income - summary.expense;
    summary.count += 1;
  }
  return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
}
