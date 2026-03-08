'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

interface Props {
  propertyId: string;
}

export default function AddTenantToPropertyButton({ propertyId }: Props) {
  return (
    <Link
      href={`/baux?property_id=${propertyId}`}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-terracotta hover:text-terracotta/80 transition-colors"
    >
      <Plus className="h-3.5 w-3.5" />
      Ajouter un locataire et créer le bail
    </Link>
  );
}
