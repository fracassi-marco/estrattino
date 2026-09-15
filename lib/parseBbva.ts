import * as XLSX from "xlsx";
import { cyrb53 } from "./hash";
import { Transaction } from "./types";

const HEADER_MARKER = "data valuta";
const GENERIC_MOVEMENTS = new Set(["pagamento con carta", ""]);

function cell(row: string[], index: number): string {
  return (row[index] ?? "").toString().trim();
}

export function parseItalianNumber(raw: string): number | null {
  let s = raw.trim();
  if (!s) return null;
  s = s.replace(/[€\s]/g, "");
  if (s.includes(",") && s.includes(".")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

export function parseItalianDate(raw: string): string | null {
  const m = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function titleCase(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return t
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}

/**
 * Parses a BBVA "Ultime transazioni" export (xlsx, base64-encoded) into a
 * flat list of Transaction records. The export has a few title rows before
 * the real header ("Data valuta", "Data", "Parola chiave", "Movimento",
 * "Importo", "Valuta", "Disponibile", "Valuta", "Osservazioni").
 */
export function parseBbvaWorkbook(base64: string): Transaction[] {
  const workbook = XLSX.read(base64, { type: "base64" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Il file non contiene alcun foglio.");
  }
  const sheet = workbook.Sheets[sheetName];
  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: "",
  });

  const headerIdx = rows.findIndex(
    (r) => cell(r, 0).toLowerCase() === HEADER_MARKER
  );
  if (headerIdx === -1) {
    throw new Error(
      'Formato non riconosciuto: intestazione "Data valuta" non trovata.'
    );
  }

  const transactions: Transaction[] = [];

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    const valueDateRaw = cell(row, 0);
    const dateRaw = cell(row, 1);
    if (!valueDateRaw || !dateRaw) continue;

    const valueDate = parseItalianDate(valueDateRaw);
    const date = parseItalianDate(dateRaw);
    if (!valueDate || !date) continue;

    const amountRaw = cell(row, 4);
    const amount = parseItalianNumber(amountRaw);
    if (amount === null) continue;

    const keyword = cell(row, 2);
    const movement = cell(row, 3);
    const currency = cell(row, 5) || "EUR";
    const balance = parseItalianNumber(cell(row, 6));
    const observations = cell(row, 8);

    const description = titleCase(keyword) || titleCase(movement) || "Movimento";
    const showMovementAsSubtitle =
      movement &&
      movement.toLowerCase() !== keyword.toLowerCase() &&
      !GENERIC_MOVEMENTS.has(movement.toLowerCase());
    const subtitle = showMovementAsSubtitle ? titleCase(movement) : "";

    const idSource = [
      valueDate,
      date,
      keyword,
      movement,
      amount.toFixed(2),
      balance ?? "",
      observations,
    ].join("|");

    transactions.push({
      id: cyrb53(idSource),
      valueDate,
      date,
      keyword,
      movement,
      amount,
      currency,
      balance,
      observations,
      description,
      subtitle,
      source: "import",
    });
  }

  return transactions;
}
