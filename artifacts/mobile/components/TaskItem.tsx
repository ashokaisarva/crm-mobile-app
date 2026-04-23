import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@/components/Icon";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Task } from "@/data/sampleData";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const colors = useColors();

  const isOverdue = !task.completed && new Date(task.dueDate) < new Date();

  const priorityColor = () => {
    switch (task.priority) {
      case "High": return colors.destructive;
      case "Medium": return colors.warning;
      case "Low": return colors.success;
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    const today = new Date();
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(task.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: isOverdue ? colors.destructive : colors.border }]}>
      <TouchableOpacity onPress={handleToggle} style={styles.checkbox} activeOpacity={0.7}>
        <View style={[
          styles.checkCircle,
          {
            borderColor: task.completed ? colors.primary : colors.border,
            backgroundColor: task.completed ? colors.primary : "transparent",
          }
        ]}>
          {task.completed && <Icon name="check" size={12} color="#fff" />}
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[
          styles.title,
          { color: task.completed ? colors.mutedForeground : colors.foreground },
          task.completed && styles.strikethrough,
        ]}>
          {task.title}
        </Text>
        {task.leadName && (
          <View style={styles.leadRow}>
            <Icon name="user" size={11} color={colors.primary} />
            <Text style={[styles.leadName, { color: colors.primary }]}>{task.leadName}</Text>
          </View>
        )}
        <View style={styles.meta}>
          <View style={[styles.priorityDot, { backgroundColor: priorityColor() }]} />
          <Text style={[styles.priority, { color: priorityColor() }]}>{task.priority}</Text>
          <Text style={[styles.dot, { color: colors.mutedForeground }]}>·</Text>
          <Icon name="calendar" size={11} color={isOverdue ? colors.destructive : colors.mutedForeground} />
          <Text style={[
            styles.date,
            { color: isOverdue ? colors.destructive : colors.mutedForeground },
            isOverdue && styles.overdueBold,
          ]}>
            {formatDate(task.dueDate)}
          </Text>
        </View>
      </View>

      {onDelete && (
        <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.deleteBtn} activeOpacity={0.7}>
          <Icon name="trash-2" size={15} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  checkbox: {
    padding: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
  strikethrough: {
    textDecorationLine: "line-through",
  },
  leadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  leadName: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priority: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
  },
  dot: {
    fontSize: 12,
    marginHorizontal: 2,
  },
  date: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  overdueBold: {
    fontFamily: "Poppins_600SemiBold",
  },
  deleteBtn: {
    padding: 4,
  },
});
