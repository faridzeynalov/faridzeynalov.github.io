import { Link } from "@/i18n/navigation";
import { LOGO_PATH, LOGO_VIEWBOX } from "@/components/layout/logo-path";
import { useTranslations } from "next-intl";
import { owner } from "@/data/owner";
import { cn } from "@/lib/utils";

/** The FZ monogram. Uses the current text colour, so it follows the theme. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} aria-hidden className={cn("h-7 w-auto fill-current", className)}>
      <path d={LOGO_PATH} />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  const t = useTranslations("Nav");
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5 rounded-lg", className)}
      aria-label={t("homeLink", { name: owner.name })}
    >
      <LogoMark className="transition-transform duration-500 ease-out-expo group-hover:-rotate-6" />
      <span className="hidden text-[15px] font-semibold tracking-tight sm:inline">
        {owner.name}
        <span className="text-accent">.</span>
      </span>
    </Link>
  );
}
