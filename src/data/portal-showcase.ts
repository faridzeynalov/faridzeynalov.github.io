import type { Locale } from "@/i18n/routing";

export type PortalFeatureIcon = "stages" | "screens" | "comments" | "notify" | "secure";
export type DemoProjectStatus = "planned" | "active" | "paused" | "done";
export type DemoStageStatus = "todo" | "in_progress" | "review" | "done";

/** The home page's client portal section: what the portal does, and a sample client panel. */
export interface PortalShowcase {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  features: { icon: PortalFeatureIcon; title: string; text: string }[];
  cta: string;
  note: string;
  demo: {
    badge: string;
    project: string;
    client: string;
    status: DemoProjectStatus;
    /** ISO date, shown in the reader's language. */
    due: string | null;
    stages: { name: string; status: DemoStageStatus; note?: string }[];
    comments: { from: "client" | "me"; author: string; body: string }[];
  };
}

const demoShape = {
  status: "active" as const,
  due: "2026-12-15",
};

const showcase: Record<Locale, PortalShowcase> = {
  az: {
    eyebrow: "Müştəri portalı",
    title: "Layihəniz hər an",
    accent: "gözünüzün önündə.",
    description:
      "Birlikdə işlədiyimiz müddətdə sizin üçün şəxsi panel açıram: layihənin hansı mərhələdə olduğunu, dizaynları və növbəti addımları oradan izləyir, fikirlərinizi birbaşa yazırsınız.",
    features: [
      {
        icon: "stages",
        title: "Mərhələlər və irəliləyiş",
        text: "Kəşfdən buraxılışa qədər hər mərhələnin statusu və ümumi irəliləyiş.",
      },
      {
        icon: "screens",
        title: "Dizayn skrinşotları",
        text: "Ekran dizaynlarına baxın və hər birinə ayrıca şərh yazın.",
      },
      {
        icon: "comments",
        title: "Şərhlər və cavablar",
        text: "Suallarınızı layihənin içində yazın, cavabı elə orada alın.",
      },
      {
        icon: "notify",
        title: "Email bildirişləri",
        text: "Yeni cavab və ya yenilik olanda email ilə xəbər tutursunuz.",
      },
    ],
    cta: "Portala daxil ol",
    note: "Giriş dəvətlədir: layihəyə başlayanda sizə dəvət məktubu göndərirəm.",
    demo: {
      ...demoShape,
      badge: "Nümunə",
      project: "Restoran saytı",
      client: "Aysel",
      stages: [
        { name: "Kəşf", status: "done", note: "Tələblər və sayt xəritəsi təsdiqləndi." },
        { name: "Dizayn", status: "done" },
        {
          name: "Hazırlama",
          status: "in_progress",
          note: "Menyu və rezervasiya səhifələri hazırlanır.",
        },
        { name: "Buraxılış", status: "todo" },
      ],
      comments: [
        {
          from: "client",
          author: "Aysel",
          body: "Rezervasiya formasına uşaq oturacağı seçimi də əlavə edək?",
        },
        { from: "me", author: "Farid", body: "Əlbəttə, bu həftə əlavə edirəm." },
      ],
    },
  },
  en: {
    eyebrow: "Client portal",
    title: "Your project,",
    accent: "always in view.",
    description:
      "While we work together you get your own panel: see which stage the project is at, look at the designs and the next steps, and share your thoughts right there.",
    features: [
      {
        icon: "stages",
        title: "Stages and progress",
        text: "Every stage from discovery to launch, with its status and the overall progress.",
      },
      {
        icon: "screens",
        title: "Design screenshots",
        text: "Look through the screen designs and comment on each one.",
      },
      {
        icon: "comments",
        title: "Comments and replies",
        text: "Ask inside the project and get the answer right there.",
      },
      {
        icon: "notify",
        title: "Email notifications",
        text: "An email lets you know when there's a reply or an update.",
      },
    ],
    cta: "Sign in to the portal",
    note: "It's by invitation: when we start a project, I send you one.",
    demo: {
      ...demoShape,
      badge: "Example",
      project: "Restaurant website",
      client: "Aysel",
      stages: [
        { name: "Discovery", status: "done", note: "Requirements and sitemap approved." },
        { name: "Design", status: "done" },
        {
          name: "Development",
          status: "in_progress",
          note: "Building the menu and booking pages.",
        },
        { name: "Launch", status: "todo" },
      ],
      comments: [
        {
          from: "client",
          author: "Aysel",
          body: "Could the booking form also ask whether a high chair is needed?",
        },
        { from: "me", author: "Farid", body: "Of course, I'll add it this week." },
      ],
    },
  },
  ru: {
    eyebrow: "Клиентский портал",
    title: "Ваш проект",
    accent: "всегда на виду.",
    description:
      "Пока мы работаем вместе, у вас есть личная панель: на каком этапе проект, какие готовы дизайны и что дальше — и там же можно оставить свои замечания.",
    features: [
      {
        icon: "stages",
        title: "Этапы и прогресс",
        text: "Каждый этап от анализа до запуска, его статус и общий прогресс.",
      },
      {
        icon: "screens",
        title: "Скриншоты дизайна",
        text: "Смотрите макеты экранов и комментируйте каждый отдельно.",
      },
      {
        icon: "comments",
        title: "Комментарии и ответы",
        text: "Задавайте вопросы прямо в проекте и получайте ответ там же.",
      },
      {
        icon: "notify",
        title: "Уведомления по email",
        text: "Письмо сообщит, когда появится ответ или новость.",
      },
    ],
    cta: "Войти в портал",
    note: "Вход по приглашению: когда мы начинаем проект, я его отправляю.",
    demo: {
      ...demoShape,
      badge: "Пример",
      project: "Сайт ресторана",
      client: "Айсель",
      stages: [
        { name: "Анализ", status: "done", note: "Требования и карта сайта утверждены." },
        { name: "Дизайн", status: "done" },
        {
          name: "Разработка",
          status: "in_progress",
          note: "Делаю страницы меню и бронирования.",
        },
        { name: "Запуск", status: "todo" },
      ],
      comments: [
        {
          from: "client",
          author: "Айсель",
          body: "Можно добавить в форму бронирования выбор детского стульчика?",
        },
        { from: "me", author: "Фарид", body: "Конечно, добавлю на этой неделе." },
      ],
    },
  },
};

export function getPortalShowcase(locale: Locale): PortalShowcase {
  return showcase[locale];
}
