import PortalHome, { generateMetadata as localizedMetadata } from "../../[locale]/portal/page";
import { defaultLocaleProps } from "@/i18n/default-locale";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return localizedMetadata(defaultLocaleProps());
}

export default function DefaultPortalHome() {
  return <PortalHome {...defaultLocaleProps()} />;
}
