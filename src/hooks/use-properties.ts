'use client';

// Hook pour la gestion des biens immobiliers
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Property, PropertyInsert, PropertyUpdate } from '@/types';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setProperties(data as Property[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const createProperty = async (property: PropertyInsert) => {
    const { data, error: err } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single();

    if (err) throw new Error(err.message);
    setProperties((prev) => [data as Property, ...prev]);
    return data as Property;
  };

  const updateProperty = async (id: string, updates: PropertyUpdate) => {
    const { data, error: err } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (err) throw new Error(err.message);
    setProperties((prev) => prev.map((p) => (p.id === id ? (data as Property) : p)));
    return data as Property;
  };

  const deleteProperty = async (id: string) => {
    const { error: err } = await supabase.from('properties').delete().eq('id', id);
    if (err) throw new Error(err.message);
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    properties,
    loading,
    error,
    refetch: fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
  };
}

// Hook pour un bien spécifique
export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (err) {
        setError(err.message);
      } else {
        setProperty(data as Property);
      }
      setLoading(false);
    }
    fetch();
  }, [id, supabase]);

  return { property, loading, error };
}
