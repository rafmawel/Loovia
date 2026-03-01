// Page 404 personnalisée
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-terracotta mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Page introuvable
        </h1>
        <p className="text-stone-500 mb-8">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-terracotta rounded-xl hover:bg-terracotta-dark transition-colors"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
