import type { CSSProperties } from 'react'
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner'

import { cn } from '@/lib/utils'

/**
 * Mapeia as CSS vars do sonner para os tokens do design system (src/styles.css).
 *
 * Cada cor é derivada por `color-mix` na direção de `--popover` /
 * `--popover-foreground`, que já trocam no `.dark`. Assim fundo, borda e texto se
 * adaptam ao tema automaticamente — sem depender de `next-themes` (o dark mode
 * aqui é opt-in via classe `.dark`, não pelo tema interno do sonner).
 *
 * Vai no `style` inline do Toaster porque estilo inline vence a especificidade do
 * CSS que o sonner injeta em runtime ([data-sonner-toaster][data-sonner-theme]).
 * As custom properties são herdadas pelos toasts filhos.
 */
const tokenStyle = {
  '--normal-bg': 'var(--popover)',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'var(--border)',

  // Escala neutra do sonner. O close button do toast neutro a usa
  // (`color: var(--gray12)`, `border: var(--gray4)`, hover `--gray2`/`--gray5`).
  // Sem isso, o X herda a escala do tema interno do sonner (light por padrão) e
  // some sobre o nosso `--popover` escuro no dark mode. Apontando para os tokens,
  // o botão fica visível e troca de cor com o `.dark`.
  '--gray2': 'var(--accent)',
  '--gray4': 'var(--border)',
  '--gray5': 'var(--border)',
  '--gray12': 'var(--popover-foreground)',

  // Fundo tonal leve + texto que escurece/clareia conforme o popover-foreground.
  // Misturamos em `oklab` (e não `oklch`) de propósito: oklab interpola em
  // coordenadas retangulares, sem girar o matiz. Em `oklch`, misturar uma cor
  // saturada com o popover quase neutro empurra o hue para ~0° (vermelho),
  // tingindo o success de rosa e o info de roxo. Em oklab o matiz é preservado.
  '--success-bg': 'color-mix(in oklab, var(--success) 14%, var(--popover))',
  '--success-border': 'color-mix(in oklab, var(--success) 30%, var(--border))',
  '--success-text': 'color-mix(in oklab, var(--success) 58%, var(--popover-foreground))',

  '--error-bg': 'color-mix(in oklab, var(--destructive) 14%, var(--popover))',
  '--error-border': 'color-mix(in oklab, var(--destructive) 30%, var(--border))',
  '--error-text':
    'color-mix(in oklab, var(--destructive) 62%, var(--popover-foreground))',

  '--warning-bg': 'color-mix(in oklab, var(--warning) 14%, var(--popover))',
  '--warning-border': 'color-mix(in oklab, var(--warning) 30%, var(--border))',
  '--warning-text': 'color-mix(in oklab, var(--warning) 58%, var(--popover-foreground))',

  '--info-bg': 'color-mix(in oklab, var(--info) 14%, var(--popover))',
  '--info-border': 'color-mix(in oklab, var(--info) 30%, var(--border))',
  '--info-text': 'color-mix(in oklab, var(--info) 58%, var(--popover-foreground))',
} as CSSProperties

/**
 * Container das notificações. Renderize uma vez na raiz da aplicação; os toasts
 * são disparados em qualquer lugar pela função `toast`.
 *
 * Defaults: `richColors` (cores semânticas por tipo) e posição inferior direita.
 * Tudo é sobrescrevível — inclusive `richColors`, `position`, `closeButton`,
 * `expand`, `duration`, etc. — pois os props do consumidor têm precedência.
 */
function Toaster({ className, style, ...props }: ToasterProps) {
  return (
    <SonnerToaster
      richColors
      position="bottom-right"
      className={cn('toaster group', className)}
      style={{ ...tokenStyle, ...style }}
      {...props}
    />
  )
}

export { toast } from 'sonner'
export { Toaster, type ToasterProps }
