import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils.js";

const editorialCalloutVariants = cva(
  "relative ml-3 mt-5 rounded-2xl border px-7 py-4 text-[15.5px] leading-[1.72] text-[#e7ede5]",
  {
    variants: {
      variant: {
        information: "border-[#26384a] bg-[#14202b]",
        question: "border-[#2c332d] bg-[#181c19]",
        warning: "border-[#4a3922] bg-[#221b12]",
        error: "border-[#4e242d] bg-[#241217]",
      },
    },
    defaultVariants: {
      variant: "information",
    },
  },
);

type CalloutVariant = NonNullable<VariantProps<typeof editorialCalloutVariants>["variant"]>;

const CALLOUT_META: Record<
  CalloutVariant,
  { defaultLabel: string; accentClass: string; badgeClass: string }
> = {
  information: {
    defaultLabel: "Repère",
    accentClass: "text-[#84c5f4]",
    badgeClass: "bg-[#68b8ea] text-[#0c1218]",
  },
  question: {
    defaultLabel: "Question fréquente",
    accentClass: "text-[#b6c0b8]",
    badgeClass: "bg-[#8d9990] text-[#101312]",
  },
  warning: {
    defaultLabel: "Point de vigilance",
    accentClass: "text-[#f3b664]",
    badgeClass: "bg-[#f3a34a] text-[#101312]",
  },
  error: {
    defaultLabel: "Erreur fréquente",
    accentClass: "text-[#f08b9a]",
    badgeClass: "bg-[#ea6d82] text-[#101312]",
  },
};

function CalloutGlyph({ variant }: { variant: CalloutVariant }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (variant === "question") {
    return (
      <svg {...common}>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    );
  }
  if (variant === "warning") {
    return (
      <svg {...common}>
        <path d="M12 6.5v6.5" />
        <path d="M12 17.5h.01" />
      </svg>
    );
  }
  if (variant === "error") {
    return (
      <svg {...common}>
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 17v-5" />
      <path d="M12 7.5h.01" />
    </svg>
  );
}

export interface EditorialCalloutProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof editorialCalloutVariants> {
  variant?: CalloutVariant;
  title?: string;
  label?: string;
}

export function EditorialCallout({
  variant = "information",
  title,
  label,
  className,
  children,
  ...props
}: EditorialCalloutProps) {
  const meta = CALLOUT_META[variant];
  const roleLabel = label ?? meta.defaultLabel;
  const trimmedTitle = (title ?? "").trim();
  const showTitle =
    trimmedTitle.length > 0 && trimmedTitle.toLowerCase() !== roleLabel.trim().toLowerCase();

  return (
    <aside
      aria-label={showTitle ? `${roleLabel} : ${trimmedTitle}` : roleLabel}
      className={cn(editorialCalloutVariants({ variant }), className)}
      {...props}
    >
      <span
        className={cn(
          "absolute -left-3 -top-3 inline-flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-[#101312]",
          meta.badgeClass,
        )}
      >
        <CalloutGlyph variant={variant} />
      </span>
      <div className="min-w-0 max-w-[68ch] space-y-1.5">
        {showTitle ? (
          <p className="text-[15.5px] font-semibold leading-snug text-[#f5f7f0]">{trimmedTitle}</p>
        ) : null}
        <div className="space-y-2 text-[15px] leading-[1.7] text-[#dce4dc]">{children}</div>
      </div>
    </aside>
  );
}
