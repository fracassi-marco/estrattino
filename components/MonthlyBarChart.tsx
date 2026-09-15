import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { monthLabelShort } from "../lib/months";
import { MonthSummary } from "../lib/types";

const CHART_HEIGHT = 140;
const BAR_WIDTH = 10;
const COLUMN_WIDTH = 40;

const INCOME_COLOR = "#2E7D32";
const EXPENSE_COLOR = "#C62828";

interface Props {
  /** Chronologically ascending, already limited to the months to display. */
  months: MonthSummary[];
  onSelectMonth: (key: string) => void;
}

export function MonthlyBarChart({ months, onSelectMonth }: Props) {
  const maxValue = Math.max(1, ...months.flatMap((m) => [m.income, m.expense]));

  return (
    <View style={styles.container}>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: INCOME_COLOR }]} />
          <Text style={styles.legendText}>Entrate</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: EXPENSE_COLOR }]} />
          <Text style={styles.legendText}>Uscite</Text>
        </View>
      </View>
      <View style={styles.chartRow}>
        {months.map((m) => {
          const incomeHeight = Math.max(2, (m.income / maxValue) * CHART_HEIGHT);
          const expenseHeight = Math.max(2, (m.expense / maxValue) * CHART_HEIGHT);
          return (
            <Pressable
              key={m.key}
              style={styles.column}
              onPress={() => onSelectMonth(m.key)}
              hitSlop={4}
            >
              <View style={styles.barsWrap}>
                <View
                  style={[styles.bar, { height: incomeHeight, backgroundColor: INCOME_COLOR }]}
                />
                <View
                  style={[styles.bar, { height: expenseHeight, backgroundColor: EXPENSE_COLOR }]}
                />
              </View>
              <Text style={styles.monthLabel} numberOfLines={1}>
                {monthLabelShort(m.key)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 12, paddingTop: 8, backgroundColor: "#fff" },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 8,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: "#555" },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-evenly",
    height: CHART_HEIGHT + 28,
  },
  column: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: COLUMN_WIDTH,
    height: CHART_HEIGHT + 28,
  },
  barsWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: CHART_HEIGHT,
    gap: 3,
  },
  bar: { width: BAR_WIDTH, borderRadius: 3 },
  monthLabel: { fontSize: 10, color: "#666", marginTop: 4 },
});
