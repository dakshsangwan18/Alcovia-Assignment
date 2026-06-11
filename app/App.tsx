import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AppProvider } from "./src/context/AppContext";
import FocusScreen from "./src/features/focus/FocusScreen";
import SyllabusScreen from "./src/features/syllabus/SyllabusScreen";
import DevPanel from "./src/features/dev/DevPanel";

type Tab = "focus" | "syllabus" | "dev";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "focus", label: "Focus", icon: "🎯" },
  { key: "syllabus", label: "Syllabus", icon: "📚" },
  { key: "dev", label: "Dev", icon: "⚙️" },
];

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <View style={tb.container}>
      <View style={tb.inner}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[tb.tab, tab === t.key && tb.active]}
            onPress={() => setTab(t.key)}
            activeOpacity={0.7}
          >
            <Text style={[tb.icon, tab === t.key && tb.iconActive]}>{t.icon}</Text>
            <Text style={[tb.text, tab === t.key && tb.textActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    flex: 1,
  },
});

const tb = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingTop: 48,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  inner: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  active: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    fontSize: 16,
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
  },
  textActive: {
    color: "#3b82f6",
  },
});
