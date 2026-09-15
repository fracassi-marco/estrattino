import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "../lib/format";
import { MonthSummary } from "../lib/types";

interface Props {
  summary: MonthSummary;
  onPress: () => void;
}

export function MonthCard({ summary, onPress }: Props) {
  const diffColor = summary.diff >= 0 ? "#2E7D32" : "#C62828";
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{summary.label}</Text>
        <Text style={[styles.diff, { color: diffColor }]}>
          {formatCurrency(summary.diff)}
        </Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.income}>Entrate {formatCurrency(summary.income)}</Text>
        <Text style={styles.expense}>Uscite {formatCurrency(summary.expense)}</Text>
      </View>
      <Text style={styles.count}>{summary.count} movimenti</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "600", color: "#222" },
  diff: { fontSize: 16, fontWeight: "700" },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  income: { fontSize: 13, color: "#2E7D32" },
  expense: { fontSize: 13, color: "#C62828" },
  count: { fontSize: 11, color: "#999", marginTop: 4 },
});
