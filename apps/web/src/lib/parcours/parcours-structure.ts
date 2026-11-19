// Reading groups, not prerequisite chains. V4 lines 15–25 and 1341–1561.
export const TRANSVERSAL_FAMILIES = [
  { id: "methods", title: "Méthodes communes", moduleIds: ["X-01", "X-03"] },
  {
    id: "platforms",
    title: "Plateformes, cloud et IA",
    moduleIds: ["X-02", "X-04", "X-05", "X-06", "X-07", "X-10"],
  },
  { id: "investigation", title: "Enquête et protection", moduleIds: ["X-08", "X-09"] },
] as const;

export function transversalFamily(moduleId: string) {
  return TRANSVERSAL_FAMILIES.find((family) => family.moduleIds.some((id) => id === moduleId));
}
