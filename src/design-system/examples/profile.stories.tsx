import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  CalendarDays,
  GitCommitHorizontal,
  MapPin,
  MessageSquare,
  Settings,
  Star,
  UserPlus,
} from 'lucide-react'
import { expect, within } from 'storybook/test'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * **Profile** — uma página de identidade. Combina `Avatar`, `Badge`, `Card` e um
 * `ItemGroup` para o feed de atividades, organizados por `Tabs`. Demonstra como
 * uma faixa de capa e um cabeçalho sobreposto se montam só com tokens e radius.
 */
const meta = {
  title: 'Examples/Profile',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A profile page: a gradient cover, an overlapping `Avatar`, identity ' +
          'metadata with `Badge`s, a stats row and a tabbed body whose activity ' +
          'feed is an `ItemGroup`.',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const stats = [
  { label: 'Projetos', value: '24' },
  { label: 'Seguidores', value: '1,2 mil' },
  { label: 'Seguindo', value: '318' },
  { label: 'Estrelas', value: '4,9' },
]

const activity = [
  {
    icon: GitCommitHorizontal,
    title: 'Publicou 12 commits em timds/design-system',
    when: 'há 2 horas',
  },
  {
    icon: Star,
    title: 'Marcou recharts/recharts com estrela',
    when: 'há 5 horas',
  },
  {
    icon: MessageSquare,
    title: 'Comentou na issue #128 — Tokens de contraste',
    when: 'ontem',
  },
  {
    icon: UserPlus,
    title: 'Começou a seguir Bruno Lima',
    when: 'há 2 dias',
  },
]

export const Default: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl">
      <Card className="overflow-hidden p-0">
        {/* Capa */}
        <div className="h-32 bg-gradient-to-r from-primary via-chart-3 to-chart-2" />

        <CardContent className="flex flex-col gap-6 pb-6">
          {/* Cabeçalho sobreposto à capa */}
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar className="size-24 ring-4 ring-card">
                <AvatarImage src="https://i.pravatar.cc/150?img=47" alt="Ana Souza" />
                <AvatarFallback className="text-2xl">AS</AvatarFallback>
              </Avatar>
              <div className="mb-1 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-xl">Ana Souza</h1>
                  <Badge variant="info">Pro</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Design Engineer · @anasouza
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" aria-label="Configurações">
                <Settings className="size-4" aria-hidden="true" />
              </Button>
              <Button>
                <UserPlus className="size-4" aria-hidden="true" /> Seguir
              </Button>
            </div>
          </div>

          <p className="max-w-prose text-sm">
            Construindo design systems acessíveis e bem documentados. Apaixonada por
            tokens, tipografia e bons defaults.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" /> São Paulo, BR
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" /> Entrou em mar 2023
            </span>
          </div>

          <Separator />

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="font-semibold text-2xl">{stat.value}</span>
                <span className="text-muted-foreground text-sm">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Corpo em abas */}
          <Tabs defaultValue="activity">
            <TabsList variant="line">
              <TabsTrigger value="activity">Atividade</TabsTrigger>
              <TabsTrigger value="about">Sobre</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="pt-2">
              <div className="flex flex-col divide-y divide-border">
                {activity.map((entry) => (
                  <Item key={entry.title}>
                    <ItemMedia variant="icon">
                      <entry.icon className="size-4" aria-hidden="true" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{entry.title}</ItemTitle>
                      <ItemDescription>{entry.when}</ItemDescription>
                    </ItemContent>
                  </Item>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="about" className="pt-2">
              <p className="text-sm text-muted-foreground">
                Engenheira de design focada em sistemas reutilizáveis, acessibilidade e
                experiência de desenvolvimento. Mantenedora do timds.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { name: 'Ana Souza' })).toBeInTheDocument()
    // A aba de atividade é a padrão e lista o feed.
    await expect(canvas.getByText(/Publicou 12 commits/)).toBeInTheDocument()
  },
}
