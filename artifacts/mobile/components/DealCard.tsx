import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { Deal } from "@/data/sampleData";

interface DealCardProps {
  deal: Deal;
  onPress?: () => void;
}

export function DealCard({ deal, onPress }: DealCardProps) {
  const colors = useColors();

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatValue = (val: number) => "$" + val.toLocaleString();

  const isUrgent = () => {
    const close = new Date(deal.closeDate);
    const now = new Date();
    const diff = (close.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7 && diff >= 0;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: isUrgent() ? colors.primary : colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {isUrgent() && (
        <View style={[styles.urgentTag, { backgroundColor: colors.primary }]}>
          <Text style={styles.urgentText}>Closing soon</Text>
        </View>
      )}
      <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
        {deal.name}
      </Text>
      <Text style={[styles.company, { color: colors.mutedForeground }]} numberOfLines={1}>
        {deal.company}
      </Text>
      <View style={styles.footer}>
        <Text style={[styles.value, { color: colors.primary }]}>{formatValue(deal.value)}</Text>
        <View style={styles.dateRow}>
          <Icon name="calendar" size={11} color={colors.mutedForeground} />
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(deal.closeDate)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginRight: 10,
  },
  urgentTag: {
    position: "absolute",
    top: 0,
    right: 0,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  urgentText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Poppins_600SemiBold",
  },
  name: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 4,
    marginTop: 4,
  },
  company: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    marginBottom: 12,
  },
  footer: {
    gap: 4,
  },
  value: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  date: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
});
