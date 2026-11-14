import type { ComponentType } from "react";
import type { LessonManifest } from "@cyber-school/lesson-runtime";
import {
  DefaultLessonExperience,
  type LessonComponentProps,
} from "@/components/default-lesson-experience";
import { TcpHandshakeSimulator } from "@/components/tcp-handshake-simulator";
import { MemoryCourseExperience } from "@/lessons/program-memory-fundamentals/memory-course-experience";

const LESSON_COMPONENT_REGISTRY: Record<string, ComponentType<LessonComponentProps>> = {
  "tcp-three-way-handshake": TcpHandshakeSimulator,
  "program-memory-fundamentals": MemoryCourseExperience,
};

export function resolveLessonComponent(slug: string): ComponentType<LessonComponentProps> {
  return LESSON_COMPONENT_REGISTRY[slug] ?? DefaultLessonExperience;
}

export function LessonRenderer({ lesson }: { lesson: LessonManifest }) {
  switch (lesson.slug) {
    case "tcp-three-way-handshake":
      return <TcpHandshakeSimulator lesson={lesson} />;
    case "program-memory-fundamentals":
      return <MemoryCourseExperience lesson={lesson} />;
    default:
      return <DefaultLessonExperience lesson={lesson} />;
  }
}
