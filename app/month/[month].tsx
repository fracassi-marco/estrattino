import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { AddTransactionModal } from "../../components/AddTransactionModal";
import { MonthBand } from "../../components/MonthBand";
import { TransactionRow } from "../../components/TransactionRow";
import { useTransactions } from "../../context/TransactionsContext";
import { monthLabel } from "../../lib/months";
import { colors } from "../../lib/theme";

type Filter = "all" | "income" | "expense" | "manual";
type Sort = "date" | "amount-desc" | "amount-asc";

function defaultDateForMonth(month: string | undefined): string {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  if (!month || month === currentMonth) {
    return `${currentMonth}-${String(now.getDate()).padStart(2, "0")}`;
  }
  return `${month}-01`;
}

export default function MonthDetailScreen() {
  const { month } = useLocalSearchParams<{ month: string }>();
  const router = useRouter();
  const { transactions, addManualTransaction, deleteTransaction } = useTransactions();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("date");
  const [showAddModal, setShowAddModal] = useState(false);

  const monthTransactions = useMemo(
    () => transactions.filter((t) => t.date.slice(0, 7) === month),
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
    const byFilter =
      filter === "income"
        ? monthTransactions.filter((t) => t.amount >= 0)
        : filter === "expense"
          ? monthTransactions.filter((t) => t.amount < 0)
          : filter === "manual"
            ? monthTransactions.filter((t) => t.source === "manual")
            : monthTransactions;

    const sorted = [...byFilter];
    if (sort === "amount-desc") {
      sorted.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    } else if (sort === "amount-asc") {
      sorted.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
    } else {
      sorted.sort((a, b) => b.date.localeCompare(a.date));
    }
    return sorted;
  }, [monthTransactions, filter, sort]);

  const cycleSort = () => {
    setSort((current) =>
      current === "date" ? "amount-desc" : current === "amount-desc" ? "amount-asc" : "date"
    );
  };

  const sortLabel =
    sort === "amount-desc" ? "Importo ↓" : sort === "amount-asc" ? "Importo ↑" : "Data";

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
        <FilterChip
          label="Manuali"
          active={filter === "manual"}
          onPress={() => setFilter("manual")}
        />
        <View style={{ flex: 1 }} />
        <Pressable style={styles.sortButton} onPress={cycleSort} hitSlop={8}>
          <Text style={styles.sortButtonText}>{sortLabel}</Text>
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <TransactionRow transaction={item} onDelete={deleteTransaction} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nessun movimento per questo filtro.</Text>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <Pressable style={styles.fab} onPress={() => setShowAddModal(true)} hitSlop={8}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      <AddTransactionModal
        visible={showAddModal}
        defaultDate={defaultDateForMonth(month)}
        onClose={() => setShowAddModal(false)}
        onSubmit={async (input) => {
          await addManualTransaction(input);
          setShowAddModal(false);
        }}
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
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortButtonText: { fontSize: 13, color: colors.secondary, fontWeight: "500" },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 40 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabIcon: { color: colors.neutral, fontSize: 28, fontWeight: "600", marginTop: -2 },
});
