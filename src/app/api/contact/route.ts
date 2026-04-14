const CONTACT_EMAIL = "rodriguessnts@outlook.com";
const FORMSUBMIT_AJAX_URL = `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_EMAIL)}`;
const MAX_FIELD_LENGTH = 1200;

type Locale = "pt" | "en";

type ContactPayload = {
  name?: string;
  email?: string;
  whatsapp?: string;
  scope?: string;
  locale?: Locale;
  website?: string;
};

type FormSubmitResponse = {
  success?: boolean | string;
  message?: string;
};

function getLocale(value: unknown): Locale {
  return value === "en" ? "en" : "pt";
}

function sanitize(value: unknown, maxLength = MAX_FIELD_LENGTH) {
  if (typeof value !== "string") return "";

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function responseMessage(locale: Locale, key: "invalid" | "spam" | "inactive" | "provider" | "success") {
  const messages = {
    pt: {
      invalid: "Revise os dados do formulário antes de enviar.",
      spam: "Envio bloqueado pela proteção anti-spam.",
      inactive:
        "O FormSubmit ainda precisa ser ativado no e-mail rodriguessnts@outlook.com. Abra o e-mail 'Activate Form' e clique no link de ativação.",
      provider:
        "Não consegui concluir o envio agora. Se o e-mail já foi ativado, tente novamente em instantes ou use o WhatsApp.",
      success: "Solicitação enviada. Vou responder pelo e-mail informado.",
    },
    en: {
      invalid: "Please review the form fields before sending.",
      spam: "Submission blocked by anti-spam protection.",
      inactive:
        "FormSubmit still needs to be activated in the rodriguessnts@outlook.com inbox. Open the 'Activate Form' email and click the activation link.",
      provider:
        "I could not complete the submission right now. If the email has already been activated, try again shortly or use WhatsApp.",
      success: "Request sent. I will reply to your email shortly.",
    },
  } as const;

  return messages[locale][key];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;
    const locale = getLocale(body.locale);
    const name = sanitize(body.name, 120);
    const email = sanitize(body.email, 180).toLowerCase();
    const whatsapp = sanitize(body.whatsapp, 40);
    const scope = sanitize(body.scope);
    const website = sanitize(body.website, 120);

    if (website) {
      return Response.json({ message: responseMessage(locale, "spam") }, { status: 400 });
    }

    if (name.length < 2 || !isValidEmail(email) || whatsapp.replace(/\D/g, "").length < 10 || scope.length < 12) {
      return Response.json({ message: responseMessage(locale, "invalid") }, { status: 400 });
    }

    const response = await fetch(FORMSUBMIT_AJAX_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Origin: "https://devchell.vercel.app",
        Referer: "https://devchell.vercel.app/",
      },
      body: JSON.stringify({
        name,
        email,
        whatsapp,
        scope,
        _subject: `Novo pedido de orçamento - ${name}`,
        _template: "table",
        _replyto: email,
        _blacklist: "bitcoin,casino,viagra,poker,loan,seo agency,guest post,backlink",
        _honey: "",
      }),
    });

    const contentType = response.headers.get("content-type") ?? "";
    const formSubmitResult = contentType.includes("application/json")
      ? ((await response.json()) as FormSubmitResponse)
      : ({ message: await response.text() } satisfies FormSubmitResponse);
    const providerMessage = String(formSubmitResult.message ?? "");
    const providerSuccess = formSubmitResult.success === true || formSubmitResult.success === "true";

    if (!response.ok || !providerSuccess) {
      const looksInactive =
        providerMessage.toLowerCase().includes("activate form") ||
        providerMessage.toLowerCase().includes("check your email") ||
        providerMessage.toLowerCase().includes("needs activation");

      return Response.json(
        {
          message: looksInactive
            ? responseMessage(locale, "inactive")
            : responseMessage(locale, "provider"),
        },
        { status: looksInactive ? 409 : 502 },
      );
    }

    return Response.json({ message: responseMessage(locale, "success") });
  } catch {
    return Response.json(
      {
        message:
          "Não consegui concluir o envio agora. Tente novamente em instantes ou use o WhatsApp.",
      },
      { status: 500 },
    );
  }
}
