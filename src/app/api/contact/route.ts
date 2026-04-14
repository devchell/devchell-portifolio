export async function POST(request: Request) {
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const isPtBr = acceptLanguage.toLowerCase().includes("pt");
  const message = isPtBr
    ? "Este endpoint nao e mais usado pelo formulario em producao. O envio agora acontece diretamente pelo FormSubmit para manter o reCAPTCHA e a protecao anti-spam ativos."
    : "This endpoint is no longer used by the production form. Submission now goes directly through FormSubmit so reCAPTCHA and anti-spam protection stay active.";

  return Response.json({ message }, { status: 410 });
}
