"use client";

import Image from "next/image";
import { FormEvent, startTransition, useEffect, useEffectEvent, useRef, useState } from "react";
import styles from "./portfolio.module.css";

type Theme = "light" | "dark";
type Locale = "pt" | "en";
type ContactState = "idle" | "loading" | "success" | "error";

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
const WHATSAPP_MESSAGE =
  "Olá, João. Quero solicitar um orçamento de serviço para um projeto.";

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
    projectSummary: "Resumo do projeto",
    commit: "COMMIT",
    divider: "OU",
    whatsapp: "ORCE PELO WHATSAPP",
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
    footerContact: "Contato",
    footerSocials: "Redes Sociais",
    footerSignature: "Portifólio criado por",
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
    projectSummary: "Project overview",
    commit: "COMMIT",
    divider: "OR",
    whatsapp: "QUOTE VIA WHATSAPP",
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
    footerContact: "Contact",
    footerSocials: "Social",
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

function clampIndex(value: number, max: number) {
  return Math.min(Math.max(value, 0), max);
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
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 9v8M7 6.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Zm4 10.8v-4.2a2 2 0 0 1 4 0V17m-4-5.2V9m0 2.8A3.5 3.5 0 0 1 14.2 10c2.2 0 3.8 1.6 3.8 4.5V17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  const [contactState, setContactState] = useState<ContactState>("idle");
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    whatsapp: "",
    scope: "",
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const wheelLockRef = useRef(false);

  const copy = COPY[locale];
  const activeProject = PROJECTS[projectIndex];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("portfolio-locale", locale);
  }, [locale]);

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

          const id = entry.target.getAttribute("id");
          if (id && SECTION_IDS.includes(id as (typeof SECTION_IDS)[number])) {
            setActiveSection(id as (typeof SECTION_IDS)[number]);
          }

          entry.target
            .querySelectorAll<HTMLElement>("[data-reveal]")
            .forEach((node) => node.classList.add(styles.revealVisible));
        });
      },
      {
        root,
        threshold: 0.52,
      },
    );

    sections.forEach((section) => observer.observe(section));

    const onWheel = (event: WheelEvent) => {
      if (window.innerWidth < 1024) return;
      if (wheelLockRef.current) {
        event.preventDefault();
        return;
      }

      if (Math.abs(event.deltaY) < 24) return;
      if ((event.target as HTMLElement | null)?.closest("textarea")) return;

      const currentIndex = sections.findIndex((section) => {
        const distance = Math.abs(section.offsetTop - root.scrollTop);
        return distance < window.innerHeight * 0.35;
      });

      const safeIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex = clampIndex(
        safeIndex + (event.deltaY > 0 ? 1 : -1),
        sections.length - 1,
      );

      if (nextIndex === safeIndex) return;

      event.preventDefault();
      wheelLockRef.current = true;
      sections[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "start" });

      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 920);
    };

    root.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      observer.disconnect();
      root.removeEventListener("wheel", onWheel);
    };
  }, []);

  function scrollToSection(id: string) {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContactState("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      if (!response.ok) {
        setContactState("error");
        return;
      }

      setContactState("success");
      setFormValues({
        name: "",
        email: "",
        whatsapp: "",
        scope: "",
      });
    } catch {
      setContactState("error");
    }
  }

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE,
  )}`;

  return (
    <div className={styles.portfolio} data-theme={theme}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button
            type="button"
            className={styles.brand}
            onClick={() => scrollToSection("hero")}
          >
            {"</DevChell>"}
          </button>

          <nav className={styles.nav} aria-label="Seções">
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
              onClick={() => setLocale((current) => (current === "pt" ? "en" : "pt"))}
              aria-label="Alternar idioma"
            >
              <GlobeIcon />
            </button>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.themeFade}`}
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
              aria-label="Alternar tema"
            >
              <SunMoonIcon theme={theme} />
            </button>
          </div>
        </div>
      </header>

      <main ref={scrollRef} className={styles.scrollRoot}>
        <section id="hero" data-section className={`${styles.section} ${styles.hero}`}>
          <div className={`${styles.sectionInner} ${styles.heroInner}`}>
            <div className={styles.heroShell}>
              <div
                className={`${styles.heroLine} ${styles.reveal} ${styles.revealVisible}`}
                data-reveal
              />
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
              <p
                className={`${styles.heroMeta} ${styles.reveal} ${styles.revealVisible}`}
                data-reveal
              >
                {copy.heroMeta}
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
              <button
                type="button"
                className={styles.heroScrollButton}
                onClick={() => scrollToSection("sobre")}
                aria-label="Ir para a próxima seção"
              >
                <DownArrowIcon />
              </button>
            </div>
          </div>
        </section>

        <section id="sobre" data-section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.aboutGrid}>
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
                  <pre className={styles.editorCode}>
                    <div>
                      <span className={styles.editorKeyword}>const</span>
                      {" developer = {"}
                    </div>
                    <div>
                      {'    name:        '}
                      <span className={styles.editorString}>{'"João Vitor Rodrigues"'}</span>,
                    </div>
                    <div>
                      {'    alias:       '}
                      <span className={styles.editorString}>{'"Chell"'}</span>,
                    </div>
                    <div>&nbsp;</div>
                    <div>{"    stack: ["}</div>
                    <div>
                      {'      '}
                      <span className={styles.editorString}>{'"Next.JS"'}</span>,{" "}
                      <span className={styles.editorString}>{'"TypeScript"'}</span>,{" "}
                      <span className={styles.editorString}>{'"Node.JS"'}</span>,
                    </div>
                    <div>
                      {'      '}
                      <span className={styles.editorString}>{'"Java"'}</span>,{" "}
                      <span className={styles.editorString}>{'"C#"'}</span>,{" "}
                      <span className={styles.editorString}>{'"AWS"'}</span>,{" "}
                      <span className={styles.editorString}>{'"LLMs"'}</span>
                    </div>
                    <div>{"    ],"}</div>
                    <div>&nbsp;</div>
                    <div>{"    especialidades: ["}</div>
                    <div>
                      {'      '}
                      <span className={styles.editorString}>{'"SaaS"'}</span>,{" "}
                      <span className={styles.editorString}>{'"CRM"'}</span>,{" "}
                      <span className={styles.editorString}>{'"Landing Page"'}</span>,
                    </div>
                    <div>
                      {'      '}
                      <span className={styles.editorString}>{'"UI/UX"'}</span>,{" "}
                      <span className={styles.editorString}>{'"Automação"'}</span>,{" "}
                      <span className={styles.editorString}>{'"AppSec"'}</span>,{" "}
                      <span className={styles.editorString}>{'"AI"'}</span>
                    </div>
                    <div>{"    ],"}</div>
                    <div>&nbsp;</div>
                    <div>
                      {'    formacao:    '}
                      <span className={styles.editorString}>{'"Ciência da Computação"'}</span>,
                    </div>
                    <div>
                      {'    posGrad:     '}
                      <span className={styles.editorString}>
                        {'"Arquitetura & Engenharia de IA"'}
                      </span>
                      ,
                    </div>
                    <div>&nbsp;</div>
                    <div>
                      {"    freelance:   "}
                      <span className={styles.editorNote}>true</span>,
                    </div>
                    <div>
                      {"    disponivel:  "}
                      <span className={styles.editorNote}>true</span>,
                    </div>
                    <div>{"}"}</div>
                  </pre>
                </div>
              </div>

              <div className={`${styles.aboutContent} ${styles.reveal}`} data-reveal>
                <p className={styles.sectionKicker}>{copy.aboutLabel}</p>
                <h2 className={styles.sectionTitle}>
                  <strong>{copy.aboutTitleStrong}</strong>
                  <span>{copy.aboutTitleSoft}</span>
                </h2>
                <p className={styles.sectionText}>
                  {locale === "pt" ? (
                    <>
                      Transformo ideias em produtos digitais completos, do backend ao
                      deploy. Sou <strong>Desenvolvedor FullStack</strong> especializado
                      em soluções web integradas, com foco em SaaS, CRMs e automações que
                      funcionam no dia a dia do seu negócio.
                    </>
                  ) : (
                    <>
                      I turn ideas into complete digital products, from backend to
                      deployment. I am a <strong>FullStack Developer</strong> specialized
                      in integrated web solutions, focused on SaaS, CRM workflows and
                      automations that support day-to-day business operations.
                    </>
                  )}
                </p>
                <div className={styles.aboutDivider} />
                <p className={styles.sectionText}>
                  {locale === "pt" ? (
                    <>
                      <strong>Cientista da Computação</strong>, pós-graduado em{" "}
                      <strong>Arquitetura e Engenharia de IA</strong> aplicando essa base
                      para entregar sistemas mais inteligentes, seguros e escaláveis.
                    </>
                  ) : (
                    <>
                      <strong>Computer Science graduate</strong>, with postgraduate work
                      in <strong>AI Architecture and Engineering</strong>, applying that
                      background to deliver systems that are more intelligent, secure and
                      scalable.
                    </>
                  )}
                </p>
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
            </div>

            <div className={`${styles.projectCard} ${styles.reveal}`} data-reveal>
              <div className={styles.projectFrame}>
                <a
                  href={activeProject.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.projectLinkOverlay}
                  aria-label={`Abrir projeto ${activeProject.name}`}
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
                      alt={`${activeProject.name} screenshot ${index + 1}`}
                      fill
                      sizes="(max-width: 1040px) 100vw, 964px"
                    />
                  </div>
                ))}
              </div>

              <div className={`${styles.projectBase} ${styles.themeFade}`}>
                <button
                  type="button"
                  className={`${styles.carouselArrow} ${styles.carouselPrev} ${styles.themeFade}`}
                  onClick={() => navigateProject("prev")}
                  aria-label="Projeto anterior"
                >
                  <ArrowIcon direction="left" />
                </button>

                <button
                  type="button"
                  className={`${styles.carouselArrow} ${styles.carouselNext} ${styles.themeFade}`}
                  onClick={() => navigateProject("next")}
                  aria-label="Próximo projeto"
                >
                  <ArrowIcon />
                </button>

                <div className={styles.projectLead}>
                  <p className={styles.projectName}>{activeProject.name}</p>
                  <p className={styles.projectType}>{activeProject.type[locale]}</p>
                </div>

                <div className={styles.projectStacks}>
                  {activeProject.stacks.map((stack) => (
                    <Image
                      key={stack}
                      className={styles.stackIcon}
                      src={STACK_ICON_MAP[stack]}
                      alt={stack}
                      width={29}
                      height={29}
                    />
                  ))}
                </div>

                <div className={styles.projectRule} />

                <div className={styles.projectSummary}>
                  <p className={styles.projectSummaryTitle}>{copy.projectSummary}</p>
                  <p className={styles.projectSummaryText}>
                    {activeProject.description[locale]}
                  </p>
                </div>

                <a
                  href={activeProject.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.externalLink}
                  aria-label={`Abrir ${activeProject.name}`}
                >
                  <ExternalIcon />
                </a>
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
            <div className={`${styles.contactWrap} ${styles.reveal}`} data-reveal>
              <div className={`${styles.editorShell} ${styles.contactEditorShell}`}>
                <div className={styles.editorTopbar}>
                  <span className={styles.editorDot} data-tone="red" />
                  <span className={styles.editorDot} data-tone="yellow" />
                  <span className={styles.editorDot} data-tone="green" />
                </div>

                <form className={styles.contactForm} onSubmit={handleSubmit}>
                  <div className={styles.contactCodeGrid}>
                    <div className={styles.contactCodeBlock}>
                      <div>
                        <span className={styles.editorKeyword}>const</span>
                        {" projectRequest = {"}
                      </div>
                      <div>
                        {'  name:      '}
                        <span className={styles.editorString}>{'"'}</span>
                        <span className={styles.editorPlaceholder}>
                          {copy.placeholders.name}
                        </span>
                        <span className={styles.editorString}>{'"'}</span>,
                      </div>
                      <div>
                        {'  email:     '}
                        <span className={styles.editorString}>{'"'}</span>
                        <span className={styles.editorPlaceholder}>
                          {copy.placeholders.email}
                        </span>
                        <span className={styles.editorString}>{'"'}</span>,
                      </div>
                      <div>
                        {'  whatsapp:  '}
                        <span className={styles.editorString}>{'"'}</span>
                        <span className={styles.editorPlaceholder}>
                          {copy.placeholders.whatsapp}
                        </span>
                        <span className={styles.editorString}>{'"'}</span>,
                      </div>
                      <div>{'  scope:     '}{'"'}</div>
                      <div className={styles.scopeSpacer} />
                      <div>{'"'}</div>
                      <div>{"};"}</div>
                    </div>

                    <div className={styles.fieldStack}>
                      <label className={styles.fieldCard}>
                        <span className={styles.srOnly}>{copy.placeholders.name}</span>
                        <input
                          name="name"
                          value={formValues.name}
                          onChange={(event) =>
                            setFormValues((current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                          placeholder={copy.placeholders.name}
                          autoComplete="name"
                        />
                      </label>

                      <label className={styles.fieldCard}>
                        <span className={styles.srOnly}>{copy.placeholders.email}</span>
                        <input
                          name="email"
                          type="email"
                          value={formValues.email}
                          onChange={(event) =>
                            setFormValues((current) => ({
                              ...current,
                              email: event.target.value,
                            }))
                          }
                          placeholder={copy.placeholders.email}
                          autoComplete="email"
                        />
                      </label>

                      <label className={styles.fieldCard}>
                        <span className={styles.srOnly}>{copy.placeholders.whatsapp}</span>
                        <input
                          name="whatsapp"
                          value={formValues.whatsapp}
                          onChange={(event) =>
                            setFormValues((current) => ({
                              ...current,
                              whatsapp: event.target.value,
                            }))
                          }
                          placeholder={copy.placeholders.whatsapp}
                          autoComplete="tel"
                        />
                      </label>

                      <label className={styles.fieldCard}>
                        <span className={styles.srOnly}>Escopo do projeto</span>
                        <textarea
                          name="scope"
                          value={formValues.scope}
                          onChange={(event) =>
                            setFormValues((current) => ({
                              ...current,
                              scope: event.target.value,
                            }))
                          }
                          placeholder={copy.placeholders.scope}
                        />
                      </label>
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button
                      type="submit"
                      className={`${styles.submitButton} ${styles.themeFade}`}
                    >
                      {copy.commit}
                    </button>
                  </div>
                </form>
              </div>

              <div className={styles.formDivider}>{copy.divider}</div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className={`${styles.whatsappButton} ${styles.themeFade}`}
              >
                {copy.whatsapp}
              </a>

              <p className={styles.statusMessage}>{formatStatus(locale, contactState)}</p>
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
                      href={`mailto:${CONTACT_EMAIL}`}
                      className={styles.footerSocialLink}
                      aria-label="E-mail"
                    >
                      <MailIcon />
                    </a>
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
                {copy.footerSignature} <span>{"</DevChell>"}</span>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
