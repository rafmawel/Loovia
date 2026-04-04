'use client';

// Alerte IRL sur le dashboard — affiche les baux éligibles à une révision
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface Proposal {
  leaseId: string;
  propertyName: string;
  tenantName: string;
  currentRent: number;
  newRent: number;
  increase: number;
  increasePercent: number;
}

export default function IrlAlert() {
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch('/api/irl/check');
        if (!res.ok) return;
        const data = await res.json();
        setProposals(data.proposals || []);
      } catch {
        // Silencieux en cas d'erreur
      }
    }
    check();
  }, []);

  if (proposals.length === 0) return null;

  const totalIncrease = proposals.reduce((s, p) => s + p.increase, 0);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="h-5 w-5 text-amber-600" />
        <h3 className="text-sm font-bold text-amber-900">
          {proposals.length === 1
            ? '1 bail éligible à une révision IRL'
            : `${proposals.length} baux éligibles à une révision IRL`}
        </h3>
        <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
          +{formatCurrency(totalIncrease)}/mois
        </span>
      </div>

      <div className="space-y-2">
        {proposals.map((p) => (
          <Link
            key={p.leaseId}
            href={`/baux/${p.leaseId}`}
            className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-100 hover:border-amber-300 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{p.propertyName}</p>
              <p className="text-xs text-stone-500">{p.tenantName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {formatCurrency(p.currentRent)} → {formatCurrency(p.newRent)}
              </p>
              <p className="text-xs text-amber-600">+{p.increasePercent}%</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
