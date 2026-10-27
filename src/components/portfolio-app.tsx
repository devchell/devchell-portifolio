"use client";

import Image from "next/image";
import {
  FormEvent,
  startTransition,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import styles from "./portfolio.module.css";

type Theme = "light" | "dark";
type Locale = "pt" | "en";
type ContactState = "idle" | "loading" | "success" | "error";
type HeroTypingPhase = "typing" | "holding" | "deleting";

type Project = {
  name: string;
  url: string;
  locked?: boolean;
  statusTag?: Record<Locale, string>;
  linkLabel?: Record<Locale, string>;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  technologies: string[];
  systems: string[];
  screenshots: string[];
};

type ContactResponse = {
  message?: string;
};

const SECTION_IDS = ["hero", "sobre", "projetos", "contato"] as const;
const CONTACT_EMAIL = "rodriguessnts@outlook.com";
const CONTACT_SCOPE_MAX_LENGTH = 1200;
const WHATSAPP_NUMBER = "5511989468955";
const WHATSAPP_MESSAGE = {
  pt: "Olá, João. Vim pelo seu portfólio e gostaria de conversar.",
  en: "Hi João, I found your portfolio and would like to get in touch.",
} as const;

const COUNTRY_OPTIONS = [
  { code: "+55", country: "Brasil", short: "BR", placeholder: "(11) 9 9999-9999" },
  { code: "+1", country: "United States", short: "US", placeholder: "(555) 123-4567" },
  { code: "+44", country: "United Kingdom", short: "UK", placeholder: "0712 345 678" },
  { code: "+351", country: "Portugal", short: "PT", placeholder: "912 345 678" },
  { code: "+34", country: "España", short: "ES", placeholder: "612 345 678" },
  { code: "+33", country: "France", short: "FR", placeholder: "6 12 34 56 78" },
  { code: "+49", country: "Deutschland", short: "DE", placeholder: "151 234 567 89" },
  { code: "+39", country: "Italia", short: "IT", placeholder: "312 345 6789" },
  { code: "+52", country: "México", short: "MX", placeholder: "55 1234 5678" },
  { code: "+54", country: "Argentina", short: "AR", placeholder: "11 2345 6789" },
  { code: "+56", country: "Chile", short: "CL", placeholder: "9 1234 5678" },
  { code: "+57", country: "Colombia", short: "CO", placeholder: "300 123 4567" },
  { code: "+81", country: "日本", short: "JP", placeholder: "90 1234 5678" },
  { code: "+82", country: "대한민국", short: "KR", placeholder: "10 1234 5678" },
  { code: "+61", country: "Australia", short: "AU", placeholder: "412 345 678" },
] as const;

type ProjectBadgeIcon =
  | "next"
  | "typescript"
  | "vercel"
  | "react"
  | "tailwind"
  | "prisma"
  | "postgres"
  | "supabase"
  | "node"
  | "drizzle"
  | "saas"
  | "crm"
  | "automation"
  | "seo"
  | "omnichannel"
  | "ai"
  | "whitelabel"
  | "landing"
  | "dashboard"
  | "franchise"
  | "whatsapp"
  | "email"
  | "ux"
  | "generic";

const PROJECT_BADGE_META: Record<string, { icon: ProjectBadgeIcon }> = {
  "Next.js": { icon: "next" },
  TypeScript: { icon: "typescript" },
  Vercel: { icon: "vercel" },
  React: { icon: "react" },
  Tailwind: { icon: "tailwind" },
  Prisma: { icon: "prisma" },
  PostgreSQL: { icon: "postgres" },
  Supabase: { icon: "supabase" },
  "Node.js": { icon: "node" },
  Express: { icon: "generic" },
  "Socket.IO": { icon: "generic" },
  Drizzle: { icon: "drizzle" },
  SaaS: { icon: "saas" },
  CRM: { icon: "crm" },
  Automation: { icon: "automation" },
  SEO: { icon: "seo" },
  Omnichannel: { icon: "omnichannel" },
  AI: { icon: "ai" },
  "White Label": { icon: "whitelabel" },
  "Landing Page": { icon: "landing" },
  Dashboard: { icon: "dashboard" },
  Franchise: { icon: "franchise" },
  WhatsApp: { icon: "whatsapp" },
  Email: { icon: "email" },
  UX: { icon: "ux" },
  "Open Source": { icon: "generic" },
  PWA: { icon: "generic" },
};

const PROJECT_BADGE_LABELS: Record<Locale, Record<string, string>> = {
  pt: {
    "Next.js": "Next.js",
    TypeScript: "TS",
    Vercel: "Vercel",
    React: "React",
    Tailwind: "Tailwind",
    Prisma: "Prisma",
    PostgreSQL: "Postgres",
    Supabase: "Supabase",
    "Node.js": "Node",
    Express: "Express",
    "Socket.IO": "Socket.IO",
    Drizzle: "Drizzle",
    SaaS: "SaaS",
    CRM: "CRM",
    Automation: "Automação",
    SEO: "SEO",
    Omnichannel: "Omnichannel",
    AI: "IA",
    "White Label": "White label",
    "Landing Page": "Landing",
    Dashboard: "Dashboard",
    Franchise: "Franquias",
    WhatsApp: "WhatsApp",
    Email: "E-mail",
    UX: "UX",
    "Open Source": "Open source",
    PWA: "PWA",
  },
  en: {
    "Next.js": "Next.js",
    TypeScript: "TS",
    Vercel: "Vercel",
    React: "React",
    Tailwind: "Tailwind",
    Prisma: "Prisma",
    PostgreSQL: "Postgres",
    Supabase: "Supabase",
    "Node.js": "Node",
    Express: "Express",
    "Socket.IO": "Socket.IO",
    Drizzle: "Drizzle",
    SaaS: "SaaS",
    CRM: "CRM",
    Automation: "Automation",
    SEO: "SEO",
    Omnichannel: "Omnichannel",
    AI: "AI",
    "White Label": "White label",
    "Landing Page": "Landing",
    Dashboard: "Dashboard",
    Franchise: "Franchise",
    WhatsApp: "WhatsApp",
    Email: "Email",
    UX: "UX",
    "Open Source": "Open source",
    PWA: "PWA",
  },
};

const COPY = {
  pt: {
    nav: ["Sobre", "Projetos", "Contato"],
    heroEyebrow: "JOÃO VITOR RODRIGUES",
    heroTitleTop: "Engenheiro",
    heroTitleBottom: "Full-stack",
    heroDescription:
      "Engenheiro de Software: back-end, SaaS multi-tenant e IA aplicada, do banco ao deploy.",
    heroMeta: "Full-stack · Back-end · IA aplicada (LLM)",
    heroPrimary: "Contato",
    heroSecondary: "Ver Projetos",
    aboutLabel: "SOBRE MIM",
    aboutTitleStrong: "Código limpo,",
    aboutTitleSoft: "resultados reais.",
    projectsLabel: "PROJETOS",
    projectsTitleStrong: "O que eu",
    projectsTitleSoft: "já construí.",
    projectsIntro:
      "Produtos em produção e projetos em desenvolvimento, do back-end ao deploy.",
    projectSummary: "Resumo do projeto",
    projectTechLabel: "Stacks & Tech",
    projectSystemsLabel: "Tipos",
    projectVisit: "Visitar projeto",
    projectUnavailable: "Sem link público",
    projectPrivateTag: "sem link público",
    contactLabel: "CONTATO",
    contactTitleStrong: "Vamos conversar,",
    contactTitleSoft: "sem ruído.",
    contactDescription:
      "Envie uma mensagem com o assunto e o contexto. Respondo pelo e-mail informado.",
    submitCommand: "git push",
    submitCaption: "enviar mensagem",
    submitLoadingCommand: "pushing...",
    submitLoadingCaption: "enviando mensagem",
    whatsapp: "Conversar no WhatsApp",
    whatsappCaption: "mensagem direta",
    statusIdle: "Preencha o formulário e eu retorno pelo e-mail informado.",
    statusLoading: "Enviando sua solicitação...",
    statusSuccess: "Mensagem enviada. Vou responder pelo e-mail informado.",
    statusError: "Não foi possível enviar agora. Use o WhatsApp e eu sigo por lá.",
    placeholders: {
      name: "Seu nome",
      email: "seu@email.com",
      countryCode: "+55",
      whatsapp: "(11) 9 9999-9999",
      scope:
        "Escreva sua mensagem: assunto e contexto.",
    },
    navAria: "Seções",
    toggleLocaleAria: "Alternar idioma",
    toggleThemeAria: "Alternar tema",
    heroScrollAria: "Ir para a próxima seção",
    previousProjectAria: "Projeto anterior",
    nextProjectAria: "Próximo projeto",
    previousScreenshotAria: "Imagem anterior do projeto",
    nextScreenshotAria: "Próxima imagem do projeto",
    projectRailAria: "Lista horizontal de projetos",
    openProjectAria: "Abrir projeto",
    screenshotAlt: "captura",
    footerContact: "Contato",
    footerSocials: "Redes sociais",
    footerSignature: "Portfólio de João Vitor Rodrigues ·",
  },
  en: {
    nav: ["About", "Projects", "Contact"],
    heroEyebrow: "JOAO VITOR RODRIGUES",
    heroTitleTop: "Engineer",
    heroTitleBottom: "Full-stack",
    heroDescription:
      "Software Engineer: back-end, multi-tenant SaaS and applied AI, from database to deployment.",
    heroMeta: "Full-stack · Back-end · Applied AI (LLM)",
    heroPrimary: "Contact",
    heroSecondary: "View Projects",
    aboutLabel: "ABOUT ME",
    aboutTitleStrong: "Clean code,",
    aboutTitleSoft: "real outcomes.",
    projectsLabel: "PROJECTS",
    projectsTitleStrong: "What I",
    projectsTitleSoft: "have built.",
    projectsIntro:
      "Products in production and projects in development, from back-end to deployment.",
    projectSummary: "Project overview",
    projectTechLabel: "Stacks & Tech",
    projectSystemsLabel: "System Type",
    projectVisit: "Visit project",
    projectUnavailable: "No public link",
    projectPrivateTag: "no public link",
    contactLabel: "CONTACT",
    contactTitleStrong: "Let's talk,",
    contactTitleSoft: "no noise.",
    contactDescription:
      "Send a message with the subject and context. I will reply to the email you provide.",
    submitCommand: "git push",
    submitCaption: "send message",
    submitLoadingCommand: "pushing...",
    submitLoadingCaption: "sending message",
    whatsapp: "Talk on WhatsApp",
    whatsappCaption: "direct message",
    statusIdle: "Fill out the form and I will reply to the email you provide.",
    statusLoading: "Sending your request...",
    statusSuccess: "Message sent. I will reply to your email shortly.",
    statusError: "The request could not be sent right now. Use WhatsApp and I will continue there.",
    placeholders: {
      name: "Your name",
      email: "your@email.com",
      countryCode: "+1",
      whatsapp: "(555) 123-4567",
      scope:
        "Write your message: subject and context.",
    },
    navAria: "Sections",
    toggleLocaleAria: "Switch language",
    toggleThemeAria: "Switch theme",
    heroScrollAria: "Go to the next section",
    previousProjectAria: "Previous project",
    nextProjectAria: "Next project",
    previousScreenshotAria: "Previous project image",
    nextScreenshotAria: "Next project image",
    projectRailAria: "Horizontal project list",
    openProjectAria: "Open project",
    screenshotAlt: "screenshot",
    footerContact: "Contact",
    footerSocials: "Social media",
    footerSignature: "Portfolio of João Vitor Rodrigues ·",
  },
} as const;

const PROJECTS: Project[] = [
  {
    name: "Tevio",
    url: "https://tevio.com.br",
    title: { pt: "Venda de Servidores", en: "Server Sales Platform" },
    description: {
      pt: "Plataforma de venda de servidores (VPS) com loja e checkout, portal do cliente e painel administrativo, com provisionamento automatizado, cobrança recorrente e módulos de IA generativa.",
      en: "Server (VPS) sales platform with storefront and checkout, client portal and admin panel, featuring automated provisioning, recurring billing and generative AI modules.",
    },
    technologies: ["Next.js", "TypeScript", "Node.js", "PostgreSQL"],
    systems: ["SaaS", "Dashboard", "AI"],
    screenshots: [
      "/projects/tevio/tevio-01.png",
      "/projects/tevio/tevio-02.png",
      "/projects/tevio/tevio-03.png",
      "/projects/tevio/tevio-04.png",
      "/projects/tevio/tevioadmin-01.png",
    ],
  },
  {
    name: "TyviaTalk",
    url: "https://tyviatalk.com/",
    title: { pt: "Omnichat com IA", en: "AI Omnichat" },
    description: {
      pt: "Omnichat para empresas, integrado a uma IA que estuda o negócio e melhora com o uso. Multi-tenant, com atendimento omnichannel e painel administrativo.",
      en: "Omnichat for businesses, integrated with an AI that learns the company and improves with use. Multi-tenant, with omnichannel support and an admin panel.",
    },
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    systems: ["SaaS", "Omnichannel", "AI"],
    screenshots: [
      "/projects/tyviatalk/tyviatalk-01.png",
      "/projects/tyviatalk/tyviatalk-02.png",
      "/projects/tyviatalk/tyviatalk-03.png",
      "/projects/tyviatalk/tyviaadmin-01.png",
      "/projects/tyviatalk/tyviaadmin-02.png",
    ],
  },
  {
    name: "SinceMarket",
    url: "https://sincemarket.com",
    title: { pt: "Marketplace para Games", en: "Gaming Marketplace" },
    description: {
      pt: "Marketplace para a área de games: servidores de jogos e infoprodutos, com repasse via PIX, tickets de suporte privados e design system próprio.",
      en: "Marketplace for the gaming space: game servers and digital products, with PIX payouts, private support tickets and its own design system.",
    },
    technologies: ["Next.js", "TypeScript", "Node.js", "PostgreSQL"],
    systems: ["SaaS", "Dashboard"],
    screenshots: [],
  },
  {
    name: "QA_Doc",
    url: "https://github.com/devchell/QA_Doc",
    title: { pt: "Documentação e Testes de QA", en: "QA Documentation and Testing" },
    description: {
      pt: "Ferramenta open source (MIT) de documentação e testes de QA: editor com paginação A4 fiel ao PDF, acervo assinado com Ed25519, instalador e atualizador em C#, migrations reversíveis e testes automatizados.",
      en: "Open source (MIT) QA documentation and testing tool: editor with PDF-faithful A4 pagination, Ed25519-signed archive, C# installer and updater, reversible migrations and automated tests.",
    },
    technologies: ["React", "TypeScript", "Express", "Node.js"],
    systems: ["Open Source"],
    screenshots: [],
    linkLabel: { pt: "Ver no GitHub", en: "View on GitHub" },
  },
  {
    name: "SaciaBem",
    url: "",
    locked: true,
    statusTag: { pt: "em desenvolvimento", en: "in development" },
    title: { pt: "SaaS de Pedidos para Restaurantes", en: "Restaurant Ordering SaaS" },
    description: {
      pt: "SaaS multi-tenant de pedidos para restaurantes, em desenvolvimento: isolamento por RLS no PostgreSQL, assinatura com Mercado Pago, CI com testes automatizados e deploy em VPS com Docker e Nginx.",
      en: "Multi-tenant restaurant ordering SaaS, in development: PostgreSQL RLS isolation, Mercado Pago subscriptions, CI with automated tests and VPS deployment with Docker and Nginx.",
    },
    technologies: ["Next.js", "TypeScript", "PostgreSQL"],
    systems: ["SaaS"],
    screenshots: [],
  },
  {
    name: "Sistema Financeiro",
    url: "",
    locked: true,
    statusTag: { pt: "projeto pessoal", en: "personal project" },
    title: { pt: "PWA de Finanças Pessoais", en: "Personal Finance PWA" },
    description: {
      pt: "PWA de finanças pessoais com Supabase e RLS, importação OFX/CSV com deduplicação, notificações Web Push e backup diário via GitHub Actions.",
      en: "Personal finance PWA with Supabase and RLS, OFX/CSV import with deduplication, Web Push notifications and daily backups via GitHub Actions.",
    },
    technologies: ["Next.js", "TypeScript", "Supabase"],
    systems: ["PWA"],
    screenshots: [],
  },
  {
    name: "DinoBot",
    url: "",
    locked: true,
    statusTag: { pt: "projeto pessoal", en: "personal project" },
    title: { pt: "Bot de Twitch com Painel", en: "Twitch Bot with Dashboard" },
    description: {
      pt: "Bot de Twitch com painel web: EventSub e Helix, API Fastify, PostgreSQL com RLS, OAuth da Twitch com PKCE e tokens cifrados.",
      en: "Twitch bot with a web dashboard: EventSub and Helix, Fastify API, PostgreSQL with RLS, Twitch OAuth with PKCE and encrypted tokens.",
    },
    technologies: ["Node.js", "TypeScript", "PostgreSQL", "Next.js"],
    systems: ["Dashboard"],
    screenshots: [],
  },
  {
    name: "Nexo Astra",
    url: "",
    locked: true,
    statusTag: { pt: "em desenvolvimento", en: "in development" },
    title: { pt: "Portal de Fãs de Jogos", en: "Gaming Fan Portal" },
    description: {
      pt: "Portal de fãs de jogos em desenvolvimento, com robô de coleta em TypeScript agendado no GitHub Actions e testes E2E com Playwright.",
      en: "Gaming fan portal in development, with a TypeScript collection bot scheduled on GitHub Actions and Playwright E2E tests.",
    },
    technologies: ["Next.js", "TypeScript", "Drizzle", "PostgreSQL"],
    systems: ["Automation"],
    screenshots: [],
  },
];

const HERO_FOCUS_ROTATIONS = {
  pt: [
    "Back-end + APIs + Deploy",
    "SaaS multi-tenant + PostgreSQL",
    "IA aplicada (LLM) + Integrações",
  ],
  en: [
    "Back-end + APIs + Deploy",
    "Multi-tenant SaaS + PostgreSQL",
    "Applied AI (LLM) + Integrations",
  ],
} as const;

const CODE_COPY = {
  pt: {
    hero: {
      objectName: "construtor",
      focusKey: "foco",
      executionKey: "execucao",
      executionValue: "Código + Testes + Deploy",
      deliveryKey: "entrega",
      deliveryValue: "Sistemas claros, seguros e escaláveis",
      statusKey: "status",
      statusValue: "ativo",
      footerComment: "// back-end · full-stack · LLM",
      footerMeta: "arquitetura limpa | código testado",
    },
    about: {
      objectName: "desenvolvedor",
      nameKey: "nome",
      aliasKey: "apelido",
      stackKey: "stack",
      stackLines: [
        ["Next.js", "TypeScript", "Node.js"],
        ["PostgreSQL", "C#/.NET", "LLMs"],
      ],
      specialtiesKey: "especialidades",
      specialtyLines: [
        ["Back-end", "SaaS multi-tenant", "APIs"],
        ["IA aplicada (LLM)", "QA", "Segurança"],
      ],
      educationKey: "formacao",
      educationValue: "Ciência da Computação — Descomplica (previsão de conclusão 2026)",
      approachKey: "abordagem",
      approachValue: "clareza acima do ruído",
    },
    contact: {
      objectName: "contato",
      nameKey: "nome",
      emailKey: "email",
      whatsappKey: "whatsapp",
      scopeKey: "mensagem",
      scopeLabel: "Mensagem",
    },
  },
  en: {
    hero: {
      objectName: "builder",
      focusKey: "focus",
      executionKey: "execution",
      executionValue: "Code + Tests + Deploy",
      deliveryKey: "delivery",
      deliveryValue: "Clear, secure and scalable systems",
      statusKey: "status",
      statusValue: "online",
      footerComment: "// back-end · full-stack · LLM",
      footerMeta: "clean architecture | tested code",
    },
    about: {
      objectName: "developer",
      nameKey: "name",
      aliasKey: "alias",
      stackKey: "stack",
      stackLines: [
        ["Next.js", "TypeScript", "Node.js"],
        ["PostgreSQL", "C#/.NET", "LLMs"],
      ],
      specialtiesKey: "specialties",
      specialtyLines: [
        ["Back-end", "Multi-tenant SaaS", "APIs"],
        ["Applied AI (LLM)", "QA", "Security"],
      ],
      educationKey: "education",
      educationValue: "Computer Science — Descomplica (expected completion 2026)",
      approachKey: "approach",
      approachValue: "clarity over noise",
    },
    contact: {
      objectName: "contact",
      nameKey: "name",
      emailKey: "email",
      whatsappKey: "whatsapp",
      scopeKey: "message",
      scopeLabel: "Message",
    },
  },
} as const;

function formatCodeKey(label: string, width = 18) {
  return `  ${label}:`.padEnd(width, " ");
}

function getProjectBadgeMeta(label: string) {
  return PROJECT_BADGE_META[label] ?? { icon: "generic" };
}

function getProjectHost(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeCountryCode(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits ? `+${digits}` : "+";
}

function getCountryOption(countryCode: string) {
  return COUNTRY_OPTIONS.find((option) => option.code === countryCode) ?? COUNTRY_OPTIONS[0];
}

function getPhoneDigitLimit(countryCode: string) {
  if (countryCode === "+55") return 11;
  if (countryCode === "+1") return 10;
  if (countryCode === "+44" || countryCode === "+351" || countryCode === "+34" || countryCode === "+56") return 9;
  if (countryCode === "+33") return 10;
  if (countryCode === "+49") return 11;
  if (countryCode === "+39" || countryCode === "+52" || countryCode === "+54" || countryCode === "+57" || countryCode === "+81" || countryCode === "+82") return 10;
  if (countryCode === "+61") return 9;
  return 15;
}

function formatLocalPhone(countryCode: string, value: string) {
  const digits = value.replace(/\D/g, "").slice(0, getPhoneDigitLimit(countryCode));

  if (countryCode === "+55") {
    if (digits.length <= 2) return digits ? `(${digits}` : "";
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  }

  if (countryCode === "+1") {
    if (digits.length <= 3) return digits ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  if (countryCode === "+44") {
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
  }

  if (countryCode === "+351") {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  }

  if (["+34", "+56", "+61"].includes(countryCode)) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  }

  if (countryCode === "+33") {
    return digits.replace(/(\d{1,2})(?=(\d{2})+(?!\d))/g, "$1 ").trim();
  }

  if (countryCode === "+49") {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 11)}`;
  }

  if (["+39", "+52", "+54", "+57", "+81", "+82"].includes(countryCode)) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }

  return digits.replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g, "$1 ").trim();
}

function formatInternationalPhone(countryCode: string, localPhone: string) {
  return `${normalizeCountryCode(countryCode)} ${formatLocalPhone(countryCode, localPhone)}`.trim();
}

function getInternationalPhoneDigits(countryCode: string, localPhone: string) {
  return `${countryCode.replace(/\D/g, "")}${localPhone.replace(/\D/g, "")}`;
}

function formatStatus(locale: Locale, state: ContactState) {
  const messages = COPY[locale];

  if (state === "loading") return messages.statusLoading;
  if (state === "success") return messages.statusSuccess;
  if (state === "error") return messages.statusError;
  return messages.statusIdle;
}

function subscribePreferences(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("portfolio-preferences", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("portfolio-preferences", callback);
  };
}

function getThemeSnapshot(): Theme {
  const savedTheme = window.localStorage.getItem("portfolio-theme");
  return savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";
}

function getLocaleSnapshot(): Locale {
  const savedLocale = window.localStorage.getItem("portfolio-locale");
  return savedLocale === "en" || savedLocale === "pt" ? savedLocale : "pt";
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function getServerLocaleSnapshot(): Locale {
  return "pt";
}

function persistPreference(key: "portfolio-theme" | "portfolio-locale", value: Theme | Locale) {
  window.localStorage.setItem(key, value);
  window.dispatchEvent(new Event("portfolio-preferences"));
}

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: direction === "left" ? "scaleX(-1)" : undefined }}
      aria-hidden="true"
    >
      <path
        d="M5 12h12m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v14m-5-5 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path
        d="M15 6h5v5m-1.3-3.7-7.8 7.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 14.6v4a2 2 0 0 1-2 2H7.4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StageGlobeGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.6 12h16.8M12 3.5c2.3 2.4 3.5 5.3 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.3-3.5-8.5s1.2-6.1 3.5-8.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StageLockGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.15" fill="currentColor" />
    </svg>
  );
}

function StageChevron({ dir = "left" }: { dir?: "left" | "right" }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={dir === "right" ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M14.5 6 8.5 12l6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StageReloadGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6.5v4.5h-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.4 11a7.5 7.5 0 1 0-1.3 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function StageShareGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5v11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.5 7 12 3.5 15.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10.5H5.5v9.5h13V10.5H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StageTabsGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="7" y="7" width="13" height="13" rx="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 16.5V6a1.5 1.5 0 0 1 1.5-1.5h10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function StagePlusGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5.5v13M5.5 12h13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function StageSidebarGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="14" rx="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 5v14" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SunMoonIcon({ theme }: { theme: Theme }) {
  return theme === "light" ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4.5V2m0 20v-2.5M6.7 6.7 5 5m14 14-1.7-1.7M4.5 12H2m20 0h-2.5M6.7 17.3 5 19m14-14-1.7 1.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="4.15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 14.4A8.5 8.5 0 0 1 9.6 4 9 9 0 1 0 20 14.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.8 9.5h16.4M3.8 14.5h16.4M12 3.8c2.3 2.4 3.5 5.1 3.5 8.2s-1.2 5.8-3.5 8.2M12 3.8c-2.3 2.4-3.5 5.1-3.5 8.2s1.2 5.8 3.5 8.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7.5 12 13l8-5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="33" height="33" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18.4 15.5c-1 .9-2 .5-3.1-.1a23.8 23.8 0 0 1-3.7-2.7 23.4 23.4 0 0 1-2.8-3.7c-.6-1.1-1-2.1-.1-3.1l.6-.6c.5-.5.6-1.4 0-2.1l-1.8-2c-.7-.8-1.8-.9-2.5-.2L3.7 2.4c-.8.8-1.2 1.9-1 3 .3 2.1 1.3 5.3 4.5 8.5 3.2 3.2 6.4 4.2 8.5 4.5 1.1.2 2.2-.2 3-1l1.3-1.3c.7-.7.6-1.8-.2-2.5l-2-1.8c-.7-.6-1.6-.5-2.1 0l-.6.7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.8a7.9 7.9 0 0 0-6.9 12l-.9 4.4 4.5-.9A7.9 7.9 0 1 0 12 3.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.8 8.8c-.3.6-.4 1.3 0 1.9.8 1.4 1.9 2.5 3.3 3.3.6.4 1.3.3 1.9 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 19c-4 1.3-4-2-6-2m12 4v-3.2a2.7 2.7 0 0 0-.8-2.1c2.7-.3 5.6-1.3 5.6-6a4.7 4.7 0 0 0-1.3-3.2 4.4 4.4 0 0 0-.1-3.2s-1-.3-3.3 1.3a11.4 11.4 0 0 0-6 0C6.8 3.1 5.8 3.4 5.8 3.4a4.4 4.4 0 0 0-.1 3.2 4.7 4.7 0 0 0-1.3 3.2c0 4.7 2.9 5.7 5.6 6A2.7 2.7 0 0 0 9 17.8V21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="2.5" y="9" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="4.5" cy="4.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

function ProjectBadgeIcon({ icon }: { icon: ProjectBadgeIcon }) {
  const sharedProps = {
    stroke: "currentColor",
    strokeWidth: 1.65,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (icon) {
    case "next":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="5.8" {...sharedProps} />
          <path d="M5.9 5.3v5.4l4.1-5.4v5.4" {...sharedProps} />
        </svg>
      );
    case "typescript":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4.2 5.1h7.6M8 5.1v5.8M10.1 6.4h2.1M11.2 6.4v4.5" {...sharedProps} />
        </svg>
      );
    case "vercel":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3.7 12 11H4L8 3.7Z" {...sharedProps} />
        </svg>
      );
    case "react":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <ellipse cx="8" cy="8" rx="5.3" ry="2.2" {...sharedProps} />
          <ellipse cx="8" cy="8" rx="5.3" ry="2.2" transform="rotate(60 8 8)" {...sharedProps} />
          <ellipse cx="8" cy="8" rx="5.3" ry="2.2" transform="rotate(-60 8 8)" {...sharedProps} />
          <circle cx="8" cy="8" r="1.05" fill="currentColor" />
        </svg>
      );
    case "tailwind":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4.2 6.2c.7-1.3 1.6-1.9 2.9-1.9 1.6 0 2 1.5 2.9 1.5.8 0 1.5-.3 2.1-1" {...sharedProps} />
          <path d="M3.9 10.2c.8-1.2 1.8-1.8 3-1.8 1.6 0 2 1.5 2.9 1.5.8 0 1.5-.3 2.1-1" {...sharedProps} />
        </svg>
      );
    case "prisma":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 4.2 10.8 5.8 8.2 11.8 4.7 6.9 6 4.2Z" {...sharedProps} />
        </svg>
      );
    case "postgres":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <ellipse cx="8" cy="4.9" rx="3.5" ry="1.8" {...sharedProps} />
          <path d="M4.5 4.9v5.1c0 1 1.5 1.7 3.5 1.7s3.5-.7 3.5-1.7V4.9" {...sharedProps} />
          <path d="M4.5 7.3c0 .9 1.5 1.7 3.5 1.7s3.5-.8 3.5-1.7" {...sharedProps} />
        </svg>
      );
    case "supabase":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M5.4 3.8h3.9L6.6 12.2H3.4l2-6.3Z" {...sharedProps} />
          <path d="M8.8 3.8h3.8l-1.9 5.8H7.1" {...sharedProps} />
        </svg>
      );
    case "node":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m8 3.2 3.8 2.2v5.2L8 12.8l-3.8-2.2V5.4L8 3.2Z" {...sharedProps} />
          <path d="M6.9 6.1v3.8l2.2-3.8v3.8" {...sharedProps} />
        </svg>
      );
    case "drizzle":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3.8c0 2-2 2.7-2 4.7 0 1.4.9 2.5 2 3.6 1.1-1.1 2-2.2 2-3.6C10 6.5 8 5.8 8 3.8Z" {...sharedProps} />
        </svg>
      );
    case "saas":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="3.5" y="3.5" width="4" height="4" rx="0.9" {...sharedProps} />
          <rect x="8.5" y="3.5" width="4" height="4" rx="0.9" {...sharedProps} />
          <rect x="3.5" y="8.5" width="4" height="4" rx="0.9" {...sharedProps} />
          <rect x="8.5" y="8.5" width="4" height="4" rx="0.9" {...sharedProps} />
        </svg>
      );
    case "crm":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="1.7" {...sharedProps} />
          <circle cx="10.5" cy="7.1" r="1.3" {...sharedProps} />
          <path d="M4 11.5c.6-1.5 1.8-2.3 3.7-2.3s3.1.8 3.7 2.3" {...sharedProps} />
        </svg>
      );
    case "automation":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 11.2h2.3L8 4.9l1.7 6.3H12" {...sharedProps} />
          <path d="M10.7 4.8h1.6v1.6M12.3 6.4 9.9 8.8" {...sharedProps} />
        </svg>
      );
    case "seo":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="6.7" cy="6.7" r="2.7" {...sharedProps} />
          <path d="m8.9 8.9 2.8 2.8M5.3 7l.9-.9 1 1L9 5.3" {...sharedProps} />
        </svg>
      );
    case "omnichannel":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="4.3" cy="4.6" r="1.1" {...sharedProps} />
          <circle cx="11.7" cy="4.6" r="1.1" {...sharedProps} />
          <circle cx="4.3" cy="11.4" r="1.1" {...sharedProps} />
          <circle cx="11.7" cy="11.4" r="1.1" {...sharedProps} />
          <path d="M5.4 4.6h5.2M4.3 5.7v4.6M11.7 5.7v4.6M5.4 11.4h5.2" {...sharedProps} />
        </svg>
      );
    case "ai":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3.8 9 6.1l2.5.3-1.9 1.7.5 2.4L8 9.5l-2.1 1 .5-2.4-1.9-1.7 2.5-.3L8 3.8Z" {...sharedProps} />
        </svg>
      );
    case "whitelabel":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="3.8" y="5.2" width="6.6" height="6.6" rx="1.1" {...sharedProps} />
          <path d="M5.9 3.8h6.3v6.3" {...sharedProps} />
        </svg>
      );
    case "landing":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="3.2" y="3.6" width="9.6" height="8.8" rx="1.3" {...sharedProps} />
          <path d="M3.2 6h9.6M5 8.2h2.8M5 10h5.6" {...sharedProps} />
        </svg>
      );
    case "dashboard":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="3.2" y="3.6" width="4.1" height="3.4" rx="0.8" {...sharedProps} />
          <rect x="8.7" y="3.6" width="4.1" height="5.8" rx="0.8" {...sharedProps} />
          <rect x="3.2" y="8.2" width="4.1" height="4.2" rx="0.8" {...sharedProps} />
          <rect x="8.7" y="10.2" width="4.1" height="2.2" rx="0.8" {...sharedProps} />
        </svg>
      );
    case "franchise":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="4.4" r="1.3" {...sharedProps} />
          <circle cx="4.7" cy="11.1" r="1.3" {...sharedProps} />
          <circle cx="11.3" cy="11.1" r="1.3" {...sharedProps} />
          <path d="M8 5.7v2.2M8 7.9 5.6 9.6M8 7.9l2.4 1.7" {...sharedProps} />
        </svg>
      );
    case "whatsapp":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3.7a4.5 4.5 0 0 0-3.9 6.9l-.5 2.3 2.4-.5A4.5 4.5 0 1 0 8 3.7Z" {...sharedProps} />
          <path d="M6.6 6.4c-.2.4-.2 1 .1 1.4.6 1 1.4 1.8 2.4 2.4.5.3 1 .3 1.4.1" {...sharedProps} />
        </svg>
      );
    case "email":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="3.2" y="4.5" width="9.6" height="7" rx="1.1" {...sharedProps} />
          <path d="M3.8 5.3 8 8.1l4.2-2.8" {...sharedProps} />
        </svg>
      );
    case "ux":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 4.6h8M4 8h4.8M4 11.4h6.1" {...sharedProps} />
          <path d="m10.6 9.1 1.8 1-1.8 1.1" {...sharedProps} />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="4.3" {...sharedProps} />
        </svg>
      );
  }
}

function ProjectBadge({
  badge,
  label,
}: {
  badge: string;
  label: string;
}) {
  const meta = getProjectBadgeMeta(badge);

  return (
    <span className={styles.stackBadge}>
      <span className={styles.stackBadgeMark} aria-hidden="true">
        <ProjectBadgeIcon icon={meta.icon} />
      </span>
      <span>{label}</span>
    </span>
  );
}

export function PortfolioApp() {
  const theme = useSyncExternalStore(subscribePreferences, getThemeSnapshot, getServerThemeSnapshot);
  const locale = useSyncExternalStore(subscribePreferences, getLocaleSnapshot, getServerLocaleSnapshot);
  const [activeSection, setActiveSection] =
    useState<(typeof SECTION_IDS)[number]>("hero");
  const [projectIndex, setProjectIndex] = useState(0);
  const [screenshotIndex, setScreenshotIndex] = useState(0);
  const [contactState, setContactState] = useState<ContactState>("idle");
  const [statusOverride, setStatusOverride] = useState<string | null>(null);
  const [heroFocusIndex, setHeroFocusIndex] = useState(0);
  const [heroTypingPhase, setHeroTypingPhase] = useState<HeroTypingPhase>("holding");
  const [typedHeroFocus, setTypedHeroFocus] = useState<string>("Back-end + APIs + Deploy");
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    countryCode: "+55",
    whatsapp: "",
    scope: "",
    website: "",
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const projectRailViewportRef = useRef<HTMLDivElement>(null);
  const hasCenteredProjectRailRef = useRef(false);
  const countryCodePickerRef = useRef<HTMLDivElement>(null);

  const copy = COPY[locale];
  const codeCopy = CODE_COPY[locale];
  const activeProject = PROJECTS[projectIndex];
  const activeProjectHost = getProjectHost(activeProject.url);
  const hasScreenshots = activeProject.screenshots.length > 0;
  const heroFocusRotations = HERO_FOCUS_ROTATIONS[locale];
  const activeHeroFocus = heroFocusRotations[heroFocusIndex];
  const badgeLabels = PROJECT_BADGE_LABELS[locale];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!isCountryMenuOpen) return;

    const closeCountryMenu = (event: PointerEvent) => {
      const picker = countryCodePickerRef.current;
      if (picker?.contains(event.target as Node)) return;

      setIsCountryMenuOpen(false);
    };

    const closeCountryMenuWithKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCountryMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeCountryMenu, true);
    document.addEventListener("keydown", closeCountryMenuWithKeyboard);

    return () => {
      document.removeEventListener("pointerdown", closeCountryMenu, true);
      document.removeEventListener("keydown", closeCountryMenuWithKeyboard);
    };
  }, [isCountryMenuOpen]);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => {
        if (heroTypingPhase === "holding") {
          setHeroTypingPhase("deleting");
          return;
        }

        if (heroTypingPhase === "deleting") {
          if (typedHeroFocus.length === 0) {
            setHeroFocusIndex((current) => (current + 1) % heroFocusRotations.length);
            setHeroTypingPhase("typing");
            return;
          }

          setTypedHeroFocus((current) => current.slice(0, -1));
          return;
        }

        if (typedHeroFocus === activeHeroFocus) {
          setHeroTypingPhase("holding");
          return;
        }

        setTypedHeroFocus(activeHeroFocus.slice(0, typedHeroFocus.length + 1));
      },
      heroTypingPhase === "holding" ? 1450 : heroTypingPhase === "deleting" ? 45 : 68,
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeHeroFocus, heroFocusRotations.length, heroTypingPhase, typedHeroFocus]);

  const rotateScreens = useEffectEvent(() => {
    setScreenshotIndex((current) => {
      const lastIndex = activeProject.screenshots.length - 1;
      return current >= lastIndex ? 0 : current + 1;
    });
  });

  useEffect(() => {
    if (activeProject.screenshots.length <= 1) {
      return;
    }

    const id = window.setTimeout(() => {
      rotateScreens();
    }, 6000);

    return () => {
      window.clearTimeout(id);
    };
  }, [projectIndex, screenshotIndex, activeProject.screenshots.length]);

  useLayoutEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const previousScrollRestoration = "scrollRestoration" in window.history
      ? window.history.scrollRestoration
      : null;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    root.scrollTop = 0;

    return () => {
      if (previousScrollRestoration) {
        window.history.scrollRestoration = previousScrollRestoration;
      }
    };
  }, []);

  useEffect(() => {
    const railViewport = projectRailViewportRef.current;
    if (!railViewport) return;

    const activeCard = railViewport.querySelector<HTMLElement>(`[data-project-card-index="${projectIndex}"]`);
    if (!activeCard) return;

    // Keep the project rail centered without letting the browser scroll the main page.
    const maxScrollLeft = Math.max(0, railViewport.scrollWidth - railViewport.clientWidth);
    const targetLeft = activeCard.offsetLeft - (railViewport.clientWidth - activeCard.offsetWidth) / 2;
    const nextScrollLeft = Math.min(Math.max(targetLeft, 0), maxScrollLeft);

    railViewport.scrollTo({
      left: nextScrollLeft,
      behavior: hasCenteredProjectRailRef.current ? "smooth" : "auto",
    });
    hasCenteredProjectRailRef.current = true;
  }, [projectIndex]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-section]"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target
            .querySelectorAll<HTMLElement>("[data-reveal]")
            .forEach((node) => node.classList.add(styles.revealVisible));
        });
      },
      {
        root,
        threshold: 0.16,
      },
    );

    sections.forEach((section) => observer.observe(section));

    const syncActiveSection = () => {
      const offset = root.scrollTop + 180;
      let current = sections[0];

      sections.forEach((section) => {
        if (section.offsetTop <= offset) {
          current = section;
        }
      });

      const id = current?.getAttribute("id");
      if (id && SECTION_IDS.includes(id as (typeof SECTION_IDS)[number])) {
        setActiveSection(id as (typeof SECTION_IDS)[number]);
      }
    };

    syncActiveSection();
    root.addEventListener("scroll", syncActiveSection, { passive: true });

    return () => {
      observer.disconnect();
      root.removeEventListener("scroll", syncActiveSection);
    };
  }, []);

  function scrollToSection(id: string) {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleLocaleToggle() {
    const next = locale === "pt" ? "en" : "pt";
    setHeroFocusIndex(0);
    setTypedHeroFocus(HERO_FOCUS_ROTATIONS[next][0]);
    setHeroTypingPhase("holding");
    persistPreference("portfolio-locale", next);
  }

  function handleThemeToggle() {
    persistPreference("portfolio-theme", theme === "light" ? "dark" : "light");
  }

  function selectProject(nextIndex: number) {
    startTransition(() => {
      setProjectIndex(nextIndex);
      setScreenshotIndex(0);
    });
  }

  function navigateScreenshot(direction: "next" | "prev") {
    const totalScreenshots = activeProject.screenshots.length;

    setScreenshotIndex((current) =>
      direction === "next"
        ? (current + 1) % totalScreenshots
        : (current - 1 + totalScreenshots) % totalScreenshots,
    );
  }

  function scrollProjectRail(direction: "next" | "prev") {
    const railViewport = projectRailViewportRef.current;
    if (!railViewport) return;

    const activeCard = railViewport.querySelector<HTMLElement>(`[data-project-card-index="${projectIndex}"]`);
    const railTrack = railViewport.firstElementChild instanceof HTMLElement ? railViewport.firstElementChild : null;
    const trackStyles = railTrack ? window.getComputedStyle(railTrack) : null;
    const gap = Number.parseFloat(trackStyles?.columnGap || trackStyles?.gap || "0");
    const cardWidth = activeCard?.getBoundingClientRect().width ?? 220;
    const offset = (cardWidth + gap) * 2;

    railViewport.scrollBy({
      left: direction === "next" ? offset : -offset,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = formValues.name.trim();
    const email = formValues.email.trim();
    const countryCode = normalizeCountryCode(formValues.countryCode);
    const whatsapp = formValues.whatsapp.replace(/\D/g, "") ? formatInternationalPhone(countryCode, formValues.whatsapp) : "";
    const scope = formValues.scope.trim();
    const website = formValues.website.trim();

    if (name.length < 2) {
      setContactState("error");
      setStatusOverride(
        locale === "pt"
          ? "Informe seu nome completo para continuar."
          : "Please enter your full name before sending.",
      );
      return;
    }

    if (!isValidEmail(email)) {
      setContactState("error");
      setStatusOverride(
        locale === "pt"
          ? "Informe um e-mail válido para que eu possa responder."
          : "Please enter a valid email so I can reply.",
      );
      return;
    }

    const hasPhone = formValues.whatsapp.replace(/\D/g, "").length > 0;

    if (hasPhone && (!/^\+\d{1,4}$/.test(countryCode) || getInternationalPhoneDigits(countryCode, formValues.whatsapp).length < 8)) {
      setContactState("error");
      setStatusOverride(
        locale === "pt"
          ? "Informe o codigo do pais com + e um WhatsApp valido."
          : "Enter the country code with + and a valid WhatsApp number.",
      );
      return;
    }

    if (scope.length < 12) {
      setContactState("error");
      setStatusOverride(
        locale === "pt"
          ? "Descreva o escopo com um pouco mais de detalhe antes de enviar."
          : "Please add a bit more detail about the project scope before sending.",
      );
      return;
    }

    if (scope.length > CONTACT_SCOPE_MAX_LENGTH) {
      setContactState("error");
      setStatusOverride(
        locale === "pt"
          ? `Reduza o escopo para ate ${CONTACT_SCOPE_MAX_LENGTH} caracteres antes de enviar.`
          : `Shorten the scope to ${CONTACT_SCOPE_MAX_LENGTH} characters before sending.`,
      );
      return;
    }

    setStatusOverride(
      locale === "pt"
        ? "Validando anti-spam e enviando sua solicitação..."
        : "Running anti-spam verification and sending your request...",
    );
    setContactState("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          whatsapp,
          scope,
          website,
          locale,
        }),
      });
      const data = (await response.json()) as ContactResponse;

      if (!response.ok) {
        setContactState("error");
        setStatusOverride(
          data.message ??
            (locale === "pt"
              ? "Não consegui enviar agora. Tente novamente ou use o WhatsApp."
              : "I could not send it right now. Try again or use WhatsApp."),
        );
        return;
      }

      setContactState("success");
      setStatusOverride(data.message ?? null);
      setFormValues({
        name: "",
        email: "",
        countryCode: locale === "pt" ? "+55" : "+1",
        whatsapp: "",
        scope: "",
        website: "",
      });
    } catch {
      setContactState("error");
      setStatusOverride(
        locale === "pt"
          ? "Não consegui conectar ao envio agora. Tente novamente ou use o WhatsApp."
          : "I could not connect to the submission service right now. Try again or use WhatsApp.",
      );
    }
  }

  function updateFormValue(field: keyof typeof formValues, value: string) {
    setFormValues((current) => ({
      ...current,
      ...(field === "countryCode"
        ? {
            countryCode: normalizeCountryCode(value),
            whatsapp: formatLocalPhone(normalizeCountryCode(value), current.whatsapp),
          }
        : {
            [field]: field === "whatsapp" ? formatLocalPhone(current.countryCode, value) : value,
          }),
    }));

    if (contactState !== "idle") {
      setContactState("idle");
    }

    if (statusOverride) {
      setStatusOverride(null);
    }
  }

  function selectCountryCode(countryCode: string) {
    updateFormValue("countryCode", countryCode);
    setIsCountryMenuOpen(false);
  }

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE[locale],
  )}`;
  const selectedCountry = getCountryOption(formValues.countryCode);
  const scopeCharacterCount = formValues.scope.length;
  const isScopeOverLimit = scopeCharacterCount > CONTACT_SCOPE_MAX_LENGTH;
  const isSubmitting = contactState === "loading";
  const submitCommandLabel = isSubmitting ? copy.submitLoadingCommand : copy.submitCommand;
  const submitCaptionLabel = isSubmitting ? copy.submitLoadingCaption : copy.submitCaption;

  return (
    <div className={styles.portfolio} data-locale={locale} data-theme={theme}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button
            type="button"
            className={styles.brand}
            onClick={() => scrollToSection("hero")}
          >
            <span>{"</DevChell>"}</span>
          </button>

          <nav className={styles.nav} aria-label={copy.navAria}>
            <button
              type="button"
              className={styles.navButton}
              data-active={activeSection === "sobre"}
              onClick={() => scrollToSection("sobre")}
            >
              {copy.nav[0]}
            </button>
            <button
              type="button"
              className={styles.navButton}
              data-active={activeSection === "projetos"}
              onClick={() => scrollToSection("projetos")}
            >
              {copy.nav[1]}
            </button>
            <button
              type="button"
              className={styles.navButton}
              data-active={activeSection === "contato"}
              onClick={() => scrollToSection("contato")}
            >
              {copy.nav[2]}
            </button>
          </nav>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.themeFade}`}
              onClick={handleLocaleToggle}
              aria-label={copy.toggleLocaleAria}
            >
              <GlobeIcon />
            </button>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.themeFade}`}
              onClick={handleThemeToggle}
              aria-label={copy.toggleThemeAria}
            >
              <SunMoonIcon theme={theme} />
            </button>
          </div>
        </div>
      </header>

      <main ref={scrollRef} className={styles.scrollRoot}>
        <section id="hero" data-section className={`${styles.section} ${styles.hero}`}>
          <div className={`${styles.sectionInner} ${styles.heroInner}`}>
            <div className={styles.heroGrid}>
              <div className={styles.heroIntro}>
                <p
                  className={`${styles.eyebrow} ${styles.reveal} ${styles.revealVisible}`}
                  data-reveal
                >
                  {copy.heroEyebrow}
                </p>
                <h1
                  className={`${styles.heroTitle} ${styles.reveal} ${styles.revealVisible}`}
                  data-reveal
                >
                  <span>{copy.heroTitleTop}</span>
                  <strong>{copy.heroTitleBottom}</strong>
                </h1>
                <p
                  className={`${styles.heroDescription} ${styles.reveal} ${styles.revealVisible}`}
                  data-reveal
                >
                  {copy.heroDescription}
                </p>
                <div
                  className={`${styles.heroButtons} ${styles.reveal} ${styles.revealVisible}`}
                  data-reveal
                >
                  <button
                    type="button"
                    className={`${styles.primaryButton} ${styles.themeFade}`}
                    onClick={() => scrollToSection("contato")}
                  >
                    {copy.heroPrimary}
                  </button>
                  <button
                    type="button"
                    className={`${styles.secondaryButton} ${styles.themeFade}`}
                    onClick={() => scrollToSection("projetos")}
                  >
                    {copy.heroSecondary}
                  </button>
                </div>
              </div>

              <div
                className={`${styles.editorShell} ${styles.heroCodeCard} ${styles.reveal}`}
                data-reveal
              >
                <div className={styles.editorTopbar}>
                  <span className={styles.editorDot} data-tone="red" />
                  <span className={styles.editorDot} data-tone="yellow" />
                  <span className={styles.editorDot} data-tone="green" />
                </div>
                <div className={styles.editorBody}>
                  <div className={`${styles.editorCode} ${styles.heroCode}`}>
                    <div>
                      <span className={styles.editorKeyword}>const</span>
                      <span className={styles.editorVariable}>{` ${codeCopy.hero.objectName}`}</span>
                      <span className={styles.editorOperator}> = </span>
                      <span className={styles.editorPunctuation}>{"{"}</span>
                    </div>
                    <div className={styles.heroFocusLine}>
                      {formatCodeKey(codeCopy.hero.focusKey)}
                      <span className={styles.heroFocusTyping}>
                        <span className={styles.editorStringQuote}>{'"'}</span>
                        <span className={`${styles.editorString} ${styles.heroFocusValue}`}>
                          {typedHeroFocus}
                        </span>
                        <span className={styles.codeCursor} aria-hidden="true" />
                        <span className={styles.editorStringQuote}>{'"'}</span>
                        <span className={styles.editorPunctuation}>,</span>
                      </span>
                    </div>
                    <div>
                      {formatCodeKey(codeCopy.hero.executionKey)}
                      <span className={styles.editorStringQuote}>{'"'}</span>
                      <span className={styles.editorString}>{codeCopy.hero.executionValue}</span>
                      <span className={styles.editorStringQuote}>{'"'}</span>
                      <span className={styles.editorPunctuation}>,</span>
                    </div>
                    <div>
                      {formatCodeKey(codeCopy.hero.deliveryKey)}
                      <span className={styles.editorStringQuote}>{'"'}</span>
                      <span className={styles.editorString}>{codeCopy.hero.deliveryValue}</span>
                      <span className={styles.editorStringQuote}>{'"'}</span>
                      <span className={styles.editorPunctuation}>,</span>
                    </div>
                    <div>
                      {formatCodeKey(codeCopy.hero.statusKey)}
                      <span className={styles.editorBoolean}>{codeCopy.hero.statusValue}</span>
                      <span className={styles.editorPunctuation}>,</span>
                    </div>
                    <div>
                      <span className={styles.editorPunctuation}>{"}"}</span>
                    </div>
                  </div>
                  <div className={styles.heroCodeFooter}>
                    <span className={styles.heroCodeAccent}>{codeCopy.hero.footerComment}</span>
                    <span>{codeCopy.hero.footerMeta}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={styles.heroScrollButton}
              onClick={() => scrollToSection("sobre")}
              aria-label={copy.heroScrollAria}
            >
              <DownArrowIcon />
            </button>
          </div>
        </section>

        <section id="sobre" data-section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.aboutGrid}>
              <div className={`${styles.aboutContentCard} ${styles.reveal}`} data-reveal>
                <p className={styles.sectionKicker}>{copy.aboutLabel}</p>
                <h2 className={styles.sectionTitle}>
                  <strong>{copy.aboutTitleStrong}</strong>
                  <span>{copy.aboutTitleSoft}</span>
                </h2>
                <p className={styles.sectionText}>
                  {locale === "pt" ? (
                    <>
                      Sou <strong>Engenheiro de Software Full-stack</strong> com foco em
                      back-end, SaaS multi-tenant e IA aplicada, do banco ao deploy: APIs
                      em Node.js e TypeScript, PostgreSQL, React/Next.js, Docker e
                      integração de LLMs em produto. Cofundador & Engenheiro Full-stack na TyviaTalk (Tevio, TyviaTalk, SinceMarket) e analista de
                      suporte com QA e desenvolvimento C#/.NET em ERP.
                    </>
                  ) : (
                    <>
                      I am a <strong>Full-stack Software Engineer</strong> focused on
                      back-end, multi-tenant SaaS and applied AI, from database to
                      deployment: Node.js and TypeScript APIs, PostgreSQL, React/Next.js,
                      Docker and LLM integration in products. Co-founder & Full-stack Engineer at TyviaTalk (Tevio, TyviaTalk, SinceMarket) and ERP
                      support analyst with QA and C#/.NET development.
                    </>
                  )}
                </p>
                <div className={styles.aboutDivider} />
                <p className={styles.sectionText}>
                  {locale === "pt" ? (
                    <>
                      Cursando <strong>Ciência da Computação</strong> na Descomplica
                      (previsão de conclusão 2026), com base em Segurança da Informação
                      aplicada para entregar sistemas seguros e escaláveis.
                    </>
                  ) : (
                    <>
                      Studying <strong>Computer Science</strong> at Descomplica (expected
                      completion 2026), with an Information Security background applied to
                      deliver secure and scalable systems.
                    </>
                  )}
                </p>

                <div className={styles.aboutFacts}>
                  <div className={styles.aboutFact}>
                    <span>{locale === "pt" ? "Foco" : "Focus"}</span>
                    <strong>{locale === "pt" ? "Back-end, SaaS & IA aplicada" : "Back-end, SaaS & Applied AI"}</strong>
                  </div>
                  <div className={styles.aboutFact}>
                    <span>{locale === "pt" ? "Entrega" : "Delivery"}</span>
                    <strong>{locale === "pt" ? "Código, testes e deploy" : "Code, tests and deploy"}</strong>
                  </div>
                  <div className={styles.aboutFact}>
                    <span>{locale === "pt" ? "Base" : "Foundation"}</span>
                    <strong>{locale === "pt" ? "Segurança da Informação" : "Information Security"}</strong>
                  </div>
                </div>
              </div>

              <div
                className={`${styles.editorShell} ${styles.aboutEditor} ${styles.reveal}`}
                data-reveal
              >
                <div className={styles.editorTopbar}>
                  <span className={styles.editorDot} data-tone="red" />
                  <span className={styles.editorDot} data-tone="yellow" />
                  <span className={styles.editorDot} data-tone="green" />
                </div>
                <div className={styles.editorBody}>
                  <div className={styles.editorCode}>
                    <div>
                      <span className={styles.editorKeyword}>const</span>
                      <span className={styles.editorVariable}>{` ${codeCopy.about.objectName}`}</span>
                      <span className={styles.editorOperator}> = </span>
                      <span className={styles.editorPunctuation}>{"{"}</span>
                    </div>
                    <div>
                      {formatCodeKey(codeCopy.about.nameKey)}
                      <span className={styles.editorStringQuote}>{'"'}</span>
                      <span className={styles.editorString}>João Vitor Rodrigues</span>
                      <span className={styles.editorStringQuote}>{'"'}</span>
                      <span className={styles.editorPunctuation}>,</span>
                    </div>
                    <div>
                      {formatCodeKey(codeCopy.about.aliasKey)}
                      <span className={styles.editorStringQuote}>{'"'}</span>
                      <span className={styles.editorString}>Chell</span>
                      <span className={styles.editorStringQuote}>{'"'}</span>
                      <span className={styles.editorPunctuation}>,</span>
                    </div>
                    <div>&nbsp;</div>
                    <div>
                      {formatCodeKey(codeCopy.about.stackKey)}
                      <span className={styles.editorPunctuation}>[</span>
                    </div>
                    {codeCopy.about.stackLines.map((line, index) => (
                      <div key={`stack-line-${index}`}>
                        {"    "}
                        {line.map((item, itemIndex) => (
                          <span key={`${item}-${itemIndex}`}>
                            <span className={styles.editorStringQuote}>{'"'}</span>
                            <span className={styles.editorString}>{item}</span>
                            <span className={styles.editorStringQuote}>{'"'}</span>
                            {itemIndex < line.length - 1 ? (
                              <span className={styles.editorPunctuation}>, </span>
                            ) : null}
                          </span>
                        ))}
                      </div>
                    ))}
                    <div>
                      <span className={styles.editorPunctuation}>{"  ],"}</span>
                    </div>
                    <div>&nbsp;</div>
                    <div>
                      {formatCodeKey(codeCopy.about.specialtiesKey)}
                      <span className={styles.editorPunctuation}>[</span>
                    </div>
                    {codeCopy.about.specialtyLines.map((line, index) => (
                      <div key={`specialty-line-${index}`}>
                        {"    "}
                        {line.map((item, itemIndex) => (
                          <span key={`${item}-${itemIndex}`}>
                            <span className={styles.editorStringQuote}>{'"'}</span>
                            <span className={styles.editorString}>{item}</span>
                            <span className={styles.editorStringQuote}>{'"'}</span>
                            {itemIndex < line.length - 1 ? (
                              <span className={styles.editorPunctuation}>, </span>
                            ) : null}
                          </span>
                        ))}
                      </div>
                    ))}
                    <div>
                      <span className={styles.editorPunctuation}>{"  ],"}</span>
                    </div>
                    <div>&nbsp;</div>
                    <div>
                      {formatCodeKey(codeCopy.about.educationKey)}
                      <span className={styles.editorStringQuote}>{'"'}</span>
                      <span className={styles.editorString}>{codeCopy.about.educationValue}</span>
                      <span className={styles.editorStringQuote}>{'"'}</span>
                      <span className={styles.editorPunctuation}>,</span>
                    </div>
                    <div>
                      {formatCodeKey(codeCopy.about.approachKey)}
                      <span className={styles.editorStringQuote}>{'"'}</span>
                      <span className={styles.editorString}>{codeCopy.about.approachValue}</span>
                      <span className={styles.editorStringQuote}>{'"'}</span>
                      <span className={styles.editorPunctuation}>,</span>
                    </div>
                    <div>
                      <span className={styles.editorPunctuation}>{"}"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="projetos"
          data-section
          className={`${styles.section} ${styles.projectsSection}`}
        >
          <div className={styles.sectionInner}>
            <div className={`${styles.projectsHeader} ${styles.reveal}`} data-reveal>
              <p className={styles.sectionKicker}>{copy.projectsLabel}</p>
              <h2 className={styles.sectionTitle}>
                <strong>{copy.projectsTitleStrong}</strong>
                <span>{copy.projectsTitleSoft}</span>
              </h2>
              <p className={styles.projectsIntroText}>{copy.projectsIntro}</p>
            </div>

            <div className={`${styles.projectsShowcase} ${styles.reveal}`} data-reveal>
              <div className={styles.projectRailShell}>
                <button
                  type="button"
                  className={`${styles.projectRailControl} ${styles.themeFade}`}
                  onClick={() => scrollProjectRail("prev")}
                  aria-label={copy.previousProjectAria}
                >
                  <ArrowIcon direction="left" />
                </button>

                <div className={styles.projectRailViewportFrame}>
                  <div
                    ref={projectRailViewportRef}
                    className={styles.projectRailViewport}
                    aria-label={copy.projectRailAria}
                  >
                    <div className={styles.projectRail}>
                      {PROJECTS.map((project, index) => (
                        <button
                          key={project.name}
                          type="button"
                          className={`${styles.projectRailButton} ${styles.themeFade}`}
                          data-active={index === projectIndex}
                          data-project-card-index={index}
                          onClick={() => selectProject(index)}
                          aria-pressed={index === projectIndex}
                        >
                          <span className={styles.projectRailTop} aria-hidden="true">
                            <span className={styles.projectRailIndex}>
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span
                              className={styles.projectRailStatus}
                              data-locked={project.locked ? "true" : undefined}
                            >
                              {project.locked ? <StageLockGlyph /> : <StageGlobeGlyph />}
                            </span>
                          </span>
                          <span className={styles.projectRailName}>{project.name}</span>
                          <span className={styles.projectRailType}>{project.title[locale]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`${styles.projectRailControl} ${styles.themeFade}`}
                  onClick={() => scrollProjectRail("next")}
                  aria-label={copy.nextProjectAria}
                >
                  <ArrowIcon />
                </button>
              </div>

              <div
                key={`${activeProject.name}-${locale}`}
                className={`${styles.projectFeatured} ${styles.themeFade}`}
              >
                <div className={styles.projectMediaPanel}>
                  <div className={styles.projectStage}>
                    <div className={styles.projectStageBar} aria-hidden="true">
                      <span className={styles.projectStageLeft}>
                        <span className={styles.projectStageDots}>
                          <span className={styles.editorDot} data-tone="red" />
                          <span className={styles.editorDot} data-tone="yellow" />
                          <span className={styles.editorDot} data-tone="green" />
                        </span>
                        <span className={styles.projectStageNav}>
                          <span className={styles.projectStageIcon}><StageSidebarGlyph /></span>
                          <span className={styles.projectStageIcon}><StageChevron dir="left" /></span>
                          <span className={styles.projectStageIcon} data-dim="true"><StageChevron dir="right" /></span>
                        </span>
                      </span>
                      <span
                        className={styles.projectStageAddress}
                        data-locked={activeProject.locked ? "true" : undefined}
                      >
                        {activeProject.locked ? <StageLockGlyph /> : <StageGlobeGlyph />}
                        <span className={styles.projectStageAddressText}>
                          {activeProject.locked
                            ? (activeProject.statusTag?.[locale] ?? copy.projectPrivateTag)
                            : activeProjectHost || activeProject.name.toLowerCase()}
                        </span>
                        <span className={styles.projectStageReload}><StageReloadGlyph /></span>
                      </span>
                      <span className={styles.projectStageRight}>
                        <span className={styles.projectStageIcon}><StageShareGlyph /></span>
                        <span className={styles.projectStageIcon}><StagePlusGlyph /></span>
                        <span className={styles.projectStageIcon}><StageTabsGlyph /></span>
                      </span>
                    </div>

                    <div className={styles.projectFrame}>
                      {hasScreenshots ? (<>
                      <button
                        type="button"
                        className={`${styles.carouselArrow} ${styles.carouselPrev} ${styles.themeFade}`}
                        onClick={() => navigateScreenshot("prev")}
                        aria-label={copy.previousScreenshotAria}
                      >
                        <ArrowIcon direction="left" />
                      </button>

                      <button
                        type="button"
                        className={`${styles.carouselArrow} ${styles.carouselNext} ${styles.themeFade}`}
                        onClick={() => navigateScreenshot("next")}
                        aria-label={copy.nextScreenshotAria}
                      >
                        <ArrowIcon />
                      </button>
                      </>) : (
                        <div className={styles.projectPlaceholder}>
                          <strong>{activeProject.name}</strong>
                          <span>{activeProject.title[locale]}</span>
                          <small>
                            {activeProject.statusTag?.[locale] ??
                              (locale === "pt" ? "sem capturas públicas" : "no public screenshots")}
                          </small>
                        </div>
                      )}

                      {!activeProject.locked ? (
                        <a
                          href={activeProject.url}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.projectLinkOverlay}
                          aria-label={`${copy.openProjectAria} ${activeProject.name}`}
                        />
                      ) : null}

                      {activeProject.screenshots.map((shot, index) => (
                        <div
                          key={shot}
                          className={styles.projectSlide}
                          data-active={index === screenshotIndex}
                        >
                          <Image
                            className={styles.projectImage}
                            src={shot}
                            alt={`${activeProject.name} ${copy.screenshotAlt} ${index + 1}`}
                            fill
                            quality={100}
                            priority={index === 0 && projectIndex === 0}
                            sizes="(max-width: 760px) calc(100vw - 56px), (max-width: 1100px) calc(100vw - 72px), 720px"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.projectFrameFooter}>
                    {hasScreenshots ? (<>
                    <div className={styles.projectScreenshotDots} aria-hidden="true">
                      {activeProject.screenshots.map((shot, index) => (
                        <span
                          key={`${shot}-dot`}
                          className={styles.projectScreenshotDot}
                          data-active={index === screenshotIndex}
                        />
                      ))}
                    </div>
                    <span className={styles.projectShotCounter} aria-hidden="true">
                      {String(screenshotIndex + 1).padStart(2, "0")}
                      {" / "}
                      {String(activeProject.screenshots.length).padStart(2, "0")}
                    </span>
                    </>) : null}
                  </div>
                </div>

                <div className={styles.projectAside}>
                  <div className={styles.projectAsideHead}>
                    <div className={styles.projectEyebrow} aria-hidden="true">
                      <span className={styles.projectEyebrowIndex}>
                        {String(projectIndex + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.projectEyebrowSep} />
                      <span className={styles.projectEyebrowText}>
                        {activeProject.systems[0]}
                      </span>
                      <span
                        className={styles.projectEyebrowStatus}
                        data-locked={activeProject.locked ? "true" : undefined}
                      >
                        {activeProject.locked ? (activeProject.statusTag?.[locale] ?? copy.projectPrivateTag) : activeProjectHost}
                      </span>
                    </div>
                    <h3 className={styles.projectName}>{activeProject.name}</h3>
                    <p className={styles.projectType}>{activeProject.title[locale]}</p>
                  </div>

                  <div className={styles.projectAsideBody}>
                    <p className={styles.projectSummaryText}>
                      {activeProject.description[locale]}
                    </p>

                    <div className={styles.projectStack}>
                      <span className={styles.projectStackLabel}>Stack</span>
                      <div className={styles.projectBadgeRow}>
                        {[...activeProject.technologies, ...activeProject.systems].map(
                          (badge, badgeIndex) => (
                            <ProjectBadge
                              key={`${activeProject.name}-badge-${badge}-${badgeIndex}`}
                              badge={badge}
                              label={badgeLabels[badge] ?? badge}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.projectAsideFoot}>
                    {activeProject.locked ? (
                      <button
                        type="button"
                        className={`${styles.projectVisit} ${styles.projectVisitLocked}`}
                        disabled
                      >
                        <span className={styles.projectVisitLabel}>
                          {copy.projectUnavailable}
                        </span>
                        <span className={styles.projectVisitIcon}>
                          <StageLockGlyph />
                        </span>
                      </button>
                    ) : (
                      <a
                        href={activeProject.url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.projectVisit}
                        aria-label={`${copy.openProjectAria} ${activeProject.name}`}
                      >
                        <span className={styles.projectVisitLabel}>{activeProject.linkLabel?.[locale] ?? copy.projectVisit}</span>
                        <span className={styles.projectVisitIcon}>
                          <ExternalIcon />
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="contato"
          data-section
          className={`${styles.section} ${styles.contactSection}`}
        >
          <div className={styles.sectionInner}>
            <div className={`${styles.contactHeader} ${styles.reveal}`} data-reveal>
              <p className={styles.sectionKicker}>{copy.contactLabel}</p>
              <h2 className={styles.sectionTitle}>
                <strong>{copy.contactTitleStrong}</strong>
                <span>{copy.contactTitleSoft}</span>
              </h2>
              <p className={styles.contactDescription}>{copy.contactDescription}</p>
            </div>

            <div className={`${styles.contactWrap} ${styles.reveal}`} data-reveal>
              <div className={`${styles.editorShell} ${styles.contactEditorShell}`}>
                <div className={styles.editorTopbar}>
                  <span className={styles.editorDot} data-tone="red" />
                  <span className={styles.editorDot} data-tone="yellow" />
                  <span className={styles.editorDot} data-tone="green" />
                </div>

                <form
                  className={styles.contactForm}
                  onSubmit={handleSubmit}
                >
                  <input
                    type="text"
                    name="website"
                    value={formValues.website}
                    onChange={(event) => updateFormValue("website", event.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className={styles.honeypotField}
                    aria-hidden="true"
                  />
                  <div className={styles.contactCodeGrid}>
                    <div className={styles.codeGutter} aria-hidden="true">
                      <span>01</span>
                      <span>02</span>
                      <span>03</span>
                      <span>04</span>
                      <span>05</span>
                      <span>06</span>
                      <span>07</span>
                      <span>08</span>
                      <span>09</span>
                      <span>10</span>
                    </div>

                    <div className={styles.contactCodeBlock}>
                      <div className={styles.codeLine}>
                        <span className={styles.editorKeyword}>const</span>
                        <span className={styles.editorVariable}>{` ${codeCopy.contact.objectName}`}</span>
                        <span className={styles.editorOperator}> = </span>
                        <span className={styles.editorPunctuation}>{"{"}</span>
                      </div>
                      <label className={`${styles.codeFieldRow} ${styles.codeFieldStandardRow}`}>
                        <span className={styles.codeLabel}>
                          {formatCodeKey(codeCopy.contact.nameKey)}
                        </span>
                        <span className={styles.editorStringQuote}>{'"'}</span>
                        <input
                          name="name"
                          value={formValues.name}
                          onChange={(event) => updateFormValue("name", event.target.value)}
                          placeholder={copy.placeholders.name}
                          autoComplete="name"
                          required
                          minLength={2}
                          className={styles.codeInlineInput}
                        />
                        <span className={styles.editorStringQuote}>{'"'}</span>
                        <span className={styles.editorPunctuation}>,</span>
                      </label>
                      <label className={`${styles.codeFieldRow} ${styles.codeFieldStandardRow}`}>
                        <span className={styles.codeLabel}>
                          {formatCodeKey(codeCopy.contact.emailKey)}
                        </span>
                        <span className={styles.editorStringQuote}>{'"'}</span>
                        <input
                          name="email"
                          type="email"
                          value={formValues.email}
                          onChange={(event) => updateFormValue("email", event.target.value)}
                          placeholder={copy.placeholders.email}
                          autoComplete="email"
                          required
                          className={styles.codeInlineInput}
                        />
                        <span className={styles.editorStringQuote}>{'"'}</span>
                        <span className={styles.editorPunctuation}>,</span>
                      </label>
                      <div
                        className={`${styles.codeFieldRow} ${styles.codeFieldPhoneRow} ${
                          isCountryMenuOpen ? styles.codeFieldMenuOpen : ""
                        }`}
                      >
                        <span className={styles.codeLabel}>
                          {formatCodeKey(codeCopy.contact.whatsappKey)}
                        </span>
                        <span className={styles.editorStringQuote}>{'"'}</span>
                        <div className={styles.countryCodePicker} ref={countryCodePickerRef}>
                          <input
                            type="hidden"
                            name="countryCode"
                            value={formValues.countryCode}
                          />
                          <button
                            type="button"
                            className={styles.countryCodeTrigger}
                            onClick={() => setIsCountryMenuOpen((current) => !current)}
                            aria-haspopup="listbox"
                            aria-expanded={isCountryMenuOpen}
                            aria-label={locale === "pt" ? "Selecionar codigo do pais" : "Select country code"}
                          >
                            <span>{selectedCountry.short}</span>
                            <strong>{selectedCountry.code}</strong>
                            <span className={styles.countryChevron} aria-hidden="true" />
                          </button>
                          {isCountryMenuOpen ? (
                            <div className={styles.countryCodeMenu} role="listbox">
                              {COUNTRY_OPTIONS.map((option) => (
                                <button
                                  key={option.code}
                                  type="button"
                                  className={styles.countryCodeOption}
                                  data-active={option.code === formValues.countryCode}
                                  onClick={() => selectCountryCode(option.code)}
                                  role="option"
                                  aria-selected={option.code === formValues.countryCode}
                                >
                                  <span>{option.short}</span>
                                  <strong>{option.code}</strong>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <input
                          name="whatsapp"
                          value={formValues.whatsapp}
                          onChange={(event) => updateFormValue("whatsapp", event.target.value)}
                          placeholder={selectedCountry.placeholder}
                          autoComplete="tel"
                          inputMode="tel"
                          className={styles.codeInlineInput}
                        />
                        <span className={styles.editorStringQuote}>{'"'}</span>
                        <span className={styles.editorPunctuation}>,</span>
                      </div>
                      <div className={styles.codeLine}>
                        {formatCodeKey(codeCopy.contact.scopeKey)}
                        <span className={styles.editorStringQuote}>`</span>
                      </div>
                      <label className={styles.codeTextareaWrap}>
                        <span className={styles.srOnly}>{codeCopy.contact.scopeLabel}</span>
                        <textarea
                          name="scope"
                          value={formValues.scope}
                          onChange={(event) => updateFormValue("scope", event.target.value)}
                          placeholder={copy.placeholders.scope}
                          required
                          minLength={12}
                          className={styles.codeTextarea}
                          aria-invalid={isScopeOverLimit}
                          aria-describedby="scope-character-count"
                        />
                        <span
                          id="scope-character-count"
                          className={styles.scopeCounter}
                          data-over-limit={isScopeOverLimit}
                          aria-live="polite"
                        >
                          <span className={styles.scopeAlertDot} aria-hidden="true" />
                          <span>
                            {scopeCharacterCount}/{CONTACT_SCOPE_MAX_LENGTH}
                          </span>
                        </span>
                      </label>
                      <div className={styles.codeLine}>
                        <span className={styles.editorStringQuote}>`</span>
                        <span className={styles.editorPunctuation}>,</span>
                      </div>
                      <div className={styles.codeLine}>
                        <span className={styles.editorPunctuation}>{"};"}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.contactActions}>
                    <p className={styles.statusMessage}>
                      {statusOverride ?? formatStatus(locale, contactState)}
                    </p>
                    <p className={styles.privacyNote}>
                      {locale === "pt"
                        ? "Privacidade (LGPD): nome, e-mail e telefone (opcional) são usados apenas para responder à sua mensagem, enviados por e-mail ao titular deste site e não são compartilhados nem usados para marketing. Para pedir acesso, correção ou exclusão, escreva para rodriguessnts@outlook.com."
                        : "Privacy (LGPD): name, email and phone (optional) are used only to reply to your message, are sent by email to the site owner and are not shared or used for marketing. To request access, correction or deletion, write to rodriguessnts@outlook.com."}
                    </p>
                    <div className={styles.contactButtons}>
                      <button
                        type="submit"
                        className={`${styles.submitButton} ${styles.themeFade}`}
                        disabled={isSubmitting}
                        aria-busy={isSubmitting}
                      >
                        <span className={styles.submitTerminal}>
                          <span className={styles.submitPrompt} aria-hidden="true">
                            $
                          </span>
                          <span className={styles.submitCommand}>{submitCommandLabel}</span>
                        </span>
                        <span className={styles.submitMeta}>{submitCaptionLabel}</span>
                      </button>

                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className={`${styles.whatsappButton} ${styles.themeFade}`}
                      >
                        <span className={styles.whatsappButtonIcon} aria-hidden="true">
                          <WhatsAppIcon />
                        </span>
                        <span className={styles.whatsappButtonBody}>
                          <span className={styles.whatsappButtonTitle}>{copy.whatsapp}</span>
                          <span className={styles.whatsappButtonMeta}>{copy.whatsappCaption}</span>
                        </span>
                      </a>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.sectionInner}>
            <div className={styles.footerInner}>
              <div className={styles.footerGrid}>
                <div>
                  <p className={styles.footerHeading}>{copy.footerContact}</p>
                  <div className={styles.footerRule} />
                  <div className={styles.footerList}>
                    <a href={`mailto:${CONTACT_EMAIL}`} className={styles.footerItem}>
                      <MailIcon />
                      <span>{CONTACT_EMAIL}</span>
                    </a>
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.footerItem}
                    >
                      <PhoneIcon />
                      <span>(11) 98946-8955</span>
                    </a>
                  </div>
                </div>

                <div>
                  <p className={styles.footerHeading}>{copy.footerSocials}</p>
                  <div className={styles.footerRule} />
                  <div className={styles.footerSocials}>
                    <a
                      href="https://github.com/devchell"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.footerSocialLink}
                      aria-label="GitHub"
                    >
                      <GithubIcon />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/jvsnts/"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.footerSocialLink}
                      aria-label="LinkedIn"
                    >
                      <LinkedinIcon />
                    </a>
                  </div>
                </div>
              </div>

              <p className={styles.footerSignature}>
                {copy.footerSignature} <span>{"</devchell>"}</span>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
