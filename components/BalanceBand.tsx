import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "../lib/format";
import { colors } from "../lib/theme";

interface Props {
  income: number;
  expense: number;
  diff: number;
  importing: boolean;
  onImport: () => void;
}

export function BalanceBand({ income, expense, diff, importing, onImport }: Props) {
  const insets = useSafeAreaInsets();
  const diffLabel = `${diff >= 0 ? "+" : ""}${formatCurrency(diff)}`;

  return (
    <View style={[styles.band, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Conto BBVA</Text>
        </View>
        <Pressable style={styles.importButton} onPress={onImport} disabled={importing}>
          {importing ? (
            <ActivityIndicator color={colors.secondary} />
          ) : (
            <Text style={styles.importButtonText}>Importa</Text>
          )}
        </Pressable>
      </View>

      <Text style={styles.balanceLabel}>Differenza — ultimo anno</Text>
      <Text style={styles.balanceValue}>{diffLabel}</Text>

      <View style={styles.statsRow}>
        <View>
          <Text style={styles.statLabel}>Entrate</Text>
          <Text style={styles.statValue}>{formatCurrency(income)}</Text>
        </View>
        <View>
          <Text style={styles.statLabel}>Uscite</Text>
          <Text style={styles.statValue}>{formatCurrency(expense)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.neutral },
  importButton: {
    backgroundColor: colors.neutral,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 88,
    alignItems: "center",
  },
  importButtonText: { color: colors.secondary, fontWeight: "700", fontSize: 13 },
  balanceLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.secondaryMuted,
    marginBottom: 4,
  },
  balanceValue: { fontSize: 30, fontWeight: "700", color: colors.primary, marginBottom: 14 },
  statsRow: { flexDirection: "row", gap: 24 },
  statLabel: { fontSize: 11, color: colors.secondaryMuted, marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: "700", color: colors.neutral },
});
