import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[11px] font-medium tracking-wider",
  {
    variants: {
      variant: {
        default: "border-steel-700 bg-void-800 text-steel-100",
        secure: "border-secure/50 bg-secure/10 text-secure-glow",
        breach: "border-breach/50 bg-breach/10 text-breach-glow",
        amber: "border-amber/50 bg-amber/10 text-amber",
        outline: "border-steel-700 text-steel-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
