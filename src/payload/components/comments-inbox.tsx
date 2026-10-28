"use client";

import { Gutter, useConfig } from "@payloadcms/ui";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { countNew } from "@/payload/comments-seen";
import {
  fromClient,
  idOf,
  ProjectConversation,
  useComments,
  useCopy,
  useSeen,
  type Comment,
} from "./comment-threads";

type Project = {
  id: number;
  title: string;
  status?: string | null;
  client?: { name?: string } | number | null;
};

/** The client projects, with their client's name, for the cards. */
function useProjects() {
  const { config } = useConfig();
  const [projects, setProjects] = useState<Project[] | null>(null);
  useEffect(() => {
    let current = true;
    const url = `${config.serverURL ?? ""}${config.routes.api}/client-projects?depth=1&pagination=false&sort=-updatedAt`;
    void fetch(url, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((result: { docs: Project[] } | null) => {
        if (current && result) setProjects(result.docs);
      });
    return () => {
      current = false;
    };
  }, [config.routes.api, config.serverURL]);
  return projects;
}

/**
 * The comments section: first the client projects as cards (how many comments each has, how many
 * are new, the latest one), then, for the one you open, its conversation with a reply box under
 * each comment.
 */
export function CommentsInbox() {
  const { text, language } = useCopy();
  const pathname = usePathname();
  const selected = Number(useSearchParams().get("project")) || null;
  const projects = useProjects();
  const { comments, post, remove } = useComments("");
  const { seen, markSeen } = useSeen();

  const fresh = countNew(comments ?? [], seen).byProject;
  const ofProject = (id: number) => (comments ?? []).filter((c) => idOf(c.project) === id);
  const lastOf = (id: number): Comment | undefined => ofProject(id).at(-1);
  const clientName = (project: Project) =>
    typeof project.client === "object" ? project.client?.name : undefined;

  if (selected) {
    const project = projects?.find((p) => p.id === selected);
    return (
      <Gutter className="fz-inbox">
        <Link href={pathname} className="fz-inbox__back">
          ← {text.allProjects}
        </Link>
        <h1 className="fz-inbox__title">{project?.title ?? "…"}</h1>
        <p className="fz-inbox__intro">
          {project && clientName(project)}
          {project && clientName(project) && " · "}
          <Link href={`${pathname.replace(/project-comments$/, "client-projects")}/${selected}`}>
            {text.openProject}
          </Link>
        </p>
        <ProjectConversation
          project={selected}
          comments={comments ? ofProject(selected) : null}
          post={post}
          remove={remove}
          markSeen={markSeen}
        />
      </Gutter>
    );
  }

  const cards = [...(projects ?? [])].sort(
    (a, b) =>
      (fresh[b.id] ?? 0) - (fresh[a.id] ?? 0) ||
      (lastOf(b.id)?.createdAt ?? "").localeCompare(lastOf(a.id)?.createdAt ?? ""),
  );
  const date = (value: string) =>
    new Intl.DateTimeFormat(language, { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(value),
    );

  return (
    <Gutter className="fz-inbox">
      <h1 className="fz-inbox__title">{text.comments}</h1>
      <p className="fz-inbox__intro">{text.gridIntro}</p>
      {!projects || !comments ? (
        <p className="fz-inbox__empty">{text.loading}</p>
      ) : !cards.length ? (
        <p className="fz-inbox__empty">{text.noProjects}</p>
      ) : (
        <div className="fz-projects">
          {cards.map((project) => {
            const last = lastOf(project.id);
            const count = ofProject(project.id).length;
            const unread = fresh[project.id] ?? 0;
            return (
              <Link
                key={project.id}
                href={`${pathname}?project=${project.id}`}
                className="fz-project"
                data-new={unread ? "" : undefined}
              >
                <span className="fz-project__head">
                  <strong>{project.title}</strong>
                  {unread > 0 && <span className="fz-project__new">{text.newCount(unread)}</span>}
                </span>
                {clientName(project) && (
                  <span className="fz-project__client">{clientName(project)}</span>
                )}
                <span className="fz-project__last">
                  {last ? (
                    <>
                      <em>{fromClient(last) ? clientName(project) || text.client : text.me}:</em>{" "}
                      {last.body}
                    </>
                  ) : (
                    text.noConversation
                  )}
                </span>
                <span className="fz-project__foot">
                  <span>{text.count(count)}</span>
                  {last && <time dateTime={last.createdAt}>{date(last.createdAt)}</time>}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </Gutter>
  );
}
