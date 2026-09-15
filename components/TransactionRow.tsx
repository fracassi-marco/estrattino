import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatCurrency, formatDate } from "../lib/format";
import { colors } from "../lib/theme";
import { Transaction } from "../lib/types";

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isExpense = transaction.amount < 0;
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.description}
        </Text>
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
    </View>
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
  left: { flex: 1, paddingRight: 12 },
  title: { fontSize: 15, color: colors.secondary, fontWeight: "500" },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  date: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: "600" },
});
