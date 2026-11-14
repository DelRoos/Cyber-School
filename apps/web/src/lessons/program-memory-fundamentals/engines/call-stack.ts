export type CallStackScenarioId = "nested-calls" | "dangling-pointer" | "stack-overflow";

export type StackSlotStatus = "active" | "freed-residual" | "overwritten" | "guard-page";

export interface StackSlot {
  addr: string;
  frameOwner: string;
  role: "arg" | "ret-addr" | "saved-rbp" | "local" | "guard";
  label: string;
  value: string;
  status: StackSlotStatus;
}

export interface PointerArrowState {
  fromVar: string;
  fromAddr: string;
  toAddr: string;
  targetValue: string;
  status: "valid" | "dangling-residual" | "corrupted-overwritten";
}

export interface CallStackStep {
  stepIndex: number;
  activeLine: number;
  codeLines: string[];
  activeFunction: string;
  rsp: string;
  rbp: string;
  rip: string;
  abiNotes: string;
  slots: StackSlot[];
  pointerArrow: PointerArrowState | null;
  hazard: "none" | "dangling-read" | "dangling-overwritten" | "stack-overflow";
  explanation: string;
}

const NESTED_CODE = [
  "1: int main() { int a = 10; return compute(a); }",
  "2: int compute(int x) { int y = x * 2; return helper(y); }",
  "3: int helper(int z) { int tmp = z + 1; return tmp; }",
  "4: // Retour vers compute -> retour vers main -> appel probe()",
  "5: int probe() { int uninit; /* lit l'ancienne case ! */ }",
];

const DANGLING_CODE = [
  "1: int* make_bad_ptr() { int local = 42; return &local; }",
  "2: int main() { int* p = make_bad_ptr(); /* local hors pile ! */",
  "3:   read_value(*p); /* semble valoir 42 par hasard */",
  "4:   log_msg(0xDEAD); /* réutilise la même zone pile */",
  "5:   read_value(*p); /* lit 0xDEAD corrompu ! */ }",
];

const OVERFLOW_CODE = [
  "1: void recurse(int n) {",
  "2:   int buf[64]; // consomme une nouvelle trame par appel",
  "3:   recurse(n + 1); // aucun cas d'arrêt !",
  "4: }",
];

export function getCallStackSteps(
  scenario: CallStackScenarioId,
  recursiveTargetDepth = 4,
): CallStackStep[] {
  if (scenario === "dangling-pointer") {
    return [
      {
        stepIndex: 0,
        activeLine: 1,
        codeLines: DANGLING_CODE,
        activeFunction: "make_bad_ptr",
        rsp: "0x7FC8",
        rbp: "0x7FD8",
        rip: "0x401124",
        abiNotes: "make_bad_ptr() active : local=42 est logée à 0x7FC8 dans sa trame.",
        slots: [
          {
            addr: "0x7FE8",
            frameOwner: "main",
            role: "local",
            label: "int* p",
            value: "(en attente)",
            status: "active",
          },
          {
            addr: "0x7FE0",
            frameOwner: "make_bad_ptr",
            role: "ret-addr",
            label: "RIP retour",
            value: "0x401208",
            status: "active",
          },
          {
            addr: "0x7FD8",
            frameOwner: "make_bad_ptr",
            role: "saved-rbp",
            label: "Ancien RBP",
            value: "0x7FF0",
            status: "active",
          },
          {
            addr: "0x7FC8",
            frameOwner: "make_bad_ptr",
            role: "local",
            label: "int local",
            value: "42 (0x0000002A)",
            status: "active",
          },
        ],
        pointerArrow: null,
        hazard: "none",
        explanation:
          "make_bad_ptr() s'exécute : sa variable locale `local = 42` occupe légitimement l'adresse 0x7FC8.",
      },
      {
        stepIndex: 1,
        activeLine: 2,
        codeLines: DANGLING_CODE,
        activeFunction: "main",
        rsp: "0x7FE8",
        rbp: "0x7FF0",
        rip: "0x401208",
        abiNotes: "RAX retourne 0x7FC8. RET remonte RSP à 0x7FE8 en O(1) sans effacer 0x7FC8.",
        slots: [
          {
            addr: "0x7FE8",
            frameOwner: "main",
            role: "local",
            label: "int* p",
            value: "0x7FC8",
            status: "active",
          },
          {
            addr: "0x7FE0",
            frameOwner: "ex-make_bad_ptr",
            role: "ret-addr",
            label: "(ex RIP retour)",
            value: "0x401208",
            status: "freed-residual",
          },
          {
            addr: "0x7FD8",
            frameOwner: "ex-make_bad_ptr",
            role: "saved-rbp",
            label: "(ex RBP)",
            value: "0x7FF0",
            status: "freed-residual",
          },
          {
            addr: "0x7FC8",
            frameOwner: "ex-make_bad_ptr",
            role: "local",
            label: "(ex int local)",
            value: "42 (résiduel)",
            status: "freed-residual",
          },
        ],
        pointerArrow: {
          fromVar: "main.p",
          fromAddr: "0x7FE8",
          toAddr: "0x7FC8",
          targetValue: "42 (hors trame !)",
          status: "dangling-residual",
        },
        hazard: "dangling-read",
        explanation:
          "Dès RET, `0x7FC8` sort de la pile active (`0x7FC8 < RSP`). `p` est déjà un pointeur pendant, même si 42 est encore lisible par hasard !",
      },
      {
        stepIndex: 2,
        activeLine: 4,
        codeLines: DANGLING_CODE,
        activeFunction: "log_msg",
        rsp: "0x7FC8",
        rbp: "0x7FD8",
        rip: "0x401310",
        abiNotes: "RDI = 0xDEAD passé selon System V ABI puis sauvegardé dans la trame de log_msg.",
        slots: [
          {
            addr: "0x7FE8",
            frameOwner: "main",
            role: "local",
            label: "int* p",
            value: "0x7FC8",
            status: "active",
          },
          {
            addr: "0x7FE0",
            frameOwner: "log_msg",
            role: "ret-addr",
            label: "RIP retour",
            value: "0x401220",
            status: "active",
          },
          {
            addr: "0x7FD8",
            frameOwner: "log_msg",
            role: "saved-rbp",
            label: "Ancien RBP",
            value: "0x7FF0",
            status: "active",
          },
          {
            addr: "0x7FC8",
            frameOwner: "log_msg",
            role: "local",
            label: "int code",
            value: "0x0000DEAD",
            status: "overwritten",
          },
        ],
        pointerArrow: {
          fromVar: "main.p",
          fromAddr: "0x7FE8",
          toAddr: "0x7FC8",
          targetValue: "0xDEAD (ÉCRASÉE !)",
          status: "corrupted-overwritten",
        },
        hazard: "dangling-overwritten",
        explanation:
          "CORRUPTION : l'appel à `log_msg(0xDEAD)` réutilise exactement les adresses sous RSP et écrase `0x7FC8` avec `0xDEAD`. `*p` lit désormais une donnée étrangère.",
      },
    ];
  }

  if (scenario === "stack-overflow") {
    const cappedDepth = Math.max(2, Math.min(6, recursiveTargetDepth));
    const steps: CallStackStep[] = [];
    for (let d = 1; d <= cappedDepth; d++) {
      const isOverflow = d === cappedDepth && cappedDepth >= 5;
      const slots: StackSlot[] = [];
      for (let f = 1; f <= Math.min(d, 4); f++) {
        const base = 0x7ff0 - (f - 1) * 0x20;
        const hex = (n: number) => "0x" + n.toString(16).toUpperCase();
        slots.push(
          {
            addr: hex(base),
            frameOwner: `recurse(${f})`,
            role: "ret-addr",
            label: `RIP retour #${f}`,
            value: f === 1 ? "0x401090" : "0x401188",
            status: "active",
          },
          {
            addr: hex(base - 0x10),
            frameOwner: `recurse(${f})`,
            role: "local",
            label: `n=${f} + buf`,
            value: "32 octets",
            status: "active",
          },
        );
      }
      if (isOverflow) {
        slots.push({
          addr: "0x7F50",
          frameOwner: "Guard Page",
          role: "guard",
          label: "PAGE GARDE (---p)",
          value: "SIGSEGV Stack Overflow",
          status: "guard-page",
        });
      }
      const rspAddr = isOverflow
        ? "0x7F50"
        : "0x" + (0x7ff0 - (d - 1) * 0x20 - 0x10).toString(16).toUpperCase();
      steps.push({
        stepIndex: d - 1,
        activeLine: isOverflow ? 3 : 2,
        codeLines: OVERFLOW_CODE,
        activeFunction: `recurse(${d})`,
        rsp: rspAddr,
        rbp: "0x" + (0x7ff0 - (d - 1) * 0x20).toString(16).toUpperCase(),
        rip: "0x401180",
        abiNotes: `Profondeur ${d} : chaque appel consomme une nouvelle trame vers les adresses décroissantes.`,
        slots,
        pointerArrow: null,
        hazard: isOverflow ? "stack-overflow" : "none",
        explanation: isOverflow
          ? "STACK OVERFLOW (SIGSEGV) : RSP atteint la Guard Page protégée en bas du segment de pile. Le processus est arrêté avant de corrompre une autre région."
          : `Appel récursif recurse(${d}) : RSP descend à ${rspAddr}. La pile croît vers le bas sans libérer les trames précédentes.`,
      });
    }
    return steps;
  }

  // Default: "nested-calls"
  return [
    {
      stepIndex: 0,
      activeLine: 1,
      codeLines: NESTED_CODE,
      activeFunction: "main",
      rsp: "0x7FE8",
      rbp: "0x7FF0",
      rip: "0x401020",
      abiNotes: "Prologue de main : RSP aligné à 16 octets avant tout CALL.",
      slots: [
        {
          addr: "0x7FF0",
          frameOwner: "main",
          role: "saved-rbp",
          label: "Base main (RBP)",
          value: "0x7FF8",
          status: "active",
        },
        {
          addr: "0x7FE8",
          frameOwner: "main",
          role: "local",
          label: "int a",
          value: "10",
          status: "active",
        },
      ],
      pointerArrow: null,
      hazard: "none",
      explanation:
        "main() crée sa trame à 0x7FF0 et stocke `a = 10` en 0x7FE8. RDI reçoit `10` pour appeler compute(10).",
    },
    {
      stepIndex: 1,
      activeLine: 2,
      codeLines: NESTED_CODE,
      activeFunction: "compute",
      rsp: "0x7FC8",
      rbp: "0x7FD8",
      rip: "0x401084",
      abiNotes:
        "RDI=10 (System V ABI) ; CALL empile RIP_retour=0x401032 puis prologue abaisse RSP.",
      slots: [
        {
          addr: "0x7FF0",
          frameOwner: "main",
          role: "saved-rbp",
          label: "Base main (RBP)",
          value: "0x7FF8",
          status: "active",
        },
        {
          addr: "0x7FE8",
          frameOwner: "main",
          role: "local",
          label: "int a",
          value: "10",
          status: "active",
        },
        {
          addr: "0x7FE0",
          frameOwner: "compute",
          role: "ret-addr",
          label: "RIP retour -> main",
          value: "0x401032",
          status: "active",
        },
        {
          addr: "0x7FD8",
          frameOwner: "compute",
          role: "saved-rbp",
          label: "Ancien RBP",
          value: "0x7FF0",
          status: "active",
        },
        {
          addr: "0x7FC8",
          frameOwner: "compute",
          role: "local",
          label: "int y",
          value: "20",
          status: "active",
        },
      ],
      pointerArrow: null,
      hazard: "none",
      explanation:
        "CALL empile l'adresse de retour 0x401032, puis compute() sauvegarde l'ancien RBP et calcule `y = 20` en 0x7FC8.",
    },
    {
      stepIndex: 2,
      activeLine: 3,
      codeLines: NESTED_CODE,
      activeFunction: "helper",
      rsp: "0x7FA8",
      rbp: "0x7FB8",
      rip: "0x4010E0",
      abiNotes: "RDI=20 ; RSP descend à 0x7FA8 pour accueillir la trame de helper().",
      slots: [
        {
          addr: "0x7FF0",
          frameOwner: "main",
          role: "saved-rbp",
          label: "Base main",
          value: "0x7FF8",
          status: "active",
        },
        {
          addr: "0x7FE8",
          frameOwner: "main",
          role: "local",
          label: "int a",
          value: "10",
          status: "active",
        },
        {
          addr: "0x7FE0",
          frameOwner: "compute",
          role: "ret-addr",
          label: "RIP retour -> main",
          value: "0x401032",
          status: "active",
        },
        {
          addr: "0x7FD8",
          frameOwner: "compute",
          role: "saved-rbp",
          label: "Ancien RBP",
          value: "0x7FF0",
          status: "active",
        },
        {
          addr: "0x7FC8",
          frameOwner: "compute",
          role: "local",
          label: "int y",
          value: "20",
          status: "active",
        },
        {
          addr: "0x7FC0",
          frameOwner: "helper",
          role: "ret-addr",
          label: "RIP retour -> compute",
          value: "0x40109A",
          status: "active",
        },
        {
          addr: "0x7FB8",
          frameOwner: "helper",
          role: "saved-rbp",
          label: "Ancien RBP",
          value: "0x7FD8",
          status: "active",
        },
        {
          addr: "0x7FA8",
          frameOwner: "helper",
          role: "local",
          label: "int tmp",
          value: "21 (0x0015)",
          status: "active",
        },
      ],
      pointerArrow: null,
      hazard: "none",
      explanation:
        "3 trames coexistent sur la pile sans conflit : `helper` calcule `tmp = 21` en `0x7FA8` et retourne `21` dans `RAX`.",
    },
    {
      stepIndex: 3,
      activeLine: 5,
      codeLines: NESTED_CODE,
      activeFunction: "probe",
      rsp: "0x7FC8",
      rbp: "0x7FD8",
      rip: "0x401140",
      abiNotes:
        "Après RET de compute et helper, RSP est remonté en O(1). probe() occupe l'ancien emplacement.",
      slots: [
        {
          addr: "0x7FF0",
          frameOwner: "main",
          role: "saved-rbp",
          label: "Base main",
          value: "0x7FF8",
          status: "active",
        },
        {
          addr: "0x7FE8",
          frameOwner: "main",
          role: "local",
          label: "int a",
          value: "10",
          status: "active",
        },
        {
          addr: "0x7FE0",
          frameOwner: "probe",
          role: "ret-addr",
          label: "RIP retour -> main",
          value: "0x401050",
          status: "active",
        },
        {
          addr: "0x7FD8",
          frameOwner: "probe",
          role: "saved-rbp",
          label: "Ancien RBP",
          value: "0x7FF0",
          status: "active",
        },
        {
          addr: "0x7FC8",
          frameOwner: "probe",
          role: "local",
          label: "int uninit (non initialisée !)",
          value: "20 (résidu de compute.y !)",
          status: "active",
        },
        {
          addr: "0x7FA8",
          frameOwner: "ex-helper",
          role: "local",
          label: "(ex int tmp)",
          value: "21 (résiduel hors trame)",
          status: "freed-residual",
        },
      ],
      pointerArrow: null,
      hazard: "none",
      explanation:
        "Les octets ne sont pas remis à zéro après RET ! `probe()` hérite au même décalage `0x7FC8` de l'ancienne valeur `20` (comportement indéfini si lue sans initialisation).",
    },
  ];
}
