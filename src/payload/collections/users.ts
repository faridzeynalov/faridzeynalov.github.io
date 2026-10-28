import type { CollectionConfig } from "payload";

/** Who can sign in to the admin panel. */
export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "İstifadəçi", plural: "İstifadəçilər" },
  admin: { useAsTitle: "email", group: "Sistem" },
  auth: true,
  fields: [{ name: "name", label: "Ad", type: "text" }],
};
