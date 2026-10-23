import { profile } from "@/data/profile";
import { services } from "@/data/services";
import { getIndustryFilters } from "@/lib/industries";
import { getAllProjects, getFeaturedProjects } from "@/lib/projects";
import { withBasePath } from "@/lib/site";
import type { TreeNode } from "@/types/nav";

/**
 * The mobile menu as a VS Code-style file tree. Built on the server (it reads project data)
 * and passed to the client menu as plain props.
 */
export function buildNavTree(): TreeNode[] {
  const projects = getAllProjects();
  const linkedIn = profile.social.find((link) => link.label === "LinkedIn");

  return [
    { kind: "file", name: "home.tsx", href: "/", icon: "react" },
    {
      kind: "folder",
      name: "portfolio",
      icon: "portfolio",
      matchPrefix: "/portfolio/",
      children: [
        {
          kind: "file",
          name: "index.tsx",
          href: "/portfolio/",
          icon: "react",
          hint: `${projects.length} projects`,
        },
        { kind: "file", name: "list-view.tsx", href: "/portfolio/?view=list", icon: "react" },
        {
          kind: "folder",
          name: "featured",
          icon: "plain",
          children: getFeaturedProjects().map((project): TreeNode => ({
            kind: "file",
            name: `${project.slug}.tsx`,
            href: `/portfolio/${project.slug}/`,
            icon: "react",
          })),
        },
        {
          kind: "folder",
          name: "industries",
          icon: "plain",
          children: getIndustryFilters(projects).map((industry): TreeNode => ({
            kind: "file",
            name: industry.id,
            href: `/portfolio/?industry=${industry.id}`,
            icon: "filter",
            hint: String(industry.count),
          })),
        },
      ],
    },
    {
      kind: "folder",
      name: "services",
      icon: "services",
      matchPrefix: "/services/",
      children: [
        { kind: "file", name: "index.tsx", href: "/services/", icon: "react" },
        ...services.map((service): TreeNode => ({
          kind: "file",
          name: `${service.id}.tsx`,
          href: `/services/#${service.id}`,
          icon: "hash",
        })),
        { kind: "file", name: "process.md", href: "/services/#process", icon: "markdown" },
      ],
    },
    {
      kind: "folder",
      name: "cv",
      icon: "cv",
      matchPrefix: "/cv/",
      children: [
        { kind: "file", name: "index.tsx", href: "/cv/", icon: "react" },
        {
          kind: "file",
          name: "farid-zeynalov-cv.pdf",
          href: withBasePath("/farid-zeynalov-cv.pdf"),
          icon: "pdf",
          download: true,
        },
      ],
    },
    {
      kind: "folder",
      name: "about",
      icon: "about",
      matchPrefix: "/about/",
      children: [
        { kind: "file", name: "index.tsx", href: "/about/", icon: "react" },
        { kind: "file", name: "story.md", href: "/about/#story", icon: "markdown" },
        { kind: "file", name: "principles.md", href: "/about/#principles", icon: "markdown" },
        { kind: "file", name: "journey.md", href: "/about/#journey", icon: "markdown" },
      ],
    },
    {
      kind: "folder",
      name: "contact",
      icon: "contact",
      matchPrefix: "/contact/",
      children: [
        { kind: "file", name: "index.tsx", href: "/contact/", icon: "react" },
        {
          kind: "file",
          name: "email",
          href: `mailto:${profile.email}`,
          icon: "mail",
          hint: profile.email,
          external: true,
        },
        {
          kind: "file",
          name: "phone",
          href: `tel:${profile.phoneHref}`,
          icon: "phone",
          hint: profile.phone,
          external: true,
        },
        ...(linkedIn
          ? [
              {
                kind: "file",
                name: "linkedin",
                href: linkedIn.href,
                icon: "link",
                hint: linkedIn.handle,
                external: true,
              } satisfies TreeNode,
            ]
          : []),
      ],
    },
  ];
}
