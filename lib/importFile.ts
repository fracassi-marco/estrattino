import * as DocumentPicker from "expo-document-picker";
import { parseBbvaWorkbook } from "./parseBbva";
import { mergeTransactions, MergeResult } from "./storage";

export interface ImportOutcome extends MergeResult {
  parsedCount: number;
}

/** Reads a local/content URI as a base64 string via fetch + Blob + FileReader.
 * This avoids the native file-system module's sandboxing rules, which can
 * reject a document-picker URI depending on the runtime (e.g. Expo Go). */
function uriToBase64(uri: string): Promise<string> {
  return fetch(uri)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(reader.error);
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.slice(result.indexOf(",") + 1));
          };
          reader.readAsDataURL(blob);
        })
    );
}

/** Opens the system file picker and imports a BBVA xlsx export. Returns
 * null if the user cancels the picker. */
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
