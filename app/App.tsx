import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AppProvider } from "./src/context/AppContext";
import FocusScreen from "./src/features/focus/FocusScreen";
import SyllabusScreen from "./src/features/syllabus/SyllabusScreen";
import DevPanel from "./src/features/dev/DevPanel";

type Tab = "focus" | "syllabus" | "dev";

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "focus", label: "Focus" },
    { key: "syllabus", label: "Syllabus" },
    { key: "dev", label: "Dev" },
  ];

  return (
    <View style={tb.container}>
      {tabs.map((t) => (
        <TouchableOpacity
          key={t.key}
          style={[tb.tab, tab === t.key && tb.active]}
          onPress={() => setTab(t.key)}
        >
          <Text style={[tb.text, tab === t.key && tb.textActive]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("focus");

  return (
    <AppProvider>
      <View style={s.container}>
        <TabBar tab={tab} setTab={setTab} />
        <View style={s.content}>
          {tab === "focus" && <FocusScreen />}
          {tab === "syllabus" && <SyllabusScreen />}
          {tab === "dev" && <DevPanel />}
        </View>
      </View>
    </AppProvider>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1 },
});

const tb = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  active: { backgroundColor: "#eff6ff" },
  text: { fontSize: 14, fontWeight: "600", color: "#94a3b8" },
  textActive: { color: "#3b82f6" },
});
