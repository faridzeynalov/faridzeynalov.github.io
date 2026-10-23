import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LocalTime } from "@/components/layout/local-time";
import { LogoMark } from "@/components/layout/logo";
import { useTranslations } from "next-intl";
import { getProfile } from "@/data/profile";
import { useAppLocale } from "@/i18n/use-app-locale";
import { navItems } from "@/lib/site";

export function SiteFooter() {
  const t = useTranslations("Footer");
  const tn = useTranslations("Nav");
  const profile = getProfile(useAppLocale());
  const city = profile.location.split(",")[0];
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border print:hidden">
      <div className="container-page grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <LogoMark />
          <p className="max-w-xs text-sm text-pretty text-fg-muted">
            {t("tagline", { role: profile.role, location: profile.location })}
          </p>
          <p className="inline-flex items-center gap-2 font-mono text-xs text-fg-subtle">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
            {city} <LocalTime /> <span aria-hidden>·</span> GMT+4
          </p>
        </div>

        <nav aria-label={tn("footer")}>
          <p className="mb-4 font-mono text-xs text-fg-subtle uppercase">{t("pages")}</p>
          <ul className="space-y-2.5 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-fg-muted transition-colors hover:text-fg">
                  {tn(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="mb-4 font-mono text-xs text-fg-subtle uppercase">{t("elsewhere")}</p>
          <ul className="space-y-2.5 text-sm">
            {profile.social.map((link) => {
              const external = link.href.startsWith("http");
              return (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="group inline-flex items-center gap-1 text-fg-muted transition-colors hover:text-fg"
                  >
                    {t(link.label)}
                    {external && (
                      <ArrowUpRight
                        className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="container-page flex flex-col gap-2 border-t border-border py-6 font-mono text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {profile.name}
        </p>
        <p>{t("builtWith")}</p>
      </div>

      {/* Oversized outlined wordmark — a quiet sign-off. */}
      <p
        aria-hidden
        className="pointer-events-none container-page -mb-[0.24em] text-[clamp(4rem,17vw,15rem)] leading-none font-semibold tracking-[-0.06em] text-transparent select-none [-webkit-text-stroke:1px_var(--border-strong)]"
      >
        {profile.name.split(" ")[1].toLowerCase()}
      </p>
    </footer>
  );
}
