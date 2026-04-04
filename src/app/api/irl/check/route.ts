// API Route — vérifier les baux éligibles à une révision IRL
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { computeIrlRevision } from '@/lib/irl';
import type { Lease } from '@/types';

interface IrlIndex {
  quarter: string;
  year: number;
  value: number;
}

interface RevisionProposal {
  leaseId: string;
  propertyName: string;
  tenantName: string;
  currentRent: number;
  newRent: number;
  increase: number;
  increasePercent: number;
  oldIrl: IrlIndex;
  newIrl: IrlIndex;
  revisionDate: string;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer tous les baux actifs/signés avec IRL activé
    const { data: leases } = await supabase
      .from('leases')
      .select('*, property:properties(name), tenant:tenants(first_name, last_name)')
      .in('status', ['active', 'signed']);

    if (!leases || leases.length === 0) {
      return NextResponse.json({ proposals: [] });
    }

    // Récupérer tous les indices IRL
    const { data: indices } = await supabase
      .from('irl_indices')
      .select('*')
      .eq('region', 'metropole');

    if (!indices) {
      return NextResponse.json({ proposals: [] });
    }

    // Indexer les IRL pour lookup rapide
    const irlMap = new Map<string, number>();
    for (const idx of indices) {
      irlMap.set(`${idx.quarter}-${idx.year}`, idx.value);
    }

    const now = new Date();
    const proposals: RevisionProposal[] = [];

    for (const lease of leases as (Lease & { property?: { name: string }; tenant?: { first_name: string; last_name: string } })[]) {
      const data = lease.data as Record<string, unknown>;

      // Vérifier que l'IRL est activé
      if (!data.irl_enabled) continue;

      const irlQuarter = data.irl_quarter as string;
      const irlYear = data.irl_year as number;
      if (!irlQuarter || !irlYear) continue;

      // Date anniversaire du bail
      const startDate = new Date(lease.start_date);
      const anniversaryThisYear = new Date(startDate);
      anniversaryThisYear.setFullYear(now.getFullYear());

      // Première révision possible = 1 an après le début
      const firstPossibleRevision = new Date(startDate);
      firstPossibleRevision.setFullYear(startDate.getFullYear() + 1);
      if (now < firstPossibleRevision) continue;

      // Calculer le nombre d'années écoulées depuis le bail
      const yearsElapsed = now.getFullYear() - startDate.getFullYear()
        - (now < anniversaryThisYear ? 1 : 0);
      if (yearsElapsed < 1) continue;

      // L'ancien IRL = trimestre de référence, année de référence + (années écoulées - 1)
      // Le nouveau IRL = même trimestre, année de référence + années écoulées
      const oldYear = irlYear + yearsElapsed - 1;
      const newYear = irlYear + yearsElapsed;

      const oldIrlValue = irlMap.get(`${irlQuarter}-${oldYear}`);
      const newIrlValue = irlMap.get(`${irlQuarter}-${newYear}`);

      // On a besoin des deux indices pour calculer
      if (!oldIrlValue || !newIrlValue) continue;

      // Pas de révision si l'indice n'a pas bougé ou a baissé
      if (newIrlValue <= oldIrlValue) continue;

      const { newRent, increase, increasePercent } = computeIrlRevision(
        lease.monthly_rent,
        oldIrlValue,
        newIrlValue,
      );

      // Calculer la date de révision (anniversaire du bail cette année)
      const revisionDate = new Date(startDate);
      revisionDate.setFullYear(startDate.getFullYear() + yearsElapsed);

      proposals.push({
        leaseId: lease.id,
        propertyName: lease.property?.name || 'Bien inconnu',
        tenantName: lease.tenant
          ? `${lease.tenant.first_name} ${lease.tenant.last_name}`
          : 'Locataire inconnu',
        currentRent: lease.monthly_rent,
        newRent,
        increase,
        increasePercent,
        oldIrl: { quarter: irlQuarter, year: oldYear, value: oldIrlValue },
        newIrl: { quarter: irlQuarter, year: newYear, value: newIrlValue },
        revisionDate: revisionDate.toISOString().slice(0, 10),
      });
    }

    return NextResponse.json({ proposals });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Erreur vérification IRL:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
