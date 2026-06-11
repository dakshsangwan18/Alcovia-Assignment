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
    <ScrollView style={st.container} contentContainerStyle={st.content}>
      <Text style={st.pageTitle}>Dev Panel</Text>

      <View style={st.controlCard}>
        <View style={st.controlRow}>
          <View style={st.controlLeft}>
            <Text style={st.controlLabel}>Client ID</Text>
            <Text style={st.controlValue}>{app.clientId}</Text>
          </View>
          <View style={[st.badge, app.isOnline ? st.badgeOnline : st.badgeOffline]}>
            <Text style={st.badgeText}>{app.isOnline ? "Online" : "Offline"}</Text>
          </View>
        </View>

        <View style={st.divider} />

        <View style={st.controlRow}>
          <Text style={st.controlLabel}>Network</Text>
          <Switch
            value={app.isOnline}
            onValueChange={app.setOnline}
            trackColor={{ false: "#e2e8f0", true: "#22c55e" }}
            thumbColor={"#fff"}
          />
        </View>

        <View style={st.divider} />

        <View style={st.controlRow}>
          <Text style={st.controlLabel}>Sync</Text>
          <TouchableOpacity style={st.syncBtn} onPress={app.syncNow} activeOpacity={0.8}>
            <Text style={st.syncBtnText}>Sync Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={st.tabs}>
        {(["metrics", "ops", "state"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[st.tab, view === t && st.tabActive]}
            onPress={() => setView(t)}
            activeOpacity={0.7}
          >
            <Text style={[st.tabText, view === t && st.tabTextActive]}>
              {t === "ops" ? "Operations" : t === "state" ? "State" : "Metrics"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {view === "metrics" && (
        <View style={st.metricsCard}>
          <Metric label="Pending Operations" value={app.pendingOps} color="#f59e0b" />
          <Metric label="Synced Operations" value={app.syncedOps} color="#3b82f6" />
          <Metric label="Lamport Clock" value={app.lamport} color="#8b5cf6" />
          <Metric label="Sync Cursor" value={app.watermark} color="#64748b" />
          <View style={st.divider} />
          <Metric label="Focus Streak" value={app.state.stats.focusStreak} color="#22c55e" />
          <Metric label="Total Coins" value={app.state.stats.coins} color="#eab308" />
          <Metric label="Today (min)" value={app.state.stats.todayFocusMinutes} color="#3b82f6" />
          <Metric label="Total Sessions" value={app.state.stats.totalSuccessfulSessions} color="#06b6d4" />
        </View>
      )}

      {view === "ops" && (
        <View style={st.listCard}>
          <Text style={st.listTitle}>Operation Log ({ops.length} ops)</Text>
          {ops.map((op) => (
            <View key={op.operationId} style={st.opRow}>
              <View style={st.opLeft}>
                <View style={[st.opBadge, { backgroundColor: op.synced ? "#dcfce7" : "#fef3c7" }]}>
                  <Text style={[st.opBadgeText, { color: op.synced ? "#16a34a" : "#d97706" }]}>
                    {op.synced ? "✓" : "○"}
                  </Text>
                </View>
                <Text style={st.opType}>{op.type}</Text>
              </View>
              <View style={st.opCenter}>
                <Text style={st.opEntity}>{op.entityId.slice(-12)}</Text>
              </View>
              <View style={st.opRight}>
                <Text style={st.opLamport}>L{op.lamportTimestamp}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {view === "state" && (
        <View style={st.listCard}>
          <Text style={st.listTitle}>Sessions ({app.state.sessions.size})</Text>
          {[...app.state.sessions.values()].map((s) => (
            <View key={s.id} style={st.stateRow}>
              <View style={[st.statusDot, { backgroundColor: s.status === "success" ? "#22c55e" : s.status === "failed" ? "#ef4444" : "#94a3b8" }]} />
              <Text style={st.stateText}>{s.status}</Text>
              <Text style={st.stateSub}>{s.id.slice(-8)}</Text>
              <Text style={st.stateMeta}>{s.targetDuration}m</Text>
            </View>
          ))}

          <View style={st.divider} />

          <Text style={st.listTitle}>Tasks ({app.state.tasks.size})</Text>
          {[...app.state.tasks.values()].map((t) => (
            <View key={t.id} style={st.stateRow}>
              <View style={[st.statusDot, { backgroundColor: t.status === "done" ? "#22c55e" : t.status === "in_progress" ? "#f59e0b" : "#e2e8f0" }]} />
              <Text style={[st.stateText, t.isDeleted && st.deleted]}>{t.title.slice(0, 22)}</Text>
              <Text style={st.stateMeta}>{t.status}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={st.metric}>
      <View style={st.metricLeft}>
        <View style={[st.metricDot, { backgroundColor: color }]} />
        <Text style={st.metricLabel}>{label}</Text>
      </View>
      <Text style={[st.metricVal, { color }]}>{value}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
    marginTop: 8,
  },
  controlCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  controlLeft: {
    flexDirection: "column",
  },
  controlLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  controlValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeOnline: {
    backgroundColor: "#dcfce7",
  },
  badgeOffline: {
    backgroundColor: "#fee2e2",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 8,
  },
  syncBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  syncBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  tabActive: {
    backgroundColor: "#3b82f6",
  },
  tabText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#fff",
  },
  metricsCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metric: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  metricLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metricDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  metricVal: {
    fontSize: 18,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  listCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
  },
  opRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  opLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 120,
  },
  opBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  opBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  opType: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  opCenter: {
    flex: 1,
  },
  opEntity: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "monospace",
  },
  opRight: {
    width: 50,
    alignItems: "flex-end",
  },
  opLamport: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },
  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stateText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#334155",
    flex: 1,
  },
  stateSub: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "monospace",
  },
  stateMeta: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  deleted: {
    textDecorationLine: "line-through",
    color: "#94a3b8",
  },
});
