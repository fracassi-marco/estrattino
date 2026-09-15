import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { MonthBand } from "../../components/MonthBand";
import { TransactionRow } from "../../components/TransactionRow";
import { useTransactions } from "../../context/TransactionsContext";
import { monthLabel } from "../../lib/months";
import { colors } from "../../lib/theme";

type Filter = "all" | "income" | "expense";

export default function MonthDetailScreen() {
  const { month } = useLocalSearchParams<{ month: string }>();
  const router = useRouter();
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <MonthBand
        label={month ? monthLabel(month) : "Dettaglio mese"}
        income={income}
        expense={expense}
        diff={diff}
        onBack={() => router.back()}
      />

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
  container: { flex: 1, backgroundColor: colors.neutral },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.border,
  },
  chipActive: { backgroundColor: colors.secondary },
  chipText: { fontSize: 13, color: colors.secondary, fontWeight: "500" },
  chipTextActive: { color: colors.neutral },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 40 },
});
