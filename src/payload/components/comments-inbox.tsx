"use client";

import { Gutter, useConfig } from "@payloadcms/ui";
import Link from "next/link";
import { useState } from "react";
import { idOf, ThreadCard, toThreads, fromClient, useComments, useCopy } from "./comment-threads";

/**
 * The comments list as an inbox: every conversation, the latest activity first, each with a box to
 * reply right there. "Awaiting reply" shows the ones whose last word is the client's.
 */
export function CommentsInbox() {
  const { text, language } = useCopy();
  const { config } = useConfig();
  const { comments, post, remove } = useComments("");
  const [onlyWaiting, setOnlyWaiting] = useState(false);
  const threads = toThreads(comments ?? [], true);
  const waiting = threads.filter((thread) => fromClient(thread.last));
  const shown = onlyWaiting ? waiting : threads;

  return (
    <Gutter className="fz-inbox">
      <h1 className="fz-inbox__title">{text.comments}</h1>
      <p className="fz-inbox__intro">{text.intro}</p>
      <div className="fz-inbox__filters" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={!onlyWaiting}
          onClick={() => setOnlyWaiting(false)}
        >
          {text.all} <span>{threads.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={onlyWaiting}
          onClick={() => setOnlyWaiting(true)}
        >
          {text.waiting} <span>{waiting.length}</span>
        </button>
      </div>
      {!comments ? (
        <p className="fz-inbox__empty">{text.loading}</p>
      ) : !shown.length ? (
        <p className="fz-inbox__empty">{onlyWaiting ? text.emptyWaiting : text.empty}</p>
      ) : (
        <div className="fz-inbox__list">
          {shown.map((thread) => {
            const project = thread.first.project;
            const projectId = idOf(project) as number;
            const client = typeof project === "object" ? project?.client : null;
            return (
              <ThreadCard
                key={thread.first.id}
                thread={thread}
                text={text}
                language={language}
                header={
                  <p className="fz-card__project">
                    <Link
                      href={`${config.routes.admin}/collections/client-projects/${projectId}#conversation`}
                    >
                      {(typeof project === "object" && project?.title) || `#${projectId}`}
                    </Link>
                    {typeof client === "object" && client?.name && <span>{client.name}</span>}
                  </p>
                }
                onReply={(body) => post(projectId, body, thread.first.id)}
                onDelete={(comment) => void remove(comment)}
              />
            );
          })}
        </div>
      )}
    </Gutter>
  );
}
