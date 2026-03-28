// Client API Firma.dev — signature électronique des baux

const FIRMA_API_URL =
  process.env.FIRMA_API_URL || 'https://api.firma.dev/functions/v1/signing-request-api';
const FIRMA_API_KEY = process.env.FIRMA_API_KEY || '';

// ── Types ────────────────────────────────────────────────────────────

export interface FirmaRecipient {
  id: string;          // ID temporaire (temp_1, temp_2, etc.)
  email: string;
  first_name: string;
  last_name: string;
  designation: string; // "Signer" | "CC" | "Approver"
  order: number;
}

export interface FirmaCreateRequest {
  name: string;
  document: string;          // Base64 du PDF
  expiration_hours?: number; // défaut 168 (7 jours)
  recipients: FirmaRecipient[];
  metadata?: Record<string, string>;
}

export interface FirmaField {
  type: 'signature' | 'date' | 'text';
  position: { x: number; y: number; width: number; height: number };
  page_number: number;
  recipient_id: string;
  required: boolean;
}

export interface FirmaRecipientStatus {
  email: string;
  first_name: string;
  last_name: string;
  designation: string;
  order: number;
  status: 'pending' | 'signed' | 'declined';
  signed_at?: string;
}

export interface FirmaStatusObject {
  sent?: boolean;
  finished?: boolean;
  cancelled?: boolean;
  declined?: boolean;
  expired?: boolean;
}

export interface FirmaSigningResponse {
  id: string;
  status: string | FirmaStatusObject;
  recipients?: FirmaRecipientStatus[];
  signing_url?: string;
  document_url?: string;
}

/**
 * Normalise le champ `status` de Firma : si c'est un objet {sent, finished, …},
 * retourne la clé active sous forme de string. Si c'est déjà une string, la retourne telle quelle.
 */
export function parseFirmaStatus(status: string | FirmaStatusObject): string {
  if (typeof status === 'string') return status;
  if (status && typeof status === 'object') {
    if (status.finished) return 'finished';
    if (status.cancelled) return 'cancelled';
    if (status.declined) return 'declined';
    if (status.expired) return 'expired';
    if (status.sent) return 'sent';
  }
  return 'unknown';
}

// ── Helpers ──────────────────────────────────────────────────────────

async function firmaFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = path.startsWith('http') ? path : `${FIRMA_API_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${FIRMA_API_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firma API ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

// ── Créer et envoyer une demande de signature (endpoint atomique) ────

export async function createAndSendSigningRequest(
  data: FirmaCreateRequest,
  fields: FirmaField[],
): Promise<FirmaSigningResponse> {
  return firmaFetch<FirmaSigningResponse>('/signing-requests/create-and-send', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      document: data.document,
      expiration_hours: data.expiration_hours ?? 168,
      recipients: data.recipients,
      fields,
      metadata: data.metadata,
    }),
  });
}

// ── Récupérer le statut d'une demande ────────────────────────────────

export async function getSigningStatus(
  requestId: string,
): Promise<FirmaSigningResponse> {
  return firmaFetch<FirmaSigningResponse>(`/signing-requests/${requestId}`, {
    method: 'GET',
  });
}
