// Client API Plaid — connexion bancaire et synchronisation

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || '';
const PLAID_SECRET = process.env.PLAID_SECRET || '';
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

const PLAID_BASE_URL =
  PLAID_ENV === 'production'
    ? 'https://production.plaid.com'
    : PLAID_ENV === 'development'
      ? 'https://development.plaid.com'
      : 'https://sandbox.plaid.com';

// Requête générique Plaid
async function plaidRequest<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${PLAID_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      ...body,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Plaid API: ${response.status} - ${error}`);
  }

  return response.json();
}

// Créer un link token pour l'interface Plaid Link
export async function createLinkToken(userId: string): Promise<{ link_token: string }> {
  return plaidRequest('/link/token/create', {
    user: { client_user_id: userId },
    client_name: 'Loovia',
    products: ['transactions'],
    country_codes: ['FR'],
    language: 'fr',
  });
}

// Échanger un public token contre un access token
export async function exchangePublicToken(publicToken: string): Promise<{
  access_token: string;
  item_id: string;
}> {
  return plaidRequest('/item/public_token/exchange', {
    public_token: publicToken,
  });
}

// Synchroniser les transactions
export async function syncTransactions(
  accessToken: string,
  cursor?: string
): Promise<{
  added: PlaidTransaction[];
  modified: PlaidTransaction[];
  removed: { transaction_id: string }[];
  next_cursor: string;
  has_more: boolean;
}> {
  return plaidRequest('/transactions/sync', {
    access_token: accessToken,
    cursor: cursor || undefined,
  });
}

// Type pour une transaction Plaid
export interface PlaidTransaction {
  transaction_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name?: string;
  category?: string[];
  pending: boolean;
  counterparties?: {
    name: string;
    entity_id?: string;
  }[];
}
