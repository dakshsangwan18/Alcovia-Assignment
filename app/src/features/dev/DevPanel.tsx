import React, { useState, useEffect } from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useApp } from "../../context/AppContext";
import { allOps } from "../../storage/operations";
import type { StoredOp } from "../../storage/db";

export default function DevPanel() {
  const app = useApp();
  const [ops, setOps] = useState<StoredOp[]>([]);
  const [view, setView] = useState<"metrics" | "ops" | "state">("metrics");

  useEffect(() => {
    allOps().then(setOps);
    const i = setInterval(() => allOps().then(setOps), 2_000);
    return () => clearInterval(i);
  }, []);

  return (
    <ScrollView style={st.container}>
      <View style={st.row}>
        <Text style={st.label}>Client</Text>
        <Text style={st.val}>{app.clientId}</Text>
      </View>

      <View style={st.row}>
        <Text style={st.label}>Online</Text>
        <Switch value={app.isOnline} onValueChange={app.setOnline} />
      </View>

      <View style={st.row}>
        <Text style={st.label}>Sync</Text>
        <TouchableOpacity style={st.btn} onPress={app.syncNow}>
          <Text style={st.btnText}>Sync Now</Text>
        </TouchableOpacity>
      </View>

      <View style={st.divider} />

      <View style={st.tabs}>
        {(["metrics", "ops", "state"] as const).map((t) => (
          <TouchableOpacity key={t} style={[st.tab, view === t && st.tabActive]} onPress={() => setView(t)}>
            <Text style={[st.tabText, view === t && st.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {view === "metrics" && (
        <View style={st.section}>
          <Metric label="Pending ops" value={app.pendingOps} />
          <Metric label="Synced ops" value={app.syncedOps} />
          <Metric label="Lamport clock" value={app.lamport} />
          <Metric label="Sync cursor" value={app.watermark} />
          <Metric label="Streak" value={app.state.stats.focusStreak} />
          <Metric label="Coins" value={app.state.stats.coins} />
          <Metric label="Today mins" value={app.state.stats.todayFocusMinutes} />
          <Metric label="Total sessions" value={app.state.stats.totalSuccessfulSessions} />
        </View>
      )}

      {view === "ops" && (
        <View style={st.section}>
          {ops.map((op) => (
            <View key={op.operationId} style={st.opRow}>
              <Text style={st.opType}>{op.type}</Text>
              <Text style={st.opEntity}>{op.entityId.slice(-12)}</Text>
              <Text style={st.opLamport}>L{op.lamportTimestamp}</Text>
              <Text style={[st.opSync, op.synced ? st.synced : st.unsynced]}>
                {op.synced ? "synced" : "pending"}
              </Text>
            </View>
          ))}
        </View>
      )}

      {view === "state" && (
        <View style={st.section}>
          <Text style={st.sectionTitle}>Sessions</Text>
          {[...app.state.sessions.values()].map((s) => (
            <View key={s.id} style={st.opRow}>
              <Text style={st.opType}>{s.status}</Text>
              <Text style={st.opEntity}>{s.id.slice(-8)}</Text>
              <Text style={st.opLamport}>{s.targetDuration}m</Text>
            </View>
          ))}
          <Text style={[st.sectionTitle, { marginTop: 12 }]}>Tasks</Text>
          {[...app.state.tasks.values()].map((t) => (
            <View key={t.id} style={st.opRow}>
              <Text style={st.opType}>{t.status}</Text>
              <Text style={[st.opEntity, t.isDeleted && st.deleted]}>
                {t.title.slice(0, 20)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={st.metric}>
      <Text style={st.metricLabel}>{label}</Text>
      <Text style={st.metricVal}>{value}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#334155" },
  val: { fontSize: 14, color: "#64748b" },
  btn: { backgroundColor: "#3b82f6", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  btnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 12 },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6, backgroundColor: "#f1f5f9" },
  tabActive: { backgroundColor: "#3b82f6" },
  tabText: { fontSize: 12, color: "#475569", textTransform: "capitalize" },
  tabTextActive: { color: "#fff" },
  section: { gap: 4 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#1e293b", marginBottom: 4 },
  metric: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  metricLabel: { fontSize: 13, color: "#64748b" },
  metricVal: { fontSize: 13, fontWeight: "600", color: "#1e293b", fontVariant: ["tabular-nums"] },
  opRow: { flexDirection: "row", alignItems: "center", paddingVertical: 3, gap: 8 },
  opType: { fontSize: 11, color: "#3b82f6", width: 120 },
  opEntity: { fontSize: 11, color: "#475569", flex: 1 },
  opLamport: { fontSize: 11, color: "#94a3b8", width: 40 },
  opSync: { fontSize: 10, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, overflow: "hidden" },
  synced: { color: "#22c55e", backgroundColor: "#f0fdf4" },
  unsynced: { color: "#f59e0b", backgroundColor: "#fffbeb" },
  deleted: { textDecorationLine: "line-through", color: "#94a3b8" },
});
