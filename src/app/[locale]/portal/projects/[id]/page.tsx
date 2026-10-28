import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { CommentForm } from "@/components/portal/forms";
import { LogoutButton } from "@/components/portal/logout-button";
import { PortalPage, portalMetadata } from "@/components/portal/portal-page";
import { Progress, StatusPill } from "@/components/portal/status";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localizedPath } from "@/lib/i18n-metadata";
import { getPortalClient, portalPayload, progressOf } from "@/lib/portal";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/portal/projects/[id]">) {
  return portalMetadata((await params).locale as Locale);
}

/**
 * One of the client's projects: status, progress, the stages as a timeline, links, and the
 * conversation with a form to add to it. Other clients' projects don't exist here (404).
 */
export default async function PortalProjectPage({
  params,
}: PageProps<"/[locale]/portal/projects/[id]">) {
  const { locale: rawLocale, id } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);
  const client = await getPortalClient();
  if (!client) redirect(localizedPath(locale, "/portal/login"));
  const [t, format, payload] = await Promise.all([
    getTranslations("Portal"),
    getFormatter(),
    portalPayload(),
  ]);
  const project = await payload
    .findByID({ collection: "client-projects", id, user: client, overrideAccess: false, depth: 0 })
    .catch(() => null);
  if (!project) notFound();
  const { docs: comments } = await payload.find({
    collection: "project-comments",
    where: { project: { equals: project.id } },
    user: client,
    overrideAccess: false,
    depth: 0,
    sort: "createdAt",
    pagination: false,
  });
  const date = (value?: string | null) =>
    value ? format.dateTime(new Date(value), { dateStyle: "medium" }) : null;
  const stages = project.stages ?? [];

  return (
    <PortalPage
      eyebrow={t("eyebrow")}
      title={project.title}
      description={project.summary ?? undefined}
      aside={
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("back")}
          </Link>
          <span className="flex-1" />
          <LogoutButton locale={locale} label={t("logout")} />
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="space-y-6">
          {/* Stages */}
          <section className="rounded-3xl border border-border bg-bg-elevated p-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">{t("stages")}</h2>
              <StatusPill kind="project" status={project.status} />
            </div>
            <Progress value={progressOf(stages)} label={t("progress")} />
            <ol className="mt-8 space-y-0">
              {stages.map((stage, index) => (
                <li key={stage.id ?? index} className="relative flex gap-4 pb-6 last:pb-0">
                  {index < stages.length - 1 && (
                    <span
                      className={cn(
                        "absolute top-7 left-[11px] h-[calc(100%-1.75rem)] w-px",
                        stage.status === "done" ? "bg-accent" : "bg-border-strong",
                      )}
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      "relative mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2",
                      stage.status === "done" && "border-accent bg-accent",
                      stage.status === "in_progress" && "border-accent bg-bg",
                      stage.status === "review" && "border-amber-500 bg-bg",
                      stage.status === "todo" && "border-border-strong bg-bg",
                    )}
                    aria-hidden
                  >
                    {stage.status === "in_progress" && (
                      <span className="size-2 animate-pulse rounded-full bg-accent" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h3 className="font-medium text-fg">{stage.name}</h3>
                      <StatusPill kind="stage" status={stage.status} />
                      {date(stage.dueDate) && (
                        <span className="font-mono text-xs text-fg-subtle">
                          {date(stage.dueDate)}
                        </span>
                      )}
                    </div>
                    {stage.note && (
                      <p className="mt-2 text-sm text-pretty whitespace-pre-line text-fg-muted">
                        {stage.note}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Comments */}
          <section
            id="comments"
            className="scroll-mt-24 rounded-3xl border border-border bg-bg-elevated p-6 md:p-8"
          >
            <h2 className="mb-6 text-lg font-semibold tracking-tight">{t("comments")}</h2>
            {comments.length ? (
              <ul className="mb-6 space-y-4">
                {comments.map((comment) => {
                  const mine = comment.author?.relationTo === "clients";
                  return (
                    <li
                      key={comment.id}
                      className={cn(
                        "max-w-[92%] rounded-2xl px-4 py-3",
                        mine ? "ml-auto bg-accent-soft" : "bg-bg-subtle",
                      )}
                    >
                      <p className="mb-1 flex flex-wrap items-baseline gap-x-2 text-xs text-fg-subtle">
                        <span className="font-medium text-fg">{mine ? t("you") : t("me")}</span>
                        <time dateTime={comment.createdAt}>
                          {format.dateTime(new Date(comment.createdAt), {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </time>
                      </p>
                      <p className="text-sm text-pretty whitespace-pre-line text-fg">
                        {comment.body}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mb-6 text-sm text-fg-muted">{t("noComments")}</p>
            )}
            <CommentForm project={project.id} />
          </section>
        </div>

        {/* Dates and links */}
        <aside className="space-y-6">
          <section className="rounded-3xl border border-border bg-bg-elevated p-6">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-mono text-xs text-fg-subtle uppercase">{t("start")}</dt>
                <dd className="mt-1 text-fg">{date(project.startDate) ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-fg-subtle uppercase">{t("due")}</dt>
                <dd className="mt-1 text-fg">{date(project.dueDate) ?? "—"}</dd>
              </div>
            </dl>
          </section>
          {project.links?.length ? (
            <section className="rounded-3xl border border-border bg-bg-elevated p-6">
              <h2 className="mb-4 font-mono text-xs text-fg-subtle uppercase">{t("links")}</h2>
              <ul className="space-y-2">
                {project.links.map((link, index) => (
                  <li key={link.id ?? index}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3 text-sm text-fg transition-colors hover:border-border-strong"
                    >
                      <span className="min-w-0 truncate">{link.label}</span>
                      <ArrowUpRight
                        className="size-4 shrink-0 text-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-label={t("open")}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </PortalPage>
  );
}
