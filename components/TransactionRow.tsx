import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { formatCurrency, formatDate } from "../lib/format";
import { colors } from "../lib/theme";
import { Transaction } from "../lib/types";

interface Props {
  transaction: Transaction;
  onDelete?: (id: string) => void;
}

export function TransactionRow({ transaction, onDelete }: Props) {
  const isExpense = transaction.amount < 0;
  const isManual = transaction.source === "manual";
  const canDelete = isManual && !!onDelete;

  const handleLongPress = () => {
    if (!canDelete) return;
    Alert.alert("Eliminare il movimento?", transaction.description, [
      { text: "Annulla", style: "cancel" },
      { text: "Elimina", style: "destructive", onPress: () => onDelete!(transaction.id) },
    ]);
  };

  return (
    <Pressable
      style={[styles.row, isManual && styles.rowManual]}
      onLongPress={canDelete ? handleLongPress : undefined}
    >
      <View style={styles.left}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {transaction.description}
          </Text>
          {isManual && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Manuale</Text>
            </View>
          )}
        </View>
        {!!transaction.subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {transaction.subtitle}
          </Text>
        )}
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
      </View>
      <Text
        style={[styles.amount, { color: isExpense ? colors.expense : colors.primaryDark }]}
      >
        {isExpense ? "" : "+"}
        {formatCurrency(transaction.amount)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.neutral,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowManual: {
    backgroundColor: "#F2FAF6",
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  left: { flex: 1, paddingRight: 12 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { fontSize: 15, color: colors.secondary, fontWeight: "500", flexShrink: 1 },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 10, fontWeight: "700", color: colors.neutral },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  date: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: "600" },
});
