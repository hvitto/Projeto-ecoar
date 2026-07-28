'use client'

import { InputHTMLAttributes, TextareaHTMLAttributes, useId } from 'react'

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
  id,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`
  const describedBy = [
    error ? errorId : null,
    helperText && !error ? helperId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined
  const inputClasses = `input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40' : ''} ${className}`

  return (
    <div className="w-full min-w-0">
      {label && (
        <label
          htmlFor={inputId}
          className="label text-ecoar-dark-700 dark:text-ecoar-light-900 mb-2 block"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={inputClasses}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300 break-words">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-ecoar-dark-600 dark:text-ecoar-light-900/70 break-words">
          {helperText}
        </p>
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
  id,
  ...props
}: NumberInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`
  const describedBy = [
    error ? errorId : null,
    helperText && !error ? helperId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined
  const inputClasses = `input-number ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40' : ''} ${className}`

  return (
    <div className="w-full min-w-0">
      {label && (
        <label
          htmlFor={inputId}
          className="label text-ecoar-dark-700 dark:text-ecoar-light-900 mb-2 block"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="number"
        className={inputClasses}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300 break-words">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-ecoar-dark-600 dark:text-ecoar-light-900/70 break-words">
          {helperText}
        </p>
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
  id,
  ...props
}: TextareaProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`
  const describedBy = [
    error ? errorId : null,
    helperText && !error ? helperId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined
  const textareaClasses = `input-field min-h-[100px] resize-y ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40' : ''} ${className}`

  return (
    <div className="w-full min-w-0">
      {label && (
        <label
          htmlFor={inputId}
          className="label text-ecoar-dark-700 dark:text-ecoar-light-900 mb-2 block"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={textareaClasses}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300 break-words">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-ecoar-dark-600 dark:text-ecoar-light-900/70 break-words">
          {helperText}
        </p>
      )}
    </div>
  )
}
