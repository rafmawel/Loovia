'use client';

// Carte de proposition de révision IRL — affichée sur la page bail
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { TrendingUp, Check, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface IrlRevisionCardProps {
  leaseId: string;
  currentRent: number;
  newRent: number;
  increase: number;
  increasePercent: number;
  oldIrl: { quarter: string; year: number; value: number };
  newIrl: { quarter: string; year: number; value: number };
  revisionDate: string;
}

export default function IrlRevisionCard({
  leaseId,
  currentRent,
  newRent,
  increase,
  increasePercent,
  oldIrl,
  newIrl,
  revisionDate,
}: IrlRevisionCardProps) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const router = useRouter();

  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await fetch('/api/irl/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaseId, newRent, oldIrl, newIrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setApplied(true);
      toast.success(`Loyer révisé : ${formatCurrency(currentRent)} → ${formatCurrency(newRent)}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la révision');
    } finally {
      setApplying(false);
    }
  };

  if (applied) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-emerald-600">
          <Check className="h-5 w-5" />
          <p className="text-sm font-medium">Révision IRL appliquée — nouveau loyer : {formatCurrency(newRent)}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-100 p-2 shrink-0">
          <TrendingUp className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Révision IRL disponible
          </h3>
          <p className="text-xs text-stone-500 mb-3">
            Date de révision : {new Date(revisionDate).toLocaleDateString('fr-FR')}
          </p>

          {/* Détail du calcul */}
          <div className="bg-stone-50 rounded-xl p-4 mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500">Ancien indice ({oldIrl.quarter} {oldIrl.year})</span>
              <span className="font-medium text-slate-900">{oldIrl.value}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500">Nouvel indice ({newIrl.quarter} {newIrl.year})</span>
              <span className="font-medium text-slate-900">{newIrl.value}</span>
            </div>
            <div className="border-t border-stone-200 pt-2 flex items-center justify-between text-xs">
              <span className="text-stone-500">Variation</span>
              <span className="font-medium text-amber-600">+{increasePercent}%</span>
            </div>

            <div className="border-t border-stone-200 pt-2 mt-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-stone-500">{formatCurrency(currentRent)}</span>
                <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
                <span className="font-bold text-emerald-600">{formatCurrency(newRent)}</span>
                <span className="text-xs text-amber-600">(+{formatCurrency(increase)}/mois)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleApply}
              loading={applying}
              icon={<Check className="h-4 w-4" />}
            >
              Appliquer la révision
            </Button>
            <p className="text-[10px] text-stone-400">
              Le loyer du bail et du bien seront mis à jour
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
