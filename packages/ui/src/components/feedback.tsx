import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils.js";

const alertVariants = cva("relative w-full rounded-xl border p-4 text-sm", {
  variants: {
    variant: {
      default: "border-border bg-secondary/50 text-foreground",
      info: "border-primary/35 bg-primary/10 text-foreground",
      success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
      warning: "border-amber-500/40 bg-amber-500/10 text-amber-100",
      destructive: "border-rose-500/40 bg-rose-500/10 text-rose-100",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="status" className={cn(alertVariants({ variant }), className)} {...props} />;
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn("mb-1 font-semibold leading-none", className)} {...props} />;
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn("text-sm leading-relaxed opacity-90", className)} {...props} />;
}

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  label?: string;
}

export function Progress({ value, label, className, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label ?? "Progression"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-all duration-300 motion-reduce:transition-none motion-reduce:duration-0"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function Separator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("h-px w-full bg-border", className)} {...props} />;
}
