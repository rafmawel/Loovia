// Client API Firma.dev — signature électronique des baux

const FIRMA_API_URL =
  process.env.FIRMA_API_URL || 'https://api.firma.dev/functions/v1/signing-request-api';
const FIRMA_API_KEY = process.env.FIRMA_API_KEY || '';

// ── Types ────────────────────────────────────────────────────────────

export interface FirmaRecipient {
  email: string;
  firstname: string;
  lastname: string;
  designation: string; // "Bailleur" | "Locataire"
  order: number;       // 1 = bailleur d'abord, 2 = locataire, 3+ = co-locataires
}

export interface FirmaCreateRequest {
  name: string;
  description?: string;
  document: string;          // Base64 du PDF
  expiration_hours?: number; // défaut 168 (7 jours)
  recipients: FirmaRecipient[];
  callback_url?: string;
  metadata?: Record<string, string>;
}

export interface FirmaRecipientStatus {
  email: string;
  firstname: string;
  lastname: string;
  designation: string;
  order: number;
  status: 'pending' | 'signed' | 'declined';
  signed_at?: string;
}

export interface FirmaSigningResponse {
  request_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired' | 'declined';
  recipients?: FirmaRecipientStatus[];
  signing_url?: string;
  document_url?: string;
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

// ── Créer une demande de signature ───────────────────────────────────

export async function createSigningRequest(
  data: FirmaCreateRequest,
): Promise<FirmaSigningResponse> {
  return firmaFetch<FirmaSigningResponse>('', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      document: data.document,
      expiration_hours: data.expiration_hours ?? 168,
      recipients: data.recipients,
      callback_url: data.callback_url,
      metadata: data.metadata,
    }),
  });
}

// ── Récupérer le statut d'une demande ────────────────────────────────

export async function getSigningStatus(
  requestId: string,
): Promise<FirmaSigningResponse> {
  return firmaFetch<FirmaSigningResponse>(`/${requestId}`, {
    method: 'GET',
  });
}
