import Page, { generateMetadata as localizedMetadata } from "../../../[locale]/portal/login/page";
import { defaultLocaleProps } from "@/i18n/default-locale";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return localizedMetadata(defaultLocaleProps());
}

export default function DefaultPortalLoginPage() {
  return <Page {...defaultLocaleProps()} />;
}
