"use client";

import Image from "next/image";
import { FormEvent, startTransition, useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";
import styles from "./portfolio.module.css";

type Theme = "light" | "dark";
type Locale = "pt" | "en";
type ContactState = "idle" | "loading" | "success" | "error";
type HeroTypingPhase = "typing" | "holding" | "deleting";

type Project = {
  name: string;
  url: string;
  locked?: boolean;
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
const WHATSAPP_NUMBER = "5511978290118";
const WHATSAPP_MESSAGE = {
  pt: "Olá, João. Quero solicitar um orçamento de serviço para um projeto.",
  en: "Hi João, I would like to request a quote for a project.",
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
  },
};

const COPY = {
  pt: {
    nav: ["Sobre", "Projetos", "Contato"],
    heroEyebrow: "JOÃO VITOR RODRIGUES",
    heroTitleTop: "Desenvolvedor",
    heroTitleBottom: "Web & Sistemas",
    heroDescription:
      "Transformo ideias em produtos digitais completos, do backend ao deploy.",
    heroMeta: "FullStack · SaaS · CRM · Landing Pages · IA",
    heroPrimary: "Fazer Orçamento",
    heroSecondary: "Ver Projetos",
    aboutLabel: "SOBRE MIM",
    aboutTitleStrong: "Código limpo,",
    aboutTitleSoft: "resultados reais.",
    projectsLabel: "PROJETOS",
    projectsTitleStrong: "O que eu",
    projectsTitleSoft: "já construí.",
    projectsIntro:
      "Projetos pensados para converter, posicionar e sustentar operação com clareza visual e técnica.",
    projectSummary: "Resumo do projeto",
    projectTechLabel: "Stacks & Tech",
    projectSystemsLabel: "Tipos",
    projectVisit: "Visitar projeto",
    projectUnavailable: "Projeto privado",
    contactLabel: "CONTATO",
    contactTitleStrong: "Briefing em código,",
    contactTitleSoft: "execução sem ruído.",
    contactDescription:
      "Descreva objetivo, contexto e escopo como se estivesse abrindo uma issue bem escrita. Eu organizo o resto.",
    submitCommand: "git push",
    submitCaption: "enviar briefing",
    whatsapp: "Conversar no WhatsApp",
    whatsappCaption: "resposta rápida",
    statusIdle: "Preencha o formulário e eu retorno pelo e-mail informado.",
    statusLoading: "Enviando sua solicitação...",
    statusSuccess: "Solicitação enviada. Vou responder pelo e-mail informado.",
    statusError: "Não foi possível enviar agora. Use o WhatsApp e eu sigo por lá.",
    placeholders: {
      name: "Seu nome",
      email: "seu@email.com",
      countryCode: "+55",
      whatsapp: "(11) 9 9999-9999",
      scope:
        "Conte o objetivo, prazo, entregáveis, integrações e qualquer referência importante.",
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
    footerSignature: "Portfólio criado por",
  },
  en: {
    nav: ["About", "Projects", "Contact"],
    heroEyebrow: "JOAO VITOR RODRIGUES",
    heroTitleTop: "Developer",
    heroTitleBottom: "Web & Systems",
    heroDescription:
      "I turn ideas into complete digital products, from backend architecture to deployment.",
    heroMeta: "FullStack · SaaS · CRM · Landing Pages · AI",
    heroPrimary: "Request Quote",
    heroSecondary: "View Projects",
    aboutLabel: "ABOUT ME",
    aboutTitleStrong: "Clean code,",
    aboutTitleSoft: "real outcomes.",
    projectsLabel: "PROJECTS",
    projectsTitleStrong: "What I",
    projectsTitleSoft: "have built.",
    projectsIntro:
      "Projects designed to convert, position brands, and support real operations with visual and technical clarity.",
    projectSummary: "Project overview",
    projectTechLabel: "Stacks & Tech",
    projectSystemsLabel: "System Type",
    projectVisit: "Visit project",
    projectUnavailable: "Private project",
    contactLabel: "CONTACT",
    contactTitleStrong: "Code-like brief,",
    contactTitleSoft: "clean execution.",
    contactDescription:
      "Describe the goal, context, and scope as if you were opening a well-written issue. I will structure the rest.",
    submitCommand: "git push",
    submitCaption: "send brief",
    whatsapp: "Talk on WhatsApp",
    whatsappCaption: "quick reply",
    statusIdle: "Fill out the form and I will reply to the email you provide.",
    statusLoading: "Sending your request...",
    statusSuccess: "Request sent. I will reply to your email shortly.",
    statusError: "The request could not be sent right now. Use WhatsApp and I will continue there.",
    placeholders: {
      name: "Your name",
      email: "your@email.com",
      countryCode: "+1",
      whatsapp: "(555) 123-4567",
      scope:
        "Tell me the goal, timeline, deliverables, integrations and any references that matter.",
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
    footerSignature: "Portfolio created by",
  },
} as const;

const PROJECTS: Project[] = [
  {
    name: "Vetta",
    url: "https://vetta-devchells-projects.vercel.app/",
    title: {
      pt: "Landing Page",
      en: "Landing Page",
    },
    description: {
      pt: "Landing page editorial criada para vender um infoproduto de marketing com tese visual forte, copy modular e foco em conversão.",
      en: "Editorial landing page created to sell a marketing infoproduct with a strong visual thesis, modular copy, and conversion focus.",
    },
    technologies: ["Next.js", "Vercel"],
    systems: ["Landing Page", "SEO"],
    screenshots: [
      "/projects/vetta/vetta-01.png",
      "/projects/vetta/vetta-02.png",
      "/projects/vetta/vetta-03.png",
      "/projects/vetta/vetta-04.png",
      "/projects/vetta/vetta-05.png",
    ],
  },
  {
    name: "UltraRubber",
    url: "",
    locked: true,
    title: {
      pt: "Landing Page & CRM",
      en: "Landing Page & CRM",
    },
    description: {
      pt: "Sistema de captação e gestão comercial com landing pública, login interno, fluxo de orçamentos, catálogo, métricas e operação industrial estruturada.",
      en: "Lead capture and commercial operations system with a public landing, internal login, quote flow, catalog, metrics, and a structured industrial workflow.",
    },
    technologies: ["Next.js", "Supabase", "PostgreSQL"],
    systems: ["CRM", "Automation", "SEO"],
    screenshots: [
      "/projects/ultrarubber/ultrarubber-01.png",
      "/projects/ultrarubber/ultrarubber-02.png",
      "/projects/ultrarubber/ultrarubber-03.png",
      "/projects/ultrarubber/ultrarubber-04.png",
      "/projects/ultrarubber/ultrarubber-05.png",
    ],
  },
  {
    name: "VivianiCRM",
    url: "",
    locked: true,
    title: {
      pt: "Landing Page & CRM",
      en: "Landing Page & CRM",
    },
    description: {
      pt: "CRM single-tenant para operação de serviços, centralizando leads, agenda, financeiro, conteúdo público e automações de WhatsApp e e-mail em um único ecossistema.",
      en: "Single-tenant CRM for a services operation, centralizing leads, scheduling, finance, public content, and WhatsApp/email automations in one ecosystem.",
    },
    technologies: ["Next.js", "Prisma", "PostgreSQL"],
    systems: ["CRM", "WhatsApp", "Email"],
    screenshots: [
      "/projects/viviani/viviani-01.png",
      "/projects/viviani/viviani-02.png",
      "/projects/viviani/viviani-03.png",
      "/projects/viviani/viviani-04.png",
      "/projects/viviani/viviani-05.png",
    ],
  },
  {
    name: "TyviaHub",
    url: "https://tyviahub.com.br/br",
    title: {
      pt: "Plataforma Omnichannel SaaS",
      en: "Omnichannel SaaS Platform",
    },
    description: {
      pt: "Suite multitenant para atendimento omnichannel, gestão operacional, IA, módulos white-label e expansão por produto dentro do ecossistema TyviaHub.",
      en: "Multi-tenant suite for omnichannel support, operational management, AI, white-label modules, and product-based expansion across the TyviaHub ecosystem.",
    },
    technologies: ["React", "Node.js", "PostgreSQL"],
    systems: ["SaaS", "Omnichannel", "AI"],
    screenshots: [
      "/projects/tyviahub/tyviahub-01.png",
      "/projects/tyviahub/tyviahub-02.png",
      "/projects/tyviahub/tyviahub-03.png",
      "/projects/tyviahub/tyviahub-04.png",
      "/projects/tyviahub/tyviahub-05.png",
    ],
  },
  {
    name: "AkiMais",
    url: "https://akimais.com.br/",
    title: {
      pt: "SaaS de Franquias & White Label",
      en: "Franchise SaaS & White Label",
    },
    description: {
      pt: "Plataforma multi-tenant para operação master, franquias e portal do cliente, com onboarding, linhas, comissões, vendas e dashboards operacionais.",
      en: "Multi-tenant platform for master operations, franchise management, and customer portals, with onboarding, lines, commissions, sales, and operational dashboards.",
    },
    technologies: ["Next.js", "TypeScript", "PostgreSQL"],
    systems: ["SaaS", "Franchise", "White Label"],
    screenshots: [
      "/projects/akimais/akimais-01.png",
      "/projects/akimais/akimais-02.png",
      "/projects/akimais/akimais-03.png",
      "/projects/akimais/akimais-04.png",
      "/projects/akimais/akimais-05.png",
    ],
  },
];

const HERO_FOCUS_ROTATIONS = {
  pt: [
    "SaaS + CRM + Landing Pages",
    "Sistemas Web + Automação",
    "Dashboards + APIs + Deploy",
  ],
  en: [
    "SaaS + CRM + Landing Pages",
    "Web Systems + Automation",
    "Dashboards + APIs + Deploy",
  ],
} as const;

const CODE_COPY = {
  pt: {
    hero: {
      objectName: "construtor",
      focusKey: "foco",
      executionKey: "execucao",
      executionValue: "Design + Código + Deploy",
      deliveryKey: "entrega",
      deliveryValue: "Sistemas claros e escaláveis",
      statusKey: "status",
      statusValue: "ativo",
      footerComment: "// disponível para freela",
      footerMeta: "arquitetura limpa | clareza visual",
    },
    about: {
      objectName: "desenvolvedor",
      nameKey: "nome",
      aliasKey: "apelido",
      stackKey: "stack",
      stackLines: [
        ["Next.js", "TypeScript", "Node.js"],
        ["Java", "C#", "AWS", "LLMs"],
      ],
      specialtiesKey: "especialidades",
      specialtyLines: [
        ["SaaS", "CRM", "Landing Page"],
        ["UI/UX", "Automação", "AppSec", "IA"],
      ],
      educationKey: "formacao",
      educationValue: "Ciência da Computação",
      postGradKey: "posGrad",
      postGradValue: "Arquitetura & Engenharia de IA",
      freelanceKey: "freela",
      availableKey: "disponivel",
      approachKey: "abordagem",
      approachValue: "clareza acima do ruído",
    },
    contact: {
      objectName: "solicitacaoProjeto",
      nameKey: "nome",
      emailKey: "email",
      whatsappKey: "whatsapp",
      scopeKey: "escopo",
      scopeLabel: "Escopo do projeto",
    },
  },
  en: {
    hero: {
      objectName: "builder",
      focusKey: "focus",
      executionKey: "execution",
      executionValue: "Design + Code + Deploy",
      deliveryKey: "delivery",
      deliveryValue: "Clear and scalable systems",
      statusKey: "status",
      statusValue: "online",
      footerComment: "// available for freelance",
      footerMeta: "clean architecture | visual clarity",
    },
    about: {
      objectName: "developer",
      nameKey: "name",
      aliasKey: "alias",
      stackKey: "stack",
      stackLines: [
        ["Next.js", "TypeScript", "Node.js"],
        ["Java", "C#", "AWS", "LLMs"],
      ],
      specialtiesKey: "specialties",
      specialtyLines: [
        ["SaaS", "CRM", "Landing Pages"],
        ["UI/UX", "Automation", "AppSec", "AI"],
      ],
      educationKey: "education",
      educationValue: "Computer Science",
      postGradKey: "postGrad",
      postGradValue: "AI Architecture & Engineering",
      freelanceKey: "freelance",
      availableKey: "available",
      approachKey: "approach",
      approachValue: "clarity over noise",
    },
    contact: {
      objectName: "projectRequest",
      nameKey: "name",
      emailKey: "email",
      whatsappKey: "whatsapp",
      scopeKey: "scope",
      scopeLabel: "Project scope",
    },
  },
} as const;

function formatCodeKey(label: string, width = 18) {
  return `  ${label}:`.padEnd(width, " ");
}

function getProjectBadgeMeta(label: string) {
  return PROJECT_BADGE_META[label] ?? { icon: "generic" };
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

function InstagramIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4.5" y="4.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16.8" cy="7.2" r="0.8" fill="currentColor" />
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
  const [typedHeroFocus, setTypedHeroFocus] = useState<string>("SaaS + CRM + Landing Pages");
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

  const copy = COPY[locale];
  const codeCopy = CODE_COPY[locale];
  const activeProject = PROJECTS[projectIndex];
  const heroFocusRotations = HERO_FOCUS_ROTATIONS[locale];
  const activeHeroFocus = heroFocusRotations[heroFocusIndex];
  const badgeLabels = PROJECT_BADGE_LABELS[locale];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

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
    const id = window.setInterval(() => {
      rotateScreens();
    }, 5000);

    return () => {
      window.clearInterval(id);
    };
  }, [projectIndex]);

  useEffect(() => {
    const railViewport = projectRailViewportRef.current;
    if (!railViewport) return;

    const activeCard = railViewport.querySelector<HTMLElement>(`[data-project-card-index="${projectIndex}"]`);
    activeCard?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
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
    const whatsapp = formatInternationalPhone(countryCode, formValues.whatsapp);
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

    if (!/^\+\d{1,4}$/.test(countryCode) || getInternationalPhoneDigits(countryCode, formValues.whatsapp).length < 8) {
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
  const projectSequence = String(projectIndex + 1).padStart(2, "0");
  const totalProjects = String(PROJECTS.length).padStart(2, "0");
  const screenshotSequence = String(screenshotIndex + 1).padStart(2, "0");
  const screenshotTotal = String(activeProject.screenshots.length).padStart(2, "0");

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
                      Transformo ideias em produtos digitais completos, do backend ao
                      deploy. Sou <strong>Desenvolvedor FullStack</strong> especializado em
                      soluções web integradas, com foco em SaaS, CRMs e automações que
                      funcionam no dia a dia do seu negócio.
                    </>
                  ) : (
                    <>
                      I turn ideas into complete digital products, from backend to
                      deployment. I am a <strong>FullStack Developer</strong> specialized in
                      integrated web solutions, focused on SaaS, CRM workflows and
                      automations that support day-to-day business operations.
                    </>
                  )}
                </p>
                <div className={styles.aboutDivider} />
                <p className={styles.sectionText}>
                  {locale === "pt" ? (
                    <>
                      <strong>Cientista da Computação</strong>, pós-graduado em{" "}
                      <strong>Arquitetura e Engenharia de IA</strong>, aplicando essa base
                      para entregar sistemas mais inteligentes, seguros e escaláveis.
                    </>
                  ) : (
                    <>
                      <strong>Computer Science graduate</strong>, with postgraduate work in{" "}
                      <strong>AI Architecture and Engineering</strong>, applying that
                      background to deliver systems that are more intelligent, secure and
                      scalable.
                    </>
                  )}
                </p>

                <div className={styles.aboutFacts}>
                  <div className={styles.aboutFact}>
                    <span>{locale === "pt" ? "Foco" : "Focus"}</span>
                    <strong>{locale === "pt" ? "SaaS, CRM & Automação" : "SaaS, CRM & Automation"}</strong>
                  </div>
                  <div className={styles.aboutFact}>
                    <span>{locale === "pt" ? "Entrega" : "Delivery"}</span>
                    <strong>{locale === "pt" ? "Design, código e deploy" : "Design, code and deploy"}</strong>
                  </div>
                  <div className={styles.aboutFact}>
                    <span>{locale === "pt" ? "Base" : "Foundation"}</span>
                    <strong>{locale === "pt" ? "Arquitetura + Engenharia de IA" : "Architecture + AI Engineering"}</strong>
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
                      {formatCodeKey(codeCopy.about.postGradKey)}
                      <span className={styles.editorStringQuote}>{'"'}</span>
                      <span className={styles.editorString}>{codeCopy.about.postGradValue}</span>
                      <span className={styles.editorStringQuote}>{'"'}</span>
                      <span className={styles.editorPunctuation}>,</span>
                    </div>
                    <div>&nbsp;</div>
                    <div>
                      {formatCodeKey(codeCopy.about.freelanceKey)}
                      <span className={styles.editorBoolean}>true</span>
                      <span className={styles.editorPunctuation}>,</span>
                    </div>
                    <div>
                      {formatCodeKey(codeCopy.about.availableKey)}
                      <span className={styles.editorBoolean}>true</span>
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
                        <span className={styles.projectRailIndex}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className={styles.projectRailName}>{project.name}</span>
                        <span className={styles.projectRailType}>{project.title[locale]}</span>
                      </button>
                    ))}
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
                  <div className={styles.projectMediaHeader}>
                    <span className={styles.projectMediaLabel}>{copy.projectsLabel}</span>
                    <span className={styles.projectMediaCount}>
                      {projectSequence} / {totalProjects}
                    </span>
                  </div>

                  <div className={styles.projectFrame}>
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

                  <div className={styles.projectFrameFooter}>
                    <div className={styles.projectScreenshotDots} aria-hidden="true">
                      {activeProject.screenshots.map((shot, index) => (
                        <span
                          key={`${shot}-dot`}
                          className={styles.projectScreenshotDot}
                          data-active={index === screenshotIndex}
                        />
                      ))}
                    </div>
                    <span className={styles.projectScreenshotCount}>
                      {screenshotSequence} / {screenshotTotal}
                    </span>
                  </div>
                </div>

                <div className={styles.projectAside}>
                  <div className={styles.projectMetaRow}>
                    <div className={styles.projectLead}>
                      <span className={styles.projectSpotlightIndex}>{projectSequence}</span>
                      <p className={styles.projectName}>{activeProject.name}</p>
                      <p className={styles.projectType}>{activeProject.title[locale]}</p>
                    </div>

                    <div className={styles.projectSummary}>
                      <p className={styles.projectSummaryTitle}>{copy.projectSummary}</p>
                      <p className={styles.projectSummaryText}>
                        {activeProject.description[locale]}
                      </p>
                    </div>
                  </div>

                  <div className={styles.projectUtilities}>
                    <div className={styles.projectBadgeGroups}>
                      <div className={styles.projectBadgeRow} aria-label={copy.projectTechLabel}>
                        {activeProject.technologies.map((badge) => (
                          <ProjectBadge
                            key={`${activeProject.name}-tech-${badge}`}
                            badge={badge}
                            label={badgeLabels[badge] ?? badge}
                          />
                        ))}
                      </div>

                      <div className={styles.projectBadgeRow} aria-label={copy.projectSystemsLabel}>
                        {activeProject.systems.map((badge) => (
                          <ProjectBadge
                            key={`${activeProject.name}-system-${badge}`}
                            badge={badge}
                            label={badgeLabels[badge] ?? badge}
                          />
                        ))}
                      </div>
                    </div>

                    {activeProject.locked ? (
                      <button
                        type="button"
                        className={`${styles.projectVisit} ${styles.projectVisitLocked}`}
                        disabled
                      >
                        <span>{copy.projectUnavailable}</span>
                        <ExternalIcon />
                      </button>
                    ) : (
                      <a
                        href={activeProject.url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.projectVisit}
                        aria-label={`${copy.openProjectAria} ${activeProject.name}`}
                      >
                        <span>{copy.projectVisit}</span>
                        <ExternalIcon />
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
                      <label className={styles.codeFieldRow}>
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
                      <label className={styles.codeFieldRow}>
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
                      <div className={styles.codeFieldRow}>
                        <span className={styles.codeLabel}>
                          {formatCodeKey(codeCopy.contact.whatsappKey)}
                        </span>
                        <span className={styles.editorStringQuote}>{'"'}</span>
                        <div className={styles.countryCodePicker}>
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
                          required
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
                    <div className={styles.contactButtons}>
                      <button
                        type="submit"
                        className={`${styles.submitButton} ${styles.themeFade}`}
                        disabled={contactState === "loading"}
                        aria-busy={contactState === "loading"}
                      >
                        <span className={styles.submitTerminal}>
                          <span className={styles.submitPrompt} aria-hidden="true">
                            $
                          </span>
                          <span className={styles.submitCommand}>{copy.submitCommand}</span>
                        </span>
                        <span className={styles.submitMeta}>{copy.submitCaption}</span>
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
                      <span>(11) 9 7829-0118</span>
                    </a>
                  </div>
                </div>

                <div>
                  <p className={styles.footerHeading}>{copy.footerSocials}</p>
                  <div className={styles.footerRule} />
                  <div className={styles.footerSocials}>
                    <a
                      href="https://www.instagram.com/jv.sntxs"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.footerSocialLink}
                      aria-label="Instagram"
                    >
                      <InstagramIcon />
                    </a>
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
