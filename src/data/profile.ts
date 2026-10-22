import type { Profile } from "@/types/profile";

/**
 * Personal information — everything here comes from the CV.
 * Edit this file to update copy across the whole site.
 */
export const profile: Profile = {
  name: "Farid Zeynalov",
  firstName: "Farid",
  initials: "FZ",
  role: "Front-End Developer",
  location: "Baku, Azerbaijan",
  email: "zeynalovf7@gmail.com",
  phone: "+994 51 306 35 96",
  phoneHref: "+994513063596",
  yearsOfExperience: "4+",
  sitesShipped: "25+",
  industries: ["Hospitality", "Real estate", "Healthcare", "Education", "E-commerce"],
  summary:
    "Front-end developer with 4+ years of production experience. I build responsive, fast web apps with React, Next.js and TypeScript, and have shipped 25+ live websites and platforms.",
  cv: {
    title: "Front-End Developer (React / Next.js)",
    summary:
      "Front-End Developer with 4+ years of production experience building responsive, high-performance web applications with JavaScript, TypeScript, React, and Next.js. Shipped 25+ live websites and web platforms across hospitality, real estate, healthcare, education, and e-commerce, covering everything from RESTful API integration and component-based architecture to SEO and performance optimization. Strong in state management (Redux Toolkit, RTK Query) and writing clean, reusable, maintainable code. Seeking a middle-level Front-End role to keep growing React/Next.js expertise while owning larger, more complex features.",
  },
  about: [
    "I'm a front-end developer based in Baku. Since 2022 I've been at One Studio, where I've built and shipped more than 25 production websites for hotels, residential developments, clinics, retailers and industrial companies.",
    "Most of my day-to-day is React, Next.js, TypeScript and Tailwind CSS: turning designs into reusable component systems, wiring them to REST APIs for things like booking flows and catalogues, and making sure the result loads fast, ranks well and behaves the same in every browser.",
    "A lot of that work happens on live, business-critical sites, so I care about shipping changes carefully. I work directly with designers, backend engineers and clients, and I'm now looking for a mid-level front-end role where I can own larger, more complex features.",
  ],
  social: [
    {
      label: "Email",
      href: "mailto:zeynalovf7@gmail.com",
      handle: "zeynalovf7@gmail.com",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/farid-zeynalov-/",
      handle: "in/farid-zeynalov-",
    },
    {
      label: "Phone",
      href: "tel:+994513063596",
      handle: "+994 51 306 35 96",
    },
  ],
  skills: [
    {
      title: "Languages & markup",
      description: "The fundamentals everything else is built on.",
      items: ["JavaScript (ES6+)", "TypeScript", "HTML5", "CSS3"],
    },
    {
      title: "Frameworks & libraries",
      description: "Component-driven apps with predictable state and data fetching.",
      items: ["React", "Next.js (App Router)", "Redux Toolkit", "RTK Query", "Tailwind CSS"],
    },
    {
      title: "Testing",
      description: "Confidence in components before they reach production.",
      items: ["Jest", "React Testing Library"],
    },
    {
      title: "Tools & practices",
      description: "How the work gets shipped and kept healthy.",
      items: [
        "Git",
        "REST API integration",
        "Responsive design",
        "SEO",
        "Performance optimization",
        "Cross-browser compatibility",
        "Component-based architecture",
      ],
    },
  ],
  experience: [
    {
      role: "Front-End Developer",
      company: "One Studio",
      companyUrl: "https://one.az/",
      location: "Baku, Azerbaijan",
      start: "04/2022",
      end: "Present",
      highlights: [
        "Built and shipped 25+ production websites and web applications across hospitality, real estate, healthcare, education and e-commerce — including the Tabia Group Hotels portfolio.",
        "Developed responsive interfaces with React, Next.js, TypeScript and Tailwind CSS, replacing legacy markup with reusable component systems adopted across multiple client projects.",
        "Integrated RESTful APIs to power dynamic content, booking systems and interactive platforms.",
        "Implemented SEO best practices and performance optimizations — code splitting, lazy loading, image optimization.",
        "Maintained and extended live, business-critical applications without disrupting production traffic.",
        "Worked directly with designers, backend engineers and clients to turn business requirements into technical solutions.",
      ],
    },
  ],
  education: [
    {
      degree: "Master's degree",
      field: "Computer Science — Software of Computer Systems and Networks",
      institution: "Azerbaijan Technical University",
      start: "09/2018",
      end: "06/2020",
    },
    {
      degree: "Bachelor's degree",
      field: "Computer Engineering",
      institution: "Azerbaijan Technical University",
      start: "09/2014",
      end: "05/2018",
    },
  ],
  languages: [
    { name: "English", level: "Fluent" },
    { name: "Azerbaijani", level: "Native" },
    { name: "Turkish", level: "Fluent" },
    { name: "Russian", level: "Basic" },
  ],
  certificates: [{ name: "IELTS 7.0", period: "2019 – 2021" }],
};
