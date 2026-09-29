// Envio de SMS/WhatsApp ao cliente via Twilio.
// Se TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_FROM não estiverem
// definidos, a função retorna silenciosamente — nunca bloqueia um registo.

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM; // e.g. "+14155238886" ou "whatsapp:+14155238886"

export interface SmsPayload {
  to: string; // número do cliente, formato E.164 ex: +244912345678
  body: string;
}

export async function sendSms(payload: SmsPayload): Promise<void> {
  if (!accountSid || !authToken || !fromNumber || !payload.to) return;

  // Normaliza o número: remove espaços e garante o + inicial
  const toNumber = payload.to.replace(/\s+/g, "").replace(/^00/, "+");
  if (!toNumber.startsWith("+")) return; // número inválido — ignora silenciosamente

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const body = new URLSearchParams({
      From: fromNumber,
      To: toNumber,
      Body: payload.body,
    });
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Twilio SMS erro:", err);
    }
  } catch (err) {
    // Nunca deixar falha de SMS bloquear o registo do contacto.
    console.error("Falha ao enviar SMS:", err);
  }
}
