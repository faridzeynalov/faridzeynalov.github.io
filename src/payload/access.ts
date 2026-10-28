import type { Access, FieldAccess } from "payload";

/**
 * Who may do what. Two kinds of accounts sign in: admins ("users", the admin panel) and clients
 * ("clients", the portal). Payload's default lets any signed-in account write, so every
 * collection and global names its rules explicitly.
 */
export const isAdmin: Access = ({ req }) => req.user?.collection === "users";

export const isAdminField: FieldAccess = ({ req }) => req.user?.collection === "users";

export const anyone: Access = () => true;

/** Site content: public to read, only admins change it. */
export const publicContent = {
  read: anyone,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
};

/** Admin-only, reading included (admin accounts, clients' private data). */
export const adminOnly = {
  read: isAdmin,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
};
