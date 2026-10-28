import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { FormCard, LoginForm } from "@/components/portal/forms";
import { PortalPage, portalMetadata } from "@/components/portal/portal-page";
import type { Locale } from "@/i18n/routing";
import { localizedPath } from "@/lib/i18n-metadata";
import { getPortalClient } from "@/lib/portal";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/portal/login">) {
  return portalMetadata((await params).locale as Locale);
}

export default async function PortalLoginPage({ params }: PageProps<"/[locale]/portal/login">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  if (await getPortalClient()) redirect(localizedPath(locale, "/portal"));
  const t = await getTranslations("Portal");
  return (
    <PortalPage
      eyebrow={t("eyebrow")}
      title={t("loginTitle")}
      accent={t("loginAccent")}
      description={t("loginText")}
    >
      <FormCard>
        <LoginForm />
      </FormCard>
    </PortalPage>
  );
}
