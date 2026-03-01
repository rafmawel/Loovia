'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import SignaturePad from './SignaturePad';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  FileText,
  Home,
  User,
} from 'lucide-react';
import type { Property, Tenant, EdlType } from '@/types';

// ── Types internes ─────────────────────────────────────────────────

type ElementState = 'neuf' | 'bon' | 'use' | 'mauvais' | 'na';

interface EdlElement {
  name: string;
  state: ElementState;
  observations: string;
}

interface EdlRoom {
  name: string;
  elements: EdlElement[];
  expanded: boolean;
}

export interface EdlFormData {
  type: EdlType;
  date: string;
  rooms: Omit<EdlRoom, 'expanded'>[];
  signature_landlord: string | null;
  signature_tenant: string | null;
}

interface EdlFormProps {
  property: Property;
  tenant: Tenant;
  landlordName: string;
  existingData?: EdlFormData;
  edlId?: string;
}

// ── Constantes ─────────────────────────────────────────────────────

const SUGGESTED_ROOMS = [
  'Salon',
  'Chambre 1',
  'Chambre 2',
  'Cuisine',
  'Salle de bain',
  'WC',
  'Entrée',
  'Cave',
  'Couloir',
];

const SUGGESTED_ELEMENTS = [
  'Murs',
  'Sol',
  'Plafond',
  'Fenêtres',
  'Volets',
  'Radiateur',
  'Prises électriques',
  'Interrupteurs',
  'Portes',
  'Placards',
];

const STATE_OPTIONS: { value: ElementState; label: string; color: string }[] = [
  { value: 'neuf', label: '🟢 Neuf', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'bon', label: '🔵 Bon', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'use', label: '🟡 Usé', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { value: 'mauvais', label: '🔴 Mauvais', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'na', label: '⚪ Non applicable', color: 'bg-stone-50 text-stone-500 border-stone-200' },
];

const stateColor = (s: ElementState) =>
  STATE_OPTIONS.find((o) => o.value === s)?.color ?? '';

// ── Composant ──────────────────────────────────────────────────────

export default function EdlForm({
  property,
  tenant,
  landlordName,
  existingData,
  edlId,
}: EdlFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const [type, setType] = useState<EdlType>(existingData?.type ?? 'entrance');
  const [date, setDate] = useState(existingData?.date ?? today);
  const [rooms, setRooms] = useState<EdlRoom[]>(
    existingData?.rooms.map((r) => ({ ...r, expanded: false })) ?? [],
  );
  const [signatureLandlord, setSignatureLandlord] = useState<string | null>(
    existingData?.signature_landlord ?? null,
  );
  const [signatureTenant, setSignatureTenant] = useState<string | null>(
    existingData?.signature_tenant ?? null,
  );

  // ── Room management ────────────────────────────────────────────

  const addRoom = (name: string) => {
    if (rooms.some((r) => r.name === name)) {
      toast.error(`La pièce "${name}" existe déjà`);
      return;
    }
    setRooms((prev) => [...prev, { name, elements: [], expanded: true }]);
  };

  const removeRoom = (index: number) => {
    setRooms((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleRoom = (index: number) => {
    setRooms((prev) =>
      prev.map((r, i) => (i === index ? { ...r, expanded: !r.expanded } : r)),
    );
  };

  // ── Element management ─────────────────────────────────────────

  const addElement = (roomIndex: number, name: string) => {
    setRooms((prev) =>
      prev.map((r, i) =>
        i === roomIndex
          ? {
              ...r,
              elements: [...r.elements, { name, state: 'bon', observations: '' }],
            }
          : r,
      ),
    );
  };

  const removeElement = (roomIndex: number, elementIndex: number) => {
    setRooms((prev) =>
      prev.map((r, i) =>
        i === roomIndex
          ? { ...r, elements: r.elements.filter((_, j) => j !== elementIndex) }
          : r,
      ),
    );
  };

  const updateElement = (
    roomIndex: number,
    elementIndex: number,
    field: keyof EdlElement,
    value: string,
  ) => {
    setRooms((prev) =>
      prev.map((r, i) =>
        i === roomIndex
          ? {
              ...r,
              elements: r.elements.map((el, j) =>
                j === elementIndex ? { ...el, [field]: value } : el,
              ),
            }
          : r,
      ),
    );
  };

  // ── Build form data ────────────────────────────────────────────

  const buildFormData = useCallback((): EdlFormData => ({
    type,
    date,
    rooms: rooms.map(({ name, elements }) => ({ name, elements })),
    signature_landlord: signatureLandlord,
    signature_tenant: signatureTenant,
  }), [type, date, rooms, signatureLandlord, signatureTenant]);

  // ── Save draft ─────────────────────────────────────────────────

  const handleSave = async () => {
    if (rooms.length === 0) {
      toast.error('Ajoutez au moins une pièce');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/edl', {
        method: edlId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: edlId,
          property_id: property.id,
          tenant_id: tenant.id,
          type,
          data: buildFormData(),
          signature_landlord: signatureLandlord,
          signature_tenant: signatureTenant,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur lors de la sauvegarde');
      }

      const result = await res.json();
      toast.success('État des lieux sauvegardé');

      if (!edlId && result.id) {
        router.replace(`/edl/${result.id}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  // ── Generate PDF ───────────────────────────────────────────────

  const handleGeneratePdf = async () => {
    if (rooms.length === 0) {
      toast.error('Ajoutez au moins une pièce');
      return;
    }

    setGenerating(true);
    try {
      // Import dynamique pour éviter le chargement inutile de jsPDF
      const { generateEdlPdf, getEdlPdfFilename } = await import(
        '@/lib/pdf/generate-edl'
      );

      const data = buildFormData();
      const doc = generateEdlPdf(data, property, tenant, landlordName);
      const filename = getEdlPdfFilename(data.type, tenant);
      doc.save(filename);
      toast.success('PDF généré');
    } catch (err) {
      toast.error('Erreur lors de la génération du PDF');
      void err;
    } finally {
      setGenerating(false);
    }
  };

  // ── Pièces non encore ajoutées (pour suggestions) ──────────────

  const addedRoomNames = new Set(rooms.map((r) => r.name));
  const availableRooms = SUGGESTED_ROOMS.filter((r) => !addedRoomNames.has(r));

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Informations générales</h2>

        {/* Toggle Entrée / Sortie */}
        <div className="mb-4">
          <p className="text-xs text-stone-500 mb-2">Type d&apos;état des lieux</p>
          <div className="inline-flex rounded-xl border border-stone-200 overflow-hidden">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                type === 'entrance'
                  ? 'bg-terracotta text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              }`}
              onClick={() => setType('entrance')}
            >
              Entrée
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                type === 'exit'
                  ? 'bg-terracotta text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              }`}
              onClick={() => setType('exit')}
            >
              Sortie
            </button>
          </div>
        </div>

        {/* Infos auto-remplies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-stone-500 mb-1 flex items-center gap-1">
              <Home className="h-3 w-3" /> Bien
            </p>
            <p className="text-sm font-medium text-slate-900">
              {property.address}, {property.city}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-1 flex items-center gap-1">
              <User className="h-3 w-3" /> Propriétaire
            </p>
            <p className="text-sm font-medium text-slate-900">{landlordName}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-1 flex items-center gap-1">
              <User className="h-3 w-3" /> Locataire
            </p>
            <p className="text-sm font-medium text-slate-900">
              {tenant.first_name} {tenant.last_name}
            </p>
          </div>
        </div>

        <div className="mt-4 max-w-xs">
          <Input
            label="Date de l'état des lieux"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </Card>

      {/* Pièces */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Pièces</h2>
        </div>

        {/* Suggestions rapides */}
        {availableRooms.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-stone-500 mb-2">Ajouter une pièce</p>
            <div className="flex flex-wrap gap-2">
              {availableRooms.map((room) => (
                <button
                  key={room}
                  type="button"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 hover:bg-terracotta/10 hover:text-terracotta transition-colors"
                  onClick={() => addRoom(room)}
                >
                  <Plus className="h-3 w-3" />
                  {room}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Liste des pièces (accordéons) */}
        <div className="space-y-3">
          {rooms.map((room, roomIdx) => (
            <div
              key={roomIdx}
              className="border border-stone-200 rounded-xl overflow-hidden"
            >
              {/* Header de la pièce */}
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
                onClick={() => toggleRoom(roomIdx)}
              >
                <div className="flex items-center gap-2">
                  {room.expanded ? (
                    <ChevronDown className="h-4 w-4 text-stone-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-stone-400" />
                  )}
                  <span className="text-sm font-semibold text-slate-900">
                    {room.name}
                  </span>
                  <span className="text-xs text-stone-400">
                    ({room.elements.length} élément{room.elements.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <button
                  type="button"
                  className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRoom(roomIdx);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </button>

              {/* Contenu de la pièce */}
              {room.expanded && (
                <div className="px-4 py-4 space-y-4">
                  {/* Éléments existants */}
                  {room.elements.map((el, elIdx) => (
                    <div
                      key={elIdx}
                      className={`p-3 rounded-xl border ${stateColor(el.state)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{el.name}</p>
                            <button
                              type="button"
                              className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                              onClick={() => removeElement(roomIdx, elIdx)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {STATE_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                  el.state === opt.value
                                    ? `${opt.color} ring-2 ring-offset-1 ring-current`
                                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                                }`}
                                onClick={() =>
                                  updateElement(roomIdx, elIdx, 'state', opt.value)
                                }
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>

                          <textarea
                            className="w-full text-xs text-slate-700 bg-white/60 border border-stone-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                            rows={2}
                            placeholder="Observations (optionnel)"
                            value={el.observations}
                            onChange={(e) =>
                              updateElement(
                                roomIdx,
                                elIdx,
                                'observations',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Suggestions d'éléments */}
                  <div>
                    <p className="text-xs text-stone-500 mb-2">
                      + Ajouter un élément
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_ELEMENTS.filter(
                        (name) => !room.elements.some((el) => el.name === name),
                      ).map((name) => (
                        <button
                          key={name}
                          type="button"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-stone-200 text-stone-600 hover:border-terracotta hover:text-terracotta transition-colors"
                          onClick={() => addElement(roomIdx, name)}
                        >
                          <Plus className="h-3 w-3" />
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {rooms.length === 0 && (
          <p className="text-sm text-stone-500 text-center py-8">
            Aucune pièce ajoutée. Cliquez sur une suggestion ci-dessus pour commencer.
          </p>
        )}
      </Card>

      {/* Signatures */}
      <Card>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Signatures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SignaturePad
            label="Signature du propriétaire"
            value={signatureLandlord}
            onChange={setSignatureLandlord}
          />
          <SignaturePad
            label="Signature du locataire"
            value={signatureTenant}
            onChange={setSignatureTenant}
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="secondary"
          icon={<Save className="h-4 w-4" />}
          onClick={handleSave}
          loading={saving}
        >
          Sauvegarder le brouillon
        </Button>
        <Button
          variant="primary"
          icon={<FileText className="h-4 w-4" />}
          onClick={handleGeneratePdf}
          loading={generating}
        >
          Générer le PDF
        </Button>
      </div>
    </div>
  );
}
