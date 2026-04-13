'use client';

// Modal vidéo publicitaire de 30 secondes — affichée avant certaines actions (quittance, signature bail)
import { useState, useEffect, useCallback } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import Button from '@/components/ui/Button';

interface AdVideoProps {
  /** Appelé quand la pub est terminée ou skippée (Pro) */
  onComplete: () => void;
  /** Appelé si l'utilisateur ferme sans attendre */
  onCancel: () => void;
}

export default function AdVideo({ onComplete, onCancel }: AdVideoProps) {
  const { isPro } = useSubscription();
  const [secondsLeft, setSecondsLeft] = useState(30);

  const handleComplete = useCallback(onComplete, [onComplete]);

  // Les utilisateurs Pro passent directement
  useEffect(() => {
    if (isPro) {
      handleComplete();
    }
  }, [isPro, handleComplete]);

  // Compte à rebours
  useEffect(() => {
    if (isPro) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPro]);

  if (isPro) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-bg-elevated rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Zone vidéo — à remplacer par le player pub réel */}
        <div className="aspect-video bg-stone-900 flex items-center justify-center">
          <div className="text-center text-text-muted">
            <p className="text-sm">Espace vidéo publicitaire</p>
            <p className="text-xs mt-1">30 secondes</p>
          </div>
        </div>

        <div className="p-4 flex items-center justify-between">
          <p className="text-xs text-text-secondary">
            {secondsLeft > 0
              ? `Vous pourrez continuer dans ${secondsLeft}s`
              : 'Vous pouvez continuer'}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleComplete}
              disabled={secondsLeft > 0}
            >
              Continuer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
