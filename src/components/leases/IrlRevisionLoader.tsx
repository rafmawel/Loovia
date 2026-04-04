'use client';

// Loader client qui fetch les propositions IRL et affiche le composant si éligible
import { useEffect, useState } from 'react';
import IrlRevisionCard from './IrlRevisionCard';

interface Proposal {
  leaseId: string;
  propertyName: string;
  tenantName: string;
  currentRent: number;
  newRent: number;
  increase: number;
  increasePercent: number;
  oldIrl: { quarter: string; year: number; value: number };
  newIrl: { quarter: string; year: number; value: number };
  revisionDate: string;
}

interface IrlRevisionLoaderProps {
  leaseId: string;
}

export default function IrlRevisionLoader({ leaseId }: IrlRevisionLoaderProps) {
  const [proposal, setProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch('/api/irl/check');
        if (!res.ok) return;
        const data = await res.json();
        const match = (data.proposals || []).find((p: Proposal) => p.leaseId === leaseId);
        if (match) setProposal(match);
      } catch {
        // Silencieux
      }
    }
    check();
  }, [leaseId]);

  if (!proposal) return null;

  return (
    <IrlRevisionCard
      leaseId={proposal.leaseId}
      currentRent={proposal.currentRent}
      newRent={proposal.newRent}
      increase={proposal.increase}
      increasePercent={proposal.increasePercent}
      oldIrl={proposal.oldIrl}
      newIrl={proposal.newIrl}
      revisionDate={proposal.revisionDate}
    />
  );
}
