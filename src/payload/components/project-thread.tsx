"use client";

import { Button, useConfig, useDocumentInfo, useTranslation } from "@payloadcms/ui";
import { useCallback, useEffect, useState } from "react";

type Author = { relationTo: "users" | "clients"; value: { name?: string | null } | number };
type Comment = {
  id: number;
  body: string;
  createdAt: string;
  parent?: { id: number } | number | null;
  author?: Author | null;
};

const copy = {
  az: {
    title: "Söhbət",
    unsaved: "Layihəni yadda saxlayandan sonra söhbət burada görünəcək.",
    empty: "Hələ şərh yoxdur.",
    me: "Siz",
    client: "Müştəri",
    reply: "Cavab ver",
    replyTo: "cavab:",
    cancel: "Ləğv et",
    send: "Göndər",
    delete: "Sil",
    confirmDelete: "Bu şərh (və cavabları) silinsin?",
    general: "Ümumi şərh yazın…",
    replyPlaceholder: "Cavabınız…",
    error: "Alınmadı, yenidən cəhd edin.",
  },
  en: {
    title: "Conversation",
    unsaved: "The conversation shows here once the project is saved.",
    empty: "No comments yet.",
    me: "You",
    client: "Client",
    reply: "Reply",
    replyTo: "replying to",
    cancel: "Cancel",
    send: "Send",
    delete: "Delete",
    confirmDelete: "Delete this comment (and its replies)?",
    general: "Write a general comment…",
    replyPlaceholder: "Your reply…",
    error: "That didn't work, try again.",
  },
  ru: {
    title: "Переписка",
    unsaved: "Переписка появится здесь после сохранения проекта.",
    empty: "Комментариев пока нет.",
    me: "Вы",
    client: "Клиент",
    reply: "Ответить",
    replyTo: "ответ:",
    cancel: "Отмена",
    send: "Отправить",
    delete: "Удалить",
    confirmDelete: "Удалить этот комментарий (и ответы)?",
    general: "Напишите общий комментарий…",
    replyPlaceholder: "Ваш ответ…",
    error: "Не получилось, попробуйте ещё раз.",
  },
};

const parentOf = (comment: Comment) =>
  comment.parent && typeof comment.parent === "object" ? comment.parent.id : comment.parent;

function Composer({
  placeholder,
  onSend,
  onCancel,
  text,
}: {
  placeholder: string;
  onSend: (body: string) => Promise<boolean>;
  onCancel?: () => void;
  text: (typeof copy)["az"];
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const send = async () => {
    if (!body.trim()) return;
    setBusy(true);
    const ok = await onSend(body.trim());
    setBusy(false);
    setFailed(!ok);
    if (ok) setBody("");
  };
  return (
    <div className="fz-thread__composer">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void send();
        }}
        placeholder={placeholder}
        rows={onCancel ? 2 : 3}
        maxLength={5000}
        autoFocus={Boolean(onCancel)}
      />
      {failed && <p className="fz-thread__error">{text.error}</p>}
      <div className="fz-thread__actions">
        {onCancel && (
          <Button buttonStyle="secondary" size="small" onClick={onCancel} margin={false}>
            {text.cancel}
          </Button>
        )}
        <Button
          size="small"
          onClick={() => void send()}
          disabled={busy || !body.trim()}
          margin={false}
        >
          {text.send}
        </Button>
      </div>
    </div>
  );
}

/**
 * The project's conversation, in the project itself: the client's comments with a reply button
 * each (replies sit under the comment, as on Instagram) and a box for a general comment.
 */
export function ProjectThread() {
  const { id } = useDocumentInfo();
  const { config } = useConfig();
  const { i18n } = useTranslation();
  const text = copy[i18n.language as keyof typeof copy] ?? copy.en;
  const api = `${config.serverURL ?? ""}${config.routes.api}/project-comments`;
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const fetchComments = useCallback(async () => {
    const query = `where[project][equals]=${id}&sort=createdAt&depth=1&pagination=false`;
    const response = await fetch(`${api}?${query}`, { credentials: "include" });
    return response.ok ? ((await response.json()) as { docs: Comment[] }).docs : null;
  }, [api, id]);

  const load = async () => {
    const docs = await fetchComments();
    if (docs) setComments(docs);
  };

  useEffect(() => {
    if (!id) return;
    let current = true;
    void fetchComments().then((docs) => {
      if (current && docs) setComments(docs);
    });
    return () => {
      current = false;
    };
  }, [fetchComments, id]);

  const post = async (body: string, parent?: number) => {
    const response = await fetch(api, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: id, body, parent: parent ?? null }),
    });
    if (!response.ok) return false;
    setReplyingTo(null);
    await load();
    return true;
  };

  const remove = async (comment: Comment) => {
    if (!window.confirm(text.confirmDelete)) return;
    await fetch(`${api}/${comment.id}`, { method: "DELETE", credentials: "include" });
    await load();
  };

  if (!id)
    return (
      <div className="fz-thread">
        <h3 className="fz-thread__title">{text.title}</h3>
        <p className="fz-thread__empty">{text.unsaved}</p>
      </div>
    );

  const date = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(value),
    );
  const nameOf = (comment: Comment) => {
    const author = comment.author;
    if (author?.relationTo === "users") return text.me;
    return (typeof author?.value === "object" && author.value.name) || text.client;
  };
  const threads = (comments ?? []).filter((comment) => !parentOf(comment));
  const repliesTo = (thread: Comment) =>
    (comments ?? []).filter((comment) => parentOf(comment) === thread.id);

  const bubble = (comment: Comment, thread: Comment) => (
    <div
      className={`fz-thread__bubble${comment.author?.relationTo === "users" ? "fz-thread__bubble--me" : ""}`}
    >
      <p className="fz-thread__meta">
        <strong>{nameOf(comment)}</strong>
        <time dateTime={comment.createdAt}>{date(comment.createdAt)}</time>
      </p>
      <p className="fz-thread__body">{comment.body}</p>
      <p className="fz-thread__links">
        <button type="button" onClick={() => setReplyingTo(thread.id)}>
          {text.reply}
        </button>
        <button type="button" onClick={() => void remove(comment)}>
          {text.delete}
        </button>
      </p>
    </div>
  );

  return (
    <div className="fz-thread" id="conversation">
      <h3 className="fz-thread__title">{text.title}</h3>
      {comments && !threads.length && <p className="fz-thread__empty">{text.empty}</p>}
      <ul className="fz-thread__list">
        {threads.map((thread) => (
          <li key={thread.id}>
            {bubble(thread, thread)}
            {(repliesTo(thread).length > 0 || replyingTo === thread.id) && (
              <ul className="fz-thread__replies">
                {repliesTo(thread).map((reply) => (
                  <li key={reply.id}>{bubble(reply, thread)}</li>
                ))}
                {replyingTo === thread.id && (
                  <li>
                    <p className="fz-thread__replying">
                      {text.replyTo} <strong>{nameOf(thread)}</strong>
                    </p>
                    <Composer
                      text={text}
                      placeholder={text.replyPlaceholder}
                      onSend={(body) => post(body, thread.id)}
                      onCancel={() => setReplyingTo(null)}
                    />
                  </li>
                )}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <Composer text={text} placeholder={text.general} onSend={(body) => post(body)} />
    </div>
  );
}
