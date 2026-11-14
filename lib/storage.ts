import AsyncStorage from "@react-native-async-storage/async-storage";
import { cyrb53 } from "./hash";
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
    if (JSON.stringify(reconciled) !== raw) await saveTransactions(reconciled);
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
  const repaired = repairLegacyAmounts(all);

  const withBalance = new Map<string, number>();
  const withBalanceLegacy = new Map<string, number>();
  const bump = (m: Map<string, number>, k: string, by: number) =>
    m.set(k, (m.get(k) ?? 0) + by);
  for (const t of repaired) {
    if (t.source === "manual" || t.balance === null) continue;
    bump(withBalance, dedupeKey(t), 1);
    if (Math.abs(t.amount) >= 1000) bump(withBalanceLegacy, legacyKey(t), 1);
  }
  if (withBalance.size === 0) return repaired;

  // Each balance row can absorb a single balance-less row, whichever map
  // finds it, so a pair is never counted through both.
  const claimed = new Map<string, number>();
  return repaired.filter((t) => {
    if (t.source === "manual" || t.balance !== null) return true;
    const k = dedupeKey(t);
    if ((withBalance.get(k) ?? 0) > 0) {
      bump(withBalance, k, -1);
      return false;
    }
    const lk = [t.valueDate, t.date, t.amount.toFixed(5), t.currency].join("|");
    if ((withBalanceLegacy.get(lk) ?? 0) > (claimed.get(lk) ?? 0)) {
      bump(claimed, lk, 1);
      return false;
    }
    return true;
  });
}

/**
 * Earlier versions parsed "1,234.56" (newer export) as 1.23456, so the
 * balance-less rows stored back then carry a wrong amount, and with it a
 * wrong id and dedupeKey. A real amount never has more than two decimals,
 * so those are recognisable and the original value can be rebuilt: toFixed(5)
 * gives "A.BBBCC", i.e. the original "A,BBB.CC". Ambiguous leftovers (e.g.
 * 2,500.00 became 2.5) are caught by legacyKey in reconcileFormats instead.
 */
function repairLegacyAmounts(all: Transaction[]): Transaction[] {
  const seen = new Set<string>();
  const out: Transaction[] = [];
  for (const t of all) {
    let r = t;
    const cents = t.amount * 100;
    if (
      t.source !== "manual" &&
      t.balance === null &&
      Math.abs(cents - Math.round(cents)) > 1e-6
    ) {
      const [int, dec] = Math.abs(t.amount).toFixed(5).split(".");
      const amount = Math.sign(t.amount) * parseFloat(`${int}${dec.slice(0, 3)}.${dec.slice(3)}`);
      const id = cyrb53(
        [t.valueDate, t.date, t.keyword, t.movement, amount.toFixed(2)].join("|")
      );
      r = { ...t, amount, id };
    }
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
}

/** The amount a balance row would have had if it had been mis-parsed by the
 * old "1,234.56" bug, so it can be matched to a corrupted balance-less row. */
function legacyKey(t: Transaction): string {
  const [int, dec] = Math.abs(t.amount).toFixed(2).split(".");
  const wrong =
    int.length <= 6
      ? Math.sign(t.amount) *
        parseFloat(`${int.slice(0, -3)}.${int.slice(-3)}${dec}`)
      : t.amount;
  return [t.valueDate, t.date, wrong.toFixed(5), t.currency].join("|");
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
