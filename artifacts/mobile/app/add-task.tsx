import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@/components/Icon";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Task } from "@/data/sampleData";

type Priority = Task["priority"];
const PRIORITIES: Priority[] = ["High", "Medium", "Low"];

const PRIORITY_COLORS: Record<Priority, string> = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#22c55e",
};

export default function AddTaskScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addTask } = useApp();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const today = new Date();
    const defaultDate = dueDate || today.toISOString().split("T")[0];
    addTask({
      title: title.trim(),
      description: description.trim(),
      dueDate: defaultDate,
      priority,
      completed: false,
    });
    router.back();
  };

  const topInsets = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInsets + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Add Task</Text>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <Field label="Task Title *" error={errors.title}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Follow up with client"
            placeholderTextColor={colors.mutedForeground}
            autoFocus
          />
        </Field>

        <Field label="Description">
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add details..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
          />
        </Field>

        <Field label="Due Date">
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="2026-04-25 (YYYY-MM-DD)"
            placeholderTextColor={colors.mutedForeground}
          />
        </Field>

        <Field label="Priority">
          <View style={styles.priorities}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityBtn,
                  { borderColor: colors.border, backgroundColor: colors.card },
                  priority === p && { borderColor: PRIORITY_COLORS[p], backgroundColor: PRIORITY_COLORS[p] + "18" },
                ]}
                onPress={() => setPriority(p)}
              >
                <View style={[styles.dot, { backgroundColor: PRIORITY_COLORS[p] }]} />
                <Text style={[
                  styles.priorityTxt,
                  { color: colors.mutedForeground },
                  priority === p && { color: PRIORITY_COLORS[p], fontFamily: "Poppins_700Bold" },
                ]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>
      </ScrollView>
    </View>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      {children}
      {error && <Text style={[styles.error, { color: "#ef4444" }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { padding: 2 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Poppins_700Bold" },
  saveBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText: { color: "#fff", fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: "Poppins_600SemiBold", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Poppins_400Regular" },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    minHeight: 90,
    textAlignVertical: "top",
  },
  priorities: { flexDirection: "row", gap: 10 },
  priorityBtn: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  priorityTxt: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  error: { fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 4 },
});
