'use client';

// Bannière publicitaire pour les utilisateurs gratuits
import { useSubscription } from '@/contexts/SubscriptionContext';
import { X } from 'lucide-react';
import { useState } from 'react';

interface AdBannerProps {
  className?: string;
}

export default function AdBanner({ className = '' }: AdBannerProps) {
  const { isPro } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  if (isPro || dismissed) return null;

  return (
    <div
      className={`relative rounded-xl border border-stone-200 bg-stone-50 p-4 text-center ${className}`}
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-stone-400 hover:text-stone-600"
        aria-label="Fermer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {/* Emplacement publicitaire — à remplacer par le réseau pub (Google AdSense, etc.) */}
      <div className="flex items-center justify-center h-[90px] text-xs text-stone-400">
        <p>Espace publicitaire</p>
      </div>
      <p className="text-[10px] text-stone-400 mt-1">
        Passez au Pro pour supprimer les publicités
      </p>
    </div>
  );
}
