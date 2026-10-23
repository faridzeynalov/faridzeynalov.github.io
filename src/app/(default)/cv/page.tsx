import CvPage, { generateMetadata as localizedMetadata } from "../../[locale]/cv/page";
import { defaultLocaleProps } from "@/i18n/default-locale";

export function generateMetadata() {
  return localizedMetadata(defaultLocaleProps());
}

export default function DefaultCvPage() {
  return <CvPage {...defaultLocaleProps()} />;
}
