import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { importBbvaFile, ImportOutcome } from "../lib/importFile";
import { loadTransactions } from "../lib/storage";
import { Transaction } from "../lib/types";

interface TransactionsContextValue {
  transactions: Transaction[];
  loading: boolean;
  importFile: () => Promise<ImportOutcome | null>;
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

  return (
    <TransactionsContext.Provider value={{ transactions, loading, importFile }}>
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
