import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { Tabs as TabsPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

/** Posição do trilho de abas em relação ao conteúdo. */
type TabPlacement = 'top' | 'bottom' | 'start' | 'end'

function Tabs({
  className,
  tabPlacement = 'top',
  orientation,
  ...props
}: Omit<React.ComponentProps<typeof TabsPrimitive.Root>, 'orientation'> & {
  tabPlacement?: TabPlacement
  orientation?: 'horizontal' | 'vertical'
}) {
  // `start`/`end` dispõem as abas ao lado do conteúdo (orientação vertical).
  const resolvedOrientation =
    orientation ??
    (tabPlacement === 'start' || tabPlacement === 'end' ? 'vertical' : 'horizontal')

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={resolvedOrientation}
      data-placement={tabPlacement}
      orientation={resolvedOrientation}
      className={cn(
        'group/tabs flex gap-2 data-[placement=bottom]:flex-col-reverse data-[placement=end]:flex-row-reverse data-[placement=start]:flex-row data-[placement=top]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  // Base comum: o trilho da lista de abas.
  'group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-[orientation=vertical]/tabs:flex-col',
  {
    variants: {
      variant: {
        // Segmented control padrão (fundo "muted", item ativo elevado).
        default: 'gap-1 rounded-lg bg-muted p-1',
        // Abas em linha com indicador inferior.
        line: 'gap-1 rounded-none bg-transparent',
        // Pílula: trilho branco arredondado com sombra e item ativo em destaque.
        // Na vertical usa um raio fixo para não virar um círculo.
        pill: 'gap-1 rounded-full border border-border bg-card p-1.5 shadow-sm group-data-[orientation=vertical]/tabs:rounded-3xl',
        // Card: abas no formato de pasta, conectadas ao conteúdo por uma linha.
        card: 'gap-1 rounded-none border-border bg-transparent group-data-[orientation=horizontal]/tabs:border-b group-data-[orientation=vertical]/tabs:border-r',
      },
      // O tamanho só define o atributo `data-size`; o espaçamento vertical e a
      // tipografia são aplicados nos gatilhos via `group-data`.
      size: {
        sm: '',
        default: '',
        lg: '',
      },
      // Centraliza o trilho ocupando toda a largura disponível.
      centered: {
        true: 'w-full justify-center',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      centered: false,
    },
  },
)

function TabsList({
  className,
  variant = 'default',
  size = 'default',
  centered = false,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-size={size}
      data-centered={centered}
      className={cn(tabsListVariants({ variant, size, centered }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  children,
  closable = false,
  closeIcon,
  onClose,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  /** Exibe um botão de fechar (x) na aba. */
  closable?: boolean
  /** Ícone personalizado do botão de fechar. */
  closeIcon?: React.ReactNode
  /** Disparado ao fechar a aba (clique no x ou Delete/Backspace). */
  onClose?: (event: React.SyntheticEvent) => void
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      onKeyDown={(event) => {
        onKeyDown?.(event)
        // Padrão WAI-ARIA: a aba focada é fechada com Delete/Backspace.
        if (closable && (event.key === 'Delete' || event.key === 'Backspace')) {
          event.preventDefault()
          onClose?.(event)
        }
      }}
      className={cn(
        // Base comum a todas as variantes.
        "relative inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap font-medium text-foreground/60 transition-all group-data-[centered=true]/tabs-list:flex-none group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Tamanho: padding vertical e tipografia.
        'group-data-[size=sm]/tabs-list:py-1 group-data-[size=sm]/tabs-list:text-xs group-data-[size=default]/tabs-list:py-1.5 group-data-[size=default]/tabs-list:text-sm group-data-[size=lg]/tabs-list:py-2.5 group-data-[size=lg]/tabs-list:text-base',
        // Variante default: cápsula interna com leve elevação no item ativo.
        'group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:px-3 group-data-[variant=default]/tabs-list:data-[state=active]:bg-background group-data-[variant=default]/tabs-list:data-[state=active]:text-foreground group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm dark:group-data-[variant=default]/tabs-list:data-[state=active]:bg-input/30 dark:group-data-[variant=default]/tabs-list:data-[state=active]:text-foreground',
        // Variante pill: padding horizontal generoso e item ativo na cor primária.
        'group-data-[variant=pill]/tabs-list:rounded-full group-data-[variant=pill]/tabs-list:px-6 group-data-[variant=pill]/tabs-list:data-[state=active]:bg-primary group-data-[variant=pill]/tabs-list:data-[state=active]:text-primary-foreground group-data-[variant=pill]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=pill]/tabs-list:data-[state=active]:hover:text-primary-foreground',
        // Variante card: aba em formato de pasta conectada ao conteúdo.
        'group-data-[variant=card]/tabs-list:rounded-t-md group-data-[variant=card]/tabs-list:border group-data-[variant=card]/tabs-list:border-border group-data-[variant=card]/tabs-list:bg-muted/40 group-data-[variant=card]/tabs-list:px-4 group-data-[variant=card]/tabs-list:data-[state=active]:bg-background group-data-[variant=card]/tabs-list:data-[state=active]:text-primary group-data-[orientation=horizontal]/tabs:group-data-[variant=card]/tabs-list:mb-[-1px] group-data-[orientation=horizontal]/tabs:group-data-[variant=card]/tabs-list:data-[state=active]:border-b-background group-data-[orientation=vertical]/tabs:group-data-[variant=card]/tabs-list:mr-[-1px] group-data-[orientation=vertical]/tabs:group-data-[variant=card]/tabs-list:rounded-tr-none group-data-[orientation=vertical]/tabs:group-data-[variant=card]/tabs-list:rounded-l-md group-data-[orientation=vertical]/tabs:group-data-[variant=card]/tabs-list:data-[state=active]:border-r-background',
        // Variante line: aba transparente com sublinhado animado no item ativo.
        'group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:px-2 group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:text-foreground after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100',
        className,
      )}
      {...props}
    >
      {children}
      {closable && (
        // X decorativo (aria-hidden, sem role): acionado pelo mouse. Não usamos
        // um elemento interativo aqui para não aninhar controles dentro do
        // <button> do Trigger (violação `nested-interactive`). O acesso por
        // teclado é feito na própria aba via Delete/Backspace (ver onKeyDown).
        <span
          aria-hidden="true"
          data-slot="tabs-trigger-close"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            onClose?.(event)
          }}
          className="ml-1 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm opacity-60 transition-opacity hover:bg-foreground/10 hover:opacity-100 [&_svg]:size-3.5"
        >
          {closeIcon ?? <X />}
        </span>
      )}
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants }
