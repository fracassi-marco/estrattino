import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "../lib/format";

interface Props {
  income: number;
  expense: number;
  diff: number;
}

export function YearSummary({ income, expense, diff }: Props) {
  const diffColor = diff >= 0 ? "#2E7D32" : "#C62828";
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Ultimo anno</Text>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.label}>Entrate</Text>
          <Text style={[styles.value, { color: "#2E7D32" }]}>
            {formatCurrency(income)}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Uscite</Text>
          <Text style={[styles.value, { color: "#C62828" }]}>
            {formatCurrency(expense)}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Diff</Text>
          <Text style={[styles.value, { color: diffColor }]}>
            {formatCurrency(diff)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontSize: 13, fontWeight: "600", color: "#777", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  item: { alignItems: "center", flex: 1 },
  label: { fontSize: 12, color: "#999", marginBottom: 2 },
  value: { fontSize: 15, fontWeight: "700" },
});
