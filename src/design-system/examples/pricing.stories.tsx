import type { Meta, StoryObj } from '@storybook/react-vite'
import { Check, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

/**
 * **Pricing** — uma página de marketing. Mostra como `Card` + `Badge` + `Button`
 * compõem um comparativo de planos, com um destaque visual no plano recomendado
 * (borda e anel na cor da marca) e um seletor de período em `Tabs` que recalcula
 * os preços.
 */
const meta = {
  title: 'Examples/Pricing',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A pricing section: three `Card` tiers, a recommended tier highlighted ' +
          'with a brand ring and a `Badge`, feature lists with success-colored ' +
          'check icons, and a monthly/yearly `Tabs` toggle that recomputes prices.',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

type Plan = {
  name: string
  description: string
  monthly: number
  features: string[]
  cta: string
  variant: 'outline' | 'default'
  featured?: boolean
}

const plans: Plan[] = [
  {
    name: 'Starter',
    description: 'Para projetos pessoais e protótipos.',
    monthly: 0,
    features: [
      '1 projeto',
      '5 mil eventos/mês',
      'Dashboards básicos',
      'Suporte por e-mail',
    ],
    cta: 'Começar grátis',
    variant: 'outline',
  },
  {
    name: 'Pro',
    description: 'Para times em crescimento.',
    monthly: 29,
    features: [
      'Projetos ilimitados',
      '1 milhão de eventos/mês',
      'Dashboards avançados',
      'Integrações e webhooks',
      'Suporte prioritário',
    ],
    cta: 'Assinar Pro',
    variant: 'default',
    featured: true,
  },
  {
    name: 'Enterprise',
    description: 'Para organizações com escala.',
    monthly: 99,
    features: [
      'Tudo do Pro',
      'SSO e SAML',
      'Limites personalizados',
      'SLA dedicado',
      'Gerente de conta',
    ],
    cta: 'Falar com vendas',
    variant: 'outline',
  },
]

function PricingTable() {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const yearly = period === 'yearly'

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 py-6">
      <header className="flex flex-col items-center gap-4 text-center">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="size-3.5" aria-hidden="true" /> Preços simples
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">
          Escolha o plano ideal para você
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Comece de graça e evolua conforme cresce. Sem surpresas, cancele quando quiser.
        </p>
        <ToggleGroup
          type="single"
          variant="outline"
          value={period}
          onValueChange={(v) => v && setPeriod(v as 'monthly' | 'yearly')}
          aria-label="Período de cobrança"
        >
          <ToggleGroupItem value="monthly">Mensal</ToggleGroupItem>
          <ToggleGroupItem value="yearly">
            Anual
            <Badge variant="success" className="ml-2">
              -20%
            </Badge>
          </ToggleGroupItem>
        </ToggleGroup>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const price = yearly ? Math.round(plan.monthly * 12 * 0.8) : plan.monthly
          const suffix = plan.monthly === 0 ? '' : yearly ? '/ano' : '/mês'
          return (
            <Card
              key={plan.name}
              className={
                plan.featured
                  ? 'relative border-primary shadow-lg ring-1 ring-primary'
                  : undefined
              }
            >
              {plan.featured ? (
                <Badge className="-top-3 absolute right-6">Mais popular</Badge>
              ) : null}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">R$ {price}</span>
                  {suffix ? (
                    <span className="text-sm text-muted-foreground">{suffix}</span>
                  ) : null}
                </div>
                <Separator />
                <ul className="flex flex-col gap-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check
                        className="size-4 shrink-0 text-success-text"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant={plan.variant} className="w-full">
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => <PricingTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // No mensal o Pro custa R$ 29; trocar para anual aplica o desconto (12×0,8).
    await expect(canvas.getByText('R$ 29')).toBeInTheDocument()
    await userEvent.click(canvas.getByText('Anual'))
    await expect(canvas.getByText('R$ 278')).toBeInTheDocument()
  },
}
