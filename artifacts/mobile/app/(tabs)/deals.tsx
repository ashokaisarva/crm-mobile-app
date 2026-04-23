import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@/components/Icon";
import { router } from "expo-router";
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

const STAGE_ICONS: Record<Stage, any> = {
  New: "inbox",
  Qualified: "star",
  Proposal: "file-text",
  Won: "check-circle",
  Lost: "x-circle",
};

interface StageBounds {
  y: number;
  height: number;
}

export default function DealsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { deals, updateDeal } = useApp();

  const [dragDealId, setDragDealId] = useState<string | null>(null);
  const [dragDeal, setDragDeal] = useState<Deal | null>(null);
  const [hoveredStage, setHoveredStage] = useState<Stage | null>(null);

  const dragPos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const dragOpacity = useRef(new Animated.Value(0)).current;
  const dragScale = useRef(new Animated.Value(1)).current;
  const stageBounds = useRef<Record<Stage, StageBounds>>({} as any);
  const scrollOffsetY = useRef(0);
  const scrollRef = useRef<ScrollView>(null);
  const containerRef = useRef<View>(null);
  const containerTopY = useRef(0);

  const byStage = useMemo(() => {
    const map: Record<Stage, Deal[]> = { New: [], Qualified: [], Proposal: [], Won: [], Lost: [] };
    deals.forEach(d => {
      if (map[d.stage]) map[d.stage].push(d);
    });
    return map;
  }, [deals]);

  const totalPipelineValue = deals
    .filter(d => d.stage !== "Lost")
    .reduce((s, d) => s + d.value, 0);
  const wonValue = deals
    .filter(d => d.stage === "Won")
    .reduce((s, d) => s + d.value, 0);

  const topInsets = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const headerHeight = topInsets + 16 + 50;
  const bottomPad = Platform.OS === "web" ? 34 + 64 : insets.bottom + 80;

  const getStageAtY = useCallback((screenY: number): Stage | null => {
    const scrolledY = screenY - containerTopY.current + scrollOffsetY.current;
    for (const stage of STAGES) {
      const bounds = stageBounds.current[stage];
      if (bounds && scrolledY >= bounds.y && scrolledY <= bounds.y + bounds.height) {
        return stage;
      }
    }
    return null;
  }, []);

  const startDrag = useCallback((deal: Deal, touchY: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setDragDealId(deal.id);
    setDragDeal(deal);
    dragPos.setValue({ x: 16, y: touchY - containerTopY.current - 30 });
    Animated.parallel([
      Animated.spring(dragOpacity, { toValue: 1, useNativeDriver: true }),
      Animated.spring(dragScale, { toValue: 1.04, useNativeDriver: true }),
    ]).start();
  }, [dragPos, dragOpacity, dragScale]);

  const endDrag = useCallback((targetStage: Stage | null) => {
    Animated.parallel([
      Animated.spring(dragOpacity, { toValue: 0, useNativeDriver: true }),
      Animated.spring(dragScale, { toValue: 1, useNativeDriver: true }),
    ]).start(() => {
      if (dragDealId && targetStage && dragDeal?.stage !== targetStage) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        updateDeal(dragDealId, { stage: targetStage });
      }
      setDragDealId(null);
      setDragDeal(null);
      setHoveredStage(null);
    });
  }, [dragDealId, dragDeal, dragOpacity, dragScale, updateDeal]);

  const makePanResponder = useCallback((deal: Deal) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dy) > 8 || Math.abs(gs.dx) > 8,
      onPanResponderGrant: (evt) => {
        startDrag(deal, evt.nativeEvent.pageY);
      },
      onPanResponderMove: (evt, gs) => {
        const screenY = evt.nativeEvent.pageY;
        dragPos.setValue({
          x: 16,
          y: screenY - containerTopY.current - 30,
        });
        const stage = getStageAtY(screenY);
        setHoveredStage(stage);
      },
      onPanResponderRelease: (evt) => {
        const stage = getStageAtY(evt.nativeEvent.pageY);
        endDrag(stage);
      },
      onPanResponderTerminate: () => {
        endDrag(null);
      },
    });
  }, [startDrag, endDrag, getStageAtY, dragPos]);

  return (
    <View
      ref={containerRef}
      style={[styles.container, { backgroundColor: colors.background }]}
      onLayout={() => {
        containerRef.current?.measure((_x, _y, _w, _h, _px, py) => {
          containerTopY.current = py;
        });
      }}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInsets + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Pipeline</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/add-deal" as any)}
        >
          <Icon name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={e => { scrollOffsetY.current = e.nativeEvent.contentOffset.y; }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        scrollEnabled={!dragDealId}
      >
        {/* Summary */}
        <View style={styles.summaryRow}>
          <SummaryCard label="Pipeline" value={`$${totalPipelineValue.toLocaleString()}`} color={colors.primary} colors={colors} />
          <SummaryCard label="Won" value={`$${wonValue.toLocaleString()}`} color={colors.success} colors={colors} />
          <SummaryCard label="Total" value={`${deals.length} deals`} color={colors.foreground} colors={colors} />
        </View>

        {/* Drag tip */}
        {deals.length > 0 && (
          <View style={[styles.tip, { backgroundColor: colors.accent, marginHorizontal: 16, marginBottom: 12 }]}>
            <Icon name="move" size={13} color={colors.primary} />
            <Text style={[styles.tipText, { color: colors.primary }]}>Hold & drag a card to change its stage</Text>
          </View>
        )}

        {/* Stage Sections */}
        {STAGES.map(stage => {
          const stageDeals = byStage[stage];
          const stageColor = STAGE_COLORS[stage];
          const isHovered = hoveredStage === stage;
          const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);

          return (
            <View
              key={stage}
              style={styles.stageSection}
              onLayout={e => {
                const { y, height } = e.nativeEvent.layout;
                stageBounds.current[stage] = { y, height };
              }}
            >
              {/* Stage Header */}
              <View style={[
                styles.stageHeader,
                {
                  backgroundColor: isHovered ? stageColor + "18" : "transparent",
                  borderColor: isHovered ? stageColor : "transparent",
                }
              ]}>
                <View style={styles.stageTitleRow}>
                  <View style={[styles.stageIconBox, { backgroundColor: stageColor + "20" }]}>
                    <Icon name={STAGE_ICONS[stage]} size={14} color={stageColor} />
                  </View>
                  <Text style={[styles.stageName, { color: colors.foreground }]}>{stage}</Text>
                  <View style={[styles.stageCountPill, { backgroundColor: stageColor + "20" }]}>
                    <Text style={[styles.stageCountTxt, { color: stageColor }]}>{stageDeals.length}</Text>
                  </View>
                </View>
                <Text style={[styles.stageValue, { color: colors.mutedForeground }]}>
                  {stageDeals.length > 0 ? `$${stageValue.toLocaleString()}` : ""}
                </Text>
              </View>

              {/* Drop zone indicator */}
              {isHovered && dragDeal && dragDeal.stage !== stage && (
                <View style={[styles.dropZone, { borderColor: stageColor, backgroundColor: stageColor + "10" }]}>
                  <Icon name="arrow-down-circle" size={18} color={stageColor} />
                  <Text style={[styles.dropZoneText, { color: stageColor }]}>
                    Drop to move to {stage}
                  </Text>
                </View>
              )}

              {/* Deal cards */}
              <View style={styles.dealsContainer}>
                {stageDeals.length === 0 && !isHovered ? (
                  <View style={[styles.emptyZone, { borderColor: colors.border }]}>
                    <Text style={[styles.emptyTxt, { color: colors.mutedForeground }]}>No deals</Text>
                  </View>
                ) : (
                  stageDeals.map(deal => (
                    <DraggableDealCard
                      key={deal.id}
                      deal={deal}
                      colors={colors}
                      isDragging={dragDealId === deal.id}
                      makePanResponder={makePanResponder}
                      onPress={() => router.push(`/deal/${deal.id}` as any)}
                    />
                  ))
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Floating drag card */}
      {dragDeal && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.floatingCard,
            {
              backgroundColor: colors.card,
              borderColor: STAGE_COLORS[dragDeal.stage],
              shadowColor: STAGE_COLORS[dragDeal.stage],
              opacity: dragOpacity,
              transform: [
                { translateX: dragPos.x },
                { translateY: dragPos.y },
                { scale: dragScale },
              ],
            }
          ]}
        >
          <View style={styles.floatingCardInner}>
            <View style={[styles.floatingDragHandle, { backgroundColor: STAGE_COLORS[dragDeal.stage] + "30" }]}>
              <Icon name="move" size={14} color={STAGE_COLORS[dragDeal.stage]} />
            </View>
            <View style={styles.floatingInfo}>
              <Text style={[styles.floatingName, { color: colors.foreground }]} numberOfLines={1}>
                {dragDeal.name}
              </Text>
              <Text style={[styles.floatingCompany, { color: colors.mutedForeground }]} numberOfLines={1}>
                {dragDeal.company}
              </Text>
            </View>
            <Text style={[styles.floatingValue, { color: STAGE_COLORS[dragDeal.stage] }]}>
              ${dragDeal.value.toLocaleString()}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────

function SummaryCard({ label, value, color, colors }: any) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
    </View>
  );
}

interface DraggableDealCardProps {
  deal: Deal;
  colors: any;
  isDragging: boolean;
  makePanResponder: (deal: Deal) => any;
  onPress: () => void;
}

function DraggableDealCard({ deal, colors, isDragging, makePanResponder, onPress }: DraggableDealCardProps) {
  const panResponder = useMemo(() => makePanResponder(deal), [deal.id, deal.stage]);
  const stageColor = STAGE_COLORS[deal.stage];

  const isUrgent = (() => {
    const diff = (new Date(deal.closeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 7 && diff >= 0;
  })();

  return (
    <View
      style={[
        styles.dealCard,
        {
          backgroundColor: isDragging ? colors.muted : colors.card,
          borderColor: isUrgent ? stageColor : colors.border,
          opacity: isDragging ? 0.3 : 1,
        }
      ]}
    >
      {/* Drag handle */}
      <View
        {...panResponder.panHandlers}
        style={[styles.dragHandle, { backgroundColor: stageColor + "15" }]}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      >
        <Icon name="menu" size={16} color={stageColor} />
      </View>

      {/* Card content */}
      <TouchableOpacity
        style={styles.dealCardContent}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <View style={styles.dealCardTop}>
          <Text style={[styles.dealName, { color: colors.foreground }]} numberOfLines={1}>
            {deal.name}
          </Text>
          {isUrgent && (
            <View style={[styles.urgentBadge, { backgroundColor: stageColor + "20" }]}>
              <Text style={[styles.urgentTxt, { color: stageColor }]}>Soon</Text>
            </View>
          )}
        </View>
        <Text style={[styles.dealCompany, { color: colors.mutedForeground }]} numberOfLines={1}>
          {deal.company}
        </Text>
        <View style={styles.dealMeta}>
          <Text style={[styles.dealValue, { color: stageColor }]}>
            ${deal.value.toLocaleString()}
          </Text>
          <View style={styles.dealDate}>
            <Icon name="calendar" size={11} color={colors.mutedForeground} />
            <Text style={[styles.dealDateTxt, { color: colors.mutedForeground }]}>
              {new Date(deal.closeDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </Text>
          </View>
          <Icon name="chevron-right" size={14} color={colors.mutedForeground} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontFamily: "Poppins_700Bold" },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },

  summaryRow: { flexDirection: "row", gap: 10, margin: 16, marginBottom: 12 },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  summaryLabel: { fontSize: 10, fontFamily: "Poppins_400Regular", marginBottom: 4 },
  summaryValue: { fontSize: 13, fontFamily: "Poppins_700Bold" },

  tip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tipText: { fontSize: 12, fontFamily: "Poppins_500Medium" },

  stageSection: { marginBottom: 8 },
  stageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    marginBottom: 6,
  },
  stageTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  stageIconBox: { width: 26, height: 26, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  stageName: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  stageCountPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  stageCountTxt: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  stageValue: { fontSize: 12, fontFamily: "Poppins_500Medium" },

  dropZone: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
  },
  dropZoneText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },

  dealsContainer: { paddingHorizontal: 16, gap: 8 },
  emptyZone: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  emptyTxt: { fontSize: 12, fontFamily: "Poppins_400Regular" },

  dealCard: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 0,
  },
  dragHandle: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  dealCardContent: { flex: 1, padding: 12, gap: 4 },
  dealCardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  dealName: { flex: 1, fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  urgentBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  urgentTxt: { fontSize: 10, fontFamily: "Poppins_700Bold" },
  dealCompany: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  dealMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  dealValue: { fontSize: 15, fontFamily: "Poppins_700Bold", flex: 1 },
  dealDate: { flexDirection: "row", alignItems: "center", gap: 3 },
  dealDateTxt: { fontSize: 11, fontFamily: "Poppins_400Regular" },

  floatingCard: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 999,
  },
  floatingCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  floatingDragHandle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingInfo: { flex: 1 },
  floatingName: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  floatingCompany: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  floatingValue: { fontSize: 15, fontFamily: "Poppins_700Bold" },
});
