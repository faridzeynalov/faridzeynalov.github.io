import type { CollectionConfig } from "payload";
import { adminOnly } from "@/payload/access";
import { groups, l } from "@/payload/fields";

/** Who can sign in to the admin panel. */
export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: l("İstifadəçi", "User", "Пользователь"),
    plural: l("İstifadəçilər", "Users", "Пользователи"),
  },
  admin: { useAsTitle: "email", group: groups.system },
  auth: true,
  access: adminOnly,
  fields: [
    { name: "name", label: l("Ad", "Name", "Имя"), type: "text" },
    {
      name: "avatar",
      label: l("Profil şəkli", "Profile photo", "Фото профиля"),
      type: "upload",
      relationTo: "media",
      filterOptions: { mimeType: { contains: "image" } },
      admin: {
        description: l(
          "Admin paneldə sağ yuxarıda və idarə panelində görünür. Kvadrat şəkil ən yaxşısıdır.",
          "Shown at the top right of the admin and on the dashboard. A square photo works best.",
          "Показывается справа вверху и на панели управления. Лучше квадратное фото.",
        ),
      },
    },
  ],
};
