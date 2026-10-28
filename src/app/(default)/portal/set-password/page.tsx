import Page, {
  generateMetadata as localizedMetadata,
} from "../../../[locale]/portal/set-password/page";
import { defaultLocaleProps } from "@/i18n/default-locale";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return localizedMetadata(defaultLocaleProps());
}

/** Passes the link's ?token= through: defaultLocaleProps leaves search params empty. */
export default function DefaultPortalSetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <Page {...defaultLocaleProps()} searchParams={searchParams} />;
}
