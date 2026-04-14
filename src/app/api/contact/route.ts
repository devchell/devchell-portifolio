const CONTACT_EMAIL = "rodriguessnts@outlook.com";
const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "DevChell Portfolio <onboarding@resend.dev>";
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

function getLocale(value: unknown): Locale {
  return value === "en" ? "en" : "pt";
}

function sanitizeSingleLine(value: unknown, maxLength = MAX_FIELD_LENGTH) {
  if (typeof value !== "string") return "";

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function sanitizeMultiline(value: unknown, maxLength = MAX_FIELD_LENGTH) {
  if (typeof value !== "string") return "";

  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().slice(0, maxLength + 1);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function responseMessage(locale: Locale, key: "invalid" | "tooLong" | "spam" | "missingConfig" | "provider" | "success") {
  const messages = {
    pt: {
      invalid: "Revise os dados do formulario antes de enviar.",
      tooLong: "O escopo passou do limite de caracteres. Reduza o texto antes de enviar.",
      spam: "Envio bloqueado pela protecao anti-spam.",
      missingConfig: "Envio ainda nao configurado. Defina a chave RESEND_API_KEY na Vercel.",
      provider: "Nao consegui concluir o envio agora. Tente novamente em instantes ou use o WhatsApp.",
      success: "Solicitacao enviada. Vou responder pelo e-mail informado.",
    },
    en: {
      invalid: "Please review the form fields before sending.",
      tooLong: "The project scope is over the character limit. Shorten it before sending.",
      spam: "Submission blocked by anti-spam protection.",
      missingConfig: "Email sending is not configured yet. Define RESEND_API_KEY on Vercel.",
      provider: "I could not complete the submission right now. Try again shortly or use WhatsApp.",
      success: "Request sent. I will reply to your email shortly.",
    },
  } as const;

  return messages[locale][key];
}

export async function POST(request: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const body = (await request.json()) as ContactPayload;
    const locale = getLocale(body.locale);
    const name = sanitizeSingleLine(body.name, 120);
    const email = sanitizeSingleLine(body.email, 180).toLowerCase();
    const whatsapp = sanitizeSingleLine(body.whatsapp, 40);
    const scope = sanitizeMultiline(body.scope);
    const website = sanitizeSingleLine(body.website, 120);

    if (website) {
      return Response.json({ message: responseMessage(locale, "spam") }, { status: 400 });
    }

    if (name.length < 2 || !isValidEmail(email) || whatsapp.replace(/\D/g, "").length < 10 || scope.length < 12) {
      return Response.json({ message: responseMessage(locale, "invalid") }, { status: 400 });
    }

    if (scope.length > MAX_FIELD_LENGTH) {
      return Response.json({ message: responseMessage(locale, "tooLong") }, { status: 413 });
    }

    if (!resendApiKey) {
      return Response.json({ message: responseMessage(locale, "missingConfig") }, { status: 500 });
    }

    const emailText = `*Nome:* ${name}
*Email:* ${email}
*WhatsApp:* ${whatsapp}

${scope}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #111111; line-height: 1.6;">
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>
        <div style="height: 1px; background: #dddddd; margin: 20px 0;"></div>
        <p style="white-space: pre-wrap;">${escapeHtml(scope)}</p>
      </div>
    `;

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [CONTACT_EMAIL],
        reply_to: email,
        subject: `Novo pedido de orcamento - ${name}`,
        text: emailText,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      return Response.json({ message: responseMessage(locale, "provider") }, { status: 502 });
    }

    return Response.json({ message: responseMessage(locale, "success") });
  } catch {
    return Response.json(
      {
        message: "Nao consegui concluir o envio agora. Tente novamente em instantes ou use o WhatsApp.",
      },
      { status: 500 },
    );
  }
}
