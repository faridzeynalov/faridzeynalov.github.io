import { revalidatePath, revalidateTag } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from "payload";

/** Cache tag of everything read from the admin panel (see src/lib/cms.ts). */
export const CMS_TAG = "cms";

/**
 * Drops the cached admin content and every prerendered page, so the next visit to each page
 * renders it again with the new values.
 */
function revalidate(req: PayloadRequest) {
  // Outside a Next.js request (CLI scripts, migrations, seeding) there is no cache to revalidate.
  if (req.context?.disableRevalidate) return;
  try {
    revalidateTag(CMS_TAG, { expire: 0 });
    revalidatePath("/", "layout");
  } catch (error) {
    req.payload.logger.warn({ msg: "Could not revalidate the site", err: error });
  }
}

/** For globals: after something is saved in the admin panel. */
export const revalidateSite: GlobalAfterChangeHook = ({ doc, req }) => {
  revalidate(req);
  return doc;
};

/** For collections: after a document is saved or deleted. */
export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  revalidate(req);
  return doc;
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidate(req);
  return doc;
};
