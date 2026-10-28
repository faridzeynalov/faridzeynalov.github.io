import Page, {
  generateMetadata as localizedMetadata,
} from "../../../../../../[locale]/portal/projects/[id]/screens/[screenId]/page";
import { defaultLocaleProps } from "@/i18n/default-locale";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string; screenId: string }>;
}

export function generateMetadata({ params }: Props) {
  return localizedMetadata(defaultLocaleProps(params));
}

export default function DefaultPortalScreenPage({ params }: Props) {
  return <Page {...defaultLocaleProps(params)} />;
}
