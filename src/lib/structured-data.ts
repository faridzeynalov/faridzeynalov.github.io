import type { Locale } from "@/i18n/routing";
import { localizedPath } from "@/lib/i18n-metadata";
import { siteUrl } from "@/lib/site";
import type { Profile } from "@/types/profile";
import type { Service } from "@/types/content";

/**
 * schema.org data (JSON-LD) that tells search engines who runs the site and what it offers:
 * the site, Farid as a person, and his website-building service in Baku, with each service as
 * an offer. Rendered in every page's <body> by the locale layout.
 */
export function siteStructuredData({
  locale,
  profile,
  description,
  servicesName,
  services,
  sameAs,
}: {
  locale: Locale;
  profile: Profile;
  description: string;
  servicesName: string;
  services: Service[];
  sameAs: string[];
}) {
  const url = (path: string) => `${siteUrl}${localizedPath(locale, path)}`;
  const person = { "@id": `${siteUrl}/#person` };
  const address = { "@type": "PostalAddress", addressLocality: "Baku", addressCountry: "AZ" };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: url("/"),
        name: profile.name,
        description,
        inLanguage: locale,
        publisher: person,
      },
      {
        "@type": "Person",
        ...person,
        name: profile.name,
        jobTitle: profile.role,
        url: url("/"),
        image: `${siteUrl}/og.png`,
        email: `mailto:${profile.email}`,
        telephone: profile.phoneHref,
        address,
        sameAs,
        knowsAbout: ["Web development", "Front-end development", "React", "Next.js", "SEO"],
      },
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#service`,
        name: `${profile.name} — ${servicesName}`,
        url: url("/services"),
        description,
        image: `${siteUrl}/og.png`,
        email: profile.email,
        telephone: profile.phoneHref,
        address,
        areaServed: [
          { "@type": "City", name: "Baku" },
          { "@type": "Country", name: "Azerbaijan" },
        ],
        founder: person,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: servicesName,
          itemListElement: services.map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: service.title,
              description: service.tagline,
            },
          })),
        },
      },
    ],
  };
}

/** FAQPage data for the questions on the Services page. */
export function faqStructuredData(faq: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

/** A <script type="application/ld+json"> body; "<" is escaped so text can't close the tag. */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
