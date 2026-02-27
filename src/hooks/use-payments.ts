'use client';

// Hook pour la gestion des paiements
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Payment, PaymentInsert, PaymentUpdate } from '@/types';

export function usePayments(leaseId?: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('payments')
      .select('*, lease:leases(*, property:properties(*), tenant:tenants(*))')
      .order('period_start', { ascending: false });

    if (leaseId) {
      query = query.eq('lease_id', leaseId);
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      setPayments(data as Payment[]);
    }
    setLoading(false);
  }, [supabase, leaseId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const createPayment = async (payment: PaymentInsert) => {
    const { data, error: err } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (err) throw new Error(err.message);
    setPayments((prev) => [data as Payment, ...prev]);
    return data as Payment;
  };

  const updatePayment = async (id: string, updates: PaymentUpdate) => {
    const { data, error: err } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (err) throw new Error(err.message);
    setPayments((prev) => prev.map((p) => (p.id === id ? (data as Payment) : p)));
    return data as Payment;
  };

  return {
    payments,
    loading,
    error,
    refetch: fetchPayments,
    createPayment,
    updatePayment,
  };
}

// Hook pour les paiements en retard (alertes dashboard)
export function useLatePayments() {
  const [latePayments, setLatePayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('payments')
        .select('*, lease:leases(*, property:properties(*), tenant:tenants(*))')
        .eq('status', 'late')
        .order('period_start', { ascending: false });

      setLatePayments((data as Payment[]) || []);
      setLoading(false);
    }
    fetch();
  }, [supabase]);

  return { latePayments, loading };
}
