import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";
import sharp from "sharp";
import { groups, l } from "@/payload/fields";

/**
 * A tiny blurred copy of each uploaded image, as a data URL, for next/image's blur placeholder
 * (the site's built-in screenshots had one from their static imports).
 */
const addBlurPlaceholder: CollectionBeforeChangeHook = async ({ data, req }) => {
  const file = req.file;
  if (!file?.data || !file.mimetype?.startsWith("image/") || file.mimetype === "image/svg+xml") {
    return data;
  }
  try {
    const tiny = await sharp(file.data)
      .resize(12, 12, { fit: "inside" })
      .webp({ quality: 40 })
      .toBuffer();
    return { ...data, blurDataURL: `data:image/webp;base64,${tiny.toString("base64")}` };
  } catch {
    return data;
  }
};

/**
 * A file's address on Vercel Blob's CDN, built the way @payloadcms/storage-vercel-blob builds it
 * (the thumbnail is worked out before the plugin swaps in that address, and the API route it
 * would otherwise point to is off: files are served from Blob directly).
 */
function blobUrl(filename: unknown) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const storeId = token?.match(/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i)?.[1]?.toLowerCase();
  if (!storeId || typeof filename !== "string") return null;
  const base =
    process.env.STORAGE_VERCEL_BLOB_BASE_URL || `https://${storeId}.public.blob.vercel-storage.com`;
  return `${base}/${encodeURIComponent(filename)}`;
}

/** Images and files (project screenshots, share image, the CV, the QR code), in Vercel Blob. */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: l("Fayl", "File", "Файл"), plural: l("Media", "Media", "Медиа") },
  admin: { group: groups.system },
  access: { read: () => true },
  upload: {
    mimeTypes: ["image/*", "application/pdf"],
    // No resized copies are made, so the image itself is the preview in lists and upload fields.
    adminThumbnail: ({ doc }) =>
      typeof doc.mimeType === "string" && doc.mimeType.startsWith("image/")
        ? blobUrl(doc.filename) || (typeof doc.url === "string" ? doc.url : null)
        : null,
    displayPreview: true,
  },
  hooks: { beforeChange: [addBlurPlaceholder] },
  fields: [
    {
      name: "alt",
      label: l("Alternativ mətn", "Alt text", "Альтернативный текст"),
      type: "text",
      localized: true,
    },
    {
      name: "blurDataURL",
      type: "text",
      admin: { hidden: true, disableListColumn: true, disableListFilter: true },
    },
  ],
};
