'use client';

// Hook pour la gestion des locataires
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tenant, TenantInsert, TenantUpdate } from '@/types';

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setTenants(data as Tenant[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const createTenant = async (tenant: TenantInsert) => {
    const { data, error: err } = await supabase
      .from('tenants')
      .insert(tenant)
      .select()
      .single();

    if (err) throw new Error(err.message);
    setTenants((prev) => [data as Tenant, ...prev]);
    return data as Tenant;
  };

  const updateTenant = async (id: string, updates: TenantUpdate) => {
    const { data, error: err } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (err) throw new Error(err.message);
    setTenants((prev) => prev.map((t) => (t.id === id ? (data as Tenant) : t)));
    return data as Tenant;
  };

  const deleteTenant = async (id: string) => {
    const { error: err } = await supabase.from('tenants').delete().eq('id', id);
    if (err) throw new Error(err.message);
    setTenants((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    tenants,
    loading,
    error,
    refetch: fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
  };
}
