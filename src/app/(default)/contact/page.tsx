import ContactPage, { generateMetadata as localizedMetadata } from "../../[locale]/contact/page";
import { defaultLocaleProps } from "@/i18n/default-locale";

export function generateMetadata() {
  return localizedMetadata(defaultLocaleProps());
}

export default function DefaultContactPage() {
  return <ContactPage {...defaultLocaleProps()} />;
}
