import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useApp } from "../../context/AppContext";
import { computeProgress } from "@shared/reducers/rebuild";
import type { Task } from "@shared/types";

export default function SyllabusScreen() {
  const { state, dispatch } = useApp();
  const progress = useMemo(() => computeProgress(state.tasks), [state.tasks]);
  const [expandedSubj, setExpandedSubj] = useState<string | null>(null);
  const [expandedCh, setExpandedCh] = useState<string | null>(null);

  return (
    <ScrollView style={st.container}>
      {progress.map((subj) => (
        <View key={subj.id} style={st.subject}>
          <TouchableOpacity
            style={st.subjectHeader}
            onPress={() => setExpandedSubj(expandedSubj === subj.id ? null : subj.id)}
          >
            <Text style={st.subjectName}>{subj.name}</Text>
            <Text style={st.subjectPct}>{subj.progress}%</Text>
          </TouchableOpacity>
          <View style={[st.barBg, { width: `${Math.min(subj.progress, 100)}%` as any }]}>
            <View style={st.barFill} />
          </View>

          {expandedSubj === subj.id &&
            subj.chapters.map((ch) => (
              <View key={ch.id} style={st.chapter}>
                <TouchableOpacity
                  style={st.chapterHeader}
                  onPress={() => setExpandedCh(expandedCh === ch.id ? null : ch.id)}
                >
                  <Text style={st.chapterName}>{ch.name}</Text>
                  <Text style={st.chapterPct}>{ch.progress}%</Text>
                </TouchableOpacity>

                {expandedCh === ch.id &&
                  ch.tasks.map((task) => (
                    <TaskRow key={task.id} task={task} dispatch={dispatch} />
                  ))}
              </View>
            ))}
        </View>
      ))}
    </ScrollView>
  );
}

function TaskRow({ task, dispatch }: { task: Task; dispatch: ReturnType<typeof useApp>["dispatch"] }) {
  const opts: Task["status"][] = ["not_started", "in_progress", "done"];
  return (
    <View style={st.task}>
      <Text style={[st.taskTitle, task.isDeleted && st.deleted]}>{task.title}</Text>
      {!task.isDeleted && (
        <View style={st.taskActions}>
          {opts.map((s) => (
            <TouchableOpacity
              key={s}
              style={[st.taskBtn, task.status === s && st.taskBtnActive]}
              onPress={() => dispatch("TASK_STATUS_CHANGED", task.id, { status: s })}
            >
              <Text style={[st.taskBtnText, task.status === s && st.taskBtnTextActive]}>
                {s === "not_started" ? "NS" : s === "in_progress" ? "IP" : "Done"}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={st.delBtn}
            onPress={() => dispatch("TASK_DELETED", task.id, {})}
          >
            <Text style={st.delText}>Del</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  subject: { marginBottom: 20 },
  subjectHeader: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  subjectName: { fontSize: 18, fontWeight: "700" },
  subjectPct: { fontSize: 18, fontWeight: "700", color: "#3b82f6" },
  barBg: { height: 6, backgroundColor: "#e2e8f0", borderRadius: 3, overflow: "hidden" },
  barFill: { height: 6, backgroundColor: "#3b82f6", borderRadius: 3, width: "100%" },
  chapter: { marginLeft: 16, marginTop: 8 },
  chapterHeader: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  chapterName: { fontSize: 15, fontWeight: "600", color: "#475569" },
  chapterPct: { fontSize: 14, color: "#64748b" },
  task: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginLeft: 32, paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: "#f1f5f9" },
  taskTitle: { fontSize: 14, flex: 1 },
  deleted: { textDecorationLine: "line-through", color: "#94a3b8" },
  taskActions: { flexDirection: "row", gap: 4 },
  taskBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: "#cbd5e1" },
  taskBtnActive: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  taskBtnText: { fontSize: 11, color: "#475569" },
  taskBtnTextActive: { color: "#fff" },
  delBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: "#fee2e2" },
  delText: { fontSize: 11, color: "#ef4444" },
});
