export type SegmentId = "text" | "rodata" | "data-bss" | "heap" | "mmap" | "stack";

export type MemoryAccessAction =
  "read-text" | "write-text" | "alloc-heap" | "exec-stack" | "access-unmapped";

export type MmuOutcome =
  | "browsing_segments"
  | "translating_valid"
  | "demand_page_fault_resolved"
  | "sigsegv_permission_denied"
  | "sigsegv_unmapped";

export interface ProcessSegmentInfo {
  id: SegmentId;
  name: string;
  permissions: string;
  virtualRange: string;
  growth: "fixed" | "up" | "down";
  procMapsExample: string;
  contentsExample: string;
  physicalFrame: string;
}

export interface MmuAccessResult {
  action: MemoryAccessAction;
  processId: "P1" | "P2";
  virtualAddr: string;
  targetSegment: SegmentId | "none";
  requiredPerm: "r" | "w" | "x";
  pageTableMatch: string;
  physicalFrame: string | null;
  outcome: MmuOutcome;
  explanation: string;
}

export function getProcessSegments(
  processId: "P1" | "P2",
  aslrEnabled: boolean,
): ProcessSegmentInfo[] {
  const shift = aslrEnabled ? 0x12000 : 0;
  const hex = (base: number) => "0x" + (base + shift).toString(16).toUpperCase().padStart(6, "0");
  const isP1 = processId === "P1";

  return [
    {
      id: "stack",
      name: "Stack (Pile d'appels)",
      permissions: "rw-p",
      virtualRange: `${hex(0x7fe000)}–${hex(0x7fffff)}`,
      growth: "down",
      procMapsExample: `${(0x7fe000 + shift).toString(16)}-${(0x7fffff + shift).toString(16)} rw-p 00000000 00:00 0 [stack]`,
      contentsExample:
        "Trames d'activation, RSP/RBP, adresses de retour, variables locales automatiques.",
      physicalFrame: isP1 ? "RAM 0x0C4000" : "RAM 0x1F8000",
    },
    {
      id: "mmap",
      name: "Zone mmap & bibliothèques",
      permissions: "r-xp / rw-p",
      virtualRange: `${hex(0x700000)}–${hex(0x708fff)}`,
      growth: "down",
      procMapsExample: `${(0x700000 + shift).toString(16)}-${(0x708fff + shift).toString(16)} r-xp 00000000 08:01 /lib/x86_64-linux-gnu/libc.so.6`,
      contentsExample:
        "Bibliothèques partagées (libc), grands blocs malloc(>=128 Ko), fichiers mappés.",
      physicalFrame: isP1 ? "RAM 0x055000 (partagé)" : "RAM 0x055000 (partagé)",
    },
    {
      id: "heap",
      name: "Heap (Tas dynamique)",
      permissions: "rw-p",
      virtualRange: `${hex(0x602000)}–${hex(0x623fff)}`,
      growth: "up",
      procMapsExample: `${(0x602000 + shift).toString(16)}-${(0x623fff + shift).toString(16)} rw-p 00000000 00:00 0 [heap]`,
      contentsExample:
        "Allocations dynamiques gérées par l'allocateur (malloc/new/Box), croissant via brk/sbrk.",
      physicalFrame: isP1 ? "RAM 0x08B000" : "RAM 0x142000",
    },
    {
      id: "data-bss",
      name: "Data & BSS",
      permissions: "rw-p",
      virtualRange: `${hex(0x404000)}–${hex(0x405fff)}`,
      growth: "fixed",
      procMapsExample: `${(0x404000 + shift).toString(16)}-${(0x405fff + shift).toString(16)} rw-p 00004000 08:01 /usr/bin/app`,
      contentsExample:
        "Data : variables globales initialisées. BSS : globales non initialisées (mises à zéro).",
      physicalFrame: isP1 ? "RAM 0x04A000" : "RAM 0x119000",
    },
    {
      id: "rodata",
      name: "Rodata (Constantes)",
      permissions: "r--p",
      virtualRange: `${hex(0x402000)}–${hex(0x402fff)}`,
      growth: "fixed",
      procMapsExample: `${(0x402000 + shift).toString(16)}-${(0x402fff + shift).toString(16)} r--p 00002000 08:01 /usr/bin/app`,
      contentsExample: 'Littéraux de chaînes ("Hello") et constantes en lecture seule.',
      physicalFrame: isP1 ? "RAM 0x031000" : "RAM 0x031000 (RO partagé)",
    },
    {
      id: "text",
      name: "Text (Code machine)",
      permissions: "r-xp",
      virtualRange: `${hex(0x401000)}–${hex(0x401fff)}`,
      growth: "fixed",
      procMapsExample: `${(0x401000 + shift).toString(16)}-${(0x401fff + shift).toString(16)} r-xp 00001000 08:01 /usr/bin/app`,
      contentsExample: "Instructions machine exécutables (main, compute, helper), non modifiables.",
      physicalFrame: isP1 ? "RAM 0x02F000" : "RAM 0x091000 (ou copie privée)",
    },
  ];
}

export function simulateMemoryAccess(
  action: MemoryAccessAction,
  processId: "P1" | "P2",
  aslrEnabled: boolean,
): MmuAccessResult {
  const shift = aslrEnabled ? 0x12000 : 0;
  const fmt = (base: number) => "0x" + (base + shift).toString(16).toUpperCase().padStart(6, "0");

  switch (action) {
    case "read-text": {
      const addr = fmt(0x401040);
      const frame = processId === "P1" ? "0x02F040" : "0x091040";
      return {
        action,
        processId,
        virtualAddr: addr,
        targetSegment: "text",
        requiredPerm: "r",
        pageTableMatch: `Page ${fmt(0x401000)} (r-x) -> Cadre ${processId === "P1" ? "0x02F000" : "0x091000"}`,
        physicalFrame: frame,
        outcome: "translating_valid",
        explanation: `Accès autorisé : dans ${processId}, l'adresse virtuelle ${addr} est traduite par la MMU vers le cadre physique isolé ${frame} (droit r=1).`,
      };
    }
    case "write-text": {
      const addr = fmt(0x401040);
      return {
        action,
        processId,
        virtualAddr: addr,
        targetSegment: "text",
        requiredPerm: "w",
        pageTableMatch: `Page ${fmt(0x401000)} : r=1, w=0, x=1 (Violation w=0)`,
        physicalFrame: null,
        outcome: "sigsegv_permission_denied",
        explanation: `SIGSEGV (faute de protection) : tentative d'écriture sur ${addr} dans le segment Text où le bit w vaut 0.`,
      };
    }
    case "alloc-heap": {
      const addr = fmt(0x614000);
      const frame = processId === "P1" ? "0x0D3000" : "0x1A7000";
      return {
        action,
        processId,
        virtualAddr: addr,
        targetSegment: "heap",
        requiredPerm: "w",
        pageTableMatch: `Page virtuelle réservée -> Demand Paging -> Cadre ${frame} (rw-)`,
        physicalFrame: frame,
        outcome: "demand_page_fault_resolved",
        explanation: `Défaut de page mineur légitime : la page ${addr} du tas était réservée sans cadre RAM ; le noyau alloue paresseusement le cadre ${frame}.`,
      };
    }
    case "exec-stack": {
      const addr = fmt(0x7ff800);
      return {
        action,
        processId,
        virtualAddr: addr,
        targetSegment: "stack",
        requiredPerm: "x",
        pageTableMatch: `Page ${fmt(0x7ff000)} : r=1, w=1, x=0 (NX / DEP actif)`,
        physicalFrame: null,
        outcome: "sigsegv_permission_denied",
        explanation: `SIGSEGV (NX/DEP) : tentative d'exécuter des octets dans la pile (${addr}), bloquée car le bit x vaut 0.`,
      };
    }
    case "access-unmapped": {
      return {
        action,
        processId,
        virtualAddr: "0x000000",
        targetSegment: "none",
        requiredPerm: "r",
        pageTableMatch: "Aucune entrée VMA pour 0x000000 (Page Zéro / NULL non mappée)",
        physicalFrame: null,
        outcome: "sigsegv_unmapped",
        explanation:
          "SIGSEGV (déréférencement NULL) : la page virtuelle 0x000000 n'est jamais mappée afin que tout déréférencement de pointeur nul échoue immédiatement.",
      };
    }
  }
}
