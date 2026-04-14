import { NextResponse } from "next/server";

const CONTACT_EMAIL = "rodriguessnts@outlook.com";

type ContactPayload = {
  name?: string;
  email?: string;
  whatsapp?: string;
  scope?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const whatsapp = body.whatsapp?.trim() ?? "";
    const scope = body.scope?.trim() ?? "";

    if (!name || name.length < 2) {
      return NextResponse.json(
        { message: "Informe um nome valido." },
        { status: 400 },
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { message: "Informe um e-mail valido." },
        { status: 400 },
      );
    }

    if (!scope || scope.length < 12) {
      return NextResponse.json(
        { message: "Descreva o escopo com um pouco mais de detalhe." },
        { status: 400 },
      );
    }

    const payload = new URLSearchParams({
      name,
      email,
      whatsapp,
      scope,
      _subject: `Novo pedido de orcamento - ${name}`,
      _template: "table",
      _captcha: "false",
    });

    const response = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_EMAIL)}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload.toString(),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            "Nao foi possivel enviar agora. Tente pelo WhatsApp ou tente novamente em instantes.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      message: "Pedido enviado. Vou responder pelo e-mail informado.",
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "Algo deu errado no envio. Use o WhatsApp enquanto eu ajusto isso.",
      },
      { status: 500 },
    );
  }
}
