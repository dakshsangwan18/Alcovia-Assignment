import type { Operation } from "../../shared/types.js";
import type { ServerState } from "./store.js";
import { addOperation } from "./store.js";

const SYLLABUS = [
  {
    subjectId: "subject-math",
    subjectName: "Mathematics",
    chapters: [
      {
        chapterId: "subject-math-ch-algebra",
        chapterName: "Algebra",
        tasks: [
          { taskId: "subject-math-ch-algebra-t1", title: "Linear Equations" },
          { taskId: "subject-math-ch-algebra-t2", title: "Quadratic Equations" },
          { taskId: "subject-math-ch-algebra-t3", title: "Polynomials" },
        ],
      },
      {
        chapterId: "subject-math-ch-geometry",
        chapterName: "Geometry",
        tasks: [
          { taskId: "subject-math-ch-geometry-t1", title: "Triangles" },
          { taskId: "subject-math-ch-geometry-t2", title: "Circles" },
          { taskId: "subject-math-ch-geometry-t3", title: "Coordinate Geometry" },
        ],
      },
    ],
  },
  {
    subjectId: "subject-science",
    subjectName: "Science",
    chapters: [
      {
        chapterId: "subject-science-ch-physics",
        chapterName: "Physics",
        tasks: [
          { taskId: "subject-science-ch-physics-t1", title: "Motion" },
          { taskId: "subject-science-ch-physics-t2", title: "Forces" },
        ],
      },
      {
        chapterId: "subject-science-ch-chemistry",
        chapterName: "Chemistry",
        tasks: [
          { taskId: "subject-science-ch-chemistry-t1", title: "Atoms" },
          { taskId: "subject-science-ch-chemistry-t2", title: "Chemical Reactions" },
          { taskId: "subject-science-ch-chemistry-t3", title: "Acids and Bases" },
        ],
      },
      {
        chapterId: "subject-science-ch-biology",
        chapterName: "Biology",
        tasks: [
          { taskId: "subject-science-ch-biology-t1", title: "Cell Structure" },
          { taskId: "subject-science-ch-biology-t2", title: "Photosynthesis" },
        ],
      },
    ],
  },
  {
    subjectId: "subject-english",
    subjectName: "English",
    chapters: [
      {
        chapterId: "subject-english-ch-grammar",
        chapterName: "Grammar",
        tasks: [
          { taskId: "subject-english-ch-grammar-t1", title: "Tenses" },
          { taskId: "subject-english-ch-grammar-t2", title: "Active and Passive Voice" },
        ],
      },
      {
        chapterId: "subject-english-ch-literature",
        chapterName: "Literature",
        tasks: [
          { taskId: "subject-english-ch-literature-t1", title: "Poetry Analysis" },
          { taskId: "subject-english-ch-literature-t2", title: "Shakespeare" },
          { taskId: "subject-english-ch-literature-t3", title: "Modern Fiction" },
          { taskId: "subject-english-ch-literature-t4", title: "Essay Writing" },
        ],
      },
    ],
  },
];

function buildSeedOps(): Operation[] {
  const ops: Operation[] = [];
  let lamport = 1;
  for (const subject of SYLLABUS) {
    for (const chapter of subject.chapters) {
      for (const task of chapter.tasks) {
        ops.push({
          operationId: `seed-${task.taskId}`,
          deviceId: "seed",
          lamportTimestamp: lamport++,
          entityId: task.taskId,
          type: "TASK_CREATED",
          payload: {
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            chapterId: chapter.chapterId,
            chapterName: chapter.chapterName,
            title: task.title,
            status: "not_started",
          },
          clientTimestamp: "2026-01-01T00:00:00.000Z",
        });
      }
    }
  }
  return ops;
}

export function seedIfEmpty(state: ServerState): void {
  if (state.operations.size > 0) return;

  const ops = buildSeedOps();
  for (const op of ops) {
    addOperation(state, {
      ...op,
      serverSeqNo: 0,
      studentId: "student-1",
    });
  }
  console.log(`Seeded ${ops.length} syllabus tasks`);
}
