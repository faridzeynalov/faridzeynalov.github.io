import type { GlobalConfig } from "payload";
import { groups, l, linesField, rowActiveField } from "@/payload/fields";
import { revalidateSite } from "@/payload/hooks/revalidate-site";

/** The AI section on the home page and the CV. A list left empty keeps the built-in content. */
export const Ai: GlobalConfig = {
  slug: "ai",
  label: l("Süni intellekt", "AI", "ИИ"),
  admin: {
    group: groups.content,
    description: l(
      "Ana səhifədəki və CV-dəki süni intellekt bölməsi.",
      "The AI section on the home page and in the CV.",
      "Раздел об ИИ на главной и в резюме.",
    ),
  },
  access: { read: () => true },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      name: "intro",
      label: l("Giriş mətni", "Intro", "Вступление"),
      type: "textarea",
      localized: true,
    },
    {
      name: "capabilities",
      label: l("Bacarıqlar", "Capabilities", "Возможности"),
      labels: {
        singular: l("Bacarıq", "Capability", "Возможность"),
        plural: l("Bacarıqlar", "Capabilities", "Возможности"),
      },
      type: "array",
      admin: {
        initCollapsed: true,
        components: { RowLabel: "/payload/components/row-label#RowLabel" },
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "title", label: l("Ad", "Name", "Название"), type: "text", localized: true },
            {
              name: "icon",
              label: l("İkon", "Icon", "Иконка"),
              type: "select",
              defaultValue: "bot",
              options: [
                { label: l("Bot", "Bot", "Бот"), value: "bot" },
                { label: l("İnteqrasiya", "Integration", "Интеграция"), value: "plug" },
                { label: l("Söhbət", "Chat", "Чат"), value: "messages" },
                { label: l("Kod", "Code", "Код"), value: "braces" },
              ],
            },
          ],
        },
        {
          name: "description",
          label: l("Təsvir", "Description", "Описание"),
          type: "textarea",
          localized: true,
        },
        rowActiveField,
      ],
    },
    linesField("tools", l("Alətlər", "Tools", "Инструменты"), { localized: false }),
    linesField("skills", l("Bacarıqlar siyahısı", "Skills list", "Список навыков")),
  ],
};
