import AsyncStorage from "@react-native-async-storage/async-storage";
import { Transaction } from "./types";

const STORAGE_KEY = "bbva_transactions_v1";

export async function loadTransactions(): Promise<Transaction[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Cleans up cross-format duplicates stored by earlier versions.
    const reconciled = reconcileFormats(parsed);
    if (reconciled.length !== parsed.length) await saveTransactions(reconciled);
    return reconciled;
  } catch {
    return [];
  }
}

async function saveTransactions(transactions: Transaction[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export interface MergeResult {
  all: Transaction[];
  added: number;
  duplicates: number;
}

/** Key used to spot the same real-world movement across the two supported
 * xlsx formats, which don't share enough fields to always produce the same
 * id (see parseBbva.ts): valueDate + date + amount + currency. */
function dedupeKey(t: Transaction): string {
  return [t.valueDate, t.date, t.amount.toFixed(2), t.currency].join("|");
}

/**
 * Removes the same movement stored twice, once per export format. The older
 * "Ultime transazioni" format bakes the running balance into the id, the
 * newer "Movimenti" one has no balance, so the two never share an id. Imported
 * rows with a balance are paired one-to-one with imported rows without one
 * that have the same `dedupeKey`, and the balance-less row of each pair is
 * dropped (the other is the richer record). Pairing one-to-one keeps two
 * genuinely distinct same-day, same-amount movements apart. Manual entries
 * are never touched.
 */
function reconcileFormats(all: Transaction[]): Transaction[] {
  const withBalance = new Map<string, number>();
  for (const t of all) {
    if (t.source === "manual" || t.balance === null) continue;
    const k = dedupeKey(t);
    withBalance.set(k, (withBalance.get(k) ?? 0) + 1);
  }
  if (withBalance.size === 0) return all;

  return all.filter((t) => {
    if (t.source === "manual" || t.balance !== null) return true;
    const k = dedupeKey(t);
    const left = withBalance.get(k) ?? 0;
    if (left === 0) return true;
    withBalance.set(k, left - 1);
    return false;
  });
}

/**
 * Merges newly-parsed transactions into storage, de-duplicating by id (the
 * id is derived from all the fields of a row, so re-importing the same file
 * or an overlapping export never creates duplicates), then reconciles the two
 * export formats (see reconcileFormats), whichever one was imported first.
 */
export async function mergeTransactions(
  incoming: Transaction[]
): Promise<MergeResult> {
  const existing = await loadTransactions();
  const byId = new Map(existing.map((t) => [t.id, t]));

  const incomingIds = new Set<string>();
  for (const t of incoming) {
    if (!byId.has(t.id)) {
      byId.set(t.id, t);
      incomingIds.add(t.id);
    }
  }

  const all = reconcileFormats(Array.from(byId.values())).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  await saveTransactions(all);

  const kept = new Set(all.map((t) => t.id));
  let added = 0;
  for (const id of incomingIds) if (kept.has(id)) added++;
  return { all, added, duplicates: incoming.length - added };
}

export async function clearTransactions(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function addTransaction(
  transaction: Transaction
): Promise<Transaction[]> {
  const existing = await loadTransactions();
  const all = [...existing, transaction].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  await saveTransactions(all);
  return all;
}

export async function deleteTransaction(id: string): Promise<Transaction[]> {
  const existing = await loadTransactions();
  const all = existing.filter((t) => t.id !== id);
  await saveTransactions(all);
  return all;
}
