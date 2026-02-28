'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MaintenancePriority } from '@/types';

const PRIORITIES: { value: MaintenancePriority; label: string }[] = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
  { value: 'urgent', label: 'Urgente' },
];

interface MaintenanceRequestModalProps {
  /** Pré-sélectionné si depuis la fiche bien */
  propertyId?: string;
  /** Auto-rempli depuis le locataire actif */
  tenantId?: string | null;
  /** Liste des biens pour le select (si propertyId n'est pas fourni) */
  properties?: { id: string; name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function MaintenanceRequestModal({
  propertyId,
  tenantId,
  properties,
  onClose,
  onSuccess,
}: MaintenanceRequestModalProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<MaintenancePriority>('medium');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddPhoto = () => {
    const url = photoUrl.trim();
    if (!url) return;
    setPhotos((prev) => [...prev, url]);
    setPhotoUrl('');
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalPropertyId = propertyId || selectedPropertyId;
    if (!finalPropertyId) {
      toast.error('Veuillez sélectionner un bien');
      return;
    }
    if (!title.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: finalPropertyId,
          tenant_id: tenantId || null,
          title: title.trim(),
          description: description.trim() || null,
          priority,
          photos,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Demande de travaux créée');
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
      <div className="relative bg-white rounded-2xl shadow-xl border border-stone-200/50 w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Nouvelle demande de travaux
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-slate-900 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bien (select si pas pré-sélectionné) */}
          {!propertyId && properties && (
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                Bien concerné
              </label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors"
                required
              >
                <option value="">Sélectionner un bien</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Fuite robinet cuisine"
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Description détaillée
              <span className="text-stone-400 font-normal ml-1">(optionnel)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème en détail..."
              rows={4}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors resize-none"
            />
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Priorité
            </label>
            <div className="flex items-center gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    priority === p.value
                      ? p.value === 'urgent'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : p.value === 'high'
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : p.value === 'medium'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                      : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photos (URLs) */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Photos
              <span className="text-stone-400 font-normal ml-1">(URLs)</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={handleAddPhoto}
              >
                Ajouter
              </Button>
            </div>
            {photos.length > 0 && (
              <div className="space-y-1.5">
                {photos.map((url, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 text-sm"
                  >
                    <span className="flex-1 truncate text-stone-600">{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              Créer la demande
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
