/**
 * Identity facts that are the same in every language. Kept separate from profile.ts (which pulls
 * in every translation) so client components can import it cheaply.
 */
export const owner = {
  name: "Farid Zeynalov",
  firstName: "Farid",
  initials: "FZ",
  email: "zeynalovf7@gmail.com",
  phone: "+994 51 306 35 96",
  phoneHref: "+994513063596",
  linkedIn: { href: "https://www.linkedin.com/in/farid-zeynalov-/", handle: "in/farid-zeynalov-" },
} as const;
