import { revalidatePath, revalidateTag } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";

/** Cache tag of everything read from the admin panel (see src/lib/cms.ts). */
export const CMS_TAG = "cms";

/**
 * After something is saved in the admin panel, drops the cached admin content and every
 * prerendered page, so the next visit to each page renders it again with the new values.
 */
export const revalidateSite: GlobalAfterChangeHook = ({ doc, req }) => {
  // Outside a Next.js request (CLI scripts, migrations) there is no cache to revalidate.
  if (req.context?.disableRevalidate) return doc;
  try {
    revalidateTag(CMS_TAG, { expire: 0 });
    revalidatePath("/", "layout");
  } catch (error) {
    req.payload.logger.warn({ msg: "Could not revalidate the site", err: error });
  }
  return doc;
};
