// Client API Firma.dev — signature électronique des baux

const FIRMA_API_URL = process.env.FIRMA_API_URL || 'https://api.firma.dev/functions/v1/signing-request-api';
const FIRMA_API_KEY = process.env.FIRMA_API_KEY || '';

interface FirmaSigningRequest {
  documentUrl: string;
  signers: {
    name: string;
    email: string;
    role: 'landlord' | 'tenant';
  }[];
  callbackUrl: string;
  metadata?: Record<string, string>;
}

interface FirmaResponse {
  id: string;
  status: string;
  signingUrl?: string;
}

// Créer une demande de signature
export async function createSigningRequest(data: FirmaSigningRequest): Promise<FirmaResponse> {
  const response = await fetch(FIRMA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRMA_API_KEY}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Firma API: ${response.status} - ${error}`);
  }

  return response.json();
}

// Récupérer le statut d'une demande de signature
export async function getSigningStatus(requestId: string): Promise<FirmaResponse> {
  const response = await fetch(`${FIRMA_API_URL}/${requestId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${FIRMA_API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Firma API: ${response.status} - ${error}`);
  }

  return response.json();
}
