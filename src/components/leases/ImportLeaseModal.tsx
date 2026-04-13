'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { Property, Tenant } from '@/types';

interface ImportLeaseModalProps {
  properties: Property[];
  tenants: Tenant[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportLeaseModal({ properties, tenants, onClose, onSuccess }: ImportLeaseModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [propertyId, setPropertyId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [chargesAmount, setChargesAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'active' | 'signed'>('active');

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!propertyId || !tenantId || !monthlyRent || !startDate) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase.from('leases').insert({
        user_id: user.id,
        property_id: propertyId,
        tenant_id: tenantId,
        monthly_rent: parseFloat(monthlyRent),
        charges_amount: parseFloat(chargesAmount || '0'),
        start_date: startDate,
        end_date: endDate || null,
        status,
        data: { imported: true },
        signature_landlord_status: 'not_required',
        signature_tenant_status: 'not_required',
      });

      if (error) throw error;
      toast.success('Bail importé avec succès');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'import');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-bg-elevated rounded-2xl border border-border-light w-full max-w-lg max-h-[90vh] overflow-y-auto glow-accent">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Importer un bail existant</h2>
            <p className="text-sm text-text-secondary mt-1">
              Pour les biens déjà en cours de location
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-text-muted hover:bg-bg-card transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleImport} className="p-6 space-y-4">
          {/* Bien */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Bien *</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm border border-border-light rounded-xl bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              <option value="">Sélectionner un bien</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.address}</option>
              ))}
            </select>
          </div>

          {/* Locataire */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Locataire *</label>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm border border-border-light rounded-xl bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              <option value="">Sélectionner un locataire</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
              ))}
            </select>
          </div>

          {/* Loyer et charges */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Loyer mensuel (€) *"
              type="number"
              step="0.01"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
              placeholder="850"
              required
            />
            <Input
              label="Charges (€)"
              type="number"
              step="0.01"
              value={chargesAmount}
              onChange={(e) => setChargesAmount(e.target.value)}
              placeholder="50"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date de début *"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Date de fin"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Statut du bail</label>
            <div className="flex gap-3">
              {([
                { value: 'active', label: 'Actif (en cours)' },
                { value: 'signed', label: 'Signé' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    status === opt.value
                      ? 'bg-accent/10 text-accent border border-accent/30'
                      : 'bg-bg-card text-text-secondary border border-border-light hover:border-accent/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={<Upload className="h-4 w-4" />}
              className="w-full"
            >
              Importer le bail
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
