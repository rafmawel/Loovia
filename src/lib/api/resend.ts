// Client API Resend — envoi d'emails (quittances, rappels)

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_API_URL = 'https://api.resend.com/emails';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  attachments?: {
    filename: string;
    content: string; // Base64
    content_type?: string;
  }[];
}

interface ResendResponse {
  id: string;
}

// Envoyer un email via Resend
export async function sendEmail(options: EmailOptions): Promise<ResendResponse> {
  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: options.from || 'Loovia <noreply@loovia.fr>',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Resend API: ${response.status} - ${error}`);
  }

  return response.json();
}

// Envoyer une quittance par email
export async function sendReceiptEmail(
  tenantEmail: string,
  tenantName: string,
  period: string,
  pdfBase64: string
): Promise<ResendResponse> {
  return sendEmail({
    to: tenantEmail,
    subject: `Quittance de loyer — ${period}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f172a;">Bonjour ${tenantName},</h2>
        <p style="color: #78716c;">
          Veuillez trouver ci-joint votre quittance de loyer pour la période <strong>${period}</strong>.
        </p>
        <p style="color: #78716c;">
          Cordialement,<br/>
          <strong style="color: #e2725b;">Loovia</strong>
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `quittance_${period.replace(/\s/g, '_')}.pdf`,
        content: pdfBase64,
        content_type: 'application/pdf',
      },
    ],
  });
}

// Envoyer un rappel de loyer
export async function sendRentReminder(
  tenantEmail: string,
  tenantName: string,
  amount: string,
  dueDate: string
): Promise<ResendResponse> {
  return sendEmail({
    to: tenantEmail,
    subject: `Rappel — Loyer en attente`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f172a;">Bonjour ${tenantName},</h2>
        <p style="color: #78716c;">
          Nous vous rappelons que votre loyer de <strong>${amount}</strong> était attendu
          pour le <strong>${dueDate}</strong>.
        </p>
        <p style="color: #78716c;">
          Si le paiement a déjà été effectué, veuillez ignorer ce message.
        </p>
        <p style="color: #78716c;">
          Cordialement,<br/>
          <strong style="color: #e2725b;">Loovia</strong>
        </p>
      </div>
    `,
  });
}
