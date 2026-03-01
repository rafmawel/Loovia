// API Route — actions sur les transactions bancaires
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Valider une transaction comme loyer
async function validateAsRent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  transactionId: string,
  paymentId: string,
  userId: string,
) {
  // Récupérer la transaction
  const { data: tx } = await supabase
    .from('bank_transactions')
    .select('*')
    .eq('id', transactionId)
    .eq('user_id', userId)
    .single();

  if (!tx) throw new Error('Transaction non trouvée');

  // Mettre à jour la transaction
  await supabase
    .from('bank_transactions')
    .update({
      status: 'matched',
      matched_payment_id: paymentId,
      category: 'Loyer',
    })
    .eq('id', transactionId);

  // Mettre à jour le paiement
  await supabase
    .from('payments')
    .update({
      status: 'paid',
      amount_paid: Math.abs(tx.amount),
      payment_date: tx.date,
    })
    .eq('id', paymentId);

  return { success: true };
}

// Catégoriser une ou plusieurs transactions
async function categorize(
  supabase: Awaited<ReturnType<typeof createClient>>,
  transactionIds: string[],
  category: string,
  userId: string,
) {
  const { error } = await supabase
    .from('bank_transactions')
    .update({ category, status: 'categorized' })
    .in('id', transactionIds)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return { success: true, count: transactionIds.length };
}

// Ignorer une suggestion
async function ignoreSuggestion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  transactionId: string,
  userId: string,
) {
  await supabase
    .from('bank_transactions')
    .update({ status: 'unmatched', matched_payment_id: null })
    .eq('id', transactionId)
    .eq('user_id', userId);

  return { success: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    switch (action) {
      case 'validate': {
        const { transactionId, paymentId } = body;
        if (!transactionId || !paymentId) {
          return NextResponse.json({ error: 'transactionId et paymentId requis' }, { status: 400 });
        }
        const result = await validateAsRent(supabase, transactionId, paymentId, user.id);
        return NextResponse.json(result);
      }

      case 'categorize': {
        const { transactionIds, category } = body;
        if (!transactionIds?.length || !category) {
          return NextResponse.json({ error: 'transactionIds et category requis' }, { status: 400 });
        }
        const result = await categorize(supabase, transactionIds, category, user.id);
        return NextResponse.json(result);
      }

      case 'ignore': {
        const { transactionId } = body;
        if (!transactionId) {
          return NextResponse.json({ error: 'transactionId requis' }, { status: 400 });
        }
        const result = await ignoreSuggestion(supabase, transactionId, user.id);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: `Action "${action}" inconnue` }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Erreur lors du traitement de la transaction' }, { status: 500 });
  }
}
