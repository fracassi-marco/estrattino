export interface Transaction {
  id: string;
  valueDate: string; // ISO yyyy-mm-dd (Data valuta)
  date: string; // ISO yyyy-mm-dd (Data) - used for grouping by month
  keyword: string; // Parola chiave
  movement: string; // Movimento
  amount: number; // signed amount, negative = expense
  currency: string;
  balance: number | null; // Disponibile after this transaction
  observations: string; // Osservazioni
  description: string; // human friendly title
  subtitle: string; // secondary line, may be empty
}

export interface MonthSummary {
  key: string; // yyyy-mm
  label: string; // "Settembre 2026"
  income: number;
  expense: number; // positive number
  diff: number;
  count: number;
}
