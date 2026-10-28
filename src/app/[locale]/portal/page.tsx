import { ArrowRight } from "lucide-react";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { PortalPage, portalMetadata } from "@/components/portal/portal-page";
import { Progress, StatusPill } from "@/components/portal/status";
import { LogoutButton } from "@/components/portal/logout-button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localizedPath } from "@/lib/i18n-metadata";
import { getPortalClient, portalPayload, progressOf } from "@/lib/portal";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/portal">) {
  return portalMetadata((await params).locale as Locale);
}

/** The signed-in client's projects, each with its status, progress and due date. */
export default async function PortalHome({ params }: PageProps<"/[locale]/portal">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const client = await getPortalClient();
  if (!client) redirect(localizedPath(locale, "/portal/login"));
  const [t, format, payload] = await Promise.all([
    getTranslations("Portal"),
    getFormatter(),
    portalPayload(),
  ]);
  const { docs: projects } = await payload.find({
    collection: "client-projects",
    user: client,
    overrideAccess: false,
    depth: 0,
    sort: "-updatedAt",
    pagination: false,
  });

  return (
    <PortalPage
      client={client.name.split(" ")[0]}
      eyebrow={t("eyebrow")}
      title={t("hello", { name: client.name.split(" ")[0] })}
      description={t("dashboardText")}
      aside={<LogoutButton locale={locale} label={t("logout")} />}
    >
      {projects.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/portal/projects/${project.id}`}
                className="group flex h-full flex-col gap-5 rounded-3xl border border-border bg-bg-elevated p-6 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-float md:p-7"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-fg">{project.title}</h2>
                  <StatusPill kind="project" status={project.status} />
                </div>
                {project.summary && (
                  <p className="line-clamp-2 text-sm text-pretty text-fg-muted">
                    {project.summary}
                  </p>
                )}
                <Progress value={progressOf(project.stages)} label={t("progress")} />
                <div className="mt-auto flex items-center justify-between text-sm text-fg-muted">
                  <span>
                    {project.dueDate
                      ? `${t("due")}: ${format.dateTime(new Date(project.dueDate), { dateStyle: "medium" })}`
                      : ""}
                  </span>
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl border border-dashed border-border-strong px-6 py-16 text-center text-fg-muted">
          {t("noProjects")}
        </p>
      )}
    </PortalPage>
  );
}
