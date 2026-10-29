import type { GlobalConfig } from "payload";
import { anyone, isAdmin } from "@/payload/access";
import { groups, i18nField, l, rowActiveField } from "@/payload/fields";
import { revalidateSite } from "@/payload/hooks/revalidate-site";

const rowLabel = { components: { RowLabel: "/payload/components/row-label#RowLabel" } };

/**
 * The client portal section on the home page: its texts, the feature cards, and the sample client
 * panel shown beside them. Anything left empty keeps the built-in content (data/portal-showcase).
 */
export const PortalShowcase: GlobalConfig = {
  slug: "portal-showcase",
  label: l("Müştəri paneli bölməsi", "Client panel section", "Раздел клиентской панели"),
  admin: {
    group: groups.content,
    description: l(
      "Ana səhifədəki müştəri portalı bölməsi və oradakı nümunə panel. Bölməni Səhifələrdə gizlətmək olar.",
      "The client portal section on the home page and its sample panel. It can be hidden under Pages.",
      "Раздел о клиентском портале на главной и пример панели. Скрыть его можно в «Страницах».",
    ),
  },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: l("Mətnlər", "Texts", "Тексты"),
          fields: [
            i18nField("eyebrow", l("Kiçik başlıq", "Eyebrow", "Надзаголовок")),
            i18nField("title", l("Başlıq", "Title", "Заголовок")),
            i18nField("accent", l("Başlığın vurğulu hissəsi", "Accented part", "Акцент заголовка")),
            i18nField("description", l("Təsvir", "Description", "Описание"), { long: true }),
            {
              name: "features",
              label: l("Üstünlüklər", "Features", "Возможности"),
              labels: {
                singular: l("Üstünlük", "Feature", "Возможность"),
                plural: l("Üstünlüklər", "Features", "Возможности"),
              },
              type: "array",
              admin: { initCollapsed: true, ...rowLabel },
              fields: [
                i18nField("title", l("Ad", "Name", "Название")),
                i18nField("text", l("Mətn", "Text", "Текст"), { long: true }),
                {
                  name: "icon",
                  label: l("İkon", "Icon", "Иконка"),
                  type: "select",
                  defaultValue: "stages",
                  options: [
                    { label: l("Mərhələlər", "Stages", "Этапы"), value: "stages" },
                    { label: l("Skrinşotlar", "Screenshots", "Скриншоты"), value: "screens" },
                    { label: l("Şərhlər", "Comments", "Комментарии"), value: "comments" },
                    { label: l("Bildiriş", "Notification", "Уведомление"), value: "notify" },
                    { label: l("Təhlükəsizlik", "Security", "Безопасность"), value: "secure" },
                  ],
                },
                rowActiveField,
              ],
            },
            i18nField("cta", l("Düymənin mətni", "Button text", "Текст кнопки")),
            i18nField(
              "note",
              l("Düymənin altındakı qeyd", "Note under the button", "Подпись под кнопкой"),
            ),
          ],
        },
        {
          name: "demo",
          label: l("Nümunə panel", "Sample panel", "Пример панели"),
          description: l(
            "Ana səhifədə göstərilən nümunə müştəri paneli. Real müştəri məlumatı yazmayın.",
            "The sample client panel shown on the home page. Don't put real client data here.",
            "Пример клиентской панели на главной. Не указывайте здесь реальных клиентов.",
          ),
          fields: [
            i18nField("badge", l("Nişan", "Badge", "Метка"), {
              description: l("Məsələn: Nümunə", "For example: Example", "Например: Пример"),
            }),
            i18nField("project", l("Layihənin adı", "Project name", "Название проекта")),
            {
              type: "row",
              fields: [
                i18nField("client", l("Müştərinin adı", "Client's name", "Имя клиента")),
                {
                  name: "status",
                  label: l("Status", "Status", "Статус"),
                  type: "select",
                  defaultValue: "active",
                  options: [
                    { label: l("Planlanır", "Planned", "Планируется"), value: "planned" },
                    { label: l("Davam edir", "In progress", "В работе"), value: "active" },
                    { label: l("Dayandırılıb", "Paused", "Приостановлен"), value: "paused" },
                    { label: l("Tamamlanıb", "Done", "Завершён"), value: "done" },
                  ],
                },
                { name: "due", label: l("Təhvil tarixi", "Due date", "Срок сдачи"), type: "date" },
              ],
            },
            {
              name: "stages",
              label: l("Mərhələlər", "Stages", "Этапы"),
              labels: {
                singular: l("Mərhələ", "Stage", "Этап"),
                plural: l("Mərhələlər", "Stages", "Этапы"),
              },
              type: "array",
              admin: { initCollapsed: true, ...rowLabel },
              fields: [
                i18nField("name", l("Ad", "Name", "Название")),
                {
                  name: "status",
                  label: l("Status", "Status", "Статус"),
                  type: "select",
                  defaultValue: "todo",
                  options: [
                    { label: l("Gözləyir", "To do", "Ожидает"), value: "todo" },
                    { label: l("Davam edir", "In progress", "В работе"), value: "in_progress" },
                    { label: l("Yoxlamada", "In review", "На проверке"), value: "review" },
                    { label: l("Hazırdır", "Done", "Готово"), value: "done" },
                  ],
                },
                i18nField("note", l("Qeyd", "Note", "Заметка"), { long: true }),
              ],
            },
            {
              name: "comments",
              label: l("Şərhlər", "Comments", "Комментарии"),
              labels: {
                singular: l("Şərh", "Comment", "Комментарий"),
                plural: l("Şərhlər", "Comments", "Комментарии"),
              },
              type: "array",
              admin: { initCollapsed: true, ...rowLabel },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "from",
                      label: l("Kim yazır", "Written by", "Кто пишет"),
                      type: "select",
                      defaultValue: "client",
                      options: [
                        { label: l("Müştəri", "Client", "Клиент"), value: "client" },
                        { label: l("Mən", "Me", "Я"), value: "me" },
                      ],
                    },
                  ],
                },
                i18nField("author", l("Ad", "Name", "Имя")),
                i18nField("text", l("Mətn", "Text", "Текст"), { long: true }),
              ],
            },
          ],
        },
      ],
    },
  ],
};
