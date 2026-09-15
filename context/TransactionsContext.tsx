import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { importBbvaFile, ImportOutcome } from "../lib/importFile";
import {
  createManualTransaction,
  ManualTransactionInput,
} from "../lib/manualTransaction";
import {
  addTransaction,
  deleteTransaction,
  loadTransactions,
} from "../lib/storage";
import { Transaction } from "../lib/types";

interface TransactionsContextValue {
  transactions: Transaction[];
  loading: boolean;
  importFile: () => Promise<ImportOutcome | null>;
  addManualTransaction: (input: ManualTransactionInput) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextValue | null>(
  null
);

export function TransactionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await loadTransactions();
      setTransactions(data);
      setLoading(false);
    })();
  }, []);

  const importFile = useCallback(async () => {
    const outcome = await importBbvaFile();
    if (outcome) setTransactions(outcome.all);
    return outcome;
  }, []);

  const addManual = useCallback(async (input: ManualTransactionInput) => {
    const transaction = createManualTransaction(input);
    const all = await addTransaction(transaction);
    setTransactions(all);
  }, []);

  const removeTransaction = useCallback(async (id: string) => {
    const all = await deleteTransaction(id);
    setTransactions(all);
  }, []);

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        loading,
        importFile,
        addManualTransaction: addManual,
        deleteTransaction: removeTransaction,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions(): TransactionsContextValue {
  const ctx = useContext(TransactionsContext);
  if (!ctx) {
    throw new Error("useTransactions must be used within TransactionsProvider");
  }
  return ctx;
}
