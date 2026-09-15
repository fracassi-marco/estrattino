import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { parseItalianDate, parseItalianNumber } from "../lib/parseBbva";
import { colors } from "../lib/theme";

type EntryType = "income" | "expense";

interface Props {
  visible: boolean;
  defaultDate: string; // ISO yyyy-mm-dd, prefilled into the date field
  onClose: () => void;
  onSubmit: (input: { date: string; description: string; amount: number }) => void;
}

function toItalianDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function AddTransactionModal({ visible, defaultDate, onClose, onSubmit }: Props) {
  const [type, setType] = useState<EntryType>("expense");
  const [description, setDescription] = useState("");
  const [amountText, setAmountText] = useState("");
  const [dateText, setDateText] = useState(toItalianDate(defaultDate));
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setType("expense");
      setDescription("");
      setAmountText("");
      setDateText(toItalianDate(defaultDate));
      setError("");
    }
  }, [visible, defaultDate]);

  const handleSave = () => {
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setError("Inserisci una descrizione.");
      return;
    }
    const amount = parseItalianNumber(amountText);
    if (amount === null || amount <= 0) {
      setError("Inserisci un importo valido.");
      return;
    }
    const date = parseItalianDate(dateText);
    if (!date) {
      setError("Inserisci una data valida (GG/MM/AAAA).");
      return;
    }
    onSubmit({
      date,
      description: trimmedDescription,
      amount: type === "expense" ? -amount : amount,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdropTouchable} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>Nuovo movimento</Text>

          <View style={styles.typeRow}>
            <Pressable
              style={[styles.typeChip, type === "expense" && styles.typeChipExpenseActive]}
              onPress={() => setType("expense")}
            >
              <Text style={[styles.typeText, type === "expense" && styles.typeTextActive]}>
                Uscita
              </Text>
            </Pressable>
            <Pressable
              style={[styles.typeChip, type === "income" && styles.typeChipIncomeActive]}
              onPress={() => setType("income")}
            >
              <Text style={[styles.typeText, type === "income" && styles.typeTextActive]}>
                Entrata
              </Text>
            </Pressable>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Descrizione"
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.rowInput]}
              placeholder="Importo"
              placeholderTextColor={colors.textMuted}
              value={amountText}
              onChangeText={setAmountText}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={[styles.input, styles.rowInput]}
              placeholder="GG/MM/AAAA"
              placeholderTextColor={colors.textMuted}
              value={dateText}
              onChangeText={setDateText}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.actionsRow}>
            <Pressable style={[styles.actionButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelText}>Annulla</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.saveText}>Salva</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(37,54,70,0.4)" },
  backdropTouchable: { ...StyleSheet.absoluteFill },
  sheet: {
    backgroundColor: colors.neutral,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  title: { fontSize: 17, fontWeight: "700", color: colors.secondary, marginBottom: 16 },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.border,
  },
  typeChipExpenseActive: { backgroundColor: colors.expense },
  typeChipIncomeActive: { backgroundColor: colors.primary },
  typeText: { fontSize: 14, fontWeight: "600", color: colors.secondary },
  typeTextActive: { color: colors.neutral },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.secondary,
    marginBottom: 12,
  },
  row: { flexDirection: "row", gap: 12 },
  rowInput: { flex: 1 },
  error: { color: colors.expense, fontSize: 12, marginBottom: 8 },
  actionsRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  actionButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  cancelButton: { backgroundColor: colors.border },
  cancelText: { color: colors.secondary, fontWeight: "600", fontSize: 14 },
  saveButton: { backgroundColor: colors.secondary },
  saveText: { color: colors.neutral, fontWeight: "700", fontSize: 14 },
});
