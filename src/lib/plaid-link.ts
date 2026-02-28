// Chargement dynamique de Plaid Link côté client
// Charge le script Plaid Link et initialise la modale

type PlaidMetadata = Record<string, unknown>;
type OnSuccessCallback = (publicToken: string, metadata: PlaidMetadata) => void;

interface PlaidHandler {
  open: () => void;
  destroy: () => void;
}

interface PlaidGlobal {
  create: (config: {
    token: string;
    onSuccess: (publicToken: string, metadata: PlaidMetadata) => void;
    onExit: (err: unknown) => void;
  }) => PlaidHandler;
}

declare global {
  interface Window {
    Plaid?: PlaidGlobal;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default async function loadPlaidLink(
  linkToken: string,
  onSuccess: OnSuccessCallback,
): Promise<void> {
  await loadScript('https://cdn.plaid.com/link/v2/stable/link-initialize.js');

  return new Promise((resolve, reject) => {
    if (!window.Plaid) {
      reject(new Error('Plaid Link non chargé'));
      return;
    }

    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: (publicToken, metadata) => {
        onSuccess(publicToken, metadata);
        resolve();
      },
      onExit: (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      },
    });

    handler.open();
  });
}
