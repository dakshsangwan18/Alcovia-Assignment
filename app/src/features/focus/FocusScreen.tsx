import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusSession } from "./useFocusSession";

const PRESETS = [0.5, 1, 25, 45, 60, 90];

export default function FocusScreen() {
  const { session, stats, start, giveUp } = useFocusSession();
  const [selected, setSelected] = useState(25);

  const mins = Math.floor(session.remaining / 60);
  const secs = session.remaining % 60;

  return (
    <View style={s.container}>
      <View style={s.stats}>
        <Text style={s.statText}>Streak: {stats.focusStreak}</Text>
        <Text style={s.statText}>Coins: {stats.coins}</Text>
        <Text style={s.statText}>Today: {stats.todayFocusMinutes} min</Text>
      </View>

      {session.status !== "active" && (
        <View style={s.selector}>
          {PRESETS.map((m) => (
            <TouchableOpacity
              key={m}
              style={[s.preset, selected === m && s.presetActive]}
              onPress={() => setSelected(m)}
            >
              <Text style={[s.presetText, selected === m && s.presetTextActive]}>
                {m < 1 ? `${m * 60}s` : `${m}m`}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.startBtn} onPress={() => start(selected)}>
            <Text style={s.startBtnText}>Start</Text>
          </TouchableOpacity>
        </View>
      )}

      {session.status === "active" && (
        <View style={s.timer}>
          <Text style={s.timerText}>
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </Text>
          <Text style={s.timerLabel}>focusing</Text>
          <TouchableOpacity style={s.giveUpBtn} onPress={giveUp}>
            <Text style={s.giveUpText}>Give Up</Text>
          </TouchableOpacity>
        </View>
      )}

      {session.status === "success" && (
        <View style={s.result}>
          <Text style={s.resultText}>Session complete!</Text>
          <Text style={s.subText}>+50 coins</Text>
        </View>
      )}

      {session.status === "failed" && (
        <View style={s.result}>
          <Text style={s.resultText}>Session failed</Text>
          <Text style={s.subText}>{session.failReason === "give_up" ? "You gave up" : "App was switched"}</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff", alignItems: "center" },
  stats: { flexDirection: "row", gap: 16, marginBottom: 32 },
  statText: { fontSize: 14, color: "#555" },
  selector: { alignItems: "center", gap: 12 },
  preset: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#ddd" },
  presetActive: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  presetText: { fontSize: 16, color: "#333" },
  presetTextActive: { color: "#fff" },
  startBtn: { marginTop: 12, backgroundColor: "#22c55e", paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12 },
  startBtnText: { fontSize: 18, color: "#fff", fontWeight: "600" },
  timer: { alignItems: "center", marginTop: 40 },
  timerText: { fontSize: 64, fontWeight: "700", color: "#1e293b", fontVariant: ["tabular-nums"] },
  timerLabel: { fontSize: 16, color: "#94a3b8", marginTop: 4 },
  giveUpBtn: { marginTop: 32, backgroundColor: "#ef4444", paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 },
  giveUpText: { fontSize: 16, color: "#fff", fontWeight: "600" },
  result: { alignItems: "center", marginTop: 40 },
  resultText: { fontSize: 28, fontWeight: "700", color: "#1e293b" },
  subText: { fontSize: 16, color: "#64748b", marginTop: 8 },
});
