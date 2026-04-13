'use client';

import React from 'react';

// --- Types pour le composant Input ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Libellé affiché au-dessus du champ */
  label?: string;
  /** Message d'erreur affiché sous le champ (en rouge) */
  error?: string;
  /** Texte d'aide affiché sous le champ (en gris) */
  helperText?: string;
}

/**
 * Champ de saisie — Design "Premium Minimaliste Naturel"
 *
 * Coins arrondis, bordure discrète, focus terracotta.
 * Supporte un label, un message d'erreur et un texte d'aide.
 * Compatible avec react-hook-form via forwardRef.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = '', onChange, ...rest }, ref) => {
    // Génération d'un id stable si non fourni (pour le lien label/input)
    const inputId = id ?? React.useId();

    // Pour les champs date, bloquer les années > 4 chiffres
    const handleChange = rest.type === 'date'
      ? (e: React.ChangeEvent<HTMLInputElement>) => {
          const year = e.target.value.split('-')[0];
          if (year && year.length > 4) return;
          onChange?.(e);
        }
      : onChange;

    return (
      <div className="flex flex-col gap-1.5">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        {/* Champ de saisie */}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          className={[
            // Style de base
            'rounded-xl border bg-bg-card px-4 py-2.5 text-sm text-text-primary',
            'placeholder:text-text-muted',
            'transition-all duration-200',
            // Focus — anneau terracotta
            'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent',
            // État d'erreur
            error
              ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
              : 'border-border-light',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-elevated',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          onChange={handleChange}
          {...(rest.type === 'date' && !rest.max ? { max: '9999-12-31' } : {})}
          {...rest}
        />

        {/* Message d'erreur */}
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}

        {/* Texte d'aide (masqué si une erreur est affichée) */}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
