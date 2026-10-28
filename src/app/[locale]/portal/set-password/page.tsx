import { getTranslations, setRequestLocale } from "next-intl/server";
import { FormCard, SetPasswordForm } from "@/components/portal/forms";
import { PortalPage, portalMetadata } from "@/components/portal/portal-page";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/portal/set-password">) {
  return portalMetadata((await params).locale as Locale);
}

/** Where the invitation and reset emails lead: choose a password, then go to the projects. */
export default async function PortalSetPasswordPage({
  params,
  searchParams,
}: PageProps<"/[locale]/portal/set-password">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations("Portal");
  const token = (await searchParams).token;
  return (
    <PortalPage
      eyebrow={t("eyebrow")}
      title={t("setTitle")}
      accent={t("setAccent")}
      description={t("setText")}
    >
      <FormCard>
        {typeof token === "string" && token ? (
          <SetPasswordForm token={token} />
        ) : (
          <p className="text-sm text-fg-muted">
            {t("noToken")}{" "}
            <Link href="/portal/forgot" className="text-fg underline underline-offset-4">
              {t("sendLink")}
            </Link>
          </p>
        )}
      </FormCard>
    </PortalPage>
  );
}
