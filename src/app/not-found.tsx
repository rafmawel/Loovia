import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold gradient-text mb-4">404</p>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Page introuvable
        </h1>
        <p className="text-text-secondary mb-8">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-accent rounded-xl hover:bg-accent-light transition-colors"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
