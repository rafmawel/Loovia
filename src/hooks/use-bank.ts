'use client';

// Hook pour la gestion des connexions bancaires et transactions
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { BankConnection, BankTransaction } from '@/types';

export function useBankConnections() {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('bank_connections')
        .select('*')
        .order('created_at', { ascending: false });

      setConnections((data as BankConnection[]) || []);
      setLoading(false);
    }
    fetch();
  }, [supabase]);

  return { connections, loading };
}

export function useBankTransactions(connectionId?: string) {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('bank_transactions')
      .select('*')
      .order('date', { ascending: false });

    if (connectionId) {
      query = query.eq('connection_id', connectionId);
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      setTransactions(data as BankTransaction[]);
    }
    setLoading(false);
  }, [supabase, connectionId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const updateTransaction = async (id: string, updates: Partial<BankTransaction>) => {
    const { data, error: err } = await supabase
      .from('bank_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (err) throw new Error(err.message);
    setTransactions((prev) => prev.map((t) => (t.id === id ? (data as BankTransaction) : t)));
    return data as BankTransaction;
  };

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    updateTransaction,
  };
}
