// Helpers utilitaires Loovia
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Formatage des montants en euros
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Formatage d'une date au format français
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy', { locale: fr });
}

// Formatage d'une date longue
export function formatDateLong(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMMM yyyy', { locale: fr });
}

// Formatage relatif (il y a X jours)
export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: fr });
}

// Formatage du mois et de l'année
export function formatMonthYear(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMMM yyyy', { locale: fr });
}

// Nom complet d'un locataire
export function fullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

// Initiales
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Taux d'occupation
export function calculateOccupancyRate(
  occupiedCount: number,
  totalCount: number
): number {
  if (totalCount === 0) return 0;
  return Math.round((occupiedCount / totalCount) * 100);
}

// Classnames conditionnels (utilitaire léger)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Tronquer un texte
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

// Générer un slug à partir d'un texte
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
