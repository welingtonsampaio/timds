import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines conditional classes (clsx) and resolves Tailwind utility
 * conflicts (tailwind-merge). Base used by all components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
