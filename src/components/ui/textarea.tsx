import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-md border border-steel-700 bg-void-900/80 px-3 py-2 text-sm text-steel-100 placeholder:text-steel-500 transition-colors focus-visible:outline-none focus-visible:border-secure/70 focus-visible:ring-1 focus-visible:ring-secure/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
