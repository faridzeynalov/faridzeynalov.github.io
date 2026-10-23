import ServicesPage, { generateMetadata as localizedMetadata } from "../../[locale]/services/page";
import { defaultLocaleProps } from "@/i18n/default-locale";

export function generateMetadata() {
  return localizedMetadata(defaultLocaleProps());
}

export default function DefaultServicesPage() {
  return <ServicesPage {...defaultLocaleProps()} />;
}
