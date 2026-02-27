'use client';

import React from 'react';

// --- Types pour le composant Select ---

interface SelectOption {
  /** Valeur envoyée au formulaire */
  value: string;
  /** Texte affiché dans la liste */
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** Liste des options disponibles */
  options: SelectOption[];
  /** Libellé affiché au-dessus du champ */
  label?: string;
  /** Message d'erreur affiché sous le champ (en rouge) */
  error?: string;
  /** Texte du placeholder (première option désactivée) */
  placeholder?: string;
  /** Texte d'aide affiché sous le champ (en gris) */
  helperText?: string;
}

/**
 * Sélecteur — Design "Premium Minimaliste Naturel"
 *
 * Même style que le composant Input pour assurer la cohérence visuelle.
 * Compatible avec react-hook-form via forwardRef.
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, label, error, placeholder, helperText, id, className = '', ...rest }, ref) => {
    // Génération d'un id stable si non fourni
    const selectId = id ?? React.useId();

    return (
      <div className="flex flex-col gap-1.5">
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-slate-900"
          >
            {label}
          </label>
        )}

        {/* Select natif avec apparence personnalisée */}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${selectId}-error`
                : helperText
                  ? `${selectId}-helper`
                  : undefined
            }
            className={[
              // Style de base — identique à Input
              'w-full appearance-none rounded-xl border bg-white px-4 py-2.5 pr-10 text-sm text-slate-900',
              'transition-all duration-200',
              // Focus — anneau terracotta
              'focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta',
              // État d'erreur
              error
                ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                : 'border-stone-200',
              // État désactivé
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-stone-50',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...rest}
          >
            {/* Option placeholder */}
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {/* Options */}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Flèche personnalisée */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-4 w-4 text-stone-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <p id={`${selectId}-error`} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}

        {/* Texte d'aide (masqué si une erreur est affichée) */}
        {!error && helperText && (
          <p id={`${selectId}-helper`} className="text-xs text-stone-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
