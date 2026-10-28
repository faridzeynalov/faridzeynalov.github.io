import type { Access, CollectionBeforeDeleteHook, CollectionConfig } from "payload";
import { isAdmin } from "@/payload/access";
import { portalGroup } from "@/payload/collections/client-projects";
import { l } from "@/payload/fields";

/** Admins see every screen; a client the screens of their own projects. */
const ownScreens: Access = ({ req }) => {
  if (req.user?.collection === "users") return true;
  if (req.user?.collection === "clients") return { "project.client": { equals: req.user.id } };
  return false;
};

/** A deleted screen takes the comments on it with it. */
const deleteComments: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await req.payload.delete({
    collection: "project-comments",
    where: { screen: { equals: id } },
    req,
  });
};

/**
 * Screens (designs, screenshots) of a client project, for the client to look at and comment on in
 * the portal. Unlike Media, the files aren't public: Payload serves them after checking access, and
 * the portal passes them on to the project's client (app/api/portal-screens).
 */
export const ProjectScreens: CollectionConfig = {
  slug: "project-screens",
  labels: {
    singular: l("Ekran", "Screen", "Экран"),
    plural: l("Ekranlar", "Screens", "Экраны"),
  },
  admin: {
    group: portalGroup,
    useAsTitle: "title",
    defaultColumns: ["filename", "title", "project", "createdAt"],
    description: l(
      "Layihənin dizayn və ekran şəkilləri. Müştəri onları portalda görür və şərh yazır.",
      "The project's designs and screenshots. The client sees them in the portal and comments.",
      "Дизайны и скриншоты проекта. Клиент видит их на портале и комментирует.",
    ),
  },
  defaultSort: "createdAt",
  access: { read: ownScreens, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: { beforeDelete: [deleteComments] },
  upload: {
    mimeTypes: ["image/*"],
    imageSizes: [{ name: "thumb", width: 900, withoutEnlargement: true }],
    adminThumbnail: "thumb",
    focalPoint: false,
    crop: false,
  },
  fields: [
    {
      name: "project",
      label: l("Layihə", "Project", "Проект"),
      type: "relationship",
      relationTo: "client-projects",
      required: true,
      index: true,
    },
    { name: "title", label: l("Ad", "Title", "Название"), type: "text", required: true },
    {
      name: "note",
      label: l("Qeyd", "Note", "Заметка"),
      type: "textarea",
      admin: {
        description: l(
          "Müştəri üçün qısa izah (istəyə bağlı).",
          "A short explanation for the client (optional).",
          "Короткое пояснение для клиента (необязательно).",
        ),
      },
    },
  ],
};
