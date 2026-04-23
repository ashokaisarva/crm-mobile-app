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
import { Lead } from "@/data/sampleData";

type Status = Lead["status"];
const STATUSES: Status[] = ["New", "Contacted", "Qualified", "Lost"];

export default function AddLeadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addLead } = useApp();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("New");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!company.trim()) e.company = "Company is required";
    if (!phone.trim()) e.phone = "Phone is required";
    if (!email.trim()) e.email = "Email is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addLead({
      name: name.trim(),
      company: company.trim(),
      phone: phone.trim(),
      email: email.trim(),
      status,
      lastContact: new Date().toISOString().split("T")[0],
      value: Number(value) || 0,
      notes: notes.trim(),
    });
    router.back();
  };

  const topInsets = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInsets + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Add Lead</Text>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <FormField label="Full Name *" error={errors.name}>
          <Input value={name} onChangeText={setName} placeholder="John Smith" colors={colors} />
        </FormField>

        <FormField label="Company *" error={errors.company}>
          <Input value={company} onChangeText={setCompany} placeholder="Acme Corp" colors={colors} />
        </FormField>

        <FormField label="Phone *" error={errors.phone}>
          <Input value={phone} onChangeText={setPhone} placeholder="+1 555-0100" keyboardType="phone-pad" colors={colors} />
        </FormField>

        <FormField label="Email *" error={errors.email}>
          <Input value={email} onChangeText={setEmail} placeholder="john@acme.com" keyboardType="email-address" colors={colors} />
        </FormField>

        <FormField label="Deal Value ($)">
          <Input value={value} onChangeText={setValue} placeholder="10000" keyboardType="numeric" colors={colors} />
        </FormField>

        <FormField label="Status">
          <View style={styles.statusRow}>
            {STATUSES.map(s => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusBtn,
                  { borderColor: colors.border, backgroundColor: colors.card },
                  status === s && { borderColor: colors.primary, backgroundColor: colors.accent },
                ]}
                onPress={() => setStatus(s)}
              >
                <Text style={[
                  styles.statusText,
                  { color: colors.mutedForeground },
                  status === s && { color: colors.primary, fontFamily: "Poppins_700Bold" },
                ]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormField>

        <FormField label="Notes">
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about this lead..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={4}
          />
        </FormField>
      </ScrollView>
    </View>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      {children}
      {error && <Text style={[styles.error, { color: "#ef4444" }]}>{error}</Text>}
    </View>
  );
}

function Input({ value, onChangeText, placeholder, keyboardType, colors }: any) {
  return (
    <TextInput
      style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedForeground}
      keyboardType={keyboardType || "default"}
      autoCapitalize="words"
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: { padding: 2 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Poppins_700Bold" },
  saveBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText: { color: "#fff", fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: "Poppins_600SemiBold", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    minHeight: 100,
    textAlignVertical: "top",
  },
  statusRow: { flexDirection: "row", gap: 8 },
  statusBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
  },
  statusText: { fontSize: 12, fontFamily: "Poppins_500Medium" },
  error: { fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 4 },
});
