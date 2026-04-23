import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
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
import { TaskItem } from "@/components/TaskItem";

type TaskFilter = "All" | "Pending" | "Done";

export default function TasksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, toggleTask, deleteTask } = useApp();
  const [filter, setFilter] = useState<TaskFilter>("Pending");

  const filtered = useMemo(() => {
    switch (filter) {
      case "Pending": return tasks.filter(t => !t.completed).sort((a, b) => {
        const priorityOrder = { High: 0, Medium: 1, Low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      case "Done": return tasks.filter(t => t.completed);
      default: return tasks;
    }
  }, [tasks, filter]);

  const overdue = tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length;
  const pending = tasks.filter(t => !t.completed).length;
  const done = tasks.filter(t => t.completed).length;

  const topInsets = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 64 : insets.bottom + 80;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInsets + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Tasks</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/add-task" as any)}
        >
          <Icon name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={[styles.statsRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.foreground }]}>{pending}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Pending</Text>
        </View>
        {overdue > 0 && (
          <View style={[styles.stat, styles.statBorder, { borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.destructive }]}>{overdue}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Overdue</Text>
          </View>
        )}
        <View style={[styles.stat, styles.statBorder, { borderColor: colors.border }]}>
          <Text style={[styles.statNum, { color: colors.success }]}>{done}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Done</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={[styles.filterRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(["All", "Pending", "Done"] as TaskFilter[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              filter === f && { borderBottomWidth: 2, borderBottomColor: colors.primary },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[
              styles.filterText,
              { color: filter === f ? colors.primary : colors.mutedForeground },
              filter === f && styles.filterActive,
            ]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskItem task={item} onToggle={toggleTask} onDelete={deleteTask} />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="check-circle" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {filter === "Done" ? "No completed tasks yet" : "All caught up!"}
            </Text>
          </View>
        }
      />
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
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontFamily: "Poppins_700Bold" },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  statsRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  stat: { flex: 1, alignItems: "center" },
  statBorder: { borderLeftWidth: 1 },
  statNum: { fontSize: 22, fontFamily: "Poppins_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Poppins_400Regular", marginTop: 2 },
  filterRow: { flexDirection: "row", borderBottomWidth: 1 },
  filterBtn: { flex: 1, alignItems: "center", paddingVertical: 10 },
  filterText: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  filterActive: { fontFamily: "Poppins_700Bold" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Poppins_400Regular" },
});
