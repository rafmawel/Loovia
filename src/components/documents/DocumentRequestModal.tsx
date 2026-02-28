'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const DOCUMENT_TYPES = [
  "Pièce d'identité",
  '3 derniers bulletins de salaire',
  "Dernier avis d'imposition",
  'Justificatif de domicile',
  'Quittances du précédent bailleur',
  'Garantie (garant ou Visale)',
  'Autre',
] as const;

interface DocumentRequestModalProps {
  tenantId: string;
  tenantName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DocumentRequestModal({
  tenantId,
  tenantName,
  onClose,
  onSuccess,
}: DocumentRequestModalProps) {
  const [documentType, setDocumentType] = useState<string>(DOCUMENT_TYPES[0]);
  const [customType, setCustomType] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalType = documentType === 'Autre' ? customType.trim() : documentType;
    if (!finalType) {
      toast.error('Veuillez préciser le type de document');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          document_type: finalType,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Demande de document envoyée');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-stone-200/50 w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Demander un document
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">{tenantName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-slate-900 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type de document */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Type de document
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Champ personnalisé si "Autre" */}
          {documentType === 'Autre' && (
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                Précisez le document
              </label>
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Ex : Attestation d'assurance habitation"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors"
                required
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Notes / Instructions
              <span className="text-stone-400 font-normal ml-1">(optionnel)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions particulières pour le locataire..."
              rows={3}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
            >
              Envoyer la demande
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
