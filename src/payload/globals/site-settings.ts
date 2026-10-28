import type { GlobalConfig } from "payload";
import { revalidateSite } from "@/payload/hooks/revalidate-site";

/** Identity and contact details used across the whole site. Empty fields keep the built-in text. */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Sayt ayarları",
  admin: { group: "Ayarlar" },
  access: { read: () => true },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", label: "Ad Soyad", type: "text" },
        { name: "role", label: "Vəzifə", type: "text", localized: true },
      ],
    },
    { name: "location", label: "Şəhər", type: "text", localized: true },
    {
      type: "row",
      fields: [
        { name: "email", label: "Email", type: "email" },
        {
          name: "phone",
          label: "Telefon",
          type: "text",
          admin: { placeholder: "+994 51 306 35 96" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "yearsOfExperience",
          label: "Təcrübə (il)",
          type: "text",
          admin: { placeholder: "4+" },
        },
        { name: "sitesShipped", label: "Layihə sayı", type: "text", admin: { placeholder: "25+" } },
      ],
    },
    {
      name: "links",
      label: "Linklər",
      type: "group",
      fields: [
        { name: "linkedIn", label: "LinkedIn", type: "text" },
        { name: "github", label: "GitHub", type: "text" },
        { name: "instagram", label: "Instagram", type: "text" },
      ],
    },
  ],
};
