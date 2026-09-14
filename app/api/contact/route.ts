import { Resend } from "resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactRequestBody = {
  name: string;
  email: string;
  msg: string;
};

function jsonError(error: string, status: number) {
  return Response.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  let body: Partial<ContactRequestBody>;
  try {
    body = await request.json();
  } catch {
    return jsonError("Cuerpo de la solicitud inválido.", 400);
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const msg = body.msg?.trim();

  if (!name || !email || !msg) {
    return jsonError("Nombre, correo y mensaje son obligatorios.", 400);
  }

  if (!EMAIL_REGEX.test(email)) {
    return jsonError("El correo electrónico no es válido.", 400);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "mariobs@gmail.com",
      subject: `Nuevo mensaje de contacto de ${name}`,
      text: `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${msg}`,
    });

    if (error) {
      return jsonError("No se pudo enviar el mensaje. Intenta de nuevo.", 500);
    }

    return Response.json({ ok: true });
  } catch {
    return jsonError("No se pudo enviar el mensaje. Intenta de nuevo.", 500);
  }
}
