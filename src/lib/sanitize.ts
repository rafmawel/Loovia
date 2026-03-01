// Utilitaires de sanitisation des entrées utilisateur

/** Échappe les caractères HTML dangereux */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/** Sanitise une chaîne de texte (trim + escape HTML) */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return '';
  return escapeHtml(input.trim());
}

/** Retourne un message d'erreur sûr pour la production (pas de stack trace) */
export function safeErrorMessage(err: unknown): string {
  if (process.env.NODE_ENV === 'development' && err instanceof Error) {
    return err.message;
  }
  return 'Erreur interne du serveur';
}
