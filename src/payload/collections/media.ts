import type { CollectionConfig } from "payload";

/** Images and files (project screenshots, OG images, the CV), stored in Vercel Blob. */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Fayl", plural: "Media" },
  admin: { group: "Sistem" },
  access: { read: () => true },
  upload: { mimeTypes: ["image/*", "application/pdf"] },
  fields: [{ name: "alt", label: "Alternativ mətn", type: "text", localized: true }],
};
