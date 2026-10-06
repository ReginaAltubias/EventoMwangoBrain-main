import { Resend } from "resend";

// ─── Configuração ──────────────────────────────────────────────────────────
// Enquanto RESEND_API_KEY e NOTIFY_EMAIL_TO não estiverem definidos, as
// notificações à equipa são ignoradas silenciosamente.
// Para e-mails ao cliente, RESEND_API_KEY e NOTIFY_EMAIL_FROM são suficientes.
const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const teamEmail = process.env.NOTIFY_EMAIL_TO;
const fromEmail = process.env.NOTIFY_EMAIL_FROM ?? "onboarding@resend.dev";

// ─── Tipos ─────────────────────────────────────────────────────────────────
export interface NewContactNotification {
  fullName: string;
  company: string;
  source: string;
  solutions: string[];
  whatsapp?: string;
  email?: string;
  notes?: string;
}

// ─── Notificação interna à equipa ──────────────────────────────────────────
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
        ${data.notes ? `<p>Observação: ${data.notes}</p>` : ""}
      `,
    });
  } catch (err) {
    console.error("Falha ao enviar notificação por e-mail à equipa:", err);
  }
}

// ─── E-mail de confirmação ao cliente ─────────────────────────────────────
export interface ClientConfirmationData {
  fullName: string;
  email: string;
  solutions: string[];
  wantsDemo: boolean;
}

export async function notifyClient(data: ClientConfirmationData): Promise<void> {
  if (!resend || !data.email) return;
  try {
    await resend.emails.send({
      from: fromEmail,
      to: data.email,
      subject: "Obrigado por visitar a Mwango Brain 🧠",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#111">
          <h2 style="color:#6c2bd9">Olá, ${data.fullName}!</h2>
          <p>Obrigado por passar pelo nosso stand no <strong>Eventos MwangoBrain 2026</strong>.</p>
          <p>Registámos o seu interesse em: <strong>${data.solutions.join(", ")}</strong>.</p>
          ${data.wantsDemo
            ? "<p>A nossa equipa irá contactá-lo(a) brevemente para agendar uma apresentação ou demonstração.</p>"
            : "<p>A nossa equipa entrará em contacto consigo em breve.</p>"
          }
          <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>
          <p style="font-size:12px;color:#6b7280">
            Mwango Brain · Creative &amp; Technology Agency<br/>
            <a href="https://mwangobrain.com" style="color:#6c2bd9">mwangobrain.com</a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Falha ao enviar e-mail de confirmação ao cliente:", err);
  }
}
