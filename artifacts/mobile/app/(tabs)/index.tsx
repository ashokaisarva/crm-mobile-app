import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@/components/Icon";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import {
  getDashboard,
  DashboardResponse,
  HighPriorityDeal,
  HighPriorityTask,
} from "@/services/api";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatCurrency(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString()}`;
}

const formatAmount = (val: number | null | undefined) =>
  val != null ? "₹" + val.toLocaleString("en-IN") : "—";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await getDashboard();
      setData(result);
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to load dashboard. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const topInsets =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 70;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchDashboard(true)}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topInsets + 16, backgroundColor: colors.primary },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.headerGreeting}>{getGreeting()},</Text>
          <Text style={styles.headerName} numberOfLines={1}>
            {user?.name ?? "Welcome"}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.notifBtn,
            { backgroundColor: "rgba(255,255,255,0.2)" },
          ]}
          onPress={() => router.push("/(tabs)/tasks" as any)}
        >
          <Icon name="bell" size={20} color="#fff" />
          {data && data.pending_tasks_count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {data.pending_tasks_count > 9
                  ? "9+"
                  : String(data.pending_tasks_count)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Pipeline Value Card */}
      <View style={[styles.valueCard, { backgroundColor: colors.primary }]}>
        <Text style={styles.valueLabel}>Total Pipeline Value</Text>
        {loading ? (
          <ActivityIndicator color="#fff" style={{ marginVertical: 8 }} />
        ) : (
          <>
            <Text style={styles.valueAmount}>
              {data ? formatCurrency(data.total_deals_value) : "—"}
            </Text>
            <Text style={styles.valueSub}>
              {data
                ? `${data.active_deals_count} active deal${data.active_deals_count !== 1 ? "s" : ""}`
                : ""}
            </Text>
          </>
        )}
      </View>

      {/* Error state */}
      {!loading && error && (
        <View
          style={[
            styles.errorCard,
            { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
          ]}
        >
          <Icon name="alert-circle" size={16} color={colors.destructive} />
          <Text
            style={[styles.errorText, { color: colors.destructive }]}
            numberOfLines={2}
          >
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            onPress={() => fetchDashboard()}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stats Grid */}
      <View style={[styles.section, { paddingHorizontal: 16 }]}>
        <View style={styles.statsGrid}>
          <StatCard
            label="Today's Leads"
            value={loading ? null : (data?.today_leads_count ?? 0)}
            icon="user-plus"
            colors={colors}
            color={colors.primary}
            onPress={() => router.push("/(tabs)/leads" as any)}
          />
          <StatCard
            label="Hot Leads"
            value={loading ? null : (data?.high_leads_count ?? 0)}
            icon="zap"
            colors={colors}
            color="#f59e0b"
            onPress={() => router.push("/(tabs)/leads" as any)}
          />
          <StatCard
            label="Open Deals"
            value={loading ? null : (data?.open_deals_count ?? 0)}
            icon="trending-up"
            colors={colors}
            color="#10b981"
            onPress={() => router.push("/(tabs)/deals" as any)}
          />
          <StatCard
            label="Pending Tasks"
            value={loading ? null : (data?.pending_tasks_count ?? 0)}
            icon="check-square"
            colors={colors}
            color={colors.primary}
            onPress={() => router.push("/(tabs)/tasks" as any)}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={[styles.section, { paddingHorizontal: 16 }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActions}>
          <QuickAction
            icon="user-plus"
            label="Add Lead"
            color={colors.primary}
            onPress={() => router.push("/add-lead" as any)}
          />
          <QuickAction
            icon="trending-up"
            label="New Deal"
            color="#10b981"
            onPress={() => router.push("/add-deal" as any)}
          />
          <QuickAction
            icon="plus-square"
            label="Add Task"
            color="#f59e0b"
            onPress={() => router.push("/add-task" as any)}
          />
        </View>
      </View>

      {/* High Priority Deals */}
      {!loading && data && data.high_priority_deals.length > 0 && (
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { paddingHorizontal: 16 }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              High Priority Deals
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/deals" as any)}
            >
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                See all
              </Text>
            </TouchableOpacity>
          </View>
          {data.high_priority_deals.map((deal, idx) => (
            <DealCard key={idx} deal={deal} colors={colors} />
          ))}
        </View>
      )}

      {/* Urgent Tasks */}
      {!loading && data && data.high_priority_tasks.length > 0 && (
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { paddingHorizontal: 16 }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Urgent Tasks
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/tasks" as any)}
            >
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                See all
              </Text>
            </TouchableOpacity>
          </View>
          {data.high_priority_tasks.map((task, idx) => (
            <TaskCard key={idx} task={task} colors={colors} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  icon,
  colors,
  color,
  onPress,
}: {
  label: string;
  value: number | null;
  icon: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.statIcon, { backgroundColor: color + "18" }]}>
        <Icon name={icon as any} size={18} color={color} />
      </View>
      {value === null ? (
        <ActivityIndicator
          size="small"
          color={color}
          style={{ marginVertical: 4 }}
        />
      ) : (
        <Text style={[styles.statValue, { color: colors.foreground }]}>
          {value}
        </Text>
      )}
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function QuickAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.quickAction}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.quickIcon, { backgroundColor: color }]}>
        <Icon name={icon as any} size={22} color="#fff" />
      </View>
      <Text style={[styles.quickLabel, { color: "#64748b" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function DealCard({
  deal,
  colors,
}: {
  deal: HighPriorityDeal;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  const initials = deal.title
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View
      style={[
        styles.dealCard,
        {
          borderColor: colors.border,
          backgroundColor: colors.card,
          marginHorizontal: 16,
        },
      ]}
    >
      <View
        style={[styles.dealAvatar, { backgroundColor: colors.primary + "18" }]}
      >
        <Text style={[styles.dealAvatarText, { color: colors.primary }]}>
          {initials}
        </Text>
      </View>
      <View style={styles.dealInfo}>
        <Text
          style={[styles.dealTitle, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {deal.title}
        </Text>
        <Text
          style={[styles.dealOrg, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {deal.organization} · {deal.contact_person}
        </Text>
        <View
          style={[styles.stagePill, { backgroundColor: colors.primary + "15" }]}
        >
          <Text style={[styles.stageText, { color: colors.primary }]}>
            {deal.stage}
          </Text>
        </View>
      </View>
      <Text style={[styles.dealAmount, { color: colors.primary }]}>
        {formatAmount(deal.amount)}
      </Text>
    </View>
  );
}

function TaskCard({
  task,
  colors,
}: {
  task: HighPriorityTask;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View
      style={[
        styles.taskItem,
        {
          borderColor: colors.border,
          backgroundColor: colors.card,
          marginHorizontal: 16,
        },
      ]}
    >
      <View style={[styles.urgentDot, { backgroundColor: "#ef4444" }]} />
      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, { color: colors.foreground }]}>
          {task.name}
        </Text>
        {task.organization && (
          <Text style={[styles.taskLead, { color: colors.primary }]}>
            {task.organization}
          </Text>
        )}
      </View>
      {task.due_at && (
        <Text style={[styles.taskDate, { color: colors.mutedForeground }]}>
          {new Date(task.due_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  headerGreeting: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  headerName: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 8, fontFamily: "Poppins_700Bold" },
  valueCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 4,
  },
  valueLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },
  valueAmount: {
    color: "#fff",
    fontSize: 34,
    fontFamily: "Poppins_700Bold",
    marginTop: 4,
  },
  valueSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginTop: 4,
  },
  errorCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  section: { marginTop: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  seeAll: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "47%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 26, fontFamily: "Poppins_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  quickActions: { flexDirection: "row", gap: 12, marginTop: 12 },
  quickAction: { flex: 1, alignItems: "center", gap: 8 },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    textAlign: "center",
  },
  dealCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  dealAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  dealAvatarText: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  dealInfo: { flex: 1, gap: 2 },
  dealTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  dealOrg: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  stagePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
  },
  stageText: { fontSize: 10, fontFamily: "Poppins_500Medium" },
  dealAmount: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  urgentDot: { width: 8, height: 8, borderRadius: 4 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  taskLead: { fontSize: 11, fontFamily: "Poppins_400Regular", marginTop: 2 },
  taskDate: { fontSize: 11, fontFamily: "Poppins_400Regular" },
});
