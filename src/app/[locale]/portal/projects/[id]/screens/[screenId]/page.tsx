import { ArrowLeft, Maximize2 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { Conversation } from "@/components/portal/conversation";
import { LogoutButton } from "@/components/portal/logout-button";
import { PortalPage, portalMetadata } from "@/components/portal/portal-page";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localizedPath } from "@/lib/i18n-metadata";
import { getPortalClient, portalPayload } from "@/lib/portal";

export const dynamic = "force-dynamic";

type Props = PageProps<"/[locale]/portal/projects/[id]/screens/[screenId]">;

export async function generateMetadata({ params }: Props) {
  return portalMetadata((await params).locale as Locale);
}

/**
 * One screen of a client's project: the image, large, and the conversation about it. A screen of
 * someone else's project, or of another project, doesn't exist here (404).
 */
export default async function PortalScreenPage({ params }: Props) {
  const { locale: rawLocale, id, screenId } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);
  const client = await getPortalClient();
  if (!client) redirect(localizedPath(locale, "/portal/login"));
  const [t, payload] = await Promise.all([getTranslations("Portal"), portalPayload()]);
  const screen = await payload
    .findByID({
      collection: "project-screens",
      id: screenId,
      user: client,
      overrideAccess: false,
      depth: 1,
    })
    .catch(() => null);
  const project = typeof screen?.project === "object" ? screen.project : null;
  if (!screen || !project || String(project.id) !== id) notFound();
  const { docs: comments } = await payload.find({
    collection: "project-comments",
    where: { screen: { equals: screen.id } },
    user: client,
    overrideAccess: false,
    depth: 0,
    sort: "createdAt",
    pagination: false,
  });
  const image = `/api/portal-screens/${screen.id}`;

  return (
    <PortalPage
      eyebrow={project.title}
      title={screen.title}
      description={screen.note ?? undefined}
      aside={
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/portal/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("backToProject")}
          </Link>
          <span className="flex-1" />
          <LogoutButton locale={locale} label={t("logout")} />
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start">
        <figure className="overflow-hidden rounded-3xl border border-border bg-bg-elevated">
          <a href={image} target="_blank" rel="noreferrer" className="group relative block">
            {/* eslint-disable-next-line @next/next/no-img-element -- a private file, served by the portal's own route */}
            <img src={image} alt={screen.title} className="block h-auto w-full" />
            <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-pill bg-bg/80 px-3 py-1.5 text-xs text-fg opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <Maximize2 className="size-3.5" aria-hidden />
              {t("openFull")}
            </span>
          </a>
        </figure>

        <section
          id="comments"
          className="scroll-mt-24 rounded-3xl border border-border bg-bg-elevated p-6 lg:sticky lg:top-24"
        >
          <h2 className="mb-6 text-lg font-semibold tracking-tight">{t("screenComments")}</h2>
          <Conversation
            comments={comments}
            project={project.id}
            screen={screen.id}
            empty={t("noScreenComments")}
            placeholder={t("screenPlaceholder")}
          />
        </section>
      </div>
    </PortalPage>
  );
}
