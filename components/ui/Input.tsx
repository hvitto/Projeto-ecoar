'use client'

import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  const inputClasses = `input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40' : ''} ${className}`

  return (
    <div className="w-full">
      {label && (
        <label className="label text-ecoar-dark-700 dark:text-ecoar-light-900 mb-2">
          {label}
        </label>
      )}
      <input
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-ecoar-dark-600 dark:text-ecoar-light-900/70">{helperText}</p>
      )}
    </div>
  )
}

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
}

export function NumberInput({
  label,
  error,
  helperText,
  className = '',
  ...props
}: NumberInputProps) {
  const inputClasses = `input-number ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40' : ''} ${className}`

  return (
    <div className="w-full">
      {label && (
        <label className="label text-ecoar-dark-700 dark:text-ecoar-light-900 mb-2">
          {label}
        </label>
      )}
      <input
        type="number"
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-ecoar-dark-600 dark:text-ecoar-light-900/70">{helperText}</p>
      )}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  ...props
}: TextareaProps) {
  const textareaClasses = `input-field min-h-[100px] resize-y ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40' : ''} ${className}`

  return (
    <div className="w-full">
      {label && (
        <label className="label text-ecoar-dark-700 dark:text-ecoar-light-900 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={textareaClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-ecoar-dark-600 dark:text-ecoar-light-900/70">{helperText}</p>
      )}
    </div>
  )
}

