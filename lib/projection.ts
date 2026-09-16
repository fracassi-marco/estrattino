import { Transaction } from "./types";

export interface MonthExpenseProjection {
  daysElapsed: number;
  daysInMonth: number;
  expenseSoFar: number;
  projectedExpense: number;
}

/** Linear projection of the current month's total expense, based on the
 * expense accrued so far and how many days of the month have elapsed. */
export function computeMonthExpenseProjection(
  monthTransactions: Transaction[],
  referenceDate: Date = new Date()
): MonthExpenseProjection {
  const daysInMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    0
  ).getDate();
  const daysElapsed = referenceDate.getDate();
  const expenseSoFar = monthTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const projectedExpense = daysElapsed > 0 ? (expenseSoFar / daysElapsed) * daysInMonth : 0;
  return { daysElapsed, daysInMonth, expenseSoFar, projectedExpense };
}

export interface AverageCrossoverDay {
  day: number; // day of month, 1-based
  surpassed: boolean; // true = already happened on or before today, false = projected
}

/** Finds the day of the current month on which cumulative expense has
 * crossed (or, at the current pace, is projected to cross) `avgExpense`.
 * Returns null if it already won't be crossed within this month. */
export function computeAverageCrossoverDay(
  monthTransactions: Transaction[],
  avgExpense: number,
  referenceDate: Date = new Date()
): AverageCrossoverDay | null {
  if (avgExpense <= 0) return null;

  const daysInMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    0
  ).getDate();
  const daysElapsed = referenceDate.getDate();

  const expenseByDay = new Map<number, number>();
  for (const t of monthTransactions) {
    if (t.amount >= 0) continue;
    const day = Number(t.date.slice(8, 10));
    expenseByDay.set(day, (expenseByDay.get(day) || 0) + Math.abs(t.amount));
  }

  let cumulative = 0;
  for (let day = 1; day <= daysElapsed; day++) {
    cumulative += expenseByDay.get(day) || 0;
    if (cumulative >= avgExpense) {
      return { day, surpassed: true };
    }
  }

  if (cumulative <= 0) return null;
  const dailyRate = cumulative / daysElapsed;
  const projectedDay = Math.ceil(avgExpense / dailyRate);
  if (projectedDay > daysInMonth) return null;
  return { day: projectedDay, surpassed: false };
}
