// API Route — callback après connexion Powens (ferme la popup)
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const connectionId = request.nextUrl.searchParams.get('connection_id');
  const state = request.nextUrl.searchParams.get('state');

  // Page HTML simple qui ferme la popup et notifie la page parent
  const html = `
    <!DOCTYPE html>
    <html>
      <head><title>Connexion bancaire</title></head>
      <body>
        <p>Connexion ${state === 'success' ? 'réussie' : 'terminée'}. Fermeture en cours...</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'powens_callback',
              connectionId: '${connectionId || ''}',
              state: '${state || ''}'
            }, '*');
          }
          window.close();
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
