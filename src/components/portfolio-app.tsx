"use client";

import Image from "next/image";
import { FormEvent, startTransition, useEffect, useEffectEvent, useRef, useState } from "react";
import styles from "./portfolio.module.css";

type Theme = "light" | "dark";
type Locale = "pt" | "en";
type ContactState = "idle" | "loading" | "success" | "error";
type HeroTypingPhase = "typing" | "holding" | "deleting";

type Project = {
  name: string;
  url: string;
  type: Record<Locale, string>;
  description: Record<Locale, string>;
  stacks: string[];
  screenshots: string[];
};

const SECTION_IDS = ["hero", "sobre", "projetos", "contato"] as const;
const CONTACT_EMAIL = "rodriguessnts@outlook.com";
const WHATSAPP_NUMBER = "5511978290118";
const WHATSAPP_MESSAGE = {
  pt: "Olá, João. Quero solicitar um orçamento de serviço para um projeto.",
  en: "Hi João, I would like to request a quote for a project.",
} as const;

const STACK_ICON_MAP: Record<string, string> = {
  "Next.js": "/stacks/nextjs.svg",
  TypeScript: "/stacks/typescript.svg",
  Vercel: "/stacks/vercel.svg",
  CRM: "/stacks/crm.svg",
  Automation: "/stacks/automation.svg",
  SEO: "/stacks/seo.svg",
  "Lead Flow": "/stacks/leadflow.svg",
  UX: "/stacks/ux.svg",
};

const STACK_LABELS: Record<Locale, Record<string, string>> = {
  pt: {
    "Next.js": "Next.js",
    TypeScript: "TypeScript",
    Vercel: "Vercel",
    CRM: "CRM",
    Automation: "Automação",
    SEO: "SEO",
    "Lead Flow": "Fluxo de leads",
    UX: "UX",
  },
  en: {
    "Next.js": "Next.js",
    TypeScript: "TypeScript",
    Vercel: "Vercel",
    CRM: "CRM",
    Automation: "Automation",
    SEO: "SEO",
    "Lead Flow": "Lead Flow",
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
    projectVisit: "Visitar projeto",
    contactLabel: "CONTATO",
    contactTitleStrong: "Briefing em código,",
    contactTitleSoft: "execução sem ruído.",
    contactDescription:
      "Descreva objetivo, contexto e escopo como se estivesse abrindo uma issue bem escrita. Eu organizo o resto.",
    commit: "COMMIT",
    whatsapp: "Conversar no WhatsApp",
    statusIdle: "Preencha o formulário e eu retorno pelo e-mail informado.",
    statusLoading: "Enviando sua solicitação...",
    statusSuccess: "Solicitação enviada. Vou responder pelo e-mail informado.",
    statusError: "Não foi possível enviar agora. Use o WhatsApp e eu sigo por lá.",
    placeholders: {
      name: "Seu nome",
      email: "seu@email.com",
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
    projectVisit: "Visit project",
    contactLabel: "CONTACT",
    contactTitleStrong: "Code-like brief,",
    contactTitleSoft: "clean execution.",
    contactDescription:
      "Describe the goal, context, and scope as if you were opening a well-written issue. I will structure the rest.",
    commit: "COMMIT",
    whatsapp: "Talk on WhatsApp",
    statusIdle: "Fill out the form and I will reply to the email you provide.",
    statusLoading: "Sending your request...",
    statusSuccess: "Request sent. I will reply to your email shortly.",
    statusError: "The request could not be sent right now. Use WhatsApp and I will continue there.",
    placeholders: {
      name: "Your name",
      email: "your@email.com",
      whatsapp: "(11) 9 9999-9999",
      scope:
        "Tell me the goal, timeline, deliverables, integrations and any references that matter.",
    },
    navAria: "Sections",
    toggleLocaleAria: "Switch language",
    toggleThemeAria: "Switch theme",
    heroScrollAria: "Go to the next section",
    previousProjectAria: "Previous project",
    nextProjectAria: "Next project",
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
    url: "https://vetta-devchells-projects.vercel.app",
    type: {
      pt: "Landing Page",
      en: "Landing Page",
    },
    description: {
      pt: "Projeto de Landing Page com tema diferente, para venda de infoproduto de Marketing Digital.",
      en: "Landing page project with a distinct visual theme, built to sell a digital marketing infoproduct.",
    },
    stacks: ["Next.js", "TypeScript", "Vercel"],
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
    url: "https://ultrarubber.com.br",
    type: {
      pt: "Landing Page & CRM",
      en: "Landing Page & CRM",
    },
    description: {
      pt: "Landing Page & CRM para captação comercial com posicionamento industrial, automação e fluxo de leads estruturado.",
      en: "Landing Page & CRM built for commercial lead capture, industrial positioning, automation and structured lead flow.",
    },
    stacks: ["CRM", "Automation", "SEO"],
    screenshots: [
      "/projects/ultrarubber/ultrarubber-01.png",
      "/projects/ultrarubber/ultrarubber-02.png",
      "/projects/ultrarubber/ultrarubber-03.png",
      "/projects/ultrarubber/ultrarubber-04.png",
      "/projects/ultrarubber/ultrarubber-05.png",
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

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatStatus(locale: Locale, state: ContactState) {
  const messages = COPY[locale];

  if (state === "loading") return messages.statusLoading;
  if (state === "success") return messages.statusSuccess;
  if (state === "error") return messages.statusError;
  return messages.statusIdle;
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

export function PortfolioApp() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const savedTheme = window.localStorage.getItem("portfolio-theme");
    return savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";
  });
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "pt";
    const savedLocale = window.localStorage.getItem("portfolio-locale");
    return savedLocale === "en" || savedLocale === "pt" ? savedLocale : "pt";
  });
  const [activeSection, setActiveSection] =
    useState<(typeof SECTION_IDS)[number]>("hero");
  const [projectIndex, setProjectIndex] = useState(0);
  const [screenshotIndex, setScreenshotIndex] = useState(0);
  const [contactState, setContactState] = useState<ContactState>(() => {
    if (typeof window === "undefined") return "idle";
    return new URL(window.location.href).searchParams.get("contact") === "success"
      ? "success"
      : "idle";
  });
  const [statusOverride, setStatusOverride] = useState<string | null>(null);
  const [heroFocusIndex, setHeroFocusIndex] = useState(0);
  const [heroTypingPhase, setHeroTypingPhase] = useState<HeroTypingPhase>("holding");
  const [typedHeroFocus, setTypedHeroFocus] = useState<string>("SaaS + CRM + Landing Pages");
  const [formNextUrl] = useState(() => {
    if (typeof window === "undefined") return "";
    const currentUrl = new URL(window.location.href);
    return `${currentUrl.origin}${currentUrl.pathname}?contact=success#contato`;
  });
  const [formPageUrl] = useState(() => {
    if (typeof window === "undefined") return "";
    const currentUrl = new URL(window.location.href);
    return `${currentUrl.origin}${currentUrl.pathname}#contato`;
  });
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    whatsapp: "",
    scope: "",
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const copy = COPY[locale];
  const codeCopy = CODE_COPY[locale];
  const activeProject = PROJECTS[projectIndex];
  const heroFocusRotations = HERO_FOCUS_ROTATIONS[locale];
  const activeHeroFocus = heroFocusRotations[heroFocusIndex];
  const stackLabels = STACK_LABELS[locale];
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("portfolio-locale", locale);
  }, [locale]);

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const status = currentUrl.searchParams.get("contact");
    if (status === "success") {
      currentUrl.searchParams.delete("contact");
      window.history.replaceState({}, "", `${currentUrl.pathname}${currentUrl.hash || "#contato"}`);
    }
  }, []);

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
    }, 3000);

    return () => {
      window.clearInterval(id);
    };
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
    setLocale((current) => {
      const next = current === "pt" ? "en" : "pt";
      setHeroFocusIndex(0);
      setTypedHeroFocus(HERO_FOCUS_ROTATIONS[next][0]);
      setHeroTypingPhase("holding");
      return next;
    });
  }

  function navigateProject(direction: "next" | "prev") {
    startTransition(() => {
      setProjectIndex((current) => {
        const next =
          direction === "next"
            ? (current + 1) % PROJECTS.length
            : (current - 1 + PROJECTS.length) % PROJECTS.length;

        setScreenshotIndex(0);
        return next;
      });
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const name = formValues.name.trim();
    const email = formValues.email.trim();
    const whatsapp = formValues.whatsapp.trim();
    const scope = formValues.scope.trim();

    if (name.length < 2) {
      event.preventDefault();
      setContactState("error");
      setStatusOverride(
        locale === "pt"
          ? "Informe seu nome completo para continuar."
          : "Please enter your full name before sending.",
      );
      return;
    }

    if (!isValidEmail(email)) {
      event.preventDefault();
      setContactState("error");
      setStatusOverride(
        locale === "pt"
          ? "Informe um e-mail válido para que eu possa responder."
          : "Please enter a valid email so I can reply.",
      );
      return;
    }

    if (whatsapp.replace(/\D/g, "").length < 10) {
      event.preventDefault();
      setContactState("error");
      setStatusOverride(
        locale === "pt"
          ? "Informe um WhatsApp válido com DDD."
          : "Please enter a valid WhatsApp number including area code.",
      );
      return;
    }

    if (scope.length < 12) {
      event.preventDefault();
      setContactState("error");
      setStatusOverride(
        locale === "pt"
          ? "Descreva o escopo com um pouco mais de detalhe antes de enviar."
          : "Please add a bit more detail about the project scope before sending.",
      );
      return;
    }

    setStatusOverride(
      locale === "pt"
        ? "Validando anti-spam e enviando sua solicitação..."
        : "Running anti-spam verification and sending your request...",
    );
    setContactState("loading");
  }

  function updateFormValue(field: keyof typeof formValues, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));

    if (contactState !== "idle") {
      setContactState("idle");
    }

    if (statusOverride) {
      setStatusOverride(null);
    }
  }

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE[locale],
  )}`;

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
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
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
                      <span className={styles.editorStringQuote}>{'"'}</span>
                      <span className={`${styles.editorString} ${styles.heroFocusValue}`}>
                        {typedHeroFocus}
                      </span>
                      <span className={styles.codeCursor} aria-hidden="true" />
                      <span className={styles.editorStringQuote}>{'"'}</span>
                      <span className={styles.editorPunctuation}>,</span>
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

            <div className={`${styles.projectCard} ${styles.reveal}`} data-reveal>
              <div className={styles.projectFrame}>
                <button
                  type="button"
                  className={`${styles.carouselArrow} ${styles.carouselPrev} ${styles.themeFade}`}
                  onClick={() => navigateProject("prev")}
                  aria-label={copy.previousProjectAria}
                >
                  <ArrowIcon direction="left" />
                </button>

                <button
                  type="button"
                  className={`${styles.carouselArrow} ${styles.carouselNext} ${styles.themeFade}`}
                  onClick={() => navigateProject("next")}
                  aria-label={copy.nextProjectAria}
                >
                  <ArrowIcon />
                </button>

                <a
                  href={activeProject.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.projectLinkOverlay}
                  aria-label={`${copy.openProjectAria} ${activeProject.name}`}
                />

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
                      sizes="(max-width: 1040px) 100vw, 964px"
                    />
                  </div>
                ))}
              </div>

              <div
                key={`${activeProject.name}-${locale}`}
                className={`${styles.projectBase} ${styles.themeFade}`}
              >
                <div className={styles.projectMetaRow}>
                  <div className={styles.projectLead}>
                    <p className={styles.projectName}>{activeProject.name}</p>
                    <p className={styles.projectType}>{activeProject.type[locale]}</p>
                  </div>

                  <div className={styles.projectUtilities}>
                    <div className={styles.projectStacks}>
                      {activeProject.stacks.map((stack) => (
                        <span key={stack} className={styles.stackBadge}>
                          <Image
                            className={styles.stackIcon}
                            src={STACK_ICON_MAP[stack]}
                            alt={stack}
                            width={18}
                            height={18}
                          />
                          <span>{stackLabels[stack] ?? stack}</span>
                        </span>
                      ))}
                    </div>

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
                  </div>
                </div>

                <div className={styles.projectRule} />

                <div className={styles.projectSummary}>
                  <p className={styles.projectSummaryTitle}>{copy.projectSummary}</p>
                  <p className={styles.projectSummaryText}>
                    {activeProject.description[locale]}
                  </p>
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
                  action={`https://formsubmit.co/${CONTACT_EMAIL}`}
                  method="POST"
                  onSubmit={handleSubmit}
                >
                  <input type="hidden" name="_subject" value="Novo pedido de orçamento - DevChell" />
                  <input type="hidden" name="_template" value="table" />
                  <input type="hidden" name="_next" value={formNextUrl} />
                  <input type="hidden" name="_url" value={formPageUrl} />
                  <input type="hidden" name="_replyto" value={formValues.email} />
                  <input
                    type="hidden"
                    name="_autoresponse"
                    value={
                      locale === "pt"
                        ? "Recebi sua solicitação e retorno em breve com os próximos passos."
                        : "I received your request and will get back to you soon with the next steps."
                    }
                  />
                  <input
                    type="hidden"
                    name="_blacklist"
                    value="bitcoin,casino,viagra,poker,loan,seo agency,guest post,backlink"
                  />
                  <input
                    type="text"
                    name="_honey"
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
                      <label className={styles.codeFieldRow}>
                        <span className={styles.codeLabel}>
                          {formatCodeKey(codeCopy.contact.whatsappKey)}
                        </span>
                        <span className={styles.editorStringQuote}>{'"'}</span>
                        <input
                          name="whatsapp"
                          value={formValues.whatsapp}
                          onChange={(event) => updateFormValue("whatsapp", event.target.value)}
                          placeholder={copy.placeholders.whatsapp}
                          autoComplete="tel"
                          inputMode="tel"
                          required
                          className={styles.codeInlineInput}
                        />
                        <span className={styles.editorStringQuote}>{'"'}</span>
                        <span className={styles.editorPunctuation}>,</span>
                      </label>
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
                        />
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
                      >
                        {copy.commit}
                      </button>

                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className={`${styles.whatsappButton} ${styles.themeFade}`}
                      >
                        {copy.whatsapp}
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
                      href="https://www.instagram.com/devchell"
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
                      href="https://www.linkedin.com/in/devchell/"
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
