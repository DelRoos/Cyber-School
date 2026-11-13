import type { ComponentType } from "react";
import type { LessonManifest } from "@cyber-school/lesson-runtime";
import {
  DefaultLessonExperience,
  type LessonComponentProps,
} from "@/components/default-lesson-experience";
import { TcpHandshakeSimulator } from "@/components/tcp-handshake-simulator";

const LESSON_COMPONENT_REGISTRY: Record<string, ComponentType<LessonComponentProps>> = {
  "tcp-three-way-handshake": TcpHandshakeSimulator,
};

export function resolveLessonComponent(slug: string): ComponentType<LessonComponentProps> {
  return LESSON_COMPONENT_REGISTRY[slug] ?? DefaultLessonExperience;
}

export function LessonRenderer({ lesson }: { lesson: LessonManifest }) {
  switch (lesson.slug) {
    case "tcp-three-way-handshake":
      return <TcpHandshakeSimulator lesson={lesson} />;
    default:
      return <DefaultLessonExperience lesson={lesson} />;
  }
}
