import Page, { generateMetadata as localizedMetadata } from "../../../[locale]/portal/forgot/page";
import { defaultLocaleProps } from "@/i18n/default-locale";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return localizedMetadata(defaultLocaleProps());
}

export default function DefaultPortalForgotPage() {
  return <Page {...defaultLocaleProps()} />;
}
