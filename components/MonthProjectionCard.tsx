import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "../lib/format";
import { AverageCrossoverDay, MonthExpenseProjection } from "../lib/projection";
import { colors } from "../lib/theme";

interface Props {
  projection: MonthExpenseProjection;
  crossover: AverageCrossoverDay | null;
  avgExpense: number;
}

export function MonthProjectionCard({ projection, crossover, avgExpense }: Props) {
  const overBudget = projection.projectedExpense > avgExpense;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Mese in corso</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Proiezione spesa a fine mese</Text>
        <Text style={[styles.value, overBudget && styles.valueWarning]}>
          {formatCurrency(projection.projectedExpense)}
        </Text>
      </View>
      <Text style={styles.hint}>
        Basata su {formatCurrency(projection.expenseSoFar)} spesi in{" "}
        {projection.daysElapsed} giorni (media ultimo anno: {formatCurrency(avgExpense)})
      </Text>

      <View style={[styles.row, { marginTop: 12 }]}>
        <Text style={styles.label}>Sorpasso media ultimo anno</Text>
        {crossover ? (
          <Text style={[styles.value, crossover.surpassed && styles.valueWarning]}>
            Giorno {crossover.day}
          </Text>
        ) : (
          <Text style={styles.value}>—</Text>
        )}
      </View>
      <Text style={styles.hint}>
        {crossover
          ? crossover.surpassed
            ? "Media già superata questo mese"
            : "Data prevista di superamento, al ritmo attuale"
          : "Al ritmo attuale non verrà superata questo mese"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: 14, color: colors.secondary, flexShrink: 1, paddingRight: 8 },
  value: { fontSize: 16, fontWeight: "700", color: colors.secondary },
  valueWarning: { color: colors.expense },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
