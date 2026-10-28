import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { PortalSessionMark } from "@/components/layout/portal-menu";
import type { Locale } from "@/i18n/routing";

/** Portal pages are private: kept out of search engines, under one title. */
export async function portalMetadata(locale: Locale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Portal" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/**
 * The portal's page frame: the site's page header, then the content. On signed-in pages, `client`
 * (their first name) also marks the session for the site header.
 */
export function PortalPage({
  client,
  eyebrow,
  title,
  accent,
  description,
  aside,
  children,
}: {
  client?: string;
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      {client && <PortalSessionMark name={client} />}
      <PageHeader eyebrow={eyebrow} title={title} accent={accent} description={description}>
        {aside && <div className="mt-8">{aside}</div>}
      </PageHeader>
      <section className="pb-24 md:pb-32">
        <div className="container-page">{children}</div>
      </section>
    </>
  );
}
