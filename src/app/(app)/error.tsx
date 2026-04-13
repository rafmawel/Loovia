'use client';

import { useEffect } from 'react';
import Card from '@/components/ui/Card';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {}, [error]);

  return (
    <div className="flex items-center justify-center py-20">
      <Card>
        <div className="text-center max-w-md p-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-red-500/10 text-red-400 mb-4">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Une erreur est survenue
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Quelque chose s&apos;est mal passé. Veuillez réessayer.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-xl hover:bg-accent-light transition-colors"
          >
            Réessayer
          </button>
        </div>
      </Card>
    </div>
  );
}
