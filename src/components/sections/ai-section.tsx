import { Bot, Braces, MessagesSquare, Plug, Sparkles, type LucideIcon } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Accent, SectionHeading } from "@/components/sections/section-heading";
import { useTranslations } from "next-intl";
import { getContent } from "@/content";
import { getAi } from "@/data/ai";
import { useContentOverrides } from "@/lib/content-overrides";
import { useAppLocale } from "@/i18n/use-app-locale";
import { toFileName } from "@/lib/utils";
import type { AiIcon } from "@/types/content";

const icons: Record<AiIcon, LucideIcon> = {
  bot: Bot,
  plug: Plug,
  messages: MessagesSquare,
  braces: Braces,
};

export function AiSection() {
  const t = useTranslations("AiSection");
  const locale = useAppLocale();
  const ai = useContentOverrides().ai ?? getAi(locale);
  return (
    <section id="ai" aria-labelledby="ai-title" className="relative py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          id="ai-title"
          index="04"
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("title")} <Accent>{t("accent")}</Accent>
            </>
          }
          description={ai.intro}
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-12">
          {/* Tools panel with an animated accent border */}
          <Reveal className="lg:col-span-5">
            <div className="ai-border relative flex h-full flex-col overflow-hidden rounded-2xl p-7 md:p-8">
              <div
                className="pointer-events-none absolute -top-36 -left-36 size-96 [--glow-strength:15%] glow"
                aria-hidden
              />
              <span className="relative inline-flex size-12 items-center justify-center rounded-xl bg-accent text-accent-fg">
                <Sparkles className="size-6" aria-hidden />
              </span>
              <p className="relative mt-6 text-2xl leading-snug font-semibold tracking-tight text-balance">
                {t("panelTitle")}
              </p>
              <p className="relative mt-3 text-[15px] text-pretty text-fg-muted">
                {t("panelText")}
              </p>

              <h3 className="relative mt-auto pt-10 font-mono text-xs text-fg-subtle uppercase">
                {t("tools")}
              </h3>
              <Stagger as="ul" className="relative mt-4 flex flex-wrap gap-2" stagger={0.05}>
                {ai.tools.map((tool) => (
                  <StaggerItem
                    as="li"
                    key={tool}
                    className="rounded-lg border border-border bg-bg/80 px-3 py-1.5 font-mono text-[12.5px] text-fg"
                  >
                    {tool}
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </Reveal>

          {/* Capabilities */}
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-7" stagger={0.1}>
            {ai.capabilities.map((capability, index) => {
              const Icon = icons[capability.icon];
              return (
                <StaggerItem
                  key={capability.title}
                  file={toFileName(getContent("en").ai.capabilities[index].title, "md")}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-bg-elevated p-6 transition-colors duration-500 hover:border-border-strong md:p-7 dev:pt-14 dev:md:pt-15"
                >
                  <div
                    className="pointer-events-none absolute -right-32 -bottom-32 size-72 opacity-0 transition-opacity duration-700 [--glow-strength:15%] glow group-hover:opacity-100"
                    aria-hidden
                  />
                  <span className="relative inline-flex size-10 items-center justify-center rounded-xl border border-border bg-bg-subtle text-fg-muted transition-colors group-hover:text-accent">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <h3 className="relative mt-5 text-lg font-semibold tracking-tight">
                    {capability.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-pretty text-fg-muted">
                    {capability.description}
                  </p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
