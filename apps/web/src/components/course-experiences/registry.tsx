"use client";

import * as React from "react";
import { ObservationWorkbench } from "./observation-workbench";

export interface CourseExperienceRendererProps {
  componentId: string;
}

export function CourseExperienceRenderer({ componentId }: CourseExperienceRendererProps) {
  switch (componentId) {
    case "observation-workbench":
      return <ObservationWorkbench />;
    default:
      return null;
  }
}
