import { cyrb53 } from "./hash";
import { Transaction } from "./types";

export interface ManualTransactionInput {
  date: string; // ISO yyyy-mm-dd
  description: string;
  amount: number; // signed, negative = expense
}

/** Builds a Transaction for a manually-entered movement. The id mixes in
 * Date.now()/Math.random() (unlike the imported-row id, which is derived
 * from stable fields) since a user can add two identical manual entries. */
export function createManualTransaction(input: ManualTransactionInput): Transaction {
  const idSource = [
    "manual",
    input.date,
    input.description,
    input.amount.toFixed(2),
    Date.now(),
    Math.random(),
  ].join("|");

  return {
    id: cyrb53(idSource),
    valueDate: input.date,
    date: input.date,
    keyword: input.description,
    movement: "",
    amount: input.amount,
    currency: "EUR",
    balance: null,
    observations: "",
    description: input.description,
    subtitle: "",
    source: "manual",
  };
}
