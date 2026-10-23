import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border border-border bg-bg-subtle/70 px-2.5 py-0.5 font-mono text-[11.5px] leading-5 text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}
