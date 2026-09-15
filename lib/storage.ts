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

/**
 * Merges newly-parsed transactions into storage, de-duplicating by id.
 * The id is derived from all the fields of a row (see parseBbva.ts), so
 * re-importing the same file, an overlapping export, or a file containing
 * the same movements never creates duplicate entries.
 */
export async function mergeTransactions(
  incoming: Transaction[]
): Promise<MergeResult> {
  const existing = await loadTransactions();
  const byId = new Map(existing.map((t) => [t.id, t]));

  let added = 0;
  let duplicates = 0;
  for (const t of incoming) {
    if (byId.has(t.id)) {
      duplicates++;
      continue;
    }
    byId.set(t.id, t);
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
