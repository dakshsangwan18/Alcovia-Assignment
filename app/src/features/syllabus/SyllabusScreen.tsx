import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useApp } from "../../context/AppContext";
import { computeProgress } from "../../../shared/reducers/rebuild";
import type { Task } from "../../../shared/types";

export default function SyllabusScreen() {
  const { state, dispatch } = useApp();
  const progress = useMemo(() => computeProgress(state.tasks), [state.tasks]);
  const [expandedSubj, setExpandedSubj] = useState<string | null>(null);
  const [expandedCh, setExpandedCh] = useState<string | null>(null);

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}>
      <Text style={st.pageTitle}>Syllabus Progress</Text>
      {progress.map((subj) => (
        <View key={subj.id} style={st.subjectCard}>
          <TouchableOpacity
            style={st.subjectHeader}
            onPress={() => setExpandedSubj(expandedSubj === subj.id ? null : subj.id)}
            activeOpacity={0.7}
          >
            <View style={st.subjectLeft}>
              <View style={[st.subjectDot, { backgroundColor: subj.progress === 100 ? "#22c55e" : "#3b82f6" }]} />
              <Text style={st.subjectName}>{subj.name}</Text>
            </View>
            <View style={st.subjectRight}>
              <Text style={st.subjectPct}>{subj.progress}%</Text>
              <Text style={st.chevron}>{expandedSubj === subj.id ? "▼" : "▶"}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={st.barContainer}>
            <View style={[st.barBg, { width: "100%" }]}>
              <View style={[st.barFill, { width: `${Math.min(subj.progress, 100)}%` }]} />
            </View>
          </View>

          {expandedSubj === subj.id && (
            <View style={st.chaptersContainer}>
              {subj.chapters.map((ch) => (
                <View key={ch.id} style={st.chapter}>
                  <TouchableOpacity
                    style={st.chapterHeader}
                    onPress={() => setExpandedCh(expandedCh === ch.id ? null : ch.id)}
                    activeOpacity={0.7}
                  >
                    <View style={st.chapterLeft}>
                      <View style={[st.chapterDot, { backgroundColor: ch.progress === 100 ? "#22c55e" : "#94a3b8" }]} />
                      <Text style={st.chapterName}>{ch.name}</Text>
                    </View>
                    <View style={st.chapterRight}>
                      <Text style={st.chapterPct}>{ch.progress}%</Text>
                      <Text style={st.chevronSmall}>{expandedCh === ch.id ? "▼" : "▶"}</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <View style={st.barContainerSmall}>
                    <View style={[st.barBgSmall, { width: "100%" }]}>
                      <View style={[st.barFillSmall, { width: `${Math.min(ch.progress, 100)}%` }]} />
                    </View>
                  </View>

                  {expandedCh === ch.id && (
                    <View style={st.tasksContainer}>
                      {ch.tasks.map((task) => (
                        <TaskRow key={task.id} task={task} dispatch={dispatch} />
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

function TaskRow({ task, dispatch }: { task: Task; dispatch: ReturnType<typeof useApp>["dispatch"] }) {
  const opts: { status: Task["status"]; label: string; color: string }[] = [
    { status: "not_started", label: "Not Started", color: "#94a3b8" },
    { status: "in_progress", label: "In Progress", color: "#f59e0b" },
    { status: "done", label: "Done", color: "#22c55e" },
  ];
  
  return (
    <View style={st.taskCard}>
      <View style={st.taskHeader}>
        <View style={st.taskDot}>
          <View style={[st.taskDotInner, { backgroundColor: task.status === "done" ? "#22c55e" : task.status === "in_progress" ? "#f59e0b" : "#e2e8f0" }]} />
        </View>
        <Text style={[st.taskTitle, task.isDeleted && st.deleted]}>{task.title}</Text>
      </View>
      
      {!task.isDeleted && (
        <View style={st.taskActions}>
          {opts.map((o) => (
            <TouchableOpacity
              key={o.status}
              style={[
                st.taskBtn,
                task.status === o.status && { backgroundColor: o.color, borderColor: o.color },
              ]}
              onPress={() => dispatch("TASK_STATUS_CHANGED", task.id, { status: o.status })}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  st.taskBtnText,
                  task.status === o.status && { color: "#fff", fontWeight: "600" },
                ]}
              >
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={st.delBtn}
            onPress={() => dispatch("TASK_DELETED", task.id, {})}
            activeOpacity={0.7}
          >
            <Text style={st.delText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
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
  subjectCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subjectLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  subjectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  subjectName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
  },
  subjectRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subjectPct: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3b82f6",
    fontVariant: ["tabular-nums"],
  },
  chevron: {
    fontSize: 12,
    color: "#94a3b8",
  },
  barContainer: {
    marginTop: 10,
  },
  barBg: {
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },
  chaptersContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  chapter: {
    marginTop: 10,
  },
  chapterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  chapterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chapterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chapterName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },
  chapterRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chapterPct: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    fontVariant: ["tabular-nums"],
  },
  chevronSmall: {
    fontSize: 10,
    color: "#94a3b8",
  },
  barContainerSmall: {
    marginTop: 6,
    paddingLeft: 16,
  },
  barBgSmall: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFillSmall: {
    height: 6,
    backgroundColor: "#94a3b8",
    borderRadius: 3,
  },
  tasksContainer: {
    marginTop: 8,
    paddingLeft: 16,
  },
  taskCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  taskDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  taskDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    flex: 1,
  },
  deleted: {
    textDecorationLine: "line-through",
    color: "#94a3b8",
  },
  taskActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  taskBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  taskBtnText: {
    fontSize: 11,
    color: "#64748b",
  },
  delBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  delText: {
    fontSize: 11,
    color: "#ef4444",
    fontWeight: "500",
  },
});
