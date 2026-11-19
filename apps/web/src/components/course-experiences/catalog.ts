export interface ExperienceCatalogItem {
  id: string;
  component: string;
  engine: string;
}

export const EXPERIENCE_CATALOG = [
  {
    id: "observation-workbench",
    component: "observation-workbench",
    engine: "observation-model",
  },
] as const satisfies readonly ExperienceCatalogItem[];

export type RegisteredExperienceId = (typeof EXPERIENCE_CATALOG)[number]["id"];
