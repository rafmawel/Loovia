// Client API Powens (Budget Insight) — connexion bancaire et synchronisation

const POWENS_CLIENT_ID = process.env.POWENS_CLIENT_ID || '';
const POWENS_CLIENT_SECRET = process.env.POWENS_CLIENT_SECRET || '';
const POWENS_DOMAIN = process.env.POWENS_DOMAIN || '';

const POWENS_BASE_URL = `https://${POWENS_DOMAIN}/2.0`;

// Requête générique Powens
async function powensRequest<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: Record<string, unknown>;
    token?: string;
  } = {},
): Promise<T> {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${POWENS_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Powens API: ${response.status} - ${error}`);
  }

  return response.json();
}

// Authentifier l'application et obtenir un token permanent
export async function getAuthToken(): Promise<{ auth_token: string; id_user: number }> {
  const response = await fetch(`${POWENS_BASE_URL}/auth/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: POWENS_CLIENT_ID,
      client_secret: POWENS_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Powens auth: ${response.status} - ${error}`);
  }

  return response.json();
}

// Créer un utilisateur Powens permanent (lié à un user Loovia)
export async function createPowensUser(token: string): Promise<{ id: number; token: string }> {
  return powensRequest('/users', {
    method: 'POST',
    token,
  });
}

// Obtenir un code temporaire à partir du token permanent
export async function getTemporaryCode(token: string): Promise<string> {
  const data = await powensRequest<{ code: string }>('/auth/token/code', { token });
  return data.code;
}

// Obtenir l'URL de la webview de connexion bancaire
export function getConnectUrl(code: string): string {
  const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/api/powens/callback`);
  return `https://webview.powens.com/fr/connect?domain=${POWENS_DOMAIN}&client_id=${POWENS_CLIENT_ID}&redirect_uri=${redirectUri}&code=${code}`;
}

// Lister les connexions d'un utilisateur
export async function listConnections(token: string): Promise<PowensConnection[]> {
  const data = await powensRequest<{ connections: PowensConnection[] }>('/users/me/connections', {
    token,
  });
  return data.connections;
}

// Lister les comptes bancaires
export async function listAccounts(token: string): Promise<PowensAccount[]> {
  const data = await powensRequest<{ accounts: PowensAccount[] }>('/users/me/accounts', {
    token,
  });
  return data.accounts;
}

// Récupérer les transactions
export async function listTransactions(
  token: string,
  options?: { offset?: number; limit?: number; min_date?: string },
): Promise<{ transactions: PowensTransaction[]; total: number }> {
  const params = new URLSearchParams();
  if (options?.offset) params.set('offset', String(options.offset));
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.min_date) params.set('min_date', options.min_date);

  const query = params.toString() ? `?${params.toString()}` : '';
  return powensRequest(`/users/me/transactions${query}`, { token });
}

// Types Powens
export interface PowensConnection {
  id: number;
  id_connector: number;
  state: string;
  last_update: string | null;
  error: string | null;
  connector: {
    name: string;
  };
}

export interface PowensAccount {
  id: number;
  id_connection: number;
  name: string;
  balance: number;
  number: string;
  iban: string | null;
  type: string;
  currency: { id: string };
  last_update: string | null;
}

export interface PowensTransaction {
  id: number;
  id_account: number;
  date: string;
  rdate: string;
  value: number;
  original_wording: string;
  simplified_wording: string;
  type: string;
  category: { name: string } | null;
  state: string;
}
