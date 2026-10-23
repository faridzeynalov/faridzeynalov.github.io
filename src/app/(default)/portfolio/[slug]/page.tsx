import ProjectPage, {
  generateMetadata as localizedMetadata,
} from "../../../[locale]/portfolio/[slug]/page";
import { defaultLocaleProps } from "@/i18n/default-locale";

export { generateStaticParams } from "../../../[locale]/portfolio/[slug]/page";

export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateMetadata({ params }: Props) {
  return localizedMetadata(defaultLocaleProps(params));
}

export default function DefaultProjectPage({ params }: Props) {
  return <ProjectPage {...defaultLocaleProps(params)} />;
}
