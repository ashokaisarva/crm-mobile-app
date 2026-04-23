import React, { useState } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/StatusBadge";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { getSelectedLead } from "@/stores/leadStore";

const LABEL_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: "#fee2e2", text: "#dc2626" },
  normal: { bg: "#dbeafe", text: "#1d4ed8" },
  low: { bg: "#fef9c3", text: "#854d0e" },
};

export default function LeadDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const lead = getSelectedLead();
  const [expanded, setExpanded] = useState(false);

  const topInsets = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  if (!lead) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Icon name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>Lead not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backLink, { backgroundColor: colors.primary }]}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    } catch { return date; }
  };

  const formatAmount = (val: number | null | undefined) =>
    val != null ? "₹" + val.toLocaleString("en-IN") : "—";

  const initials = (lead.person_name || lead.title || "?")
    .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const labelStyle = LABEL_COLORS[lead.label ?? "normal"] ?? LABEL_COLORS.normal;

  const handleCall = () => {
    if (!lead.phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${lead.phone}`);
  };

  const handleWhatsApp = () => {
    if (!lead.phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const cleaned = lead.phone.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/${cleaned}`);
  };

  const handleEmail = () => {
    if (!lead.email) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`mailto:${lead.email}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInsets + 12, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Lead Details</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 80 }}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
          <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.leadTitle}>{lead.title}</Text>
          <Text style={styles.personName}>{lead.person_name}</Text>
          {lead.company ? <Text style={styles.company}>{lead.company}</Text> : null}
          <View style={styles.badgeRow}>
            <StatusBadge status={lead.status} />
            <View style={[styles.labelBadge, { backgroundColor: labelStyle.bg }]}>
              <Text style={[styles.labelText, { color: labelStyle.text }]}>
                {lead.label ? lead.label.charAt(0).toUpperCase() + lead.label.slice(1) : "Normal"} Priority
              </Text>
            </View>
          </View>
          <Text style={styles.amount}>{formatAmount(lead.amount)}</Text>
        </View>

        {/* Contact Info */}
        <View style={[styles.section, { marginHorizontal: 16, marginTop: 16, backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Contact Info</Text>
          {lead.phone ? (
            <InfoRow icon="phone" value={lead.phone} colors={colors} onPress={handleCall} />
          ) : null}
          {lead.email ? (
            <InfoRow icon="mail" value={lead.email} colors={colors} onPress={handleEmail} />
          ) : null}
          {lead.person_name ? (
            <InfoRow icon="user" value={`Contact: ${lead.person_name}`} colors={colors} />
          ) : null}
          {lead.company ? (
            <InfoRow icon="briefcase" value={lead.company} colors={colors} />
          ) : null}
        </View>

        {/* Lead Info */}
        <View style={[styles.section, { marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Lead Info</Text>
          <InfoRow icon="trending-up" value={`Value: ${formatAmount(lead.amount)}`} colors={colors} />
          <InfoRow icon="clock" value={`Created: ${formatDate(lead.created_at)}`} colors={colors} />
          {lead.lead_source ? (
            <InfoRow icon="zap" value={`Source: ${lead.lead_source}`} colors={colors} />
          ) : null}
          {lead.owner ? (
            <InfoRow icon="user" value={`Owner: ${lead.owner}`} colors={colors} />
          ) : null}
          {lead.assigned_name ? (
            <InfoRow icon="user-plus" value={`Assigned: ${lead.assigned_name}`} colors={colors} />
          ) : null}
          {lead.expected_close ? (
            <InfoRow icon="calendar" value={`Expected close: ${formatDate(lead.expected_close)}`} colors={colors} />
          ) : null}
        </View>

        {/* Description */}
        {lead.description ? (
          <View style={[styles.section, { marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Description</Text>
            <Text
              style={[styles.description, { color: colors.foreground }]}
              numberOfLines={expanded ? undefined : 4}
            >
              {lead.description}
            </Text>
            {lead.description.length > 200 && (
              <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.expandBtn}>
                <Text style={[styles.expandText, { color: colors.primary }]}>
                  {expanded ? "Show less" : "Show more"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky Action Bar */}
      <View style={[styles.actionBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
        <ActionButton icon="phone" label="Call" color={colors.primary} onPress={handleCall} disabled={!lead.phone} />
        <ActionButton icon="message-circle" label="WhatsApp" color="#22c55e" onPress={handleWhatsApp} disabled={!lead.phone} />
        <ActionButton icon="mail" label="Email" color="#8b5cf6" onPress={handleEmail} disabled={!lead.email} />
      </View>
    </View>
  );
}

function InfoRow({
  icon, value, colors, onPress,
}: { icon: string; value: string; colors: any; onPress?: () => void }) {
  const content = (
    <View style={[styles.infoRow, { borderTopColor: colors.border }]}>
      <Icon name={icon} size={16} color={colors.primary} />
      <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
      {onPress && <Icon name="chevron-right" size={14} color={colors.mutedForeground} />}
    </View>
  );
  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
  }
  return content;
}

function ActionButton({ icon, label, color, onPress, disabled }: {
  icon: string; label: string; color: string; onPress: () => void; disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, disabled && { opacity: 0.4 }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <Icon name={icon} size={20} color="#fff" />
      </View>
      <Text style={[styles.actionLabel, { color: "#64748b" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: "Poppins_400Regular" },
  backLink: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  backLinkText: { color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { flex: 1, color: "#fff", fontSize: 18, fontFamily: "Poppins_700Bold" },
  profileCard: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    gap: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  avatarText: { color: "#fff", fontSize: 26, fontFamily: "Poppins_700Bold" },
  leadTitle: { color: "#fff", fontSize: 20, fontFamily: "Poppins_700Bold", textAlign: "center" },
  personName: { color: "rgba(255,255,255,0.9)", fontSize: 15, fontFamily: "Poppins_500Medium" },
  company: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: "Poppins_400Regular" },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap", justifyContent: "center" },
  labelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  labelText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  amount: { color: "#fff", fontSize: 22, fontFamily: "Poppins_700Bold", marginTop: 6 },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  sectionTitle: { fontSize: 15, fontFamily: "Poppins_700Bold", marginBottom: 8 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  infoValue: { fontSize: 14, fontFamily: "Poppins_400Regular", flex: 1 },
  description: { fontSize: 14, fontFamily: "Poppins_400Regular", lineHeight: 22, color: "#374151" },
  expandBtn: { marginTop: 8 },
  expandText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  actionBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  actionBtn: { flex: 1, alignItems: "center", gap: 6 },
  actionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 12, fontFamily: "Poppins_500Medium" },
});
