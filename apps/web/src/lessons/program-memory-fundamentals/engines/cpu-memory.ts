export type CpuPhase = "IDLE" | "FETCH" | "DECODE" | "EXECUTE" | "UPDATE_RIP" | "HALTED";

export type CpuPresetId = "load-and-add" | "conditional-jump" | "little-endian-write";

export interface CpuInstructionSlot {
  addr: string;
  asm: string;
  sizeBytes: number;
}

export interface CpuStepSnapshot {
  stepIndex: number;
  phase: CpuPhase;
  rip: string;
  ir: string;
  rax: string;
  rbx: string;
  zf: 0 | 1;
  activeInstructionAddr: string | null;
  busDirection: "idle" | "fetch-read" | "data-read" | "data-write";
  busAddr: string | null;
  busData: string | null;
  memoryBytes: Record<string, string>;
  highlightedBytes: string[];
  int32Group: {
    baseAddr: string;
    valueHex: string;
    bytes: [string, string, string, string];
  } | null;
  explanation: string;
}

export const CPU_INSTRUCTIONS: Record<CpuPresetId, CpuInstructionSlot[]> = {
  "load-and-add": [
    { addr: "0x0040", asm: "MOV EAX, [0x1008]", sizeBytes: 4 },
    { addr: "0x0044", asm: "ADD EAX, 0x05", sizeBytes: 4 },
    { addr: "0x0048", asm: "HLT", sizeBytes: 1 },
  ],
  "conditional-jump": [
    { addr: "0x0040", asm: "SUB EBX, EBX", sizeBytes: 2 },
    { addr: "0x0042", asm: "JZ 0x0050", sizeBytes: 4 },
    { addr: "0x0050", asm: "MOV EAX, 0x0000002A", sizeBytes: 5 },
  ],
  "little-endian-write": [
    { addr: "0x0040", asm: "MOV DWORD PTR [0x1008], val", sizeBytes: 4 },
    { addr: "0x0044", asm: "MOV EBX, [0x1008]", sizeBytes: 4 },
    { addr: "0x0048", asm: "HLT", sizeBytes: 1 },
  ],
};

export const PRESET_HEX_VALUES = ["0x12345678", "0x00000042", "0xAABBCCDD"] as const;
export type PresetHexValue = (typeof PRESET_HEX_VALUES)[number];

/**
 * Converts a 32-bit hex string into 4 x86-64 little-endian bytes without swapping nibbles inside a byte.
 */
export function toLittleEndianBytes32(hex32: string): [string, string, string, string] {
  const clean = hex32.replace(/^0x/i, "").toUpperCase().padStart(8, "0").slice(-8);
  return [clean.slice(6, 8), clean.slice(4, 6), clean.slice(2, 4), clean.slice(0, 2)];
}

function baseRam(): Record<string, string> {
  return {
    "0x1000": "00",
    "0x1001": "00",
    "0x1002": "00",
    "0x1003": "00",
    "0x1004": "0A",
    "0x1005": "00",
    "0x1006": "00",
    "0x1007": "00",
    "0x1008": "10",
    "0x1009": "00",
    "0x100A": "00",
    "0x100B": "00",
    "0x100C": "00",
    "0x100D": "00",
    "0x100E": "00",
    "0x100F": "00",
  };
}

export function getCpuSteps(
  preset: CpuPresetId,
  valueHex: PresetHexValue = "0x12345678",
): CpuStepSnapshot[] {
  const le = toLittleEndianBytes32(valueHex);

  if (preset === "little-endian-write") {
    const initialRam = baseRam();
    const writtenRam: Record<string, string> = {
      ...initialRam,
      "0x1008": le[0],
      "0x1009": le[1],
      "0x100A": le[2],
      "0x100B": le[3],
    };

    return [
      {
        stepIndex: 0,
        phase: "IDLE",
        rip: "0x0040",
        ir: "—",
        rax: "0x00000000",
        rbx: "0x00000000",
        zf: 0,
        activeInstructionAddr: null,
        busDirection: "idle",
        busAddr: null,
        busData: null,
        memoryBytes: initialRam,
        highlightedBytes: [],
        int32Group: {
          baseAddr: "0x1008",
          valueHex: "0x00000010",
          bytes: ["10", "00", "00", "00"],
        },
        explanation: `État initial : RIP pointe sur 0x0040 en zone Code. Prêt à écrire ${valueHex} à l'adresse 0x1008.`,
      },
      {
        stepIndex: 1,
        phase: "FETCH",
        rip: "0x0040",
        ir: "MOV [0x1008], " + valueHex,
        rax: "0x00000000",
        rbx: "0x00000000",
        zf: 0,
        activeInstructionAddr: "0x0040",
        busDirection: "fetch-read",
        busAddr: "0x0040",
        busData: "OPCODE MOV [mem32], imm32",
        memoryBytes: initialRam,
        highlightedBytes: [],
        int32Group: {
          baseAddr: "0x1008",
          valueHex: "0x00000010",
          bytes: ["10", "00", "00", "00"],
        },
        explanation:
          "FETCH : le CPU place RIP (0x0040) sur le bus d'adresses et ramène l'instruction dans le registre IR.",
      },
      {
        stepIndex: 2,
        phase: "DECODE",
        rip: "0x0040",
        ir: "MOV [0x1008], " + valueHex,
        rax: "0x00000000",
        rbx: "0x00000000",
        zf: 0,
        activeInstructionAddr: "0x0040",
        busDirection: "idle",
        busAddr: "0x1008",
        busData: valueHex,
        memoryBytes: initialRam,
        highlightedBytes: ["0x1008", "0x1009", "0x100A", "0x100B"],
        int32Group: {
          baseAddr: "0x1008",
          valueHex: "0x00000010",
          bytes: ["10", "00", "00", "00"],
        },
        explanation: `DECODE : opérande cible = 4 octets contigus [0x1008..0x100B]. En little-endian, l'octet faible (${le[0]}) va à l'adresse la plus basse.`,
      },
      {
        stepIndex: 3,
        phase: "EXECUTE",
        rip: "0x0040",
        ir: "MOV [0x1008], " + valueHex,
        rax: "0x00000000",
        rbx: "0x00000000",
        zf: 0,
        activeInstructionAddr: "0x0040",
        busDirection: "data-write",
        busAddr: "0x1008..0x100B",
        busData: `${le[0]} ${le[1]} ${le[2]} ${le[3]}`,
        memoryBytes: writtenRam,
        highlightedBytes: ["0x1008", "0x1009", "0x100A", "0x100B"],
        int32Group: {
          baseAddr: "0x1008",
          valueHex,
          bytes: le,
        },
        explanation: `EXECUTE (Little-Endian) : écriture en RAM : 0x1008=${le[0]}, 0x1009=${le[1]}, 0x100A=${le[2]}, 0x100B=${le[3]}. Les chiffres dans chaque octet ne sont pas inversés.`,
      },
      {
        stepIndex: 4,
        phase: "UPDATE_RIP",
        rip: "0x0044",
        ir: "MOV [0x1008], " + valueHex,
        rax: "0x00000000",
        rbx: "0x00000000",
        zf: 0,
        activeInstructionAddr: "0x0044",
        busDirection: "idle",
        busAddr: null,
        busData: null,
        memoryBytes: writtenRam,
        highlightedBytes: [],
        int32Group: {
          baseAddr: "0x1008",
          valueHex,
          bytes: le,
        },
        explanation:
          "UPDATE RIP : RIP avance de +4 octets vers 0x0044 pour l'instruction suivante (MOV EBX, [0x1008]).",
      },
      {
        stepIndex: 5,
        phase: "EXECUTE",
        rip: "0x0044",
        ir: "MOV EBX, [0x1008]",
        rax: "0x00000000",
        rbx: valueHex,
        zf: 0,
        activeInstructionAddr: "0x0044",
        busDirection: "data-read",
        busAddr: "0x1008..0x100B",
        busData: valueHex,
        memoryBytes: writtenRam,
        highlightedBytes: ["0x1008", "0x1009", "0x100A", "0x100B"],
        int32Group: {
          baseAddr: "0x1008",
          valueHex,
          bytes: le,
        },
        explanation: `Relecture 32 bits : le CPU réassemble les 4 octets little-endian en ${valueHex} dans le registre EBX.`,
      },
      {
        stepIndex: 6,
        phase: "HALTED",
        rip: "0x0048",
        ir: "HLT",
        rax: "0x00000000",
        rbx: valueHex,
        zf: 0,
        activeInstructionAddr: "0x0048",
        busDirection: "idle",
        busAddr: null,
        busData: null,
        memoryBytes: writtenRam,
        highlightedBytes: [],
        int32Group: {
          baseAddr: "0x1008",
          valueHex,
          bytes: le,
        },
        explanation:
          "Fin de la séquence : la donnée 32 bits en RAM et le registre EBX correspondent.",
      },
    ];
  }

  if (preset === "conditional-jump") {
    const initialRam = baseRam();
    return [
      {
        stepIndex: 0,
        phase: "IDLE",
        rip: "0x0040",
        ir: "—",
        rax: "0x00000000",
        rbx: "0x00000009",
        zf: 0,
        activeInstructionAddr: null,
        busDirection: "idle",
        busAddr: null,
        busData: null,
        memoryBytes: initialRam,
        highlightedBytes: [],
        int32Group: null,
        explanation:
          "État initial : EBX = 9, Zero Flag ZF = 0, RIP = 0x0040. Prêt pour SUB EBX, EBX puis JZ 0x0050.",
      },
      {
        stepIndex: 1,
        phase: "FETCH",
        rip: "0x0040",
        ir: "SUB EBX, EBX",
        rax: "0x00000000",
        rbx: "0x00000009",
        zf: 0,
        activeInstructionAddr: "0x0040",
        busDirection: "fetch-read",
        busAddr: "0x0040",
        busData: "SUB EBX, EBX",
        memoryBytes: initialRam,
        highlightedBytes: [],
        int32Group: null,
        explanation: "FETCH : chargement de l'instruction à [RIP=0x0040] dans IR.",
      },
      {
        stepIndex: 2,
        phase: "EXECUTE",
        rip: "0x0040",
        ir: "SUB EBX, EBX",
        rax: "0x00000000",
        rbx: "0x00000000",
        zf: 1,
        activeInstructionAddr: "0x0040",
        busDirection: "idle",
        busAddr: null,
        busData: null,
        memoryBytes: initialRam,
        highlightedBytes: [],
        int32Group: null,
        explanation:
          "EXECUTE : EBX - EBX = 0 dans l'ALU interne (aucun accès RAM), le drapeau Zero Flag ZF passe à 1.",
      },
      {
        stepIndex: 3,
        phase: "FETCH",
        rip: "0x0042",
        ir: "JZ 0x0050",
        rax: "0x00000000",
        rbx: "0x00000000",
        zf: 1,
        activeInstructionAddr: "0x0042",
        busDirection: "fetch-read",
        busAddr: "0x0042",
        busData: "JZ 0x0050",
        memoryBytes: initialRam,
        highlightedBytes: [],
        int32Group: null,
        explanation:
          "FETCH / DECODE à 0x0042 : l'instruction JZ 0x0050 teste ZF. Comme ZF = 1, le saut est pris.",
      },
      {
        stepIndex: 4,
        phase: "UPDATE_RIP",
        rip: "0x0050",
        ir: "JZ 0x0050",
        rax: "0x00000000",
        rbx: "0x00000000",
        zf: 1,
        activeInstructionAddr: "0x0050",
        busDirection: "idle",
        busAddr: null,
        busData: null,
        memoryBytes: initialRam,
        highlightedBytes: [],
        int32Group: null,
        explanation:
          "UPDATE RIP (Saut) : RIP ne fait pas +4, il est directement remplacé par la cible 0x0050.",
      },
      {
        stepIndex: 5,
        phase: "HALTED",
        rip: "0x0055",
        ir: "MOV EAX, 0x0000002A",
        rax: "0x0000002A",
        rbx: "0x00000000",
        zf: 1,
        activeInstructionAddr: "0x0050",
        busDirection: "idle",
        busAddr: null,
        busData: null,
        memoryBytes: initialRam,
        highlightedBytes: [],
        int32Group: null,
        explanation:
          "Exécution reprise à 0x0050 : EAX reçoit 0x2A (42). Le branchement a redirigé le flot d'instructions via RIP.",
      },
    ];
  }

  // Default: "load-and-add"
  const ramWithSeed = {
    ...baseRam(),
    "0x1008": le[0],
    "0x1009": le[1],
    "0x100A": le[2],
    "0x100B": le[3],
  };
  const nextValNum = (Number.parseInt(valueHex, 16) + 5) >>> 0;
  const nextRax = "0x" + nextValNum.toString(16).toUpperCase().padStart(8, "0");

  return [
    {
      stepIndex: 0,
      phase: "IDLE",
      rip: "0x0040",
      ir: "—",
      rax: "0x00000000",
      rbx: "0x00000000",
      zf: 0,
      activeInstructionAddr: null,
      busDirection: "idle",
      busAddr: null,
      busData: null,
      memoryBytes: ramWithSeed,
      highlightedBytes: [],
      int32Group: {
        baseAddr: "0x1008",
        valueHex,
        bytes: le,
      },
      explanation: `État initial : RIP = 0x0040. La donnée ${valueHex} occupe les 4 octets 0x1008..0x100B en little-endian.`,
    },
    {
      stepIndex: 1,
      phase: "FETCH",
      rip: "0x0040",
      ir: "MOV EAX, [0x1008]",
      rax: "0x00000000",
      rbx: "0x00000000",
      zf: 0,
      activeInstructionAddr: "0x0040",
      busDirection: "fetch-read",
      busAddr: "0x0040",
      busData: "MOV EAX, [0x1008]",
      memoryBytes: ramWithSeed,
      highlightedBytes: [],
      int32Group: {
        baseAddr: "0x1008",
        valueHex,
        bytes: le,
      },
      explanation:
        "FETCH : le CPU lit d'abord l'instruction pointée par RIP (0x0040), pas encore la donnée 0x1008.",
    },
    {
      stepIndex: 2,
      phase: "DECODE",
      rip: "0x0040",
      ir: "MOV EAX, [0x1008]",
      rax: "0x00000000",
      rbx: "0x00000000",
      zf: 0,
      activeInstructionAddr: "0x0040",
      busDirection: "idle",
      busAddr: "0x1008",
      busData: null,
      memoryBytes: ramWithSeed,
      highlightedBytes: ["0x1008", "0x1009", "0x100A", "0x100B"],
      int32Group: {
        baseAddr: "0x1008",
        valueHex,
        bytes: le,
      },
      explanation:
        "DECODE : l'instruction décode une lecture de 4 octets depuis l'adresse opérande 0x1008 vers EAX.",
    },
    {
      stepIndex: 3,
      phase: "EXECUTE",
      rip: "0x0040",
      ir: "MOV EAX, [0x1008]",
      rax: valueHex,
      rbx: "0x00000000",
      zf: 0,
      activeInstructionAddr: "0x0040",
      busDirection: "data-read",
      busAddr: "0x1008..0x100B",
      busData: `${le[0]} ${le[1]} ${le[2]} ${le[3]} -> ${valueHex}`,
      memoryBytes: ramWithSeed,
      highlightedBytes: ["0x1008", "0x1009", "0x100A", "0x100B"],
      int32Group: {
        baseAddr: "0x1008",
        valueHex,
        bytes: le,
      },
      explanation: `EXECUTE : transfert RAM -> EAX. Les 4 octets sont lus et recomposés en ${valueHex}.`,
    },
    {
      stepIndex: 4,
      phase: "UPDATE_RIP",
      rip: "0x0044",
      ir: "ADD EAX, 0x05",
      rax: valueHex,
      rbx: "0x00000000",
      zf: 0,
      activeInstructionAddr: "0x0044",
      busDirection: "fetch-read",
      busAddr: "0x0044",
      busData: "ADD EAX, 0x05",
      memoryBytes: ramWithSeed,
      highlightedBytes: [],
      int32Group: {
        baseAddr: "0x1008",
        valueHex,
        bytes: le,
      },
      explanation:
        "UPDATE RIP puis FETCH suivant : RIP passe à 0x0044 pour exécuter ADD EAX, 0x05.",
    },
    {
      stepIndex: 5,
      phase: "HALTED",
      rip: "0x0048",
      ir: "HLT",
      rax: nextRax,
      rbx: "0x00000000",
      zf: 0,
      activeInstructionAddr: "0x0048",
      busDirection: "idle",
      busAddr: null,
      busData: null,
      memoryBytes: ramWithSeed,
      highlightedBytes: [],
      int32Group: {
        baseAddr: "0x1008",
        valueHex,
        bytes: le,
      },
      explanation: `EXECUTE (ALU) : EAX vaut désormais ${nextRax}. La RAM à 0x1008 reste inchangée car seul le registre a été modifié.`,
    },
  ];
}
