"use client";

import { useConfig, useTranslation } from "@payloadcms/ui";
import { useCallback, useEffect, useState, type ReactNode } from "react";

/** The shared pieces of the comment conversations: one in each project, all of them in the list. */

type Ref<T> = (T & { id: number }) | number | null | undefined;

export type Comment = {
  id: number;
  body: string;
  createdAt: string;
  project: Ref<{ title?: string; client?: Ref<{ name?: string }> }>;
  parent?: Ref<object>;
  author?: { relationTo: "users" | "clients"; value: Ref<{ name?: string | null }> } | null;
};

export type Thread = { first: Comment; replies: Comment[]; last: Comment };

const copy = {
  az: {
    comments: "Şərhlər",
    conversation: "Söhbət",
    intro: "Müştərilərin şərhləri. Hər şərhin altına birbaşa cavab yaza bilərsiniz.",
    unsaved: "Layihəni yadda saxlayandan sonra söhbət burada görünəcək.",
    empty: "Hələ şərh yoxdur.",
    emptyWaiting: "Cavab gözləyən şərh yoxdur.",
    waiting: "Cavab gözləyir",
    all: "Hamısı",
    me: "Siz",
    client: "Müştəri",
    replyPlaceholder: "Cavab yazın…",
    general: "Ümumi şərh yazın…",
    hint: "Enter — göndər, Shift+Enter — yeni sətir",
    send: "Göndər",
    delete: "Sil",
    confirmDelete: "Bu şərh (və cavabları) silinsin?",
    error: "Alınmadı, yenidən cəhd edin.",
    loading: "Yüklənir…",
  },
  en: {
    comments: "Comments",
    conversation: "Conversation",
    intro: "Your clients' comments. Reply right under each one.",
    unsaved: "The conversation shows here once the project is saved.",
    empty: "No comments yet.",
    emptyWaiting: "Nothing is waiting for a reply.",
    waiting: "Awaiting reply",
    all: "All",
    me: "You",
    client: "Client",
    replyPlaceholder: "Write a reply…",
    general: "Write a general comment…",
    hint: "Enter to send, Shift+Enter for a new line",
    send: "Send",
    delete: "Delete",
    confirmDelete: "Delete this comment (and its replies)?",
    error: "That didn't work, try again.",
    loading: "Loading…",
  },
  ru: {
    comments: "Комментарии",
    conversation: "Переписка",
    intro: "Комментарии клиентов. Отвечайте прямо под каждым.",
    unsaved: "Переписка появится здесь после сохранения проекта.",
    empty: "Комментариев пока нет.",
    emptyWaiting: "Нет комментариев без ответа.",
    waiting: "Ждёт ответа",
    all: "Все",
    me: "Вы",
    client: "Клиент",
    replyPlaceholder: "Напишите ответ…",
    general: "Напишите общий комментарий…",
    hint: "Enter — отправить, Shift+Enter — новая строка",
    send: "Отправить",
    delete: "Удалить",
    confirmDelete: "Удалить этот комментарий (и ответы)?",
    error: "Не получилось, попробуйте ещё раз.",
    loading: "Загрузка…",
  },
};

export type Copy = (typeof copy)["az"];

export function useCopy() {
  const { i18n } = useTranslation();
  return { text: copy[i18n.language as keyof typeof copy] ?? copy.en, language: i18n.language };
}

export const idOf = (ref: Ref<object>) => (ref && typeof ref === "object" ? ref.id : ref);
export const fromClient = (comment: Comment) => comment.author?.relationTo === "clients";

/** Groups comments into threads (a comment and its replies), newest activity first if asked. */
export function toThreads(comments: Comment[], newestFirst = false): Thread[] {
  const threads = comments
    .filter((comment) => !idOf(comment.parent))
    .map((first) => {
      const replies = comments.filter((comment) => idOf(comment.parent) === first.id);
      return { first, replies, last: replies.at(-1) ?? first };
    });
  return newestFirst
    ? threads.sort((a, b) => b.last.createdAt.localeCompare(a.last.createdAt))
    : threads;
}

/** Loads comments (oldest first) through the REST API, with a reload for after a change. */
export function useComments(query: string | null) {
  const { config } = useConfig();
  const api = `${config.serverURL ?? ""}${config.routes.api}/project-comments`;
  const [comments, setComments] = useState<Comment[] | null>(null);

  const fetchComments = useCallback(async () => {
    const response = await fetch(`${api}?${query}&sort=createdAt&depth=2&pagination=false`, {
      credentials: "include",
    });
    return response.ok ? ((await response.json()) as { docs: Comment[] }).docs : null;
  }, [api, query]);

  useEffect(() => {
    if (query === null) return;
    let current = true;
    void fetchComments().then((docs) => {
      if (current && docs) setComments(docs);
    });
    return () => {
      current = false;
    };
  }, [fetchComments, query]);

  const reload = async () => {
    const docs = await fetchComments();
    if (docs) setComments(docs);
  };

  const post = async (project: number, body: string, parent?: number) => {
    const response = await fetch(api, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project, body, parent: parent ?? null }),
    });
    if (response.ok) await reload();
    return response.ok;
  };

  const remove = async (comment: Comment) => {
    await fetch(`${api}/${comment.id}`, { method: "DELETE", credentials: "include" });
    await reload();
  };

  return { comments, post, remove };
}

/** A one-line box that grows as you type; Enter sends, Shift+Enter starts a new line. */
export function ReplyBox({
  placeholder,
  onSend,
  text,
}: {
  placeholder: string;
  onSend: (body: string) => Promise<boolean>;
  text: Copy;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const send = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    const ok = await onSend(body.trim());
    setBusy(false);
    setFailed(!ok);
    if (ok) setBody("");
  };
  return (
    <div className="fz-reply">
      <div className="fz-reply__box">
        <textarea
          value={body}
          rows={1}
          maxLength={5000}
          placeholder={placeholder}
          title={text.hint}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              void send();
            }
          }}
        />
        <button
          type="button"
          className="fz-reply__send"
          onClick={() => void send()}
          disabled={busy || !body.trim()}
        >
          {text.send}
        </button>
      </div>
      {failed && <p className="fz-reply__error">{text.error}</p>}
    </div>
  );
}

function Message({
  comment,
  text,
  language,
  onDelete,
}: {
  comment: Comment;
  text: Copy;
  language: string;
  onDelete: (comment: Comment) => void;
}) {
  const author = comment.author?.value;
  const name = fromClient(comment)
    ? (typeof author === "object" && author?.name) || text.client
    : text.me;
  return (
    <div className={`fz-msg${fromClient(comment) ? "" : "fz-msg--me"}`}>
      <span className="fz-msg__avatar" aria-hidden>
        {name.trim().charAt(0).toUpperCase()}
      </span>
      <div className="fz-msg__main">
        <p className="fz-msg__meta">
          <strong>{name}</strong>
          <time dateTime={comment.createdAt}>
            {new Intl.DateTimeFormat(language, { dateStyle: "medium", timeStyle: "short" }).format(
              new Date(comment.createdAt),
            )}
          </time>
          <button
            type="button"
            className="fz-msg__delete"
            onClick={() => window.confirm(text.confirmDelete) && onDelete(comment)}
          >
            {text.delete}
          </button>
        </p>
        <p className="fz-msg__body">{comment.body}</p>
      </div>
    </div>
  );
}

/** A comment, its replies under it, and a box to reply. */
export function ThreadCard({
  thread,
  header,
  text,
  language,
  onReply,
  onDelete,
}: {
  thread: Thread;
  header?: ReactNode;
  text: Copy;
  language: string;
  onReply: (body: string) => Promise<boolean>;
  onDelete: (comment: Comment) => void;
}) {
  const waiting = fromClient(thread.last);
  return (
    <article className={`fz-card${waiting ? "fz-card--waiting" : ""}`}>
      {(header || waiting) && (
        <header className="fz-card__header">
          {header}
          {waiting && <span className="fz-card__badge">{text.waiting}</span>}
        </header>
      )}
      <Message comment={thread.first} text={text} language={language} onDelete={onDelete} />
      {thread.replies.length > 0 && (
        <div className="fz-card__replies">
          {thread.replies.map((reply) => (
            <Message
              key={reply.id}
              comment={reply}
              text={text}
              language={language}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
      <ReplyBox text={text} placeholder={text.replyPlaceholder} onSend={onReply} />
    </article>
  );
}
