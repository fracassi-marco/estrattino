import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "../lib/format";
import { colors } from "../lib/theme";
import { MonthSummary } from "../lib/types";

interface Props {
  summary: MonthSummary;
  onPress: () => void;
}

export function MonthCard({ summary, onPress }: Props) {
  const diffColor = summary.diff >= 0 ? colors.primaryDark : colors.expense;
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
    backgroundColor: colors.neutral,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.secondary },
  diff: { fontSize: 16, fontWeight: "700" },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  income: { fontSize: 13, color: colors.primaryDark },
  expense: { fontSize: 13, color: colors.expense },
  count: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
});
