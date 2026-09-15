import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { BalanceBand } from "../components/BalanceBand";
import { MonthCard } from "../components/MonthCard";
import { MonthlyBarChart } from "../components/MonthlyBarChart";
import { useTransactions } from "../context/TransactionsContext";
import { summarizeByMonth } from "../lib/months";
import { colors } from "../lib/theme";
import { MonthSummary } from "../lib/types";

const MAX_CHART_MONTHS = 10;
const YEAR_MONTHS = 12;

export default function HomeScreen() {
  const router = useRouter();
  const { transactions, loading, importFile } = useTransactions();
  const [importing, setImporting] = useState(false);

  const allMonths = useMemo(() => summarizeByMonth(transactions), [transactions]);
  const chartMonths = useMemo(
    () => [...allMonths.slice(0, MAX_CHART_MONTHS)].reverse(),
    [allMonths]
  );
  const yearSummary = useMemo(() => {
    const lastYear = allMonths.slice(0, YEAR_MONTHS);
    const totals = lastYear.reduce(
      (acc, m) => ({
        income: acc.income + m.income,
        expense: acc.expense + m.expense,
        diff: acc.diff + m.diff,
      }),
      { income: 0, expense: 0, diff: 0 }
    );
    const months = lastYear.length || 1;
    return {
      ...totals,
      avgIncome: totals.income / months,
      avgExpense: totals.expense / months,
      avgDiff: totals.diff / months,
    };
  }, [allMonths]);

  const goToMonth = (key: string) => router.push(`/month/${key}`);

  const handleImport = async () => {
    setImporting(true);
    try {
      const outcome = await importFile();
      if (!outcome) return;
      Alert.alert(
        "Importazione completata",
        `Nuovi movimenti: ${outcome.added}\nDuplicati ignorati: ${outcome.duplicates}`
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Errore sconosciuto";
      Alert.alert("Errore importazione", message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <BalanceBand
        income={yearSummary.income}
        expense={yearSummary.expense}
        diff={yearSummary.diff}
        avgIncome={yearSummary.avgIncome}
        avgExpense={yearSummary.avgExpense}
        avgDiff={yearSummary.avgDiff}
        importing={importing}
        onImport={handleImport}
      />
      <FlatList
        data={allMonths}
        keyExtractor={(m) => m.key}
        ListHeaderComponent={
          <View>
            {loading ? (
              <ActivityIndicator style={{ marginTop: 40 }} />
            ) : transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Nessun movimento importato</Text>
                <Text style={styles.emptyText}>
                  Importa l&apos;estratto conto BBVA (bbva.xlsx) per iniziare a
                  visualizzare le tue spese.
                </Text>
              </View>
            ) : (
              <>
                <MonthlyBarChart
                  months={chartMonths}
                  onSelectMonth={goToMonth}
                  avgIncome={yearSummary.avgIncome}
                  avgExpense={yearSummary.avgExpense}
                />
                <Text style={styles.sectionTitle}>Riepilogo mensile</Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }: { item: MonthSummary }) => (
          <MonthCard summary={item} onPress={() => goToMonth(item.key)} />
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 18,
    marginBottom: 4,
    marginHorizontal: 16,
  },
  emptyState: { padding: 24, alignItems: "center" },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: colors.secondary,
  },
  emptyText: { fontSize: 13, color: colors.textMuted, textAlign: "center" },
});
