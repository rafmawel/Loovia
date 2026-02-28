// Export CSV — Transactions comptables (UTF-8 avec BOM pour Excel)
import type { BankTransaction } from '@/types';
import { formatDate } from '@/lib/utils';

export function exportTransactionsCsv(
  transactions: BankTransaction[],
  dateFrom: string,
  dateTo: string,
): void {
  // En-têtes
  const headers = ['Date', 'Libellé', 'Catégorie', 'Montant (€)', 'Type'];

  // Filtrer par période
  const filtered = transactions.filter((tx) => {
    return tx.date >= dateFrom && tx.date <= dateTo;
  });

  // Lignes de données
  const rows = filtered.map((tx) => [
    formatDate(tx.date),
    `"${(tx.description || '').replace(/"/g, '""')}"`,
    tx.category || 'Autre',
    tx.amount.toFixed(2).replace('.', ','),
    tx.amount >= 0 ? 'Entrée' : 'Sortie',
  ]);

  // Assemblage CSV avec BOM UTF-8
  const BOM = '\uFEFF';
  const csv = BOM + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');

  // Téléchargement
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Export_Loovia_${dateFrom}_${dateTo}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
