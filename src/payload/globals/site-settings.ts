import type { GlobalConfig } from "payload";
import { groups, l } from "@/payload/fields";
import { revalidateSite } from "@/payload/hooks/revalidate-site";

const emptyKeepsBuiltIn = l(
  "Boş sahələr saytdakı indiki dəyəri saxlayır.",
  "Empty fields keep the value currently on the site.",
  "Пустые поля сохраняют текущее значение на сайте.",
);

/** Identity and contact details used across the whole site. */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: l("Sayt ayarları", "Site settings", "Настройки сайта"),
  admin: { group: groups.settings, description: emptyKeepsBuiltIn },
  access: { read: () => true },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", label: l("Ad Soyad", "Full name", "Имя и фамилия"), type: "text" },
        {
          name: "role",
          label: l("Vəzifə", "Job title", "Должность"),
          type: "text",
          localized: true,
        },
      ],
    },
    { name: "location", label: l("Şəhər", "City", "Город"), type: "text", localized: true },
    {
      type: "row",
      fields: [
        { name: "email", label: l("Email", "Email", "Email"), type: "email" },
        {
          name: "phone",
          label: l("Telefon", "Phone", "Телефон"),
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
          label: l("Təcrübə (il)", "Experience (years)", "Опыт (лет)"),
          type: "text",
          admin: { placeholder: "4+" },
        },
        {
          name: "sitesShipped",
          label: l("Layihə sayı", "Projects shipped", "Количество проектов"),
          type: "text",
          admin: { placeholder: "25+" },
        },
      ],
    },
    {
      name: "links",
      label: l("Linklər", "Links", "Ссылки"),
      type: "group",
      fields: [
        { name: "linkedIn", label: "LinkedIn", type: "text" },
        { name: "github", label: "GitHub", type: "text" },
        { name: "instagram", label: "Instagram", type: "text" },
      ],
    },
    {
      name: "cv",
      label: l("CV faylı (PDF)", "CV file (PDF)", "Файл резюме (PDF)"),
      type: "upload",
      relationTo: "media",
      filterOptions: { mimeType: { equals: "application/pdf" } },
      admin: {
        description: l(
          "Saytdakı “CV-ni yüklə” düymələri bu faylı verir.",
          "The site's “Download CV” buttons serve this file.",
          "Кнопки «Скачать резюме» на сайте отдают этот файл.",
        ),
      },
    },
    {
      name: "support",
      label: l("“Mənə kofe al” düyməsi", "“Buy me a coffee” button", "Кнопка «Купи мне кофе»"),
      type: "group",
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "url",
              label: l("Link", "Link", "Ссылка"),
              type: "text",
              admin: { placeholder: "https://kofe.al/@faridzeynalov" },
            },
            {
              name: "qr",
              label: l("QR kod", "QR code", "QR-код"),
              type: "upload",
              relationTo: "media",
              filterOptions: { mimeType: { contains: "image" } },
              admin: {
                description: l(
                  "Linki dəyişəndə QR kodu da yeniləyin.",
                  "Update the QR code when you change the link.",
                  "Меняя ссылку, обновите и QR-код.",
                ),
              },
            },
          ],
        },
      ],
    },
  ],
};
