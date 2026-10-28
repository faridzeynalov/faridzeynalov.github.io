import type { GlobalConfig } from "payload";
import { anyone, isAdmin } from "@/payload/access";
import { groups, i18nField, i18nLinesField, l, linesField, rowActiveField } from "@/payload/fields";
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
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    i18nField("intro", l("Giriş mətni", "Intro", "Вступление"), { long: true }),
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
        i18nField("title", l("Ad", "Name", "Название")),
        i18nField("description", l("Təsvir", "Description", "Описание"), { long: true }),
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
        rowActiveField,
      ],
    },
    linesField("tools", l("Alətlər", "Tools", "Инструменты")),
    i18nLinesField("skills", l("Bacarıqlar siyahısı", "Skills list", "Список навыков")),
  ],
};
