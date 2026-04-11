// Ouvre la webview Powens pour connecter un compte bancaire
// Redirige l'utilisateur vers la page de connexion Powens dans une popup

export default function openPowensConnect(connectUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      connectUrl,
      'powens_connect',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`,
    );

    if (!popup) {
      resolve(false);
      return;
    }

    // Vérifier périodiquement si la popup est fermée
    const interval = setInterval(() => {
      if (popup.closed) {
        clearInterval(interval);
        resolve(true);
      }
    }, 500);
  });
}
