import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secure/60 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default: "bg-secure text-void-950 hover:bg-secure-glow shadow-glow-green/0 hover:shadow-glow-green",
        destructive: "bg-breach text-white hover:bg-breach-glow hover:shadow-glow-red",
        outline: "border border-steel-700 bg-transparent text-steel-100 hover:border-secure/60 hover:text-secure-glow",
        ghost: "text-steel-300 hover:bg-void-800 hover:text-steel-100",
        secondary: "bg-void-800 text-steel-100 border border-steel-700 hover:border-steel-500",
        amber: "bg-amber text-void-950 hover:brightness-110",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-sm px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
