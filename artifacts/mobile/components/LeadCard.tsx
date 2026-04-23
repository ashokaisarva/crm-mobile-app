import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/StatusBadge";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { LeadItem } from "@/services/api";
import { setSelectedLead } from "@/stores/leadStore";

interface LeadCardProps {
  lead: LeadItem;
}

const LABEL_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: "#fee2e2", text: "#dc2626" },
  normal: { bg: "#dbeafe", text: "#1d4ed8" },
  low: { bg: "#fef9c3", text: "#854d0e" },
};

export function LeadCard({ lead }: LeadCardProps) {
  const colors = useColors();

  const formatDate = (date: string) => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return date;
    }
  };

  const formatAmount = (val: number | null | undefined) =>
    val != null ? "₹" + val.toLocaleString("en-IN") : "—";

  const initials = (lead.person_name || lead.title || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const labelStyle = LABEL_COLORS[lead.label ?? "normal"] ?? LABEL_COLORS.normal;

  const handleCall = () => {
    if (lead.phone) Linking.openURL(`tel:${lead.phone}`);
  };

  const handleEmail = () => {
    if (lead.email) Linking.openURL(`mailto:${lead.email}`);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => { setSelectedLead(lead); router.push(`/lead/${lead.id}` as any); }}
      activeOpacity={0.75}
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
        </View>

        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {lead.title}
          </Text>
          <Text style={[styles.person, { color: colors.mutedForeground }]} numberOfLines={1}>
            {lead.person_name}
            {lead.company ? ` · ${lead.company}` : ""}
          </Text>
        </View>

        <View style={styles.right}>
          <Text style={[styles.amount, { color: colors.primary }]}>{formatAmount(lead.amount)}</Text>
          <View style={[styles.labelBadge, { backgroundColor: labelStyle.bg }]}>
            <Text style={[styles.labelText, { color: labelStyle.text }]}>
              {lead.label ? lead.label.charAt(0).toUpperCase() + lead.label.slice(1) : "Normal"}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.meta, { borderTopColor: colors.border }]}>
        <StatusBadge status={lead.status} size="small" />
        {lead.lead_source ? (
          <View style={styles.sourceRow}>
            <Icon name="zap" size={11} color={colors.mutedForeground} />
            <Text style={[styles.sourceText, { color: colors.mutedForeground }]}>{lead.lead_source}</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.footerLeft}>
          <Icon name="clock" size={12} color={colors.mutedForeground} />
          <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
            {formatDate(lead.created_at)}
          </Text>
          {lead.owner ? (
            <>
              <Text style={[styles.dot, { color: colors.mutedForeground }]}>·</Text>
              <Icon name="user" size={12} color={colors.mutedForeground} />
              <Text style={[styles.dateText, { color: colors.mutedForeground }]}>{lead.owner}</Text>
            </>
          ) : null}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.accent }]}
            onPress={handleCall}
            disabled={!lead.phone}
          >
            <Icon name="phone" size={14} color={lead.phone ? colors.primary : colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#dcfce7" }]}
            onPress={() => lead.phone && Linking.openURL(`https://wa.me/${lead.phone.replace(/\D/g, "")}`)}
            disabled={!lead.phone}
          >
            <Icon name="message-circle" size={14} color={lead.phone ? "#15803d" : colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
            onPress={handleEmail}
            disabled={!lead.email}
          >
            <Icon name="mail" size={14} color={lead.email ? colors.primary : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 2,
  },
  person: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  right: {
    alignItems: "flex-end",
    gap: 5,
    flexShrink: 0,
  },
  amount: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
  },
  labelBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  labelText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sourceText: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  dot: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
