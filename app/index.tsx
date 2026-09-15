import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MonthCard } from "../components/MonthCard";
import { MonthlyBarChart } from "../components/MonthlyBarChart";
import { YearSummary } from "../components/YearSummary";
import { useTransactions } from "../context/TransactionsContext";
import { summarizeByMonth } from "../lib/months";
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
    return lastYear.reduce(
      (acc, m) => ({
        income: acc.income + m.income,
        expense: acc.expense + m.expense,
        diff: acc.diff + m.diff,
      }),
      { income: 0, expense: 0, diff: 0 }
    );
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
      <FlatList
        data={allMonths}
        keyExtractor={(m) => m.key}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Le mie spese</Text>
                <Text style={styles.subtitle}>Conto BBVA</Text>
              </View>
              <Pressable
                style={styles.importButton}
                onPress={handleImport}
                disabled={importing}
              >
                {importing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.importButtonText}>Importa</Text>
                )}
              </Pressable>
            </View>

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
                <YearSummary
                  income={yearSummary.income}
                  expense={yearSummary.expense}
                  diff={yearSummary.diff}
                />
                <MonthlyBarChart months={chartMonths} onSelectMonth={goToMonth} />
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
  container: { flex: 1, backgroundColor: "#f5f6f8" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#1a1a1a" },
  subtitle: { fontSize: 13, color: "#777" },
  importButton: {
    backgroundColor: "#0057B8",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 92,
    alignItems: "center",
  },
  importButtonText: { color: "#fff", fontWeight: "600" },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    marginTop: 18,
    marginBottom: 4,
    marginHorizontal: 16,
  },
  emptyState: { padding: 24, alignItems: "center" },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  emptyText: { fontSize: 13, color: "#777", textAlign: "center" },
});
