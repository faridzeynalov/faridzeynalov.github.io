import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BrowserFrameProps {
  domain: ReactNode;
  children: ReactNode;
  className?: string;
  /** Compact chrome for small cards. */
  compact?: boolean;
}

/** Minimal browser window chrome around a screenshot. */
export function BrowserFrame({ domain, children, className, compact = false }: BrowserFrameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border-strong bg-frame shadow-float",
        compact && "rounded-lg",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 border-b border-border bg-frame-bar px-3",
          compact ? "h-7" : "h-9",
        )}
      >
        <div className="flex gap-1.5" aria-hidden>
          {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
            <span
              key={color}
              className={cn("rounded-full opacity-80", compact ? "size-2" : "size-2.5")}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div
          className={cn(
            "mx-auto flex min-w-0 items-center gap-1.5 rounded-md bg-bg-inset/80 font-mono text-fg-muted",
            compact ? "h-4.5 px-2 text-[9.5px]" : "h-6 max-w-[60%] px-3 text-[11px]",
          )}
        >
          <Lock className={cn("shrink-0", compact ? "size-2" : "size-2.5")} aria-hidden />
          <span className="truncate">{domain}</span>
        </div>
        <div className={compact ? "w-8" : "w-12"} aria-hidden />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

/** Phone bezel around a mobile screenshot. */
export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    // The outer element is the size container; the bezel, corners and notch inside are sized in
    // container units, so small phones on mobile layouts keep the same proportions as large ones.
    <div className={cn("@container relative", className)}>
      <div className="rounded-[14cqw] border border-border-strong bg-frame p-[3.2cqw] shadow-float">
        <div className="relative overflow-hidden rounded-[11cqw]">
          {children}
          <span
            className="absolute top-[2.6cqw] left-1/2 h-[5.5cqw] w-[24cqw] -translate-x-1/2 rounded-full bg-black/85"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
