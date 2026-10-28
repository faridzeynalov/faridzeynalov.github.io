import type { Access, CollectionBeforeDeleteHook, CollectionConfig } from "payload";
import { isAdmin } from "@/payload/access";
import { l, type Label } from "@/payload/fields";

export const portalGroup = l("Müştəri portalı", "Client portal", "Клиентский портал");

/** The usual stages of a project; each new one starts with these (editable per project). */
const defaultStages = [
  { name: "Kəşf / Discovery", status: "todo" },
  { name: "Dizayn / Design", status: "todo" },
  { name: "Hazırlama / Development", status: "todo" },
  { name: "Buraxılış / Launch", status: "todo" },
];

export const stageStatuses = ["todo", "in_progress", "review", "done"] as const;
export const projectStatuses = ["planned", "active", "paused", "done"] as const;

const stageLabels: Record<(typeof stageStatuses)[number], Label> = {
  todo: l("Gözləyir", "To do", "В очереди"),
  in_progress: l("Davam edir", "In progress", "В работе"),
  review: l("Yoxlamada", "In review", "На проверке"),
  done: l("Hazırdır", "Done", "Готово"),
};

const projectLabels: Record<(typeof projectStatuses)[number], Label> = {
  planned: l("Planlaşdırılır", "Planned", "Планируется"),
  active: l("Davam edir", "In progress", "В работе"),
  paused: l("Dayandırılıb", "Paused", "Приостановлен"),
  done: l("Tamamlanıb", "Completed", "Завершён"),
};

/** Admins see every project; a client only the ones that are theirs. */
const ownProjects: Access = ({ req }) => {
  if (req.user?.collection === "users") return true;
  if (req.user?.collection === "clients") return { client: { equals: req.user.id } };
  return false;
};

/**
 * Work I'm doing for a client, as they follow it in the portal: overall status, stages (each
 * with its own status and date) and links. Separate from the portfolio's public projects.
 */
/** A deleted project takes its comments and screens (with their files) with it. */
const deleteContents: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const where = { project: { equals: id } };
  await req.payload.delete({ collection: "project-comments", where, req });
  await req.payload.delete({ collection: "project-screens", where, req });
};

export const ClientProjects: CollectionConfig = {
  slug: "client-projects",
  labels: {
    singular: l("Müştəri layihəsi", "Client project", "Проект клиента"),
    plural: l("Müştəri layihələri", "Client projects", "Проекты клиентов"),
  },
  admin: {
    group: portalGroup,
    useAsTitle: "title",
    defaultColumns: ["title", "client", "status", "dueDate", "updatedAt"],
  },
  access: { read: ownProjects, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: { beforeDelete: [deleteContents] },
  fields: [
    { name: "title", label: l("Layihə", "Project", "Проект"), type: "text", required: true },
    {
      name: "client",
      label: l("Müştəri", "Client", "Клиент"),
      type: "relationship",
      relationTo: "clients",
      required: true,
      index: true,
      admin: { position: "sidebar" },
    },
    {
      name: "status",
      label: l("Vəziyyət", "Status", "Статус"),
      type: "select",
      required: true,
      defaultValue: "active",
      options: projectStatuses.map((value) => ({ value, label: projectLabels[value] })),
      admin: { position: "sidebar" },
    },
    {
      type: "row",
      fields: [
        { name: "startDate", label: l("Başlanğıc", "Start", "Начало"), type: "date" },
        { name: "dueDate", label: l("Təhvil tarixi", "Due date", "Срок сдачи"), type: "date" },
      ],
    },
    {
      name: "summary",
      label: l("Qısa təsvir", "Summary", "Краткое описание"),
      type: "textarea",
      admin: {
        description: l(
          "Müştəri portalda görür.",
          "The client sees this in the portal.",
          "Клиент видит это на портале.",
        ),
      },
    },
    {
      name: "stages",
      label: l("Mərhələlər", "Stages", "Этапы"),
      labels: {
        singular: l("Mərhələ", "Stage", "Этап"),
        plural: l("Mərhələlər", "Stages", "Этапы"),
      },
      type: "array",
      defaultValue: defaultStages,
      admin: { components: { RowLabel: "/payload/components/stage-row-label#StageRowLabel" } },
      fields: [
        {
          type: "row",
          fields: [
            { name: "name", label: l("Ad", "Name", "Название"), type: "text", required: true },
            {
              name: "status",
              label: l("Vəziyyət", "Status", "Статус"),
              type: "select",
              required: true,
              defaultValue: "todo",
              options: stageStatuses.map((value) => ({ value, label: stageLabels[value] })),
            },
            { name: "dueDate", label: l("Tarix", "Date", "Дата"), type: "date" },
          ],
        },
        {
          name: "note",
          label: l("Qeyd (müştəri görür)", "Note (the client sees it)", "Заметка (видна клиенту)"),
          type: "textarea",
        },
      ],
    },
    {
      name: "links",
      label: l("Linklər", "Links", "Ссылки"),
      labels: { singular: l("Link", "Link", "Ссылка"), plural: l("Linklər", "Links", "Ссылки") },
      type: "array",
      admin: {
        description: l(
          "Önizləmə, dizayn faylı və s. Müştəri portalda görür.",
          "A preview, the design file and so on. The client sees these in the portal.",
          "Превью, файл дизайна и т. п. Клиент видит их на портале.",
        ),
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "label", label: l("Ad", "Name", "Название"), type: "text", required: true },
            { name: "url", label: l("Ünvan", "Address", "Адрес"), type: "text", required: true },
          ],
        },
      ],
    },
    {
      // Added here (or in Screens); the client sees them in the portal and comments on each.
      name: "screens",
      label: l("Ekranlar", "Screens", "Экраны"),
      type: "join",
      collection: "project-screens",
      on: "project",
      defaultSort: "createdAt",
      defaultLimit: 50,
      admin: {
        defaultColumns: ["filename", "title", "createdAt"],
        description: l(
          "Dizayn və ekran şəkilləri. Müştəri portalda hər birinə şərh yaza bilir.",
          "Designs and screenshots. The client can comment on each in the portal.",
          "Дизайны и скриншоты. Клиент может комментировать каждый на портале.",
        ),
      },
    },
    {
      // The comments with the client, answered here: reply to one, or write a general one.
      name: "conversation",
      type: "ui",
      admin: { components: { Field: "/payload/components/project-thread#ProjectThread" } },
    },
  ],
};
