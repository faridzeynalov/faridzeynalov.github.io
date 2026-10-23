import type { SiteContent } from "@/content/types";

/** English content — the source text. az.ts and ru.ts mirror this structure. */
export const en: SiteContent = {
  profile: {
    role: "Front-End Developer",
    location: "Baku, Azerbaijan",
    present: "Present",
    summary:
      "Front-end developer with 4+ years of production experience. I build responsive, fast web apps with React, Next.js and TypeScript, and have shipped 25+ live websites and platforms.",
    about: [
      "I'm a front-end developer based in Baku. Since 2022 I've been at One Studio, where I've built and shipped more than 25 production websites for hotels, residential developments, clinics, retailers and industrial companies.",
      "Most of my day-to-day is React, Next.js, TypeScript and Tailwind CSS: turning designs into reusable component systems, wiring them to REST APIs for things like booking flows and catalogues, and making sure the result loads fast, ranks well and behaves the same in every browser.",
      "A lot of that work happens on live, business-critical sites, so I care about shipping changes carefully. I work directly with designers, backend engineers and clients, and I'm now looking for a mid-level front-end role where I can own larger, more complex features.",
    ],
    industries: ["Hospitality", "Real estate", "Healthcare", "Education", "E-commerce"],
    cv: {
      title: "Front-End Developer (React / Next.js)",
      summary:
        "Front-End Developer with 4+ years of production experience building responsive, high-performance web applications with JavaScript, TypeScript, React, and Next.js. Shipped 25+ live websites and web platforms across hospitality, real estate, healthcare, education, and e-commerce, covering everything from RESTful API integration and component-based architecture to SEO and performance optimization. Strong in state management (Redux Toolkit, RTK Query) and writing clean, reusable, maintainable code. Seeking a middle-level Front-End role to keep growing React/Next.js expertise while owning larger, more complex features.",
    },
    skills: [
      {
        title: "Languages & markup",
        description: "The fundamentals everything else is built on.",
        items: ["JavaScript (ES6+)", "TypeScript", "HTML5", "CSS3"],
      },
      {
        title: "Frameworks & libraries",
        description: "Component-driven apps with predictable state and data fetching.",
        items: [
          "React",
          "Next.js (App Router)",
          "Redux Toolkit",
          "RTK Query",
          "Zustand",
          "Tailwind CSS",
        ],
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
          "Docker",
          "REST API integration",
          "GraphQL",
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
        location: "Baku, Azerbaijan",
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
      },
      {
        degree: "Bachelor's degree",
        field: "Computer Engineering",
        institution: "Azerbaijan Technical University",
      },
    ],
    languages: [
      {
        name: "English",
        level: "Fluent",
      },
      {
        name: "Azerbaijani",
        level: "Native",
      },
      {
        name: "Turkish",
        level: "Fluent",
      },
      {
        name: "Russian",
        level: "Basic",
      },
    ],
    certificates: [
      {
        name: "IELTS 7.0",
        period: "2019 – 2021",
      },
    ],
  },
  services: {
    frontend: {
      title: "Front-end development",
      tagline: "React, Next.js & TypeScript",
      description:
        "Production-ready websites and web apps built with React, Next.js and TypeScript. Clean, component-based code that's fast, accessible and easy for your team to extend long after launch.",
      deliverables: [
        "React & Next.js (App Router) applications",
        "Reusable, strictly typed component systems",
        "State management with Redux Toolkit, RTK Query or Zustand",
        "Responsive, cross-browser layouts down to the pixel",
      ],
    },
    design: {
      title: "UI design & design systems",
      tagline: "Interfaces with intent",
      description:
        "Interfaces that look considered and feel effortless. I turn rough ideas or existing designs into a consistent visual language — spacing, typography, colour and every interactive state worked out.",
      deliverables: [
        "UI concepts, page layouts and responsive variants",
        "Design tokens and component libraries",
        "Motion and micro-interactions that guide, not distract",
        "Accessible colour, contrast and focus states",
      ],
    },
    seo: {
      title: "SEO & performance",
      tagline: "Fast, findable, measurable",
      description:
        "Sites that load quickly and get found. Technical SEO and performance are built in from the first commit — not bolted on after launch — so search engines and real users both get a fast experience.",
      deliverables: [
        "Technical SEO: metadata, sitemaps, Open Graph, semantic HTML",
        "Core Web Vitals and Lighthouse optimisation",
        "Code splitting, lazy loading and image optimisation",
        "Static generation and caching strategies",
      ],
    },
    ai: {
      title: "AI integration",
      tagline: "Practical AI in your product",
      description:
        "AI features your users will actually use: assistants, smart search and content tools connected to modern LLM APIs, with streaming, clear loading states and safe fallbacks so they feel fast and trustworthy.",
      deliverables: [
        "Chat and assistant interfaces with streamed responses",
        "LLM API integration (OpenAI, Anthropic)",
        "AI-powered search, summaries and content tools",
        "Prompt design with structured, validated output",
      ],
    },
    integrations: {
      title: "APIs & web applications",
      tagline: "Connected to real data",
      description:
        "Dynamic products wired to real data — booking flows, catalogues, dashboards and forms connected to REST or GraphQL APIs, with solid loading, empty and error states at every step.",
      deliverables: [
        "REST and GraphQL API integration",
        "Booking systems, product catalogues and filters",
        "Forms, validation and error handling",
        "Multilingual sites (Azerbaijani, English, Russian)",
      ],
    },
    maintenance: {
      title: "Maintenance & optimisation",
      tagline: "Care for live products",
      description:
        "Ongoing care for live, business-critical sites. New features, fixes and performance improvements shipped carefully, without disrupting the traffic and customers that depend on them.",
      deliverables: [
        "Feature development on existing codebases",
        "Bug fixing and cross-browser / cross-device QA",
        "Migrating legacy markup to modern components",
        "Dependency upgrades and code audits",
      ],
    },
  },
  process: [
    {
      title: "Discover",
      description:
        "We talk through goals, audience and constraints. I review existing designs, content and code, then agree on scope, priorities and timeline.",
    },
    {
      title: "Design",
      description:
        "Layouts, components and every interactive state are defined — in your design files or mine — with responsive behaviour and accessibility considered up front.",
    },
    {
      title: "Build",
      description:
        "Typed, component-based implementation with regular previews, so you see progress early and can steer before the details are locked in.",
    },
    {
      title: "Launch & care",
      description:
        "Performance, SEO and cross-browser checks before launch — then improvements, fixes and new features as the product grows.",
    },
  ],
  ai: {
    intro:
      "I use AI tools every day to prototype, refactor and test faster — and I build AI-powered features into the interfaces I ship. The judgment, the review and the final quality stay with me.",
    capabilities: [
      {
        title: "AI-assisted development",
        description:
          "Pairing with AI coding assistants to scaffold components, refactor legacy code, write tests and review changes — with every line reviewed before it ships.",
      },
      {
        title: "LLM integration",
        description:
          "Connecting front ends to large language model APIs: server-side calls that keep keys safe, streamed responses, retries, rate limits and graceful fallbacks.",
      },
      {
        title: "Conversational UI",
        description:
          "Chat and assistant interfaces that feel responsive — streamed tokens, cancellation, message history, Markdown rendering and fully keyboard-accessible flows.",
      },
      {
        title: "Prompt engineering",
        description:
          "Structured prompts and system instructions, JSON output checked against a schema, and testing responses so AI features behave predictably in production.",
      },
    ],
    skills: [
      "AI-assisted development",
      "LLM API integration",
      "Conversational UI",
      "Prompt engineering",
    ],
  },
  principles: [
    {
      title: "Clean, reusable code",
      text: "Component-based architecture that teams can read, reuse and extend — replacing one-off markup with systems that scale across projects.",
    },
    {
      title: "Fast and findable by default",
      text: "Performance and SEO are part of the build, not an afterthought: code splitting, lazy loading, optimised images and solid metadata.",
    },
    {
      title: "Close collaboration",
      text: "Working directly with designers, backend engineers and clients to turn business requirements into products that ship.",
    },
  ],
  industries: {
    hospitality: "Hospitality",
    "real-estate": "Real estate",
    healthcare: "Healthcare",
    "e-commerce": "E-commerce",
    corporate: "Corporate & industrial",
    education: "Education",
  },
  projects: {
    panorama: {
      summary:
        "A seaside residential concept that pairs high-fashion branding with coastal living.",
      overview:
        "Marketing site for Panorama by ELIE SAAB, a residential project positioned around sea views and the fashion house's design language. The site walks visitors through the residences and on-site infrastructure, and turns interest into enquiries and brochure downloads.",
      liveFeatures: [
        "Residences and infrastructure sections with full-bleed architectural imagery",
        "Enquiry call-to-action in the header and a downloadable brochure",
        "Light/dark switch in the header",
        "Azerbaijani, English and Russian versions",
      ],
    },
    "garabagh-resort": {
      summary: "Resort website for a Naftalan wellness hotel, built around treatments and booking.",
      overview:
        "Garabagh Resort & SPA in Naftalan combines a hotel stay with the town's known Naftalan oil treatments. The site presents accommodation, treatment programmes, medical packages, the spa and dining, with booking available from the first screen.",
      liveFeatures: [
        "Hero booking bar with arrival/departure dates, rooms, guests and promo code",
        "Live local time and weather for the hotel's location in the hero",
        "Room and suite listings with image carousels",
        "Azerbaijani, English and Russian versions",
        "Dedicated sections for Naftalan treatment and medical packages",
      ],
    },
    "24k": {
      summary: "Online jewellery catalogue with categories, product listings and store locations.",
      overview:
        "24K.az is a jewellery retailer's online catalogue. Shoppers can browse sets, necklaces, earrings, bracelets, rings, brooches and gold bullion, see prices, and find the brand's physical stores.",
      liveFeatures: [
        "Category navigation for the full jewellery range",
        "Product grid with prices and wishlist action",
        "Catalogue search",
        "Store and shopping-centre locations, blog and support pages",
        "Azerbaijani, English and Russian versions",
      ],
    },
    "vien-group": {
      summary: "Corporate site for a marine and industrial construction company.",
      overview:
        "VIEN Group is a construction company working in Azerbaijan and Saudi Arabia, covering naval design, steel structures, fabrication and power solutions. The site presents its services, project portfolio and partners to industrial clients.",
      liveFeatures: [
        "Editorial hero with serif typography over industrial photography",
        "Services overview: marine industrial solutions, civil works, fabrication, power and repair",
        "Projects, partners and blog sections",
      ],
    },
    excelsior: {
      summary:
        "Five-star city hotel in Baku — rooms, events, wellness and dining with direct booking.",
      overview:
        "Excelsior Hotel & SPA is a five-star hotel in central Baku. The website covers accommodation, meetings and events, the Aura Wellness Center and restaurants, with a booking bar in the hero.",
      liveFeatures: [
        "Hero booking bar with arrival/departure dates, rooms, guests and promo code",
        "Live local time and weather for the hotel's location in the hero",
        "Room and suite listings with image carousels",
        "Azerbaijani, English and Russian versions",
        "Meetings & events and wellness centre sections",
      ],
    },
    "tabia-group": {
      summary: "Umbrella brand site for a hospitality group's hotels and resorts.",
      overview:
        "The corporate home of TABIA Group, which operates a portfolio of hotels and resorts across Azerbaijan. The site introduces the group's hospitality brands, upcoming projects and news, and links through to reservations.",
      liveFeatures: [
        "Full-screen editorial hero with wide display typography",
        "Upcoming projects and news sections",
        "Reservation entry point in the header",
        "Azerbaijani, English and Russian versions",
      ],
    },
    yashamal: {
      summary: "Urban residential complex with interactive masterplan and floor plans.",
      overview:
        "YAŞAMAL is a city residential project by Azadlıq Residence. The website presents the residences, floor plans, masterplan and on-site amenities, and lets visitors download the catalogue or send an enquiry.",
      liveFeatures: [
        "Masterplan view with labelled blocks",
        "Residences, floor plans and amenities sections",
        "Catalogue download and enquiry form entry points",
        "Light/dark switch and Azerbaijani, English and Russian versions",
      ],
    },
    badamdar: {
      summary: "Hotel and serviced residences in Baku with rooms, offices, events and dining.",
      overview:
        "Badamdar Hotel & Residences combines a hotel with residences and office space. The site presents rooms, residences and offices, meetings and events, spa and fitness, and restaurants.",
      liveFeatures: [
        "Hero booking bar with arrival/departure dates, rooms, guests and promo code",
        "Live local time and weather for the hotel's location in the hero",
        "Room and suite listings with image carousels",
        "Azerbaijani, English and Russian versions",
        "Residences & offices section alongside hotel rooms",
      ],
    },
    "sky-breeze": {
      summary: "Premium mountain residences and villas at the Shahdag resort.",
      overview:
        "Sky Breeze is a residential development at the Shahdag mountain resort, offering apartments and villas both as homes and as investments. The site covers the project, location, architecture, investment case and gallery.",
      liveFeatures: [
        "Long-form storytelling sections: project, location, architecture, investment",
        "Gallery and embedded audio/video content",
        "Azerbaijani, English and Russian versions",
      ],
    },
    "merkezi-klinika": {
      summary: "Hospital website with a full department directory, doctors and e-services.",
      overview:
        "Mərkəzi Klinika (Central Clinical Hospital) is a multi-specialty hospital in Baku. The site helps patients find the right department and doctor, learn about the hospital and its branches, and reach its online services.",
      liveFeatures: [
        "Medical departments directory in a mega-menu",
        "Doctors, branches, media and e-services sections",
        "Emergency hotline highlighted in the header",
        "Azerbaijani, English and Russian versions",
      ],
    },
    lassa: {
      summary: "Official Lassa tyre site with a size-based tyre finder and product catalogue.",
      overview:
        "The official site of Lassa tyres in Azerbaijan, operated by the brand's local representative. Visitors can find tyres by size, browse categories and best-sellers, see prices and discounts, and locate sales points.",
      liveFeatures: [
        "Tyre finder by width, profile and rim diameter, with season filters",
        "Product cards with prices, discounts and ratings",
        "Category, best-seller and sales-point sections",
        "Azerbaijani, English and Russian versions",
      ],
    },
    kaan: {
      summary:
        "Online store for tyres, rims and batteries from an official multi-brand distributor.",
      overview:
        "Kaan.az is the online store of Kaan International, an official distributor of several tyre brands. It sells tyres, rims, batteries and inner tubes, with search by size or by vehicle and campaign promotions.",
      liveFeatures: [
        "Advanced search by size, rim, battery, inner tube or vehicle",
        "Cart, wishlist and account entry points",
        "Vehicle-type categories and discounted products",
        "Promotional hero carousel",
      ],
    },
    "eleven-park": {
      summary: "Residential complex site with a block-by-block masterplan and apartment selection.",
      overview:
        "Eleven Park is a residential complex of high-rise blocks. The site introduces the development, shows a masterplan with numbered buildings, and guides buyers to choose an apartment or get in touch.",
      liveFeatures: [
        "Masterplan illustration with numbered buildings",
        "“Choose an apartment” call-to-action in the header",
        "Azerbaijani, English and Russian versions",
      ],
    },
    gashalti: {
      summary: "Naftalan health hotel with treatment programmes and online booking.",
      overview:
        "Gashaltı Health Hotel in Naftalan offers wellness stays built around treatment programmes. The site covers rooms, Naftalan treatment, medical packages, spa and restaurants.",
      liveFeatures: [
        "Hero booking bar with arrival/departure dates, rooms, guests and promo code",
        "Live local time and weather for the hotel's location in the hero",
        "Room and suite listings with image carousels",
        "Azerbaijani, English and Russian versions",
        "Naftalan treatment and medical packages sections",
      ],
    },
    galaalti: {
      summary: "Mountain wellness resort with a medical centre and healing-water treatments.",
      overview:
        "Galaalti Hotel & SPA is a mountain resort in Shabran known for its Naftsu healing water. The site presents rooms, meetings and events, the medical centre, medical packages and the spa.",
      liveFeatures: [
        "Hero booking bar with arrival/departure dates, rooms, guests and promo code",
        "Live local time and weather for the hotel's location in the hero",
        "Room and suite listings with image carousels",
        "Azerbaijani, English and Russian versions",
        "Medical centre and medical packages sections",
      ],
      note: "When captured, the live hero carried a “temporarily closed” notice, so the preview shows the rooms section instead.",
    },
    "shamakhi-palace": {
      summary: "Palace-style resort in Shamakhi with spa, dining, events and entertainment.",
      overview:
        "Shamakhi Palace Sharadil is a resort set in the countryside around Shamakhi. The site presents rooms, meetings and events, the spa and fitness centre, restaurants and entertainment, with booking available from the first screen.",
      liveFeatures: [
        "Hero booking bar with arrival/departure dates, rooms, guests and promo code",
        "Live local time and weather for the hotel's location in the hero",
        "Room and suite listings with image carousels",
        "Azerbaijani, English and Russian versions",
        "Meetings & events, spa & fitness, restaurants and entertainment sections",
      ],
    },
    "ramada-plaza-ganja": {
      summary: "City-centre hotel in Ganja with rooms, event venues, restaurants and a spa.",
      overview:
        "Ramada Plaza Ganja is a hotel in the centre of Ganja, part of the Ramada by Wyndham brand. The official website presents its rooms, meeting and event venues, restaurants and spa, and drives direct bookings.",
      liveFeatures: [
        "Hero booking bar with arrival/departure dates, rooms, guests and promo code",
        "Live local time and weather for the hotel's location in the hero",
        "Room and suite listings with image carousels",
        "Azerbaijani, English and Russian versions",
        "Meetings & events, restaurants and spa & fitness sections",
      ],
    },
    "central-point": {
      summary: "Four-star hotel in central Baku for leisure and business travellers.",
      overview:
        "The Central Point is a four-star hotel in the centre of Baku. The site introduces the hotel, its rooms and restaurants, and what's nearby, with booking from the hero.",
      liveFeatures: [
        "Hero booking bar with arrival/departure dates, rooms, guests and promo code",
        "Live local time and weather for the hotel's location in the hero",
        "Room and suite listings with image carousels",
        "Azerbaijani, English and Russian versions",
        "Restaurants and “around us” neighbourhood sections",
      ],
    },
    "aghdam-city-hotel": {
      summary: "City hotel in Ağdam for business and leisure stays, with spa and meeting rooms.",
      overview:
        "Ağdam City Hotel is a modern hotel in Ağdam for both business and leisure guests. The site presents rooms, meetings and events, and the spa and fitness centre, with booking from the first screen.",
      liveFeatures: [
        "Hero booking bar with arrival/departure dates, rooms, guests and promo code",
        "Live local time and weather for the hotel's location in the hero",
        "Room and suite listings with image carousels",
        "Azerbaijani, English and Russian versions",
        "Meetings & events and spa & fitness sections",
      ],
    },
    "yevlakh-city-hotel": {
      summary: "City hotel in Yevlakh with modern rooms, a restaurant, fitness and meeting space.",
      overview:
        "Yevlakh City Hotel offers modern rooms, a restaurant, fitness facilities and space for business meetings in Yevlakh. The site presents each of these and takes bookings from the hero.",
      liveFeatures: [
        "Hero booking bar with arrival/departure dates, rooms, guests and promo code",
        "Live local time and weather for the hotel's location in the hero",
        "Room and suite listings with image carousels",
        "Azerbaijani, English and Russian versions",
        "Meetings & events, restaurants and fitness sections",
      ],
    },
    yenee: {
      summary: "Wellness brand presenting health programmes, treatments and partner hotels.",
      overview:
        "YENEE is a wellness brand offering personalised health programmes. The site explains its philosophy, health programmes, treatments and partner hotels, and invites visitors to book a consultation or a stay.",
      liveFeatures: [
        "Playful, illustrated hero with pill-shaped typography accents",
        "Philosophy, health programmes, treatments, hotels and blog sections",
        "Consultation and reservation calls-to-action",
        "Azerbaijani, English and Russian versions",
      ],
    },
    safenet: {
      summary: "Security and IT systems integrator — surveillance, access control, telephony.",
      overview:
        "Safenet provides security, IT and communications systems: video surveillance, access control, IP telephony, IT audit and X-ray inspection equipment. The site presents its services, products and completed projects.",
      liveFeatures: [
        "Project highlights carousel",
        "Services and products mega-menus",
        "Projects, partners and blog sections",
        "Azerbaijani, English and Russian versions",
      ],
    },
    "arsenal-fire": {
      summary: "Fire safety systems company — design, installation, monitoring and audit.",
      overview:
        "Arsenal Fire designs, installs and monitors fire safety systems, from automatic extinguishing and alarms to smoke extraction and fire hydrants. The site lists its services and products, and showcases reference projects.",
      liveFeatures: [
        "Reference projects carousel",
        "Detailed services and products menus",
        "Projects, partners and blog sections",
        "Azerbaijani, English and Russian versions",
      ],
    },
    plastcon: {
      summary: "Manufacturer of polymer pipes and fittings — products, production and standards.",
      overview:
        "Plastcon Group Polymer manufactures polymer pipes and fittings. The site introduces the company and presents its products, production, partners, projects and the standards it works to.",
      liveFeatures: [
        "Full-bleed industrial hero with product messaging",
        "Product category carousel",
        "Production, partners, projects and standards sections",
        "Azerbaijani, English and Russian versions",
      ],
    },
    "ups-construction": {
      summary: "Construction company for sandwich panels, metal structures and turnkey builds.",
      overview:
        "UPS Construction supplies and installs sandwich panels, metal structures, containers and polycarbonate sheets, and delivers roofing, facade and turnkey construction work. The site organises this range into products and services.",
      liveFeatures: [
        "Products and services mega-menu",
        "Project photography and company introduction",
        "Cookie consent banner and quick-contact buttons",
        "Azerbaijani, English and Russian versions",
      ],
    },
    granit: {
      summary: "Quarrying and blasting company with an editorial, stone-textured identity.",
      overview:
        "Granit QP works in quarrying and blasting. The site uses large stone photography and serif display type to introduce the company and its services.",
      liveFeatures: [
        "Full-screen hero with display serif typography",
        "Services section with photography",
        "Azerbaijani, English and Russian versions",
      ],
    },
    "pasha-property": {
      summary: "Supplier application portal for a property management company.",
      overview:
        "A corporate portal for PASHA Property Management where suppliers apply to work with the company through a step-by-step questionnaire.",
      liveFeatures: ["Step-by-step supplier application form", "Azerbaijani and English versions"],
    },
    quk: {
      summary:
        "University clinic site with a department directory, doctors and online appointments.",
      overview:
        "The website of Qarabağ University Clinic, an academic medical centre combining university expertise with modern diagnostics. Patients can explore medical departments and doctors, learn about the clinic, and book an appointment or consultation online.",
      liveFeatures: [
        "Medical departments directory — gynaecology, paediatrics, psychiatry, radiology, laboratory and more",
        "Doctors and clinic sections in the main navigation",
        "Online appointment booking and a call-to-action phone button",
        "Careers, blog and photo/video gallery pages",
        "Azerbaijani and English versions",
      ],
    },
    palid: {
      summary: "Corporate website.",
      overview: "A corporate website listed among my One Studio projects.",
      liveFeatures: [],
      unavailableReason:
        "The live site returned an SSL error (Cloudflare 525) when I tried to capture it in October 2026, so there's no preview.",
    },
  },
};
