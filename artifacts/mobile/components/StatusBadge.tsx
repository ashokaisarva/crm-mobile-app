import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface StatusBadgeProps {
  status: string;
  size?: "small" | "medium";
}

export function StatusBadge({ status, size = "medium" }: StatusBadgeProps) {
  const colors = useColors();

  const getColors = () => {
    const s = status?.toLowerCase() ?? "";
    if (s === "new") return { bg: colors.statusNew, text: colors.statusNewText };
    if (s === "contacted") return { bg: colors.statusContacted, text: colors.statusContactedText };
    if (s === "qualified") return { bg: colors.statusQualified, text: colors.statusQualifiedText };
    if (s === "lost") return { bg: colors.statusLost, text: colors.statusLostText };
    if (s === "won") return { bg: colors.statusWon, text: colors.statusWonText };
    if (s === "proposal") return { bg: colors.statusProposal, text: colors.statusProposalText };
    if (s === "pre qualified") return { bg: "#eff6ff", text: "#1d4ed8" };
    if (s === "attempted to contact") return { bg: "#fef9c3", text: "#854d0e" };
    return { bg: colors.muted, text: colors.mutedForeground };
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, size === "small" && styles.badgeSmall]}>
      <Text style={[styles.text, { color: text }, size === "small" && styles.textSmall]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  textSmall: {
    fontSize: 10,
  },
});
