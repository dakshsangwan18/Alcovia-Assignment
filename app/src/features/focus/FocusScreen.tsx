import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusSession } from "./useFocusSession";

const PRESETS = [0.1, 0.5, 1, 25, 45, 60, 90];

export default function FocusScreen() {
  const { session, stats, start, giveUp } = useFocusSession();
  const [selected, setSelected] = useState(25);

  const mins = Math.floor(session.remaining / 60);
  const secs = session.remaining % 60;

  const formatPreset = (m: number) => {
    if (m < 1) return `${Math.round(m * 60)}s`;
    return `${m}m`;
  };

  return (
    <View style={s.container}>
      <View style={s.headerCard}>
        <View style={s.statItem}>
          <Text style={s.statValue}>{stats.focusStreak}</Text>
          <Text style={s.statLabel}>Streak</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statValue}>{Math.round(stats.coins)}</Text>
          <Text style={s.statLabel}>Coins</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statValue}>{Math.round(stats.todayFocusMinutes)}</Text>
          <Text style={s.statLabel}>Today (min)</Text>
        </View>
      </View>

      {session.status !== "active" && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Choose Duration</Text>
          <View style={s.presetGrid}>
            {PRESETS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[s.preset, selected === m && s.presetActive]}
                onPress={() => setSelected(m)}
                activeOpacity={0.7}
              >
                <Text style={[s.presetText, selected === m && s.presetTextActive]}>
                  {formatPreset(m)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.startBtn} onPress={() => start(selected)} activeOpacity={0.8}>
            <Text style={s.startBtnText}>Start Focus Session</Text>
          </TouchableOpacity>
        </View>
      )}

      {session.status === "active" && (
        <View style={s.timerCard}>
          <View style={s.timerRing}>
            <Text style={s.timerText}>
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </Text>
          </View>
          <Text style={s.timerLabel}>Stay focused</Text>
          <TouchableOpacity style={s.giveUpBtn} onPress={giveUp} activeOpacity={0.8}>
            <Text style={s.giveUpText}>Give Up</Text>
          </TouchableOpacity>
        </View>
      )}

      {session.status === "success" && (
        <View style={s.resultCard}>
          <View style={s.successIcon}>
            <Text style={s.successIconText}>✓</Text>
          </View>
          <Text style={s.resultText}>Session Complete!</Text>
          <Text style={s.resultSub}>+50 coins earned</Text>
          <TouchableOpacity style={s.newSessionBtn} onPress={() => start(selected)}>
            <Text style={s.newSessionText}>Start Another</Text>
          </TouchableOpacity>
        </View>
      )}

      {session.status === "failed" && (
        <View style={s.resultCard}>
          <View style={[s.successIcon, { backgroundColor: "#fee2e2" }]}>
            <Text style={[s.successIconText, { color: "#ef4444" }]}>✕</Text>
          </View>
          <Text style={s.resultText}>Session Failed</Text>
          <Text style={s.resultSub}>
            {session.failReason === "give_up" ? "You gave up" : "App was switched away"}
          </Text>
          <TouchableOpacity style={s.newSessionBtn} onPress={() => start(selected)}>
            <Text style={s.newSessionText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8fafc",
    alignItems: "center",
  },
  headerCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    width: "100%",
    maxWidth: 400,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontVariant: ["tabular-nums"],
    maxWidth: 80,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e2e8f0",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 16,
    textAlign: "center",
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  preset: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minWidth: 60,
    alignItems: "center",
  },
  presetActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  presetText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },
  presetTextActive: {
    color: "#fff",
  },
  startBtn: {
    marginTop: 20,
    backgroundColor: "#22c55e",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startBtnText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "700",
  },
  timerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  timerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#dbeafe",
  },
  timerText: {
    fontSize: 56,
    fontWeight: "800",
    color: "#1e293b",
    fontVariant: ["tabular-nums"],
  },
  timerLabel: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 20,
    fontWeight: "500",
  },
  giveUpBtn: {
    marginTop: 28,
    backgroundColor: "#ef4444",
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  giveUpText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#22c55e",
  },
  resultText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
  },
  resultSub: {
    fontSize: 15,
    color: "#64748b",
    marginTop: 8,
    marginBottom: 20,
  },
  newSessionBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  newSessionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
