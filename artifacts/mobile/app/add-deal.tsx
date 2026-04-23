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
import { Deal } from "@/data/sampleData";

type Stage = Deal["stage"];
const STAGES: Stage[] = ["New", "Qualified", "Proposal", "Won", "Lost"];

export default function AddDealScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addDeal } = useApp();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState<Stage>("New");
  const [closeDate, setCloseDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Deal name is required";
    if (!company.trim()) e.company = "Company is required";
    if (!value.trim() || isNaN(Number(value))) e.value = "Valid value is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addDeal({
      name: name.trim(),
      company: company.trim(),
      value: Number(value),
      stage,
      closeDate: closeDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      leadId: "",
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Add Deal</Text>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <Field label="Deal Name *" error={errors.name}>
          <Inp value={name} onChangeText={setName} placeholder="Enterprise License" colors={colors} />
        </Field>

        <Field label="Company *" error={errors.company}>
          <Inp value={company} onChangeText={setCompany} placeholder="Acme Corp" colors={colors} />
        </Field>

        <Field label="Deal Value ($) *" error={errors.value}>
          <Inp value={value} onChangeText={setValue} placeholder="25000" keyboardType="numeric" colors={colors} />
        </Field>

        <Field label="Expected Close Date">
          <Inp value={closeDate} onChangeText={setCloseDate} placeholder="2026-06-30 (YYYY-MM-DD)" colors={colors} />
        </Field>

        <Field label="Stage">
          <View style={styles.stages}>
            {STAGES.map(s => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.stageBtn,
                  { borderColor: colors.border, backgroundColor: colors.card },
                  stage === s && { borderColor: colors.primary, backgroundColor: colors.accent },
                ]}
                onPress={() => setStage(s)}
              >
                <Text style={[
                  styles.stageTxt,
                  { color: colors.mutedForeground },
                  stage === s && { color: colors.primary, fontFamily: "Poppins_700Bold" },
                ]}>
                  {s}
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

function Inp({ value, onChangeText, placeholder, keyboardType, colors }: any) {
  return (
    <TextInput
      style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedForeground}
      keyboardType={keyboardType || "default"}
    />
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
  stages: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stageBtn: { borderWidth: 1.5, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 14, alignItems: "center" },
  stageTxt: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  error: { fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 4 },
});
