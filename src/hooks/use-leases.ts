'use client';

// Hook pour la gestion des baux
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Lease, LeaseInsert, LeaseUpdate } from '@/types';

export function useLeases() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchLeases = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('leases')
      .select('*, property:properties(*), tenant:tenants(*)')
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setLeases(data as Lease[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchLeases();
  }, [fetchLeases]);

  const createLease = async (lease: LeaseInsert) => {
    const { data, error: err } = await supabase
      .from('leases')
      .insert(lease)
      .select('*, property:properties(*), tenant:tenants(*)')
      .single();

    if (err) throw new Error(err.message);
    setLeases((prev) => [data as Lease, ...prev]);
    return data as Lease;
  };

  const updateLease = async (id: string, updates: LeaseUpdate) => {
    const { data, error: err } = await supabase
      .from('leases')
      .update(updates)
      .eq('id', id)
      .select('*, property:properties(*), tenant:tenants(*)')
      .single();

    if (err) throw new Error(err.message);
    setLeases((prev) => prev.map((l) => (l.id === id ? (data as Lease) : l)));
    return data as Lease;
  };

  const deleteLease = async (id: string) => {
    const { error: err } = await supabase.from('leases').delete().eq('id', id);
    if (err) throw new Error(err.message);
    setLeases((prev) => prev.filter((l) => l.id !== id));
  };

  return {
    leases,
    loading,
    error,
    refetch: fetchLeases,
    createLease,
    updateLease,
    deleteLease,
  };
}
