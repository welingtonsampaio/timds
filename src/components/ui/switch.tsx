import { cva, type VariantProps } from 'class-variance-authority'
import { Switch as SwitchPrimitive } from 'radix-ui'
import type * as React from 'react'

import { disabledControl, focusRing } from '@/lib/styles'
import { cn } from '@/lib/utils'

const switchVariants = cva(
  [
    // Padding uniforme de 2px (p-0.5) define o inset do thumb em todos os lados.
    'peer group/switch inline-flex shrink-0 items-center overflow-hidden rounded-full p-0.5 align-middle shadow-xs transition-colors outline-none',
    focusRing,
    disabledControl,
  ],
  {
    variants: {
      // Esquema cromático do trilho (cor quando ligado / desligado).
      variant: {
        default:
          'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
        green_red:
          'data-[state=checked]:bg-success data-[state=unchecked]:bg-destructive',
        success:
          'data-[state=checked]:bg-success data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
        destructive:
          'data-[state=checked]:bg-destructive data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
      },
      // Altura do trilho por tamanho (= thumb + 2x o padding de 2px).
      size: {
        sm: 'h-4',
        default: 'h-5',
        lg: 'h-6',
      },
      // Com texto, o trilho tem largura automática (estável: ver switch-text).
      withText: {
        true: 'w-auto gap-0.5',
        false: '',
      },
    },
    compoundVariants: [
      // Sem texto: largura = 2x o thumb + padding, p/ o deslize encostar exato.
      { withText: false, size: 'sm', class: 'w-7' },
      { withText: false, size: 'default', class: 'w-9' },
      { withText: false, size: 'lg', class: 'w-11' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      withText: false,
    },
  },
)

const thumbVariants = cva(
  'pointer-events-none block shrink-0 rounded-full bg-background shadow-sm ring-0 transition-transform dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground',
  {
    variants: {
      size: {
        sm: 'size-3',
        default: 'size-4',
        lg: 'size-5',
      },
      withText: {
        // Com texto, o thumb troca de lado via `order` (sem deslize por translate).
        true: 'data-[state=checked]:order-2 data-[state=unchecked]:order-1',
        // Sem texto: área interna = 2x o thumb, então translate-x-full encosta exato.
        false:
          'data-[state=checked]:translate-x-full data-[state=unchecked]:translate-x-0',
      },
    },
    defaultVariants: { size: 'default', withText: false },
  },
)

// Tamanho do texto interno por size do switch — discreto, só um detalhe.
const textSizeClass: Record<NonNullable<SwitchProps['size']>, string> = {
  sm: 'text-[8px]',
  default: 'text-[9px]',
  lg: 'text-[10px]',
}

// Cor do texto exibido quando ligado (sobre o trilho no estado checked).
const onTextColor: Record<NonNullable<SwitchProps['variant']>, string> = {
  default: 'text-primary-foreground',
  green_red: 'text-success-foreground',
  success: 'text-success-foreground',
  destructive: 'text-destructive-foreground',
}

// Cor do texto exibido quando desligado (sobre o trilho no estado unchecked).
// Sobre fundos claros usamos um tom suave; no green_red o fundo é o vermelho.
const offTextColor: Record<NonNullable<SwitchProps['variant']>, string> = {
  default: 'text-foreground/70',
  green_red: 'text-destructive-foreground',
  success: 'text-foreground/70',
  destructive: 'text-foreground/70',
}

export interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitive.Root>,
    Omit<VariantProps<typeof switchVariants>, 'withText'> {
  /**
   * Rótulos opcionais exibidos dentro do trilho. Quando presentes, o switch
   * vira um toggle com texto: o rótulo aparece do lado oposto ao thumb,
   * alternando conforme o estado. São decorativos (`aria-hidden`) — forneça
   * um `aria-label`/`<Label>` para a acessibilidade.
   */
  texts?: { on: React.ReactNode; off: React.ReactNode }
}

function Switch({
  className,
  variant = 'default',
  size = 'default',
  texts,
  ...props
}: SwitchProps) {
  const withText = Boolean(texts)
  // Normaliza para indexar os mapas e o cva (VariantProps permite null).
  const v = variant ?? 'default'
  const s = size ?? 'default'

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-variant={v}
      data-size={s}
      className={cn(switchVariants({ variant: v, size: s, withText }), className)}
      {...props}
    >
      {withText && (
        // Os dois rótulos são empilhados na MESMA célula do grid: ambos sempre
        // ocupam espaço, então a largura é a do maior e não muda ao alternar
        // (evita o "pulo" de largura). Só a opacidade troca (cross-fade).
        // O bloco vai para o lado oposto ao thumb via `order`.
        <span
          aria-hidden="true"
          data-slot="switch-text"
          className={cn(
            'grid place-items-center px-0.5 leading-none font-medium whitespace-nowrap select-none group-data-[state=checked]/switch:order-1 group-data-[state=unchecked]/switch:order-2',
            textSizeClass[s],
          )}
        >
          <span
            className={cn(
              'col-start-1 row-start-1 transition-opacity group-data-[state=unchecked]/switch:opacity-0',
              onTextColor[v],
            )}
          >
            {texts?.on}
          </span>
          <span
            className={cn(
              'col-start-1 row-start-1 transition-opacity group-data-[state=checked]/switch:opacity-0',
              offTextColor[v],
            )}
          >
            {texts?.off}
          </span>
        </span>
      )}
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(thumbVariants({ size: s, withText }))}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch, switchVariants }
