import Page, {
  generateMetadata as localizedMetadata,
} from "../../../../[locale]/portal/projects/[id]/page";
import { defaultLocaleProps } from "@/i18n/default-locale";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateMetadata({ params }: Props) {
  return localizedMetadata(defaultLocaleProps(params));
}

export default function DefaultPortalProjectPage({ params }: Props) {
  return <Page {...defaultLocaleProps(params)} />;
}
