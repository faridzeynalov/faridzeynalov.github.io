import { getTranslations, setRequestLocale } from "next-intl/server";
import { ForgotForm, FormCard } from "@/components/portal/forms";
import { PortalPage, portalMetadata } from "@/components/portal/portal-page";
import type { Locale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/portal/forgot">) {
  return portalMetadata((await params).locale as Locale);
}

export default async function PortalForgotPage({ params }: PageProps<"/[locale]/portal/forgot">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations("Portal");
  return (
    <PortalPage
      eyebrow={t("eyebrow")}
      title={t("forgotTitle")}
      accent={t("forgotAccent")}
      description={t("forgotText")}
    >
      <FormCard>
        <ForgotForm />
      </FormCard>
    </PortalPage>
  );
}
