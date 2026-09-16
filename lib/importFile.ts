import { fromByteArray } from "base64-js";
import * as DocumentPicker from "expo-document-picker";
import { parseBbvaWorkbook } from "./parseBbva";
import { mergeTransactions, MergeResult } from "./storage";

export interface ImportOutcome extends MergeResult {
  parsedCount: number;
}

/** Reads a local URI as a base64 string via fetch + bytes(), bypassing both
 * React Native's Blob store and expo-file-system's permission model (which
 * rejects document-picker's cache-copied files under Expo Go). */
async function uriToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const bytes = await response.bytes();
  return fromByteArray(bytes);
}

/** Opens the system file picker and imports a BBVA xlsx export (either the
 * "Ultime transazioni" or the newer "Movimenti" format, auto-detected by
 * parseBbvaWorkbook). Returns null if the user cancels the picker. */
export async function importBbvaFile(): Promise<ImportOutcome | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];

  const base64 = await uriToBase64(asset.uri);

  const parsed = parseBbvaWorkbook(base64);
  if (parsed.length === 0) {
    throw new Error("Nessuna transazione trovata nel file.");
  }

  const merge = await mergeTransactions(parsed);
  return { ...merge, parsedCount: parsed.length };
}
