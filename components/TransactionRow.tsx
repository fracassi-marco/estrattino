import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatCurrency, formatDate } from "../lib/format";
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
      <Text style={[styles.amount, { color: isExpense ? "#C62828" : "#2E7D32" }]}>
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
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  left: { flex: 1, paddingRight: 12 },
  title: { fontSize: 15, color: "#222", fontWeight: "500" },
  subtitle: { fontSize: 12, color: "#777", marginTop: 1 },
  date: { fontSize: 11, color: "#aaa", marginTop: 2 },
  amount: { fontSize: 15, fontWeight: "600" },
});
