import {
  ArrowRight,
  BellRing,
  Images,
  ListChecks,
  MessagesSquare,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Progress, StatusPill } from "@/components/portal/status";
import { Accent, SectionHeading } from "@/components/sections/section-heading";
import { buttonVariants } from "@/components/ui/button";
import type { PortalFeatureIcon, PortalShowcase as Showcase } from "@/data/portal-showcase";
import { Link } from "@/i18n/navigation";
import { cn, toFileName } from "@/lib/utils";

const icons: Record<PortalFeatureIcon, LucideIcon> = {
  stages: ListChecks,
  screens: Images,
  comments: MessagesSquare,
  notify: BellRing,
  secure: ShieldCheck,
};

/**
 * The client portal on the home page: what clients get, and beside it a sample client panel
 * (a project with its progress, stages and a short conversation), all edited in the admin.
 */
export async function PortalShowcase({ content }: { content: Showcase }) {
  const [format, t] = await Promise.all([getFormatter(), getTranslations("Portal")]);
  const { demo } = content;
  const progress = demo.stages.length
    ? Math.round(
        (demo.stages.filter((stage) => stage.status === "done").length / demo.stages.length) * 100,
      )
    : 0;

  return (
    <section id="portal" aria-labelledby="portal-title" className="relative py-24 md:py-32">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading
            id="portal-title"
            index="07"
            eyebrow={content.eyebrow}
            title={
              <>
                {content.title} <Accent>{content.accent}</Accent>
              </>
            }
            description={content.description}
          />

          <Stagger as="ul" className="mt-10 grid gap-5 sm:grid-cols-2" stagger={0.08}>
            {content.features.map((feature) => {
              const Icon = icons[feature.icon] ?? ListChecks;
              return (
                <StaggerItem as="li" key={feature.title} className="flex gap-3.5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-subtle text-accent">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-fg">{feature.title}</span>
                    <span className="mt-1 block text-sm text-pretty text-fg-muted">
                      {feature.text}
                    </span>
                  </span>
                </StaggerItem>
              );
            })}
          </Stagger>

          <Reveal className="mt-10 flex flex-col items-start gap-3">
            <Link href="/portal/login" className={buttonVariants()}>
              {content.cta}
              <ArrowRight
                className="size-4 transition-transform group-hover/button:translate-x-0.5"
                aria-hidden
              />
            </Link>
            <p className="text-sm text-pretty text-fg-subtle">{content.note}</p>
          </Reveal>
        </div>

        {/* The sample panel, framed like a browser window. */}
        <Reveal file={toFileName("portal", "tsx")} className="min-w-0 lg:col-span-7">
          <figure
            aria-label={`${demo.badge}: ${demo.project}`}
            className="relative overflow-hidden rounded-3xl border border-border bg-bg-elevated shadow-float"
          >
            <div
              className="pointer-events-none absolute -top-40 -right-40 size-96 [--glow-strength:12%] glow"
              aria-hidden
            />
            <div className="relative flex items-center gap-3 border-b border-border px-4 py-3">
              <span className="flex gap-1.5" aria-hidden>
                <span className="size-2.5 rounded-full bg-border-strong" />
                <span className="size-2.5 rounded-full bg-border-strong" />
                <span className="size-2.5 rounded-full bg-border-strong" />
              </span>
              <span className="min-w-0 flex-1 truncate rounded-pill bg-bg-subtle px-3 py-1 text-center font-mono text-[11px] text-fg-subtle">
                faridzeynalov.com/portal
              </span>
              <span className="shrink-0 rounded-pill bg-accent-soft px-2.5 py-1 font-mono text-[10px] tracking-wide text-accent uppercase">
                {demo.badge}
              </span>
            </div>

            <div className="relative p-5 md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-fg-subtle">{demo.client}</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight wrap-anywhere text-fg">
                    {demo.project}
                  </p>
                  {demo.due && (
                    <p className="mt-1 text-xs text-fg-muted">
                      {t("due")}: {format.dateTime(new Date(demo.due), { dateStyle: "medium" })}
                    </p>
                  )}
                </div>
                <StatusPill kind="project" status={demo.status} />
              </div>

              <div className="mt-5">
                <Progress value={progress} label={t("progress")} />
              </div>

              <ol className="mt-6 space-y-0">
                {demo.stages.map((stage, index) => (
                  <li
                    key={`${stage.name}-${index}`}
                    className="relative flex gap-3.5 pb-4 last:pb-0"
                  >
                    {index < demo.stages.length - 1 && (
                      <span
                        className={cn(
                          "absolute top-6 left-[9px] h-[calc(100%-1.5rem)] w-px",
                          stage.status === "done" ? "bg-accent" : "bg-border-strong",
                        )}
                        aria-hidden
                      />
                    )}
                    <span
                      className={cn(
                        "relative mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2",
                        stage.status === "done" && "border-accent bg-accent",
                        stage.status === "in_progress" && "border-accent bg-bg",
                        stage.status === "review" && "border-amber-500 bg-bg",
                        stage.status === "todo" && "border-border-strong bg-bg",
                      )}
                      aria-hidden
                    >
                      {stage.status === "in_progress" && (
                        <span className="size-1.5 animate-pulse rounded-full bg-accent" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="text-sm font-medium text-fg">{stage.name}</span>
                        <StatusPill kind="stage" status={stage.status} />
                      </div>
                      {stage.note && (
                        <p className="mt-1 text-xs text-pretty text-fg-muted">{stage.note}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>

              {demo.comments.length > 0 && (
                <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
                  {demo.comments.map((comment, index) => (
                    <li
                      key={index}
                      className={cn(
                        "w-fit max-w-[88%] rounded-2xl px-4 py-2.5",
                        comment.from === "client"
                          ? "bg-accent-soft"
                          : "ml-6 border border-border bg-bg-subtle",
                      )}
                    >
                      <span className="block text-xs font-medium text-fg">{comment.author}</span>
                      <span className="mt-0.5 block text-sm text-pretty text-fg">
                        {comment.body}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
