import Link from "next/link";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

/** Typographic monogram: "FZ" drawn as strokes in a rounded tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" className="fill-fg" />
      <path
        d="M9.5 10.5h7M9.5 10.5v11M9.5 16h5.5M18.5 10.5h5l-5 11h5"
        className="stroke-bg"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5 rounded-lg", className)}
      aria-label={`${profile.name} — home`}
    >
      <LogoMark className="transition-transform duration-500 ease-out-expo group-hover:-rotate-6" />
      <span className="hidden text-[15px] font-semibold tracking-tight sm:inline">
        {profile.name}
        <span className="text-accent">.</span>
      </span>
    </Link>
  );
}
