import React from "react";
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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { leads, deals, tasks } = useApp();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const topInsets = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 64 : insets.bottom + 80;

  const wonDeals = deals.filter(d => d.stage === "Won").length;
  const wonValue = deals.filter(d => d.stage === "Won").reduce((s, d) => s + d.value, 0);
  const conversionRate = leads.length > 0
    ? Math.round((leads.filter(l => l.status === "Qualified").length / leads.length) * 100)
    : 0;

  const menuItems = [
    { icon: "settings", label: "Settings", color: colors.primary },
    { icon: "bell", label: "Notifications", color: "#f59e0b" },
    { icon: "lock", label: "Privacy", color: "#8b5cf6" },
    { icon: "help-circle", label: "Help & Support", color: colors.success },
    { icon: "log-out", label: "Log Out", color: colors.destructive },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInsets + 20, backgroundColor: colors.primary }]}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={styles.avatarText}>
              {user?.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?"}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{user?.name ?? "Unknown User"}</Text>
        <Text style={styles.role}>{user?.role ?? ""}</Text>
        <Text style={styles.email}>{user?.email ?? ""}</Text>
        <View style={styles.badge}>
          <Icon name="star" size={11} color="#f59e0b" />
          <Text style={styles.badgeText}>Top Performer</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={[styles.statsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: colors.primary }]}>{leads.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Leads</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: colors.success }]}>{wonDeals}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Deals Won</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: "#f59e0b" }]}>{conversionRate}%</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Conversion</Text>
        </View>
      </View>

      {/* Won Value */}
      <View style={[styles.wonCard, { backgroundColor: colors.primary, marginHorizontal: 16, marginTop: 16 }]}>
        <View>
          <Text style={styles.wonLabel}>Total Revenue Generated</Text>
          <Text style={styles.wonValue}>${wonValue.toLocaleString()}</Text>
        </View>
        <View style={[styles.wonIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Icon name="award" size={24} color="#fff" />
        </View>
      </View>

      {/* Menu */}
      <View style={[styles.menuContainer, { marginHorizontal: 16, marginTop: 16, backgroundColor: colors.card, borderColor: colors.border }]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.menuItem,
              { borderBottomColor: colors.border },
              index === menuItems.length - 1 && styles.menuItemLast,
            ]}
            activeOpacity={0.7}
            onPress={item.label === "Log Out" ? handleLogout : undefined}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + "18" }]}>
              <Icon name={item.icon as any} size={18} color={item.color} />
            </View>
            <Text style={[styles.menuLabel, { color: item.label === "Log Out" ? colors.destructive : colors.foreground }]}>
              {item.label}
            </Text>
            <Icon name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>CRM Mobile v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: { marginBottom: 12 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 28, fontFamily: "Poppins_700Bold" },
  name: { color: "#fff", fontSize: 22, fontFamily: "Poppins_700Bold", marginBottom: 4 },
  role: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontFamily: "Poppins_500Medium", marginBottom: 2 },
  email: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Poppins_400Regular", marginBottom: 10 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { color: "#fff", fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 24, fontFamily: "Poppins_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Poppins_400Regular", marginTop: 4 },
  statDivider: { width: 1, marginHorizontal: 8 },
  wonCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wonLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Poppins_400Regular", marginBottom: 6 },
  wonValue: { color: "#fff", fontSize: 28, fontFamily: "Poppins_700Bold" },
  wonIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  menuContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: "Poppins_500Medium" },
  version: { textAlign: "center", marginTop: 20, fontSize: 12, fontFamily: "Poppins_400Regular" },
});
