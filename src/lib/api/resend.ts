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

// Envoyer un rappel de loyer impayé
export async function sendRentReminder(
  tenantEmail: string,
  tenantFirstName: string,
  tenantFullName: string,
  amount: string,
  dueDate: string,
  propertyAddress: string,
  landlordName: string,
): Promise<ResendResponse> {
  return sendEmail({
    to: tenantEmail,
    subject: `Rappel : Loyer impayé — ${propertyAddress}`,
    html: `
      <div style="font-family: 'Segoe UI', Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: #e2725b; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #ffffff; font-size: 18px; margin: 0;">Rappel de loyer</h1>
        </div>

        <div style="padding: 32px;">
          <!-- Salutation -->
          <p style="color: #0f172a; font-size: 15px; margin-bottom: 16px;">
            Bonjour <strong>${tenantFirstName}</strong>,
          </p>

          <!-- Corps -->
          <p style="color: #57534e; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
            Nous vous informons que le loyer de <strong style="color: #0f172a;">${amount}</strong>
            pour le bien situé au <strong style="color: #0f172a;">${propertyAddress}</strong>
            n'a pas été reçu à la date d'échéance.
          </p>

          <!-- Date en évidence -->
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; text-align: center;">
            <p style="color: #991b1b; font-size: 13px; margin: 0;">
              Date d'échéance : <strong style="font-size: 15px;">${dueDate}</strong>
            </p>
          </div>

          <p style="color: #57534e; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            Nous vous remercions de bien vouloir régulariser cette situation dans les meilleurs délais.
            Si le paiement a déjà été effectué, veuillez ignorer ce message.
          </p>

          <!-- Signature -->
          <p style="color: #57534e; font-size: 14px; margin-bottom: 4px;">
            Cordialement,
          </p>
          <p style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0;">
            ${landlordName}
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f7f5f3; padding: 16px 32px; border-radius: 0 0 12px 12px; border-top: 1px solid #e7e5e4;">
          <p style="color: #a8a29e; font-size: 11px; margin: 0; text-align: center;">
            Envoyé via <strong style="color: #e2725b;">Loovia</strong>
          </p>
        </div>
      </div>
    `,
  });
}
