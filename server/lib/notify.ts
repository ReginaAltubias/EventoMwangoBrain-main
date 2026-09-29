import { Resend } from "resend";

// Notificação por e-mail à equipa quando um novo contacto é registado
// (pelo QR Code público ou pela app interna). Enquanto RESEND_API_KEY e
// NOTIFY_EMAIL_TO não estiverem definidos, esta função não faz nada —
// não bloqueia nem falha o registo do contacto.
const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const teamEmail = process.env.NOTIFY_EMAIL_TO;
const fromEmail = process.env.NOTIFY_EMAIL_FROM ?? "onboarding@resend.dev";

export interface NewContactNotification {
  fullName: string;
  company: string;
  source: string;
  solutions: string[];
  whatsapp?: string;
  email?: string;
}

export async function notifyNewContact(data: NewContactNotification): Promise<void> {
  if (!resend || !teamEmail) return;
  try {
    await resend.emails.send({
      from: fromEmail,
      to: teamEmail,
      subject: `Novo contacto: ${data.fullName} · ${data.company}`,
      html: `
        <p><strong>${data.fullName}</strong> · ${data.company}</p>
        <p>Origem: ${data.source}</p>
        <p>Soluções de interesse: ${data.solutions.join(", ") || "—"}</p>
        ${data.whatsapp ? `<p>WhatsApp: ${data.whatsapp}</p>` : ""}
        ${data.email ? `<p>E-mail: ${data.email}</p>` : ""}
      `,
    });
  } catch (err) {
    // Nunca deixar uma falha no envio de e-mail rebentar o registo do contacto.
    console.error("Falha ao enviar notificação por e-mail:", err);
  }
}
