import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useLayoutEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { TransactionRow } from "../../components/TransactionRow";
import { useTransactions } from "../../context/TransactionsContext";
import { formatCurrency } from "../../lib/format";
import { monthLabel } from "../../lib/months";

type Filter = "all" | "income" | "expense";

export default function MonthDetailScreen() {
  const { month } = useLocalSearchParams<{ month: string }>();
  const navigation = useNavigation();
  const { transactions } = useTransactions();
  const [filter, setFilter] = useState<Filter>("all");

  const monthTransactions = useMemo(
    () =>
      transactions
        .filter((t) => t.date.slice(0, 7) === month)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, month]
  );

  const income = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.amount >= 0)
        .reduce((sum, t) => sum + t.amount, 0),
    [monthTransactions]
  );
  const expense = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [monthTransactions]
  );
  const diff = income - expense;

  const filtered = useMemo(() => {
    if (filter === "income") return monthTransactions.filter((t) => t.amount >= 0);
    if (filter === "expense") return monthTransactions.filter((t) => t.amount < 0);
    return monthTransactions;
  }, [monthTransactions, filter]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: month ? monthLabel(month) : "Dettaglio mese",
    });
  }, [navigation, month]);

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <SummaryItem label="Entrate" value={income} color="#2E7D32" />
          <SummaryItem label="Uscite" value={expense} color="#C62828" />
          <SummaryItem
            label="Differenza"
            value={diff}
            color={diff >= 0 ? "#2E7D32" : "#C62828"}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        <FilterChip label="Tutti" active={filter === "all"} onPress={() => setFilter("all")} />
        <FilterChip
          label="Entrate"
          active={filter === "income"}
          onPress={() => setFilter("income")}
        />
        <FilterChip
          label="Uscite"
          active={filter === "expense"}
          onPress={() => setFilter("expense")}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => <TransactionRow transaction={item} />}
        ListEmptyComponent={
          <Text style={styles.empty}>Nessun movimento per questo filtro.</Text>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

function SummaryItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{formatCurrency(value)}</Text>
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f8" },
  summaryCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryItem: { alignItems: "center", flex: 1 },
  summaryLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  summaryValue: { fontSize: 15, fontWeight: "700" },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#eceff3",
  },
  chipActive: { backgroundColor: "#0057B8" },
  chipText: { fontSize: 13, color: "#555", fontWeight: "500" },
  chipTextActive: { color: "#fff" },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
});
