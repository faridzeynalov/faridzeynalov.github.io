import PortfolioPage, {
  generateMetadata as localizedMetadata,
} from "../../[locale]/portfolio/page";
import { defaultLocaleProps } from "@/i18n/default-locale";

export function generateMetadata() {
  return localizedMetadata(defaultLocaleProps());
}

export default function DefaultPortfolioPage() {
  return <PortfolioPage {...defaultLocaleProps()} />;
}
