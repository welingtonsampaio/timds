import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina classes condicionais (clsx) e resolve conflitos de utilitários
 * do Tailwind (tailwind-merge). Base usada por todos os componentes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
