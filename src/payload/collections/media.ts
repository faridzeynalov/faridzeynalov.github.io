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

/** Images and files (project screenshots, share image, the CV, the QR code), in Vercel Blob. */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: l("Fayl", "File", "Файл"), plural: l("Media", "Media", "Медиа") },
  admin: { group: groups.system },
  access: { read: () => true },
  upload: { mimeTypes: ["image/*", "application/pdf"] },
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
      admin: { hidden: true },
    },
  ],
};
