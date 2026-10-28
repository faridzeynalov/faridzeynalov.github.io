import { Braces, Layers, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Accent, SectionHeading } from "@/components/sections/section-heading";
import { useTranslations } from "next-intl";
import { getContent } from "@/content";
import { useProfile } from "@/data/profile";
import { cn, toFileName } from "@/lib/utils";

const icons: LucideIcon[] = [Braces, Layers, ShieldCheck, Wrench];

export function Skills() {
  const t = useTranslations("Skills");
  const profile = useProfile();
  return (
    <section aria-labelledby="skills-title" className="relative py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          id="skills-title"
          index="03"
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("title")} <Accent>{t("accent")}</Accent>
            </>
          }
          description={t("description")}
        />

        <Stagger className="mt-14 grid gap-3 md:grid-cols-6" stagger={0.1}>
          {profile.skills.map((group, index) => {
            const Icon = icons[index % icons.length];
            const wide = index === 1 || index === 3;
            return (
              <StaggerItem
                key={group.title}
                file={toFileName(getContent("en").profile.skills[index].title, "ts")}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border bg-bg-elevated p-6 transition-colors duration-500 hover:border-border-strong md:p-7 dev:pt-14 dev:md:pt-15",
                  wide ? "md:col-span-4" : "md:col-span-2",
                )}
              >
                <div
                  className="pointer-events-none absolute -top-36 -right-36 size-80 opacity-0 transition-opacity duration-700 [--glow-strength:15%] glow group-hover:opacity-100"
                  aria-hidden
                />
                <div className="relative flex items-start justify-between gap-4">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-bg-subtle text-fg-muted transition-colors group-hover:text-accent">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <span className="font-mono text-xs text-fg-subtle">
                    {t("items", { count: group.items.length })}
                  </span>
                </div>
                <h3 className="relative mt-6 text-lg font-semibold tracking-tight">
                  {group.title}
                </h3>
                <p className="relative mt-1 text-sm text-fg-muted">{group.description}</p>
                <ul className="relative mt-5 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-border bg-bg-subtle/60 px-3 py-1.5 text-[13px] text-fg transition-colors hover:border-border-strong"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
