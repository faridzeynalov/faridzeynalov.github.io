export type TreeFileIcon =
  "react" | "markdown" | "pdf" | "mail" | "phone" | "link" | "hash" | "filter";
export type TreeFolderIcon = "portfolio" | "services" | "cv" | "about" | "contact" | "plain";

export interface TreeFile {
  kind: "file";
  name: string;
  href: string;
  icon: TreeFileIcon;
  /** Muted text after the name, e.g. a count or value. */
  hint?: string;
  external?: boolean;
  download?: boolean;
}

export interface TreeFolder {
  kind: "folder";
  name: string;
  icon: TreeFolderIcon;
  /** Paths under this prefix open the folder automatically. */
  matchPrefix?: string;
  children: TreeNode[];
}

export type TreeNode = TreeFile | TreeFolder;
