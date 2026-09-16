import AsyncStorage from "@react-native-async-storage/async-storage";
import { Transaction } from "./types";

const STORAGE_KEY = "bbva_transactions_v1";

export async function loadTransactions(): Promise<Transaction[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
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
 * Merges newly-parsed transactions into storage, de-duplicating by id.
 * The id is derived from all the fields of a row (see parseBbva.ts), so
 * re-importing the same file, an overlapping export, or a file containing
 * the same movements never creates duplicate entries.
 *
 * The older "Ultime transazioni" format bakes the running balance into the
 * id; the newer "Movimenti" format has no balance column at all, so a
 * movement imported from one can never hash to the same id as the same
 * movement imported from the other. For incoming rows with no balance
 * (i.e. parsed from the newer format) we fall back to matching on
 * `dedupeKey` against everything already stored, so re-importing an
 * overlapping "Movimenti" export after an "Ultime transazioni" one (or vice
 * versa) doesn't duplicate movements. This fallback is skipped for incoming
 * rows that do have a balance, to avoid the (rarer) risk of two distinct
 * same-day, same-amount movements from the older format being merged into
 * one just because they share a key.
 */
export async function mergeTransactions(
  incoming: Transaction[]
): Promise<MergeResult> {
  const existing = await loadTransactions();
  const byId = new Map(existing.map((t) => [t.id, t]));
  const existingKeys = new Set(existing.map(dedupeKey));

  let added = 0;
  let duplicates = 0;
  for (const t of incoming) {
    const isDuplicate =
      byId.has(t.id) || (t.balance === null && existingKeys.has(dedupeKey(t)));
    if (isDuplicate) {
      duplicates++;
      continue;
    }
    byId.set(t.id, t);
    existingKeys.add(dedupeKey(t));
    added++;
  }

  const all = Array.from(byId.values()).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  await saveTransactions(all);
  return { all, added, duplicates };
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
