import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@/components/Icon";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Deal } from "@/data/sampleData";

type Stage = Deal["stage"];
const STAGES: Stage[] = ["New", "Qualified", "Proposal", "Won", "Lost"];

const STAGE_COLORS: Record<Stage, string> = {
  New: "#2563eb",
  Qualified: "#f59e0b",
  Proposal: "#8b5cf6",
  Won: "#22c55e",
  Lost: "#ef4444",
};

const STAGE_ICONS: Record<Stage, string> = {
  New: "inbox",
  Qualified: "star",
  Proposal: "file-text",
  Won: "check-circle",
  Lost: "x-circle",
};

export default function DealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { deals, leads, updateDeal, deleteDeal } = useApp();

  const deal = deals.find(d => d.id === id);

  if (!deal) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Icon name="alert-circle" size={32} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>Deal not found</Text>
      </View>
    );
  }

  const lead = leads.find(l => l.id === deal.leadId);
  const stageColor = STAGE_COLORS[deal.stage];
  const stageIdx = STAGES.indexOf(deal.stage);

  const handleStageChange = (stage: Stage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateDeal(deal.id, { stage });
  };

  const handleDelete = () => {
    Alert.alert("Delete Deal", "Are you sure you want to delete this deal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteDeal(deal!.id);
          router.back();
        },
      },
    ]);
  };

  const moveToPrev = () => {
    if (stageIdx > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      updateDeal(deal.id, { stage: STAGES[stageIdx - 1] });
    }
  };

  const moveToNext = () => {
    if (stageIdx < STAGES.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      updateDeal(deal.id, { stage: STAGES[stageIdx + 1] });
    }
  };

  const topInsets = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  const daysUntilClose = () => {
    const close = new Date(deal.closeDate);
    const now = new Date();
    return Math.ceil((close.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const days = daysUntilClose();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInsets + 12, backgroundColor: stageColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Deal Details</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 20 }}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: stageColor }]}>
          <View style={[styles.heroIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Icon name={STAGE_ICONS[deal.stage] as any} size={28} color="#fff" />
          </View>
          <Text style={styles.heroName}>{deal.name}</Text>
          <Text style={styles.heroCompany}>{deal.company}</Text>
          <Text style={styles.heroValue}>${deal.value.toLocaleString()}</Text>
          <View style={[styles.stagePill, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
            <Text style={styles.stagePillText}>{deal.stage}</Text>
          </View>
        </View>

        {/* Stage Progress */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16, marginTop: 16 }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Pipeline Stage</Text>
          <View style={styles.stagesRow}>
            {STAGES.map((s, i) => {
              const isActive = s === deal.stage;
              const isPast = STAGES.indexOf(s) < stageIdx;
              const sc = STAGE_COLORS[s];
              return (
                <TouchableOpacity
                  key={s}
                  style={styles.stageStep}
                  onPress={() => handleStageChange(s)}
                  activeOpacity={0.75}
                >
                  <View style={[
                    styles.stageCircle,
                    {
                      borderColor: isActive ? sc : isPast ? sc : colors.border,
                      backgroundColor: isActive ? sc : isPast ? sc + "30" : colors.muted,
                    }
                  ]}>
                    {isPast ? (
                      <Icon name="check" size={10} color={sc} />
                    ) : (
                      <Text style={[
                        styles.stageNum,
                        { color: isActive ? "#fff" : colors.mutedForeground }
                      ]}>{i + 1}</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.stageLbl,
                    {
                      color: isActive ? sc : isPast ? sc : colors.mutedForeground,
                      fontFamily: isActive ? "Poppins_700Bold" : "Poppins_400Regular",
                    }
                  ]} numberOfLines={1}>
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Prev/Next arrows */}
          <View style={[styles.stageNav, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.stageNavBtn, { opacity: stageIdx === 0 ? 0.3 : 1 }]}
              onPress={moveToPrev}
              disabled={stageIdx === 0}
            >
              <Icon name="chevron-left" size={16} color={colors.primary} />
              <Text style={[styles.stageNavTxt, { color: colors.primary }]}>
                {stageIdx > 0 ? STAGES[stageIdx - 1] : "—"}
              </Text>
            </TouchableOpacity>
            <View style={[styles.stageNavDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={[styles.stageNavBtn, { opacity: stageIdx === STAGES.length - 1 ? 0.3 : 1 }]}
              onPress={moveToNext}
              disabled={stageIdx === STAGES.length - 1}
            >
              <Text style={[styles.stageNavTxt, { color: colors.primary }]}>
                {stageIdx < STAGES.length - 1 ? STAGES[stageIdx + 1] : "—"}
              </Text>
              <Icon name="chevron-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Deal Info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16, marginTop: 12 }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Deal Info</Text>
          <InfoRow
            icon="dollar-sign"
            label="Value"
            value={`$${deal.value.toLocaleString()}`}
            valueColor={colors.primary}
            colors={colors}
          />
          <InfoRow
            icon="calendar"
            label="Close Date"
            value={new Date(deal.closeDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            colors={colors}
          />
          <InfoRow
            icon="clock"
            label="Days Remaining"
            value={days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? "Today!" : `${days} days`}
            valueColor={days <= 0 ? colors.destructive : days <= 7 ? colors.warning : colors.success}
            colors={colors}
          />
        </View>

        {/* Linked Lead */}
        {lead && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16, marginTop: 12 }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Contact</Text>
            <TouchableOpacity
              style={styles.leadRow}
              onPress={() => router.push(`/lead/${lead.id}` as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.leadAvatar, { backgroundColor: colors.accent }]}>
                <Text style={[styles.leadAvatarText, { color: colors.primary }]}>
                  {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </Text>
              </View>
              <View style={styles.leadInfo}>
                <Text style={[styles.leadName, { color: colors.foreground }]}>{lead.name}</Text>
                <Text style={[styles.leadCompany, { color: colors.mutedForeground }]}>{lead.company}</Text>
              </View>
              <Icon name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}

        {/* Delete */}
        <TouchableOpacity
          style={[styles.deleteBtn, { borderColor: colors.destructive, marginHorizontal: 16, marginTop: 12 }]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Icon name="trash-2" size={16} color={colors.destructive} />
          <Text style={[styles.deleteTxt, { color: colors.destructive }]}>Delete Deal</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, valueColor, colors }: any) {
  return (
    <View style={[styles.infoRow, { borderTopColor: colors.border }]}>
      <Icon name={icon} size={15} color={colors.primary} />
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: valueColor || colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: "Poppins_400Regular" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { flex: 1, color: "#fff", fontSize: 18, fontFamily: "Poppins_700Bold" },
  hero: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    gap: 6,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroName: { color: "#fff", fontSize: 20, fontFamily: "Poppins_700Bold", textAlign: "center" },
  heroCompany: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Poppins_400Regular" },
  heroValue: { color: "#fff", fontSize: 32, fontFamily: "Poppins_700Bold", marginTop: 4 },
  stagePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  stagePillText: { color: "#fff", fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  card: { borderRadius: 14, borderWidth: 1, padding: 16 },
  cardTitle: { fontSize: 15, fontFamily: "Poppins_700Bold", marginBottom: 14 },
  stagesRow: { flexDirection: "row", justifyContent: "space-between" },
  stageStep: { flex: 1, alignItems: "center", gap: 6 },
  stageCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  stageNum: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  stageLbl: { fontSize: 9, textAlign: "center" },
  stageNav: {
    flexDirection: "row",
    marginTop: 14,
    borderTopWidth: 1,
    paddingTop: 14,
  },
  stageNavBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  stageNavDivider: { width: 1, height: "100%" },
  stageNavTxt: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  infoLabel: { flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular" },
  infoValue: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  leadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  leadAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  leadAvatarText: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  leadInfo: { flex: 1 },
  leadName: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  leadCompany: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 14,
  },
  deleteTxt: { fontSize: 15, fontFamily: "Poppins_600SemiBold" },
});
