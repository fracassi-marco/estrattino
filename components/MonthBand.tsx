import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "../lib/format";
import { colors } from "../lib/theme";

interface Props {
  label: string;
  income: number;
  expense: number;
  diff: number;
  onBack: () => void;
}

export function MonthBand({ label, income, expense, diff, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const diffColor = diff >= 0 ? colors.primary : colors.expense;

  return (
    <View style={[styles.band, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={onBack} hitSlop={8}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.title}>{label}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Entrate</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {formatCurrency(income)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Uscite</Text>
          <Text style={[styles.statValue, { color: colors.expense }]}>
            {formatCurrency(expense)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Differenza</Text>
          <Text style={[styles.statValue, { color: diffColor }]}>{formatCurrency(diff)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  backButton: {
    marginRight: 6,
    marginLeft: -8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  backArrow: { fontSize: 26, color: colors.neutral, fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "700", color: colors.neutral },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statItem: { alignItems: "center", flex: 1 },
  statLabel: { fontSize: 11, color: colors.secondaryMuted, marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: "700" },
});
